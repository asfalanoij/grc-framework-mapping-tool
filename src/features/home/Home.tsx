import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { iso27001Controls } from '../../data/frameworks/iso27001';
import { nistCsf2Subcategories } from '../../data/frameworks/nist-csf-2';
import { soc2Criteria } from '../../data/frameworks/soc2';
import { cisV8Safeguards } from '../../data/frameworks/cis-v8';
import { pciDssRequirements } from '../../data/frameworks/pci-dss';
import { cyberEssentialsThemes } from '../../data/frameworks/cyber-essentials';
import { nist80053Families } from '../../data/frameworks/nist-800-53';
import { nis2Measures } from '../../data/frameworks/nis2';
import { iso22301Clauses } from '../../data/frameworks/iso22301';
import { iso27017Sections } from '../../data/frameworks/iso27017';
import { ncscCafOutcomes } from '../../data/frameworks/ncsc-caf';
import { computeReadiness } from '../../domain/scoring';
import { usePersistence } from '../../app/use-persistence';
import { useScoresStore } from '../../store/scores.store';
import { ReadinessDonut } from './ReadinessDonut';

const EMPTY: Readonly<Record<string, never>> = Object.freeze({});

interface FrameworkRow {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly note: string;
  readonly itemIds: readonly string[];
}

const FRAMEWORKS: readonly FrameworkRow[] = [
  {
    id: 'ISO 27001',
    name: 'ISO 27001:2022',
    path: '/iso27001',
    note: '118 controls — primary spine',
    itemIds: iso27001Controls.map((c) => c.id),
  },
  {
    id: 'NIST CSF 2.0',
    name: 'NIST CSF 2.0',
    path: '/nist-csf-2',
    note: '106 subcategories',
    itemIds: nistCsf2Subcategories.map((i) => i.id),
  },
  {
    id: 'SOC 2',
    name: 'SOC 2',
    path: '/soc2',
    note: '61 criteria',
    itemIds: soc2Criteria.map((i) => i.id),
  },
  {
    id: 'CIS v8',
    name: 'CIS v8',
    path: '/cis-v8',
    note: '153 safeguards',
    itemIds: cisV8Safeguards.map((i) => i.id),
  },
  {
    id: 'PCI DSS',
    name: 'PCI DSS 4.0.1',
    path: '/pci-dss',
    note: '12 requirements',
    itemIds: pciDssRequirements.map((g) => g.id),
  },
  {
    id: 'Cyber Essentials',
    name: 'Cyber Essentials',
    path: '/cyber-essentials',
    note: '5 themes',
    itemIds: cyberEssentialsThemes.map((g) => g.id),
  },
  {
    id: 'NIST 800-53',
    name: 'NIST 800-53',
    path: '/nist-800-53',
    note: '20 families',
    itemIds: nist80053Families.map((g) => g.id),
  },
  {
    id: 'NIS 2',
    name: 'NIS 2',
    path: '/nis2',
    note: '10 Art.21 measures',
    itemIds: nis2Measures.map((g) => g.id),
  },
  {
    id: 'ISO 22301',
    name: 'ISO 22301',
    path: '/iso22301',
    note: '7 clauses',
    itemIds: iso22301Clauses.map((g) => g.id),
  },
  {
    id: 'ISO 27017',
    name: 'ISO 27017',
    path: '/iso27017',
    note: '14 sections',
    itemIds: iso27017Sections.map((g) => g.id),
  },
  {
    id: 'NCSC CAF',
    name: 'NCSC CAF 4.0',
    path: '/ncsc-caf',
    note: '41 outcomes',
    itemIds: ncscCafOutcomes.map((o) => o.id),
  },
];

const FRAMEWORK_IDS = FRAMEWORKS.map((f) => f.id);

export function Home() {
  const persistence = usePersistence();
  const scoresByFw = useScoresStore((s) => s.byFramework);
  const hydrate = useScoresStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate(persistence, FRAMEWORK_IDS);
  }, [persistence, hydrate]);

  const readinessByFramework = useMemo(() => {
    const out: Record<string, number> = {};
    for (const fw of FRAMEWORKS) {
      const scores = scoresByFw[fw.id] ?? EMPTY;
      out[fw.id] = computeReadiness(fw.itemIds, scores).percentImplemented;
    }
    return out;
  }, [scoresByFw]);

  return (
    <section className="space-y-6 p-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Welcome to GRC Suite.v01</h2>
        <p className="mt-2 text-sm text-ink-3">
          11 GRC frameworks mapped via the ISO 27001:2022 spine. Donut charts reflect your current
          scoring across each framework.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FRAMEWORKS.map((fw) => {
          const percent = readinessByFramework[fw.id] ?? 0;
          return (
            <Link
              key={fw.id}
              to={fw.path}
              className="block"
              data-testid={`framework-card-${fw.id}`}
            >
              <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition hover:border-brand hover:shadow">
                <ReadinessDonut percent={percent} label={`${fw.name}: ${percent}% implemented`} />
                <div>
                  <h3 className="font-semibold text-ink">{fw.name}</h3>
                  <p className="mt-1 text-xs text-ink-3">{fw.note}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
