/**
 * TapCard.tsx — the one card on the city map (spec 5.4, reworked in iteration 2, decisions C and D).
 *
 * Purpose
 *   Two ways in, one card, never stacked:
 *     - Tap a sensor (decision C): THAT SENSOR ONLY, no nearest-sensors section. In order:
 *         1. the scale bar of equal-width segments (BandScale, a tooltip per segment), with the band
 *            capsule above the current band as its marker (iteration 4, round 3 decision C) and the
 *            index name under it. Stale: grey bar, "No current IBOCA level". Fresh but no band sent
 *            (decision B2, amended by R): the empty grey bar only, no text;
 *         2. the station name, or its location where it has no name (placeName);
 *         3. the sensor type ("Reference grade" / "Low-cost sensor", iteration 3 decision B);
 *         4. "Live · updated 6 min ago" (stale: grey, "Last reading 9 hours ago");
 *         5. "More", opening the sensor detail.
 *       No pollutant lines, no raw numbers, no data source line.
 *     - Tap the map (decision D): a pin drops and the card lists the NEAREST THREE REPORTING
 *       sensors, fresh or stale (iteration 4, decision B1: nothing drops out), one compact row each:
 *       the marker in small (SensorMarkIcon: band colour, black "–", plain black, or grey), name or location,
 *       distance, recency, the band capsule (none when stale; "No level reported" when the city sent
 *       no band), and an arrow that opens that sensor's card. No header value, no
 *       pollutant lines. The dashed lines from the pin are drawn by the map.
 *
 * Phase 2 (four new cities, SPEC ADDENDUM): the card follows the city's map method.
 *   station   (Bogotá, Jakarta) as above. Jakarta moved here from 'district' on 2026-10-25 (Udara
 *             Jakarta publishes ISPU per station).
 *   district  (no city now; formerly Jakarta) tap anywhere: the district's band first (scale with capsule, "ISPU", the
 *             district's name, "More" for the district's advice), then the nearest three, rows with
 *             neutral icons and no band. Tap a sensor: no band header (the band belongs to the
 *             district); a small line "In Kebayoran Baru: [Moderate] · ISPU" before "More".
 *   surface   (Brussels) tap anywhere: the point's band ("At this point") first, then the nearest
 *             three. Tap a sensor: the band header shows the surface's band at the sensor, labelled
 *             as the regional model's value at that point.
 *   none      (Sofia, Milan) no scale, no band, no advice anywhere. Tap anywhere: nearest three with
 *             distance and freshness. Tap a sensor: name, type, freshness, "More".
 *   The area band is LOOKED UP (city-page areaBandAt), never computed.
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
import { areaBandAt } from '../../_data/city-page'
import type { CityPage } from '../../_data/city-page'
import type { CityAirQualityIndex } from '../../_data/indexes'
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
  /** "More" on an area band (district or point): open that band's advice. */
  onOpenArea: (area: { title: string; caption: string; band: number }) => void
}

/** Props for SensorBody. */
type SensorBodyProps = {
  city: CityPage
  sensor: CitySensor
  onOpenDetail: (sensor: CitySensor) => void
  headingId: string
  headingRef: RefObject<HTMLHeadingElement | null>
}

/** The scale with its capsule and the index named under it (decision C). */
function ScaleWithName({ index, band, note }: { index: CityAirQualityIndex; band: number; note: string | null }) {
  return (
    <>
      <BandScale index={index} band={band} />
      <p className="mt-1 text-[11px] font-semibold leading-tight text-foreground/70">
        {index.name}
        {note !== null && <span className="font-normal"> · {note}</span>}
      </p>
    </>
  )
}

/** The sensor card's body (decision C), by the city's map method. */
function SensorBody({ city, sensor, onOpenDetail, headingId, headingRef }: SensorBodyProps) {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
  const live = freshness === 'fresh'
  const index = city.index
  const area = areaBandAt(city, sensor.lngLat)
  return (
    <div className="space-y-2 px-4 pb-1 pt-3">
      {/* 1. The band header. Station: the station's own band. Surface: the model's band at the
          sensor. District and none: no header (the band belongs to the district, or there is none). */}
      {index !== null && city.mapMethod === 'station' && (
        <div className="pr-10" data-card-band-header="">
          {live && sensor.overallBand !== null ? (
            <ScaleWithName index={index} band={sensor.overallBand} note={null} />
          ) : (
            <>
              {/* Round 3 decision R: a fresh reading with no band shows only the empty grey bar
                  (no text, no capsule); stale keeps its line. */}
              {!live && <p className="pb-1 text-sm font-semibold text-foreground/70">No current {index.name} level</p>}
              <BandScale index={index} band={null} />
            </>
          )}
        </div>
      )}
      {index !== null && city.mapMethod === 'surface' && area !== null && area.band !== null && (
        <div className="pr-10" data-card-band-header="">
          <ScaleWithName index={index} band={area.band} note="regional model at this point" />
        </div>
      )}
      {/* 2. Name or location. */}
      <h3 id={headingId} ref={headingRef} tabIndex={-1} className={`${index !== null && (city.mapMethod === 'station' || city.mapMethod === 'surface') ? 'pt-1' : 'pr-10'} text-base font-bold leading-tight text-foreground outline-none`}>
        {placeName(sensor)}
      </h3>
      {/* 3. Sensor type. */}
      <p className="flex items-center gap-2 text-sm text-foreground/85">
        {/* A fresh sensor in a city with no index: the marker's own plain black, as on the map.
            Stale keeps the existing grey type icon. */}
        {city.index === null && live
          ? <SensorMarkIcon type={sensor.type} fill={markerFillFor('fresh', false, null, false)} colour={null} />
          : <SensorTypeIcon type={sensor.type} fill={null} />}
        {sensorTypeCardLabel(sensor.type)}
      </p>
      {/* 4. Live line, or the age of the last reading. */}
      <p className={`flex items-center gap-2 text-sm ${live ? 'text-foreground' : 'text-foreground/60'}`}>
        <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${live ? 'bg-foreground' : 'bg-foreground/30'}`} />
        {live ? `Live · updated ${ageWords(sensor.updatedMinutesAgo)}` : `Last reading ${ageWords(sensor.updatedMinutesAgo)}`}
      </p>
      {/* District method (no city now): the district's band as a small line. */}
      {/* Decision R: a district with no band gets no line at all. */}
      {index !== null && city.mapMethod === 'district' && area !== null && area.band !== null && (
        <p className="flex flex-wrap items-center gap-1.5 text-sm text-foreground/85" data-card-district-line="">
          {/* Don't repeat the district when the sensor is already named by it ("In Tebet"). */}
          {!(sensor.name === null && sensor.location === area.name) && <span>In {area.name}:</span>}
          <BandChip index={index} band={area.band} pollutant={null} stale={false} />
          <span aria-hidden="true">·</span>
          <span>{index.name}</span>
        </p>
      )}
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
  const index = city.index
  // Only the station method gives a sensor its own band; elsewhere the rows carry no band column.
  const ratesStations = city.mapMethod === 'station' && index !== null
  const level = ratesStations && sensor.overallBand !== null && index !== null ? indexLevel(index, sensor.overallBand) : null
  const status = !ratesStations || index === null
    ? null
    : !live
      ? `no current ${index.name} level`
      : level === null
        ? `no ${index.name} level reported`
        : `${index.name} ${levelDisplayName(level)}`
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        data-nearest-row={sensor.id}
        className="flex min-h-14 w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
        aria-label={`${placeName(sensor)}, ${distanceWords(km)}, ${recencyWords(city, sensor)}${status === null ? '' : `, ${status}`}. Open its card.`}
      >
        <SensorMarkIcon
          type={sensor.type}
          fill={markerFillFor(live ? 'fresh' : 'stale', ratesStations, sensor.overallBand, index !== null)}
          colour={level?.hex ?? null}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{placeName(sensor)}</span>
          <span className="block text-xs text-foreground/70">
            {distanceWords(km)} · {recencyWords(city, sensor)}
          </span>
        </span>
        {ratesStations && live && level !== null && index !== null && sensor.overallBand !== null && (
          <BandChip index={index} band={sensor.overallBand} pollutant={null} stale={false} />
        )}
        <ChevronRight className="h-4 w-4 shrink-0 text-foreground/70" aria-hidden="true" />
      </button>
    </li>
  )
}

/** Props for AreaHeader. */
type AreaHeaderProps = {
  city: CityPage
  index: CityAirQualityIndex
  area: { name: string | null; band: number | null }
  onOpenArea: TapCardProps['onOpenArea']
}

/**
 * The tap-anywhere card's area band, first (SPEC ADDENDUM): a district (no city now) or Brussels's point.
 * The scale with its capsule, the index named, the place ("Kebayoran Baru" or "At this point"), and
 * "More" for that band's advice. A district with no band says so and has no "More".
 */
function AreaHeader({ city, index, area, onOpenArea }: AreaHeaderProps) {
  const place = city.mapMethod === 'surface' ? 'At this point' : (area.name ?? 'This district')
  const caption = city.mapMethod === 'surface' ? 'Regional model at this point' : `In ${area.name ?? 'this district'}`
  return (
    <div className="space-y-1 border-b border-border px-4 pb-2 pt-1" data-card-area={city.mapMethod}>
      {area.band !== null ? (
        <ScaleWithName index={index} band={area.band} note={city.mapMethod === 'surface' ? 'IRCELINE model' : null} />
      ) : (
        // Decision R: no band, only the empty grey bar.
        <BandScale index={index} band={null} />
      )}
      <p className="pt-1 text-base font-bold leading-tight text-foreground">{place}</p>
      {area.band !== null && (
        <button
          type="button"
          onClick={() => onOpenArea({ title: place, caption, band: area.band as number })}
          className="-mb-1 inline-flex min-h-14 items-center gap-1.5 rounded-lg text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          More
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/** The tap card. */
export function TapCard({ city, selection, placement, cardRef, onClose, onOpenDetail, onSelectSensor, onOpenArea }: TapCardProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const neighbours = neighboursFor(city, selection)
  const headingId = 'bda-tap-card-heading'
  const area = selection.kind === 'point' ? areaBandAt(city, selection.lngLat) : null

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
            {area !== null && city.index !== null && (
              <div className="pr-12">
                <AreaHeader city={city} index={city.index} area={area} onOpenArea={onOpenArea} />
              </div>
            )}
            <h3
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className={`min-h-8 px-4 pr-14 text-base font-bold leading-tight text-foreground outline-none ${area !== null ? 'pt-2 text-sm' : ''}`}
            >
              Nearest sensors
            </h3>
            {neighbours.length === 0 ? (
              <p className="px-4 py-3 text-sm text-foreground/70">No sensors nearby.</p>
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
