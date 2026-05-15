import type { Status } from '../../domain/scoring';

export interface ScoreSelectorProps {
  readonly status: Status;
  readonly onChange: (next: Status) => void;
  readonly applicable?: boolean; // Annex A only — when false, hides "N/A" option
  readonly idPrefix?: string;
}

interface Option {
  readonly value: Status;
  readonly label: string;
  readonly classes: string;
}

const OPTIONS: readonly Option[] = [
  { value: 'not-started', label: 'Not started', classes: 'bg-error-50 text-error-text' },
  { value: 'in-progress', label: 'In progress', classes: 'bg-warning-50 text-warning-text' },
  { value: 'implemented', label: 'Implemented', classes: 'bg-success-50 text-success-text' },
  { value: 'na', label: 'N/A', classes: 'bg-surface-3 text-ink-3' },
];

export function ScoreSelector({ status, onChange, applicable = true, idPrefix }: ScoreSelectorProps) {
  const visible = applicable ? OPTIONS : OPTIONS.filter((o) => o.value !== 'na');
  return (
    <div role="radiogroup" aria-label="Implementation status" className="flex flex-wrap gap-2">
      {visible.map((opt) => {
        const active = opt.value === status;
        const id = idPrefix ? `${idPrefix}-${opt.value}` : undefined;
        return (
          <button
            key={opt.value}
            id={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-brand',
              active ? `${opt.classes} ring-1 ring-brand` : 'bg-surface-2 text-ink-3 hover:bg-surface-3',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
