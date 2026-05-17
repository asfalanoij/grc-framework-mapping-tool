# Upstream Diff Reconciliation — M9.2

> Generated 2026-05-17 during M9.2 (Upstream Truth Acquisition).
> Source: `git fetch upstream` from `https://github.com/prinnyo/grc-framework-mapping-tool.git`
> Compared: `tmp/upstream/controls.json` (extracted) ↔ `src/data/_raw/CONTROLS.json` (local)

---

## Upstream layout

The upstream `prinnyo/grc-framework-mapping-tool` is a **single-page HTML application**, not a modular JavaScript project. Its entire data layer lives inline as JS object literals inside one `<script>` tag.

```
upstream/main (4 tracked files):
  .gitignore
  README.md                                 (10 KB)
  grc_framework_mapping.html                (791 KB, 8,608 lines)
  index.html                                (identical blob to grc_framework_mapping.html)
```

**Mapping data location inside the HTML:**

| Block | Lines | Content |
|-------|-------|---------|
| `var NIST_HIER = { ... }` | 517 | NIST CSF 2.0 hierarchy (groups → sections → items) |
| `var PCI_HIER = { ... }` | 3853 | PCI DSS hierarchy |
| `var CE_HIER = { ... }` | 4093 | Cyber Essentials hierarchy |
| `var CIS_HIER = { ... }` | 4487 | CIS v8 hierarchy |
| `var CAF_DESC = (function() { ... })()` | 6319 | NCSC CAF description map |
| `var CLAUSES = [ ... ]` | **6347 – 6373** | **25 ISO 27001 Management System clauses (4.1 – 10.x)** |
| `var CONTROLS = CLAUSES.concat([ ... ])` | **6374 – 6468** | **+93 ISO 27001 Annex A controls — total 118** |
| `var ISO_DESC = (function() ...)()` | 6473 | derived from CONTROLS |
| Framework registry | 6485 – 6487 | declares ISO 22301, ISO 27017, NCSC CAF (props + HIER refs) |

Extraction script: `scripts/extract-upstream-controls.mjs` reads the HTML, isolates `CLAUSES` + `CONTROLS` via `indexOf` boundary markers, evaluates in a `vm.runInNewContext` sandbox, and writes `tmp/upstream/controls.json`.

---

## Schema correspondence

The IsoControl shape is **field-identical** to our local `src/data/_raw/CONTROLS.json`. No reconciliation needed; no transform required.

| Field           | Type   | Mgmt System (4.x–10.x) | Annex A (A.5.x – A.8.x) | Local Zod field | Notes |
|-----------------|--------|------------------------|-------------------------|-----------------|-------|
| `id`            | string | required               | required                | `id`            | same |
| `name`          | string | required               | required                | `name`          | same |
| `isoDesc`       | string | required               | required                | `isoDesc`       | same |
| `cat`           | string | `"Management System"`  | `"Organizational"` / `"People"` / `"Physical"` / `"Technological"` | `cat`        | same enum |
| `nistFunc`      | string | required               | required                | `nistFunc`      | same |
| `nistCat`       | string | required               | required                | `nistCat`       | same |
| `nistSub`       | string | required               | required                | `nistSub`       | same — comma-separated NIST CSF subcategory IDs |
| `soc2`          | string | required               | required                | `soc2`          | same |
| `cis`           | string | required               | required                | `cis`           | same |
| `pci`           | string | required               | required                | `pci`           | same |
| `ce`            | string | required               | required                | `ce`            | same |
| `n80053`        | string | **absent**             | required                | `n80053`        | **upstream only populates on Annex A**; mgmt clauses inherit `undefined`, treated as `N/A` |
| `nis2`          | string | **absent**             | required                | `nis2`          | same — Annex A only upstream |
| `iso22301`      | string | **absent**             | required                | `iso22301`      | same |
| `iso27017`      | string | **absent**             | required                | `iso27017`      | same |
| `caf`           | string | required               | required                | `caf`           | same |
| `notes`         | string | required               | required                | `notes`         | same |
| `ct`            | string | **absent**             | required                | `ct`            | Control Type — Annex A only |
| `sd`            | string | **absent**             | required                | `sd`            | Security Domain — Annex A only |

**No `LOCAL-ONLY` fields.** Local does not extend the schema beyond upstream.

**No `UPSTREAM-ONLY` fields.** Local includes every upstream field.

---

## Value-level diff (THE CRITICAL FINDING)

Inline scan during M9.2 (see `node` one-liner in commit body):

```
Controls only in upstream:  0
Controls only in local:     0
Per-field drift (any cross-ref):  0
Per-field local_lost (upstream→N/A):  0
Per-field local_added (N/A→upstream):  0
Strict per-field diff across ALL keys: 0
```

**Local `src/data/_raw/CONTROLS.json` is functionally identical to upstream `prinnyo/grc-framework-mapping-tool` CONTROLS array.** All 118 controls, all 14 cross-reference fields, all metadata — match exactly.

The `diff -q` byte-level comparison still flags the files as different, but that delta is JSON formatting (whitespace, key order). No semantic divergence.

---

## What this means for the rebuild

The initial premise — "data mappings are wrong/missing/stale" — is **not supported by the CONTROLS.json layer**. The hub of the hub-and-spoke mapping graph is intact.

**Remaining places where rot could live:**

| Possible rot location | M9.3 will detect | M10 action |
|----------------------|------------------|------------|
| Cross-refs point to NIST/SOC2/CIS IDs that don't exist in our local target framework HIER files | yes (`validate-mappings` orphan check) | repair orphans in CONTROLS.json or fix target HIER |
| Local target framework HIER files (NIST_HIER.json, etc.) drifted from upstream HIER blobs | partially (orphan check catches anything referenced; pure orphans not referenced go undetected) | optional second-pass: extract upstream HIER blocks and diff |
| Other raw files (FRAMEWORKS.json, _summary.json, CLAUSES.json, ISO_EVIDENCE.json) drifted | not directly | spot-check at M9 review |
| Wiring between data layer and UI views broken | no (out of scope for M9) | M11 neighborhood view will expose this if present |
| User's recollection of the prior session worse than actual state | confirmed by this doc | M10 scope likely reduces to a no-op confirmation PR |

**Revised expectation for M9–M11:**

- **M9.3** stays as planned — build `validate-mappings.ts` and `mapping-integrity.test.ts`. The orphan check is the only outstanding integrity question.
- **M10.1 / 10.2 / 10.3** likely have **little to no work**. If orphan count = 0, M10 collapses into a single "data confirmed intact" sprint.
- **M11** becomes the highest-value milestone — surfacing cross-framework relationships in the UI is now the primary user-visible improvement, since the underlying data is already correct.

---

## Other upstream data blocks (deferred)

The following upstream JS blocks exist in `grc_framework_mapping.html` but were not extracted in M9.2 (out of scope unless M9.3 orphan detection points to them):

- `NIST_HIER` (line 517) — local equivalent: `src/data/_raw/NIST_HIER.json`
- `PCI_HIER` (line 3853) — local equivalent: `src/data/_raw/PCI_HIER.json`
- `CE_HIER` (line 4093) — local equivalent: `src/data/_raw/CE_HIER.json`
- `CIS_HIER` (line 4487) — local equivalent: `src/data/_raw/CIS_HIER.json`

If M9.3 reports orphans, the extraction script in M9.2 will be extended to dump these blocks too, and M9.3 will diff target-framework leaves against upstream.

---

## Reproducing this diff

```bash
cd /Users/asfalanoi/app_oct2025/grc-framework-mapping-tool

# 1. Fetch upstream
git fetch upstream

# 2. Extract upstream HTML
mkdir -p tmp/upstream
git show upstream/main:grc_framework_mapping.html > tmp/upstream/grc_framework_mapping.html

# 3. Extract controls array
node scripts/extract-upstream-controls.mjs
# -> tmp/upstream/controls.json (118 controls)

# 4. Cross-field comparison
node -e "
const up = require('./tmp/upstream/controls.json');
const lo = require('./src/data/_raw/CONTROLS.json');
const upById = new Map(up.map(c => [c.id, c]));
const loById = new Map(lo.map(c => [c.id, c]));
let diffs = 0;
for (const [id, uc] of upById) {
  const lc = loById.get(id) || {};
  for (const k of new Set([...Object.keys(uc), ...Object.keys(lc)])) {
    if (uc[k] !== lc[k]) diffs++;
  }
}
console.log('diffs:', diffs);
"
# -> diffs: 0
```
