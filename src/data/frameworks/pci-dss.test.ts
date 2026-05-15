import { describe, it, expect } from 'vitest';
import { pciDss, pciDssRequirements } from './pci-dss';

describe('PCI DSS 4.0.1', () => {
  it('lists 12 top-level Requirements', () => {
    expect(pciDss.groups.length).toBe(12);
    expect(pciDssRequirements.length).toBe(12);
  });

  it('all Requirement IDs are unique', () => {
    const ids = pciDssRequirements.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every Requirement has a non-empty name and desc', () => {
    for (const r of pciDssRequirements) {
      expect(r.name).toBeTruthy();
      expect(r.desc).toBeTruthy();
    }
  });
});
