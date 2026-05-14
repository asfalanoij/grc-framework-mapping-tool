import { describe, it, expect } from 'vitest';
import { nistCsf2, nistCsf2Subcategories } from './nist-csf-2';

describe('NIST CSF 2.0 data', () => {
  it('has 6 Functions at the top of the hierarchy', () => {
    expect(nistCsf2.groups.length).toBe(6);
    const functionIds = nistCsf2.groups.map((g) => g.id);
    expect(functionIds).toEqual(expect.arrayContaining(['GV', 'ID', 'PR', 'DE', 'RS', 'RC']));
  });

  it('contains exactly 106 subcategories (leaf items)', () => {
    expect(nistCsf2Subcategories.length).toBe(106);
  });

  it('has 22 categories across all functions', () => {
    const catCount = nistCsf2.groups.reduce((acc, g) => acc + (g.sections?.length ?? 0), 0);
    expect(catCount).toBe(22);
  });

  it('all subcategory IDs are unique', () => {
    const ids = nistCsf2Subcategories.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('GOVERN function is first and exposes subcategories', () => {
    const govern = nistCsf2.groups[0];
    expect(govern?.id).toBe('GV');
    expect(govern?.sections?.length).toBeGreaterThan(0);
  });
});
