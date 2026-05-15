import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from './ui.store';
import { createPersistence, type Persistence } from '../services/persistence';

let p: Persistence;
let i = 0;
beforeEach(() => {
  i += 1;
  p = createPersistence(`grc-suite-ui-store-${i}`);
  // Reset to defaults between tests.
  useUiStore.setState({
    theme: 'dark',
    activeFramework: 'ISO 27001',
    tourSeen: false,
    lastError: null,
  });
});

describe('useUiStore', () => {
  it('hydrate falls back to defaults when prefs are unset', async () => {
    await useUiStore.getState().hydrate(p);
    expect(useUiStore.getState().theme).toBe('dark');
    expect(useUiStore.getState().activeFramework).toBe('ISO 27001');
    expect(useUiStore.getState().tourSeen).toBe(false);
  });

  it('persists theme changes', async () => {
    await useUiStore.getState().setTheme(p, 'light');
    expect(useUiStore.getState().theme).toBe('light');
    const g = await p.uiPrefs.get<string>('theme');
    if (g.ok) expect(g.value).toBe('light');
  });

  it('persists active framework', async () => {
    await useUiStore.getState().setActiveFramework(p, 'NIST CSF 2.0');
    expect(useUiStore.getState().activeFramework).toBe('NIST CSF 2.0');
  });

  it('marks tour seen', async () => {
    await useUiStore.getState().markTourSeen(p);
    expect(useUiStore.getState().tourSeen).toBe(true);
  });

  it('hydrate restores persisted values', async () => {
    await p.uiPrefs.set('theme', 'light');
    await p.uiPrefs.set('activeFramework', 'NCSC CAF');
    await p.uiPrefs.set('tourSeen', true);
    await useUiStore.getState().hydrate(p);
    expect(useUiStore.getState().theme).toBe('light');
    expect(useUiStore.getState().activeFramework).toBe('NCSC CAF');
    expect(useUiStore.getState().tourSeen).toBe(true);
  });

  it('rolls back theme on persistence failure', async () => {
    p.db.close();
    await useUiStore.getState().setTheme(p, 'light');
    expect(useUiStore.getState().theme).toBe('dark');
    expect(useUiStore.getState().lastError).not.toBeNull();
  });

  it('rolls back activeFramework on persistence failure', async () => {
    p.db.close();
    await useUiStore.getState().setActiveFramework(p, 'NIST CSF 2.0');
    expect(useUiStore.getState().activeFramework).toBe('ISO 27001');
  });

  it('rolls back tourSeen on persistence failure', async () => {
    p.db.close();
    await useUiStore.getState().markTourSeen(p);
    expect(useUiStore.getState().tourSeen).toBe(false);
  });
});
