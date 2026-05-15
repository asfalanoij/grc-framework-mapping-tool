import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { iso27001Controls } from '../../data/frameworks/iso27001';
import { computeReadiness } from '../../domain/scoring';
import { usePersistence } from '../../app/use-persistence';
import { useScoresStore } from '../../store/scores.store';
import { ReadinessDonut } from './ReadinessDonut';

const ISO_FW = 'ISO 27001';
const EMPTY: Readonly<Record<string, never>> = Object.freeze({});

interface FrameworkPlaceholder {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly enabled: boolean;
  readonly note?: string;
}

const FRAMEWORKS: readonly FrameworkPlaceholder[] = [
  { id: ISO_FW, name: 'ISO 27001:2022', path: '/iso27001', enabled: true, note: '118 controls — primary spine' },
  { id: 'NIST CSF 2.0', name: 'NIST CSF 2.0', path: '/nist-csf-2', enabled: false, note: '106 subcategories — M7' },
  { id: 'SOC 2', name: 'SOC 2', path: '/soc2', enabled: false, note: '61 criteria — M7' },
  { id: 'CIS v8', name: 'CIS v8', path: '/cis-v8', enabled: false, note: '153 safeguards — M7' },
  { id: 'PCI DSS', name: 'PCI DSS 4.0.1', path: '/pci-dss', enabled: false, note: '12 requirements — M7' },
  { id: 'Cyber Essentials', name: 'Cyber Essentials', path: '/cyber-essentials', enabled: false, note: '5 themes — M7' },
  { id: 'NIST 800-53', name: 'NIST 800-53', path: '/nist-800-53', enabled: false, note: '20 families — M7' },
  { id: 'NIS 2', name: 'NIS 2', path: '/nis2', enabled: false, note: '10 Art.21 measures — M7' },
  { id: 'ISO 22301', name: 'ISO 22301', path: '/iso22301', enabled: false, note: '7 clauses — M7' },
  { id: 'ISO 27017', name: 'ISO 27017', path: '/iso27017', enabled: false, note: '14 sections — M7' },
  { id: 'NCSC CAF', name: 'NCSC CAF', path: '/ncsc-caf', enabled: false, note: '41 outcomes — M7' },
];

export function Home() {
  const persistence = usePersistence();
  const scoresByFw = useScoresStore((s) => s.byFramework);
  const hydrate = useScoresStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate(persistence, [ISO_FW]);
  }, [persistence, hydrate]);

  const isoScores = scoresByFw[ISO_FW] ?? EMPTY;
  const isoReadiness = useMemo(
    () =>
      computeReadiness(
        iso27001Controls.map((c) => c.id),
        isoScores,
      ),
    [isoScores],
  );

  return (
    <section className="space-y-6 p-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Welcome to CtrlMap v2</h2>
        <p className="mt-2 text-sm text-ink-3">
          11 GRC frameworks mapped to ISO 27001:2022. Donut charts reflect your current scoring — implemented controls
          as a percentage of applicable (non-N/A) items.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FRAMEWORKS.map((fw) => {
          const percent = fw.id === ISO_FW ? isoReadiness.percentImplemented : 0;
          const card = (
            <div
              className={[
                'flex items-center gap-4 rounded-lg border bg-surface p-4 transition',
                fw.enabled
                  ? 'border-border hover:border-brand hover:shadow'
                  : 'border-dashed border-border bg-surface-2 opacity-80',
              ].join(' ')}
              data-testid={`framework-card-${fw.id}`}
            >
              <ReadinessDonut percent={percent} label={`${fw.name}: ${percent}% implemented`} />
              <div>
                <h3 className="font-semibold text-ink">{fw.name}</h3>
                {fw.note ? <p className="mt-1 text-xs text-ink-3">{fw.note}</p> : null}
                {!fw.enabled ? (
                  <span className="mt-2 inline-block rounded bg-surface-3 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-3">
                    Coming soon
                  </span>
                ) : null}
              </div>
            </div>
          );
          return fw.enabled ? (
            <Link key={fw.id} to={fw.path} className="block">
              {card}
            </Link>
          ) : (
            <div key={fw.id}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}
