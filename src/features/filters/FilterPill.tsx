export interface FilterPillProps {
  readonly label: string;
  readonly active: boolean;
  readonly count?: number;
  readonly onToggle: () => void;
}

export function FilterPill({ label, active, count, onToggle }: FilterPillProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={[
        'rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-brand',
        active
          ? 'border-brand bg-brand-50 text-brand-text'
          : 'border-border bg-surface text-ink-2 hover:border-border-strong hover:bg-surface-2',
      ].join(' ')}
    >
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span className="ml-2 rounded-full bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
          {count}
        </span>
      ) : null}
    </button>
  );
}
