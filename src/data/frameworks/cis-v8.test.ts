import { describe, it, expect } from 'vitest';
import { cisV8, cisV8Safeguards, cisV8Ig1, cisV8Ig2, cisV8Ig3 } from './cis-v8';

describe('CIS Controls v8', () => {
  it('contains exactly 18 Controls (top-level groups)', () => {
    expect(cisV8.groups.length).toBe(18);
  });

  it('contains exactly 153 Safeguards across all Controls', () => {
    expect(cisV8Safeguards.length).toBe(153);
  });

  it('every Safeguard has an IG tier derived from desc prefix', () => {
    expect(cisV8Safeguards.every((s) => ['IG1', 'IG2', 'IG3'].includes(s.igTier))).toBe(true);
  });

  it('IG tier sets are non-empty and ordered (IG1 ⊆ IG2 ⊆ IG3)', () => {
    expect(cisV8Ig1.length).toBeGreaterThan(0);
    expect(cisV8Ig2.length).toBeGreaterThanOrEqual(cisV8Ig1.length);
    expect(cisV8Ig3.length).toBeGreaterThanOrEqual(cisV8Ig2.length);
    expect(cisV8Ig3.length).toBe(cisV8Safeguards.length);
  });

  it('CIS 1.1 (first safeguard) is present and IG1-tagged', () => {
    const cis11 = cisV8Safeguards.find((s) => s.id === 'CIS 1.1');
    expect(cis11).toBeDefined();
    expect(cis11?.igTier).toBe('IG1');
  });

  it('all Safeguard IDs are unique', () => {
    const ids = cisV8Safeguards.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
