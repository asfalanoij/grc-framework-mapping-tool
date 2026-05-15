import { useContext } from 'react';
import { PersistenceContext } from './persistence-context-value';
import type { Persistence } from '../services/persistence';

export function usePersistence(): Persistence {
  const ctx = useContext(PersistenceContext);
  if (!ctx) throw new Error('usePersistence must be used inside <PersistenceProvider>');
  return ctx;
}
