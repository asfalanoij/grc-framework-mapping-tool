import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import type { FrameworkHierarchy } from '../../data/schemas';
import { ScoreSelector } from '../controls/ScoreSelector';
import { TransitiveMappingBadges } from '../controls/TransitiveMappingBadges';
import { usePersistence } from '../../app/use-persistence';
import { useScoresStore } from '../../store/scores.store';
import { useEvidenceStore } from '../../store/evidence.store';
import { computeReadiness, type Status } from '../../domain/scoring';
import { ExportMenu } from '../export/ExportMenu';
import { buildFrameworkCsv } from '../export/frameworkExporter';
import { buildFrameworkXlsx } from '../export/xlsxExporter';

const EMPTY: Readonly<Record<string, never>> = Object.freeze({});

export interface FlatFrameworkViewProps {
  readonly framework: string;
  readonly title: string;
  readonly subtitle: string;
  readonly hierarchy: FrameworkHierarchy;
}

export function FlatFrameworkView({ framework, title, subtitle, hierarchy }: FlatFrameworkViewProps) {
  const persistence = usePersistence();
  const scoresByFw = useScoresStore((s) => s.byFramework);
  const setScore = useScoresStore((s) => s.setScore);
  const hydrateScores = useScoresStore((s) => s.hydrate);
  const evidenceState = useEvidenceStore();
  const hydrateEvidence = useEvidenceStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateScores(persistence, [framework]);
    void hydrateEvidence(persistence, [framework]);
  }, [persistence, framework, hydrateScores, hydrateEvidence]);

  const scoresForFw = scoresByFw[framework];
  const scores = scoresForFw ?? EMPTY;

  const groupIds = useMemo(() => hierarchy.groups.map((g) => g.id), [hierarchy]);
  const readiness = useMemo(() => computeReadiness(groupIds, scores), [groupIds, scores]);

  return (
    <section className="space-y-6 p-6" data-testid={`framework-view-${framework}`}>
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <p className="text-sm text-ink-3">{subtitle}</p>
        <p className="text-sm text-ink-2" data-testid="framework-readiness">
          Readiness: <strong>{readiness.percentImplemented}%</strong> ({readiness.implemented} of{' '}
          {readiness.applicable} applicable · {readiness.notApplicable} N/A) · {hierarchy.groups.length} items
        </p>
        <ExportMenu
          framework={framework}
          buildCsv={() => buildFrameworkCsv(hierarchy, { framework, scores, evidenceByKey: evidenceState.byKey })}
          buildXlsx={() => buildFrameworkXlsx(hierarchy, { framework, scores, evidenceByKey: evidenceState.byKey })}
        />
      </header>

      <div className="space-y-2">
        {hierarchy.groups.map((g) => (
          <FlatRow
            key={g.id}
            framework={framework}
            id={g.id}
            name={g.name}
            desc={g.desc}
            achieved={g.achieved}
            status={scores[g.id] ?? 'not-started'}
            onStatusChange={(next) => void setScore(persistence, framework, g.id, next)}
          />
        ))}
      </div>
    </section>
  );
}

interface FlatRowProps {
  readonly framework: string;
  readonly id: string;
  readonly name: string;
  readonly desc?: string;
  readonly achieved?: readonly string[];
  readonly status: Status;
  readonly onStatusChange: (next: Status) => void;
}

function FlatRow({ framework, id, name, desc, achieved, status, onStatusChange }: FlatRowProps) {
  const [expanded, setExpanded] = useState(false);
  const headerId = `flat-${framework}-${id}-header`;
  const panelId = `flat-${framework}-${id}-panel`;
  return (
    <article
      className="rounded-lg border border-border bg-surface shadow-sm"
      data-testid={`item-${id}`}
    >
      <header className="flex items-start gap-3 p-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 id={headerId} className="font-mono text-sm font-semibold text-ink">
              {id}
            </h3>
            <p className="text-sm font-medium text-ink">{name}</p>
          </div>
          <ScoreSelector status={status} onChange={onStatusChange} applicable idPrefix={`status-${framework}-${id}`} />
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
          {desc ? <p className="text-sm text-ink-2">{desc}</p> : null}
          {achieved && achieved.length > 0 ? (
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
              <TransitiveMappingBadges sourceFramework={framework} itemId={id} />
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
