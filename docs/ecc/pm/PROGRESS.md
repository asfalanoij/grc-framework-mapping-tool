# CtrlMap v2 — Phase 1 Progress

> Snapshot for stakeholders. Mirrors the spec at
> [`docs/ecc/specs/2026-05-14-phase1-architecture-modernisation-design.md`](../specs/2026-05-14-phase1-architecture-modernisation-design.md).

**Phase:** 1 — Architecture Modernisation
**Cadence:** Heavy (10+ hrs / week)
**Started:** 2026-05-14
**Last updated:** 2026-05-15

---

## Headline status

| | |
|---|---|
| **Milestones complete** | **4 / 8** (M1–M4) |
| **Open PRs** | 5 stacked (PR #1, #2, #4, #5, #6, #7) + 1 auto-generated (PR #3) |
| **Tests** | 178 / 178 passing across 25 files |
| **Coverage** | domain 100/99.61 · services 93/82 · stores 99/94 |
| **Bundle size (v2)** | 143 KB JS (gzip 46 KB) — 81% smaller than legacy 791 KB HTML |
| **Live URL** | `https://asfalanoij.github.io/grc-framework-mapping-tool` (deploys on `main` merge) |

```
M1 Scaffold              ████████████ DONE  (PR #2)
M2 Data extraction       ████████████ DONE  (PR #4 + #5)
M3 Domain                ████████████ DONE  (PR #6)
M4 Persistence           ████████████ DONE  (PR #7)
M5 ISO 27001 view        ░░░░░░░░░░░░ next
M6 Filters/search/home   ░░░░░░░░░░░░
M7 Multi-framework views ░░░░░░░░░░░░
M8 Cutover               ░░░░░░░░░░░░
```

---

## Sprint log

| Sprint | Milestone | PR | Headline | Tests delta |
|---|---|---|---|---|
| **S1** | **M1 Scaffold** | [#2](https://github.com/asfalanoij/grc-framework-mapping-tool/pull/2) | Vite + React 18 + TypeScript + Tailwind project with full dev tooling, ESLint, Vitest, Playwright, GitHub Actions CI + Pages deploy. Legacy preserved at `legacy/`. | +2 (App.test) |
| **S2** | **M2 Data extraction (1/2)** | [#4](https://github.com/asfalanoij/grc-framework-mapping-tool/pull/4) | 4 primary frameworks extracted to typed zod-validated TS modules: ISO 27001 (118 controls), NIST CSF 2.0 (106 subcategories), SOC 2 (61 criteria), CIS v8 (153 safeguards). | +29 |
| **S3** | **M2 Data extraction (2/2)** | [#5](https://github.com/asfalanoij/grc-framework-mapping-tool/pull/5) | Remaining 7 frameworks: PCI DSS, Cyber Essentials, NIST 800-53, NIS 2, ISO 22301, ISO 27017, NCSC CAF (bespoke 4/14/41 schema). **M2 complete — 11/11 frameworks.** | +23 |
| **S4** | **M3 Domain** | [#6](https://github.com/asfalanoij/grc-framework-mapping-tool/pull/6) | Correctness core: `Result<T,E>`, transitive mapping engine, scoring math (SoA-aware N/A exclusion), filter combinators, search index + autocomplete. **100% gated on `src/domain/**`.** | +83 |
| **S5** | **M4 Persistence** | [#7](https://github.com/asfalanoij/grc-framework-mapping-tool/pull/7) | Dexie schema (5 tables), 5 Result-typed repos, 3 Zustand stores with optimistic-update + rollback, idempotent legacy `localStorage` migration (handles flat + nested + malformed shapes). | +41 |

**Total: 178 tests / 25 test files / 5 sprints.**

---

## Open PR stack

Merge order matters — each PR is stacked on the previous one.

```
PR #1  align-ecc-skillset      → main                       (spec)
PR #2  m1-scaffold             → align-ecc-skillset         (scaffold)
PR #4  m2-data-extraction-1    → m1-scaffold                (data 1/2)
PR #5  m2-data-extraction-2    → m2-data-extraction-1       (data 2/2)
PR #6  m3-domain               → m2-data-extraction-2       (math)
PR #7  m4-persistence          → m3-domain                  (storage)

PR #3  ecc-tools auto-bundle (separate, not part of the M-chain)
```

When PR #1 merges, GitHub auto-rebases PR #2 against the new `main`, then PR #4 against the new `m1-scaffold`, and so on. You can self-review and merge them top-down.

---

## What ships when M5–M8 complete

| Milestone | Defines done | Estimated sprints |
|---|---|---|
| **M5** ISO 27001 view | Real `<ControlCard>` / `<ScoreSelector>` / `<EvidenceChecklist>` / `<SoaJustification>` for ISO 27001, driven by store + persistence. First framework view reaches feature parity with the legacy tool. | S6 (1 sprint) |
| **M6** Filters / search / home | Sidebar filter panel, smart search (in-framework + global), home page readiness donuts. ISO view becomes fully usable. | S7 (1 sprint) |
| **M7** Multi-framework parity | Port the remaining 10 framework views. NCSC CAF gets its bespoke objective/principle/outcome layout. | S8–S10 (2–3 sprints) |
| **M8** Cutover | CSV / XLSX / SoA export builders ported (golden-file diff against legacy fixtures). Playwright smoke covers the full flow. Delete `legacy/`. `/` serves v2. | S11 (1 sprint) |

**Estimated finish:** end of S11, around 5–6 sprints from now.

---

## Bundle size trend

| Sprint | Snapshot | JS size | Notes |
|---|---|---|---|
| S1 | M1 scaffold | 143 KB / gzip 46 KB | React 18 + minimal app shell |
| S2 | M2 part 1 | 143 KB | Data tree-shaken (no view importer yet) |
| S3 | M2 part 2 | 143 KB | Same — data still tree-shaken |
| S4 | M3 domain | 143 KB | Same — domain tree-shaken |
| S5 | M4 persistence | 143 KB | Same — services + stores tree-shaken |

Legacy `index.html`: **791 KB inline** (no tree-shaking, no caching). Even the bare scaffold beats it by **5.5×**, before any of the data, math, or storage gets pulled into actual screens.

---

## Coverage trend

Floor: 70% global (hard). Per-path gates per spec §10:

| Path | Lines | Branches | Functions | Statements | Gate |
|---|---|---|---|---|---|
| `src/domain/**` | 100 | 99.61 | 100 | 100 | 100/95/100/100 ✓ |
| `src/services/**` | 93.28 | 82.83 | 92.59 | 93.28 | 80/80/80/80 ✓ |
| `src/store/**` | 99.54 | 94 | 90.9 | 99.54 | 80/80/80/80 ✓ |
| All files | 92.99 | 93.96 | 93.42 | 92.99 | 70/70/70/70 ✓ |

Why the small branches allowance on domain: a single residual case in `search.ts` line 55 where v8 undercounts a `.map()` callback branch when the array is empty. Documented inline in `vitest.config.ts`.

---

## Risk burn-down

From the spec's risk register (§14):

| Risk | Status |
|---|---|
| Data extraction silently drops a mapping | **Retired.** Golden-file count assertions in M2: 118 ISO + 106 NIST CSF + 61 SOC 2 + 153 CIS + 41 CAF outcomes, etc., all asserted. Zod validates every dataset at module load. |
| Tailwind port shifts pixels enough to upset users | **Open.** Token-mapped 1:1 from legacy CSS vars in `tailwind.config.ts`. Visual regression check planned at M5 (screenshot diff). |
| IndexedDB unavailable / private browsing | **Mitigated.** Repos return `Result<T, RepoError>`; stores rollback on failure + record `lastError` for UI toast. Migration also handles `storage: null` explicitly. |
| GitHub Pages base path breaks routes | **Mitigated.** `vite.config.ts` sets `base=/grc-framework-mapping-tool/` for production builds; Playwright smoke runs against the production preview. Will re-verify at M5 with real routes. |
| Strangler-fig drags past M7 | **Open.** Per-framework view budget will be set at M5 once we know how long ISO 27001 takes. |
| User loses localStorage data during migration | **Retired.** Migration is read-only on localStorage (never deletes). Idempotency marker means re-runs are safe. Test coverage on flat / nested / malformed legacy shapes. |

---

## ECC components in active use

Per spec §12 ownership map:

| Surface | Owner |
|---|---|
| Spec + PRD + this file | `Agent(ecc-doc-updater)` + `/skills-ecc:update-docs` |
| Data extraction | `Agent(ecc-Explore)` (legacy mapping) + `Agent(ecc-typescript-reviewer)` |
| Domain logic | `Agent(ecc-tdd-guide)` + `/skills-ecc:test-coverage` |
| Persistence | `/skills-ecc:database-migrations` + `Agent(ecc-tdd-guide)` |
| Scaffold + Vite/Tailwind/TS | `/skills-ecc:vite-patterns` |
| CI workflows | `/skills-ecc:git-workflow` rule |
| **Pending for M5** | `/skills-ecc:frontend-patterns` + `/skills-ecc:design-system` + `/skills-ecc:accessibility` |

Methodology is locked to ECC; `superpowers:*` and `gsd:*` invocations are explicitly out of scope per spec §16.

---

## Open questions for the maintainer

None blocking. Two minor items worth a decision at M5:

1. **Visual regression baseline.** Should we capture a Playwright screenshot of the legacy tool now (before any of it is replaced) so M5–M8 can diff against a stable reference? Two-line change to the Playwright config.
2. **Bundle-size budget.** Spec §13.6 sets Lighthouse ≥ 90 as a M8 success criterion. Should we set an explicit JS-bundle cap (e.g. ≤ 250 KB gzipped at M8) and fail CI on breach?
