// Phase 1 / M1 scaffold shell.
// Real routing, framework views, and features land in M5–M7.
export function App() {
  return (
    <main
      data-testid="app-shell"
      className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h1 className="text-3xl font-semibold text-brand-text sm:text-4xl">CtrlMap v2</h1>
      <p className="max-w-prose text-ink-2">
        Phase 1 scaffold — Vite + React 18 + TypeScript + Tailwind. Strangler-fig migration in
        progress. The current production tool is preserved at <code className="font-mono">legacy/index.html</code>.
      </p>
      <p className="text-sm text-ink-3">
        Spec:{' '}
        <code className="font-mono">
          docs/ecc/specs/2026-05-14-phase1-architecture-modernisation-design.md
        </code>
      </p>
    </main>
  );
}
