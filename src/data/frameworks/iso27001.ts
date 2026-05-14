// ISO 27001:2022 — primary spine. 118 controls total:
//   - 25 Management System clauses (clauses 4–10)
//   - 93 Annex A controls (Organizational/People/Physical/Technological)
//
// Cross-framework refs live INSIDE each control record (fields like
// nistSub, soc2, cis, pci, caf, …). The domain mapping-engine consumes
// those to derive transitive mappings.
import { isoControlsArraySchema, type IsoControl } from '../schemas';
import rawControls from '../_raw/CONTROLS.json' with { type: 'json' };

const parsed = isoControlsArraySchema.parse(rawControls);

export const iso27001Controls: readonly IsoControl[] = Object.freeze(parsed);

export const iso27001ManagementClauses: readonly IsoControl[] = Object.freeze(
  parsed.filter((c) => c.cat === 'Management System'),
);

export const iso27001AnnexA: readonly IsoControl[] = Object.freeze(
  parsed.filter((c) => c.cat !== 'Management System'),
);

export function getIsoControl(id: string): IsoControl | undefined {
  return parsed.find((c) => c.id === id);
}
