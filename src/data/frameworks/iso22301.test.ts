import { describe, it, expect } from 'vitest';
import { iso22301, iso22301Clauses, iso22301Subclauses } from './iso22301';

describe('ISO 22301:2019', () => {
  it('lists 7 top-level clause groups (matches legacy data)', () => {
    expect(iso22301.groups.length).toBe(7);
    expect(iso22301Clauses.length).toBe(7);
  });

  it('exposes 5 sub-clause items across clauses', () => {
    // Legacy data carries a small number of nested sub-clauses.
    expect(iso22301Subclauses.length).toBe(5);
  });

  it('all clause IDs are unique', () => {
    const ids = iso22301Clauses.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
