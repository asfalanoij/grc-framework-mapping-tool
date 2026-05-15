import { describe, it, expect } from 'vitest';
import { ncscCaf, ncscCafObjectives, ncscCafPrinciples, ncscCafOutcomes } from './ncsc-caf';

describe('NCSC CAF', () => {
  it('has 4 Objectives (A, B, C, D)', () => {
    expect(ncscCaf.objectives.length).toBe(4);
    expect(ncscCafObjectives.length).toBe(4);
    expect(ncscCafObjectives.map((o) => o.id)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('has 14 Principles across all Objectives', () => {
    expect(ncscCafPrinciples.length).toBe(14);
  });

  it('has 41 Contributing Outcomes across all Principles', () => {
    expect(ncscCafOutcomes.length).toBe(41);
  });

  it('every Outcome carries its IGP "achieved" criteria', () => {
    expect(ncscCafOutcomes.every((o) => Array.isArray(o.achieved) && o.achieved.length > 0)).toBe(true);
  });

  it('all Outcome IDs are unique', () => {
    const ids = ncscCafOutcomes.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('A1.a (Board Direction) is the first outcome', () => {
    const a1a = ncscCafOutcomes.find((o) => o.id === 'A1.a');
    expect(a1a?.name).toMatch(/board/i);
  });
});
