import { describe, it, expect } from 'vitest';
import type { IsoControl } from '../data/schemas';
import {
  and,
  or,
  not,
  applyFilters,
  byIsoCategory,
  byControlType,
  bySecurityDomain,
  byNistFunction,
  byStatus,
  TRUE,
  type Predicate,
} from './filters';

const c1: IsoControl = {
  id: '4.1',
  name: 'Context',
  isoDesc: '',
  cat: 'Management System',
  nistFunc: 'GOVERN',
  nistCat: 'GV.OC',
  nistSub: '',
  soc2: '',
  cis: '',
  pci: '',
  ce: '',
  notes: '',
};
const c2: IsoControl = {
  id: 'A.5.1',
  name: 'Policy',
  isoDesc: '',
  cat: 'Organizational',
  nistFunc: 'GOVERN',
  nistCat: 'GV.PO',
  nistSub: '',
  soc2: '',
  cis: '',
  pci: '',
  ce: '',
  ct: 'Preventive',
  sd: 'Governance and Ecosystem',
  notes: '',
};
const c3: IsoControl = {
  id: 'A.8.1',
  name: 'Endpoint',
  isoDesc: '',
  cat: 'Technological',
  nistFunc: 'PROTECT',
  nistCat: 'PR.PS',
  nistSub: '',
  soc2: '',
  cis: '',
  pci: '',
  ce: '',
  ct: 'Detective',
  sd: 'Protection',
  notes: '',
};
const all = [c1, c2, c3];

describe('combinators', () => {
  const even: Predicate<number> = (n) => n % 2 === 0;
  const positive: Predicate<number> = (n) => n > 0;

  it('TRUE matches anything', () => {
    expect(TRUE()).toBe(true);
  });

  it('and() with no preds is TRUE', () => {
    expect(and<number>()(5)).toBe(true);
  });

  it('and() requires every predicate to pass', () => {
    const p = and(even, positive);
    expect(p(2)).toBe(true);
    expect(p(-2)).toBe(false);
    expect(p(3)).toBe(false);
  });

  it('or() with no preds is TRUE', () => {
    expect(or<number>()(5)).toBe(true);
  });

  it('or() requires at least one predicate to pass', () => {
    const p = or(even, positive);
    expect(p(2)).toBe(true);
    expect(p(-2)).toBe(true);
    expect(p(3)).toBe(true);
    expect(p(-3)).toBe(false);
  });

  it('not() negates a predicate', () => {
    expect(not(even)(1)).toBe(true);
    expect(not(even)(2)).toBe(false);
  });
});

describe('applyFilters', () => {
  it('returns items unchanged when no filters are passed', () => {
    expect(applyFilters(all, [])).toEqual(all);
  });

  it('filters by a single predicate', () => {
    const result = applyFilters(all, [byIsoCategory(['Organizational'])]);
    expect(result.map((c) => c.id)).toEqual(['A.5.1']);
  });

  it('AND-combines multiple predicates', () => {
    const result = applyFilters(all, [
      byIsoCategory(['Organizational', 'Technological']),
      bySecurityDomain(['Protection']),
    ]);
    expect(result.map((c) => c.id)).toEqual(['A.8.1']);
  });
});

describe('byIsoCategory', () => {
  it('passes anything when category list is empty', () => {
    const p = byIsoCategory([]);
    expect(all.filter(p).length).toBe(3);
  });
  it('filters to the given categories', () => {
    expect(all.filter(byIsoCategory(['Management System'])).map((c) => c.id)).toEqual(['4.1']);
    expect(all.filter(byIsoCategory(['Organizational', 'Technological'])).map((c) => c.id)).toEqual([
      'A.5.1',
      'A.8.1',
    ]);
  });
});

describe('byControlType', () => {
  it('passes anything when type list is empty', () => {
    expect(all.filter(byControlType([])).length).toBe(3);
  });
  it('filters by ct (and drops controls without ct)', () => {
    expect(all.filter(byControlType(['Preventive'])).map((c) => c.id)).toEqual(['A.5.1']);
    expect(all.filter(byControlType(['Detective'])).map((c) => c.id)).toEqual(['A.8.1']);
  });
});

describe('bySecurityDomain', () => {
  it('passes anything when domain list is empty', () => {
    expect(all.filter(bySecurityDomain([])).length).toBe(3);
  });
  it('filters by sd (and drops controls without sd)', () => {
    expect(all.filter(bySecurityDomain(['Protection'])).map((c) => c.id)).toEqual(['A.8.1']);
    expect(all.filter(bySecurityDomain(['Governance and Ecosystem'])).map((c) => c.id)).toEqual([
      'A.5.1',
    ]);
  });
});

describe('byNistFunction', () => {
  it('passes anything when function list is empty', () => {
    expect(all.filter(byNistFunction([])).length).toBe(3);
  });
  it('matches case-insensitively on nistFunc', () => {
    expect(all.filter(byNistFunction(['govern'])).map((c) => c.id)).toEqual(['4.1', 'A.5.1']);
    expect(all.filter(byNistFunction(['PROTECT'])).map((c) => c.id)).toEqual(['A.8.1']);
  });
});

describe('byStatus', () => {
  it('passes anything when status list is empty', () => {
    expect(all.filter(byStatus([], {})).length).toBe(3);
  });
  it('treats missing scores as not-started', () => {
    const result = all.filter(byStatus(['not-started'], {}));
    expect(result.length).toBe(3);
  });
  it('filters by scored status', () => {
    const scores = { '4.1': 'implemented', 'A.5.1': 'in-progress' } as const;
    expect(all.filter(byStatus(['implemented'], scores)).map((c) => c.id)).toEqual(['4.1']);
    expect(all.filter(byStatus(['in-progress'], scores)).map((c) => c.id)).toEqual(['A.5.1']);
  });
});
