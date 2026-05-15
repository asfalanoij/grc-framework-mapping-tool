# CtrlMap — Roadmap

Four-phase plan. Each phase ships independently and unlocks the next.

| Phase | Scope | Status | Doc |
|---|---|---|---|
| **1 — Architecture Modernisation** | Convert the 791 KB monolithic `index.html` into a modular Vite + React 18 + TypeScript + Tailwind project. Strangler-fig migration. GitHub Pages URL preserved. | **In progress** (4 / 8 milestones) | [Spec](../specs/2026-05-14-phase1-architecture-modernisation-design.md) · [Progress](./PROGRESS.md) |
| **2 — Framework Coverage Expansion** | Add ISMAP (Japan), APPI, ISO 27701, ISO 42001 (AI), DORA, HIPAA, FedRAMP Moderate, CSA CCM 4.0. Tighten existing mappings. Add i18n (English + Japanese). | Pending | TBD when P1 approaches M7 |
| **3 — Team Collaboration + Backend** | Supabase or FastAPI + Postgres. Multi-user workspaces, RBAC, shared evidence, approvals workflow, audit trail. Keep offline single-file fallback. | Pending | — |
| **4 — AI Copilot** | RAG over your frameworks + evidence. Chat-with-controls, policy-to-control extraction, gap-analysis narratives, evidence summarisation. | Pending | — |

---

## Phase 1 — milestone detail

Per [the spec §6](../specs/2026-05-14-phase1-architecture-modernisation-design.md):

| # | Milestone | Defines done | Status |
|---|---|---|---|
| M1 | **Scaffold** | Vite + React + TS + Tailwind + tests + CI green; legacy preserved | ✅ done |
| M2 | **Data extraction** | All 11 frameworks → typed zod-validated TS modules with count assertions | ✅ done |
| M3 | **Domain** | Pure mapping engine + scoring + filters + search at 100% line/function/statement coverage | ✅ done |
| M4 | **Persistence** | Dexie schema, Result-typed repos, Zustand stores, idempotent localStorage migration | ✅ done |
| M5 | **ISO 27001 view** | First framework rendered in v2 at parity with legacy: control cards, scoring, evidence, expand/collapse, ISO 27002 detail | ⏳ next |
| M6 | **Filters / search / home** | Sidebar filter pills, in-framework + global search, readiness donuts grid | pending |
| M7 | **Multi-framework parity** | Remaining 10 framework views ported; NCSC CAF's bespoke objective→principle→outcome layout | pending |
| M8 | **Cutover** | CSV + XLSX + SoA exports byte-identical or semantically-identical to legacy; smoke E2E covers the full flow; `legacy/` deleted; `/` serves v2 | pending |

---

## Phase 1 — success criteria (verbatim from spec §13)

1. `/` serves the new Vite build, not the legacy HTML.
2. Every README feature works in v2 — verified by `/skills-ecc:click-path-audit` against a checklist generated at M8.
3. Existing localStorage data is preserved on first load (migration ran).
4. CSV / XLSX / SoA exports byte-identical or semantically-identical to legacy.
5. Coverage gates green; Playwright smoke green; typecheck + lint green.
6. Lighthouse Performance ≥ 90 (baseline measured at M1, must improve).
7. `legacy/index.html` deleted.
8. Spec + PRD + ADRs committed under `docs/ecc/`.

---

## Phase 2 — framework expansion (sketch)

When P1 reaches M7, we'll write a Phase 2 spec under `docs/ecc/specs/`. Initial scope sketch:

- **ISMAP** — Japanese government cloud-security baseline (the Japan-market angle)
- **APPI** — Act on the Protection of Personal Information (Japan privacy)
- **ISO 27701** — Privacy Information Management System extension to 27001
- **ISO 42001** — AI Management System (newer, strategically aligned with the AI copilot in P4)
- **DORA** — Digital Operational Resilience Act (EU financial services)
- **HIPAA** Security Rule — US healthcare baseline
- **FedRAMP Moderate** — US federal cloud
- **CSA CCM 4.0** — Cloud Controls Matrix

Each framework will follow the same pattern proven in M2:
1. Source data into `src/data/_raw/<framework>.json`
2. Wrap in typed module with zod parsing under `src/data/frameworks/<framework>.ts`
3. Add count-assertion tests
4. Wire into framework registry
5. Render in `<FrameworkView>` (most code already exists from M5–M7)

Adding a framework in Phase 2 should be a 1–2-day task — the architecture is designed for it.

---

## Phase 3 — backend (sketch)

Open questions to resolve before Phase 3 starts:

- **Backend choice**: Supabase (faster to ship, hosted) vs FastAPI + Postgres (more control, self-hostable). User profile suggests Supabase for learning velocity.
- **Auth**: email + magic link vs OAuth (Google / Microsoft for enterprise users).
- **Sync model**: full-sync (client mirror) vs CRDT (multi-user concurrent edits) vs simple last-write-wins.
- **Offline-first**: keep the IndexedDB layer as the primary store, sync to backend in the background. Spec §3 notes a "fallback to offline single-file mode" — preserved.

---

## Phase 4 — AI copilot (sketch)

Three high-value AI surfaces:

1. **Chat-with-controls** — natural-language Q&A over the 11 frameworks + your evidence ("what's missing for SOC 2 readiness?"). RAG with embeddings.
2. **Policy-to-control extraction** — upload a policy doc, the AI tags it against framework controls automatically.
3. **Gap-analysis narrative** — given current scores and target framework, generate prose explaining what's missing and what to prioritise.

Will use ECC's `/skills-ecc:cost-aware-llm-pipeline` + `/skills-ecc:iterative-retrieval` + `/skills-ecc:eval-harness` skills.

---

## What "done" looks like for the whole product

All 4 phases shipped means:

- Free single-file static tool still works offline at the GitHub Pages URL (preserving the legacy ethos)
- Modular Vite project under public licence (anyone can fork, deploy on their own)
- Team subscription for multi-user / backend / SSO
- AI features on top tier

Each phase compounds the audience. P1 keeps the existing user base. P2 brings in Japanese GRC + AI compliance users. P3 makes the tool team-usable. P4 makes it a real product, not a free tool.
