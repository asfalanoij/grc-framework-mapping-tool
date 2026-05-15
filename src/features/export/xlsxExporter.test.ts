import { describe, it, expect } from 'vitest';
import { buildIsoXlsx, buildFrameworkXlsx, buildCafXlsx } from './xlsxExporter';
import { nistCsf2 } from '../../data/frameworks/nist-csf-2';
import { ncscCaf } from '../../data/frameworks/ncsc-caf';

// XLSX files start with a ZIP signature (0x50 0x4B 0x03 0x04 = "PK\3\4").
function isXlsxBlob(bytes: Uint8Array): boolean {
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

describe('buildIsoXlsx', () => {
  it('produces a valid XLSX (ZIP-signed) blob', async () => {
    const out = await buildIsoXlsx({
      scores: {},
      evidenceByKey: {},
      justifications: {},
    });
    expect(isXlsxBlob(out)).toBe(true);
    expect(out.length).toBeGreaterThan(1000);
  });
});

describe('buildFrameworkXlsx', () => {
  it('produces a valid XLSX for a hierarchy framework', async () => {
    const out = await buildFrameworkXlsx(nistCsf2, {
      framework: 'NIST CSF 2.0',
      scores: {},
      evidenceByKey: {},
    });
    expect(isXlsxBlob(out)).toBe(true);
  });
});

describe('buildCafXlsx', () => {
  it('produces a valid XLSX for the CAF hierarchy', async () => {
    const out = await buildCafXlsx(ncscCaf, {
      framework: 'NCSC CAF',
      scores: {},
      evidenceByKey: {},
    });
    expect(isXlsxBlob(out)).toBe(true);
  });
});
