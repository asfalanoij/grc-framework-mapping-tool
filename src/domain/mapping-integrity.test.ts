import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { iso27001Controls } from '../data/frameworks/iso27001';
import { nistCsf2 } from '../data/frameworks/nist-csf-2';
import { soc2 } from '../data/frameworks/soc2';
import { cisV8 } from '../data/frameworks/cis-v8';
import { pciDss } from '../data/frameworks/pci-dss';
import { cyberEssentials } from '../data/frameworks/cyber-essentials';
import { nist80053 } from '../data/frameworks/nist-800-53';
import { nis2 } from '../data/frameworks/nis2';
import { iso22301 } from '../data/frameworks/iso22301';
import { iso27017 } from '../data/frameworks/iso27017';
import { ncscCaf } from '../data/frameworks/ncsc-caf';
import {
  frameworkPropKeys,
  getMappingsForControl,
  getIsoControlsForRef,
  type FrameworkPropKey,
} from './mapping-engine';

// Recursively collect every `id` string under a framework hierarchy node.
// Different frameworks use different child-array keys, so we walk all known
// names.
function collectIds(node: unknown, out: Set<string>): void {
  if (!node || typeof node !== 'object') return;
  const n = node as Record<string, unknown>;
  if (typeof n.id === 'string') out.add(n.id);
  for (const key of [
    'groups',
    'sections',
    'items',
    'objectives',
    'principles',
    'outcomes',
    'safeguards',
    'requirements',
    'measures',
    'subclauses',
    'subsections',
    'criteria',
    'themes',
    'families',
    'clauses',
  ]) {
    const children = n[key];
    if (Array.isArray(children)) {
      for (const child of children) collectIds(child, out);
    }
  }
}

function setOf(hier: unknown): ReadonlySet<string> {
  const ids = new Set<string>();
  collectIds(hier, ids);
  return ids;
}

const frameworkLeafIds: Record<FrameworkPropKey, ReadonlySet<string>> = {
  nistSub: setOf(nistCsf2),
  soc2: setOf(soc2),
  cis: setOf(cisV8),
  pci: setOf(pciDss),
  ce: setOf(cyberEssentials),
  n80053: setOf(nist80053),
  nis2: setOf(nis2),
  iso22301: setOf(iso22301),
  iso27017: setOf(iso27017),
  caf: setOf(ncscCaf),
};

interface Orphan {
  isoId: string;
  field: FrameworkPropKey;
  refId: string;
}

function findOrphans(): Orphan[] {
  const out: Orphan[] = [];
  for (const control of iso27001Controls) {
    const m = getMappingsForControl(control);
    for (const field of frameworkPropKeys) {
      const leaves = frameworkLeafIds[field];
      for (const refId of m[field]) {
        if (!leaves.has(refId)) {
          out.push({ isoId: control.id, field, refId });
        }
      }
    }
  }
  return out;
}

function writeReport(orphans: readonly Orphan[]): void {
  try {
    mkdirSync('tmp', { recursive: true });
    const byFramework: Record<string, number> = {};
    for (const o of orphans) byFramework[o.field] = (byFramework[o.field] ?? 0) + 1;
    writeFileSync(
      'tmp/mapping-orphans.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          totalControls: iso27001Controls.length,
          totalOrphans: orphans.length,
          byFramework,
          orphans,
        },
        null,
        2,
      ) + '\n',
    );
  } catch {
    // best-effort
  }
}

describe('mapping integrity', () => {
  const orphans = findOrphans();
  writeReport(orphans);

  it('every ISO control cross-reference resolves to a real target-framework leaf', () => {
    if (orphans.length > 0) {
      const byFw = new Map<FrameworkPropKey, Orphan[]>();
      for (const o of orphans) {
        const arr = byFw.get(o.field) ?? [];
        arr.push(o);
        byFw.set(o.field, arr);
      }
      const lines: string[] = [];
      for (const [fw, list] of byFw) {
        const sample = list
          .slice(0, 3)
          .map((o) => `${o.isoId}->'${o.refId}'`)
          .join(', ');
        lines.push(`  ${fw}: ${list.length} orphan(s)  e.g. ${sample}`);
      }
      console.error(
        `\n${orphans.length} orphan cross-reference(s) across ${byFw.size} framework(s):\n${lines.join('\n')}\nFull report: tmp/mapping-orphans.json\n`,
      );
    }
    expect(orphans).toHaveLength(0);
  });

  it('every non-ISO framework receives at least one ISO reference', () => {
    const referenced = new Set<FrameworkPropKey>();
    for (const control of iso27001Controls) {
      const m = getMappingsForControl(control);
      for (const field of frameworkPropKeys) {
        if (m[field].length > 0) referenced.add(field);
      }
    }
    const missing = frameworkPropKeys.filter((k) => !referenced.has(k));
    expect(
      missing,
      `frameworks with zero inbound ISO references: ${missing.join(', ')}`,
    ).toHaveLength(0);
  });

  it('getIsoControlsForRef round-trips with declared forward refs', () => {
    const mismatches: string[] = [];
    let checked = 0;
    for (const control of iso27001Controls) {
      const m = getMappingsForControl(control);
      for (const field of frameworkPropKeys) {
        for (const ref of m[field]) {
          const hits = getIsoControlsForRef(iso27001Controls, field, ref);
          if (!hits.includes(control.id)) {
            mismatches.push(
              `${control.id} declares ${field}='${ref}' but reverse lookup returned [${hits.join(',')}]`,
            );
          }
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(100);
    expect(mismatches, mismatches.slice(0, 5).join('\n')).toHaveLength(0);
  });
});
