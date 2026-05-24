import Link from "next/link";
import { CONCEPTS } from "./_data/concept-registry";

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
          Design Hub
        </h1>

        <p
          className="text-base max-w-md"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Research, concepts, visual directions, the design system, and
          integrations for Breathe Cities.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Research
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              JTBD Framework — Matrix
            </span>
            <Link
              href="/jtbd-framework"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Open →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          UX Concepts
        </p>

        {/* Concept catalogue. Each concept has exactly ONE shipping build after the v1-retire
            pass, so every entry is a single "Open →" pointing at the concept's canonical route.
            Both the display title AND the route come from the single-source concept registry
            (src/app/_data/concept-registry.ts) so the hub label, the route, and the per-concept
            PrototypeHeader bar never drift. */}
        <div className="flex flex-col gap-3 w-full max-w-xl">
          {[
            CONCEPTS.roadmap,
            CONCEPTS.residentConcerns,
            CONCEPTS.toolkit,
            CONCEPTS.aqNetwork,
          ].map((concept) => (
            <div key={concept.route} className="flex items-center gap-3">
              <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
                {concept.title}
              </span>
              <Link
                href={concept.route}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--bc-semantic-brand)",
                  color: "var(--bc-color-white)",
                  borderRadius: "var(--bc-border-radius-md)",
                }}
              >
                Open →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Design System
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              Component Library & Tokens
            </span>
            <Link
              href="/design-system"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Open →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Integrations
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xl">
          <div className="flex items-center gap-3">
            <div className="flex flex-col w-52 shrink-0">
              <span className="text-sm" style={{ color: "var(--bc-semantic-text)" }}>
                Air Quality — Live OpenAQ Data (London / Accra)
              </span>
              <span className="text-xs" style={{ color: "var(--bc-semantic-muted)" }}>
                Integration / plumbing test — live Mapbox + OpenAQ
              </span>
            </div>
            <Link
              href="/direction-2-live-data"
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

          {/* Direction-01 Mapbox prototypes — regrouped here under Integrations (they are
              live-Mapbox plumbing explorations, not catalogue UX concepts). Routes unchanged. */}
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
    </main>
  );
}
