# M9-M11 Mapping Integrity Rebuild — Retrospective

> Date: 2026-05-17
> Scope: Sprints M9.1 -> M9.3, M10 (collapsed), M11.1 -> M11.4
> Branches: `data-integrity-rebuild` and 7 sprint branches
> Plan: `/Users/asfalanoi/.claude/plans/i-need-to-rebuild-nested-rainbow.md`

---

## TL;DR

The user reported that a prior chaotic Claude session had "sacrificed cross-framework interconnectedness" in the project. The plan called for repair: diff against upstream, find rot, fix the data, then surface the fixes in the UI.

**Forensic investigation flipped the diagnosis.** The data was not rotted. Local `src/data/_raw/CONTROLS.json` is byte-equivalent to upstream `prinnyo/grc-framework-mapping-tool` across all 118 controls and 14 cross-reference fields. The real failure mode was **invisibility**, not corruption — the UI never surfaced the full cross-framework neighborhood, so missing or sparse mappings looked the same as zero mappings.

The rebuild pivoted from "repair the data" to "lock the integrity in CI and make the graph visible to users." Both outcomes shipped.

---

## What we built

| Milestone | Deliverable | Commit |
|-----------|-------------|--------|
| **M9.1** Baseline & safety net | stash UI tweaks, branch `data-integrity-rebuild`, snapshot CONTROLS.json, `.gitignore` rebuild artifacts | `7bd5fd2` |
| **M9.2** Upstream truth | `scripts/extract-upstream-controls.mjs`, `docs/UPSTREAM_DIFF.md`, the byte-equivalence finding | `d255492` |
| **M9.3** Integrity tooling | `src/domain/mapping-integrity.test.ts` (3 invariants), `npm run validate:mappings`, CI gate before typecheck | `d1cbf8a` |
| **M10.1-M10.4** Repair | **collapsed** — M9.2 proved no work needed | — |
| **M11.1** Neighborhood component | `ControlNeighborhoodView.tsx` (10-row grid, em-dash empties, optional onRefClick) + 8 vitest cases | `e1db356` |
| **M11.2** Wire-up & route | `ControlNeighborhoodPage.tsx`, `/neighborhood/iso/:id` route, "View full neighborhood" link in ControlCard | `d8cb60c` |
| **M11.3** E2E coverage | 3 Playwright cases: happy path + not-found + sparse-mapping em-dash assertion | `af366fc` |
| **M11.4** Docs & handoff | README integrity section, MAPPING_DATAFLOW.md, CLAUDE.md, this retro | (this commit) |

---

## Metrics before -> after

| Metric | Pre-M9 baseline | Post-M11 |
|--------|-----------------|----------|
| Orphan cross-refs | unknown (no detector) | **0** (proven and gated) |
| Drift vs upstream | unknown (no comparison) | **0** (audited 2026-05-17) |
| Test files | 41 | **44** |
| Vitest tests | 245 | **256** |
| Playwright tests | 1 | **4** |
| CI integrity gate | none | active (`validate:mappings` before typecheck) |
| UI cross-framework visibility | populated-only (`MappingBadges`) | full 10-row grid with visible empties (`ControlNeighborhoodView`) |
| Forensic record | none | `docs/UPSTREAM_DIFF.md` + this retro |

---

## What worked

1. **Forensic-before-fix.** The M9.2 byte-equivalence finding saved an entire milestone of unnecessary "repair" work. The instinct was right: measure before assuming rot.
2. **Small sprint commits.** 7 reviewable commits across 7 branches made each step easy to audit and revert. The M1-M8 cadence pattern carried over cleanly.
3. **CI gate ordering.** Putting `validate:mappings` BEFORE typecheck means data failures fail the build immediately and visibly, not buried after a 60-second test run.
4. **Visible empties.** The em-dash + accessible-label pattern means future drift is impossible to miss — a regression that empties an N-mapped cell now shows up as a visible em-dash on the page.
5. **Reuse over reinvention.** `mapping-engine.ts` already had `parseCrossRefs`, `getMappingsForControl`, `getIsoControlsForRef`. The new component and validator both reused them — zero re-implementation, zero divergence risk.

## What we changed mid-flight

1. **M10 collapsed.** Original plan had 4 repair sprints; data was intact so all 4 became no-ops. Documented in the plan and in this retro rather than silently dropped — preserves the audit trail.
2. **`.ts` -> `.mjs` for one-shot scripts.** The plan called for `scripts/validate-mappings.ts` and `scripts/diff-upstream-mappings.ts`. Decided `npm run validate:mappings` = `vitest run <file>` is cleaner (one source of truth, no new tsx dep) and used `.mjs` for `extract-upstream-controls` (no TS overhead for one-shot).
3. **Reverse-lookup deferred.** Plan called for HierarchyControlCard wire-up (non-ISO -> ISO -> neighborhood traversal). Time-boxed it out of M11.2 because the design is non-trivial (merging multiple ISO controls into a single neighborhood view). Direct ISO neighborhood traversal works; reverse path is a follow-up.

## What could go wrong if we hadn't done this

Without **M9.3 (CI gate)**: a future contributor (human or Claude) deletes a comma from one cross-ref string, silently dropping a mapping. No test catches it. Months later, an auditor exports a SoA, sees the missing mapping, and you have a credibility incident.

Without **M11.1-M11.3 (visible empties)**: the user keeps perceiving "interconnectedness sacrificed" every time they look at a sparse control, because the UI shows nothing where mappings could exist. The data is fine but the trust is gone.

Without **M9.2 (forensic doc)**: every future "did we lose mappings?" anxiety triggers a 2-hour investigation. Now it's a 5-minute `npm run extract:upstream` + diff.

---

## Lessons for future sessions

1. **Measure before you repair.** The user's pain is real but their attribution may be wrong. Forensic the data layer first; trust the diff, not the story.
2. **Visibility is integrity.** Data that exists but isn't surfaced is effectively missing for the user. Hide-empty-rows is a UI bug that masquerades as a data bug.
3. **CI gates pay for themselves on the first regression they catch.** The orphan check took ~30 minutes to write. It now protects an indefinite future.
4. **Collapse milestones with documentation, not silent drops.** When a planned sprint turns out unnecessary, mark it collapsed in the task tracker, document the reason in the retro, and keep the audit trail. Future contributors should be able to reconstruct why M10 has no commits.
5. **The hub-and-spoke topology is fine.** A central crosswalks table sounds cleaner but adds an indirection layer and a synchronization problem. The hub model (ISO 27001 as source of truth) is simpler and easier to audit. Don't refactor topology without a concrete reason.

---

## Carry-forward work

These items were intentionally deferred. Not bugs, not regressions — just out of scope for the M9-M11 rebuild.

1. **HierarchyControlCard wire-up to neighborhood view.** Clicking a NIST subcategory in `/nist-csf-2` should open a neighborhood that shows all ISO controls mapping to that subcategory and their merged cross-framework graph. Design: pages take `(framework, refId)`, resolve via `getIsoControlsForRef`, render merged `ControlMappings` from `getTransitiveMappings`.
2. **Hash-anchor scroll-into-view.** Clicking a non-ISO badge in the neighborhood view navigates to `/<framework>#<refId>`. The hash is currently preserved but framework views don't yet scroll to the matching row. Easy enhancement.
3. **Stashed UI tweaks reconciliation.** M9.1 stashed 6 cosmetic edits removing `BentoProfileCard`. They sit in `git stash list` as `stash@{0}`. Decide: pop + commit, or drop.
4. **Phase 2 framework expansion.** ISMAP, APPI, ISO 27701, ISO 42001, DORA, etc. — schedule as M12+.
5. **Reverse-mapping documentation.** `getIsoControlsForRef` is correct but undocumented. A short section in `MAPPING_DATAFLOW.md` showing the reverse pattern would help future reverse-lookup work.

---

## Commit log (M9-M11)

```
af366fc test(m11): s3 e2e coverage for control neighborhood navigation
d8cb60c feat(m11): s2 wire neighborhood view into ControlCard + route
e1db356 feat(m11): s1 ControlNeighborhoodView component
d1cbf8a feat(m9):  s3 mapping integrity tooling + CI gate
d255492 chore(m9): s2 upstream truth acquisition + critical finding
7bd5fd2 chore(m9): s1 baseline & safety net
```

(M11.4 handoff commit appears after this file is written.)
