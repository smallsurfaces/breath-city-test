import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 p-8 bg-background">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--bc-semantic-brand)" }}
        >
          <span className="text-xl font-bold" style={{ color: "var(--bc-color-white)" }}>
            BC
          </span>
        </div>

        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: "var(--bc-semantic-text)" }}
        >
          Breathe Cities — Design System
        </h1>

        <p
          className="text-base max-w-md"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Component library and design token catalogue for the Breathe Cities
          air quality monitoring platform.
        </p>
      </div>

      <nav className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/design-system"
          className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-medium transition-colors"
          style={{
            backgroundColor: "var(--bc-semantic-brand)",
            color: "var(--bc-color-white)",
            borderRadius: "var(--bc-border-radius-md)",
          }}
        >
          Design System →
        </Link>

      </nav>

      <div className="flex flex-col items-center gap-4">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          UX Concepts
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              Direction 01 — Mapbox Prototype
            </span>
            <Link
              href="/direction-1-mapbox"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Live Map →
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              Direction 01 — PM2.5 Triangulation Concept
            </span>
            <Link
              href="/direction-1-mapbox-v2"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Live Map →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Phase 3 — Visual Directions
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              Direction 01 — Clear Signal
            </span>
            <Link
              href="/direction-1-light"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-light-grey)",
                color: "var(--bc-semantic-text)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Light →
            </Link>
            <Link
              href="/direction-1-dark"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-dark-blue)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Dark →
            </Link>
            <Link
              href="/direction-1-final"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-semantic-aqi-good-bg)",
                color: "var(--bc-semantic-aqi-good-text)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Direction 01 — Clear Signal (Final) →
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              Direction 02 — Open Sky
            </span>
            <Link
              href="/direction-2-light"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-light-grey)",
                color: "var(--bc-semantic-text)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Light →
            </Link>
            <Link
              href="/direction-2-dark"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-dark-blue)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Dark →
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              Direction 03 — Civic Depth
            </span>
            <Link
              href="/direction-3-light"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-light-grey)",
                color: "var(--bc-semantic-text)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Light →
            </Link>
            <Link
              href="/direction-3-dark"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-dark-blue)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Dark →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
