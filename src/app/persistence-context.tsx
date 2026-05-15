import { useEffect, useState, type ReactNode } from 'react';
import { createPersistence, type Persistence } from '../services/persistence';
import { migrateLocalStorageToIdb } from '../services/migration';
import { PersistenceContext } from './persistence-context-value';

export interface PersistenceProviderProps {
  readonly children: ReactNode;
  // Test seam: lets specs inject a sandboxed Persistence + skip migration.
  readonly persistence?: Persistence;
  readonly skipMigration?: boolean;
}

export function PersistenceProvider({ children, persistence, skipMigration }: PersistenceProviderProps) {
  const [instance] = useState<Persistence>(() => persistence ?? createPersistence('ctrlmap'));
  const [migrated, setMigrated] = useState(skipMigration ?? false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    if (skipMigration || migrated) return;
    let cancelled = false;
    migrateLocalStorageToIdb(instance)
      .then((summary) => {
        if (cancelled) return;
        if (summary.errors.length > 0) {
          setMigrationError(summary.errors.join('; '));
        }
        setMigrated(true);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setMigrationError(e instanceof Error ? e.message : String(e));
        setMigrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [instance, migrated, skipMigration]);

  if (!migrated) {
    return (
      <div role="status" className="flex min-h-full items-center justify-center p-8 text-ink-3">
        Loading…
      </div>
    );
  }

  return (
    <PersistenceContext.Provider value={instance}>
      {migrationError ? (
        <div
          role="alert"
          className="bg-warning-50 px-4 py-2 text-sm text-warning-text"
          data-testid="migration-warning"
        >
          Some legacy data could not be imported: {migrationError}
        </div>
      ) : null}
      {children}
    </PersistenceContext.Provider>
  );
}
