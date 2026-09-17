/**
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
 * Key exports: BC_ONE_LINER, BC_ABOUT_LINK, CityBrowserLink (type)
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
