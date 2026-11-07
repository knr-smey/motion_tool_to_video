export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground font-[family-name:var(--font-moul)] text-sm">
          ក
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">KineticCast Khmer</span>
          <span className="text-xs text-muted">Script-to-video engine</span>
        </div>
      </div>

      <button
        type="button"
        disabled
        title="Run `npm run remotion:render` to export an MP4"
        className="rounded-md border border-border bg-surface-raised px-4 py-1.5 text-sm text-muted cursor-not-allowed"
      >
        Export
      </button>
    </header>
  );
}
