// CSV builder — pure function, no IO. RFC 4180-ish: comma delimiter,
// double-quote escaping, CRLF row separator. Optional UTF-8 BOM prepended
// so Excel opens it correctly without an import dialog.

export interface CsvOptions {
  readonly withBom?: boolean;
}

const BOM = '﻿';

export function buildCsv(
  rows: readonly (readonly (string | number | null | undefined)[])[],
  opts?: CsvOptions,
): string {
  const lines: string[] = [];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','));
  }
  const body = lines.join('\r\n');
  return (opts?.withBom ? BOM : '') + body + '\r\n';
}

function escapeCell(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
