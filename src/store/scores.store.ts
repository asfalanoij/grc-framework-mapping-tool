// Scores Zustand slice. Optimistic updates with rollback on IDB failure.
// Per-framework score maps; total source of truth is the in-memory store,
// the repo is for persistence + restart hydration.

import { create } from 'zustand';
import type { Status, ScoresByItem } from '../domain/scoring';
import type { Persistence } from '../services/persistence';
import { isOk } from '../domain/result';

export interface ScoresState {
  byFramework: Readonly<Record<string, ScoresByItem>>;
  lastError: string | null;
}

export interface ScoresActions {
  hydrate(persistence: Persistence, frameworks: readonly string[]): Promise<void>;
  setScore(persistence: Persistence, framework: string, itemId: string, status: Status): Promise<void>;
  reset(): void;
}

export type ScoresStore = ScoresState & ScoresActions;

export const useScoresStore = create<ScoresStore>((set, get) => ({
  byFramework: {},
  lastError: null,

  async hydrate(persistence, frameworks) {
    const byFramework: Record<string, ScoresByItem> = {};
    for (const fw of frameworks) {
      const r = await persistence.scores.getAll(fw);
      if (isOk(r)) byFramework[fw] = r.value;
    }
    set({ byFramework: Object.freeze(byFramework), lastError: null });
  },

  async setScore(persistence, framework, itemId, status) {
    const prev = get().byFramework;
    const optimistic: Record<string, ScoresByItem> = {
      ...prev,
      [framework]: Object.freeze({ ...(prev[framework] ?? {}), [itemId]: status }),
    };
    set({ byFramework: Object.freeze(optimistic), lastError: null });
    const r = await persistence.scores.setScore(framework, itemId, status);
    if (!isOk(r)) {
      // Rollback to previous map; record the error for UI toast.
      set({ byFramework: prev, lastError: r.error });
    }
  },

  reset() {
    set({ byFramework: {}, lastError: null });
  },
}));
