import { describe, it, expect } from 'vitest';
import * as domain from './index';

// Barrel smoke: ensure the public surface of the domain layer is
// re-exported correctly. Hits every export line for coverage.
describe('domain barrel', () => {
  it('re-exports result helpers', () => {
    expect(typeof domain.ok).toBe('function');
    expect(typeof domain.err).toBe('function');
    expect(typeof domain.isOk).toBe('function');
    expect(typeof domain.isErr).toBe('function');
    expect(typeof domain.map).toBe('function');
    expect(typeof domain.unwrapOr).toBe('function');
  });

  it('re-exports mapping-engine helpers', () => {
    expect(typeof domain.parseCrossRefs).toBe('function');
    expect(typeof domain.isFrameworkPropKey).toBe('function');
    expect(typeof domain.getMappingsForControl).toBe('function');
    expect(typeof domain.getIsoControlsForRef).toBe('function');
    expect(typeof domain.getTransitiveMappings).toBe('function');
    expect(typeof domain.resolveTransitive).toBe('function');
    expect(Array.isArray(domain.frameworkPropKeys)).toBe(true);
  });

  it('re-exports scoring helpers', () => {
    expect(typeof domain.computeReadiness).toBe('function');
    expect(typeof domain.countByStatus).toBe('function');
    expect(typeof domain.isStatus).toBe('function');
    expect(Array.isArray(domain.statusValues)).toBe(true);
  });

  it('re-exports filters helpers', () => {
    expect(typeof domain.and).toBe('function');
    expect(typeof domain.or).toBe('function');
    expect(typeof domain.not).toBe('function');
    expect(typeof domain.applyFilters).toBe('function');
    expect(typeof domain.byIsoCategory).toBe('function');
    expect(typeof domain.byControlType).toBe('function');
    expect(typeof domain.bySecurityDomain).toBe('function');
    expect(typeof domain.byNistFunction).toBe('function');
    expect(typeof domain.byStatus).toBe('function');
    expect(typeof domain.TRUE).toBe('function');
  });

  it('re-exports search helpers', () => {
    expect(typeof domain.buildIndex).toBe('function');
    expect(typeof domain.search).toBe('function');
    expect(typeof domain.autocompleteSuggestions).toBe('function');
  });
});
