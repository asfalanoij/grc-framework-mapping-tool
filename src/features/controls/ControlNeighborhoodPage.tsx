import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { iso27001Controls } from '../../data/frameworks/iso27001';
import type { FrameworkPropKey } from '../../domain/mapping-engine';
import { ControlNeighborhoodView } from './ControlNeighborhoodView';

// Cross-ref field name -> existing framework route path. Clicking a badge in
// the neighborhood view navigates to that framework's page.
const FRAMEWORK_ROUTES: Readonly<Record<FrameworkPropKey, string>> = Object.freeze({
  nistSub: '/nist-csf-2',
  soc2: '/soc2',
  cis: '/cis-v8',
  pci: '/pci-dss',
  ce: '/cyber-essentials',
  n80053: '/nist-800-53',
  nis2: '/nis2',
  iso22301: '/iso22301',
  iso27017: '/iso27017',
  caf: '/ncsc-caf',
});

export function ControlNeighborhoodPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const control = useMemo(() => iso27001Controls.find((c) => c.id === id), [id]);

  if (!control) {
    return (
      <section
        aria-labelledby="neighborhood-notfound-heading"
        className="rounded-lg border border-border bg-surface p-6 shadow-sm"
      >
        <h2 id="neighborhood-notfound-heading" className="text-base font-semibold text-ink">
          Control not found
        </h2>
        <p className="mt-2 text-sm text-ink-2">
          No ISO 27001 control with id <code className="font-mono">{id ?? '(missing)'}</code> exists
          in the local data.
        </p>
        <Link
          to="/iso27001"
          className="mt-4 inline-block rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-2 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          &larr; Back to ISO 27001
        </Link>
      </section>
    );
  }

  const handleRefClick = (framework: FrameworkPropKey, refId: string) => {
    const route = FRAMEWORK_ROUTES[framework];
    navigate(`${route}#${encodeURIComponent(refId)}`);
  };

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-sm">
        <Link
          to="/iso27001"
          className="rounded-md border border-border bg-surface px-3 py-1.5 font-medium text-ink-2 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          &larr; ISO 27001
        </Link>
        <span className="text-ink-3">Neighborhood for {control.id}</span>
      </nav>
      <ControlNeighborhoodView control={control} onRefClick={handleRefClick} />
    </div>
  );
}
