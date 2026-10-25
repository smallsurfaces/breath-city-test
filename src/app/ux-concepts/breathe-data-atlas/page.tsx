/**
 * page.tsx — Breathe Data Atlas landing page: nav, globe cover, cover browser and caveat footer.
 *
 * Purpose
 *   Copied from breathe-atlas/page.tsx on 2026-10-25 (spec section 3; the original is never
 *   edited). The globe, idle cycle, arrows, carousel and layout are kept. What changed lives in the
 *   copied components: poster maps on the cards (spec 3.1), no per-city line (3.2), the framing line
 *   (3.3). This page adds the site-level caveat in the footer (3.4). No "how to use" content (3.5).
 *   The Bogotá city page lives at ./bogota/page.tsx.
 *
 * Key exports: BreatheDataAtlasPage (default)
 * External dependencies: ./_components/AtlasNav, ./_components/GlobeCover, ./_components/CityBrowser,
 *   ./_components/SiteCaveat.
 */

import { AtlasNav } from './_components/AtlasNav'
import { CityBrowser } from './_components/CityBrowser'
import { GlobeCover } from './_components/GlobeCover'
import { SiteCaveat } from './_components/SiteCaveat'

/** Id of the cover browser heading, which labels its section. */
const BROWSER_HEADING_ID = 'atlas-browser-heading'

export default function BreatheDataAtlasPage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <AtlasNav />
        <GlobeCover />
        <section aria-labelledby={BROWSER_HEADING_ID} className="mx-auto max-w-6xl px-4 pb-16 pt-4">
          <CityBrowser headingId={BROWSER_HEADING_ID} currentCityId={null} />
        </section>
      </main>
      <SiteCaveat />
    </>
  )
}
