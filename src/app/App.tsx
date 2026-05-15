import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PersistenceProvider } from './persistence-context';
import { Home } from '../features/home/Home';
import { Iso27001View } from '../features/frameworks/Iso27001View';
import { SearchBar } from '../features/search/SearchBar';
import { BentoProfileCard } from '../features/profile/BentoProfileCard';

const NistCsfView = lazy(() => import('../features/frameworks/NistCsfView'));
const Soc2View = lazy(() => import('../features/frameworks/Soc2View'));
const CisV8View = lazy(() => import('../features/frameworks/CisV8View'));
const CyberEssentialsView = lazy(() => import('../features/frameworks/CyberEssentialsView'));
const PciDssView = lazy(() => import('../features/frameworks/PciDssView'));
const Nist80053View = lazy(() => import('../features/frameworks/Nist80053View'));
const Nis2View = lazy(() => import('../features/frameworks/Nis2View'));
const Iso22301View = lazy(() => import('../features/frameworks/Iso22301View'));
const Iso27017View = lazy(() => import('../features/frameworks/Iso27017View'));
const NcscCafView = lazy(() =>
  import('../features/frameworks/NcscCafView').then((m) => ({ default: m.NcscCafView })),
);

const basename = import.meta.env.PROD ? '/grc-framework-mapping-tool' : '/';

const NAV: readonly { path: string; label: string }[] = [
  { path: '/iso27001', label: 'ISO 27001' },
  { path: '/nist-csf-2', label: 'NIST CSF' },
  { path: '/soc2', label: 'SOC 2' },
  { path: '/cis-v8', label: 'CIS v8' },
  { path: '/pci-dss', label: 'PCI DSS' },
  { path: '/cyber-essentials', label: 'Cyber Essentials' },
  { path: '/nist-800-53', label: '800-53' },
  { path: '/nis2', label: 'NIS 2' },
  { path: '/iso22301', label: 'ISO 22301' },
  { path: '/iso27017', label: 'ISO 27017' },
  { path: '/ncsc-caf', label: 'NCSC CAF' },
];

function ViewFallback() {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center p-8 text-ink-3">
      Loading framework…
    </div>
  );
}

export function App() {
  return (
    <PersistenceProvider>
      <BrowserRouter basename={basename}>
        <div className="flex min-h-full flex-col">
          <header className="border-b border-border bg-surface px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Primary">
                <NavLink to="/" className="text-lg font-semibold text-brand-text">
                  GRC Suite.v01
                </NavLink>
                <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-2">
                  {NAV.map((n) => (
                    <li key={n.path}>
                      <NavLink
                        to={n.path}
                        className={({ isActive }) =>
                          isActive ? 'text-brand-text underline' : 'hover:text-brand-text'
                        }
                      >
                        {n.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <SearchBar />
            </div>
          </header>
          <main className="flex-1 bg-bg" data-testid="app-shell">
            <Suspense fallback={<ViewFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/iso27001" element={<Iso27001View />} />
                <Route path="/nist-csf-2" element={<NistCsfView />} />
                <Route path="/soc2" element={<Soc2View />} />
                <Route path="/cis-v8" element={<CisV8View />} />
                <Route path="/pci-dss" element={<PciDssView />} />
                <Route path="/cyber-essentials" element={<CyberEssentialsView />} />
                <Route path="/nist-800-53" element={<Nist80053View />} />
                <Route path="/nis2" element={<Nis2View />} />
                <Route path="/iso22301" element={<Iso22301View />} />
                <Route path="/iso27017" element={<Iso27017View />} />
                <Route path="/ncsc-caf" element={<NcscCafView />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </main>
          <footer className="bg-bg py-10">
            <BentoProfileCard />
          </footer>
        </div>
      </BrowserRouter>
    </PersistenceProvider>
  );
}
