import { describe, it, expect } from 'vitest';
import { buildIsoCsv, buildSoaCsv } from './isoExporter';
import { iso27001Controls } from '../../data/frameworks/iso27001';

const baseInputs = {
  scores: {} as Record<string, never>,
  evidenceByKey: {} as Record<string, never>,
  justifications: {} as Record<string, never>,
};

describe('buildIsoCsv', () => {
  it('contains a BOM + header row', () => {
    const out = buildIsoCsv(baseInputs);
    expect(out.startsWith('\uFEFF')).toBe(true);
    expect(out.split('\r\n')[0]).toMatch(/^\uFEFFID,Name,Category/);
  });

  it('emits 119 rows: header + 118 controls', () => {
    const out = buildIsoCsv(baseInputs);
    const lines = out.replace(/^\uFEFF/, '').split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(119);
  });

  it('renders Implementation Status for each scored control', () => {
    const inputs = {
      ...baseInputs,
      scores: { 'A.5.1': 'implemented' } as const,
    };
    const out = buildIsoCsv(inputs);
    expect(out).toContain('Implemented');
  });

  it('renders SoA Justification when control is NA', () => {
    const inputs = {
      ...baseInputs,
      scores: { 'A.5.1': 'na' } as const,
      justifications: { 'A.5.1': 'No card data handled' },
    };
    const out = buildIsoCsv(inputs);
    expect(out).toContain('No card data handled');
  });

  it('honours a custom filtered control list', () => {
    const subset = iso27001Controls.slice(0, 3);
    const out = buildIsoCsv({ ...baseInputs, controls: subset });
    const lines = out.replace(/^\uFEFF/, '').split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(4); // header + 3
  });
});

describe('buildSoaCsv', () => {
  it('always emits 94 lines (header + 93 Annex A controls)', () => {
    const out = buildSoaCsv(baseInputs);
    const lines = out.replace(/^\uFEFF/, '').split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(94);
  });

  it('SoA Applicable=No only when status is na', () => {
    const inputs = {
      ...baseInputs,
      scores: { 'A.5.1': 'na', 'A.5.2': 'implemented' } as const,
      justifications: { 'A.5.1': 'reason' },
    };
    const out = buildSoaCsv(inputs);
    expect(out).toMatch(/A\.5\.1[^]*?,No,reason/);
    expect(out).toMatch(/A\.5\.2[^]*?,Yes,/);
  });

  it('management system clauses are excluded', () => {
    const out = buildSoaCsv(baseInputs);
    // 4.1 is a Management System clause; it must NOT appear.
    expect(out).not.toMatch(/^4\.1,/m);
    // A.5.1 is the first Annex A control; it MUST appear.
    expect(out).toMatch(/\bA\.5\.1\b/);
  });
});
