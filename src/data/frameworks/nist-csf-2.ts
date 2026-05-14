// NIST CSF 2.0 — 6 Functions, 22 Categories, 106 Subcategories.
import { frameworkHierarchySchema, type FrameworkHierarchy, type FrameworkItem } from '../schemas';
import rawHier from '../_raw/NIST_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const nistCsf2: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;

// Flatten all subcategory leaf items for direct lookup / counting.
export const nistCsf2Subcategories: readonly FrameworkItem[] = Object.freeze(
  parsed.groups.flatMap((g) => (g.sections ?? []).flatMap((s) => s.items)),
);
