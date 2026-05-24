/**
 * layout.tsx — JTBD City Toolkit · Real-time monitoring component layout (chrome).
 *
 * Purpose
 *   Chrome for the real-time monitoring rapid-prototype, following the concept-layer pattern
 *   (matches jtbd-city-toolkit-v2/layout.tsx):
 *     1. PrototypeHeader — the TOOLING bar (back-to-hub link + comment widget + "Updated" stamp).
 *     2. BcHeader — the SITE nav, the SHARED component from `@/components/concept`, driven by
 *        TOOLKIT_RT_CHROME. Its live "Dev hub" item is the visible site-nav route back to "/".
 *   The footer is intentionally omitted here: this component is a full-viewport interactive map
 *   (the page sizes the map to the space below the chrome), so a footer band would either be
 *   stranded off-screen or fight the map's height math. Back-to-hub is provided twice over —
 *   PrototypeHeader's ArrowLeft link AND BcHeader's live "Dev hub" nav item — so the no-dead-end
 *   navigation rule holds without the footer.
 *
 * Key exports: ToolkitRtMonitoringLayout (default)
 * External dependencies: PrototypeHeader, @/components/concept (BcHeader),
 *   ./real-time-monitoring-chrome.config (TOOLKIT_RT_CHROME)
 */

import { PrototypeHeader } from '../../../_components/PrototypeHeader'
import { BcHeader } from '@/components/concept'
import { TOOLKIT_RT_CHROME } from './real-time-monitoring-chrome.config'

export default function ToolkitRtMonitoringLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Tooling bar (back-to-hub + comments + "Updated" stamp) ABOVE the BC-site recreation. */}
      <PrototypeHeader buildName="JTBD City Toolkit — Real-time monitoring (concept)" />
      {/* BC site nav — the SHARED chrome, configured for this component (live "Dev hub" → "/"). */}
      <BcHeader config={TOOLKIT_RT_CHROME} />
      {children}
    </>
  )
}
