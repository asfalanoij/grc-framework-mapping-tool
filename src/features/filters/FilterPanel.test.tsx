import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { IsoFilterPanel } from './FilterPanel';
import { useFiltersStore } from '../../store/filters.store';

beforeEach(() => {
  useFiltersStore.getState().clearAll();
});

describe('<IsoFilterPanel />', () => {
  it('renders the five filter sections', () => {
    render(<IsoFilterPanel />);
    expect(screen.getByText(/ISO category/i)).toBeInTheDocument();
    expect(screen.getByText(/Control type/i)).toBeInTheDocument();
    expect(screen.getByText(/Security domain/i)).toBeInTheDocument();
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
    expect(screen.getByText(/NIST CSF function/i)).toBeInTheDocument();
  });

  it('toggling a category pill writes to the store', async () => {
    render(<IsoFilterPanel />);
    await userEvent.click(screen.getByRole('switch', { name: /organizational/i }));
    expect(useFiltersStore.getState().iso.categories).toEqual(['Organizational']);
  });

  it('shows "Clear all" only when something is active', async () => {
    render(<IsoFilterPanel />);
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch', { name: /preventive/i }));
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('Clear all resets every dimension', async () => {
    render(<IsoFilterPanel />);
    await userEvent.click(screen.getByRole('switch', { name: /organizational/i }));
    await userEvent.click(screen.getByRole('switch', { name: /preventive/i }));
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(useFiltersStore.getState().hasAnyActiveFilter()).toBe(false);
  });
});
