import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App shell', () => {
  it('mounts and shows the brand link after migration', async () => {
    render(<App />);
    // PersistenceProvider runs migration on mount; once done the header renders.
    // Match the brand link exactly to disambiguate from "CtrlMap v2" in the Home heading.
    expect(await screen.findByRole('link', { name: /^ctrlmap v2$/i })).toBeInTheDocument();
  });

  it('exposes the primary navigation', async () => {
    render(<App />);
    await screen.findByRole('link', { name: /^ctrlmap v2$/i });
    // Scope to the primary navigation region — Home also contains an inline link
    // pointing to /iso27001 with the same accessible name.
    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(within(nav).getByRole('link', { name: /^iso 27001$/i })).toBeInTheDocument();
  });
});
