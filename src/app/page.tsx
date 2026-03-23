export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--bc-semantic-brand)" }}
        >
          <span className="text-2xl text-white font-bold">BC</span>
        </div>

        <h1
          className="text-4xl font-bold"
          style={{ color: "var(--bc-semantic-text)" }}
        >
          Breathe Cities
        </h1>

        <p
          className="text-lg max-w-md"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Phase 1 setup complete. Next.js app is running with shadcn/ui and
          Breathe Cities design tokens wired in.
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-xl p-6 flex flex-col gap-3"
        style={{
          backgroundColor: "var(--bc-color-light-grey)",
          borderRadius: "var(--bc-border-radius-md)",
        }}
      >
        <h2
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Token check
        </h2>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded"
            style={{
              backgroundColor: "var(--bc-semantic-brand)",
              borderRadius: "var(--bc-border-radius-sm)",
            }}
          />
          <span
            className="text-sm font-mono"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            --bc-semantic-brand
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded"
            style={{
              backgroundColor: "var(--bc-color-teal)",
              borderRadius: "var(--bc-border-radius-sm)",
            }}
          />
          <span
            className="text-sm font-mono"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            --bc-color-teal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded"
            style={{
              backgroundColor: "var(--bc-semantic-error)",
              borderRadius: "var(--bc-border-radius-sm)",
            }}
          />
          <span
            className="text-sm font-mono"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            --bc-semantic-error
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded"
            style={{
              backgroundColor: "var(--bc-semantic-success)",
              borderRadius: "var(--bc-border-radius-sm)",
            }}
          />
          <span
            className="text-sm font-mono"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            --bc-semantic-success
          </span>
        </div>
      </div>
    </main>
  );
}
