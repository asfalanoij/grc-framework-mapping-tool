import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { IsoControl } from '../../data/schemas';
import type { Status } from '../../domain/scoring';
import type { EvidenceRow } from '../../services/persistence';
import { ScoreSelector } from './ScoreSelector';
import { MappingBadges } from './MappingBadges';
import { EvidenceChecklist } from './EvidenceChecklist';
import { SoaJustification } from './SoaJustification';

export interface ControlCardProps {
  readonly control: IsoControl;
  readonly status: Status;
  readonly evidenceTemplates: readonly string[];
  readonly evidence: EvidenceRow;
  readonly justification: string;
  readonly onStatusChange: (next: Status) => void;
  readonly onEvidenceToggle: (typeName: string, checked: boolean) => void;
  readonly onEvidenceRefChange: (typeName: string, ref: string) => void;
  readonly onEvidenceNotesChange: (notes: string) => void;
  readonly onJustificationChange: (text: string) => void;
}

const CT_BADGE_CLASSES: Readonly<Record<string, string>> = Object.freeze({
  Preventive: 'bg-info-50 text-info-text',
  Detective: 'bg-warning-50 text-warning-text',
  Corrective: 'bg-error-50 text-error-text',
});

export function ControlCard({
  control,
  status,
  evidenceTemplates,
  evidence,
  justification,
  onStatusChange,
  onEvidenceToggle,
  onEvidenceRefChange,
  onEvidenceNotesChange,
  onJustificationChange,
}: ControlCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isAnnexA = control.cat !== 'Management System';
  const headerId = `control-${control.id}-header`;
  const panelId = `control-${control.id}-panel`;

  return (
    <article
      className="rounded-lg border border-border bg-surface shadow-sm transition hover:border-border-strong"
      data-testid={`control-${control.id}`}
    >
      <header className="flex items-start gap-3 p-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 id={headerId} className="font-mono text-sm font-semibold text-ink">
              {control.id}
            </h3>
            <p className="text-sm font-medium text-ink">{control.name}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="rounded bg-surface-2 px-2 py-0.5 text-ink-3">{control.cat}</span>
            {control.ct ? (
              <span className={`rounded px-2 py-0.5 font-medium ${CT_BADGE_CLASSES[control.ct.split(',')[0]?.trim() ?? ''] ?? 'bg-surface-2 text-ink-3'}`}>
                {control.ct}
              </span>
            ) : null}
            {control.sd ? (
              <span className="rounded bg-brand-50 px-2 py-0.5 text-brand-text">{control.sd}</span>
            ) : null}
          </div>
          <ScoreSelector status={status} onChange={onStatusChange} applicable={isAnnexA} idPrefix={`status-${control.id}`} />
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-labelledby={headerId}
          onClick={() => setExpanded((v) => !v)}
          className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </header>
      {expanded ? (
        <section
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="space-y-4 border-t border-border bg-surface-2 p-4"
        >
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">ISO 27002 description</h4>
            <p className="mt-1 text-sm text-ink-2">{control.isoDesc}</p>
          </div>
          {control.notes ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Implementation guidance</h4>
              <p className="mt-1 text-sm text-ink-2">{control.notes}</p>
            </div>
          ) : null}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Cross-framework mappings</h4>
              <Link
                to={`/neighborhood/iso/${encodeURIComponent(control.id)}`}
                className="text-xs font-medium text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand"
                data-testid={`neighborhood-link-${control.id}`}
              >
                View full neighborhood &rarr;
              </Link>
            </div>
            <div className="mt-2">
              <MappingBadges control={control} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Evidence</h4>
            <div className="mt-2">
              <EvidenceChecklist
                templates={evidenceTemplates}
                evidence={evidence}
                onToggle={onEvidenceToggle}
                onRefChange={onEvidenceRefChange}
                onNotesChange={onEvidenceNotesChange}
              />
            </div>
          </div>
          {isAnnexA && status === 'na' ? (
            <SoaJustification justification={justification} onChange={onJustificationChange} />
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
