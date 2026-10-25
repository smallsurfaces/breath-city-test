/**
 * TapCard.tsx — the one card on the city map (spec 5.4, reworked in iteration 2, decisions C and D).
 *
 * Purpose
 *   Two ways in, one card, never stacked:
 *     - Tap a sensor (decision C): THAT SENSOR ONLY, no nearest-sensors section. In order:
 *         1. the scale bar of equal-width segments (BandScale, a tooltip per segment), with the band
 *            capsule above the current band as its marker (iteration 4, round 3 decision C) and the
 *            index name under it. Stale: grey bar, "No current IBOCA level". Fresh but no band sent
 *            (decision B2): grey bar, "No IBOCA level reported";
 *         2. the station name, or its location where it has no name (placeName);
 *         3. the sensor type ("Reference grade" / "Low-cost sensor", iteration 3 decision B);
 *         4. "Live · updated 6 min ago" (stale: grey, "Last reading 9 hours ago");
 *         5. "More", opening the sensor detail.
 *       No pollutant lines, no raw numbers, no data source line.
 *     - Tap the map (decision D): a pin drops and the card lists the NEAREST THREE REPORTING
 *       sensors, fresh or stale (iteration 4, decision B1: nothing drops out), one compact row each:
 *       the marker in small (SensorMarkIcon: band colour, black "–", or grey), name or location,
 *       distance, recency, the band capsule (none when stale; "No level reported" when the city sent
 *       no band), and an arrow that opens that sensor's card. No header value, no
 *       pollutant lines. The dashed lines from the pin are drawn by the map.
 *
 * Placement
 *   The card is absolutely positioned inside the map frame by the map (AtlasDataMap), next to the
 *   tapped sensor or the pin, after the map has moved to make room (decision B8). This component only
 *   renders; it takes the position as `placement` and hands its own box back through `cardRef`, so
 *   the map can measure it. Until the first placement it is laid out but invisible.
 *
 * Accessibility
 *   A non-modal region labelled by its heading; focus moves to the heading on open; Escape and the
 *   56px close button close it, and the map returns focus to the opener. Rows and "More" are
 *   buttons at least 56px tall.
 *
 * Key exports: TapCard (named), MapSelection (type), CardPlacement (type), neighboursFor
 * External dependencies: react, lucide-react, ./city-ui, ./BandScale, ../../_data/bogota, ../../_data/indexes,
 *   ../../_data/city-sensors.
 */

'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { ArrowRight, ChevronRight, X } from 'lucide-react'
import { BandChip, SensorMarkIcon, SensorTypeIcon } from './city-ui'
import { markerFillFor } from '../chapter/atlas-markers'
import { BandScale } from './BandScale'
import type { CityPage } from '../../_data/bogota'
import { indexLevel, levelDisplayName } from '../../_data/indexes'
import { ageWords, distanceWords, freshnessOf, nearestReporting, placeName, sensorTypeCardLabel } from '../../_data/city-sensors'
import type { CitySensor } from '../../_data/city-sensors'

/** What the card is open for. */
export type MapSelection = { kind: 'point'; lngLat: [number, number] } | { kind: 'sensor'; sensor: CitySensor }

/** Where the map put the card, in px inside the map frame; null before the first placement. */
export type CardPlacement = { left: number; top: number; width: number } | null

/** How many neighbours the point card lists. */
const NEAREST_COUNT = 3

/** The nearest reporting sensors to a tapped point, nearest first. Empty for a sensor tap. Pure. */
export function neighboursFor(city: CityPage, selection: MapSelection): Array<{ sensor: CitySensor; km: number }> {
  if (selection.kind === 'sensor') return []
  return nearestReporting(selection.lngLat, city.sensors, NEAREST_COUNT, null, city.updateCycleMinutes)
}

/** The recency in words, for a row (two states only, decision B1). Pure. */
function recencyWords(city: CityPage, sensor: CitySensor): string {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
  if (freshness === 'fresh') return ageWords(sensor.updatedMinutesAgo)
  return `last reading ${ageWords(sensor.updatedMinutesAgo)}`
}

/** Props for TapCard. */
type TapCardProps = {
  city: CityPage
  selection: MapSelection
  placement: CardPlacement
  cardRef: RefObject<HTMLElement | null>
  onClose: () => void
  onOpenDetail: (sensor: CitySensor) => void
  /** A nearest-three row: open that sensor's own card. */
  onSelectSensor: (sensor: CitySensor) => void
}

/** Props for SensorBody. */
type SensorBodyProps = {
  city: CityPage
  sensor: CitySensor
  onOpenDetail: (sensor: CitySensor) => void
  headingId: string
  headingRef: RefObject<HTMLHeadingElement | null>
}

/** The sensor card's body (decision C). */
function SensorBody({ city, sensor, onOpenDetail, headingId, headingRef }: SensorBodyProps) {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
  const live = freshness === 'fresh'
  return (
    <div className="space-y-2 px-4 pb-1 pt-3">
      {/* 1. The city's scale, its capsule above the current band (iteration 4, decision C), the
          index named under it. No band (stale, or none reported): a grey bar and the reason. */}
      <div className="pr-10" data-card-band-header="">
        {live && sensor.overallBand !== null ? (
          <>
            <BandScale index={city.index} band={sensor.overallBand} />
            <p className="mt-1 text-[11px] font-semibold leading-tight text-foreground/70">{city.index.name}</p>
          </>
        ) : (
          <>
            <p className="pb-1 text-sm font-semibold text-foreground/70">
              {live ? `No ${city.index.name} level reported` : `No current ${city.index.name} level`}
            </p>
            <BandScale index={city.index} band={null} />
          </>
        )}
      </div>
      {/* 2. Name or location. */}
      <h3 id={headingId} ref={headingRef} tabIndex={-1} className="pt-1 text-base font-bold leading-tight text-foreground outline-none">
        {placeName(sensor)}
      </h3>
      {/* 3. Sensor type. */}
      <p className="flex items-center gap-2 text-sm text-foreground/85">
        <SensorTypeIcon type={sensor.type} fill={null} />
        {sensorTypeCardLabel(sensor.type)}
      </p>
      {/* 4. Live line, or the age of the last reading. */}
      <p className={`flex items-center gap-2 text-sm ${live ? 'text-foreground' : 'text-foreground/60'}`}>
        <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${live ? 'bg-foreground' : 'bg-foreground/30'}`} />
        {live ? `Live · updated ${ageWords(sensor.updatedMinutesAgo)}` : `Last reading ${ageWords(sensor.updatedMinutesAgo)}`}
      </p>
      {/* 5. More. */}
      <button
        type="button"
        onClick={() => onOpenDetail(sensor)}
        className="-mb-1 inline-flex min-h-14 items-center gap-1.5 rounded-lg text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        More
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

/** Props for NearestRow. */
type NearestRowProps = {
  city: CityPage
  sensor: CitySensor
  km: number
  onSelect: () => void
}

/** One nearest-three row (decision D). The whole row is the button; the arrow is its affordance. */
function NearestRow({ city, sensor, km, onSelect }: NearestRowProps) {
  const live = freshnessOf(sensor, city.updateCycleMinutes) === 'fresh'
  const level = sensor.overallBand === null ? null : indexLevel(city.index, sensor.overallBand)
  const status = !live
    ? `no current ${city.index.name} level`
    : level === null
      ? `no ${city.index.name} level reported`
      : `${city.index.name} ${levelDisplayName(level)}`
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        data-nearest-row={sensor.id}
        className="flex min-h-14 w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
        aria-label={`${placeName(sensor)}, ${distanceWords(km)}, ${recencyWords(city, sensor)}, ${status}. Open its card.`}
      >
        <SensorMarkIcon type={sensor.type} fill={markerFillFor(live ? 'fresh' : 'stale', true, sensor.overallBand)} colour={level?.hex ?? null} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{placeName(sensor)}</span>
          <span className="block text-xs text-foreground/70">
            {distanceWords(km)} · {recencyWords(city, sensor)}
          </span>
        </span>
        {live && sensor.overallBand !== null && (
          <BandChip index={city.index} band={sensor.overallBand} pollutant={null} stale={false} />
        )}
        {live && sensor.overallBand === null && <span className="text-xs text-foreground/70">No level reported</span>}
        <ChevronRight className="h-4 w-4 shrink-0 text-foreground/70" aria-hidden="true" />
      </button>
    </li>
  )
}

/** The tap card. */
export function TapCard({ city, selection, placement, cardRef, onClose, onOpenDetail, onSelectSensor }: TapCardProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const neighbours = neighboursFor(city, selection)
  const headingId = 'bda-tap-card-heading'

  // Side effect: a new selection moves focus to the heading, without scrolling the page.
  const selectionKey = selection.kind === 'point' ? selection.lngLat.join(',') : selection.sensor.id
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [selectionKey])

  const style: CSSProperties =
    placement === null
      ? { left: 8, top: 8, visibility: 'hidden' }
      : { left: placement.left, top: placement.top, width: placement.width }

  return (
    <section
      ref={cardRef}
      aria-labelledby={headingId}
      data-card-kind={selection.kind}
      style={style}
      className="pointer-events-auto absolute z-10 flex max-h-[calc(100%-1rem)] w-[18rem] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-0 top-0 z-10 flex h-14 w-14 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="min-h-0 overflow-y-auto">
        {selection.kind === 'sensor' ? (
          <SensorBody city={city} sensor={selection.sensor} onOpenDetail={onOpenDetail} headingId={headingId} headingRef={headingRef} />
        ) : (
          <div className="pb-1 pt-3">
            <h3 id={headingId} ref={headingRef} tabIndex={-1} className="min-h-8 px-4 pr-14 text-base font-bold leading-tight text-foreground outline-none">
              Nearest sensors
            </h3>
            {neighbours.length === 0 ? (
              <p className="px-4 py-3 text-sm text-foreground/70">No reporting sensors nearby.</p>
            ) : (
              <ul className="divide-y divide-border">
                {neighbours.map(({ sensor, km }) => (
                  <NearestRow key={sensor.id} city={city} sensor={sensor} km={km} onSelect={() => onSelectSensor(sensor)} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
