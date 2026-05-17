import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ControlNeighborhoodView } from './ControlNeighborhoodView';
import type { IsoControl } from '../../data/schemas';
import { frameworkPropKeys } from '../../domain/mapping-engine';

const richControl: IsoControl = {
  id: 'A.5.1',
  name: 'Policies for information security',
  isoDesc: 'Information security policy and topic-specific policies should be defined.',
  cat: 'Organizational',
  nistFunc: 'GOVERN',
  nistCat: 'GV.PO',
  nistSub: 'GV.PO-01, GV.PO-02',
  soc2: 'CC1.1, CC5.2',
  cis: 'CIS 1, CIS 2',
  pci: 'Req 12',
  ce: 'N/A',
  n80053: 'PM, PL',
  nis2: 'Art.21(a)',
  iso22301: 'Cl.5',
  iso27017: '§5',
  notes: '',
  caf: 'B1.a',
  ct: 'Preventive',
  sd: 'Governance and Ecosystem',
};

const emptyControl: IsoControl = {
  id: '4.1',
  name: 'Understanding the organization and its context',
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
  caf: 'N/A',
};

describe('<ControlNeighborhoodView />', () => {
  it('renders one row per non-ISO framework regardless of mapping presence', () => {
    render(<ControlNeighborhoodView control={richControl} />);
    expect(screen.getByText('NIST CSF 2.0')).toBeInTheDocument();
    expect(screen.getByText('SOC 2')).toBeInTheDocument();
    expect(screen.getByText('CIS v8')).toBeInTheDocument();
    expect(screen.getByText('PCI DSS')).toBeInTheDocument();
    expect(screen.getByText('Cyber Essentials')).toBeInTheDocument();
    expect(screen.getByText('NIST 800-53')).toBeInTheDocument();
    expect(screen.getByText('NIS 2')).toBeInTheDocument();
    expect(screen.getByText('ISO 22301')).toBeInTheDocument();
    expect(screen.getByText('ISO 27017')).toBeInTheDocument();
    expect(screen.getByText('NCSC CAF')).toBeInTheDocument();
  });

  it('renders all populated cross-ref badges from a rich control', () => {
    render(<ControlNeighborhoodView control={richControl} />);
    expect(screen.getByText('GV.PO-01')).toBeInTheDocument();
    expect(screen.getByText('GV.PO-02')).toBeInTheDocument();
    expect(screen.getByText('CC5.2')).toBeInTheDocument();
    expect(screen.getByText('CIS 2')).toBeInTheDocument();
    expect(screen.getByText('Req 12')).toBeInTheDocument();
    expect(screen.getByText('Art.21(a)')).toBeInTheDocument();
    expect(screen.getByText('§5')).toBeInTheDocument();
  });

  it('renders an em-dash with accessible label for the one N/A field (ce)', () => {
    render(<ControlNeighborhoodView control={richControl} />);
    expect(screen.getByLabelText('No Cyber Essentials mapping declared')).toBeInTheDocument();
  });

  it('renders all rows as em-dashes when every cross-ref is N/A', () => {
    render(<ControlNeighborhoodView control={emptyControl} />);
    for (const key of frameworkPropKeys) {
      expect(screen.getByTestId(`neighborhood-row-${key}`)).toBeInTheDocument();
    }
    const emptyMarkers = screen.getAllByText('—');
    expect(emptyMarkers).toHaveLength(frameworkPropKeys.length);
  });

  it('shows a population summary in the header', () => {
    render(<ControlNeighborhoodView control={richControl} />);
    expect(screen.getByText('9 / 10 frameworks mapped')).toBeInTheDocument();
  });

  it('renders 0 / 10 for an empty control', () => {
    render(<ControlNeighborhoodView control={emptyControl} />);
    expect(screen.getByText('0 / 10 frameworks mapped')).toBeInTheDocument();
  });

  it('renders badges as plain spans when no onRefClick handler is provided', () => {
    render(<ControlNeighborhoodView control={richControl} />);
    const badge = screen.getByText('GV.PO-01');
    expect(badge.tagName).toBe('SPAN');
  });

  it('renders badges as buttons and fires onRefClick when handler is provided', async () => {
    const onRefClick = vi.fn();
    const user = userEvent.setup();
    render(<ControlNeighborhoodView control={richControl} onRefClick={onRefClick} />);
    const badge = screen.getByText('GV.PO-01');
    expect(badge.tagName).toBe('BUTTON');
    await user.click(badge);
    expect(onRefClick).toHaveBeenCalledWith('nistSub', 'GV.PO-01');
  });
});
