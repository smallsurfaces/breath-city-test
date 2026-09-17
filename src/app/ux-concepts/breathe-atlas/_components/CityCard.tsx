/**
 * CityCard.tsx — the small card shown beside a city marker (brief 4.2).
 *
 * Purpose
 *   Shows the city name, country and an "Open" action. The card opens automatically beside the focus
 *   city while the idle cycle rests on it, and when a marker is tapped. "Open" links to the city's
 *   chapter for the seven chapter cities and is greyed out for the other nine. A close button
 *   dismisses the card; GlobeCover also closes it on Escape or a tap elsewhere once the visitor has
 *   interacted with it.
 *
 *   The root carries `data-atlas-card` so GlobeCover can tell a press or focus inside the card
 *   (which turns an auto-opened card into one the visitor holds open).
 *
 *   The card is portalled into the selected marker's DOM node by AtlasGlobe, so its position is
 *   relative to the marker.
 *
 * Position (Jack, brief 4.2): ALWAYS centred horizontally on the marker and ALWAYS above it, at
 *   every screen size. This replaced a two-case rule (below the marker on a phone, to the marker's
 *   right from `sm`), which put the card on different sides of the city depending on the screen.
 *
 *   Why one rule is safe here: a card only ever opens on the FOCUS city, and the globe always turns
 *   that city to the centre of the canvas first — the idle cycle rests there, and tapping a marker
 *   calls turnTo as well. So the marker a card hangs off is at the canvas centre, which leaves room
 *   for the card above it inside the stage at all three breakpoints (checked at 390, 768 and 1280).
 *   `max-w` keeps it inside the viewport on the narrowest screens, where the card is wider than the
 *   globe. If the visitor drags the globe while a card is open the card travels with its marker and
 *   can leave the stage, which is the same behaviour as before this change.
 *
 * Accessibility
 *   A non-modal dialog (role="dialog", labelled by the city name). It follows the marker button in
 *   DOM order, so Tab moves from the marker straight into the card. Controls are 56px tall
 *   (frontend-standards R8). The greyed-out "Open" is exposed as a disabled item, not a link.
 *
 * Styling
 *   The shared ConceptCard surface; bridged semantics only (foreground/background/muted). No hex.
 *
 * Key exports: CityCard (named), CITY_CARD_WIDTH_PX
 * External dependencies: next/link, lucide-react (X), @/components/concept (ConceptCard),
 *   ../breathe-atlas-chrome.config (atlasChapterHref), ../_data/cities (AtlasCity type).
 */

import Link from 'next/link'
import { X } from 'lucide-react'
import { ConceptCard } from '@/components/concept'
import { atlasChapterHref } from '../breathe-atlas-chrome.config'
import type { AtlasCity } from '../_data/cities'

/**
 * The card's width in px. Tailwind `w-60` below, kept as a number as well because GlobeCover has to
 * keep the pause/play button clear of the card on a narrow screen, and it can only do that if it
 * knows how wide the card is. Change both together.
 */
export const CITY_CARD_WIDTH_PX = 240

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
      className="absolute bottom-full left-1/2 z-10 mb-1 w-60 max-w-[calc(100vw-2rem)] -translate-x-1/2"
    >
      <ConceptCard noPadding className="p-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 pt-1">
            <p id={headingId} className="text-lg font-bold leading-tight text-foreground">
              {city.name}
            </p>
            <p className="mt-0.5 text-sm text-foreground/70">{city.country}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${city.name} card`}
            className="-mr-2 -mt-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {city.hasChapter ? (
          // Links to the city's chapter.
          <Link
            href={atlasChapterHref(city.slug)}
            aria-label={`Open ${city.name}`}
            className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Open
          </Link>
        ) : (
          // Greyed out: this city has no chapter in the concept.
          <span
            role="link"
            aria-disabled="true"
            className="mt-3 flex h-14 w-full cursor-default items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground/35"
          >
            Open
          </span>
        )}
      </ConceptCard>
    </div>
  )
}
