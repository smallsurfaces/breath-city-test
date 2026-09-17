/**
 * ChapterEnding.tsx — chapter section 8, the ending (fixed layout, brief 5.8).
 *
 * Purpose
 *   - "Next: [City]": a card with the next chapter city's greyscale landmark image and mission line,
 *     linking to that chapter. Chapters run alphabetically and loop (the caller passes the next city,
 *     from nextChapterCity in ../../_data/chapters.ts).
 *   - "All cities": opens the All cities panel (the existing AllCitiesPanel, with the current city
 *     highlighted), styled as an outlined button.
 *   - "Contact BC": a dead link for now (`href="#"`).
 *
 * Layout (Jack, brief 5.8, 2026-09-17)
 *   On DESKTOP the "Next: [City]" card sits on the RIGHT and takes the wide column, with "All
 *   cities" and "Contact BC" stacked on the LEFT. They were the other way round before.
 *   On PHONE they stack with the NEXT CITY FIRST.
 *
 *   How both come from one DOM order: the next-city card is written FIRST in the markup, so it
 *   leads on a phone with no ordering classes and reads first to a screen reader and to the
 *   keyboard at every width. From `md` the grid places it in column 2 and the buttons in column 1,
 *   which puts it on the right without moving it in the DOM. The visual order therefore differs
 *   from the DOM order only on desktop, and only between a heading-card and two sibling controls,
 *   which is not a meaning-carrying reversal.
 *
 * Accessibility
 *   "Next: [City]" is the section's h2 and the card's link. The link's hit area is stretched over the
 *   whole card with a pseudo-element, so the accessible name stays short. The image is decorative
 *   here (alt=""), because the link text already names the city.
 *
 * IMAGE RIGHTS
 *   `nextLandmark` is the next city's landmark image from the content pack, HOTLINKED for this
 *   internal prototype and shown in greyscale. It carries no credit here: the link text names the
 *   city and the image is decorative on this card (alt=""), and the same photo is credited in that
 *   city's own chapter opener.
 *
 * Key exports: ChapterEnding (named)
 * External dependencies: next/link, lucide-react (ArrowRight), ../AllCitiesPanel (client),
 *   ./ChapterLink (LINK_FOCUS_RING), ../../breathe-atlas-chrome.config (atlasChapterHref),
 *   ../../_data/cities (type), ../../_data/chapters (ChapterPhoto type).
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AllCitiesPanel } from '../AllCitiesPanel'
import { LINK_FOCUS_RING } from './ChapterLink'
import { atlasChapterHref } from '../../breathe-atlas-chrome.config'
import type { AtlasCity } from '../../_data/cities'
import type { ChapterPhoto } from '../../_data/chapters'

/** Props for ChapterEnding. */
type ChapterEndingProps = {
  /** The chapter's city (highlighted in the All cities panel). */
  city: AtlasCity
  /** The next chapter city. */
  next: AtlasCity
  /** The next city's landmark image (decorative on this card). */
  nextLandmark: ChapterPhoto
}

/** Id of the "Next" heading (one ending per page). */
const HEADING_ID = 'atlas-ending-next-heading'

/** The ending section. Server component; the All cities panel is its only client part. */
export function ChapterEnding({ city, next, nextLandmark }: ChapterEndingProps) {
  return (
    <section aria-labelledby={HEADING_ID} className="mx-auto max-w-6xl px-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-stretch">
        {/* Next chapter card: the whole card is the link (stretched pseudo-element). First in the
            DOM so it leads on a phone; placed in the right-hand column from `md` (see Layout). */}
        <div className="group relative flex items-center gap-4 rounded-2xl border border-border bg-background p-4 shadow-sm transition-colors hover:border-foreground/40 sm:gap-6 sm:p-5 md:col-start-2 md:row-start-1">
          <img
            src={nextLandmark.src ?? undefined}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-28 w-24 shrink-0 rounded-xl bg-muted object-cover grayscale sm:h-36 sm:w-32"
          />
          <div className="min-w-0 flex-1">
            <h2 id={HEADING_ID} className="text-2xl font-bold leading-tight tracking-tight text-foreground">
              <Link
                href={atlasChapterHref(next.slug)}
                className={`rounded-2xl after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-foreground`}
              >
                Next: {next.name}
              </Link>
            </h2>
            <p className="mt-2 text-base leading-relaxed text-foreground/80">{next.missionLine}</p>
          </div>
          <span
            aria-hidden="true"
            className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-foreground/60 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background sm:flex"
          >
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>

        {/* All cities and Contact BC: on the left from `md`, below the next-city card on a phone. */}
        <div className="flex flex-col justify-center gap-3 md:col-start-1 md:row-start-1">
          <AllCitiesPanel label="All cities" currentCityId={city.id} />
          <a
            href="#"
            className={`inline-flex min-h-14 w-full items-center justify-center rounded-full border border-foreground/20 px-6 text-base font-semibold text-foreground transition-colors hover:border-foreground/60 ${LINK_FOCUS_RING}`}
          >
            Contact BC
          </a>
        </div>
      </div>
    </section>
  )
}
