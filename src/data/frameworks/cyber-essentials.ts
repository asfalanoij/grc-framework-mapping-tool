// Cyber Essentials v3.x — 5 control themes with 16 sub-requirements total.
import { frameworkHierarchySchema, type FrameworkHierarchy, type FrameworkItem } from '../schemas';
import rawHier from '../_raw/CE_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const cyberEssentials: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;
export const cyberEssentialsThemes = Object.freeze(parsed.groups);
export const cyberEssentialsRequirements: readonly FrameworkItem[] = Object.freeze(
  parsed.groups.flatMap((g) => g.items ?? []),
);
