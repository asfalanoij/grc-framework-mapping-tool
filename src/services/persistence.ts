// Dexie/IndexedDB persistence layer. Per spec §9, every write is
// wrapped in try/catch and returns a Result so callers can degrade
// gracefully instead of crashing the UI.

import Dexie, { type Table } from 'dexie';
import { err, ok, type Result } from '../domain/result';
import type { Status } from '../domain/scoring';

export type RepoError = 'idb-unavailable' | 'idb-write-failed' | 'idb-read-failed';

export interface ScoreRow {
  readonly id: string; // `${framework}::${itemId}`
  readonly framework: string;
  readonly itemId: string;
  readonly status: Status;
}

export interface EvidenceRow {
  readonly id: string; // `${framework}::${itemId}`
  readonly framework: string;
  readonly itemId: string;
  readonly collected: Readonly<Record<string, true>>;
  readonly refs: Readonly<Record<string, string>>;
  readonly notes: string;
}

export interface JustificationRow {
  readonly controlId: string;
  readonly text: string;
}

export interface UiPrefRow {
  readonly key: string;
  readonly value: unknown;
}

export interface MetaRow {
  readonly key: string;
  readonly value: unknown;
}

export class GrcSuiteDb extends Dexie {
  scores!: Table<ScoreRow, string>;
  evidence!: Table<EvidenceRow, string>;
  justifications!: Table<JustificationRow, string>;
  uiPrefs!: Table<UiPrefRow, string>;
  migrationMeta!: Table<MetaRow, string>;

  constructor(name = 'grc-suite-v01') {
    super(name);
    this.version(1).stores({
      scores: '&id, framework, itemId',
      evidence: '&id, framework, itemId',
      justifications: '&controlId',
      uiPrefs: '&key',
      migrationMeta: '&key',
    });
  }
}

export function scoreRowId(framework: string, itemId: string): string {
  return `${framework}::${itemId}`;
}

// ───────────────────────────────────────────────────────────────
// Repositories — all methods return Result<T, RepoError>
// ───────────────────────────────────────────────────────────────

export class ScoresRepo {
  constructor(private readonly db: GrcSuiteDb) {}

  async getAll(framework: string): Promise<Result<Readonly<Record<string, Status>>, RepoError>> {
    try {
      const rows = await this.db.scores.where('framework').equals(framework).toArray();
      const map: Record<string, Status> = {};
      for (const r of rows) map[r.itemId] = r.status;
      return ok(Object.freeze(map));
    } catch {
      return err('idb-read-failed');
    }
  }

  async setScore(
    framework: string,
    itemId: string,
    status: Status,
  ): Promise<Result<void, RepoError>> {
    try {
      await this.db.scores.put({ id: scoreRowId(framework, itemId), framework, itemId, status });
      return ok(undefined);
    } catch {
      return err('idb-write-failed');
    }
  }

  async deleteScore(framework: string, itemId: string): Promise<Result<void, RepoError>> {
    try {
      await this.db.scores.delete(scoreRowId(framework, itemId));
      return ok(undefined);
    } catch {
      return err('idb-write-failed');
    }
  }

  async resetFramework(framework: string): Promise<Result<void, RepoError>> {
    try {
      await this.db.scores.where('framework').equals(framework).delete();
      return ok(undefined);
    } catch {
      return err('idb-write-failed');
    }
  }
}

export class EvidenceRepo {
  constructor(private readonly db: GrcSuiteDb) {}

  async getForFramework(framework: string): Promise<Result<readonly EvidenceRow[], RepoError>> {
    try {
      const rows = await this.db.evidence.where('framework').equals(framework).toArray();
      return ok(Object.freeze(rows));
    } catch {
      return err('idb-read-failed');
    }
  }

  async upsert(row: EvidenceRow): Promise<Result<void, RepoError>> {
    try {
      await this.db.evidence.put(row);
      return ok(undefined);
    } catch {
      return err('idb-write-failed');
    }
  }
}

export class JustificationsRepo {
  constructor(private readonly db: GrcSuiteDb) {}

  async getAll(): Promise<Result<Readonly<Record<string, string>>, RepoError>> {
    try {
      const rows = await this.db.justifications.toArray();
      const map: Record<string, string> = {};
      for (const r of rows) map[r.controlId] = r.text;
      return ok(Object.freeze(map));
    } catch {
      return err('idb-read-failed');
    }
  }

  async set(controlId: string, text: string): Promise<Result<void, RepoError>> {
    try {
      if (text.length === 0) {
        await this.db.justifications.delete(controlId);
      } else {
        await this.db.justifications.put({ controlId, text });
      }
      return ok(undefined);
    } catch {
      return err('idb-write-failed');
    }
  }
}

export class UiPrefsRepo {
  constructor(private readonly db: GrcSuiteDb) {}

  async get<T>(key: string): Promise<Result<T | undefined, RepoError>> {
    try {
      const row = await this.db.uiPrefs.get(key);
      return ok(row?.value as T | undefined);
    } catch {
      return err('idb-read-failed');
    }
  }

  async set<T>(key: string, value: T): Promise<Result<void, RepoError>> {
    try {
      await this.db.uiPrefs.put({ key, value });
      return ok(undefined);
    } catch {
      return err('idb-write-failed');
    }
  }
}

export class MigrationMetaRepo {
  constructor(private readonly db: GrcSuiteDb) {}

  async get<T>(key: string): Promise<Result<T | undefined, RepoError>> {
    try {
      const row = await this.db.migrationMeta.get(key);
      return ok(row?.value as T | undefined);
    } catch {
      return err('idb-read-failed');
    }
  }

  async set<T>(key: string, value: T): Promise<Result<void, RepoError>> {
    try {
      await this.db.migrationMeta.put({ key, value });
      return ok(undefined);
    } catch {
      return err('idb-write-failed');
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Factory — one DB per app run; tests pass a unique name to isolate.
// ───────────────────────────────────────────────────────────────

export interface Persistence {
  readonly db: GrcSuiteDb;
  readonly scores: ScoresRepo;
  readonly evidence: EvidenceRepo;
  readonly justifications: JustificationsRepo;
  readonly uiPrefs: UiPrefsRepo;
  readonly migrationMeta: MigrationMetaRepo;
}

export function createPersistence(dbName = 'grc-suite-v01'): Persistence {
  const db = new GrcSuiteDb(dbName);
  return {
    db,
    scores: new ScoresRepo(db),
    evidence: new EvidenceRepo(db),
    justifications: new JustificationsRepo(db),
    uiPrefs: new UiPrefsRepo(db),
    migrationMeta: new MigrationMetaRepo(db),
  };
}
