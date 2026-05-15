import { useEffect, useMemo, useRef, useState } from 'react';
import { useFiltersStore } from '../../store/filters.store';
import { autocompleteSuggestions, buildIndex, type Searchable } from '../../domain/search';
import { iso27001Controls } from '../../data/frameworks/iso27001';
import { parseCrossRefs, frameworkPropKeys } from '../../domain/mapping-engine';

function controlToSearchable(c: (typeof iso27001Controls)[number]): Searchable {
  return {
    id: c.id,
    name: c.name,
    desc: c.isoDesc,
    refs: frameworkPropKeys.flatMap((k) => parseCrossRefs(c[k])),
  };
}

export function SearchBar() {
  const query = useFiltersStore((s) => s.query);
  const setQuery = useFiltersStore((s) => s.setQuery);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(iso27001Controls.map(controlToSearchable)), []);
  const suggestions = useMemo(() => autocompleteSuggestions(index, query, 6), [index, query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-64" data-testid="search-bar">
      <label htmlFor="ctrlmap-search" className="sr-only">
        Search controls
      </label>
      <input
        id="ctrlmap-search"
        type="search"
        autoComplete="off"
        placeholder="Search controls (id, name, framework ref)…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder-ink-4 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      {open && query.trim().length > 0 && suggestions.length > 0 ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-10 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-surface shadow"
          data-testid="search-suggestions"
        >
          {suggestions.map((s) => (
            <li key={s.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  setQuery(s.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink-2 hover:bg-surface-2"
              >
                <span className="font-mono text-xs text-ink-3">{s.id}</span>
                <span className="flex-1 truncate">{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
