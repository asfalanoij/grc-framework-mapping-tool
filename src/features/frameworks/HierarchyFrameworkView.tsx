import { useEffect, useMemo } from 'react';
import type { FrameworkHierarchy, FrameworkItem } from '../../data/schemas';
import { HierarchyControlCard } from '../controls/HierarchyControlCard';
import { usePersistence } from '../../app/use-persistence';
import { useScoresStore } from '../../store/scores.store';
import { useEvidenceStore, selectEvidenceFor } from '../../store/evidence.store';
import { computeReadiness } from '../../domain/scoring';

const EMPTY: Readonly<Record<string, never>> = Object.freeze({});

export interface HierarchyFrameworkViewProps {
  readonly framework: string;
  readonly title: string;
  readonly subtitle: string;
  readonly hierarchy: FrameworkHierarchy;
}

export function HierarchyFrameworkView({
  framework,
  title,
  subtitle,
  hierarchy,
}: HierarchyFrameworkViewProps) {
  const persistence = usePersistence();
  const scoresByFw = useScoresStore((s) => s.byFramework);
  const setScore = useScoresStore((s) => s.setScore);
  const hydrateScores = useScoresStore((s) => s.hydrate);

  const evidenceState = useEvidenceStore();
  const hydrateEvidence = useEvidenceStore((s) => s.hydrate);
  const toggleCheck = useEvidenceStore((s) => s.toggleCheck);
  const setRef = useEvidenceStore((s) => s.setRef);
  const setNotes = useEvidenceStore((s) => s.setNotes);

  useEffect(() => {
    void hydrateScores(persistence, [framework]);
    void hydrateEvidence(persistence, [framework]);
  }, [persistence, framework, hydrateScores, hydrateEvidence]);

  const scoresForFw = scoresByFw[framework];
  const scores = scoresForFw ?? EMPTY;

  const flatItems = useMemo(() => flattenItems(hierarchy), [hierarchy]);
  const readiness = useMemo(
    () => computeReadiness(flatItems.map((i) => i.id), scores),
    [flatItems, scores],
  );

  return (
    <section className="space-y-6 p-6" data-testid={`framework-view-${framework}`}>
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <p className="text-sm text-ink-3">{subtitle}</p>
        <p className="text-sm text-ink-2" data-testid="framework-readiness">
          Readiness: <strong>{readiness.percentImplemented}%</strong> ({readiness.implemented} of{' '}
          {readiness.applicable} applicable · {readiness.notApplicable} N/A) · {flatItems.length} items
        </p>
      </header>

      {hierarchy.groups.map((group) => (
        <section key={group.id} className="space-y-3" data-testid={`group-${group.id}`}>
          <h3 className="text-lg font-semibold text-ink">
            <span className="font-mono text-base text-brand-text">{group.id}</span>{' '}
            <span>{group.name}</span>
          </h3>
          {group.desc ? <p className="text-sm text-ink-3">{group.desc}</p> : null}

          {/* 3-level hierarchy: groups → sections → items */}
          {group.sections?.map((section) => (
            <div key={section.id} className="space-y-2 border-l border-border pl-4">
              <h4 className="text-sm font-semibold text-ink-2">
                <span className="font-mono text-xs text-brand-text">{section.id}</span> {section.name}
              </h4>
              {section.desc ? <p className="text-xs text-ink-3">{section.desc}</p> : null}
              <div className="space-y-2">
                {section.items.map((item) => (
                  <HierarchyControlCard
                    key={item.id}
                    framework={framework}
                    item={item}
                    status={scores[item.id] ?? 'not-started'}
                    evidence={selectEvidenceFor(evidenceState, framework, item.id)}
                    onStatusChange={(next) => void setScore(persistence, framework, item.id, next)}
                    onEvidenceToggle={(t, c) => void toggleCheck(persistence, framework, item.id, t, c)}
                    onEvidenceRefChange={(t, r) => void setRef(persistence, framework, item.id, t, r)}
                    onEvidenceNotesChange={(n) => void setNotes(persistence, framework, item.id, n)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* 2-level hierarchy: groups → items (no sections in between, e.g. CIS, CE) */}
          {group.items?.length ? (
            <div className="space-y-2">
              {group.items.map((item) => (
                <HierarchyControlCard
                  key={item.id}
                  framework={framework}
                  item={item}
                  status={scores[item.id] ?? 'not-started'}
                  evidence={selectEvidenceFor(evidenceState, framework, item.id)}
                  onStatusChange={(next) => void setScore(persistence, framework, item.id, next)}
                  onEvidenceToggle={(t, c) => void toggleCheck(persistence, framework, item.id, t, c)}
                  onEvidenceRefChange={(t, r) => void setRef(persistence, framework, item.id, t, r)}
                  onEvidenceNotesChange={(n) => void setNotes(persistence, framework, item.id, n)}
                />
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </section>
  );
}

function flattenItems(hierarchy: FrameworkHierarchy): FrameworkItem[] {
  const out: FrameworkItem[] = [];
  for (const g of hierarchy.groups) {
    if (g.sections) for (const s of g.sections) for (const item of s.items) out.push(item);
    if (g.items) for (const item of g.items) out.push(item);
  }
  return out;
}
