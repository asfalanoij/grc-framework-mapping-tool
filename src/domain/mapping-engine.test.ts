import { describe, it, expect } from 'vitest';
import type { IsoControl } from '../data/schemas';
import {
  parseCrossRefs,
  isFrameworkPropKey,
  getMappingsForControl,
  getIsoControlsForRef,
  getTransitiveMappings,
  resolveTransitive,
  frameworkPropKeys,
  type FrameworkPropKey,
} from './mapping-engine';

// Minimal fixtures — enough to exercise every branch in the engine.
const c1: IsoControl = {
  id: '4.1',
  name: 'Context',
  isoDesc: 'desc',
  cat: 'Management System',
  nistFunc: 'GOVERN',
  nistCat: 'GV.OC',
  nistSub: 'GV.OC-01, GV.OC-02',
  soc2: 'CC1.1',
  cis: 'N/A',
  pci: 'N/A',
  ce: 'N/A',
  notes: '',
};
const c2: IsoControl = {
  id: 'A.5.1',
  name: 'Policy',
  isoDesc: 'desc',
  cat: 'Organizational',
  nistFunc: 'GOVERN',
  nistCat: 'GV.PO',
  nistSub: 'GV.PO-01, GV.OC-01',
  soc2: 'CC1.1, CC5.2',
  cis: 'CIS 1, CIS 2',
  pci: 'Req 12',
  ce: 'N/A',
  n80053: 'PM, PL',
  nis2: 'Art.21(a)',
  iso22301: 'Cl.5',
  iso27017: '§5',
  caf: 'B1.a',
  ct: 'Preventive',
  sd: 'Governance and Ecosystem',
  notes: '',
};
const c3: IsoControl = {
  id: 'A.8.1',
  name: 'Endpoint protection',
  isoDesc: 'desc',
  cat: 'Technological',
  nistFunc: 'PROTECT',
  nistCat: 'PR.PS',
  nistSub: 'PR.PS-01',
  soc2: 'CC6.1',
  cis: 'CIS 10',
  pci: 'Req 5',
  ce: 'Malware protection',
  notes: '',
};
const all = [c1, c2, c3];

describe('parseCrossRefs', () => {
  it('returns empty for null/undefined/empty', () => {
    expect(parseCrossRefs(null)).toEqual([]);
    expect(parseCrossRefs(undefined)).toEqual([]);
    expect(parseCrossRefs('')).toEqual([]);
    expect(parseCrossRefs('   ')).toEqual([]);
  });

  it('returns empty for "N/A" in any case', () => {
    expect(parseCrossRefs('N/A')).toEqual([]);
    expect(parseCrossRefs('n/a')).toEqual([]);
    expect(parseCrossRefs(' N/A ')).toEqual([]);
  });

  it('splits a comma-separated list and trims each piece', () => {
    expect(parseCrossRefs('GV.OC-01, GV.OC-02')).toEqual(['GV.OC-01', 'GV.OC-02']);
    expect(parseCrossRefs(' CC1.1 ,  CC5.2 ')).toEqual(['CC1.1', 'CC5.2']);
  });

  it('drops empty pieces and embedded N/A', () => {
    expect(parseCrossRefs('CC1.1,,N/A,CC5.2')).toEqual(['CC1.1', 'CC5.2']);
  });

  it('handles a single token without commas', () => {
    expect(parseCrossRefs('CC6.1')).toEqual(['CC6.1']);
  });

  it('returns a frozen array', () => {
    const r = parseCrossRefs('A, B');
    expect(Object.isFrozen(r)).toBe(true);
  });
});

describe('isFrameworkPropKey', () => {
  it('accepts every key in frameworkPropKeys', () => {
    for (const k of frameworkPropKeys) expect(isFrameworkPropKey(k)).toBe(true);
  });
  it('rejects unknown keys', () => {
    expect(isFrameworkPropKey('id')).toBe(false);
    expect(isFrameworkPropKey('notFramework')).toBe(false);
    expect(isFrameworkPropKey('')).toBe(false);
  });
});

describe('getMappingsForControl', () => {
  it('returns parsed cross-refs keyed by framework', () => {
    const m = getMappingsForControl(c2);
    expect(m.nistSub).toEqual(['GV.PO-01', 'GV.OC-01']);
    expect(m.soc2).toEqual(['CC1.1', 'CC5.2']);
    expect(m.cis).toEqual(['CIS 1', 'CIS 2']);
    expect(m.pci).toEqual(['Req 12']);
    expect(m.ce).toEqual([]);
    expect(m.n80053).toEqual(['PM', 'PL']);
    expect(m.nis2).toEqual(['Art.21(a)']);
    expect(m.iso22301).toEqual(['Cl.5']);
    expect(m.iso27017).toEqual(['§5']);
    expect(m.caf).toEqual(['B1.a']);
  });

  it('treats missing optional fields as empty', () => {
    const m = getMappingsForControl(c1);
    expect(m.n80053).toEqual([]);
    expect(m.nis2).toEqual([]);
    expect(m.caf).toEqual([]);
  });

  it('returns a frozen object', () => {
    const m = getMappingsForControl(c1);
    expect(Object.isFrozen(m)).toBe(true);
  });
});

describe('getIsoControlsForRef', () => {
  it('finds ISO controls that reference a given NIST subcategory', () => {
    expect(getIsoControlsForRef(all, 'nistSub', 'GV.OC-01')).toEqual(['4.1', 'A.5.1']);
    expect(getIsoControlsForRef(all, 'nistSub', 'GV.PO-01')).toEqual(['A.5.1']);
  });

  it('returns empty for refs nothing maps to', () => {
    expect(getIsoControlsForRef(all, 'nistSub', 'ZZ.ZZ-99')).toEqual([]);
  });

  it('returns empty for empty ref string', () => {
    expect(getIsoControlsForRef(all, 'nistSub', '')).toEqual([]);
    expect(getIsoControlsForRef(all, 'nistSub', '   ')).toEqual([]);
  });

  it('matches across CIS prefix style', () => {
    expect(getIsoControlsForRef(all, 'cis', 'CIS 1')).toEqual(['A.5.1']);
  });
});

describe('getTransitiveMappings', () => {
  it('reaches other frameworks via shared ISO controls', () => {
    // GV.OC-01 lives on 4.1 (→ soc2 CC1.1) and A.5.1 (→ many).
    const t = getTransitiveMappings(all, 'nistSub', 'GV.OC-01');
    expect(t.soc2).toEqual(expect.arrayContaining(['CC1.1', 'CC5.2']));
    expect(t.cis).toEqual(['CIS 1', 'CIS 2']);
    expect(t.pci).toEqual(['Req 12']);
    expect(t.caf).toEqual(['B1.a']);
  });

  it('source framework is empty in the result', () => {
    const t = getTransitiveMappings(all, 'nistSub', 'GV.OC-01');
    expect(t.nistSub).toEqual([]);
  });

  it('returns all-empty result for unknown source ref', () => {
    const t = getTransitiveMappings(all, 'nistSub', 'NOPE');
    for (const k of frameworkPropKeys) {
      expect(t[k as FrameworkPropKey]).toEqual([]);
    }
  });

  it('returns all-empty result for empty source ref', () => {
    const t = getTransitiveMappings(all, 'nistSub', '   ');
    for (const k of frameworkPropKeys) {
      expect(t[k as FrameworkPropKey]).toEqual([]);
    }
  });

  it('de-duplicates and sorts the cross-framework results', () => {
    // CC1.1 appears on both c1 and c2; should appear once.
    const t = getTransitiveMappings(all, 'nistSub', 'GV.OC-01');
    expect(t.soc2.filter((x) => x === 'CC1.1').length).toBe(1);
    // Verify sorted order.
    expect([...t.soc2]).toEqual([...t.soc2].sort());
  });
});

describe('resolveTransitive (Result-typed boundary)', () => {
  it('returns ok for valid framework + ref', () => {
    const r = resolveTransitive(all, 'nistSub', 'GV.OC-01');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.soc2).toContain('CC1.1');
  });

  it('returns unknown-framework for invalid framework key', () => {
    const r = resolveTransitive(all, 'banana', 'GV.OC-01');
    expect(r).toEqual({ ok: false, error: 'unknown-framework' });
  });

  it('returns empty-ref for blank ref', () => {
    const r = resolveTransitive(all, 'nistSub', '   ');
    expect(r).toEqual({ ok: false, error: 'empty-ref' });
  });
});
