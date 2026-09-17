/**
 * ChapterDataMapSlot.tsx — the reserved hero slot for a data city's live data map (brief 5.1, 6.1).
 *
 * Purpose
 *   Holds the place of the Mapbox data map for the six data cities (tiers 2 to 4) until the next
 *   build step fills it. It fills the hero band ChapterHeroMap gives it, which is already sized for
 *   the real map, and shows only a neutral placeholder line.
 *
 * For the next build step
 *   Replace the body of this component with the map. Its props already carry what the map needs to
 *   start: the city (name, centre position) and the tier (marker states differ by tier, brief 6.1).
 *   The component must keep filling its parent (h-full w-full); the parent owns the height.
 *
 * Key exports: ChapterDataMapSlot (named)
 * External dependencies: ../../_data/cities (AtlasCity, SharingTier types).
 */

import type { AtlasCity, SharingTier } from '../../_data/cities'

/** Props for ChapterDataMapSlot. */
type ChapterDataMapSlotProps = {
  /** The chapter's city. */
  city: AtlasCity
  /** The city's (illustrative) sharing tier: 2, 3 or 4. */
  tier: Exclude<SharingTier, 1>
}

/** The placeholder slot. Server component; the real map will be a client component in its place. */
export function ChapterDataMapSlot({ city, tier }: ChapterDataMapSlotProps) {
  return (
    <div
      data-atlas-map-slot="live-data"
      data-city={city.slug}
      data-tier={tier}
      className="flex h-full w-full items-center justify-center border-y border-dashed border-foreground/20 bg-foreground/[0.04] px-4"
    >
      <p className="text-center text-sm font-medium text-foreground/60">Live data map: next build step</p>
    </div>
  )
}
