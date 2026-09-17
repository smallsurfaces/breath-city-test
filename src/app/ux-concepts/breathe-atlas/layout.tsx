/**
 * layout.tsx — Breathe Atlas concept chrome wrapper.
 *
 * Purpose
 *   Wraps every Breathe Atlas page in the standard hub tooling bar (PrototypeHeader: back-to-hub,
 *   comments, wireframe disclaimer), titled from the single-source concept registry so the bar
 *   matches the hub card. The concept's own site nav (AtlasNav) is mounted per page, because the
 *   brief specifies a minimal nav that differs from the shared BcHeader, and there is no footer
 *   in this first build step (brief 4.3 and the chapters come later).
 *
 * Key exports: BreatheAtlasLayout (default)
 * External dependencies: PrototypeHeader (../../_components/PrototypeHeader),
 *   ../../_data/concept-registry (CONCEPTS).
 */

import { PrototypeHeader } from '../../_components/PrototypeHeader'
import { CONCEPTS } from '../../_data/concept-registry'

export default function BreatheAtlasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Tooling bar (back-to-hub + comments). Title from the registry so it matches the hub. */}
      <PrototypeHeader buildName={CONCEPTS.breatheAtlas.title} />
      {children}
    </>
  )
}
