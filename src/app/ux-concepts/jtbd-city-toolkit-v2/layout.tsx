/**
 * layout.tsx — JTBD City Toolkit v2 layout (chrome for the toolkit dashboard).
 *
 * Purpose
 *   Chrome for the v2 concept. Matches the aq-network-v2 layout pattern exactly:
 *     1. PrototypeHeader — the TOOLING bar (back-to-hub + comment widget + "Updated" stamp).
 *     2. BcHeader — the SITE nav, the SHARED component from `@/components/concept`, driven by
 *        JTBD_CHROME (all live routes point at the v2 route, so v2 is self-contained).
 *     3. BcFooter — the shared static footer.
 *   Tooling on top, site nav below — matching the v1 layout convention.
 *
 *   Difference from v1: chrome comes from the shared layer (one BcChrome for all concepts,
 *   config as a prop) rather than jtbd-city-toolkit/_components/BcChrome.tsx. The buildName
 *   is updated to distinguish this v2 copy in the tooling bar.
 *
 * Key exports: JtbdV2Layout (default)
 * External dependencies: PrototypeHeader, @/components/concept (BcHeader, BcFooter),
 *   ./_components/jtbd-chrome.config (JTBD_CHROME)
 */

import { PrototypeHeader } from '../../_components/PrototypeHeader'
import { BcHeader, BcFooter } from '@/components/concept'
import { JTBD_CHROME } from './_components/jtbd-chrome.config'

export default function JtbdV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Tooling bar (back-to-hub + comments + "Updated" stamp) ABOVE the BC-site recreation. */}
      <PrototypeHeader buildName="JTBD City Toolkit v2 — concept" />
      {/* BC site nav — the SHARED chrome, configured for JTBD City Toolkit (v2 routes). */}
      <BcHeader config={JTBD_CHROME} />
      {children}
      <BcFooter />
    </>
  )
}
