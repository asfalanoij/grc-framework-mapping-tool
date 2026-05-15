// ISO 22301:2019 — business-continuity management. 7 top-level clause groups
// (some with sub-items, totalling 5 sub-items across the hierarchy).
import { frameworkHierarchySchema, type FrameworkHierarchy, type FrameworkItem } from '../schemas';
import rawHier from '../_raw/ISO22301_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const iso22301: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;
export const iso22301Clauses = Object.freeze(parsed.groups);
export const iso22301Subclauses: readonly FrameworkItem[] = Object.freeze(
  parsed.groups.flatMap((g) => g.items ?? []),
);
