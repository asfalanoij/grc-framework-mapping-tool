// SOC 2 Trust Services Criteria — 61 criteria across CC1–CC9, A1, P1 (PI1).
import { frameworkHierarchySchema, type FrameworkHierarchy, type FrameworkItem } from '../schemas';
import rawHier from '../_raw/SOC2_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const soc2: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;

export const soc2Criteria: readonly FrameworkItem[] = Object.freeze(
  parsed.groups.flatMap((g) => (g.sections ?? []).flatMap((s) => s.items)),
);
