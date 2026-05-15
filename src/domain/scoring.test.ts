import { describe, it, expect } from 'vitest';
import { computeReadiness, countByStatus, isStatus, type ScoresByItem } from './scoring';

describe('isStatus', () => {
  it('accepts the 4 enum values', () => {
    expect(isStatus('not-started')).toBe(true);
    expect(isStatus('in-progress')).toBe(true);
    expect(isStatus('implemented')).toBe(true);
    expect(isStatus('na')).toBe(true);
  });
  it('rejects anything else', () => {
    expect(isStatus('done')).toBe(false);
    expect(isStatus('')).toBe(false);
  });
});

describe('computeReadiness', () => {
  const ids = ['a', 'b', 'c', 'd'];

  it('returns the empty Readiness for an empty itemIds list', () => {
    const r = computeReadiness([], {});
    expect(r.total).toBe(0);
    expect(r.percentImplemented).toBe(0);
  });

  it('treats missing scores as not-started', () => {
    const r = computeReadiness(ids, {});
    expect(r.total).toBe(4);
    expect(r.notStarted).toBe(4);
    expect(r.implemented).toBe(0);
    expect(r.percentImplemented).toBe(0);
  });

  it('counts each status correctly', () => {
    const scores: ScoresByItem = {
      a: 'implemented',
      b: 'in-progress',
      c: 'na',
      d: 'not-started',
    };
    const r = computeReadiness(ids, scores);
    expect(r.implemented).toBe(1);
    expect(r.inProgress).toBe(1);
    expect(r.notApplicable).toBe(1);
    expect(r.notStarted).toBe(1);
    expect(r.applicable).toBe(3);
  });

  it('excludes N/A from the percent denominator', () => {
    // 2 implemented, 1 N/A, 1 not-started → 2 of 3 applicable = 66.7%
    const scores: ScoresByItem = {
      a: 'implemented',
      b: 'implemented',
      c: 'na',
      d: 'not-started',
    };
    const r = computeReadiness(ids, scores);
    expect(r.percentImplemented).toBe(66.7);
  });

  it('returns 0% when every item is N/A (no applicable denominator)', () => {
    const scores: ScoresByItem = { a: 'na', b: 'na', c: 'na', d: 'na' };
    const r = computeReadiness(ids, scores);
    expect(r.percentImplemented).toBe(0);
    expect(r.applicable).toBe(0);
  });

  it('returns 100% when every applicable item is implemented', () => {
    const scores: ScoresByItem = {
      a: 'implemented',
      b: 'implemented',
      c: 'na',
      d: 'implemented',
    };
    const r = computeReadiness(ids, scores);
    expect(r.percentImplemented).toBe(100);
  });

  it('ignores score entries for items outside itemIds', () => {
    const scores: ScoresByItem = { a: 'implemented', extraneous: 'implemented' };
    const r = computeReadiness(ids, scores);
    expect(r.implemented).toBe(1);
  });
});

describe('countByStatus', () => {
  const ids = ['a', 'b', 'c'];
  const scores: ScoresByItem = { a: 'implemented', b: 'in-progress', c: 'na' };

  it('counts items in a given status', () => {
    expect(countByStatus(ids, scores, 'implemented')).toBe(1);
    expect(countByStatus(ids, scores, 'in-progress')).toBe(1);
    expect(countByStatus(ids, scores, 'na')).toBe(1);
    expect(countByStatus(ids, scores, 'not-started')).toBe(0);
  });

  it('treats missing scores as not-started', () => {
    expect(countByStatus(ids, {}, 'not-started')).toBe(3);
  });
});
