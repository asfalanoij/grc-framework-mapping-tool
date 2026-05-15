import { describe, it, expect } from 'vitest';
import { iso27017, iso27017Sections, iso27017Subsections } from './iso27017';

describe('ISO/IEC 27017:2015', () => {
  it('lists 14 top-level sections (matches legacy data)', () => {
    expect(iso27017.groups.length).toBe(14);
    expect(iso27017Sections.length).toBe(14);
  });

  it('exposes 9 subsections across sections', () => {
    expect(iso27017Subsections.length).toBe(9);
  });

  it('all section IDs are unique', () => {
    const ids = iso27017Sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
