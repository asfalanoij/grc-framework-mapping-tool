import { describe, it, expect } from 'vitest';
import { isoEvidenceTemplates, getEvidenceTemplate } from './evidence-templates';

describe('ISO evidence templates', () => {
  it('keyed by all 118 ISO control IDs', () => {
    expect(Object.keys(isoEvidenceTemplates).length).toBe(118);
  });

  it('every template is a non-empty array of strings', () => {
    for (const [id, items] of Object.entries(isoEvidenceTemplates)) {
      expect(Array.isArray(items), `template for ${id} should be an array`).toBe(true);
      expect(items.length, `template for ${id} should be non-empty`).toBeGreaterThan(0);
      expect(items.every((s) => typeof s === 'string' && s.length > 0)).toBe(true);
    }
  });

  it('getEvidenceTemplate returns the same array for known IDs', () => {
    const a51 = getEvidenceTemplate('A.5.1');
    expect(a51.length).toBeGreaterThan(0);
    expect(getEvidenceTemplate('does-not-exist').length).toBe(0);
  });
});
