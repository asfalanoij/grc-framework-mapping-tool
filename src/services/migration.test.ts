import { describe, it, expect, beforeEach } from 'vitest';
import { createPersistence, type Persistence } from './persistence';
import {
  migrateLocalStorageToIdb,
  LEGACY_STATUS_MAP,
  MIGRATION_KEY,
  MIGRATION_VERSION,
} from './migration';

// Tiny in-memory storage that satisfies Pick<Storage, 'getItem'>.
function fakeStorage(data: Record<string, string>): Pick<Storage, 'getItem'> {
  return { getItem: (k: string) => (k in data ? data[k]! : null) };
}

let p: Persistence;
let dbCounter = 0;
beforeEach(async () => {
  dbCounter += 1;
  p = createPersistence(`grc-suite-migration-${dbCounter}`);
});

describe('LEGACY_STATUS_MAP', () => {
  it('covers every legacy status string', () => {
    expect(LEGACY_STATUS_MAP['unimplemented']).toBe('not-started');
    expect(LEGACY_STATUS_MAP['progress']).toBe('in-progress');
    expect(LEGACY_STATUS_MAP['implemented']).toBe('implemented');
    expect(LEGACY_STATUS_MAP['not_applicable']).toBe('na');
  });
  it('also accepts already-modern status strings (idempotency)', () => {
    expect(LEGACY_STATUS_MAP['not-started']).toBe('not-started');
    expect(LEGACY_STATUS_MAP['in-progress']).toBe('in-progress');
    expect(LEGACY_STATUS_MAP['na']).toBe('na');
  });
});

describe('migrateLocalStorageToIdb', () => {
  it('reports localstorage-unavailable when storage is explicitly null', async () => {
    const r = await migrateLocalStorageToIdb(p, { storage: null });
    expect(r.errors).toContain('localstorage-unavailable');
  });

  it('handles an empty localStorage cleanly', async () => {
    const r = await migrateLocalStorageToIdb(p, { storage: fakeStorage({}) });
    expect(r.scoresImported).toBe(0);
    expect(r.evidenceImported).toBe(0);
    expect(r.justificationsImported).toBe(0);
    expect(r.themeImported).toBe(false);
    expect(r.tourFlagImported).toBe(false);
    expect(r.errors).toEqual([]);
  });

  it('migrates nested scores with status remapping', async () => {
    const storage = fakeStorage({
      'grc-scores': JSON.stringify({
        'ISO 27001': { 'A.5.1': 'implemented', 'A.5.2': 'progress', 'A.5.3': 'unimplemented' },
        'NIST CSF 2.0': { 'GV.OC-01': 'not_applicable' },
      }),
    });
    const r = await migrateLocalStorageToIdb(p, { storage });
    expect(r.scoresImported).toBe(4);
    const iso = await p.scores.getAll('ISO 27001');
    if (iso.ok) {
      expect(iso.value['A.5.1']).toBe('implemented');
      expect(iso.value['A.5.2']).toBe('in-progress');
      expect(iso.value['A.5.3']).toBe('not-started');
    }
    const nist = await p.scores.getAll('NIST CSF 2.0');
    if (nist.ok) expect(nist.value['GV.OC-01']).toBe('na');
  });

  it('handles legacy-flat scores (no framework wrapper)', async () => {
    const storage = fakeStorage({
      'grc-scores': JSON.stringify({ 'A.5.1': 'implemented', 'A.5.2': 'unimplemented' }),
    });
    const r = await migrateLocalStorageToIdb(p, { storage });
    expect(r.scoresImported).toBe(2);
    const iso = await p.scores.getAll('ISO 27001');
    if (iso.ok) expect(Object.keys(iso.value).sort()).toEqual(['A.5.1', 'A.5.2']);
  });

  it('skips unknown status values', async () => {
    const storage = fakeStorage({
      'grc-scores': JSON.stringify({ 'ISO 27001': { 'A.5.1': 'banana' } }),
    });
    const r = await migrateLocalStorageToIdb(p, { storage });
    expect(r.scoresImported).toBe(0);
  });

  it('migrates evidence rows', async () => {
    const storage = fakeStorage({
      'grc-evidence': JSON.stringify({
        'ISO 27001': {
          'A.5.1': {
            collected: { 'Policy doc': true },
            refs: { 'Policy doc': 'link' },
            notes: 'n',
          },
        },
      }),
    });
    const r = await migrateLocalStorageToIdb(p, { storage });
    expect(r.evidenceImported).toBe(1);
    const ev = await p.evidence.getForFramework('ISO 27001');
    if (ev.ok) {
      expect(ev.value[0]?.notes).toBe('n');
      expect(ev.value[0]?.refs['Policy doc']).toBe('link');
    }
  });

  it('migrates justifications and drops empty strings', async () => {
    const storage = fakeStorage({
      'grc-justifications': JSON.stringify({ 'A.5.1': 'reason', 'A.5.2': '' }),
    });
    const r = await migrateLocalStorageToIdb(p, { storage });
    expect(r.justificationsImported).toBe(1);
    const j = await p.justifications.getAll();
    if (j.ok) {
      expect(j.value['A.5.1']).toBe('reason');
      expect(j.value['A.5.2']).toBeUndefined();
    }
  });

  it('migrates theme + tour flag', async () => {
    const storage = fakeStorage({ 'grc-theme': 'light', 'grc-v2': '1' });
    const r = await migrateLocalStorageToIdb(p, { storage });
    expect(r.themeImported).toBe(true);
    expect(r.tourFlagImported).toBe(true);
    const t = await p.uiPrefs.get<string>('theme');
    if (t.ok) expect(t.value).toBe('light');
  });

  it('is idempotent on re-run', async () => {
    const storage = fakeStorage({
      'grc-scores': JSON.stringify({ 'ISO 27001': { 'A.5.1': 'implemented' } }),
    });
    const first = await migrateLocalStorageToIdb(p, { storage });
    expect(first.alreadyMigrated).toBe(false);
    expect(first.scoresImported).toBe(1);
    const second = await migrateLocalStorageToIdb(p, { storage });
    expect(second.alreadyMigrated).toBe(true);
    expect(second.scoresImported).toBe(0);
  });

  it('dry-run reports counts but writes nothing', async () => {
    const storage = fakeStorage({
      'grc-scores': JSON.stringify({ 'ISO 27001': { 'A.5.1': 'implemented' } }),
    });
    const r = await migrateLocalStorageToIdb(p, { storage, dryRun: true });
    expect(r.dryRun).toBe(true);
    expect(r.scoresImported).toBe(1);
    const iso = await p.scores.getAll('ISO 27001');
    if (iso.ok) expect(iso.value['A.5.1']).toBeUndefined();
    const marker = await p.migrationMeta.get<number>(MIGRATION_KEY);
    if (marker.ok) expect(marker.value).toBeUndefined();
  });

  it('ignores malformed JSON', async () => {
    const storage = fakeStorage({ 'grc-scores': '{not json' });
    const r = await migrateLocalStorageToIdb(p, { storage });
    expect(r.scoresImported).toBe(0);
    expect(r.errors).toEqual([]);
  });

  it('records the migration marker on success', async () => {
    await migrateLocalStorageToIdb(p, { storage: fakeStorage({}) });
    const marker = await p.migrationMeta.get<number>(MIGRATION_KEY);
    if (marker.ok) expect(marker.value).toBe(MIGRATION_VERSION);
  });
});
