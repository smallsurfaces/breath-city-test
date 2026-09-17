/**
 * page.tsx — Breathe Atlas landing page: nav, globe cover and cover browser.
 *
 * Purpose
 *   The concept's landing page, brief sections 4.1 (nav), 4.2 (globe cover) and 4.3 (below the
 *   globe: the one line about BC and the cover browser carousel). The chapters live at
 *   ./[city]/page.tsx.
 *
 *   The wordmark's `?wordmark=swap` prototype switch was removed on 2026-09-17: Jack chose the still
 *   wordmark after his phone test, so the page no longer reads search params and renders statically.
 *
 * Key exports: BreatheAtlasPage (default)
 * External dependencies: ./_components/AtlasNav, ./_components/GlobeCover, ./_components/CityBrowser.
 */

import { AtlasNav } from './_components/AtlasNav'
import { CityBrowser } from './_components/CityBrowser'
import { GlobeCover } from './_components/GlobeCover'

/** Id of the cover browser heading, which labels its section. */
const BROWSER_HEADING_ID = 'atlas-browser-heading'

export default function BreatheAtlasPage() {
  return (
    <main className="min-h-screen bg-background">
      <AtlasNav />
      <GlobeCover />
      <section aria-labelledby={BROWSER_HEADING_ID} className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <CityBrowser headingId={BROWSER_HEADING_ID} currentCityId={null} />
      </section>
    </main>
  )
}
