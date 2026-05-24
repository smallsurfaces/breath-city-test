/**
 * concept-registry.ts — single source of truth for UX-concept display titles + routes.
 *
 * Purpose
 *   Each UX concept has exactly ONE display title, defined here once and consumed by BOTH:
 *     1. the hub home page (src/app/page.tsx) — the catalogue entry label, and
 *     2. the per-concept PrototypeHeader tooling bar (via each concept layout's buildName) —
 *        so the bar shows the SAME name as the hub, with no drift.
 *
 *   Before this registry the two surfaces hardcoded their own strings (the hub said one thing,
 *   the bar said "<concept> vN — concept"), so renaming a concept meant editing it in several
 *   places and risking divergence. Now the title lives here once; both surfaces read it.
 *
 * Naming
 *   The display titles are the "Global Site Concept - …" catalogue names locked by Jack. The
 *   "vN — concept" suffix the bar used to append is GONE — the bar shows the plain concept name
 *   (v1 and v2 of a concept share the same name; the route/link distinguishes them).
 *
 * Shape
 *   Keyed by a stable concept id. Each entry carries the canonical `title` and the concept's
 *   primary `route` (the v1 / "Open →" destination). v2 and sub-routes are NOT enumerated here —
 *   they reuse the same title and are linked from the hub directly; only the primary route lives
 *   in the registry (it is what the hub's primary "Open →" points at).
 *
 * Key exports: ConceptId (type), CONCEPTS (const record), conceptTitle (helper).
 * External dependencies: none.
 */

/** Stable concept identifiers — one per UX concept (NOT per version). */
export type ConceptId = 'roadmap' | 'residentConcerns' | 'toolkit' | 'aqNetwork'

/** A single concept's catalogue entry: its canonical title + primary route. */
export type ConceptEntry = {
  /** The one canonical display title — shown on the hub AND in the PrototypeHeader bar. */
  title: string
  /** The concept's primary route (the v1 / "Open →" destination). */
  route: string
}

/**
 * The concept registry. Edit a title here and BOTH the hub catalogue entry and the concept's
 * PrototypeHeader bar update together — no per-surface drift.
 */
export const CONCEPTS: Record<ConceptId, ConceptEntry> = {
  roadmap: {
    title: 'Global Site Concept - BC AQ Roadmap',
    route: '/ux-concepts/best-practice-roadmap',
  },
  residentConcerns: {
    title: 'Global Site Concept - Resident Concerns',
    route: '/ux-concepts/cities',
  },
  toolkit: {
    // Consolidated: the old JTBD per-city audit + the new component catalogue collapse into ONE
    // hub entry pointing at /ux-concepts/toolkit (the new build).
    title: 'Global Site Concept - BC City AQ Toolkit',
    route: '/ux-concepts/toolkit',
  },
  aqNetwork: {
    title: 'Global Site Concept - BC AQ Network Membership',
    route: '/ux-concepts/aq-network',
  },
}

/** Convenience accessor for a concept's canonical title (used by the PrototypeHeader layouts). */
export function conceptTitle(id: ConceptId): string {
  return CONCEPTS[id].title
}
