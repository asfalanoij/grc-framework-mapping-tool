import { useEffect, useMemo } from 'react';
import { iso27001Controls } from '../../data/frameworks/iso27001';
import { getEvidenceTemplate } from '../../data/evidence-templates';
import type { IsoCategory, IsoControl } from '../../data/schemas';
import { ControlCard } from '../controls/ControlCard';
import { IsoFilterPanel } from '../filters/FilterPanel';
import { FilterChips } from '../filters/FilterChips';
import { usePersistence } from '../../app/use-persistence';
import { useScoresStore } from '../../store/scores.store';
import { useEvidenceStore, selectEvidenceFor } from '../../store/evidence.store';
import { useJustificationsStore } from '../../store/justifications.store';
import { useFiltersStore } from '../../store/filters.store';
import { computeReadiness } from '../../domain/scoring';
import {
  applyFilters,
  byIsoCategory,
  byControlType,
  bySecurityDomain,
  byNistFunction,
  byStatus,
  type Predicate,
} from '../../domain/filters';
import { buildIndex, search, type Searchable } from '../../domain/search';
import { parseCrossRefs, frameworkPropKeys } from '../../domain/mapping-engine';

const FRAMEWORK = 'ISO 27001';
const EMPTY_SCORES: Readonly<Record<string, never>> = Object.freeze({});

const CATEGORY_ORDER: readonly IsoCategory[] = [
  'Management System',
  'Organizational',
  'People',
  'Physical',
  'Technological',
];

function controlToSearchable(c: IsoControl): Searchable {
  return {
    id: c.id,
    name: c.name,
    desc: c.isoDesc,
    refs: frameworkPropKeys.flatMap((k) => parseCrossRefs(c[k])),
  };
}

export function Iso27001View() {
  const persistence = usePersistence();
  const scoresByFw = useScoresStore((s) => s.byFramework);
  const setScore = useScoresStore((s) => s.setScore);
  const hydrateScores = useScoresStore((s) => s.hydrate);

  const evidenceState = useEvidenceStore();
  const hydrateEvidence = useEvidenceStore((s) => s.hydrate);
  const toggleCheck = useEvidenceStore((s) => s.toggleCheck);
  const setRef = useEvidenceStore((s) => s.setRef);
  const setNotes = useEvidenceStore((s) => s.setNotes);

  const justifications = useJustificationsStore((s) => s.byControl);
  const hydrateJust = useJustificationsStore((s) => s.hydrate);
  const setJustification = useJustificationsStore((s) => s.set);

  const filtersIso = useFiltersStore((s) => s.iso);
  const query = useFiltersStore((s) => s.query);

  useEffect(() => {
    void hydrateScores(persistence, [FRAMEWORK]);
    void hydrateEvidence(persistence, [FRAMEWORK]);
    void hydrateJust(persistence);
  }, [persistence, hydrateScores, hydrateEvidence, hydrateJust]);

  const scoresForFw = scoresByFw[FRAMEWORK];
  const scores = scoresForFw ?? EMPTY_SCORES;

  const searchIndex = useMemo(() => buildIndex(iso27001Controls.map(controlToSearchable)), []);

  const filteredControls = useMemo(() => {
    const predicates: Predicate<IsoControl>[] = [
      byIsoCategory(filtersIso.categories),
      byControlType(filtersIso.controlTypes),
      bySecurityDomain(filtersIso.securityDomains),
      byNistFunction(filtersIso.nistFunctions),
      byStatus(filtersIso.statuses, scores),
    ];
    const filtered = applyFilters(iso27001Controls, predicates);
    if (query.trim().length === 0) return filtered;
    const matches = search(searchIndex, query);
    const matchIds = new Set(matches.map((m) => m.id));
    return filtered.filter((c) => matchIds.has(c.id));
  }, [filtersIso, query, scores, searchIndex]);

  const grouped = useMemo(() => groupByCategory(filteredControls), [filteredControls]);
  const readiness = useMemo(
    () =>
      computeReadiness(
        iso27001Controls.map((c) => c.id),
        scores,
      ),
    [scores],
  );

  return (
    <div className="flex" data-testid="iso27001-view">
      <IsoFilterPanel />
      <section className="flex-1 space-y-6 p-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-ink">ISO 27001:2022</h2>
          <p className="text-sm text-ink-3">
            25 Management System clauses + 93 Annex A controls. Scores persist in your browser via IndexedDB.
          </p>
          <p className="text-sm text-ink-2" data-testid="iso27001-readiness">
            Readiness: <strong>{readiness.percentImplemented}%</strong> ({readiness.implemented} of{' '}
            {readiness.applicable} applicable · {readiness.notApplicable} N/A) ·{' '}
            <span data-testid="filtered-count">
              {filteredControls.length} of {iso27001Controls.length} shown
            </span>
          </p>
          <FilterChips />
        </header>

        {filteredControls.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-surface-2 p-6 text-center text-sm text-ink-3">
            No controls match the current filters. Clear some pills to broaden the view.
          </p>
        ) : (
          CATEGORY_ORDER.map((cat) => {
            const controls = grouped.get(cat);
            if (!controls || controls.length === 0) return null;
            return (
              <section
                key={cat}
                className="space-y-3"
                data-testid={`category-${cat.replace(/\s+/g, '-')}`}
              >
                <h3 className="text-lg font-semibold text-ink">
                  {cat} <span className="text-sm font-normal text-ink-3">· {controls.length}</span>
                </h3>
                <div className="space-y-2">
                  {controls.map((c) => (
                    <ControlCard
                      key={c.id}
                      control={c}
                      status={scores[c.id] ?? 'not-started'}
                      evidenceTemplates={getEvidenceTemplate(c.id)}
                      evidence={selectEvidenceFor(evidenceState, FRAMEWORK, c.id)}
                      justification={justifications[c.id] ?? ''}
                      onStatusChange={(next) => {
                        void setScore(persistence, FRAMEWORK, c.id, next);
                      }}
                      onEvidenceToggle={(typeName, checked) => {
                        void toggleCheck(persistence, FRAMEWORK, c.id, typeName, checked);
                      }}
                      onEvidenceRefChange={(typeName, ref) => {
                        void setRef(persistence, FRAMEWORK, c.id, typeName, ref);
                      }}
                      onEvidenceNotesChange={(notes) => {
                        void setNotes(persistence, FRAMEWORK, c.id, notes);
                      }}
                      onJustificationChange={(text) => {
                        void setJustification(persistence, c.id, text);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </section>
    </div>
  );
}

function groupByCategory(controls: readonly IsoControl[]): Map<IsoCategory, IsoControl[]> {
  const out = new Map<IsoCategory, IsoControl[]>();
  for (const c of controls) {
    const arr = out.get(c.cat) ?? [];
    arr.push(c);
    out.set(c.cat, arr);
  }
  return out;
}
