import { createContext } from 'react';
import type { Persistence } from '../services/persistence';

// Context lives in its own non-tsx file so the Provider file (which uses JSX)
// can be component-only — keeps Vite's fast-refresh happy.
export const PersistenceContext = createContext<Persistence | null>(null);
