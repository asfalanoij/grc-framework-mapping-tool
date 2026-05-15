import { useFiltersStore } from '../../store/filters.store';

// Compact summary of every active filter; click any chip to remove that filter.
export function FilterChips() {
  const iso = useFiltersStore((s) => s.iso);
  const query = useFiltersStore((s) => s.query);
  const setQuery = useFiltersStore((s) => s.setQuery);
  const toggleCat = useFiltersStore((s) => s.toggleIsoCategory);
  const toggleCt = useFiltersStore((s) => s.toggleIsoControlType);
  const toggleSd = useFiltersStore((s) => s.toggleIsoSecurityDomain);
  const toggleStatus = useFiltersStore((s) => s.toggleIsoStatus);
  const toggleNist = useFiltersStore((s) => s.toggleIsoNistFunction);

  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (query.trim()) chips.push({ key: `q:${query}`, label: `"${query}"`, remove: () => setQuery('') });
  for (const c of iso.categories) chips.push({ key: `cat:${c}`, label: c, remove: () => toggleCat(c) });
  for (const ct of iso.controlTypes) chips.push({ key: `ct:${ct}`, label: ct, remove: () => toggleCt(ct) });
  for (const sd of iso.securityDomains)
    chips.push({ key: `sd:${sd}`, label: sd, remove: () => toggleSd(sd) });
  for (const st of iso.statuses) chips.push({ key: `st:${st}`, label: st, remove: () => toggleStatus(st) });
  for (const fn of iso.nistFunctions)
    chips.push({ key: `nist:${fn}`, label: fn, remove: () => toggleNist(fn) });

  if (chips.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      data-testid="active-filter-chips"
      aria-label="Active filters"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-text hover:bg-brand-100"
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label} <span aria-hidden>×</span>
        </button>
      ))}
    </div>
  );
}
