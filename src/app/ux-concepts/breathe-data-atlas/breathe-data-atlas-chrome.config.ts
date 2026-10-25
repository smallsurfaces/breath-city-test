/**
 * breathe-data-atlas-chrome.config.ts — site-nav configuration and routes for the Breathe Data
 * Atlas concept.
 *
 * Purpose
 *   Copied from breathe-atlas/breathe-atlas-chrome.config.ts on 2026-10-25 and repointed (spec
 *   section 1). The original is never edited. Breathe Data Atlas keeps the Atlas's deliberately
 *   minimal nav (the BC logo and the "Prototype with sample data" notice), so it does not mount the
 *   shared BcHeader. The nav data follows the canonical concept chrome-config convention
 *   (concept-prototyping skill section 7): co-located at the concept folder root, typed with the
 *   shared `BcChromeConfig`.
 *
 *   `nav` is EMPTY, as in the Atlas: the shared type requires the field.
 *
 *   Also the single source for the concept's routes: the cover and the city pages. Only Bogotá has
 *   a city page in this pass (spec section 1); `CITY_PAGE_SLUGS` lists the slugs that have one, so
 *   the cards, the carousel and the ending can never link to a page that does not exist.
 *
 * Key exports: BREATHE_DATA_ATLAS_ROUTE, BREATHE_DATA_ATLAS_CHROME, CITY_PAGE_SLUGS, cityPageHref,
 *   hasCityPage
 * External dependencies: @/components/concept (BcChromeConfig type).
 */

import type { BcChromeConfig } from '@/components/concept'

/** The concept's canonical route (the landing page globe cover). */
export const BREATHE_DATA_ATLAS_ROUTE = '/ux-concepts/breathe-data-atlas'

/** The city slugs that have a city page in this pass (spec section 1: Bogotá only). */
export const CITY_PAGE_SLUGS: readonly string[] = ['bogota']

/** True when the city has a city page in this pass. */
export function hasCityPage(slug: string): boolean {
  return CITY_PAGE_SLUGS.includes(slug)
}

/** Route of a city's page, from the city's slug. */
export function cityPageHref(slug: string): string {
  return `${BREATHE_DATA_ATLAS_ROUTE}/${slug}`
}

/** Nav config: the logo links home to the cover, and there are no nav items. */
export const BREATHE_DATA_ATLAS_CHROME: BcChromeConfig = {
  logoHref: BREATHE_DATA_ATLAS_ROUTE,
  nav: [],
}
