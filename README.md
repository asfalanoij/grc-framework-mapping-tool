# CtrlMap v2 — GRC Framework Cross-Reference Atlas

A free, open-source tool that maps **118 ISO 27001:2022 controls** to **10 other GRC frameworks** simultaneously. Score, evidence-track, and export Statements of Applicability — all client-side in your browser.

> **CtrlMap v2** is a modular rebuild of the original [`prinnyo/grc-framework-mapping-tool`](https://github.com/prinnyo/grc-framework-mapping-tool). v1 was a single 791 KB HTML file; v2 is a typed Vite + React + TypeScript project with the same data, full test coverage on the domain logic, and a clean module boundary for the AI/team features planned in later phases.

## Live demo

👉 **https://asfalanoij.github.io/grc-framework-mapping-tool/**

## Features

- **11 framework views** — ISO 27001:2022, NIST CSF 2.0, SOC 2, CIS Controls v8, PCI DSS 4.0.1, Cyber Essentials, NIST SP 800-53 Rev 5, NIS 2, ISO 22301, ISO 27017, NCSC CAF
- **Transitive cross-mapping** — open any framework as the primary lens; the tool computes mappings to every other framework via the shared ISO 27001 spine
- **4-state scoring** — Not started / In progress / Implemented / N/A, persisted per-framework
- **Evidence tracking** — pre-populated checklists with doc references and notes
- **Statement of Applicability export** — formal SoA CSV covering all 93 Annex A controls with Applicable / Justification / Control Type / Security Domain / Status
- **Filters + search** — stackable category / control-type / security-domain / status / NIST function pills; in-framework search with autocomplete
- **Home readiness donuts** — live percent-implemented chart per framework
- **Offline-first** — IndexedDB persistence via Dexie; migrates legacy localStorage data on first load

## Exports

| Format | Action |
|---|---|
| **CSV** | Per-framework table with id, name, status, mappings, evidence, notes |
| **XLSX** | Same data as a spreadsheet (lazy-loaded — only fetched on click) |
| **SoA CSV** | ISO 27001 Annex A only (93 rows always) — Applicable Y/N + Justification + ISO 27002 statement + Control Type + Security Domain + Status |

## Stack

- Vite 5 + React 18 + TypeScript (strict)
- Tailwind CSS (theme tokens ported from the v1 CSS custom properties)
- Zustand (4 store slices: scores · evidence · justifications · UI prefs)
- Dexie 4 (IndexedDB)
- Zod (runtime data-shape validation at module load)
- SheetJS (lazy-loaded XLSX export)
- React Router 6 (lazy-loaded framework views)
- Vitest + @testing-library/react + Playwright

## Development

```bash
git clone https://github.com/asfalanoij/grc-framework-mapping-tool.git
cd grc-framework-mapping-tool
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm run test       # Vitest unit + integration
npm run test:e2e   # Playwright smoke
npm run build      # static build into dist/
```

## Project structure

```
src/
├── app/                     # AppShell, router, persistence provider
├── components/              # (currently unused — leaf components live under features/)
├── data/
│   ├── schemas.ts           # Zod schemas (validated at module load)
│   ├── frameworks/          # one typed TS module per framework (11 files)
│   ├── _raw/                # extracted JSON (input to the framework modules)
│   ├── evidence-templates.ts
│   └── framework-registry.ts
├── domain/                  # pure logic; 100% line/function coverage gated in CI
│   ├── mapping-engine.ts    # transitive reverse-mapping math
│   ├── scoring.ts           # SoA-correct readiness %
│   ├── filters.ts           # predicate composition
│   └── search.ts            # substring index + autocomplete ranking
├── services/                # persistence (Dexie) + localStorage migration
├── store/                   # Zustand slices: scores / evidence / justifications / ui / filters
├── features/
│   ├── frameworks/          # one view per framework + 3 generic shells
│   ├── controls/            # ControlCard, HierarchyControlCard, ScoreSelector, …
│   ├── filters/             # FilterPanel, FilterChips, FilterPill
│   ├── search/              # SearchBar
│   ├── home/                # ReadinessDonut, Home
│   └── export/              # CSV / XLSX / SoA builders + ExportMenu
└── styles/                  # Tailwind tokens
```

## Tests + coverage

CI enforces per-path coverage thresholds:

| Path | Lines | Branches | Functions | Statements |
|---|---|---|---|---|
| `src/domain/**` | **100%** | 95% | **100%** | **100%** |
| `src/services/**` | 80% | 80% | 80% | 80% |
| `src/store/**` | 80% | 80% | 80% | 80% |
| Global floor | 70% | 70% | 70% | 70% |

## Roadmap

- **Phase 1 — Architecture modernisation** ✅ shipped (v2.0.0-alpha)
- **Phase 2 — Framework coverage expansion** (ISMAP, APPI, ISO 27701, ISO 42001 (AI), DORA, HIPAA, FedRAMP, CCM)
- **Phase 3 — Team collaboration + backend** (Supabase or FastAPI; multi-user; audit trail)
- **Phase 4 — AI copilot** (chat-with-controls, policy-to-control extraction, gap-analysis narratives)

See [`docs/ecc/pm/ROADMAP.md`](docs/ecc/pm/ROADMAP.md) and [`docs/ecc/pm/PROGRESS.md`](docs/ecc/pm/PROGRESS.md) for details.

## Credits

CtrlMap v2 is a fork-and-rebuild of [`prinnyo/grc-framework-mapping-tool`](https://github.com/prinnyo/grc-framework-mapping-tool) by Princess David Okoro. The data — control statements, cross-framework mappings, evidence templates, IGP criteria — comes from the original tool. The v2 maintainer ([@asfalanoij](https://github.com/asfalanoij)) is responsible for the new architecture, but credit for the substance goes to the v1 author.

## License

MIT.
