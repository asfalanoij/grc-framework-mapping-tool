// XLSX exporter. Wraps SheetJS (lazy-imported) so the ~600 KB lib only
// loads when an XLSX export is triggered. The shape mirrors the CSV
// columns — auditors get the same data in spreadsheet form.

import type { Status } from '../../domain/scoring';
import type { EvidenceRow } from '../../services/persistence';
import type { FrameworkHierarchy, CafHierarchy, IsoControl } from '../../data/schemas';
import { iso27001Controls } from '../../data/frameworks/iso27001';
import { getEvidenceTemplate } from '../../data/evidence-templates';
import { frameworkRegistry } from '../../data/framework-registry';
import { getIsoControlsForRef, type FrameworkPropKey } from '../../domain/mapping-engine';

const STATUS_LABEL: Readonly<Record<Status, string>> = Object.freeze({
  'not-started': 'Not started',
  'in-progress': 'In progress',
  implemented: 'Implemented',
  na: 'Not Applicable',
});

export interface IsoXlsxInputs {
  readonly controls?: readonly IsoControl[];
  readonly scores: Readonly<Record<string, Status>>;
  readonly evidenceByKey: Readonly<Record<string, EvidenceRow>>;
  readonly justifications: Readonly<Record<string, string>>;
}

export async function buildIsoXlsx(inputs: IsoXlsxInputs): Promise<Uint8Array> {
  const XLSX = await import('xlsx');
  const controls = inputs.controls ?? iso27001Controls;
  const rows = controls.map((c) => buildIsoXlsxRow(c, inputs));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'ISO 27001');
  const out = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(out as ArrayBuffer);
}

function buildIsoXlsxRow(
  c: IsoControl,
  { scores, evidenceByKey, justifications }: IsoXlsxInputs,
): Record<string, unknown> {
  const status = scores[c.id] ?? 'not-started';
  const ev = evidenceByKey[`ISO 27001::${c.id}`];
  const collected = ev ? Object.keys(ev.collected).filter((k) => ev.collected[k] === true) : [];
  const refs = ev
    ? Object.entries(ev.refs)
        .map(([k, v]) => `${k}: ${v}`)
        .filter((s) => s.length > 0)
    : [];
  const templates = getEvidenceTemplate(c.id);
  return {
    ID: c.id,
    Name: c.name,
    Category: c.cat,
    'Control Type': c.ct ?? '',
    'Security Domain': c.sd ?? '',
    'ISO 27002 Description': c.isoDesc,
    'Implementation Status': STATUS_LABEL[status],
    'SoA Justification': justifications[c.id] ?? '',
    'NIST CSF 2.0': c.nistSub,
    'SOC 2': c.soc2,
    'CIS v8': c.cis,
    'PCI DSS': c.pci,
    'Cyber Essentials': c.ce,
    'NIST 800-53': c.n80053 ?? '',
    'NIS 2': c.nis2 ?? '',
    'ISO 22301': c.iso22301 ?? '',
    'ISO 27017': c.iso27017 ?? '',
    'NCSC CAF': c.caf ?? '',
    'Implementation Guidance': c.notes,
    'Evidence Collected':
      `${collected.length} of ${templates.length}${collected.length ? ` (${collected.join('; ')})` : ''}`,
    'Evidence References': refs.join('; '),
    'Evidence Notes': ev?.notes ?? '',
  };
}

interface Leaf {
  readonly id: string;
  readonly name: string;
  readonly desc?: string;
  readonly achieved?: readonly string[];
  readonly evidence?: readonly string[];
}

export interface FrameworkXlsxInputs {
  readonly framework: string;
  readonly scores: Readonly<Record<string, Status>>;
  readonly evidenceByKey: Readonly<Record<string, EvidenceRow>>;
}

function flattenHierarchy(h: FrameworkHierarchy): Leaf[] {
  const out: Leaf[] = [];
  for (const g of h.groups) {
    if (g.sections) {
      for (const s of g.sections) for (const i of s.items) {
        out.push({ id: i.id, name: i.name, desc: i.desc, achieved: i.achieved, evidence: i.evidence });
      }
    }
    if (g.items) for (const i of g.items) {
      out.push({ id: i.id, name: i.name, desc: i.desc, achieved: i.achieved, evidence: i.evidence });
    }
    if (!g.sections && !g.items) {
      out.push({ id: g.id, name: g.name, desc: g.desc, achieved: g.achieved });
    }
  }
  return out;
}

function flattenCaf(h: CafHierarchy): Leaf[] {
  const out: Leaf[] = [];
  for (const o of h.objectives) for (const p of o.principles) for (const c of p.outcomes) {
    out.push({ id: c.id, name: c.name, desc: c.desc, achieved: c.achieved, evidence: c.evidence });
  }
  return out;
}

export async function buildFrameworkXlsx(
  hierarchy: FrameworkHierarchy,
  inputs: FrameworkXlsxInputs,
): Promise<Uint8Array> {
  return buildLeafXlsx(flattenHierarchy(hierarchy), inputs);
}

export async function buildCafXlsx(
  hierarchy: CafHierarchy,
  inputs: FrameworkXlsxInputs,
): Promise<Uint8Array> {
  return buildLeafXlsx(flattenCaf(hierarchy), inputs);
}

async function buildLeafXlsx(leaves: readonly Leaf[], inputs: FrameworkXlsxInputs): Promise<Uint8Array> {
  const XLSX = await import('xlsx');
  const registry = frameworkRegistry.find((f) => f.id === inputs.framework);
  const prop = registry?.prop as FrameworkPropKey | undefined;
  const rows = leaves.map((leaf) => {
    const status = inputs.scores[leaf.id] ?? 'not-started';
    const ev = inputs.evidenceByKey[`${inputs.framework}::${leaf.id}`];
    const collected = ev ? Object.keys(ev.collected).filter((k) => ev.collected[k] === true) : [];
    const refs = ev
      ? Object.entries(ev.refs)
          .map(([k, v]) => `${k}: ${v}`)
          .filter((s) => s.length > 0)
      : [];
    const isoIds = prop ? getIsoControlsForRef(iso27001Controls, prop, leaf.id).join(', ') : '';
    return {
      ID: leaf.id,
      Name: leaf.name,
      Description: leaf.desc ?? '',
      'Implementation Status': STATUS_LABEL[status],
      'Achieved Criteria': (leaf.achieved ?? []).join(' • '),
      'Mapped ISO 27001 Controls': isoIds,
      'Evidence Collected': collected.join('; '),
      'Evidence References': refs.join('; '),
      'Evidence Notes': ev?.notes ?? '',
    };
  });
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, inputs.framework.slice(0, 31));
  const out = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(out as ArrayBuffer);
}
