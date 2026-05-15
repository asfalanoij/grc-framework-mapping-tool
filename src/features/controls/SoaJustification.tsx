export interface SoaJustificationProps {
  readonly justification: string;
  readonly onChange: (next: string) => void;
}

export function SoaJustification({ justification, onChange }: SoaJustificationProps) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-warning-text">
        SoA exclusion justification
      </span>
      <textarea
        className="mt-1 w-full rounded-md border border-warning-100 bg-warning-50 px-2 py-1 text-sm text-ink-2 focus:border-warning focus:outline-none focus:ring-1 focus:ring-warning"
        rows={3}
        placeholder="Explain why this Annex A control is excluded from the ISMS scope."
        value={justification}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
