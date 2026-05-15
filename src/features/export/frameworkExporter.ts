// Generic CSV exporter for the 10 non-ISO frameworks. One row per leaf
// item with status, achieved criteria summary, and reverse-mapped ISO
// 27001 controls (the audit-prep deliverable for these frameworks).
import { iso27001Controls } from '../../data/frameworks/iso27001';
import { frameworkRegistry } from '../../data/framework-registry';
import type { FrameworkHierarchy, FrameworkItem } from '../../data/schemas';
import type { CafHierarchy, CafOutcome } from '../../data/schemas';
import type { Status } from '../../domain/scoring';
import type { EvidenceRow } from '../../services/persistence';
import { getIsoControlsForRef, type FrameworkPropKey } from '../../domain/mapping-engine';
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
  'Description',
  'Implementation Status',
  'Achieved Criteria',
  'Mapped ISO 27001 Controls',
  'Evidence Collected',
  'Evidence References',
  'Evidence Notes',
] as const;

export interface FrameworkExportInputs {
  readonly framework: string; // e.g. "NIST CSF 2.0"
  readonly scores: Readonly<Record<string, Status>>;
  readonly evidenceByKey: Readonly<Record<string, EvidenceRow>>;
}

interface Leaf {
  readonly id: string;
  readonly name: string;
  readonly desc?: string;
  readonly achieved?: readonly string[];
  readonly evidence?: readonly string[];
}

function flattenHierarchy(h: FrameworkHierarchy): Leaf[] {
  const out: Leaf[] = [];
  for (const g of h.groups) {
    if (g.sections) {
      for (const s of g.sections) for (const item of s.items) out.push(toLeaf(item));
    }
    if (g.items) for (const item of g.items) out.push(toLeaf(item));
    // Some flat hierarchies have neither sections nor items — the group
    // itself is the leaf.
    if (!g.sections && !g.items) {
      out.push({ id: g.id, name: g.name, desc: g.desc, achieved: g.achieved });
    }
  }
  return out;
}

function toLeaf(item: FrameworkItem): Leaf {
  return {
    id: item.id,
    name: item.name,
    desc: item.desc,
    achieved: item.achieved,
    evidence: item.evidence,
  };
}

function flattenCaf(h: CafHierarchy): Leaf[] {
  const out: Leaf[] = [];
  for (const o of h.objectives)
    for (const p of o.principles)
      for (const c of p.outcomes) {
        out.push(toCafLeaf(c));
      }
  return out;
}

function toCafLeaf(o: CafOutcome): Leaf {
  return { id: o.id, name: o.name, desc: o.desc, achieved: o.achieved, evidence: o.evidence };
}

export function buildFrameworkCsv(
  hierarchy: FrameworkHierarchy,
  inputs: FrameworkExportInputs,
): string {
  return buildLeafCsv(flattenHierarchy(hierarchy), inputs);
}

export function buildCafCsv(hierarchy: CafHierarchy, inputs: FrameworkExportInputs): string {
  return buildLeafCsv(flattenCaf(hierarchy), inputs);
}

function buildLeafCsv(leaves: readonly Leaf[], inputs: FrameworkExportInputs): string {
  const registry = frameworkRegistry.find((f) => f.id === inputs.framework);
  const prop = registry?.prop as FrameworkPropKey | undefined;
  const rows: (readonly (string | number | null | undefined)[])[] = [HEADERS];
  for (const leaf of leaves) {
    const status = inputs.scores[leaf.id] ?? 'not-started';
    const ev = inputs.evidenceByKey[`${inputs.framework}::${leaf.id}`];
    const collected = ev ? Object.keys(ev.collected).filter((k) => ev.collected[k] === true) : [];
    const refs = ev
      ? Object.entries(ev.refs)
          .map(([k, v]) => `${k}: ${v}`)
          .filter((s) => s.length > 0)
      : [];
    const isoIds = prop ? getIsoControlsForRef(iso27001Controls, prop, leaf.id).join(', ') : '';
    rows.push([
      leaf.id,
      leaf.name,
      leaf.desc ?? '',
      STATUS_LABEL[status],
      (leaf.achieved ?? []).join(' • '),
      isoIds,
      collected.join('; '),
      refs.join('; '),
      ev?.notes ?? '',
    ]);
  }
  return buildCsv(rows, { withBom: true });
}
