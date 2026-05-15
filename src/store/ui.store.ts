// UI preferences (theme, last-active framework, tour state) Zustand slice.

import { create } from 'zustand';
import type { Persistence } from '../services/persistence';
import { isOk } from '../domain/result';

export type Theme = 'light' | 'dark';

export interface UiState {
  theme: Theme;
  activeFramework: string;
  tourSeen: boolean;
  lastError: string | null;
}

export interface UiActions {
  hydrate(persistence: Persistence): Promise<void>;
  setTheme(persistence: Persistence, theme: Theme): Promise<void>;
  setActiveFramework(persistence: Persistence, framework: string): Promise<void>;
  markTourSeen(persistence: Persistence): Promise<void>;
}

export type UiStore = UiState & UiActions;

const DEFAULTS: UiState = {
  theme: 'dark',
  activeFramework: 'ISO 27001',
  tourSeen: false,
  lastError: null,
};

export const useUiStore = create<UiStore>((set, get) => ({
  ...DEFAULTS,

  async hydrate(persistence) {
    const [theme, active, tour] = await Promise.all([
      persistence.uiPrefs.get<Theme>('theme'),
      persistence.uiPrefs.get<string>('activeFramework'),
      persistence.uiPrefs.get<boolean>('tourSeen'),
    ]);
    set({
      theme: isOk(theme) && theme.value ? theme.value : DEFAULTS.theme,
      activeFramework: isOk(active) && active.value ? active.value : DEFAULTS.activeFramework,
      tourSeen: isOk(tour) ? tour.value === true : DEFAULTS.tourSeen,
      lastError: null,
    });
  },

  async setTheme(persistence, theme) {
    const prev = get().theme;
    set({ theme, lastError: null });
    const r = await persistence.uiPrefs.set('theme', theme);
    if (!isOk(r)) set({ theme: prev, lastError: r.error });
  },

  async setActiveFramework(persistence, framework) {
    const prev = get().activeFramework;
    set({ activeFramework: framework, lastError: null });
    const r = await persistence.uiPrefs.set('activeFramework', framework);
    if (!isOk(r)) set({ activeFramework: prev, lastError: r.error });
  },

  async markTourSeen(persistence) {
    set({ tourSeen: true });
    const r = await persistence.uiPrefs.set('tourSeen', true);
    if (!isOk(r)) set({ tourSeen: false, lastError: r.error });
  },
}));
