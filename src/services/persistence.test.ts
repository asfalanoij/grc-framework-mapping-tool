import { describe, it, expect, beforeEach } from 'vitest';
import { createPersistence, type Persistence } from './persistence';

let p: Persistence;
let dbCounter = 0;
beforeEach(async () => {
  // Fresh DB per test, otherwise fake-indexeddb persists between cases.
  dbCounter += 1;
  p = createPersistence(`ctrlmap-test-${dbCounter}`);
});

describe('ScoresRepo', () => {
  it('round-trips a score', async () => {
    const set = await p.scores.setScore('ISO 27001', 'A.5.1', 'implemented');
    expect(set.ok).toBe(true);
    const all = await p.scores.getAll('ISO 27001');
    expect(all.ok).toBe(true);
    if (all.ok) expect(all.value).toEqual({ 'A.5.1': 'implemented' });
  });

  it('isolates scores by framework', async () => {
    await p.scores.setScore('ISO 27001', 'A.5.1', 'implemented');
    await p.scores.setScore('NIST CSF 2.0', 'GV.OC-01', 'in-progress');
    const iso = await p.scores.getAll('ISO 27001');
    const nist = await p.scores.getAll('NIST CSF 2.0');
    if (iso.ok && nist.ok) {
      expect(Object.keys(iso.value)).toEqual(['A.5.1']);
      expect(Object.keys(nist.value)).toEqual(['GV.OC-01']);
    }
  });

  it('deletes a single score', async () => {
    await p.scores.setScore('ISO 27001', 'A.5.1', 'implemented');
    const del = await p.scores.deleteScore('ISO 27001', 'A.5.1');
    expect(del.ok).toBe(true);
    const all = await p.scores.getAll('ISO 27001');
    if (all.ok) expect(all.value).toEqual({});
  });

  it('resets every score in a framework but keeps others', async () => {
    await p.scores.setScore('ISO 27001', 'A.5.1', 'implemented');
    await p.scores.setScore('ISO 27001', 'A.5.2', 'in-progress');
    await p.scores.setScore('NIST CSF 2.0', 'GV.OC-01', 'implemented');
    await p.scores.resetFramework('ISO 27001');
    const iso = await p.scores.getAll('ISO 27001');
    const nist = await p.scores.getAll('NIST CSF 2.0');
    if (iso.ok && nist.ok) {
      expect(iso.value).toEqual({});
      expect(Object.keys(nist.value)).toEqual(['GV.OC-01']);
    }
  });

  it('overwrites on repeated setScore calls', async () => {
    await p.scores.setScore('ISO 27001', 'A.5.1', 'in-progress');
    await p.scores.setScore('ISO 27001', 'A.5.1', 'implemented');
    const all = await p.scores.getAll('ISO 27001');
    if (all.ok) expect(all.value['A.5.1']).toBe('implemented');
  });
});

describe('EvidenceRepo', () => {
  it('round-trips an evidence row', async () => {
    const row = {
      id: 'ISO 27001::A.5.1',
      framework: 'ISO 27001',
      itemId: 'A.5.1',
      collected: Object.freeze({ 'Policy doc': true as const }),
      refs: Object.freeze({ 'Policy doc': 'https://example.invalid/policy' }),
      notes: 'reviewed 2026-01-01',
    };
    const up = await p.evidence.upsert(row);
    expect(up.ok).toBe(true);
    const get = await p.evidence.getForFramework('ISO 27001');
    if (get.ok) {
      expect(get.value).toHaveLength(1);
      expect(get.value[0]?.notes).toBe('reviewed 2026-01-01');
    }
  });
});

describe('JustificationsRepo', () => {
  it('writes and reads justification text', async () => {
    await p.justifications.set('A.5.1', 'We do not handle PII');
    const all = await p.justifications.getAll();
    if (all.ok) expect(all.value['A.5.1']).toBe('We do not handle PII');
  });

  it('deletes the row when text is empty', async () => {
    await p.justifications.set('A.5.1', 'temp');
    await p.justifications.set('A.5.1', '');
    const all = await p.justifications.getAll();
    if (all.ok) expect(all.value['A.5.1']).toBeUndefined();
  });
});

describe('UiPrefsRepo + MigrationMetaRepo', () => {
  it('persists arbitrary key/value pairs', async () => {
    await p.uiPrefs.set('theme', 'light');
    const g = await p.uiPrefs.get<string>('theme');
    if (g.ok) expect(g.value).toBe('light');
  });

  it('returns undefined for missing keys', async () => {
    const g = await p.uiPrefs.get<string>('missing');
    if (g.ok) expect(g.value).toBeUndefined();
  });

  it('migrationMeta supports version tagging', async () => {
    await p.migrationMeta.set('localStorageV1Migrated', 1);
    const g = await p.migrationMeta.get<number>('localStorageV1Migrated');
    if (g.ok) expect(g.value).toBe(1);
  });
});
