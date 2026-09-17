/**
 * ChapterHeroMap.tsx — chapter section 2, the hero map (fixed layout, brief 5.1).
 *
 * Purpose
 *   A full-width band of one fixed height, sized for the real Mapbox data map, directly below the
 *   opener. What fills it depends on the city's tier:
 *   - Tier 1 (Milan, shares nothing): the stylised country map at hero size (brief 3, 5.4).
 *   - Tiers 2 to 4: the reserved live data map slot (ChapterDataMapSlot), filled in the next step.
 *
 * Accessibility
 *   A labelled region with no heading of its own, so the heading order stays h1 (opener), then the
 *   h2s of the sections below.
 *
 * Key exports: ChapterHeroMap (named)
 * External dependencies: ./StylisedCountryMap, ./ChapterDataMapSlot, ../../_data/cities (type),
 *   ../../_data/chapters (type), ../../_data/country-maps (COUNTRY_MAPS).
 */

import { ChapterDataMapSlot } from './ChapterDataMapSlot'
import { StylisedCountryMap } from './StylisedCountryMap'
import type { AtlasCity } from '../../_data/cities'
import type { CityChapter } from '../../_data/chapters'
import { COUNTRY_MAPS } from '../../_data/country-maps'

/** Props for ChapterHeroMap. */
type ChapterHeroMapProps = {
  /** The chapter's city. */
  city: AtlasCity
  /** The chapter content (for its tier and slug). */
  chapter: CityChapter
}

/** The hero band's height at each breakpoint: the size reserved for the data map. */
const HERO_BAND_HEIGHT = 'h-[340px] sm:h-[460px] lg:h-[540px]'

/** The hero map band. Server component. */
export function ChapterHeroMap({ city, chapter }: ChapterHeroMapProps) {
  if (chapter.tier === 1) {
    return (
      <section aria-label={`Where ${city.name} is`} className={`w-full ${HERO_BAND_HEIGHT}`}>
        <div className="flex h-full w-full items-center justify-center border-y border-border bg-muted px-4">
          <StylisedCountryMap
            spec={COUNTRY_MAPS[chapter.slug]}
            countryName={city.country}
            cityName={city.name}
            cityLngLat={[city.lng, city.lat]}
            size="hero"
          />
        </div>
      </section>
    )
  }

  return (
    <section aria-label={`Live data map of ${city.name}`} className={`w-full ${HERO_BAND_HEIGHT}`}>
      <ChapterDataMapSlot city={city} tier={chapter.tier} />
    </section>
  )
}
