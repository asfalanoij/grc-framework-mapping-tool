// Mapping engine — parses cross-framework references on ISO 27001 controls
// and computes forward, reverse, and transitive mappings between any pair
// of the 11 supported frameworks.
//
// Data model: each IsoControl carries cross-refs as comma-separated strings
// in fields named after the target framework (e.g. nistSub="GV.OC-01,
// GV.OC-02", soc2="CC1.1, CC5.2"). "N/A" means no mapping.

import type { IsoControl } from '../data/schemas';
import { err, ok, type Result } from './result';

// Keys on IsoControl that hold cross-framework references.
export const frameworkPropKeys = [
  'nistSub',
  'soc2',
  'cis',
  'pci',
  'ce',
  'n80053',
  'nis2',
  'iso22301',
  'iso27017',
  'caf',
] as const;

export type FrameworkPropKey = (typeof frameworkPropKeys)[number];

export function isFrameworkPropKey(value: string): value is FrameworkPropKey {
  return (frameworkPropKeys as readonly string[]).includes(value);
}

// Parse a comma-separated cross-ref string. Treats "N/A" (any case),
// empty strings, and missing values as "no mappings". Trims whitespace.
export function parseCrossRefs(value: string | undefined | null): readonly string[] {
  if (!value) return Object.freeze([]);
  const trimmed = value.trim();
  if (trimmed.length === 0) return Object.freeze([]);
  if (trimmed.toUpperCase() === 'N/A') return Object.freeze([]);
  const parts = trimmed
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && p.toUpperCase() !== 'N/A');
  return Object.freeze(parts);
}

// All cross-refs declared by a single ISO control, keyed by target framework.
export type ControlMappings = Readonly<Record<FrameworkPropKey, readonly string[]>>;

export function getMappingsForControl(control: IsoControl): ControlMappings {
  const out: Record<FrameworkPropKey, readonly string[]> = {
    nistSub: parseCrossRefs(control.nistSub),
    soc2: parseCrossRefs(control.soc2),
    cis: parseCrossRefs(control.cis),
    pci: parseCrossRefs(control.pci),
    ce: parseCrossRefs(control.ce),
    n80053: parseCrossRefs(control.n80053),
    nis2: parseCrossRefs(control.nis2),
    iso22301: parseCrossRefs(control.iso22301),
    iso27017: parseCrossRefs(control.iso27017),
    caf: parseCrossRefs(control.caf),
  };
  return Object.freeze(out);
}

// Reverse mapping: given a foreign framework ref (e.g. "GV.OC-01"),
// return the IDs of every ISO control that references it.
export function getIsoControlsForRef(
  controls: readonly IsoControl[],
  framework: FrameworkPropKey,
  ref: string,
): readonly string[] {
  const target = ref.trim();
  if (target.length === 0) return Object.freeze([]);
  const matches: string[] = [];
  for (const c of controls) {
    const refs = parseCrossRefs(c[framework]);
    if (refs.includes(target)) {
      matches.push(c.id);
    }
  }
  return Object.freeze(matches);
}

// Transitive mapping: given a foreign-framework ref, return references
// in every OTHER framework that are reached via shared ISO controls.
// `sourceFramework` is included as an empty array in the output for
// convenience so callers can iterate `frameworkPropKeys` uniformly.
export function getTransitiveMappings(
  controls: readonly IsoControl[],
  sourceFramework: FrameworkPropKey,
  sourceRef: string,
): ControlMappings {
  const target = sourceRef.trim();
  const result: Record<FrameworkPropKey, Set<string>> = {
    nistSub: new Set(),
    soc2: new Set(),
    cis: new Set(),
    pci: new Set(),
    ce: new Set(),
    n80053: new Set(),
    nis2: new Set(),
    iso22301: new Set(),
    iso27017: new Set(),
    caf: new Set(),
  };
  if (target.length === 0) {
    return freezeAll(result);
  }
  for (const c of controls) {
    const sourceRefs = parseCrossRefs(c[sourceFramework]);
    if (!sourceRefs.includes(target)) continue;
    for (const key of frameworkPropKeys) {
      if (key === sourceFramework) continue;
      for (const r of parseCrossRefs(c[key])) {
        result[key].add(r);
      }
    }
  }
  return freezeAll(result);
}

function freezeAll(sets: Record<FrameworkPropKey, Set<string>>): ControlMappings {
  const out: Record<FrameworkPropKey, readonly string[]> = {
    nistSub: Object.freeze([...sets.nistSub].sort()),
    soc2: Object.freeze([...sets.soc2].sort()),
    cis: Object.freeze([...sets.cis].sort()),
    pci: Object.freeze([...sets.pci].sort()),
    ce: Object.freeze([...sets.ce].sort()),
    n80053: Object.freeze([...sets.n80053].sort()),
    nis2: Object.freeze([...sets.nis2].sort()),
    iso22301: Object.freeze([...sets.iso22301].sort()),
    iso27017: Object.freeze([...sets.iso27017].sort()),
    caf: Object.freeze([...sets.caf].sort()),
  };
  return Object.freeze(out);
}

// Result-typed variant for boundary callers (e.g. URL params where the
// framework key arrives as an unvalidated string).
export type MappingEngineError = 'unknown-framework' | 'empty-ref';

export function resolveTransitive(
  controls: readonly IsoControl[],
  framework: string,
  ref: string,
): Result<ControlMappings, MappingEngineError> {
  if (!isFrameworkPropKey(framework)) return err('unknown-framework');
  if (ref.trim().length === 0) return err('empty-ref');
  return ok(getTransitiveMappings(controls, framework, ref));
}
