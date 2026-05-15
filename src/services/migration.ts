// Idempotent localStorage → IndexedDB migration. Reads legacy v1 keys,
// remaps status enum values, writes to IDB, records a migration marker.
// Re-runs detect the marker and skip. Never deletes localStorage (the
// caller can clear it later if/when they're confident the migration
// stuck).

import type { Status } from '../domain/scoring';
import type { Persistence, EvidenceRow } from './persistence';
import { scoreRowId } from './persistence';
import { isOk } from '../domain/result';

export const MIGRATION_KEY = 'localStorageV1Migrated';
export const MIGRATION_VERSION = 1;

export const LEGACY_STATUS_MAP: Readonly<Record<string, Status>> = Object.freeze({
  unimplemented: 'not-started',
  'not-started': 'not-started',
  progress: 'in-progress',
  'in-progress': 'in-progress',
  implemented: 'implemented',
  not_applicable: 'na',
  na: 'na',
});

export interface MigrationSummary {
  readonly alreadyMigrated: boolean;
  readonly dryRun: boolean;
  readonly scoresImported: number;
  readonly evidenceImported: number;
  readonly justificationsImported: number;
  readonly themeImported: boolean;
  readonly tourFlagImported: boolean;
  readonly errors: readonly string[];
}

export interface MigrationOptions {
  // `null` means "explicitly no storage available" — used by callers
  // running outside a browser (or by tests). `undefined` (or omitted)
  // falls back to globalThis.localStorage.
  readonly storage?: Pick<Storage, 'getItem'> | null;
  readonly dryRun?: boolean;
}

const emptyResult: MigrationSummary = Object.freeze({
  alreadyMigrated: false,
  dryRun: false,
  scoresImported: 0,
  evidenceImported: 0,
  justificationsImported: 0,
  themeImported: false,
  tourFlagImported: false,
  errors: Object.freeze([]),
});

function safeParseObject<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v && typeof v === 'object' && !Array.isArray(v)) return v as T;
    return null;
  } catch {
    return null;
  }
}

export async function migrateLocalStorageToIdb(
  persistence: Persistence,
  options: MigrationOptions = {},
): Promise<MigrationSummary> {
  // null = explicit "no storage"; undefined = fall back to globalThis.localStorage.
  const storage = options.storage === null ? null : (options.storage ?? getDefaultStorage());
  const dryRun = options.dryRun ?? false;
  const errors: string[] = [];

  if (!storage) {
    return { ...emptyResult, errors: ['localstorage-unavailable'] };
  }

  // Skip if migration already ran (unless dry-run, which always reports).
  const marker = await persistence.migrationMeta.get<number>(MIGRATION_KEY);
  if (!dryRun && isOk(marker) && marker.value === MIGRATION_VERSION) {
    return { ...emptyResult, alreadyMigrated: true };
  }

  let scoresImported = 0;
  let evidenceImported = 0;
  let justificationsImported = 0;
  let themeImported = false;
  let tourFlagImported = false;

  // grc-scores: { framework: { itemId: legacyStatus } }
  const scoresRaw = storage.getItem('grc-scores');
  const scoresObj = safeParseObject<Record<string, Record<string, string>>>(scoresRaw);
  if (scoresObj) {
    // Legacy-flat: if first value is a string, the whole map is ISO 27001 scores.
    const firstKey = Object.keys(scoresObj)[0];
    const isFlat = firstKey !== undefined && typeof scoresObj[firstKey] === 'string';
    const nested = isFlat
      ? { 'ISO 27001': scoresObj as unknown as Record<string, string> }
      : scoresObj;

    for (const [framework, items] of Object.entries(nested)) {
      if (!items || typeof items !== 'object') continue;
      for (const [itemId, legacyStatus] of Object.entries(items)) {
        const mapped = LEGACY_STATUS_MAP[legacyStatus as string];
        if (!mapped) continue;
        if (!dryRun) {
          const r = await persistence.scores.setScore(framework, itemId, mapped);
          if (!isOk(r)) {
            errors.push(`score:${framework}:${itemId}:${r.error}`);
            continue;
          }
        }
        scoresImported += 1;
      }
    }
  }

  // grc-evidence: { framework: { itemId: { collected, refs, notes } } }
  const evidenceRaw = storage.getItem('grc-evidence');
  const evidenceObj =
    safeParseObject<
      Record<
        string,
        Record<
          string,
          { collected?: Record<string, true>; refs?: Record<string, string>; notes?: string }
        >
      >
    >(evidenceRaw);
  if (evidenceObj) {
    for (const [framework, byItem] of Object.entries(evidenceObj)) {
      if (!byItem || typeof byItem !== 'object') continue;
      for (const [itemId, row] of Object.entries(byItem)) {
        const evRow: EvidenceRow = {
          id: scoreRowId(framework, itemId),
          framework,
          itemId,
          collected: Object.freeze({ ...(row.collected ?? {}) }),
          refs: Object.freeze({ ...(row.refs ?? {}) }),
          notes: row.notes ?? '',
        };
        if (!dryRun) {
          const r = await persistence.evidence.upsert(evRow);
          if (!isOk(r)) {
            errors.push(`evidence:${framework}:${itemId}:${r.error}`);
            continue;
          }
        }
        evidenceImported += 1;
      }
    }
  }

  // grc-justifications: { controlId: text }
  const justRaw = storage.getItem('grc-justifications');
  const justObj = safeParseObject<Record<string, string>>(justRaw);
  if (justObj) {
    for (const [controlId, text] of Object.entries(justObj)) {
      if (typeof text !== 'string' || text.length === 0) continue;
      if (!dryRun) {
        const r = await persistence.justifications.set(controlId, text);
        if (!isOk(r)) {
          errors.push(`justification:${controlId}:${r.error}`);
          continue;
        }
      }
      justificationsImported += 1;
    }
  }

  // grc-theme: "light" | "dark"
  const theme = storage.getItem('grc-theme');
  if (theme === 'light' || theme === 'dark') {
    if (!dryRun) {
      const r = await persistence.uiPrefs.set('theme', theme);
      if (!isOk(r)) errors.push(`theme:${r.error}`);
    }
    themeImported = true;
  }

  // grc-v2: "1" (tour seen flag)
  const tour = storage.getItem('grc-v2');
  if (tour === '1') {
    if (!dryRun) {
      const r = await persistence.uiPrefs.set('tourSeen', true);
      if (!isOk(r)) errors.push(`tour:${r.error}`);
    }
    tourFlagImported = true;
  }

  // Record migration completion (unless dry-run).
  if (!dryRun) {
    const r = await persistence.migrationMeta.set(MIGRATION_KEY, MIGRATION_VERSION);
    if (!isOk(r)) errors.push(`migration-marker:${r.error}`);
  }

  return {
    alreadyMigrated: false,
    dryRun,
    scoresImported,
    evidenceImported,
    justificationsImported,
    themeImported,
    tourFlagImported,
    errors: Object.freeze(errors),
  };
}

function getDefaultStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}
