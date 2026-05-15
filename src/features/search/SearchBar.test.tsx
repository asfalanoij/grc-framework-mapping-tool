import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { SearchBar } from './SearchBar';
import { useFiltersStore } from '../../store/filters.store';

beforeEach(() => {
  useFiltersStore.getState().clearAll();
});

describe('<SearchBar />', () => {
  it('updates the filters store as the user types', async () => {
    render(<SearchBar />);
    await userEvent.type(screen.getByLabelText(/search controls/i), 'A.5.1');
    expect(useFiltersStore.getState().query).toBe('A.5.1');
  });

  it('shows autocomplete suggestions after typing', async () => {
    render(<SearchBar />);
    await userEvent.type(screen.getByLabelText(/search controls/i), 'A.5.1');
    expect(await screen.findByTestId('search-suggestions')).toBeInTheDocument();
  });

  it('hides suggestions when query is empty', () => {
    render(<SearchBar />);
    expect(screen.queryByTestId('search-suggestions')).not.toBeInTheDocument();
  });
});
