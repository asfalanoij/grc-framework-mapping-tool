import { describe, it, expect } from 'vitest';
import { nis2, nis2Measures } from './nis2';

describe('NIS 2 Directive', () => {
  it('lists exactly 10 Article 21 security measures (a)-(j)', () => {
    expect(nis2.groups.length).toBe(10);
    expect(nis2Measures.length).toBe(10);
  });

  it('all measure IDs are unique', () => {
    const ids = nis2Measures.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
