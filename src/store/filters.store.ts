// Filters Zustand slice. Each framework view tracks its own filter set
// (ISO category, control type, security domain, status, NIST function).
// Search query lives here too so the URL/header bar and the view share state.

import { create } from 'zustand';
import type { IsoCategory, ControlType, SecurityDomain } from '../data/schemas';
import type { Status } from '../domain/scoring';

export interface IsoFilterSet {
  readonly categories: readonly IsoCategory[];
  readonly controlTypes: readonly ControlType[];
  readonly securityDomains: readonly SecurityDomain[];
  readonly statuses: readonly Status[];
  readonly nistFunctions: readonly string[];
}

export interface FiltersState {
  readonly query: string;
  readonly iso: IsoFilterSet;
}

const EMPTY_ISO: IsoFilterSet = Object.freeze({
  categories: Object.freeze([]),
  controlTypes: Object.freeze([]),
  securityDomains: Object.freeze([]),
  statuses: Object.freeze([]),
  nistFunctions: Object.freeze([]),
});

const DEFAULTS: FiltersState = {
  query: '',
  iso: EMPTY_ISO,
};

export interface FiltersActions {
  setQuery(q: string): void;
  toggleIsoCategory(cat: IsoCategory): void;
  toggleIsoControlType(ct: ControlType): void;
  toggleIsoSecurityDomain(sd: SecurityDomain): void;
  toggleIsoStatus(s: Status): void;
  toggleIsoNistFunction(fn: string): void;
  clearAll(): void;
  hasAnyActiveFilter(): boolean;
}

export type FiltersStore = FiltersState & FiltersActions;

function toggleInList<T extends string>(list: readonly T[], value: T): readonly T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  ...DEFAULTS,

  setQuery(q) {
    set({ query: q });
  },

  toggleIsoCategory(cat) {
    set((s) => ({ iso: { ...s.iso, categories: Object.freeze(toggleInList(s.iso.categories, cat)) } }));
  },
  toggleIsoControlType(ct) {
    set((s) => ({ iso: { ...s.iso, controlTypes: Object.freeze(toggleInList(s.iso.controlTypes, ct)) } }));
  },
  toggleIsoSecurityDomain(sd) {
    set((s) => ({
      iso: { ...s.iso, securityDomains: Object.freeze(toggleInList(s.iso.securityDomains, sd)) },
    }));
  },
  toggleIsoStatus(st) {
    set((s) => ({ iso: { ...s.iso, statuses: Object.freeze(toggleInList(s.iso.statuses, st)) } }));
  },
  toggleIsoNistFunction(fn) {
    set((s) => ({
      iso: { ...s.iso, nistFunctions: Object.freeze(toggleInList(s.iso.nistFunctions, fn)) },
    }));
  },

  clearAll() {
    set({ query: '', iso: EMPTY_ISO });
  },

  hasAnyActiveFilter() {
    const { query, iso } = get();
    if (query.trim().length > 0) return true;
    return (
      iso.categories.length > 0 ||
      iso.controlTypes.length > 0 ||
      iso.securityDomains.length > 0 ||
      iso.statuses.length > 0 ||
      iso.nistFunctions.length > 0
    );
  },
}));
