import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, map, unwrapOr, type Result } from './result';

describe('result', () => {
  it('ok() builds a success variant', () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    expect(r.value).toBe(42);
  });

  it('err() builds a failure variant', () => {
    const r = err('nope' as const);
    expect(r.ok).toBe(false);
    expect(r.error).toBe('nope');
  });

  it('isOk narrows to Ok', () => {
    const r: Result<number, string> = ok(1);
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value).toBe(1);
  });

  it('isErr narrows to Err', () => {
    const r: Result<number, string> = err('x');
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error).toBe('x');
  });

  it('map transforms the success value', () => {
    expect(map(ok(2), (n) => n * 3)).toEqual(ok(6));
  });

  it('map passes through errors unchanged', () => {
    const e: Result<number, string> = err('boom');
    expect(map(e, (n: number) => n * 3)).toEqual(err('boom'));
  });

  it('unwrapOr returns value on Ok', () => {
    expect(unwrapOr(ok(5), 99)).toBe(5);
  });

  it('unwrapOr returns fallback on Err', () => {
    const e: Result<number, string> = err('x');
    expect(unwrapOr(e, 99)).toBe(99);
  });
});
