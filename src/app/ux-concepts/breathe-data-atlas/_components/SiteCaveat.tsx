/**
 * SiteCaveat.tsx — the site-level caveat line in the page footer (spec 3.4).
 *
 * Purpose
 *   One short line, the same on the landing page and on every city page: the data, bands and advice
 *   are each city's own, and Breathe Cities does not interpret, rank or compare them. Draft copy
 *   from ../_data/cover-copy (SITE_CAVEAT). Neutral, quiet, no colour.
 *
 * Key exports: SiteCaveat (named)
 * External dependencies: ../_data/cover-copy (SITE_CAVEAT).
 */

import { SITE_CAVEAT } from '../_data/cover-copy'

/** The caveat footer. Server component. */
export function SiteCaveat() {
  return (
    <footer className="border-t border-border bg-background">
      <p className="mx-auto max-w-6xl px-4 py-6 text-sm leading-relaxed text-foreground/70">{SITE_CAVEAT}</p>
    </footer>
  )
}
