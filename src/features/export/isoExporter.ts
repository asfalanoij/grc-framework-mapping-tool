// ISO 27001 framework export. Produces a single CSV with one row per
// control (all 118 by default; respects an explicit filter when given).
//
// Columns mirror the legacy tool's audit-prep export so auditors can
// diff old and new outputs.
import { iso27001Controls } from '../../data/frameworks/iso27001';
import { getEvidenceTemplate } from '../../data/evidence-templates';
import type { IsoControl } from '../../data/schemas';
import type { Status } from '../../domain/scoring';
import type { EvidenceRow } from '../../services/persistence';
import { buildCsv } from './csv';

const STATUS_LABEL: Readonly<Record<Status, string>> = Object.freeze({
  'not-started': 'Not started',
  'in-progress': 'In progress',
  implemented: 'Implemented',
  na: 'Not Applicable',
});

const HEADERS = [
  'ID',
  'Name',
  'Category',
  'Control Type',
  'Security Domain',
  'ISO 27002 Description',
  'Implementation Status',
  'SoA Justification',
  'NIST CSF 2.0',
  'SOC 2',
  'CIS v8',
  'PCI DSS',
  'Cyber Essentials',
  'NIST 800-53',
  'NIS 2',
  'ISO 22301',
  'ISO 27017',
  'NCSC CAF',
  'Implementation Guidance',
  'Evidence Collected',
  'Evidence References',
  'Evidence Notes',
] as const;

export interface IsoExportInputs {
  readonly controls?: readonly IsoControl[];
  readonly scores: Readonly<Record<string, Status>>;
  readonly evidenceByKey: Readonly<Record<string, EvidenceRow>>;
  readonly justifications: Readonly<Record<string, string>>;
}

export function buildIsoCsv(inputs: IsoExportInputs): string {
  const rows: (readonly (string | number | null | undefined)[])[] = [HEADERS];
  const controls = inputs.controls ?? iso27001Controls;
  for (const c of controls) {
    rows.push(buildIsoRow(c, inputs));
  }
  return buildCsv(rows, { withBom: true });
}

function buildIsoRow(
  c: IsoControl,
  { scores, evidenceByKey, justifications }: IsoExportInputs,
): (string | undefined)[] {
  const status = scores[c.id] ?? 'not-started';
  const ev = evidenceByKey[`ISO 27001::${c.id}`];
  const collected = ev ? Object.keys(ev.collected).filter((k) => ev.collected[k] === true) : [];
  const refs = ev
    ? Object.entries(ev.refs)
        .map(([k, v]) => `${k}: ${v}`)
        .filter((s) => s.length > 0)
    : [];
  const templates = getEvidenceTemplate(c.id);
  return [
    c.id,
    c.name,
    c.cat,
    c.ct,
    c.sd,
    c.isoDesc,
    STATUS_LABEL[status],
    justifications[c.id] ?? '',
    c.nistSub,
    c.soc2,
    c.cis,
    c.pci,
    c.ce,
    c.n80053,
    c.nis2,
    c.iso22301,
    c.iso27017,
    c.caf,
    c.notes,
    `${collected.length} of ${templates.length} collected${collected.length ? `: ${collected.join('; ')}` : ''}`,
    refs.join('; '),
    ev?.notes ?? '',
  ];
}

// SoA export: ISO 27001 Annex A controls only (93 rows), ALWAYS the full
// set regardless of any active filter. Per spec §13.4 the SoA is the
// audit-prep deliverable so it must include every Annex A control.
const SOA_HEADERS = [
  'Control ID',
  'Control Name',
  'Applicable',
  'Justification',
  'ISO 27002 Statement',
  'Control Type',
  'Security Domain',
  'Implementation Status',
] as const;

export function buildSoaCsv(inputs: IsoExportInputs): string {
  const rows: (readonly (string | number | null | undefined)[])[] = [SOA_HEADERS];
  // Annex A only — filter out the 25 Management System clauses.
  const annexA = iso27001Controls.filter((c) => c.cat !== 'Management System');
  for (const c of annexA) {
    const status = inputs.scores[c.id] ?? 'not-started';
    const isApplicable = status !== 'na';
    rows.push([
      c.id,
      c.name,
      isApplicable ? 'Yes' : 'No',
      isApplicable ? '' : (inputs.justifications[c.id] ?? ''),
      c.isoDesc,
      c.ct,
      c.sd,
      STATUS_LABEL[status],
    ]);
  }
  return buildCsv(rows, { withBom: true });
}
