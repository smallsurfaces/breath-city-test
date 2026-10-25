/**
 * TapCard.tsx — the one card on the city map (spec 5.4).
 *
 * Purpose
 *   Two ways in, one card, never stacked:
 *     - Tap the map (not a marker): a pin drops and the card lists the NEAREST THREE REPORTING
 *       sensors to it. Dashed lines from the pin to each are drawn by the map.
 *     - Tap a sensor: the card shows that sensor, with its three nearest reporting neighbours listed
 *       below it.
 *   Pattern from /direction-1-mapbox-v2's TriangulationPopup (read, never edited), with its
 *   averaged header value and its band REMOVED: this card has no headline number and no headline
 *   band (rule 1). Bogotá publishes no area bands, so there is no area-rating header either.
 *
 * Each sensor row (pollutant lines per spec 5.8: see ./PollutantHelper for the three variants)
 *   distance from the pin ("1.2 km"), freshness in words ("12 min ago"), the sensor-type icon, one
 *   chip per pollutant in Bogotá's band colour with the band label ("PM2.5 · Moderado"), and a
 *   "Sensor details" link. Tapping a chip shows the city's advice for that band inline (one or two
 *   lines plus "IBOCA · Find out more"); expanding is the only interaction, and only one chip is
 *   open at a time across the card. No raw numbers here (rule 7).
 *
 * Freshness (spec 5.5)
 *   Stale rows keep the last reading's labels in grey with "last reading 9 hours ago", and their
 *   chips do not expand (advice for a level that may have passed would mislead). Dead sensors never
 *   appear among the nearest three; a dead sensor tapped directly says how long it has been silent.
 *
 * Placement
 *   The card is an overlay INSIDE the map frame, docked bottom on a phone (at most 62% of the map,
 *   so the pin and its lines stay in view) and top-left from `md`,
 *   capped at the map's height and scrolling inside itself. Docking (rather than a popup tied to a
 *   point) keeps it inside the map at every size without moving the map.
 *
 * Accessibility
 *   A non-modal region labelled by its heading; focus moves to the heading on open; Escape and the
 *   56px close button close it, and the map returns focus to the opener.
 *
 * Key exports: TapCard (named), MapSelection (type)
 * External dependencies: react, lucide-react, ./city-ui, ../../_data/bogota, ../../_data/city-sensors.
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { AdviceBlock, SensorTypeIcon } from './city-ui'
import { PollutantHelperLine } from './PollutantHelper'
import type { HelperVariant } from './PollutantHelper'
import type { CityPage } from '../../_data/bogota'
import { ageWords, distanceWords, freshnessOf, nearestReporting, sensorTypeLabel } from '../../_data/city-sensors'
import type { CitySensor } from '../../_data/city-sensors'

/** What the card is open for. */
export type MapSelection = { kind: 'point'; lngLat: [number, number] } | { kind: 'sensor'; sensor: CitySensor }

/** How many neighbours the card lists. */
const NEAREST_COUNT = 3

/** The neighbours a selection lists, nearest first. Pure. */
export function neighboursFor(city: CityPage, selection: MapSelection): Array<{ sensor: CitySensor; km: number }> {
  return selection.kind === 'point'
    ? nearestReporting(selection.lngLat, city.sensors, NEAREST_COUNT, null, city.updateCycleMinutes)
    : nearestReporting(selection.sensor.lngLat, city.sensors, NEAREST_COUNT, selection.sensor.id, city.updateCycleMinutes)
}

/** Props for TapCard. */
type TapCardProps = {
  city: CityPage
  selection: MapSelection
  onClose: () => void
  onOpenDetail: (sensor: CitySensor) => void
  /** How each pollutant is shown (spec 5.8): helper sentence, icon + chip, or the plain chip. */
  variant: HelperVariant
}

/** Props for one sensor row. */
type SensorRowProps = {
  city: CityPage
  sensor: CitySensor
  /** Distance from the pin (or the tapped sensor); null for the tapped sensor itself. */
  km: number | null
  /** The open chip, as "sensorId:pollutant", or null. */
  openChip: string | null
  onToggleChip: (key: string) => void
  onOpenDetail: (sensor: CitySensor) => void
  variant: HelperVariant
}

/** One sensor in the card. */
function SensorRow({ city, sensor, km, openChip, onToggleChip, onOpenDetail, variant }: SensorRowProps) {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
  const open = sensor.readings.find((reading) => openChip === `${sensor.id}:${reading.pollutant}`) ?? null
  const age =
    freshness === 'fresh'
      ? ageWords(sensor.updatedMinutesAgo)
      : freshness === 'stale'
        ? `last reading ${ageWords(sensor.updatedMinutesAgo)}`
        : `no reading for ${ageWords(sensor.updatedMinutesAgo).replace(' ago', '')}`
  return (
    <li className="space-y-2 py-3">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-foreground">
        <SensorTypeIcon type={sensor.type} />
        <span className="font-semibold">{km === null ? 'This sensor' : distanceWords(km)}</span>
        <span className="text-foreground/70">· {age}</span>
        <span className="sr-only">, {sensorTypeLabel(sensor.type)}</span>
      </p>
      {freshness !== 'dead' && (
        <ul
          className={variant === 'chips' ? 'flex flex-wrap gap-x-2 gap-y-3' : 'space-y-2'}
          aria-label="Levels by pollutant"
        >
          {sensor.readings.map((reading) => {
            const key = `${sensor.id}:${reading.pollutant}`
            return (
              <li key={reading.pollutant}>
                <PollutantHelperLine
                  city={city}
                  reading={reading}
                  stale={freshness === 'stale'}
                  variant={variant}
                  expanded={openChip === key}
                  onToggle={() => onToggleChip(key)}
                />
              </li>
            )
          })}
        </ul>
      )}
      {open !== null && freshness === 'fresh' && (
        <div className="rounded-xl bg-muted px-3 pt-2">
          <p className="text-xs font-semibold text-foreground/70">What {city.name} advises</p>
          <AdviceBlock city={city} band={open.band} compact={true} />
        </div>
      )}
      <button
        type="button"
        onClick={() => onOpenDetail(sensor)}
        className="-my-2 inline-flex min-h-14 items-center gap-1.5 rounded-lg text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        Sensor details
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  )
}

/** The tap card. */
export function TapCard({ city, selection, onClose, onOpenDetail, variant }: TapCardProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const [openChip, setOpenChip] = useState<string | null>(null)
  const neighbours = neighboursFor(city, selection)
  const headingId = 'bda-tap-card-heading'

  // Side effect: a new selection collapses any open chip and moves focus to the heading, without
  // scrolling the page (the card sits inside the map).
  const selectionKey = selection.kind === 'point' ? selection.lngLat.join(',') : selection.sensor.id
  useEffect(() => {
    setOpenChip(null)
    headingRef.current?.focus({ preventScroll: true })
  }, [selectionKey])

  const toggleChip = (key: string): void => setOpenChip((current) => (current === key ? null : key))

  return (
    <section
      aria-labelledby={headingId}
      className="pointer-events-auto absolute inset-x-2 bottom-2 z-10 flex max-h-[62%] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl md:inset-x-auto md:bottom-auto md:left-3 md:top-3 md:max-h-[calc(100%-1.5rem)] md:w-[22rem]"
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border py-1 pl-4 pr-1">
        <h3 id={headingId} ref={headingRef} tabIndex={-1} className="py-3 text-base font-bold leading-tight text-foreground outline-none">
          {selection.kind === 'point' ? 'Nearest sensors to where you tapped' : sensorTypeLabel(selection.sensor.type)}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 overflow-y-auto px-4">
        <ul className="divide-y divide-border">
          {selection.kind === 'sensor' && (
            <SensorRow
              city={city}
              sensor={selection.sensor}
              km={null}
              openChip={openChip}
              onToggleChip={toggleChip}
              onOpenDetail={onOpenDetail}
              variant={variant}
            />
          )}
        </ul>
        {selection.kind === 'sensor' && neighbours.length > 0 && (
          <p className="border-t border-border pt-3 text-xs font-semibold uppercase tracking-wide text-foreground/60">Nearest sensors</p>
        )}
        <ul className="divide-y divide-border">
          {neighbours.map(({ sensor, km }) => (
            <SensorRow
              key={sensor.id}
              city={city}
              sensor={sensor}
              km={km}
              openChip={openChip}
              onToggleChip={toggleChip}
              onOpenDetail={onOpenDetail}
              variant={variant}
            />
          ))}
        </ul>
        {neighbours.length === 0 && <p className="py-3 text-sm text-foreground/70">No reporting sensors nearby.</p>}
      </div>
    </section>
  )
}
