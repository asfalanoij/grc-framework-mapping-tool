import { describe, it, expect } from 'vitest';
import { frameworkRegistry, getFrameworkByName } from './framework-registry';

describe('Framework registry', () => {
  it('lists exactly 11 frameworks (ISO 27001 + 10 cross-mapped)', () => {
    expect(frameworkRegistry.length).toBe(11);
  });

  it('ISO 27001 is the spine (prop=id)', () => {
    const iso = getFrameworkByName('ISO 27001');
    expect(iso?.prop).toBe('id');
  });

  it('all 10 non-ISO frameworks reference a property on the ISO control', () => {
    const expectedProps = new Set([
      'nistSub', 'soc2', 'cis', 'pci', 'ce', 'n80053', 'nis2', 'iso22301', 'iso27017', 'caf',
    ]);
    const actualProps = new Set(
      frameworkRegistry.filter((f) => f.id !== 'ISO 27001').map((f) => f.prop),
    );
    expect(actualProps).toEqual(expectedProps);
  });
});
