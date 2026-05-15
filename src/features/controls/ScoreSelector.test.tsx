import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ScoreSelector } from './ScoreSelector';

describe('<ScoreSelector />', () => {
  it('renders four options when applicable=true', () => {
    render(<ScoreSelector status="not-started" onChange={() => {}} />);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('hides the N/A option for Management System clauses (applicable=false)', () => {
    render(<ScoreSelector status="not-started" onChange={() => {}} applicable={false} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.queryByRole('radio', { name: /n\/a/i })).not.toBeInTheDocument();
  });

  it('marks the active status as checked', () => {
    render(<ScoreSelector status="implemented" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: /implemented/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /not started/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('invokes onChange when a different status is clicked', async () => {
    const onChange = vi.fn();
    render(<ScoreSelector status="not-started" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: /in progress/i }));
    expect(onChange).toHaveBeenCalledWith('in-progress');
  });
});
