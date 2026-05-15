import { useEffect, useMemo } from 'react';
import { ncscCaf, ncscCafOutcomes } from '../../data/frameworks/ncsc-caf';
import { HierarchyControlCard } from '../controls/HierarchyControlCard';
import { usePersistence } from '../../app/use-persistence';
import { useScoresStore } from '../../store/scores.store';
import { useEvidenceStore, selectEvidenceFor } from '../../store/evidence.store';
import { computeReadiness } from '../../domain/scoring';
import { ExportMenu } from '../export/ExportMenu';
import { buildCafCsv } from '../export/frameworkExporter';
import { buildCafXlsx } from '../export/xlsxExporter';

const FRAMEWORK = 'NCSC CAF';
const EMPTY: Readonly<Record<string, never>> = Object.freeze({});

export function NcscCafView() {
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
    void hydrateScores(persistence, [FRAMEWORK]);
    void hydrateEvidence(persistence, [FRAMEWORK]);
  }, [persistence, hydrateScores, hydrateEvidence]);

  const scoresForFw = scoresByFw[FRAMEWORK];
  const scores = scoresForFw ?? EMPTY;
  const readiness = useMemo(
    () =>
      computeReadiness(
        ncscCafOutcomes.map((o) => o.id),
        scores,
      ),
    [scores],
  );

  return (
    <section className="space-y-6 p-6" data-testid={`framework-view-${FRAMEWORK}`}>
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-ink">NCSC Cyber Assessment Framework 4.0</h2>
        <p className="text-sm text-ink-3">
          4 Objectives / 14 Principles / 41 Contributing Outcomes, each with official Indicators of
          Good Practice (IGP).
        </p>
        <p className="text-sm text-ink-2" data-testid="framework-readiness">
          Readiness: <strong>{readiness.percentImplemented}%</strong> ({readiness.implemented} of{' '}
          {readiness.applicable} applicable · {readiness.notApplicable} N/A) ·{' '}
          {ncscCafOutcomes.length} outcomes
        </p>
        <ExportMenu
          framework={FRAMEWORK}
          buildCsv={() =>
            buildCafCsv(ncscCaf, {
              framework: FRAMEWORK,
              scores,
              evidenceByKey: evidenceState.byKey,
            })
          }
          buildXlsx={() =>
            buildCafXlsx(ncscCaf, {
              framework: FRAMEWORK,
              scores,
              evidenceByKey: evidenceState.byKey,
            })
          }
        />
      </header>

      {ncscCaf.objectives.map((obj) => (
        <section key={obj.id} className="space-y-3" data-testid={`group-${obj.id}`}>
          <h3 className="text-lg font-semibold text-ink">
            <span className="font-mono text-base text-brand-text">{obj.id}</span> {obj.name}
          </h3>
          <p className="text-sm text-ink-3">{obj.desc}</p>
          {obj.principles.map((pr) => (
            <div key={pr.id} className="space-y-2 border-l border-border pl-4">
              <h4 className="text-sm font-semibold text-ink-2">
                <span className="font-mono text-xs text-brand-text">{pr.id}</span> {pr.name}
              </h4>
              {pr.desc ? <p className="text-xs text-ink-3">{pr.desc}</p> : null}
              <div className="space-y-2">
                {pr.outcomes.map((outcome) => (
                  <HierarchyControlCard
                    key={outcome.id}
                    framework={FRAMEWORK}
                    item={{
                      id: outcome.id,
                      name: outcome.name,
                      desc: outcome.desc,
                      achieved: outcome.achieved,
                      evidence: outcome.evidence,
                    }}
                    status={scores[outcome.id] ?? 'not-started'}
                    evidence={selectEvidenceFor(evidenceState, FRAMEWORK, outcome.id)}
                    onStatusChange={(next) =>
                      void setScore(persistence, FRAMEWORK, outcome.id, next)
                    }
                    onEvidenceToggle={(t, c) =>
                      void toggleCheck(persistence, FRAMEWORK, outcome.id, t, c)
                    }
                    onEvidenceRefChange={(t, r) =>
                      void setRef(persistence, FRAMEWORK, outcome.id, t, r)
                    }
                    onEvidenceNotesChange={(n) =>
                      void setNotes(persistence, FRAMEWORK, outcome.id, n)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </section>
  );
}
