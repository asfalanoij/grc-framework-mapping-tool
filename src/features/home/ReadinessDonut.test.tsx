import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReadinessDonut } from './ReadinessDonut';

describe('<ReadinessDonut />', () => {
  it('renders the rounded percent', () => {
    render(<ReadinessDonut percent={42.6} />);
    expect(screen.getByText('43%')).toBeInTheDocument();
  });

  it('clamps percent into [0, 100]', () => {
    const { rerender } = render(<ReadinessDonut percent={-50} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    rerender(<ReadinessDonut percent={250} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('uses the label for accessibility', () => {
    render(<ReadinessDonut percent={50} label="ISO 27001: 50% implemented" />);
    expect(screen.getByLabelText(/iso 27001: 50% implemented/i)).toBeInTheDocument();
  });
});
