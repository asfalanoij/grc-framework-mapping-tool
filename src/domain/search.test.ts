import { describe, it, expect } from 'vitest';
import { buildIndex, search, autocompleteSuggestions, type Searchable } from './search';

const items: Searchable[] = [
  { id: 'A.5.1', name: 'Information security policies', desc: 'Policy framework', refs: ['CC1.1'] },
  { id: 'A.5.17', name: 'Authentication information', desc: 'MFA, password policy', refs: ['CC6.1'] },
  { id: 'A.8.5', name: 'Secure authentication', desc: 'MFA enforcement', refs: ['CC6.1', 'CIS 6'] },
  { id: 'A.9.4.3', name: 'Password management system', desc: 'Strong passwords', refs: [] },
];

describe('buildIndex', () => {
  it('builds parallel haystacks for each item', () => {
    const idx = buildIndex(items);
    expect(idx.items.length).toBe(4);
    expect(idx.haystacks.length).toBe(4);
  });
});

describe('search', () => {
  const idx = buildIndex(items);

  it('returns all items for an empty query', () => {
    expect(search(idx, '').length).toBe(4);
    expect(search(idx, '   ').length).toBe(4);
  });

  it('matches in name (case-insensitive)', () => {
    expect(search(idx, 'PASSWORD').map((i) => i.id).sort()).toEqual(['A.5.17', 'A.9.4.3']);
  });

  it('matches in id', () => {
    expect(search(idx, 'A.5.1').map((i) => i.id)).toEqual(['A.5.1', 'A.5.17']);
  });

  it('matches in desc', () => {
    expect(search(idx, 'MFA').map((i) => i.id).sort()).toEqual(['A.5.17', 'A.8.5']);
  });

  it('matches in refs', () => {
    expect(search(idx, 'CC6.1').map((i) => i.id).sort()).toEqual(['A.5.17', 'A.8.5']);
  });

  it('returns empty when nothing matches', () => {
    expect(search(idx, 'zzzzzzz')).toEqual([]);
  });
});

describe('autocompleteSuggestions', () => {
  const idx = buildIndex(items);

  it('returns empty for blank query', () => {
    expect(autocompleteSuggestions(idx, '')).toEqual([]);
    expect(autocompleteSuggestions(idx, '   ')).toEqual([]);
  });

  it('ranks exact id matches first', () => {
    const r = autocompleteSuggestions(idx, 'a.5.1');
    expect(r[0]?.id).toBe('A.5.1');
  });

  it('then prefix matches, then substring matches', () => {
    const r = autocompleteSuggestions(idx, 'a.5');
    expect(r.map((s) => s.id)).toEqual(['A.5.1', 'A.5.17']);
  });

  it('falls back to name substring matches (id+name only — not desc)', () => {
    // 'password' lives in A.9.4.3's NAME and in A.5.17's DESC.
    // Autocomplete intentionally ranks by id+name, not desc, so only A.9.4.3 surfaces.
    const r = autocompleteSuggestions(idx, 'password');
    expect(r.map((s) => s.id)).toEqual(['A.9.4.3']);
  });

  it('respects the limit', () => {
    const r = autocompleteSuggestions(idx, 'a', 2);
    expect(r.length).toBeLessThanOrEqual(2);
  });

  it('limit of 0 yields no results', () => {
    expect(autocompleteSuggestions(idx, 'a', 0)).toEqual([]);
  });

  it('negative limit is treated as 0', () => {
    expect(autocompleteSuggestions(idx, 'a', -5)).toEqual([]);
  });

  it('uses the default limit when none is supplied', () => {
    const r = autocompleteSuggestions(idx, 'a');
    expect(r.length).toBeLessThanOrEqual(10);
    expect(r.length).toBeGreaterThan(0);
  });

  it('indexes items without desc or refs (covers nullish-coalescing branches)', () => {
    const minimal: Searchable[] = [{ id: 'X.1', name: 'Bare item' }];
    const idx2 = buildIndex(minimal);
    expect(search(idx2, 'bare').map((i) => i.id)).toEqual(['X.1']);
  });
});
