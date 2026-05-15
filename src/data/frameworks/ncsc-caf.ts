// NCSC Cyber Assessment Framework (CAF) — bespoke 3-level hierarchy:
// 4 Objectives (A–D) → 14 Principles → 41 Contributing Outcomes,
// each outcome carrying its official Indicators of Good Practice (IGP).
import { cafHierarchySchema, type CafHierarchy, type CafOutcome, type CafPrinciple } from '../schemas';
import rawCaf from '../_raw/CAF.json' with { type: 'json' };

const parsed: CafHierarchy = cafHierarchySchema.parse(rawCaf);

export const ncscCaf: CafHierarchy = Object.freeze(parsed) as CafHierarchy;
export const ncscCafObjectives = Object.freeze(parsed.objectives);
export const ncscCafPrinciples: readonly CafPrinciple[] = Object.freeze(
  parsed.objectives.flatMap((o) => o.principles),
);
export const ncscCafOutcomes: readonly CafOutcome[] = Object.freeze(
  parsed.objectives.flatMap((o) => o.principles.flatMap((p) => p.outcomes)),
);
