import { Link } from 'react-router-dom';

export function Home() {
  return (
    <section className="space-y-6 p-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Welcome to CtrlMap v2</h2>
        <p className="mt-2 text-sm text-ink-3">
          11 GRC frameworks mapped to ISO 27001:2022. Modular Vite + React + TypeScript rebuild of the original
          single-file tool.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/iso27001"
          className="rounded-lg border border-border bg-surface p-4 transition hover:border-brand hover:shadow"
        >
          <h3 className="font-semibold text-ink">ISO 27001:2022</h3>
          <p className="mt-1 text-sm text-ink-3">118 controls — primary spine</p>
        </Link>
        <div className="rounded-lg border border-dashed border-border bg-surface-2 p-4 text-sm text-ink-3">
          Other framework views land at M7 — see <Link to="/iso27001" className="text-brand underline">ISO 27001</Link> for now.
        </div>
      </div>
    </section>
  );
}
