// One-shot extractor: reads legacy/index.html, runs the embedded JS in a
// Node vm sandbox with mocked React/ReactDOM/etc., then dumps the data
// structures we care about to src/data/_raw/*.json.
//
// Run with: node scripts/extract-legacy-data.mjs
// The output JSON is committed to the repo. Re-run if legacy/index.html
// ever changes (it shouldn't — legacy is frozen).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const legacyPath = join(repoRoot, 'legacy/index.html');
const outDir = join(repoRoot, 'src/data/_raw');

const html = readFileSync(legacyPath, 'utf8');

// The embedded script block runs from line 514 (<script>) to 8606 (</script>).
// We pull the content between them.
const scriptOpenIdx = html.indexOf('<script>\nvar e=React.createElement');
if (scriptOpenIdx === -1) throw new Error('Could not find opening <script> with React.createElement');
const scriptStart = html.indexOf('\n', scriptOpenIdx) + 1;
const scriptEnd = html.lastIndexOf('</script>');
if (scriptEnd === -1 || scriptEnd <= scriptStart) throw new Error('Could not find closing </script>');
const scriptText = html.slice(scriptStart, scriptEnd);

console.log(`Loaded legacy script (${scriptText.length} bytes, ~${scriptText.split('\n').length} lines)`);

// Mock the React + DOM surface so the script runs without errors.
const noop = () => undefined;
const fakeReact = {
  createElement: noop,
  useState: (initial) => [initial, noop],
  useMemo: (f) => f(),
  useCallback: (f) => f,
  useEffect: noop,
  useRef: () => ({ current: null }),
  Fragment: 'Fragment',
};
const fakeReactDOM = {
  createRoot: () => ({ render: noop }),
};
const fakeXLSX = {
  utils: { aoa_to_sheet: () => ({}), book_new: () => ({}), book_append_sheet: noop },
  write: () => '',
  writeFile: noop,
};
function FakeWorkbook() {
  this.xlsx = { writeBuffer: async () => new Uint8Array() };
  this.addWorksheet = () => ({ addRow: noop, columns: [], getCell: () => ({ value: '', alignment: {}, font: {}, fill: {} }), eachRow: noop });
}
const fakeExcelJS = { Workbook: FakeWorkbook };

const ctx = {
  React: fakeReact,
  ReactDOM: fakeReactDOM,
  XLSX: fakeXLSX,
  ExcelJS: fakeExcelJS,
  document: {
    getElementById: () => null,
    createElement: () => ({ click: noop, setAttribute: noop, style: {}, appendChild: noop }),
    body: { appendChild: noop, removeChild: noop },
  },
  window: {},
  navigator: { clipboard: { writeText: async () => undefined } },
  Blob: function Blob() { return {}; },
  URL: { createObjectURL: () => '', revokeObjectURL: noop },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  console: { log: () => {}, warn: () => {}, error: () => {} },
  setTimeout, clearTimeout, setInterval, clearInterval,
};
vm.createContext(ctx);

try {
  vm.runInContext(scriptText, ctx, { filename: 'legacy/index.html', timeout: 10_000 });
} catch (err) {
  console.error('Script execution failed:', err.message);
  console.error('First 200 chars of last line referenced:');
  process.exit(1);
}

const datasets = {
  CLAUSES: ctx.CLAUSES,
  CONTROLS: ctx.CONTROLS,
  NIST_HIER: ctx.NIST_HIER,
  SOC2_HIER: ctx.SOC2_HIER,
  CIS_HIER: ctx.CIS_HIER,
  PCI_HIER: ctx.PCI_HIER,
  CE_HIER: ctx.CE_HIER,
  N80053_HIER: ctx.N80053_HIER,
  NIS2_HIER: ctx.NIS2_HIER,
  ISO22301_HIER: ctx.ISO22301_HIER,
  ISO27017_HIER: ctx.ISO27017_HIER,
  CAF: ctx.CAF,
  ISO_EVIDENCE: ctx.ISO_EVIDENCE,
  FRAMEWORKS: ctx.FRAMEWORKS,
};

mkdirSync(outDir, { recursive: true });
const summary = {};
for (const [name, data] of Object.entries(datasets)) {
  if (data === undefined) {
    console.warn(`  WARN: ${name} is undefined`);
    continue;
  }
  const file = join(outDir, `${name}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2));
  const count = Array.isArray(data) ? data.length
    : (data && typeof data === 'object' && 'groups' in data) ? data.groups.length
    : (data && typeof data === 'object') ? Object.keys(data).length
    : 'n/a';
  summary[name] = { count, type: Array.isArray(data) ? 'array' : typeof data, file };
  console.log(`  ${name}: ${count} top-level items → ${file}`);
}

writeFileSync(join(outDir, '_summary.json'), JSON.stringify(summary, null, 2));
console.log(`\nDone. Wrote ${Object.keys(summary).length} datasets to ${outDir}`);
