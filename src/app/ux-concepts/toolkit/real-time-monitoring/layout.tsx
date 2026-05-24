/**
 * layout.tsx — JTBD City Toolkit · Real-time monitoring component layout (chrome).
 *
 * Purpose
 *   Chrome for the real-time monitoring rapid-prototype, following the concept-layer pattern
 *   (matches jtbd-city-toolkit-v2/layout.tsx):
 *     1. PrototypeHeader — the TOOLING bar (back-to-hub link + comment widget + "Updated" stamp).
 *     2. BcHeader — the SITE nav, the SHARED component from `@/components/concept`, driven by
 *        TOOLKIT_RT_CHROME. Its live "Toolkit" + "Dev hub" items are the visible site-nav routes.
 *     3. BcFooter — the shared static footer.
 *   As of increment 2 the page is no longer a full-viewport map: the map is one bounded demo block
 *   inside a scrolling page (intro → demo → adoption → nav), so the footer sits naturally at the end
 *   of the content rather than being stranded off-screen. Back-to-toolkit/hub is provided in the
 *   tooling bar, the BcHeader nav, AND the page's own in-flow nav footer.
 *
 * Key exports: ToolkitRtMonitoringLayout (default)
 * External dependencies: PrototypeHeader, @/components/concept (BcHeader, BcFooter),
 *   ./real-time-monitoring-chrome.config (TOOLKIT_RT_CHROME)
 */

import { PrototypeHeader } from '../../../_components/PrototypeHeader'
import { BcHeader, BcFooter } from '@/components/concept'
import { TOOLKIT_RT_CHROME } from './real-time-monitoring-chrome.config'

export default function ToolkitRtMonitoringLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Tooling bar (back-to-hub + comments + "Updated" stamp) ABOVE the BC-site recreation. */}
      <PrototypeHeader buildName="City AQ Toolkit — Real-time monitoring (concept)" />
      {/* BC site nav — the SHARED chrome, configured for this component (live "Toolkit" + "Dev hub"). */}
      <BcHeader config={TOOLKIT_RT_CHROME} />
      {children}
      {/* Shared static footer — sits at the end of the now-scrolling page. */}
      <BcFooter />
    </>
  )
}
