/**
 * AtlasSensorCard.tsx — the card that opens beside a tapped sensor (brief 6.2).
 *
 * Purpose
 *   Adapted from src/app/direction-2-live-data/StationPopup.tsx, copied into the concept and never
 *   edited there (concept standard). What changed, and why:
 *     - The original's own AQI tier label and AQI palette are GONE. This card never interprets a
 *       reading (brief section 2). Where it is coloured at all, the colour and the level name are
 *       the city's own, from ../../_data/indexes.ts.
 *     - It shows what the sensor measures, as reported, with units.
 *     - There is no stale state: the map only carries live sensors, so the freshness line is always
 *       "Live", with the minutes since the sensor updated.
 *     - It ends with "Learn more at the data source", every time (brief section 2: every reading
 *       traces to its source).
 *     - No station name appears. A snapshot location's name belongs to the city that publishes it,
 *       and a placed location has no name to give, so the card names neither.
 *
 * Contents by tier (brief 6.2)
 *   Tier 4: header in the city's index colour, with the index name and the level as published, then
 *           the pollutants with readings and units, the live line, the sensor type, the source link.
 *   Tier 3: neutral header with no level, then readings, live line, sensor type, source link.
 *   Tier 2: sensor type and the source link only. No readings exist for a locations-only city.
 *
 * Staying inside the map (brief 6.2)
 *   The card must open beside the sensor and stay inside the map on every screen size, and the map
 *   band is only about 230px tall on a phone. Two things keep it in: the readings sit in two
 *   columns, so a six-pollutant reference-grade station is three rows rather than six; and
 *   `maxHeight` comes from the map, with the body scrolling inside it if a card ever exceeds it.
 *   Which side of the marker it opens on is the map's decision (see AtlasDataMap).
 *
 * Accessibility
 *   The card is a labelled dialog. The close button takes focus when the card opens and is a 44px
 *   target; Escape is handled by the map, which also returns focus to the marker. The header's text
 *   colour is chosen against the city's own colour by luminance, so a pale index colour (Bogotá's
 *   yellow) and a dark one (Sofia's crimson) both keep their contrast.
 *
 * Key exports: AtlasSensorCard (named), readableTextOn
 * External dependencies: react, ./ChapterLink (OutboundLink), ../../_data/sensors (AtlasSensor),
 *   ../../_data/indexes (CityAirQualityIndex, indexLevel, levelDisplayName), ../../_data/chapters
 *   (ChapterLink type).
 */

'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { OutboundLink } from './ChapterLink'
import type { AtlasSensor } from '../../_data/sensors'
import { indexLevel, levelDisplayName } from '../../_data/indexes'
import type { CityAirQualityIndex } from '../../_data/indexes'
import type { ChapterLink } from '../../_data/chapters'

/** Props for AtlasSensorCard. */
type AtlasSensorCardProps = {
  /** The tapped sensor. */
  sensor: AtlasSensor
  /** The city's illustrative sharing tier: 2, 3 or 4. */
  tier: 2 | 3 | 4
  /** The city's own index, for tier 4. Null for tiers 2 and 3. */
  index: CityAirQualityIndex | null
  /** Where the city publishes its data (brief section 2). */
  dataSource: ChapterLink
  /** The tallest the card may be, in pixels: the map's own height, less a small margin. */
  maxHeight: number
  /** Close the card. */
  onClose: () => void
}

/** Near-black text, for a card header on a pale index colour. */
const DARK_TEXT = '#1f2328'

/** White text, for a card header on a dark index colour. */
const LIGHT_TEXT = '#ffffff'

/**
 * Whether dark or light text reads better on `hex`, by WCAG relative luminance. The cities' index
 * palettes run from #FFFF00 to #960032, so a fixed text colour would fail contrast on one end or
 * the other. Falls back to dark text if the value is not a six-digit hex.
 */
export function readableTextOn(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (match === null) return DARK_TEXT
  const value = match[1]
  const channels = [0, 2, 4].map((offset) => {
    const part = Number.parseInt(value.slice(offset, offset + 2), 16) / 255
    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  return luminance > 0.4 ? DARK_TEXT : LIGHT_TEXT
}

/** How the sensor type reads in the card (brief 6.2: the card names the sensor type in every tier). */
function sensorTypeLabel(sensor: AtlasSensor): string {
  return sensor.type === 'reference-grade' ? 'Reference-grade station' : 'Low-cost sensor'
}

/** The card. Rendered into a Mapbox popup by AtlasDataMap. */
export function AtlasSensorCard({ sensor, tier, index, dataSource, maxHeight, onClose }: AtlasSensorCardProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null)

  // Side effect: move focus into the card when it opens, so a keyboard user is not left behind on
  // the marker with a card they cannot reach. The map returns focus to the marker on close.
  // preventScroll matters here: without it the browser scrolls the card into view, the page jumps
  // under the reader, and the card ends up clipped by the map's own edge (measured, not assumed).
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  const level = index !== null && sensor.band !== null ? indexLevel(index, sensor.band) : null
  const headerStyle =
    level === null ? undefined : { backgroundColor: level.hex, color: readableTextOn(level.hex) }
  const headingId = `atlas-sensor-card-${sensor.id}`

  return (
    <div
      role="dialog"
      aria-labelledby={headingId}
      className="flex w-[252px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
      style={{ maxHeight }}
    >
      {/* Header: the city's own index colour and level for tier 4, neutral otherwise. */}
      <div
        className={`relative shrink-0 px-4 pb-3 pt-3 ${level === null ? 'bg-muted' : ''}`}
        style={headerStyle}
      >
        <button
          type="button"
          ref={closeRef}
          onClick={onClose}
          aria-label="Close sensor details"
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-bl-2xl focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-current"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        {level === null ? (
          <p id={headingId} className="pr-10 text-sm font-semibold text-foreground">
            Air quality sensor
          </p>
        ) : (
          <>
            <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{index?.name}</p>
            <p id={headingId} className="pr-10 text-base font-bold leading-tight">
              {levelDisplayName(level)}
            </p>
          </>
        )}
      </div>

      <div className="min-h-0 space-y-3 overflow-y-auto px-4 pb-4 pt-3">
        {/* What this sensor measures, as reported. No interpretation, no colour. Two columns, so a
            reference-grade station's six pollutants do not make the card too tall for the map. */}
        {sensor.readings.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            {sensor.readings.map((reading) => (
              <div key={reading.pollutant} className="flex items-baseline justify-between gap-2">
                <dt className="text-xs text-foreground/70">{reading.pollutant}</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {reading.value}
                  <span className="ml-1 text-xs font-normal text-foreground/70">{reading.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* The live line. Tier 2 has no readings and therefore no update time to report. */}
        {tier !== 2 && (
          <p className="flex items-center gap-2 text-xs text-foreground/70">
            <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-full bg-foreground" />
            Live · updated {sensor.updatedMinutesAgo} min ago
          </p>
        )}

        <p className="text-xs text-foreground/70">{sensorTypeLabel(sensor)}</p>

        <div className="-mb-3 border-t border-border">
          <OutboundLink href={dataSource.url} className="text-xs font-medium text-foreground">
            Learn more at the data source
          </OutboundLink>
        </div>
      </div>
    </div>
  )
}
