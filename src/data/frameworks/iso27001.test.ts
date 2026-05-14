import { describe, it, expect } from 'vitest';
import {
  iso27001Controls,
  iso27001AnnexA,
  iso27001ManagementClauses,
  getIsoControl,
} from './iso27001';

describe('ISO 27001:2022 data', () => {
  it('contains exactly 118 controls (25 MS clauses + 93 Annex A)', () => {
    expect(iso27001Controls.length).toBe(118);
  });

  it('splits 25 Management System clauses', () => {
    expect(iso27001ManagementClauses.length).toBe(25);
    expect(iso27001ManagementClauses.every((c) => c.cat === 'Management System')).toBe(true);
  });

  it('splits 93 Annex A controls', () => {
    expect(iso27001AnnexA.length).toBe(93);
    expect(iso27001AnnexA.every((c) => c.cat !== 'Management System')).toBe(true);
  });

  it('all controls have non-empty id, name, isoDesc', () => {
    for (const c of iso27001Controls) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.isoDesc).toBeTruthy();
    }
  });

  it('all controls have unique IDs', () => {
    const ids = iso27001Controls.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Annex A controls carry ISO 27002 control type + security domain attributes', () => {
    // Per spec §11 and README — Annex A controls have ct + sd; clauses don't.
    const annexAWithAttrs = iso27001AnnexA.filter((c) => c.ct && c.sd);
    expect(annexAWithAttrs.length).toBeGreaterThan(80);
  });

  it('getIsoControl resolves known IDs', () => {
    expect(getIsoControl('A.5.1')?.name).toMatch(/Polic/i);
    expect(getIsoControl('4.1')?.cat).toBe('Management System');
    expect(getIsoControl('does-not-exist')).toBeUndefined();
  });

  it('category enum is exactly the 5 expected values', () => {
    const cats = new Set(iso27001Controls.map((c) => c.cat));
    expect(cats).toEqual(
      new Set(['Management System', 'Organizational', 'People', 'Physical', 'Technological']),
    );
  });
});
