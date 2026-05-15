import { describe, it, expect, beforeEach } from 'vitest';
import { useJustificationsStore } from './justifications.store';
import { createPersistence, type Persistence } from '../services/persistence';

let p: Persistence;
let i = 0;
beforeEach(() => {
  i += 1;
  p = createPersistence(`ctrlmap-just-store-${i}`);
  useJustificationsStore.getState().reset();
});

describe('useJustificationsStore', () => {
  it('hydrates from persistence', async () => {
    await p.justifications.set('A.5.1', 'reason');
    await useJustificationsStore.getState().hydrate(p);
    expect(useJustificationsStore.getState().byControl['A.5.1']).toBe('reason');
  });

  it('persists a new justification', async () => {
    await useJustificationsStore.getState().set(p, 'A.5.1', 'no PII handled');
    expect(useJustificationsStore.getState().byControl['A.5.1']).toBe('no PII handled');
  });

  it('removes the justification when text is empty', async () => {
    await useJustificationsStore.getState().set(p, 'A.5.1', 'temp');
    await useJustificationsStore.getState().set(p, 'A.5.1', '');
    expect(useJustificationsStore.getState().byControl['A.5.1']).toBeUndefined();
  });

  it('rolls back on persistence failure', async () => {
    p.db.close();
    await useJustificationsStore.getState().set(p, 'A.5.1', 'something');
    expect(useJustificationsStore.getState().byControl['A.5.1']).toBeUndefined();
    expect(useJustificationsStore.getState().lastError).not.toBeNull();
  });
});
