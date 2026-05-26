/**
 * layout.tsx — Visual Concept v1: BC AQ Roadmap layout.
 *
 * Purpose
 *   Wraps every Visual Concept v1 (BC AQ Roadmap) page in the standard two-bar chrome:
 *     1. PrototypeHeader — tooling bar (sole "Back to hub" + comment widget + visual-concept
 *        disclaimer). Forked into the visual-concepts namespace so the disclaimer copy reads
 *        "This is a draft visual design concept, not the final design." (different from the
 *        shared chrome's UX-wireframe framing).
 *     2. BcHeader — the FORKED BC site chrome, driven by ROADMAP_CHROME so all live routes
 *        point at the visual-concepts paths and the concept is self-contained. BcFooter
 *        (forked, static) closes every page.
 *   Tooling bar on top, site nav below — matching the convention used by every other concept.
 *
 *   Fork origin
 *     This file is a fork of src/app/ux-concepts/best-practice-roadmap-v2/layout.tsx (commit
 *     09839c6 / tag wireframe-lock-2026-05-26). The fork exists so visual exploration on this
 *     concept cannot leak into the wireframe-locked UX concept. First-deploy render is identical
 *     to v2; visual evolution happens in subsequent sessions.
 *
 *   Chrome fork (round 2)
 *     This layout no longer imports from @/components/concept or src/app/_components/. All
 *     site-wide chrome (BcHeader, BcFooter, ConceptHero, ConceptStat, PrototypeHeader) has been
 *     forked into ./_chrome so future BC-brand visual edits inside this sandbox cannot leak
 *     into other concepts that depend on the shared chrome.
 *
 *   Title source
 *     The buildName shown in the PrototypeHeader is inlined here (not pulled from the shared
 *     CONCEPTS registry) because the concept-registry is the source-of-truth for UX concepts
 *     only. Visual concepts are a parallel exploration layer — adding them to the registry
 *     would change the registry's contract. Title kept as the locked catalogue name.
 *
 * Key exports: VisualRoadmapV1Layout (default)
 * External dependencies: ./_chrome (PrototypeHeader, BcHeader, BcFooter — all forked),
 *   ./roadmap-chrome.config (ROADMAP_CHROME).
 */

import { PrototypeHeader, BcHeader, BcFooter } from './_chrome'
import { ROADMAP_CHROME } from './roadmap-chrome.config'

/** Locked catalogue name for the Visual Concept v1 BC AQ Roadmap build — mirrors the home-hub label. */
const BUILD_NAME = 'Global Site Visual Concept - BC AQ Roadmap V1'

export default function VisualRoadmapV1Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Tooling bar (back-to-hub + comments) ABOVE the BC-site recreation. */}
      <PrototypeHeader buildName={BUILD_NAME} />
      {/* BC site nav — the SHARED chrome, configured for visual concept v1 routes. */}
      <BcHeader config={ROADMAP_CHROME} />
      {children}
      <BcFooter />
    </>
  )
}
