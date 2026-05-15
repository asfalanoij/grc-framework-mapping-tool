import { describe, it, expect, beforeEach } from 'vitest';
import { useScoresStore } from './scores.store';
import { createPersistence, type Persistence } from '../services/persistence';

let p: Persistence;
let i = 0;
beforeEach(() => {
  i += 1;
  p = createPersistence(`ctrlmap-scores-store-${i}`);
  useScoresStore.getState().reset();
});

describe('useScoresStore', () => {
  it('hydrates from persistence', async () => {
    await p.scores.setScore('ISO 27001', 'A.5.1', 'implemented');
    await useScoresStore.getState().hydrate(p, ['ISO 27001']);
    expect(useScoresStore.getState().byFramework['ISO 27001']?.['A.5.1']).toBe('implemented');
  });

  it('optimistically updates and persists', async () => {
    await useScoresStore.getState().setScore(p, 'ISO 27001', 'A.5.1', 'implemented');
    expect(useScoresStore.getState().byFramework['ISO 27001']?.['A.5.1']).toBe('implemented');
    const r = await p.scores.getAll('ISO 27001');
    if (r.ok) expect(r.value['A.5.1']).toBe('implemented');
  });

  it('rolls back when persistence fails', async () => {
    // Close the underlying DB to force write failures.
    p.db.close();
    await useScoresStore.getState().setScore(p, 'ISO 27001', 'A.5.1', 'implemented');
    const state = useScoresStore.getState();
    expect(state.byFramework['ISO 27001']?.['A.5.1']).toBeUndefined();
    expect(state.lastError).not.toBeNull();
  });

  it('reset() clears state', async () => {
    await useScoresStore.getState().setScore(p, 'ISO 27001', 'A.5.1', 'implemented');
    useScoresStore.getState().reset();
    expect(useScoresStore.getState().byFramework).toEqual({});
  });
});
