/**
 * breathe-atlas-chrome.config.ts — site-nav configuration and routes for the Breathe Atlas concept.
 *
 * Purpose
 *   Breathe Atlas has its own, deliberately minimal site nav (brief 4.1, updated 2026-09-17: the
 *   BC logo and the "Prototype with sample data" notice, nothing else), so it does not mount the
 *   shared BcHeader
 *   (which carries BC's full primary nav and a "Join us" CTA). The nav data still follows the
 *   canonical concept chrome-config convention (concept-prototyping skill section 7): co-located at
 *   the concept folder root, typed with the shared `BcChromeConfig`, exported as
 *   `BREATHE_ATLAS_CHROME`. The concept-local AtlasNav renders it.
 *
 *   `nav` is EMPTY. The "All cities" item was removed on 2026-09-17 (Jack, brief 4.1); the cover
 *   browser is reached by scrolling the landing page and from the "All cities" button at the end of
 *   each chapter. The shared `BcChromeConfig` type requires the field, so it stays as an empty list
 *   rather than being deleted, and AtlasNav no longer renders it.
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
 * Breathe Atlas nav config: the logo links home to the cover, and there are no nav items (see the
 * file header). The nav's only other content is the sample-data notice, which AtlasNav owns.
 */
export const BREATHE_ATLAS_CHROME: BcChromeConfig = {
  logoHref: BREATHE_ATLAS_ROUTE,
  nav: [],
}
