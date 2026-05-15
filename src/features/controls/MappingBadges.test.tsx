import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MappingBadges } from './MappingBadges';
import type { IsoControl } from '../../data/schemas';

const richControl: IsoControl = {
  id: 'A.5.1',
  name: 'Policy',
  isoDesc: 'desc',
  cat: 'Organizational',
  nistFunc: 'GOVERN',
  nistCat: 'GV.PO',
  nistSub: 'GV.PO-01, GV.PO-02',
  soc2: 'CC1.1',
  cis: 'CIS 1, CIS 2',
  pci: 'Req 12',
  ce: 'N/A',
  notes: '',
};

const emptyControl: IsoControl = {
  id: '4.1',
  name: 'Context',
  isoDesc: 'desc',
  cat: 'Management System',
  nistFunc: 'GOVERN',
  nistCat: 'GV.OC',
  nistSub: 'N/A',
  soc2: 'N/A',
  cis: 'N/A',
  pci: 'N/A',
  ce: 'N/A',
  notes: '',
};

describe('<MappingBadges />', () => {
  it('renders badges for every framework with refs', () => {
    render(<MappingBadges control={richControl} />);
    expect(screen.getByText('NIST CSF 2.0')).toBeInTheDocument();
    expect(screen.getByText('GV.PO-01')).toBeInTheDocument();
    expect(screen.getByText('CIS 2')).toBeInTheDocument();
    expect(screen.getByText('Req 12')).toBeInTheDocument();
  });

  it('shows an empty-state message when no mappings exist', () => {
    render(<MappingBadges control={emptyControl} />);
    expect(screen.getByText(/no cross-framework mappings/i)).toBeInTheDocument();
  });
});
