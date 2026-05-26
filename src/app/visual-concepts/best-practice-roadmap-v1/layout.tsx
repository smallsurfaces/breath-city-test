/**
 * layout.tsx — Visual Concept v1: BC AQ Roadmap layout.
 *
 * Purpose
 *   Wraps every Visual Concept v1 (BC AQ Roadmap) page in the standard two-bar chrome:
 *     1. PrototypeHeader — tooling bar (sole "Back to hub" + comment widget). Not part of BC's site.
 *     2. BcHeader — the SHARED concept chrome component, driven by ROADMAP_CHROME so all live
 *        routes point at the visual-concepts paths and the concept is self-contained.
 *        BcFooter (shared, static) closes every page.
 *   Tooling bar on top, site nav below — matching the convention used by every other concept.
 *
 *   Fork origin
 *     This file is a fork of src/app/ux-concepts/best-practice-roadmap-v2/layout.tsx (commit
 *     09839c6 / tag wireframe-lock-2026-05-26). The fork exists so visual exploration on this
 *     concept cannot leak into the wireframe-locked UX concept. First-deploy render is identical
 *     to v2; visual evolution happens in subsequent sessions.
 *
 *   Title source
 *     The buildName shown in the PrototypeHeader is inlined here (not pulled from the shared
 *     CONCEPTS registry) because the concept-registry is the source-of-truth for UX concepts
 *     only. Visual concepts are a parallel exploration layer — adding them to the registry
 *     would change the registry's contract. Title kept as the locked catalogue name.
 *
 * Key exports: VisualRoadmapV1Layout (default)
 * External dependencies: PrototypeHeader, @/components/concept (BcHeader, BcFooter),
 *   ./roadmap-chrome.config (ROADMAP_CHROME).
 */

import { PrototypeHeader } from '../../_components/PrototypeHeader'
import { BcHeader, BcFooter } from '@/components/concept'
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
