// Zod schemas for the framework-mapping atlas. Validated at module load.
// A schema failure throws immediately — bad data is a build-time error,
// never a silent audit gap.
import { z } from 'zod';

// ───────────────────────────────────────────────────────────────
// ISO 27001 — primary spine
// ───────────────────────────────────────────────────────────────
export const isoCategorySchema = z.enum([
  'Management System',
  'Organizational',
  'People',
  'Physical',
  'Technological',
]);
export type IsoCategory = z.infer<typeof isoCategorySchema>;

export const controlTypeSchema = z
  .string()
  .regex(/^(Preventive|Detective|Corrective)(,\s*(Preventive|Detective|Corrective))*$/);
export type ControlType = z.infer<typeof controlTypeSchema>;

export const securityDomainSchema = z.enum([
  'Governance and Ecosystem',
  'Protection',
  'Defence',
  'Resilience',
]);
export type SecurityDomain = z.infer<typeof securityDomainSchema>;

export const isoControlSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  isoDesc: z.string().min(1),
  cat: isoCategorySchema,
  ct: controlTypeSchema.optional(),
  sd: securityDomainSchema.optional(),
  nistFunc: z.string(),
  nistCat: z.string(),
  nistSub: z.string(),
  soc2: z.string(),
  cis: z.string(),
  pci: z.string(),
  ce: z.string(),
  n80053: z.string().optional(),
  nis2: z.string().optional(),
  iso22301: z.string().optional(),
  iso27017: z.string().optional(),
  caf: z.string().optional(),
  notes: z.string(),
});
export type IsoControl = z.infer<typeof isoControlSchema>;

export const isoControlsArraySchema = z.array(isoControlSchema);

export const isoEvidenceMapSchema = z.record(z.string(), z.array(z.string()));
export type IsoEvidenceMap = z.infer<typeof isoEvidenceMapSchema>;

// ───────────────────────────────────────────────────────────────
// Framework hierarchies (NIST CSF, SOC 2, CIS, etc.) share a shape
// ───────────────────────────────────────────────────────────────
export const frameworkItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  desc: z.string(),
  achieved: z.array(z.string()).optional().default([]),
  evidence: z.array(z.string()).optional().default([]),
  ig: z.string().optional(),
});
export type FrameworkItem = z.infer<typeof frameworkItemSchema>;

export const frameworkSectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  desc: z.string(),
  items: z.array(frameworkItemSchema),
});
export type FrameworkSection = z.infer<typeof frameworkSectionSchema>;

// Some hierarchies are 3-level (group → section → item), others 2-level
// (group → item directly). We model both with optional fields.
export const frameworkGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  desc: z.string(),
  sections: z.array(frameworkSectionSchema).optional(),
  items: z.array(frameworkItemSchema).optional(),
  achieved: z.array(z.string()).optional(),
  evidence: z.array(z.string()).optional(),
});
export type FrameworkGroup = z.infer<typeof frameworkGroupSchema>;

export const frameworkMetaSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  url: z.string().optional(),
  color: z.string().optional(),
});
export type FrameworkMeta = z.infer<typeof frameworkMetaSchema>;

// Legacy data stores `about` as either a plain string or an object
// with title/blurb (sometimes plus extra keys). Accept either shape.
export const frameworkAboutSchema = z
  .object({
    title: z.string(),
    blurb: z.string(),
  })
  .passthrough();
export type FrameworkAbout = z.infer<typeof frameworkAboutSchema>;

export const frameworkHierarchySchema = z.object({
  meta: frameworkMetaSchema,
  about: z.union([z.string(), frameworkAboutSchema]).optional(),
  groups: z.array(frameworkGroupSchema),
});
export type FrameworkHierarchy = z.infer<typeof frameworkHierarchySchema>;

// ───────────────────────────────────────────────────────────────
// FRAMEWORKS registry (cross-reference metadata)
// ───────────────────────────────────────────────────────────────
// `desc` on the registry is per-framework documentary content — some
// frameworks store a single string, others (e.g. NCSC CAF) store a
// nested map of IGP / outcome descriptions. Accept any of those shapes.
export const frameworkRegistryEntrySchema = z.object({
  id: z.string(),
  prop: z.string(),
  color: z.string().optional(),
  desc: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
});
export type FrameworkRegistryEntry = z.infer<typeof frameworkRegistryEntrySchema>;

// ───────────────────────────────────────────────────────────────
// NCSC CAF — bespoke shape: objectives → principles → outcomes
// 4 objectives / 14 principles / 41 contributing outcomes
// ───────────────────────────────────────────────────────────────
export const cafOutcomeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  desc: z.string(),
  achieved: z.array(z.string()).optional().default([]),
  evidence: z.array(z.string()).optional().default([]),
});
export type CafOutcome = z.infer<typeof cafOutcomeSchema>;

export const cafPrincipleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  desc: z.string(),
  outcomes: z.array(cafOutcomeSchema),
});
export type CafPrinciple = z.infer<typeof cafPrincipleSchema>;

export const cafObjectiveSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  desc: z.string(),
  principles: z.array(cafPrincipleSchema),
});
export type CafObjective = z.infer<typeof cafObjectiveSchema>;

export const cafHierarchySchema = z.object({
  meta: frameworkMetaSchema,
  about: z.union([z.string(), frameworkAboutSchema]).optional(),
  objectives: z.array(cafObjectiveSchema),
});
export type CafHierarchy = z.infer<typeof cafHierarchySchema>;
