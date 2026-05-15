import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { FilterChips } from './FilterChips';
import { useFiltersStore } from '../../store/filters.store';

beforeEach(() => {
  useFiltersStore.getState().clearAll();
});

describe('<FilterChips />', () => {
  it('renders nothing when no filters are active', () => {
    render(<FilterChips />);
    expect(screen.queryByTestId('active-filter-chips')).not.toBeInTheDocument();
  });

  it('lists a chip for every active filter', () => {
    useFiltersStore.getState().setQuery('mfa');
    useFiltersStore.getState().toggleIsoCategory('Organizational');
    useFiltersStore.getState().toggleIsoStatus('implemented');
    render(<FilterChips />);
    expect(screen.getByLabelText(/active filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Organizational/)).toBeInTheDocument();
    expect(screen.getByText(/implemented/)).toBeInTheDocument();
    expect(screen.getByText(/"mfa"/)).toBeInTheDocument();
  });

  it('clicking a chip removes that filter', async () => {
    useFiltersStore.getState().toggleIsoCategory('Physical');
    render(<FilterChips />);
    await userEvent.click(screen.getByRole('button', { name: /remove filter: physical/i }));
    expect(useFiltersStore.getState().iso.categories).toEqual([]);
  });
});
