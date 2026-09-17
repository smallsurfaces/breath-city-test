/**
 * breathe-atlas-chrome.config.ts — site-nav configuration for the Breathe Atlas concept.
 *
 * Purpose
 *   Breathe Atlas has its own, deliberately minimal site nav (brief 4.1: BC logo, "All cities",
 *   "Prototype with sample data" notice, nothing else), so it does not mount the shared BcHeader
 *   (which carries BC's full primary nav and a "Join us" CTA). The nav data still follows the
 *   canonical concept chrome-config convention (concept-prototyping skill section 7): co-located at
 *   the concept folder root, typed with the shared `BcChromeConfig`, exported as
 *   `BREATHE_ATLAS_CHROME`. The concept-local AtlasNav renders it.
 *
 *   "All cities" is inert (`href: '#'`) in this first build step. It will open the cover browser
 *   once brief section 4.3 is built.
 *
 * Key exports: BREATHE_ATLAS_ROUTE, BREATHE_ATLAS_CHROME
 * External dependencies: @/components/concept (BcChromeConfig type).
 */

import type { BcChromeConfig } from '@/components/concept'

/** The concept's canonical route (the landing page globe cover). */
export const BREATHE_ATLAS_ROUTE = '/ux-concepts/breathe-atlas'

/** Breathe Atlas nav config: the logo links home to the cover; "All cities" is inert for now. */
export const BREATHE_ATLAS_CHROME: BcChromeConfig = {
  logoHref: BREATHE_ATLAS_ROUTE,
  nav: [{ label: 'All cities', href: '#' }],
}
