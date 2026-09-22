/**
 * CityCard.tsx — the small card shown beside a city marker (brief 4.2; redesigned in round 2,
 * item 7).
 *
 * Purpose
 *   Names the city and offers its chapter. The card opens automatically beside the focus city while
 *   the idle cycle rests on it, when a marker is tapped, and when the globe's previous/next arrows
 *   step to a city. GlobeCover also closes it on Escape or a tap elsewhere once the visitor has
 *   interacted with it.
 *
 *   The root carries `data-atlas-card` so GlobeCover can tell a press or focus inside the card
 *   (which turns an auto-opened card into one the visitor holds open).
 *
 *   The card is portalled into the selected marker's DOM node by AtlasGlobe, so its position is
 *   relative to the marker.
 *
 * Layout (round 2, item 7, all 16 cities)
 *   - Left column: city name (bold), country, then a round arrow button with a top-right arrow
 *     (lucide ArrowUpRight). The diagonal keeps it distinct from the globe's left/right arrows.
 *     It is the concept's one card-arrow style (./atlas-arrow-styles, shared with the carousel).
 *   - Right column: a small, rounded, greyscale photo (the city's `cardImage`, anchored to the
 *     bottom where BC's images carry the landmark), with the close button at its top-right corner.
 *   - White card background (ConceptCard). The old full-width "Open" pill is gone.
 *   - Chapter cities (7): the arrow links to the chapter.
 *   - Cities without a chapter (9): the arrow shows the carousel's greyed-out treatment and is NOT
 *     in the tab order (round 2 spec: "Not focusable as a link"). It stays exposed to assistive tech
 *     as a disabled link named "Open [City]", so a screen reader reading the card still meets it.
 *     No "coming soon" text. NOTE: this differs from the carousel's greyed-out arrow, which is
 *     focusable (BUG 9, 2026-09-17); the spec asked for this one not to be.
 *   - No photo credit on this card, matching the carousel. The photo is decorative (alt=""): the
 *     card is named by the city name.
 *
 * Position (Jack, brief 4.2): centred horizontally on the marker and ALWAYS above it, at every
 *   screen size. The card only opens on the focus city, which the globe turns to the centre of the
 *   canvas, so there is room for it above the marker.
 *
 * Accessibility
 *   A non-modal dialog (role="dialog", labelled by the city name). It follows the marker button in
 *   DOM order, so Tab moves from the marker straight into the card. The arrow and the close button
 *   are 44px and 32px to the eye with 56px hit areas (frontend-standards R8, the carousel's
 *   CARD_ARROW_HIT_AREA pattern), so they fit a small card without shrinking the target.
 *
 * IMAGE RIGHTS
 *   `cardImage` is Breathe Cities' own city card image, HOTLINKED from breathecities.org for this
 *   internal prototype (see ../_data/cities.ts). Plain <img>, no next/image.
 *
 * Styling
 *   The shared ConceptCard surface; bridged semantics only (foreground/background/muted). No hex.
 *
 * Key exports: CityCard (named), CITY_CARD_WIDTH_PX, CITY_CARD_WIDTH_PX_SM
 * External dependencies: next/link, lucide-react (ArrowUpRight, X), @/components/concept
 *   (ConceptCard), ../breathe-atlas-chrome.config (atlasChapterHref), ../_data/cities (AtlasCity
 *   type), ./atlas-arrow-styles.
 */

import Link from 'next/link'
import { ArrowUpRight, X } from 'lucide-react'
import { ConceptCard } from '@/components/concept'
import { atlasChapterHref } from '../breathe-atlas-chrome.config'
import type { AtlasCity } from '../_data/cities'
import { CARD_ARROW_CLASS, CARD_ARROW_DISABLED_CLASS } from './atlas-arrow-styles'

/**
 * The close button's 56 x 56 hit area around its 32px circle: the same centred pseudo-element as
 * the card arrow's CARD_ARROW_HIT_AREA, minus its `relative` (the button is already `absolute`,
 * which positions the pseudo-element just as well). It stays inside the card: the button sits 4px
 * in from the photo's corner and the card has 14px of padding.
 */
const CLOSE_HIT_AREA =
  "before:absolute before:left-1/2 before:top-1/2 before:h-14 before:w-14 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"

/**
 * The card's width in px below `sm` (Tailwind `w-[248px]` below), kept as a number as well because
 * GlobeCover keeps the pause/play button clear of the card on a narrow screen and has to know how
 * wide the card is. 248 is the widest card that still clears the 56px button on a 375px phone.
 * Change both together.
 */
export const CITY_CARD_WIDTH_PX = 248
/** The card's width in px from `sm` (Tailwind `sm:w-72`). */
export const CITY_CARD_WIDTH_PX_SM = 288

/** Props for CityCard. */
type CityCardProps = {
  /** The city the card is for. */
  city: AtlasCity
  /** Close the card. */
  onClose: () => void
}

/** The marker card. */
export function CityCard({ city, onClose }: CityCardProps) {
  const headingId = `atlas-card-${city.id}`
  return (
    <div
      role="dialog"
      aria-labelledby={headingId}
      data-atlas-card="true"
      className="absolute bottom-full left-1/2 z-10 mb-1 w-[248px] -translate-x-1/2 sm:w-72"
    >
      <ConceptCard noPadding className="flex gap-3 p-3.5 text-left">
        {/* Left column: name, country, arrow. */}
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <p id={headingId} className="text-base font-bold leading-tight text-foreground sm:text-lg">
            {city.name}
          </p>
          <p className="mt-0.5 text-sm text-foreground/70">{city.country}</p>

          <div className="mt-auto pt-3">
            {city.hasChapter ? (
              // Links to the city's chapter.
              <Link href={atlasChapterHref(city.slug)} aria-label={`Open ${city.name}`} className={CARD_ARROW_CLASS}>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              // Greyed out: this city has no chapter in the concept. Not in the tab order (round 2
              // spec) and no click handler, so it is inert; exposed to assistive tech as a disabled link.
              <span role="link" aria-disabled="true" aria-label={`Open ${city.name}`} className={CARD_ARROW_DISABLED_CLASS}>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>

        {/* Right column: the city's photo, greyscale, with the close button on its top-right corner. */}
        <div className="relative shrink-0">
          <img
            src={city.cardImage}
            alt=""
            decoding="async"
            className="block h-[100px] w-20 rounded-xl bg-muted object-cover object-bottom grayscale"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${city.name} card`}
            className={`absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground ${CLOSE_HIT_AREA}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </ConceptCard>
    </div>
  )
}
