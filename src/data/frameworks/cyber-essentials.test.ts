import { describe, it, expect } from 'vitest';
import { cyberEssentials, cyberEssentialsThemes, cyberEssentialsRequirements } from './cyber-essentials';

describe('Cyber Essentials', () => {
  it('groups the 5 official control themes', () => {
    expect(cyberEssentials.groups.length).toBe(5);
    expect(cyberEssentialsThemes.length).toBe(5);
  });

  it('expands to 16 sub-requirements across themes', () => {
    expect(cyberEssentialsRequirements.length).toBe(16);
  });

  it('all requirement IDs are unique', () => {
    const ids = cyberEssentialsRequirements.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
