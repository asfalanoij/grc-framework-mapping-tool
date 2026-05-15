import type { EvidenceRow } from '../../services/persistence';

export interface EvidenceChecklistProps {
  readonly templates: readonly string[];
  readonly evidence: EvidenceRow;
  readonly onToggle: (typeName: string, checked: boolean) => void;
  readonly onRefChange: (typeName: string, ref: string) => void;
  readonly onNotesChange: (notes: string) => void;
}

export function EvidenceChecklist({
  templates,
  evidence,
  onToggle,
  onRefChange,
  onNotesChange,
}: EvidenceChecklistProps) {
  if (templates.length === 0) {
    return <p className="text-xs italic text-ink-4">No evidence template registered for this control.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2" data-testid="evidence-checklist">
        {templates.map((typeName) => {
          const collected = evidence.collected[typeName] === true;
          const ref = evidence.refs[typeName] ?? '';
          return (
            <li key={typeName} className="rounded-md border border-border bg-surface px-3 py-2">
              <label className="flex items-start gap-2 text-sm text-ink-2">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
                  checked={collected}
                  onChange={(e) => onToggle(typeName, e.target.checked)}
                />
                <span className="flex-1">{typeName}</span>
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2 placeholder-ink-4 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="Add a document reference (link, ticket, file path…)"
                value={ref}
                onChange={(e) => onRefChange(typeName, e.target.value)}
                aria-label={`Reference for ${typeName}`}
              />
            </li>
          );
        })}
      </ul>
      <label className="block text-sm text-ink-2">
        <span className="block text-xs font-semibold uppercase tracking-wide text-ink-3">Additional notes</span>
        <textarea
          className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1 text-sm text-ink-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          rows={3}
          value={evidence.notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </label>
    </div>
  );
}
