// Pre-populated evidence checklists keyed by ISO 27001 control id.
// Used to seed the EvidenceChecklist UI component.
import { isoEvidenceMapSchema, type IsoEvidenceMap } from './schemas';
import rawEvidence from './_raw/ISO_EVIDENCE.json' with { type: 'json' };

const parsed: IsoEvidenceMap = isoEvidenceMapSchema.parse(rawEvidence);

export const isoEvidenceTemplates: Readonly<IsoEvidenceMap> = Object.freeze(parsed);

export function getEvidenceTemplate(controlId: string): readonly string[] {
  return Object.freeze(parsed[controlId] ?? []);
}
