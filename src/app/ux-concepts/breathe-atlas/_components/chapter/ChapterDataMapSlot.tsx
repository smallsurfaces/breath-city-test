/**
 * ChapterDataMapSlot.tsx — the data city's hero: the live-style data map (brief 5.1, 6.1).
 *
 * Purpose
 *   The server-side seam between the chapter and the map. It resolves everything the map needs from
 *   the data files — the city's sensors, its own index when it shares one, its boundary, the bounds
 *   to open on and the data source link every sensor card ends with — and hands them to the client
 *   component. Keeping the lookups here means the map component takes plain props and the chapter
 *   page stays a server component.
 *
 *   It fills the hero band ChapterHeroMap gives it (h-full w-full); the parent owns the height.
 *
 * Missing pieces are states, not errors
 *   - No boundary for a city: the map draws no outline and no mask (brief 6.1 fallback).
 *   - No Mapbox token in the environment: the map renders its container and Mapbox reports the
 *     failure; nothing here pretends a map is present.
 *   Sensors are NOT optional: a tier 2 to 4 city with no sensor file is a data fault, and
 *   sensorsFor throws, which fails the build rather than shipping an empty hero.
 *
 * Key exports: ChapterDataMapSlot (named)
 * External dependencies: ./AtlasDataMap (client), ../../_data/cities (AtlasCity, SharingTier types),
 *   ../../_data/chapters (CityChapter type), ../../_data/sensors (sensorsFor, sensorBoundsFor),
 *   ../../_data/indexes (cityIndex), ../../_data/boundaries (cityBoundary).
 */

import { AtlasDataMap } from './AtlasDataMap'
import { cityBoundary } from '../../_data/boundaries'
import { cityIndex } from '../../_data/indexes'
import { sensorBoundsFor, sensorsFor } from '../../_data/sensors'
import type { AtlasCity, SharingTier } from '../../_data/cities'
import type { CityChapter } from '../../_data/chapters'

/** Props for ChapterDataMapSlot. */
type ChapterDataMapSlotProps = {
  /** The chapter's city. */
  city: AtlasCity
  /** The city's (illustrative) sharing tier: 2, 3 or 4. */
  tier: Exclude<SharingTier, 1>
  /** The chapter, for its data source link. */
  chapter: CityChapter
}

/** The data map slot. Server component; AtlasDataMap is the client part. */
export function ChapterDataMapSlot({ city, tier, chapter }: ChapterDataMapSlotProps) {
  return (
    <AtlasDataMap
      citySlug={city.slug}
      cityName={city.name}
      tier={tier}
      sensors={sensorsFor(city.slug)}
      // Only a tier-4 city shares an index; for tiers 2 and 3 there is nothing to colour with.
      index={tier === 4 ? cityIndex(city.slug) : null}
      boundary={cityBoundary(city.slug)}
      bounds={sensorBoundsFor(city.slug)}
      dataSource={chapter.dataSource}
    />
  )
}
