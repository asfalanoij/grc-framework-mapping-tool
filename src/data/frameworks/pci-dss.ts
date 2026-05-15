// PCI DSS 4.0.1 — 12 Requirements (flat list, no sub-requirements in legacy data).
import { frameworkHierarchySchema, type FrameworkHierarchy } from '../schemas';
import rawHier from '../_raw/PCI_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const pciDss: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;
export const pciDssRequirements = Object.freeze(parsed.groups);
