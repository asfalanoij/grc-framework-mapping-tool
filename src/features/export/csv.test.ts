import { describe, it, expect } from 'vitest';
import { buildCsv } from './csv';

const BOM = '﻿';

describe('buildCsv', () => {
  it('joins simple rows with CRLF and ends with CRLF', () => {
    expect(buildCsv([['a', 'b'], ['c', 'd']])).toBe('a,b\r\nc,d\r\n');
  });

  it('quotes values containing commas', () => {
    expect(buildCsv([['hello, world', 'safe']])).toBe('"hello, world",safe\r\n');
  });

  it('escapes double quotes by doubling', () => {
    expect(buildCsv([['she said "hi"']])).toBe('"she said ""hi"""\r\n');
  });

  it('quotes values containing CR or LF', () => {
    expect(buildCsv([['line one\nline two']])).toBe('"line one\nline two"\r\n');
  });

  it('treats null and undefined as empty', () => {
    expect(buildCsv([['a', null, 'c', undefined]])).toBe('a,,c,\r\n');
  });

  it('stringifies numbers', () => {
    expect(buildCsv([[1, 2.5, 0]])).toBe('1,2.5,0\r\n');
  });

  it('prepends a UTF-8 BOM when requested', () => {
    expect(buildCsv([['a']], { withBom: true })).toBe(BOM + 'a\r\n');
  });

  it('handles an empty input gracefully', () => {
    expect(buildCsv([])).toBe('\r\n');
  });
});
