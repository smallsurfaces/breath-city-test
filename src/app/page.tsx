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

          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              JTBD Framework — Research Lifecycle
            </span>
            <Link
              href="/jtbd-framework/architecture"
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

          {/* Concept catalogue entries. Display titles come from the single-source concept
              registry (src/app/_data/concept-registry.ts) so the hub label and the per-concept
              PrototypeHeader bar always read the same name. Only the toolkit consolidated to ONE
              link this pass (the new component-catalogue build); roadmap / resident-concerns /
              aq-network keep their existing Open→ + v2→ pair, just relabelled. */}
          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              {CONCEPTS.roadmap.title}
            </span>
            <Link
              href="/ux-concepts/best-practice-roadmap"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Open →
            </Link>
            <Link
              href="/ux-concepts/best-practice-roadmap-v2"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-light-grey)",
                color: "var(--bc-semantic-text)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              v2 — synchronised →
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              {CONCEPTS.residentConcerns.title}
            </span>
            <Link
              href="/ux-concepts/cities"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Open →
            </Link>
            <Link
              href="/ux-concepts/cities-v2"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-light-grey)",
                color: "var(--bc-semantic-text)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              v2 — synchronised →
            </Link>
          </div>

          {/* Toolkit — CONSOLIDATED to a SINGLE entry pointing at the new component-catalogue
              build (/ux-concepts/toolkit). The old JTBD per-city-audit links (jtbd-city-toolkit
              + -v2) and the separate "Component Catalogue" row were removed this pass.
              FLAG: this leaves a visible inconsistency — toolkit has ONE link while the other
              three concepts show two (Open→ / v2→). Left as-is per the brief (toolkit was the
              only concept to consolidate this pass); raised for Jack/design review. */}
          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              {CONCEPTS.toolkit.title}
            </span>
            <Link
              href="/ux-concepts/toolkit"
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

          <div className="flex items-center gap-3">
            <span className="text-sm w-52 shrink-0" style={{ color: "var(--bc-semantic-text)" }}>
              {CONCEPTS.aqNetwork.title}
            </span>
            <Link
              href="/ux-concepts/aq-network"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              Open →
            </Link>
            <Link
              href="/ux-concepts/aq-network-v2"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--bc-color-light-grey)",
                color: "var(--bc-semantic-text)",
                borderRadius: "var(--bc-border-radius-md)",
              }}
            >
              v2 — synchronised →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          Visual Design
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
        </div>
      </div>
    </main>
  );
}
