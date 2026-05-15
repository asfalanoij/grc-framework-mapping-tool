// Evidence Zustand slice. Per-framework, per-item evidence rows with
// optimistic-update + rollback semantics matching scores/justifications/ui.

import { create } from 'zustand';
import type { EvidenceRow, Persistence } from '../services/persistence';
import { scoreRowId } from '../services/persistence';
import { isOk } from '../domain/result';

export interface EvidenceState {
  // Keyed by `${framework}::${itemId}` for stable lookup.
  byKey: Readonly<Record<string, EvidenceRow>>;
  lastError: string | null;
}

export interface EvidenceActions {
  hydrate(persistence: Persistence, frameworks: readonly string[]): Promise<void>;
  toggleCheck(persistence: Persistence, framework: string, itemId: string, typeName: string, checked: boolean): Promise<void>;
  setRef(persistence: Persistence, framework: string, itemId: string, typeName: string, ref: string): Promise<void>;
  setNotes(persistence: Persistence, framework: string, itemId: string, notes: string): Promise<void>;
  reset(): void;
}

export type EvidenceStore = EvidenceState & EvidenceActions;

function emptyRow(framework: string, itemId: string): EvidenceRow {
  return {
    id: scoreRowId(framework, itemId),
    framework,
    itemId,
    collected: Object.freeze({}),
    refs: Object.freeze({}),
    notes: '',
  };
}

function withCollected(row: EvidenceRow, typeName: string, checked: boolean): EvidenceRow {
  const next: Record<string, true> = { ...row.collected };
  if (checked) next[typeName] = true;
  else delete next[typeName];
  return { ...row, collected: Object.freeze(next) };
}

function withRef(row: EvidenceRow, typeName: string, ref: string): EvidenceRow {
  const next: Record<string, string> = { ...row.refs };
  if (ref) next[typeName] = ref;
  else delete next[typeName];
  return { ...row, refs: Object.freeze(next) };
}

export const useEvidenceStore = create<EvidenceStore>((set, get) => ({
  byKey: {},
  lastError: null,

  async hydrate(persistence, frameworks) {
    const next: Record<string, EvidenceRow> = {};
    for (const fw of frameworks) {
      const r = await persistence.evidence.getForFramework(fw);
      if (isOk(r)) {
        for (const row of r.value) next[row.id] = row;
      }
    }
    set({ byKey: Object.freeze(next), lastError: null });
  },

  async toggleCheck(persistence, framework, itemId, typeName, checked) {
    const key = scoreRowId(framework, itemId);
    const prev = get().byKey;
    const current = prev[key] ?? emptyRow(framework, itemId);
    const optimistic = withCollected(current, typeName, checked);
    set({ byKey: Object.freeze({ ...prev, [key]: optimistic }), lastError: null });
    const r = await persistence.evidence.upsert(optimistic);
    if (!isOk(r)) set({ byKey: prev, lastError: r.error });
  },

  async setRef(persistence, framework, itemId, typeName, ref) {
    const key = scoreRowId(framework, itemId);
    const prev = get().byKey;
    const current = prev[key] ?? emptyRow(framework, itemId);
    const optimistic = withRef(current, typeName, ref);
    set({ byKey: Object.freeze({ ...prev, [key]: optimistic }), lastError: null });
    const r = await persistence.evidence.upsert(optimistic);
    if (!isOk(r)) set({ byKey: prev, lastError: r.error });
  },

  async setNotes(persistence, framework, itemId, notes) {
    const key = scoreRowId(framework, itemId);
    const prev = get().byKey;
    const current = prev[key] ?? emptyRow(framework, itemId);
    const optimistic: EvidenceRow = { ...current, notes };
    set({ byKey: Object.freeze({ ...prev, [key]: optimistic }), lastError: null });
    const r = await persistence.evidence.upsert(optimistic);
    if (!isOk(r)) set({ byKey: prev, lastError: r.error });
  },

  reset() {
    set({ byKey: {}, lastError: null });
  },
}));

export function selectEvidenceFor(
  state: EvidenceState,
  framework: string,
  itemId: string,
): EvidenceRow {
  const key = scoreRowId(framework, itemId);
  return state.byKey[key] ?? emptyRow(framework, itemId);
}
