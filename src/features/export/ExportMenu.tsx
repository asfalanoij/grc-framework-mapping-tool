// Toolbar for export actions. Each button calls a pure builder, then the
// boundary `triggerDownload` helper. ISO 27001 view passes `showSoa`;
// other frameworks omit the SoA button (SoA is ISO-only).
//
// Each handler is supplied by the calling view so this component stays
// agnostic of framework data.
import { useState } from 'react';
import { triggerDownload, timestampSlug } from './download';

export interface ExportMenuProps {
  readonly framework: string;
  readonly buildCsv: () => string;
  readonly buildXlsx?: () => Promise<Uint8Array>;
  readonly buildSoaCsv?: () => string;
}

export function ExportMenu({ framework, buildCsv, buildXlsx, buildSoaCsv }: ExportMenuProps) {
  const [working, setWorking] = useState<string | null>(null);

  const slug = framework.replace(/[\s/.]+/g, '-').toLowerCase();
  const ts = () => timestampSlug();

  async function onCsv() {
    setWorking('csv');
    try {
      triggerDownload(`ctrlmap-${slug}-${ts()}.csv`, buildCsv(), 'text/csv;charset=utf-8');
    } finally {
      setWorking(null);
    }
  }

  async function onSoa() {
    if (!buildSoaCsv) return;
    setWorking('soa');
    try {
      triggerDownload(`ctrlmap-soa-${ts()}.csv`, buildSoaCsv(), 'text/csv;charset=utf-8');
    } finally {
      setWorking(null);
    }
  }

  async function onXlsx() {
    if (!buildXlsx) return;
    setWorking('xlsx');
    try {
      const bytes = await buildXlsx();
      // TS5.6 narrowed Uint8Array.buffer; cast for the BlobPart contract.
      const blob = new Blob([bytes as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ctrlmap-${slug}-${ts()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setWorking(null);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="export-menu"
      aria-label="Export"
    >
      <button
        type="button"
        onClick={onCsv}
        disabled={working !== null}
        className="rounded-md border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2 disabled:opacity-60"
      >
        {working === 'csv' ? 'Building…' : 'Export CSV'}
      </button>
      {buildXlsx ? (
        <button
          type="button"
          onClick={onXlsx}
          disabled={working !== null}
          className="rounded-md border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2 disabled:opacity-60"
        >
          {working === 'xlsx' ? 'Building…' : 'Export XLSX'}
        </button>
      ) : null}
      {buildSoaCsv ? (
        <button
          type="button"
          onClick={onSoa}
          disabled={working !== null}
          className="rounded-md border border-brand bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-text hover:bg-brand-100 disabled:opacity-60"
        >
          {working === 'soa' ? 'Building…' : 'Export Statement of Applicability'}
        </button>
      ) : null}
    </div>
  );
}
