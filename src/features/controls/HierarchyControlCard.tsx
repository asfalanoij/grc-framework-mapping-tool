import { useState } from 'react';
import type { FrameworkItem } from '../../data/schemas';
import type { Status } from '../../domain/scoring';
import type { EvidenceRow } from '../../services/persistence';
import { ScoreSelector } from './ScoreSelector';
import { EvidenceChecklist } from './EvidenceChecklist';
import { TransitiveMappingBadges } from './TransitiveMappingBadges';

export interface HierarchyControlCardProps {
  readonly framework: string;
  readonly item: FrameworkItem;
  readonly status: Status;
  readonly evidence: EvidenceRow;
  readonly onStatusChange: (next: Status) => void;
  readonly onEvidenceToggle: (typeName: string, checked: boolean) => void;
  readonly onEvidenceRefChange: (typeName: string, ref: string) => void;
  readonly onEvidenceNotesChange: (notes: string) => void;
}

export function HierarchyControlCard({
  framework,
  item,
  status,
  evidence,
  onStatusChange,
  onEvidenceToggle,
  onEvidenceRefChange,
  onEvidenceNotesChange,
}: HierarchyControlCardProps) {
  const [expanded, setExpanded] = useState(false);
  const headerId = `item-${framework}-${item.id}-header`;
  const panelId = `item-${framework}-${item.id}-panel`;
  const templates = item.evidence ?? [];
  const achieved = item.achieved ?? [];

  return (
    <article
      className="rounded-lg border border-border bg-surface shadow-sm transition hover:border-border-strong"
      data-testid={`item-${item.id}`}
    >
      <header className="flex items-start gap-3 p-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 id={headerId} className="font-mono text-sm font-semibold text-ink">
              {item.id}
            </h3>
            <p className="text-sm font-medium text-ink">{item.name}</p>
          </div>
          <ScoreSelector
            status={status}
            onChange={onStatusChange}
            applicable
            idPrefix={`status-${framework}-${item.id}`}
          />
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
          {item.desc ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Description</h4>
              <p className="mt-1 text-sm text-ink-2">{item.desc}</p>
            </div>
          ) : null}
          {achieved.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Achieved criteria</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-2">
                {achieved.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">
              Cross-framework mappings (via ISO 27001 spine)
            </h4>
            <div className="mt-2">
              <TransitiveMappingBadges sourceFramework={framework} itemId={item.id} />
            </div>
          </div>
          {templates.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">Evidence</h4>
              <div className="mt-2">
                <EvidenceChecklist
                  templates={templates}
                  evidence={evidence}
                  onToggle={onEvidenceToggle}
                  onRefChange={onEvidenceRefChange}
                  onNotesChange={onEvidenceNotesChange}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
