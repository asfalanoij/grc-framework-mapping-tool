import {
  frameworkPropKeys,
  getMappingsForControl,
  type FrameworkPropKey,
} from '../../domain/mapping-engine';
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

export interface ControlNeighborhoodViewProps {
  readonly control: IsoControl;
  readonly onRefClick?: (framework: FrameworkPropKey, refId: string) => void;
}

// Renders one row per non-ISO framework regardless of whether mappings exist,
// so a future drift event shows up as a visibly empty cell rather than a
// silently absent row.
export function ControlNeighborhoodView({ control, onRefClick }: ControlNeighborhoodViewProps) {
  const mappings = getMappingsForControl(control);
  const populatedCount = frameworkPropKeys.reduce(
    (acc, k) => acc + (mappings[k].length > 0 ? 1 : 0),
    0,
  );

  return (
    <section
      aria-labelledby={`neighborhood-${control.id}-heading`}
      data-testid={`neighborhood-${control.id}`}
      className="rounded-lg border border-border bg-surface p-4 shadow-sm"
    >
      <header className="mb-3 flex flex-wrap items-baseline gap-2 border-b border-border pb-2">
        <h3
          id={`neighborhood-${control.id}-heading`}
          className="font-mono text-sm font-semibold text-ink"
        >
          {control.id}
        </h3>
        <p className="text-sm font-medium text-ink-2">{control.name}</p>
        <span
          className="ml-auto rounded bg-surface-2 px-2 py-0.5 text-xs text-ink-3"
          aria-label={`mapped to ${populatedCount} of ${frameworkPropKeys.length} frameworks`}
        >
          {populatedCount} / {frameworkPropKeys.length} frameworks mapped
        </span>
      </header>
      <dl className="divide-y divide-border">
        {frameworkPropKeys.map((key) => {
          const refs = mappings[key];
          const isEmpty = refs.length === 0;
          return (
            <div
              key={key}
              className="grid grid-cols-[9rem_1fr] items-baseline gap-3 py-2"
              data-testid={`neighborhood-row-${key}`}
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                {LABELS[key]}
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {isEmpty ? (
                  <span
                    className="text-sm italic text-ink-4"
                    title="No mapping declared"
                    aria-label={`No ${LABELS[key]} mapping declared`}
                  >
                    &mdash;
                  </span>
                ) : (
                  refs.map((r) => {
                    const cls = `rounded border px-2 py-0.5 font-mono text-xs ${COLORS[key]}`;
                    if (onRefClick) {
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => onRefClick(key, r)}
                          className={`${cls} cursor-pointer hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-brand`}
                          aria-label={`Navigate to ${LABELS[key]} ${r}`}
                        >
                          {r}
                        </button>
                      );
                    }
                    return (
                      <span key={r} className={cls}>
                        {r}
                      </span>
                    );
                  })
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
