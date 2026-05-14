import { describe, it, expect } from 'vitest';
import { soc2, soc2Criteria } from './soc2';

describe('SOC 2 Trust Services Criteria', () => {
  it('contains exactly 61 criteria', () => {
    expect(soc2Criteria.length).toBe(61);
  });

  it('groups span the 5 Trust Services Categories', () => {
    expect(soc2.groups.length).toBe(5);
  });

  it('CC1.1 (first Common Criteria) is present', () => {
    expect(soc2Criteria.find((c) => c.id === 'CC1.1')).toBeDefined();
  });

  it('all criterion IDs are unique', () => {
    const ids = soc2Criteria.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
