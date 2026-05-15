import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TransitiveMappingBadges } from './TransitiveMappingBadges';

describe('<TransitiveMappingBadges />', () => {
  it('renders ISO 27001 controls reverse-mapped from a NIST CSF subcategory', () => {
    render(<TransitiveMappingBadges sourceFramework="NIST CSF 2.0" itemId="GV.OC-01" />);
    expect(screen.getByText('ISO 27001')).toBeInTheDocument();
    // The mapping reaches at least one ISO control id (4.1 maps to GV.OC-01).
    expect(screen.getByText('4.1')).toBeInTheDocument();
  });

  it('shows the no-mapping message when reverse lookup is empty', () => {
    render(<TransitiveMappingBadges sourceFramework="NIST CSF 2.0" itemId="ZZ.ZZ-99" />);
    expect(screen.getByText(/no ISO 27001 controls reference/i)).toBeInTheDocument();
  });

  it('rejects unknown frameworks gracefully', () => {
    render(<TransitiveMappingBadges sourceFramework="Banana 1.0" itemId="X.1" />);
    expect(screen.getByText(/no transitive mapping/i)).toBeInTheDocument();
  });
});
