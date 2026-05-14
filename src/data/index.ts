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
  FrameworkHierarchy,
  FrameworkRegistryEntry,
} from './schemas';

export { isoEvidenceTemplates, getEvidenceTemplate } from './evidence-templates';
export { frameworkRegistry, getFrameworkByName } from './framework-registry';

export {
  iso27001Controls,
  iso27001AnnexA,
  iso27001ManagementClauses,
  getIsoControl,
} from './frameworks/iso27001';

export { nistCsf2, nistCsf2Subcategories } from './frameworks/nist-csf-2';
export { soc2, soc2Criteria } from './frameworks/soc2';
export { cisV8, cisV8Safeguards, cisV8Ig1, cisV8Ig2, cisV8Ig3 } from './frameworks/cis-v8';
