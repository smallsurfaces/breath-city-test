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

        <Link
          href="/air-quality"
          className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-medium transition-colors"
          style={{
            backgroundColor: "var(--bc-color-light-grey)",
            color: "var(--bc-semantic-text)",
            borderRadius: "var(--bc-border-radius-md)",
          }}
        >
          Air Quality →
        </Link>
      </nav>
    </main>
  );
}
