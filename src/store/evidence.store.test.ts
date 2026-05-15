import { describe, it, expect, beforeEach } from 'vitest';
import { useEvidenceStore, selectEvidenceFor } from './evidence.store';
import { createPersistence, type Persistence } from '../services/persistence';

let p: Persistence;
let i = 0;
beforeEach(() => {
  i += 1;
  p = createPersistence(`ctrlmap-evidence-store-${i}`);
  useEvidenceStore.getState().reset();
});

describe('useEvidenceStore', () => {
  it('hydrates from persistence', async () => {
    await p.evidence.upsert({
      id: 'ISO 27001::A.5.1',
      framework: 'ISO 27001',
      itemId: 'A.5.1',
      collected: Object.freeze({ 'Policy doc': true }),
      refs: Object.freeze({}),
      notes: '',
    });
    await useEvidenceStore.getState().hydrate(p, ['ISO 27001']);
    const row = selectEvidenceFor(useEvidenceStore.getState(), 'ISO 27001', 'A.5.1');
    expect(row.collected['Policy doc']).toBe(true);
  });

  it('toggleCheck adds and removes evidence flags', async () => {
    await useEvidenceStore.getState().toggleCheck(p, 'ISO 27001', 'A.5.1', 'Policy doc', true);
    expect(selectEvidenceFor(useEvidenceStore.getState(), 'ISO 27001', 'A.5.1').collected['Policy doc']).toBe(true);
    await useEvidenceStore.getState().toggleCheck(p, 'ISO 27001', 'A.5.1', 'Policy doc', false);
    expect(selectEvidenceFor(useEvidenceStore.getState(), 'ISO 27001', 'A.5.1').collected['Policy doc']).toBeUndefined();
  });

  it('setRef stores and clears doc references', async () => {
    await useEvidenceStore.getState().setRef(p, 'ISO 27001', 'A.5.1', 'Policy doc', 'sharepoint://policies/info-sec');
    expect(selectEvidenceFor(useEvidenceStore.getState(), 'ISO 27001', 'A.5.1').refs['Policy doc']).toBe(
      'sharepoint://policies/info-sec',
    );
    await useEvidenceStore.getState().setRef(p, 'ISO 27001', 'A.5.1', 'Policy doc', '');
    expect(selectEvidenceFor(useEvidenceStore.getState(), 'ISO 27001', 'A.5.1').refs['Policy doc']).toBeUndefined();
  });

  it('setNotes persists free-form notes', async () => {
    await useEvidenceStore.getState().setNotes(p, 'ISO 27001', 'A.5.1', 'Reviewed at quarterly audit');
    expect(selectEvidenceFor(useEvidenceStore.getState(), 'ISO 27001', 'A.5.1').notes).toBe('Reviewed at quarterly audit');
  });

  it('rolls back on persistence failure', async () => {
    p.db.close();
    await useEvidenceStore.getState().toggleCheck(p, 'ISO 27001', 'A.5.1', 'Policy doc', true);
    expect(selectEvidenceFor(useEvidenceStore.getState(), 'ISO 27001', 'A.5.1').collected['Policy doc']).toBeUndefined();
    expect(useEvidenceStore.getState().lastError).not.toBeNull();
  });

  it('selectEvidenceFor returns an empty row for unknown keys', () => {
    const r = selectEvidenceFor(useEvidenceStore.getState(), 'ISO 27001', 'unknown');
    expect(r.notes).toBe('');
    expect(r.collected).toEqual({});
  });
});
