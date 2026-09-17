/**
 * CityCard.tsx — the small card shown beside a tapped city marker (brief 4.2).
 *
 * Purpose
 *   Shows the city name, country and an "Open" action. "Open" looks active for the seven chapter
 *   cities (inert `href="#"` in this build step, chapters are not built yet) and greyed out for the
 *   other nine. A close button dismisses the card; GlobeCover also closes it on Escape or a tap
 *   elsewhere.
 *
 *   The card is portalled into the selected marker's DOM node by AtlasGlobe, so its position is
 *   relative to the marker: below it on small screens (a card beside a centred marker would run
 *   off a 390px screen), to its right from the `sm` breakpoint up.
 *
 * Accessibility
 *   A non-modal dialog (role="dialog", labelled by the city name). It follows the marker button in
 *   DOM order, so Tab moves from the marker straight into the card. Controls are 56px tall
 *   (frontend-standards R8). The greyed-out "Open" is exposed as a disabled item, not a link.
 *
 * Styling
 *   The shared ConceptCard surface; bridged semantics only (foreground/background/muted). No hex.
 *
 * Key exports: CityCard (named)
 * External dependencies: react, lucide-react (X), @/components/concept (ConceptCard),
 *   ../_data/cities (AtlasCity type).
 */

import { X } from 'lucide-react'
import { ConceptCard } from '@/components/concept'
import type { AtlasCity } from '../_data/cities'

/** Props for CityCard. */
type CityCardProps = {
  /** The tapped city. */
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
      className="absolute left-1/2 top-full z-10 mt-1 w-60 -translate-x-1/2 sm:left-full sm:top-1/2 sm:ml-2 sm:mt-0 sm:translate-x-0 sm:-translate-y-1/2"
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
          // Active look; inert until the chapters are built.
          <a
            href="#"
            className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Open
          </a>
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
