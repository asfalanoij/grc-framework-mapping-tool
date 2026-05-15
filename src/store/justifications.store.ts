// SoA justifications Zustand slice — ISO 27001 Annex A only.

import { create } from 'zustand';
import type { Persistence } from '../services/persistence';
import { isOk } from '../domain/result';

export interface JustificationsState {
  byControl: Readonly<Record<string, string>>;
  lastError: string | null;
}

export interface JustificationsActions {
  hydrate(persistence: Persistence): Promise<void>;
  set(persistence: Persistence, controlId: string, text: string): Promise<void>;
  reset(): void;
}

export type JustificationsStore = JustificationsState & JustificationsActions;

export const useJustificationsStore = create<JustificationsStore>((set, get) => ({
  byControl: {},
  lastError: null,

  async hydrate(persistence) {
    const r = await persistence.justifications.getAll();
    if (isOk(r)) set({ byControl: r.value, lastError: null });
  },

  async set(persistence, controlId, text) {
    const prev = get().byControl;
    const optimistic =
      text.length === 0
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== controlId))
        : { ...prev, [controlId]: text };
    set({ byControl: Object.freeze(optimistic), lastError: null });
    const r = await persistence.justifications.set(controlId, text);
    if (!isOk(r)) set({ byControl: prev, lastError: r.error });
  },

  reset() {
    set({ byControl: {}, lastError: null });
  },
}));
