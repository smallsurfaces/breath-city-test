/**
 * breathe-atlas-chrome.config.ts — site-nav configuration and routes for the Breathe Atlas concept.
 *
 * Purpose
 *   Breathe Atlas has its own, deliberately minimal site nav (brief 4.1: BC logo, "All cities",
 *   "Prototype with sample data" notice, nothing else), so it does not mount the shared BcHeader
 *   (which carries BC's full primary nav and a "Join us" CTA). The nav data still follows the
 *   canonical concept chrome-config convention (concept-prototyping skill section 7): co-located at
 *   the concept folder root, typed with the shared `BcChromeConfig`, exported as
 *   `BREATHE_ATLAS_CHROME`. The concept-local AtlasNav renders it.
 *
 *   "All cities" is rendered as a button that opens the All cities panel (brief 5.9), not as a
 *   link, so its `href` is a placeholder the nav does not use. The shared type requires one.
 *
 *   Also the single source for the concept's routes: the cover and the chapter routes.
 *
 * Key exports: BREATHE_ATLAS_ROUTE, BREATHE_ATLAS_CHROME, atlasChapterHref
 * External dependencies: @/components/concept (BcChromeConfig type).
 */

import type { BcChromeConfig } from '@/components/concept'

/** The concept's canonical route (the landing page globe cover). */
export const BREATHE_ATLAS_ROUTE = '/ux-concepts/breathe-atlas'

/** Route of a city's chapter, from the city's slug. */
export function atlasChapterHref(slug: string): string {
  return `${BREATHE_ATLAS_ROUTE}/${slug}`
}

/**
 * Breathe Atlas nav config: the logo links home to the cover. "All cities" opens the All cities
 * panel (AtlasNav renders it as a button; the `#` href is unused).
 */
export const BREATHE_ATLAS_CHROME: BcChromeConfig = {
  logoHref: BREATHE_ATLAS_ROUTE,
  nav: [{ label: 'All cities', href: '#' }],
}
