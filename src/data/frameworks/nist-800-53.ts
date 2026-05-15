// NIST SP 800-53 Rev 5 — 20 control families (flat).
import { frameworkHierarchySchema, type FrameworkHierarchy } from '../schemas';
import rawHier from '../_raw/N80053_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const nist80053: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;
export const nist80053Families = Object.freeze(parsed.groups);
