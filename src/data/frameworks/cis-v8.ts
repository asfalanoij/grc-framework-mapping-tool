// CIS Controls v8 — 18 Controls, 153 Safeguards with IG1/IG2/IG3 tiers.
// The IG tier is encoded as a "[IG1]" / "[IG2]" / "[IG3]" prefix on each
// Safeguard's `desc` field (rather than a separate property).
import { frameworkHierarchySchema, type FrameworkHierarchy, type FrameworkItem } from '../schemas';
import rawHier from '../_raw/CIS_HIER.json' with { type: 'json' };

const parsed: FrameworkHierarchy = frameworkHierarchySchema.parse(rawHier);

export const cisV8: FrameworkHierarchy = Object.freeze(parsed) as FrameworkHierarchy;

export type IgTier = 'IG1' | 'IG2' | 'IG3';

export interface CisSafeguard extends FrameworkItem {
  readonly igTier: IgTier;
}

function parseIgTier(desc: string): IgTier {
  if (desc.startsWith('[IG1]')) return 'IG1';
  if (desc.startsWith('[IG2]')) return 'IG2';
  if (desc.startsWith('[IG3]')) return 'IG3';
  // Fall back to IG3 (broadest) when unmarked — keeps the safeguard
  // included in the most permissive filter rather than silently dropped.
  return 'IG3';
}

// CIS uses a 2-level hierarchy: 18 Controls → 153 Safeguards (items directly on groups).
export const cisV8Safeguards: readonly CisSafeguard[] = Object.freeze(
  parsed.groups.flatMap((g) =>
    (g.items ?? []).map((item) => ({
      ...item,
      igTier: parseIgTier(item.desc),
    })),
  ),
);

// IG tier filters. Per CIS guidance, higher tiers include lower tiers
// (IG1 ⊆ IG2 ⊆ IG3) — IG2 organisations also implement all IG1 safeguards.
export const cisV8Ig1: readonly CisSafeguard[] = Object.freeze(
  cisV8Safeguards.filter((s) => s.igTier === 'IG1'),
);
export const cisV8Ig2: readonly CisSafeguard[] = Object.freeze(
  cisV8Safeguards.filter((s) => s.igTier === 'IG1' || s.igTier === 'IG2'),
);
export const cisV8Ig3: readonly CisSafeguard[] = Object.freeze(cisV8Safeguards);
