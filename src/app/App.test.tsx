import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App shell', () => {
  it('renders the v2 scaffold heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /ctrlmap v2/i })).toBeInTheDocument();
  });

  it('points to the spec file', () => {
    render(<App />);
    expect(
      screen.getByText(/docs\/ecc\/specs\/2026-05-14-phase1-architecture-modernisation-design\.md/),
    ).toBeInTheDocument();
  });
});
