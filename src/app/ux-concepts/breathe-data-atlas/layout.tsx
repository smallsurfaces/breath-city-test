/**
 * layout.tsx — Breathe Data Atlas concept chrome wrapper (copied from breathe-atlas, 2026-10-25).
 *
 * Purpose
 *   Wraps every Breathe Data Atlas page in the standard hub tooling bar (PrototypeHeader: back-to-hub,
 *   comments, wireframe disclaimer), titled from the single-source concept registry so the bar
 *   matches the hub card. The concept's own site nav (AtlasNav) is mounted per page (cover and
 *   chapters), because the brief specifies a minimal nav that differs from the shared BcHeader, and
 *   because each page tells the nav which city (if any) the All cities panel should highlight.
 *
 * Key exports: BreatheAtlasLayout (default)
 * External dependencies: PrototypeHeader (../../_components/PrototypeHeader),
 *   ../../_data/concept-registry (CONCEPTS).
 */

import { PrototypeHeader } from '../../_components/PrototypeHeader'
import { CONCEPTS } from '../../_data/concept-registry'

/** The hub's wireframe line plus this concept's sample-data notice (decision H). */
const DISCLAIMER =
  'Concept wireframe — no visual design applied yet. Review the UX and the high-level concept, not the visual design. Prototype with sample data.'

export default function BreatheAtlasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Tooling bar (back-to-hub + comments). Title from the registry so it matches the hub. */}
      {/* Round 3 decision H: the sample-data notice ends the wireframe line, through the shared
          component's optional `disclaimer` prop (its default copy is left as it is). */}
      <PrototypeHeader buildName={CONCEPTS.breatheDataAtlas.title} disclaimer={DISCLAIMER} />
      {children}
    </>
  )
}
