#!/usr/bin/env node
// Extracts the upstream prinnyo CONTROLS array from tmp/upstream/grc_framework_mapping.html
// into tmp/upstream/controls.json so it can be diffed against src/data/_raw/CONTROLS.json.
//
// The upstream is a single-file HTML app; mapping data lives inline as JS object literals
// inside <script> tags. We isolate the `var CLAUSES = [...]; var CONTROLS = CLAUSES.concat([...])`
// block and evaluate it in a vm sandbox to recover the array.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { resolve } from 'node:path';

const HTML_PATH = resolve('tmp/upstream/grc_framework_mapping.html');
const OUT_PATH = resolve('tmp/upstream/controls.json');

if (!existsSync(HTML_PATH)) {
  console.error(`Missing ${HTML_PATH}. Run \`git show upstream/main:grc_framework_mapping.html > ${HTML_PATH}\` first.`);
  process.exit(1);
}

const html = readFileSync(HTML_PATH, 'utf8');

const clausesStart = html.indexOf('var CLAUSES=[');
if (clausesStart < 0) {
  console.error('Could not locate `var CLAUSES=[` marker in upstream HTML. Schema may have moved.');
  process.exit(2);
}

const controlsHeader = 'var CONTROLS=CLAUSES.concat([';
const controlsStart = html.indexOf(controlsHeader, clausesStart);
if (controlsStart < 0) {
  console.error('Could not locate `var CONTROLS=CLAUSES.concat([` marker in upstream HTML.');
  process.exit(3);
}

const endMarker = '\n]);';
const endIdx = html.indexOf(endMarker, controlsStart);
if (endIdx < 0) {
  console.error('Could not locate CONTROLS array terminator `\\n]);` in upstream HTML.');
  process.exit(4);
}
const controlsEnd = endIdx + endMarker.length;

const blockText = html.slice(clausesStart, controlsEnd);
const script = `${blockText}\nCONTROLS;`;

let result;
try {
  result = vm.runInNewContext(script, {}, { timeout: 2000 });
} catch (err) {
  console.error('Failed to evaluate extracted block:', err.message);
  process.exit(5);
}

if (!Array.isArray(result)) {
  console.error('Extracted value is not an array. Aborting.');
  process.exit(6);
}

writeFileSync(OUT_PATH, JSON.stringify(result, null, 2) + '\n');

const mgmt = result.filter((c) => !c.id.startsWith('A.')).length;
const annex = result.length - mgmt;
console.log(`Extracted ${result.length} upstream controls -> ${OUT_PATH}`);
console.log(`  Management System clauses: ${mgmt}`);
console.log(`  Annex A controls:          ${annex}`);
