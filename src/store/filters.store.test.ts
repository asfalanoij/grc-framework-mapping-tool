import { describe, it, expect, beforeEach } from 'vitest';
import { useFiltersStore } from './filters.store';

beforeEach(() => {
  useFiltersStore.getState().clearAll();
});

describe('useFiltersStore', () => {
  it('starts with no active filters', () => {
    expect(useFiltersStore.getState().hasAnyActiveFilter()).toBe(false);
    expect(useFiltersStore.getState().iso.categories).toEqual([]);
  });

  it('setQuery / clearAll work', () => {
    useFiltersStore.getState().setQuery('mfa');
    expect(useFiltersStore.getState().query).toBe('mfa');
    expect(useFiltersStore.getState().hasAnyActiveFilter()).toBe(true);
    useFiltersStore.getState().clearAll();
    expect(useFiltersStore.getState().query).toBe('');
    expect(useFiltersStore.getState().hasAnyActiveFilter()).toBe(false);
  });

  it('toggleIsoCategory adds then removes', () => {
    useFiltersStore.getState().toggleIsoCategory('Organizational');
    expect(useFiltersStore.getState().iso.categories).toEqual(['Organizational']);
    useFiltersStore.getState().toggleIsoCategory('Organizational');
    expect(useFiltersStore.getState().iso.categories).toEqual([]);
  });

  it('stacks multiple filter dimensions', () => {
    useFiltersStore.getState().toggleIsoCategory('Organizational');
    useFiltersStore.getState().toggleIsoControlType('Preventive');
    useFiltersStore.getState().toggleIsoSecurityDomain('Protection');
    useFiltersStore.getState().toggleIsoStatus('implemented');
    useFiltersStore.getState().toggleIsoNistFunction('GOVERN');
    expect(useFiltersStore.getState().hasAnyActiveFilter()).toBe(true);
    expect(useFiltersStore.getState().iso.controlTypes).toEqual(['Preventive']);
    expect(useFiltersStore.getState().iso.securityDomains).toEqual(['Protection']);
    expect(useFiltersStore.getState().iso.statuses).toEqual(['implemented']);
    expect(useFiltersStore.getState().iso.nistFunctions).toEqual(['GOVERN']);
  });

  it('clearAll resets every dimension', () => {
    useFiltersStore.getState().setQuery('x');
    useFiltersStore.getState().toggleIsoCategory('Physical');
    useFiltersStore.getState().clearAll();
    expect(useFiltersStore.getState().hasAnyActiveFilter()).toBe(false);
  });
});
