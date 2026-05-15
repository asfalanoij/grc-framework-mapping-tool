import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SoaJustification } from './SoaJustification';

describe('<SoaJustification />', () => {
  it('renders the current text', () => {
    const onChange = vi.fn();
    render(<SoaJustification justification="existing reason" onChange={onChange} />);
    expect(screen.getByLabelText(/SoA exclusion justification/i)).toHaveValue('existing reason');
  });

  it('propagates each keystroke through onChange', async () => {
    const onChange = vi.fn();
    render(<SoaJustification justification="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/SoA exclusion justification/i), 'abc');
    // userEvent.type fires one onChange per character with the new character as value
    // (because the parent never updates `justification` between keystrokes).
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls.map((c) => c[0])).toEqual(['a', 'b', 'c']);
  });
});
