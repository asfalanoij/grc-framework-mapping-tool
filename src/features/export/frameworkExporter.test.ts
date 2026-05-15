import { describe, it, expect } from 'vitest';
import { buildFrameworkCsv, buildCafCsv } from './frameworkExporter';
import { nistCsf2 } from '../../data/frameworks/nist-csf-2';
import { pciDss } from '../../data/frameworks/pci-dss';
import { ncscCaf } from '../../data/frameworks/ncsc-caf';

describe('buildFrameworkCsv — hierarchical (NIST CSF)', () => {
  it('emits 107 lines (header + 106 subcategories)', () => {
    const out = buildFrameworkCsv(nistCsf2, {
      framework: 'NIST CSF 2.0',
      scores: {},
      evidenceByKey: {},
    });
    const lines = out.replace(/^\uFEFF/, '').split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(107);
  });

  it('renders Implementation Status for scored items', () => {
    const out = buildFrameworkCsv(nistCsf2, {
      framework: 'NIST CSF 2.0',
      scores: { 'GV.OC-01': 'implemented' },
      evidenceByKey: {},
    });
    expect(out).toContain('Implemented');
  });

  it('renders reverse-mapped ISO controls for known refs', () => {
    const out = buildFrameworkCsv(nistCsf2, {
      framework: 'NIST CSF 2.0',
      scores: {},
      evidenceByKey: {},
    });
    // GV.OC-01 lives on 4.1 in the legacy data; the row should reference 4.1.
    expect(out).toMatch(/GV\.OC-01[^\r\n]*4\.1/);
  });
});

describe('buildFrameworkCsv — flat (PCI DSS)', () => {
  it('emits 13 lines (header + 12 requirements)', () => {
    const out = buildFrameworkCsv(pciDss, {
      framework: 'PCI DSS',
      scores: {},
      evidenceByKey: {},
    });
    const lines = out.replace(/^\uFEFF/, '').split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(13);
  });
});

describe('buildCafCsv (bespoke 3-level)', () => {
  it('emits 42 lines (header + 41 outcomes)', () => {
    const out = buildCafCsv(ncscCaf, {
      framework: 'NCSC CAF',
      scores: {},
      evidenceByKey: {},
    });
    const lines = out.replace(/^\uFEFF/, '').split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(42);
  });

  it('A1.a outcome appears in the output', () => {
    const out = buildCafCsv(ncscCaf, {
      framework: 'NCSC CAF',
      scores: {},
      evidenceByKey: {},
    });
    expect(out).toMatch(/\bA1\.a\b/);
  });
});
