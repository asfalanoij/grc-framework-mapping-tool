import { describe, it, expect } from 'vitest';
import { nist80053, nist80053Families } from './nist-800-53';

describe('NIST SP 800-53 Rev 5', () => {
  it('lists exactly 20 control families', () => {
    expect(nist80053.groups.length).toBe(20);
    expect(nist80053Families.length).toBe(20);
  });

  it('all family IDs are unique', () => {
    const ids = nist80053Families.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each family carries a description', () => {
    expect(nist80053Families.every((f) => typeof f.desc === 'string' && f.desc.length > 0)).toBe(true);
  });
});
