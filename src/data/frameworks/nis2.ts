// NIS 2 Directive — 10 Article 21 security measures (flat, a-j).
import { frameworkHierarchySchema, type FrameworkHierarchy } from '../schemas';
import rawHier from '../_raw/NIS2_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const nis2: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;
export const nis2Measures = Object.freeze(parsed.groups);
