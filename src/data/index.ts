// Barrel export for the data layer. Importing this triggers zod parsing
// on every dataset — if any framework's data is malformed, the app
// fails fast at boot (intentional per Phase 1 spec §9).
export type {
  IsoControl,
  IsoCategory,
  ControlType,
  SecurityDomain,
  IsoEvidenceMap,
  FrameworkItem,
  FrameworkSection,
  FrameworkGroup,
  FrameworkMeta,
  FrameworkAbout,
  FrameworkHierarchy,
  FrameworkRegistryEntry,
  CafOutcome,
  CafPrinciple,
  CafObjective,
  CafHierarchy,
} from './schemas';

export { isoEvidenceTemplates, getEvidenceTemplate } from './evidence-templates';
export { frameworkRegistry, getFrameworkByName } from './framework-registry';

// Primary spine
export {
  iso27001Controls,
  iso27001AnnexA,
  iso27001ManagementClauses,
  getIsoControl,
} from './frameworks/iso27001';

// Cross-mapped frameworks (10 total)
export { nistCsf2, nistCsf2Subcategories } from './frameworks/nist-csf-2';
export { soc2, soc2Criteria } from './frameworks/soc2';
export { cisV8, cisV8Safeguards, cisV8Ig1, cisV8Ig2, cisV8Ig3 } from './frameworks/cis-v8';
export { pciDss, pciDssRequirements } from './frameworks/pci-dss';
export { cyberEssentials, cyberEssentialsThemes, cyberEssentialsRequirements } from './frameworks/cyber-essentials';
export { nist80053, nist80053Families } from './frameworks/nist-800-53';
export { nis2, nis2Measures } from './frameworks/nis2';
export { iso22301, iso22301Clauses, iso22301Subclauses } from './frameworks/iso22301';
export { iso27017, iso27017Sections, iso27017Subsections } from './frameworks/iso27017';
export { ncscCaf, ncscCafObjectives, ncscCafPrinciples, ncscCafOutcomes } from './frameworks/ncsc-caf';
