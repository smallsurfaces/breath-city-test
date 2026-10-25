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
 * Key exports: BC_ONE_LINER, BC_ABOUT_LINK, CityBrowserLink (type), FRAMING_LINE, SITE_CAVEAT
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
export const FRAMING_LINE =
  "See how cities in the Breathe Cities network use air quality data. Choose a city to see its sensors, today's air near you and what the city advises."

/**
 * The site-level caveat (spec 3.4), in the landing page footer and on every city page footer.
 * DRAFT for a ux-writer pass.
 */
export const SITE_CAVEAT =
  "Air quality data, bands and advice on this site are each city's own, shown as the city publishes them. Breathe Cities does not interpret, rank or compare them."
