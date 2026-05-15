import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportMenu } from './ExportMenu';

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:fake') as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
});

describe('<ExportMenu />', () => {
  it('always renders the CSV button', () => {
    render(<ExportMenu framework="ISO 27001" buildCsv={() => 'a,b'} />);
    expect(screen.getByRole('button', { name: /^export csv$/i })).toBeInTheDocument();
  });

  it('hides XLSX + SoA buttons when handlers are not provided', () => {
    render(<ExportMenu framework="ISO 27001" buildCsv={() => 'a,b'} />);
    expect(screen.queryByRole('button', { name: /export xlsx/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /statement of applicability/i })).not.toBeInTheDocument();
  });

  it('shows SoA button when handler is provided', () => {
    render(
      <ExportMenu framework="ISO 27001" buildCsv={() => 'a,b'} buildSoaCsv={() => 'h\r\n'} />,
    );
    expect(screen.getByRole('button', { name: /statement of applicability/i })).toBeInTheDocument();
  });

  it('clicking CSV invokes the builder', async () => {
    const buildCsv = vi.fn(() => 'a,b\r\n');
    render(<ExportMenu framework="ISO 27001" buildCsv={buildCsv} />);
    await userEvent.click(screen.getByRole('button', { name: /^export csv$/i }));
    expect(buildCsv).toHaveBeenCalled();
  });
});
