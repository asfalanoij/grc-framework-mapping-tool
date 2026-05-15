// Lightweight Result<T, E> discriminated union for boundary-error handling.
// Most pure domain functions return plain values; this type is for cases
// where the input space is wider than the valid set (e.g. an unknown
// framework key supplied from a URL).

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.ok;
}

export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return !r.ok;
}

// Map the success branch; pass-through on error. Useful for chaining.
export function map<T, U, E>(r: Result<T, E>, f: (v: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.value)) : r;
}

// Extract value or fall back. Use sparingly — prefer pattern-matching on
// `ok` so the error case stays visible at the call site.
export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return r.ok ? r.value : fallback;
}
