// Predicate composition + ISO-specific filters. Pure functions; no React.

import type {
  IsoControl,
  IsoCategory,
  ControlType,
  SecurityDomain,
} from '../data/schemas';
import type { ScoresByItem, Status } from './scoring';

export type Predicate<T> = (item: T) => boolean;

export const TRUE = (): true => true;

export function and<T>(...preds: readonly Predicate<T>[]): Predicate<T> {
  if (preds.length === 0) return TRUE;
  return (item) => preds.every((p) => p(item));
}

export function or<T>(...preds: readonly Predicate<T>[]): Predicate<T> {
  if (preds.length === 0) return TRUE;
  return (item) => preds.some((p) => p(item));
}

export function not<T>(pred: Predicate<T>): Predicate<T> {
  return (item) => !pred(item);
}

export function applyFilters<T>(
  items: readonly T[],
  filters: readonly Predicate<T>[],
): readonly T[] {
  if (filters.length === 0) return items;
  const combined = and(...filters);
  return items.filter(combined);
}

// ── ISO-specific predicates ─────────────────────────────────────

export function byIsoCategory(categories: readonly IsoCategory[]): Predicate<IsoControl> {
  if (categories.length === 0) return TRUE;
  const set = new Set<IsoCategory>(categories);
  return (c) => set.has(c.cat);
}

export function byControlType(types: readonly ControlType[]): Predicate<IsoControl> {
  if (types.length === 0) return TRUE;
  const set = new Set<string>(types);
  return (c) => (c.ct ? set.has(c.ct) : false);
}

export function bySecurityDomain(
  domains: readonly SecurityDomain[],
): Predicate<IsoControl> {
  if (domains.length === 0) return TRUE;
  const set = new Set<SecurityDomain>(domains);
  return (c) => (c.sd ? set.has(c.sd) : false);
}

export function byNistFunction(funcs: readonly string[]): Predicate<IsoControl> {
  if (funcs.length === 0) return TRUE;
  const set = new Set<string>(funcs.map((f) => f.toUpperCase()));
  return (c) => set.has(c.nistFunc.toUpperCase());
}

// ── Status filter — applies to anything with an id ──────────────

export function byStatus(
  statuses: readonly Status[],
  scores: ScoresByItem,
): Predicate<{ readonly id: string }> {
  if (statuses.length === 0) return TRUE;
  const set = new Set<Status>(statuses);
  return (item) => set.has(scores[item.id] ?? 'not-started');
}
