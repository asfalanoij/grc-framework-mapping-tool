import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PersistenceProvider } from './persistence-context';
import { Home } from '../features/home/Home';
import { Iso27001View } from '../features/frameworks/Iso27001View';
import { SearchBar } from '../features/search/SearchBar';

const basename = import.meta.env.PROD ? '/grc-framework-mapping-tool' : '/';

export function App() {
  return (
    <PersistenceProvider>
      <BrowserRouter basename={basename}>
        <div className="flex min-h-full flex-col">
          <header className="border-b border-border bg-surface px-6 py-3">
            <div className="flex items-center justify-between gap-6">
              <nav className="flex items-center gap-6" aria-label="Primary">
                <NavLink to="/" className="text-lg font-semibold text-brand-text">
                  CtrlMap v2
                </NavLink>
                <ul className="flex gap-3 text-sm text-ink-2">
                  <li>
                    <NavLink
                      to="/iso27001"
                      className={({ isActive }) =>
                        isActive ? 'text-brand-text underline' : 'hover:text-brand-text'
                      }
                    >
                      ISO 27001
                    </NavLink>
                  </li>
                </ul>
              </nav>
              <SearchBar />
            </div>
          </header>
          <main className="flex-1 bg-bg" data-testid="app-shell">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/iso27001" element={<Iso27001View />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </PersistenceProvider>
  );
}
