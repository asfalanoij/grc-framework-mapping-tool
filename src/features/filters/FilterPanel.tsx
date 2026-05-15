import { FilterPill } from './FilterPill';
import { useFiltersStore } from '../../store/filters.store';
import type { IsoCategory, ControlType, SecurityDomain } from '../../data/schemas';
import type { Status } from '../../domain/scoring';

const CATEGORIES: readonly IsoCategory[] = [
  'Management System',
  'Organizational',
  'People',
  'Physical',
  'Technological',
];
const CONTROL_TYPES: readonly ControlType[] = ['Preventive', 'Detective', 'Corrective'];
const SECURITY_DOMAINS: readonly SecurityDomain[] = [
  'Governance and Ecosystem',
  'Protection',
  'Defence',
  'Resilience',
];
const STATUSES: readonly { value: Status; label: string }[] = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'na', label: 'N/A' },
];
const NIST_FUNCTIONS: readonly string[] = ['GOVERN', 'IDENTIFY', 'PROTECT', 'DETECT', 'RESPOND', 'RECOVER'];

export function IsoFilterPanel() {
  const iso = useFiltersStore((s) => s.iso);
  const toggleCat = useFiltersStore((s) => s.toggleIsoCategory);
  const toggleCt = useFiltersStore((s) => s.toggleIsoControlType);
  const toggleSd = useFiltersStore((s) => s.toggleIsoSecurityDomain);
  const toggleStatus = useFiltersStore((s) => s.toggleIsoStatus);
  const toggleNist = useFiltersStore((s) => s.toggleIsoNistFunction);
  const clearAll = useFiltersStore((s) => s.clearAll);
  const hasAny = useFiltersStore((s) => s.hasAnyActiveFilter)();

  return (
    <aside
      aria-label="Filters"
      className="w-64 shrink-0 space-y-6 border-r border-border bg-surface p-4"
      data-testid="filter-panel"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-3">Filters</h2>
        {hasAny ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-brand-text hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </header>

      <Section title="ISO category">
        {CATEGORIES.map((c) => (
          <FilterPill
            key={c}
            label={c}
            active={iso.categories.includes(c)}
            onToggle={() => toggleCat(c)}
          />
        ))}
      </Section>

      <Section title="Control type">
        {CONTROL_TYPES.map((ct) => (
          <FilterPill
            key={ct}
            label={ct}
            active={iso.controlTypes.includes(ct)}
            onToggle={() => toggleCt(ct)}
          />
        ))}
      </Section>

      <Section title="Security domain">
        {SECURITY_DOMAINS.map((sd) => (
          <FilterPill
            key={sd}
            label={sd}
            active={iso.securityDomains.includes(sd)}
            onToggle={() => toggleSd(sd)}
          />
        ))}
      </Section>

      <Section title="Status">
        {STATUSES.map((s) => (
          <FilterPill
            key={s.value}
            label={s.label}
            active={iso.statuses.includes(s.value)}
            onToggle={() => toggleStatus(s.value)}
          />
        ))}
      </Section>

      <Section title="NIST CSF function">
        {NIST_FUNCTIONS.map((fn) => (
          <FilterPill
            key={fn}
            label={fn}
            active={iso.nistFunctions.includes(fn)}
            onToggle={() => toggleNist(fn)}
          />
        ))}
      </Section>
    </aside>
  );
}

function Section({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-3">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </section>
  );
}
