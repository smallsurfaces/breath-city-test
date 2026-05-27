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
 *   BC brand foundation (2026-05-26)
 *     The `./_brand/` folder provides the bootstrapped BC brand layer — Söhne web fonts loaded
 *     via next/font/local, BC tokens (palette + regional + interaction-state colours + type
 *     ramp) declared on `[data-bc-brand="v1"]`, and SVG/PNG graphic assets (Wind, Windows).
 *     We apply both by wrapping the children in a scoping `<div>` that carries the data
 *     attribute (so the tokens.css cascade matches) and the next/font className (so Söhne is
 *     served and bound to `--bc-font-sans`). The wrapper is intentionally non-semantic — it
 *     does not affect layout flow; it only owns the brand scope.
 *
 *     UX-wireframe routes (under `/ux-concepts/...`) do NOT receive this wrapper, so they
 *     continue to render with the root layout's Geist font and untouched defaults. The token
 *     scope is folder-based tonight; after the presentation it migrates to
 *     `src/systems/bc-brand/` and the scoping mechanism graduates to a theme provider.
 *
 *   Title source
 *     The buildName shown in the PrototypeHeader is inlined here (not pulled from the shared
 *     CONCEPTS registry) because the concept-registry is the source-of-truth for UX concepts
 *     only. Visual concepts are a parallel exploration layer — adding them to the registry
 *     would change the registry's contract. Title kept as the locked catalogue name.
 *
 * Key exports: VisualRoadmapV1Layout (default)
 * External dependencies: ./_chrome (PrototypeHeader, BcHeader, BcFooter — all forked),
 *   ./roadmap-chrome.config (ROADMAP_CHROME), ./_brand (soehne font + tokens.css side-effect).
 */

// Pass 4 (2026-05-27): BcNewsletter dropped from invocation per pass-4 brief item 2 — the mint
// "Stay in the loop" strip between page body and footer is removed. The named export remains in
// _chrome/index.ts for future re-introduction if needed; this layout just no longer renders it.
import { PrototypeHeader, BcHeader, BcFooter } from './_chrome'
import { ROADMAP_CHROME } from './roadmap-chrome.config'
import { soehne } from './_brand'
import './_brand/tokens.css'

/** Locked catalogue name for the Visual Concept v1 BC AQ Roadmap build — mirrors the home-hub label. */
const BUILD_NAME = 'Global Site Visual Concept - BC AQ Roadmap V1'

/**
 * VisualRoadmapV1Layout — wraps all v1 visual-concept routes in the chrome stack. Pass 4
 * (2026-05-27) drops BcNewsletter from the stack:
 *   1. PrototypeHeader (tooling: back-to-hub + comments + visual-concept disclaimer)
 *   2. BcHeader (BC site nav — solid BC Blue ground, white logo, 7-item live nav incl. Roadmap)
 *   3. children (page content)
 *   4. BcFooter (BC Blue full-bleed, 4-column with founding-org logos; Roadmap in Col 2)
 *
 * The brand wrapper `<div data-bc-brand="v1" className={soehne.variable}>` scopes the BC
 * tokens (via tokens.css cascade) and Söhne font to this layout only — UX wireframe routes
 * stay on the root layout with Geist + global tokens.
 */
export default function VisualRoadmapV1Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div data-bc-brand="v1" className={soehne.variable}>
      {/* Tooling bar (back-to-hub + comments) ABOVE the BC-site recreation. */}
      <PrototypeHeader buildName={BUILD_NAME} />
      {/* BC site nav — the FORKED chrome, configured for visual concept v1 routes. */}
      <BcHeader config={ROADMAP_CHROME} />
      {children}
      {/* Pass 4 (2026-05-27): BcNewsletter intentionally NOT rendered here. Page flows directly
       * from last content section into BcFooter. */}
      <BcFooter />
    </div>
  )
}
