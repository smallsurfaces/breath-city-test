/**
 * cover-copy.ts — editable copy for the Breathe Data Atlas cover (copied from breathe-atlas on
 * 2026-10-25; the original is never edited). Adds FRAMING_LINE (spec 3.3) and SITE_CAVEAT (spec
 * 3.4), both DRAFT copy for a ux-writer pass, not final.
 *
 * Original header follows.
 *
 * cover-copy.ts — editable copy for the Breathe Atlas cover browser (brief 4.3).
 *
 * Purpose
 *   The one line about Breathe Cities shown in the cover browser's text block, and the link to
 *   BC's own site. Kept as data, next to the city entries, so the copy can be edited without
 *   touching components (and so a future content system has an obvious field for it).
 *
 * Honesty
 *   Our own copy in BC's voice, not the text beside BC's carousel on breathecities.org
 *   (brief 4.3). It makes no claim beyond what BC's site states.
 *
 * Iteration 2 (round 1): FRAMING_LINE replaced (decision A2, Jack's wording); SITE_CAVEAT split
 * into ENTRY_CAVEAT and cityCaveat() (decision K1/A2, approved wording); OSM_FOOTER_CREDIT added
 * for the entry page footer (decision A4).
 *
 * Key exports: BC_ONE_LINER, BC_ABOUT_LINK, CityBrowserLink (type), FRAMING_LINE, ENTRY_CAVEAT,
 *   cityCaveat, OSM_FOOTER_CREDIT
 * External dependencies: none.
 */

/** A labelled external link. */
export type CityBrowserLink = {
  /** Visible link text. */
  label: string
  /** Absolute URL. */
  href: string
}

/** The one line about Breathe Cities in the cover browser's text block. */
export const BC_ONE_LINER = 'Explore the cities working with Breathe Cities to clean the air we breathe.'

/** Link to Breathe Cities' own site, opened in a new tab. */
export const BC_ABOUT_LINK: CityBrowserLink = {
  label: 'About Breathe Cities',
  href: 'https://breathecities.org/',
}

/**
 * The framing line under the globe (spec 3.3). DRAFT for a ux-writer pass. Presents the network as
 * using data, with the emphasis on use; makes no outcome claim (no city publishes results as data).
 */
export const FRAMING_LINE: readonly [string, string] = [
  'Cities in the Breathe Cities network use air quality sensors to measure and inform.',
  'Choose a city to see how.',
]

/** The entry page caveat (decision A2), in the entry page footer. Approved; CAF may fine-tune. */
export const ENTRY_CAVEAT =
  'The data shown here comes from each city, as the city publishes it. Breathe Cities does not interpret, rank or compare it.'

/** A city page's caveat (decision K1), in that page's footer. Approved; CAF may fine-tune. Pure. */
export function cityCaveat(cityName: string): string {
  return `The data shown here comes from ${cityName}, as the city publishes it. Breathe Cities does not interpret, rank or compare it.`
}

/**
 * The OpenStreetMap credit for the entry page's poster maps (decision A4): one plain footer line for
 * the whole page, required by the ODbL. It replaced the two "i" credits (framing line and carousel
 * heading, decisions A4 and A5). The station provenance note stays in the data files only.
 */
export const OSM_FOOTER_CREDIT = 'City outlines and streets © OpenStreetMap contributors (ODbL).'
