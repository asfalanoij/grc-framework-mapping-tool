# Phase 1 — Architecture Modernisation

**Status:** Approved (brainstorm) — pending implementation plan
**Date:** 2026-05-14
**Owner:** Repo maintainer
**Cadence:** Heavy (10+ hrs/week)
**Predecessor:** None — this is the foundation phase
**Successor phases:** Phase 2 (framework coverage expansion), Phase 3 (team + backend), Phase 4 (AI copilot)

---

## 1. Context

CtrlMap is currently a single 791 KB, 8,608-line `index.html` file containing React 18 (via CDN), embedded data for 118 ISO 27001:2022 controls, mappings to 10 other cybersecurity frameworks, vanilla CSS, and inline application logic. It is deployed to GitHub Pages at `prinnyo.github.io/grc-framework-mapping-tool/`.

The monolithic file is functional and well-loved, but it blocks every downstream initiative the maintainer wants to pursue:
- Cannot easily add new frameworks (e.g. ISMAP, APPI, ISO 42001) without inflating an already-large file
- Cannot add a backend / multi-user mode without a real client–server boundary
- Cannot add AI features (RAG, chat-with-controls) without data and code being addressable as modules
- Difficult to test, review, or contribute to

Phase 1 converts this monolith into a maintainable Vite + React 18 + TypeScript + Tailwind project — without visual or functional regression, using a strangler-fig migration so the live tool stays up at every step.

## 2. Goal

> Convert `index.html` into a modular Vite + React 18 + TypeScript + Tailwind project deployed to the existing GitHub Pages URL, with zero visual regression, zero functional regression, and full feature parity verified by an automated check-list audit at the cutover milestone.

## 3. Non-goals (out of scope)

| Out of scope | Why deferred |
|---|---|
| New frameworks (ISMAP, APPI, ISO 42001, DORA, HIPAA, FedRAMP, CSA CCM, ISO 27701) | Phase 2 — needs modular data layer first |
| Backend / multi-user / auth | Phase 3 — needs stable client API surface first |
| AI copilot / RAG / chat-with-controls | Phase 4 — needs Phases 2+3 |
| Visual redesign | Token-mapped Tailwind preserves current look intentionally |
| Mobile-first responsive overhaul | Current tool is desktop-first; revisit in a later phase |
| i18n / Japanese UI | Pair with ISMAP/APPI in Phase 2 |
| Public REST API | Phase 3 |
| Analytics / telemetry | Out of scope; add behind consent in Phase 3 |
| Concrete Sentry/error reporting provider | Phase 1 ships a `reportError()` interface only |

## 4. Decisions

| Topic | Decision | Rationale |
|---|---|---|
| Migration strategy | **Strangler fig (incremental)** | Live tool stays up at every milestone; risk distributed across PRs |
| Stack | **Vite + React 18 + TypeScript** | Closest to current React 18 code; fast dev server; static SPA still works on GitHub Pages; strong typing for control/mapping data |
| Styling | **Tailwind CSS** with theme tokens ported from current CSS custom properties | Industry-standard; preserves design language 1:1 via token mapping |
| State / persistence | **Zustand + IndexedDB (Dexie)** | Zustand: small, simple, ergonomic. Dexie/IDB lifts the localStorage 5–10 MB cap (a real problem as evidence and frameworks grow) and enables offline-first |
| Testing | **Pragmatic pyramid** — Vitest + RTL for unit/component, single Playwright smoke E2E | High-ROI coverage on domain/data/exporters where bugs hurt; lower coverage on UI where bugs are visible and recoverable |
| Deployment | **GitHub Pages** at existing URL | Preserves bookmarks; zero cost; GitHub Actions deploys on push to `main` |
| CI | GitHub Actions: typecheck → lint → vitest → Playwright → deploy on `main` | Standard, free, integrates with Pages |

## 5. Repository layout (target state, post-cutover)

```
grc-framework-mapping-tool/
├── .github/workflows/
│   ├── ci.yml                 # typecheck, lint, vitest, playwright
│   └── deploy-pages.yml       # build + deploy to gh-pages on main
├── docs/
│   ├── ecc/specs/             # design docs (this file)
│   └── adr/                   # per-milestone ADRs (M1–M8)
├── public/                    # favicons, og image, robots.txt
├── src/
│   ├── app/                   # AppShell, router, theme provider, error boundary
│   ├── components/            # shared leaf presentation components
│   ├── features/
│   │   ├── frameworks/        # FrameworkView container + per-framework renderers
│   │   ├── controls/          # ControlCard, EvidenceChecklist, ScoreSelector, SoaJustification
│   │   ├── search/            # SearchBar, autocomplete, global-search mode
│   │   ├── filters/           # FilterPanel, FilterChips
│   │   ├── export/            # csvExporter, xlsxExporter, soaExporter (headless)
│   │   ├── home/              # ReadinessHome, FrameworkCard, ReadinessDonut
│   │   └── tour/              # Quick-tour overlay
│   ├── data/
│   │   ├── frameworks/        # one TS module per framework (iso27001.ts, nist-csf-2.ts, …)
│   │   ├── mappings/          # ISO ↔ framework cross-references
│   │   ├── evidence-templates.ts
│   │   └── schemas.ts         # zod schemas — validated at module load
│   ├── domain/                # pure logic, 100% unit-tested
│   │   ├── mapping-engine.ts  # transitive reverse mapping
│   │   ├── scoring.ts
│   │   ├── filters.ts
│   │   ├── search.ts
│   │   └── result.ts          # Result<T,E> type
│   ├── services/
│   │   ├── persistence.ts     # Dexie schema + repositories
│   │   └── migration.ts       # one-shot localStorage → IDB import
│   ├── store/                 # Zustand slices
│   │   ├── scores.store.ts
│   │   ├── evidence.store.ts
│   │   ├── filters.store.ts
│   │   └── ui.store.ts
│   ├── styles/
│   │   ├── tokens.css         # CSS variables (ported from legacy)
│   │   └── index.css          # Tailwind imports
│   ├── types/                 # shared TS types
│   ├── main.tsx               # Vite entry
│   └── vite-env.d.ts
├── tests/
│   ├── fixtures/              # golden CSV/XLSX, localStorage snapshots
│   └── e2e/smoke.spec.ts      # Playwright smoke
├── index.html                 # Vite entry HTML (replaces legacy at M8)
├── tailwind.config.ts         # theme tokens
├── vite.config.ts             # base=/grc-framework-mapping-tool/
├── tsconfig.json
├── package.json
└── README.md
```

During migration, `legacy/index.html` holds the frozen original; it is deleted at M8.

## 6. Milestones (strangler-fig)

Each milestone is independently shippable to GitHub Pages.

| # | Milestone | What ships | Live URL serves |
|---|-----------|------------|------------------|
| M1 | Scaffold | Vite/TS/Tailwind/ESLint/Vitest/Playwright; empty v2 shell at `/v2/`; CI green | legacy at `/`, v2 shell at `/v2/` |
| M2 | Data extraction | All framework data, mappings, evidence templates extracted to typed TS modules with zod schemas + golden-file tests asserting counts (118 ISO controls, 106 NIST CSF subcategories, 61 SOC 2 TSC, 153 CIS Safeguards, 41 NCSC CAF outcomes, etc.) | unchanged |
| M3 | Domain modules | Pure logic ported (transitive mapping engine, filter predicates, scoring, search) with 100% unit coverage | unchanged |
| M4 | Persistence | Dexie schema + repositories + Zustand stores; idempotent localStorage→IDB import | unchanged |
| M5 | ISO 27001 view in v2 | First framework view rendered in the new stack with feature parity (control cards, scoring, evidence, expand/collapse, ISO 27002 descriptions) | `/v2/` is real |
| M6 | Filters / search / home | Sidebar filters, smart search (in-framework + global), home page with readiness donuts | `/v2/` matches legacy for ISO view |
| M7 | Multi-framework parity | Remaining 10 framework views ported (NIST CSF 2.0, SOC 2, CIS v8, PCI DSS 4.0.1, Cyber Essentials v3.1, NIST 800-53, NIS 2, ISO 22301, ISO 27017, NCSC CAF) | `/v2/` reaches parity |
| M8 | Cutover | CSV/XLSX/SoA exports ported; Playwright smoke green; delete `legacy/`; `/` now serves v2 | v2 at `/` (current URL preserved) |

**Order rationale:** data → domain → persistence → UI pins down the truth (data + math) before any pixels are drawn. This minimises "did I break a mapping?" risk and makes UI work mechanical.

## 7. Component architecture

```
<AppShell>                                  src/app/AppShell.tsx
├── <TopBar>                                framework tabs, theme toggle, global-search toggle
│   └── <SearchBar>                         in-framework + global mode
├── <Sidebar>                               src/features/filters/
│   ├── <FilterPanel>                       stackable pills, per-framework filter sets
│   └── <FilterChips>                       active filter summary, "Clear all"
├── <Toolbar>                               src/features/export/
│   ├── <ExportMenu>                        CSV / XLSX / SoA buttons
│   └── <ViewSwitcher>                      list / table (table = future)
└── <Outlet>                                React Router
    ├── /                <ReadinessHome>    donut grid, 11 framework cards
    ├── /iso27001        <Iso27001View>     Annex A + MS clauses, ISO 27002 detail
    ├── /nist-csf-2      <NistCsfView>      Function → Category → Subcategory
    ├── /soc2            <Soc2View>         TSC categories CC1–CC9, A1, P1
    ├── /cis-v8          <CisView>          Controls 1–18, IG tiers
    ├── /pci-dss-4       <PciView>          Goal → Requirement → Sub-req
    ├── /cyber-essentials <CyberEssentialsView>
    ├── /nist-800-53     <Nist80053View>
    ├── /nis2            <Nis2View>
    ├── /iso22301        <Iso22301View>
    ├── /iso27017        <Iso27017View>
    └── /ncsc-caf        <NcscCafView>      Objective → Principle → Outcome + IGP
```

**Shared leaf components (one implementation, reused across all framework views):**

| Component | Responsibility |
|---|---|
| `<ControlCard>` | Renders one control: ID, title, statement, type/domain badges, scoring selector, expand toggle |
| `<MappingBadges>` | Cross-framework chips with click-through |
| `<EvidenceChecklist>` | Pre-populated tick-list + doc-ref input + notes textarea (persisted) |
| `<ScoreSelector>` | 4-state pill: Not started / In progress / Implemented / N/A |
| `<SoaJustification>` | Conditional textarea revealed on `N/A` for Annex A only |
| `<ReadinessDonut>` | SVG donut, % implemented, click-through |

## 8. Data flow

```
src/data/*.ts             Static, typed, zod-validated at boot
        │ (pure functions only)
        ▼
src/domain/*.ts           Pure logic, 100% unit-tested
        │
        ▼
src/store/*.store.ts      Zustand slices (live state)
    │              │
subscribe          hydrate / persist
    ▼              ▼
React          src/services/persistence.ts (Dexie / IndexedDB)
                   ▲
                   │ first-run only
                   │
              src/services/migration.ts (localStorage → IDB)

Exports (CSV / XLSX / SoA):
  store snapshot + data → exporters/ (pure builders, no React)
                       → Blob → triggerDownload()
```

**Data-flow rules (also captured in `rules/typescript/data-flow.md`):**

1. **Data is static, immutable, zod-validated at module load.** Mutation is a bug. Use `as const` and `Readonly<>` aggressively.
2. **Domain layer is pure.** No DOM, no fetch, no Dexie, no Zustand. Just data in → data out.
3. **Components subscribe, never mutate directly.** They call store actions; store actions call domain logic then write to repos.
4. **Persistence is async and lossy-tolerant.** UI updates optimistically; failed IDB writes surface a toast but never block.
5. **Exports never touch React.** They consume `{ data, store snapshot }` and produce blobs — testable in pure Vitest with fixture comparisons.

## 9. Error handling

| Boundary | Strategy |
|---|---|
| Module load | Fail fast: `zod.parse()` on every framework dataset at boot; throw with framework ID + missing field |
| Domain functions | Result-typed returns (`Result<T, E>` discriminated union); never throw |
| Zustand actions | Optimistic update + rollback on persistence failure (toast on failure) |
| IndexedDB I/O | Wrap in try/catch; return `Result`; caller decides degraded-mode behaviour |
| localStorage migration | Idempotent: writes a `__migrationVersion` key; re-run reads and skips |
| Export pipeline | Pure builders + IO at boundary: `csvExporter.build(snapshot) → string`, then `triggerDownload(string)` |
| React tree | Top-level `<ErrorBoundary>` with recovery button: "Your scores are safe in IndexedDB. Export your data:" wired to last-good snapshot |
| Routing 404s | Friendly `<NotFound>` with framework list and suggestion |

## 10. Testing strategy

**Pragmatic pyramid:**

```
                Playwright smoke (1 test, ~30s)
              ──────────────────────────────────
              Load app → switch to NIST CSF →
              score a control → export CSV →
              assert file downloaded + header row

         Integration (Vitest + jsdom + Dexie-in-memory)
       ──────────────────────────────────────────────────
       Store action → IDB roundtrip → re-hydrate test
       Migration: seed localStorage → run → assert IDB state
       Filter composition: stack 3 filters → assert count

  Unit (Vitest, pure)                  Component (Vitest + RTL)
────────────────────────              ──────────────────────────
src/domain/* → 100%                   <ControlCard> behaviour
  - mapping-engine                    <ScoreSelector> state
  - scoring                           <FilterPanel> toggles
  - filters                           <ExportMenu> dispatch
  - search                            Behaviour-heavy, snapshot-light

src/features/export/* fixture-driven:
  - CSV: golden-file diff against fixtures/iso27001-csv.csv
  - XLSX: assert sheet names, header row, row count
  - SoA: assert 93 Annex A rows always present regardless of filters
```

**Coverage gates (enforced in CI):**

| Path | Minimum | Why |
|---|---|---|
| `src/domain/**` | 100% lines + branches | Correctness is non-negotiable |
| `src/data/**` (schema validation) | 100% — boot-time `zod.parse()` | Wrong data = silent audit gap |
| `src/features/export/**` | 95% | Auditors trust exports |
| `src/services/**` | 80% | IDB happy-path + migration paths |
| `src/components/**`, `src/features/*/views/` | 60% | UI bugs visible and recoverable |
| Overall | 70% | Hard floor; achievable because domain (100%), data (100%), and export (95%) dominate LOC. If overall ever dips below 70%, raise the UI floor before adding new features. |

**Fixtures (`tests/fixtures/`):**
- `legacy-localstorage-v1.json` — snapshot of current tool's localStorage for migration tests
- `iso27001-csv-expected.csv`, `nist-csf-csv-expected.csv` — golden files for exports
- `soa-empty-expected.csv` — 93 rows, no scores
- `soa-partial-expected.csv` — mixed scores + justifications

## 11. CI / CD

`.github/workflows/ci.yml` (PR + push):
- `actions/checkout`
- `setup-node@v4` (Node 20)
- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run test -- --coverage`
- `npx playwright install --with-deps chromium`
- `npm run test:e2e`
- Upload coverage artefact

`.github/workflows/deploy-pages.yml` (push to `main`, after CI):
- `npm run build` (Vite, `base=/grc-framework-mapping-tool/`)
- `peaceiris/actions-gh-pages` → publish `dist/` to `gh-pages` branch

## 12. ECC ownership map

**Invocation conventions** (used in this section and §13):
- `/skills-ecc:<name>` — slash skills invoked in the active session
- `Agent(ecc-<name>)` — subagents delegated to via the `Agent` tool

| Surface | Primary owner | Secondary |
|---|---|---|
| `src/data/*` extraction from legacy | `Agent(ecc-planner)` (plan); scripted extract; `Agent(ecc-typescript-reviewer)` (output review) | `Agent(ecc-database-reviewer)` (schema shape) |
| `src/data/schemas.ts` (zod) | `Agent(ecc-typescript-reviewer)` | `Agent(ecc-tdd-guide)` (boot-validation tests) |
| `src/domain/mapping-engine.ts` | `Agent(ecc-tdd-guide)` | `Agent(ecc-typescript-reviewer)` |
| `src/domain/{scoring,filters,search}.ts` | `Agent(ecc-tdd-guide)` | `Agent(ecc-typescript-reviewer)` |
| `src/services/persistence.ts` (Dexie) | `/skills-ecc:database-migrations` | `Agent(ecc-tdd-guide)` |
| `src/services/migration.ts` | `Agent(ecc-tdd-guide)` | `Agent(ecc-typescript-reviewer)` |
| `src/store/*.store.ts` (Zustand) | `/skills-ecc:frontend-patterns` | `Agent(ecc-typescript-reviewer)` |
| `src/styles/` + Tailwind tokens | `/skills-ecc:design-system` | `/skills-ecc:make-interfaces-feel-better` |
| `src/components/` | `/skills-ecc:frontend-patterns` | `/skills-ecc:accessibility`, `Agent(ecc-typescript-reviewer)` |
| `src/features/*/` views | `/skills-ecc:frontend-patterns` | `/skills-ecc:click-path-audit` at M8 |
| `src/features/export/*` | `Agent(ecc-tdd-guide)` (fixtures) | `Agent(ecc-typescript-reviewer)` |
| `tests/e2e/smoke.spec.ts` | `Agent(ecc-e2e-runner)` | — |
| Vite/Tailwind/TS configs | `/skills-ecc:vite-patterns` | `Agent(ecc-build-error-resolver)` |
| `.github/workflows/*` | `/skills-ecc:git-workflow` rule + `Agent(ecc-planner)` | — |
| `docs/` (spec, PRD, ADRs) | `Agent(ecc-doc-updater)` | `/skills-ecc:update-docs` |

**Per-milestone ECC invocation:**

```
M1 Scaffold      → /skills-ecc:plan + Agent(ecc-planner) → Agent(ecc-build-error-resolver) if Vite/Tailwind hiccup
M2 Data extract  → Agent(ecc-tdd-guide) (golden-file tests first) → Agent(ecc-typescript-reviewer) on PR
M3 Domain        → /skills-ecc:tdd-workflow (test-first every function) → /skills-ecc:test-coverage (100% gate)
M4 Persistence   → /skills-ecc:database-migrations + Agent(ecc-tdd-guide) → Agent(ecc-typescript-reviewer)
M5 ISO view      → /skills-ecc:frontend-patterns + /skills-ecc:design-system → /skills-ecc:accessibility on ControlCard
M6 Filters/etc.  → /skills-ecc:frontend-patterns → /skills-ecc:click-path-audit
M7 Other views   → per framework: /skills-ecc:frontend-patterns implementation → Agent(ecc-typescript-reviewer) PR review → /skills-ecc:click-path-audit feature-parity check before merge
M8 Cutover       → Agent(ecc-e2e-runner) smoke E2E + /skills-ecc:verification-loop + Agent(ecc-refactor-cleaner) legacy purge
```

## 13. Success criteria (binary checks at M8 cutover)

1. `/` on `prinnyo.github.io/grc-framework-mapping-tool/` serves the new Vite build, not the legacy HTML.
2. Every feature in the current README works in v2 — verified by `/skills-ecc:click-path-audit` against a checklist generated at M8 by walking every feature paragraph in `README.md` (one row per documented capability).
3. A user with existing localStorage data sees their scores/evidence on first load of v2 (migration ran).
4. CSV, XLSX, SoA exports produce byte-identical or semantically-identical output to legacy (golden-file diff).
5. Coverage gates green in CI; Playwright smoke green; typecheck + lint green.
6. Lighthouse Performance ≥ 90 on first load. Baseline: measure the legacy score before M1 and record in the M1 ADR; v2 must beat that baseline.
7. `legacy/index.html` deleted; repo no longer ships duplicate code.
8. Spec, PRD, and per-milestone ADRs committed under `docs/`.

## 14. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Data extraction from legacy HTML drops a mapping silently | M | H | Golden-file count assertions in M2 (118 ISO, 106 NIST CSF, 153 CIS, 41 NCSC CAF outcomes, etc.); zod validation at module load |
| Tailwind port shifts pixels enough to upset existing users | H | M | Visual regression PR on M5 via Playwright screenshot diff; CSS custom properties ported 1:1 as Tailwind tokens |
| IndexedDB quota / unsupported in private browsing | L | M | Persistence detects and falls back to in-memory + warning toast; user can still export |
| GitHub Pages base path breaks routes | M | L | Hash router or base-aware browser router; Playwright smoke catches |
| Strangler-fig drags past M7 because each framework view is bespoke | M | M | Strict per-view budget: if a view is >2 days, ship via legacy-iframe fallback and convert in Phase 2 |
| User loses localStorage data during migration | L | H | Migration is read-only on localStorage (never deletes); user can manually re-import from backup |

## 15. Open questions (to resolve before plan)

None at spec time. All four pivotal choices (migration, stack, styling, state) decided during brainstorming.

## 16. References and out-of-scope methodologies

**References:**
- Source repo: `https://github.com/prinnyo/grc-framework-mapping-tool`
- Legacy entry: `index.html` (791 KB, 8,608 lines, React 18 via CDN)
- Current live URL: `https://prinnyo.github.io/grc-framework-mapping-tool`

**Invocation conventions** (canonical for this project):
- `/skills-ecc:<name>` — slash skills (e.g. `/skills-ecc:plan`, `/skills-ecc:tdd-workflow`)
- `Agent(ecc-<name>)` — subagents (e.g. `Agent(ecc-planner)`, `Agent(ecc-typescript-reviewer)`)
- All ECC components for this project are catalogued in §12; new contributors should reuse those before adding new tooling.

**Out of scope — methodologies deliberately not used here:**
- `superpowers:*` workflow plugins (e.g. `superpowers:writing-plans`, `superpowers:brainstorming`, `superpowers:tdd`). The brainstorming session that produced this spec used `superpowers:brainstorming`, but planning and execution from this point onward run under ECC only.
- `gsd:*` (Get Stuff Done) phase plugins (e.g. `gsd:plan-phase`, `gsd:execute-phase`).

Contributors should not reintroduce `superpowers:*` or `gsd:*` invocations into plans, ADRs, PR bodies, or workflow files. If a capability is missing in ECC, prefer adding it to ECC (`/skills-ecc:skill-create`) over depending on the deprecated stacks.
