import { frameworkPropKeys, parseCrossRefs, type FrameworkPropKey } from '../../domain/mapping-engine';
import type { IsoControl } from '../../data/schemas';

const LABELS: Readonly<Record<FrameworkPropKey, string>> = Object.freeze({
  nistSub: 'NIST CSF 2.0',
  soc2: 'SOC 2',
  cis: 'CIS v8',
  pci: 'PCI DSS',
  ce: 'Cyber Essentials',
  n80053: 'NIST 800-53',
  nis2: 'NIS 2',
  iso22301: 'ISO 22301',
  iso27017: 'ISO 27017',
  caf: 'NCSC CAF',
});

const COLORS: Readonly<Record<FrameworkPropKey, string>> = Object.freeze({
  nistSub: 'bg-orange-50 text-orange-800 border-orange-200',
  soc2: 'bg-blue-50 text-blue-800 border-blue-200',
  cis: 'bg-purple-50 text-purple-800 border-purple-200',
  pci: 'bg-rose-50 text-rose-800 border-rose-200',
  ce: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  n80053: 'bg-amber-50 text-amber-800 border-amber-200',
  nis2: 'bg-sky-50 text-sky-800 border-sky-200',
  iso22301: 'bg-violet-50 text-violet-800 border-violet-200',
  iso27017: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  caf: 'bg-indigo-50 text-indigo-800 border-indigo-200',
});

export interface MappingBadgesProps {
  readonly control: IsoControl;
}

export function MappingBadges({ control }: MappingBadgesProps) {
  const groups = frameworkPropKeys
    .map((k) => ({ key: k, refs: parseCrossRefs(control[k]) }))
    .filter((g) => g.refs.length > 0);

  if (groups.length === 0) {
    return <p className="text-xs italic text-ink-4">No cross-framework mappings recorded.</p>;
  }

  return (
    <dl className="space-y-2">
      {groups.map(({ key, refs }) => (
        <div key={key} className="flex flex-wrap items-center gap-2">
          <dt className="min-w-[8rem] text-xs font-semibold uppercase tracking-wide text-ink-3">{LABELS[key]}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {refs.map((r) => (
              <span
                key={r}
                className={`rounded border px-2 py-0.5 font-mono text-xs ${COLORS[key]}`}
              >
                {r}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
