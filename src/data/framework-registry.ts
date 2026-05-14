// Catalogue of frameworks tracked in this atlas. Each entry names the
// property on an IsoControl that holds the cross-reference for the
// target framework (e.g. nistSub for NIST CSF, soc2 for SOC 2).
import { frameworkRegistryEntrySchema, type FrameworkRegistryEntry } from './schemas';
import { z } from 'zod';
import rawRegistry from './_raw/FRAMEWORKS.json' with { type: 'json' };

// Use passthrough so we don't reject unknown legacy fields (color, hier, etc.)
const registrySchema = z.array(frameworkRegistryEntrySchema.passthrough());
const parsed = registrySchema.parse(rawRegistry);

export const frameworkRegistry: readonly FrameworkRegistryEntry[] = Object.freeze(parsed);

export function getFrameworkByName(name: string): FrameworkRegistryEntry | undefined {
  return parsed.find((f) => f.id === name);
}
