/**
 * /visual-concepts/bc-aq-roadmap — Visual concept: Global Site Concept - BC AQ Roadmap
 *
 * Purpose: In-hub landing page for the visual mockup of the Roadmap UX concept (previous work
 *          stream). Links out to the Figma prototype (plain link, not embedded) and across to the
 *          UX concept build.
 *
 * Key exports: default export BcAqRoadmapVisualConceptPage (Next.js App Router page)
 * External dependencies: PrototypeHeader, the single-source concept registry (CONCEPTS).
 */

import Link from "next/link";
import { PrototypeHeader } from "../../_components/PrototypeHeader";
import { CONCEPTS } from "../../_data/concept-registry";

const FIGMA_URL =
  "https://www.figma.com/proto/xyPcakbg26AL59CnFRDYWW/Breathe-Cities-V2?node-id=7932-21&viewport=588%2C148%2C0.15&t=CcifXU4zt9pZkJId-1&scaling=min-zoom&content-scaling=fixed&page-id=7932%3A2";

export default function BcAqRoadmapVisualConceptPage() {
  return (
    <>
      <PrototypeHeader
        buildName={`Visual Concept — ${CONCEPTS.roadmap.title}`}
        disclaimer="Concept visual design for BC AQ Roadmap UX concept"
      />
      <main className="min-h-screen flex flex-col items-center gap-8 p-8 bg-background">
        <div className="flex flex-col items-center gap-3 text-center max-w-xl">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--bc-semantic-muted)" }}
          >
            Visual Concepts
          </p>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            {CONCEPTS.roadmap.title}
          </h1>
          <p className="text-base" style={{ color: "var(--bc-semantic-muted)" }}>
            This is the visual mockup of the &ldquo;{CONCEPTS.roadmap.title}&rdquo; UX concept,
            from the previous work stream. It is a Figma prototype that opens in a new tab.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <a
            href={FIGMA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open the ${CONCEPTS.roadmap.title} Figma prototype (opens in a new tab)`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-base font-medium transition-colors"
            style={{
              backgroundColor: "var(--bc-semantic-brand)",
              color: "var(--bc-color-white)",
              borderRadius: "var(--bc-border-radius-md)",
            }}
          >
            Open in Figma <span aria-hidden="true">&nbsp;↗</span>
          </a>

          <Link
            href={CONCEPTS.roadmap.route}
            className="text-sm underline"
            style={{ color: "var(--bc-semantic-text)" }}
          >
            View the UX concept →
          </Link>
        </div>
      </main>
    </>
  );
}
