// ISO/IEC 27017:2015 — cloud-service security. 14 sections in the legacy
// data with 9 sub-items spread across them.
import { frameworkHierarchySchema, type FrameworkHierarchy, type FrameworkItem } from '../schemas';
import rawHier from '../_raw/ISO27017_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const iso27017: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;
export const iso27017Sections = Object.freeze(parsed.groups);
export const iso27017Subsections: readonly FrameworkItem[] = Object.freeze(
  parsed.groups.flatMap((g) => g.items ?? []),
);
