/**
 * SensorDetail.tsx — the sensor detail's content (spec 5.6, reworked in iteration 2, decision E,
 * iteration 3, decision C, and iteration 4, round 3 decision D), shown in AtlasDialog, opened from
 * the sensor card's "More".
 *
 * Purpose
 *   The expert layer: the only place raw numbers appear (rule 7). In order:
 *     1. The dialog header carries the sensor facts (iteration 4, decision D1): a small top line
 *        with the sensor-type icon and "Reference grade" (SensorDetailAbove); the station name or
 *        location, most prominent (the dialog title); a small line "Station type: Industrial" where
 *        the city publishes one (SensorDetailBelow). The separate type, station-type and update
 *        lines are gone.
 *     2. The advice block for the station's CURRENT band only: the scale with its capsule above the
 *        current band (decision C), then the city's items, grouped (decision E); the index link
 *        behind an "i". No current band, no advice: a stale sensor has none, and a fresh sensor
 *        whose city sent no band (or an unrated district) shows NO box: the detail goes straight to
 *        "Latest readings" (decision B2, amended by R). A city that rates areas, not stations, passes `areaBand` to show the area's
 *        band here (phase 2); a city with no index shows no block.
 *     3. "Latest readings", with "Updated 11 min ago" right-aligned on the heading line (decision
 *        D2; stale: "Last reading 9 hours ago"). Each row (decision D3): pollutant, value and unit,
 *        the "i" right next to the reading (holding how the index sets that pollutant's level, and
 *        the reading's own time where it is older than the heading's), then the band capsule and the
 *        chevron. No per-row time. A stale sensor's rows carry no capsule (no band when stale).
 *        The expanded content ("What it is", "What it does to the body") starts at the value's left
 *        edge (decision D4).
 *     4. A small "Go further" block with the city's own links (iteration 3, decision C4).
 *
 * Card or dialog (spec 5.6, developer's call, round 1): a dialog (full-height sheet on a phone).
 *
 * Key exports: SensorDetail, SensorDetailAbove, SensorDetailBelow (named)
 * External dependencies: react, lucide-react, ./city-ui, ./Explainers, ../chapter/ChapterLink,
 *   ../chapter/CreditInfo, ../../_data/bogota (CityPage, CityLink), ../../_data/city-sensors.
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BandChip, CurrentAdvice, SensorMarkIcon, SensorTypeIcon } from './city-ui'
import { markerFillFor } from '../chapter/atlas-markers'
import { PollutantExplainerShort } from './Explainers'
import { CreditInfo } from '../chapter/CreditInfo'
import { OutboundLink } from '../chapter/ChapterLink'
import { areaBandAt } from '../../_data/city-page'
import type { CityLink, CityPage } from '../../_data/city-page'

/** How an area band is named in the sensor detail: "In Kebayoran Baru", "Regional model at this point". */
function areaCaption(city: CityPage, name: string | null): string {
  if (city.mapMethod === 'surface') return 'Regional model at this point'
  return name === null ? 'In this district' : `In ${name}`
}
import { ageWords, freshnessOf, POLLUTANT_NAMES, sensorTypeCardLabel } from '../../_data/city-sensors'
import { POLLUTANT_EXPLAINERS } from '../../_data/pollutant-explainers'
import type { CitySensor, PollutantId } from '../../_data/city-sensors'

/** Props for SensorDetail. */
type SensorDetailProps = {
  city: CityPage
  sensor: CitySensor
}

/** Props for the header lines. */
type SensorHeaderProps = {
  sensor: CitySensor
}

/** Props for SensorDetailAbove. */
type SensorDetailAboveProps = SensorHeaderProps & {
  city: CityPage
}

/**
 * The header's small top line (decision D1): sensor-type icon and type. For a fresh sensor in a city
 * with no index the icon is the marker's own plain black, as on the map (round 3, Jack's marker
 * rule); stale keeps the existing grey type icon.
 */
export function SensorDetailAbove({ city, sensor }: SensorDetailAboveProps) {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
  return (
    <p className="flex items-center gap-2 text-xs font-medium text-foreground/70" data-detail-type="">
      {city.index === null && freshness === 'fresh'
        ? <SensorMarkIcon type={sensor.type} fill={markerFillFor(freshness, false, null, false)} colour={null} />
        : <SensorTypeIcon type={sensor.type} fill={null} />}
      {sensorTypeCardLabel(sensor.type)}
    </p>
  )
}

/** The header's small line below the name (decision D1): the station type, where published. */
export function SensorDetailBelow({ sensor }: SensorHeaderProps) {
  return <p className="text-xs text-foreground/70" data-detail-station-type="">Station type: {sensor.stationType}</p>
}

/** How the averaging note names a pollutant in prose: particles by notation, gases by name. Pure. */
function proseName(pollutant: PollutantId): string {
  if (pollutant.startsWith('PM') || pollutant === 'TSP') return pollutant
  return POLLUTANT_NAMES[pollutant].toLowerCase()
}

/** "a" or "an" before an averaging time: "an 8-hour", "a 12-hour", "a 1-hour". Pure. */
function articleFor(averaging: string): string {
  return /^(8|11|18)\b|^(8|11|18)-/.test(averaging) ? 'an' : 'a'
}

/**
 * The note behind a reading row's "i" (iteration 3, decision C5 as corrected by Jack): what the
 * index uses to set THIS pollutant's level, from the data file's averaging time, e.g. "IBOCA sets
 * the ozone level from an 8-hour average." It describes how the level is set, never what the
 * displayed number is. Pure.
 */
function averagingNote(city: CityPage, pollutant: PollutantId, averaging: string): string {
  // A city with no index sets no level (Sofia, Milan): say how the reading is published instead.
  // Decision X: the index only sets a level for the pollutants it rates; any other published reading
  // is described as the city publishes it.
  if (city.index === null || !city.indexPollutants.includes(pollutant)) {
    return `${city.name} publishes this reading as ${articleFor(averaging)} ${averaging}.`
  }
  return `${city.index.name} sets the ${proseName(pollutant)} level from ${articleFor(averaging)} ${averaging}.`
}

/** The sensor detail's content. */
export function SensorDetail({ city, sensor }: SensorDetailProps) {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
  const fresh = freshness === 'fresh'
  // The city's own sites, in the page's Go further order: services, then the data.
  const furtherLinks: CityLink[] = [...city.goFurther.services, ...city.goFurther.getTheData]
  // One pollutant explainer open at a time.
  const [openPollutant, setOpenPollutant] = useState<PollutantId | null>(null)
  // The area band at the sensor (a district, Brussels's surface), looked up, never computed.
  // Station cities (Bogotá, Jakarta) have none: their advice comes from the station's own band.
  const area = areaBandAt(city, sensor.lngLat)
  const timeLine = fresh ? `Updated ${ageWords(sensor.updatedMinutesAgo)}` : `Last reading ${ageWords(sensor.updatedMinutesAgo)}`

  return (
    <div className="space-y-6" data-sensor-detail={sensor.id}>
      {/* 2. Advice for the current band only; none without a current band (decisions B1, B2).
          Station method: the station's own band, fresh only. District and surface methods: the
          band the city gives the AREA the sensor stands in, named as such. None method: nothing. */}
      {city.index !== null && city.mapMethod === 'station' && fresh && sensor.overallBand !== null && (
        <CurrentAdvice city={city} index={city.index} band={sensor.overallBand} caption={null} />
      )}
      {city.index !== null && area !== null && area.band !== null && (
        <CurrentAdvice
          city={city}
          index={city.index}
          band={area.band}
          // No "In Tebet" label when the sensor is already named by its district.
          caption={city.mapMethod === 'district' && sensor.name === null && sensor.location === area.name ? null : areaCaption(city, area.name)}
        />
      )}
      {/* Round 3 decision R (addition): with no band (fresh but not sent, or an unrated district)
          there is no advice box at all; the detail goes straight to "Latest readings". */}

      {/* 3. Readings, with the update time on the heading line (decision D2). */}
      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">Latest readings</h3>
          <p className={`text-right text-xs ${fresh ? 'text-foreground/70' : 'font-medium text-foreground'}`} data-readings-time="">
            {timeLine}
          </p>
        </div>
        <ul className="mt-2 divide-y divide-border border-y border-border">
          {sensor.readings.map((reading) => {
            // Decision X: a pollutant without a sourced description has nothing to expand.
            const expandable = POLLUTANT_EXPLAINERS[reading.pollutant] !== undefined
            const open = expandable && openPollutant === reading.pollutant
            const panelId = `bda-explainer-${sensor.id}-${reading.pollutant}`
            // Its own time only where it is older than the heading's (decision D3).
            const ownTime =
              reading.updatedMinutesAgo !== null && reading.updatedMinutesAgo > sensor.updatedMinutesAgo
                ? `Read ${ageWords(reading.updatedMinutesAgo)}.`
                : null
            return (
              <li key={reading.pollutant}>
                {/* The whole row toggles the explainer: the pollutant's button stretches over the
                    row (after:inset-0). The "i" sits above that layer (z-10), outside the button,
                    since a button cannot hold another button. */}
                <div className="relative flex min-h-14 w-full items-center gap-3 py-2" data-reading-row={reading.pollutant}>
                  {expandable ? (
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenPollutant(open ? null : reading.pollutant)}
                      className="w-20 shrink-0 text-left text-sm font-semibold text-foreground outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-foreground"
                    >
                      {reading.pollutant}
                      <span className="sr-only">: {open ? 'hide' : 'show'} what {reading.pollutant} is</span>
                    </button>
                  ) : (
                    <span className="w-20 shrink-0 [overflow-wrap:normal] text-sm font-semibold leading-tight text-foreground">{reading.pollutant}</span>
                  )}
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="text-base font-semibold tabular-nums text-foreground">
                      {reading.value}
                      <span className="ml-1 text-xs font-normal text-foreground/70">{reading.unit}</span>
                    </span>
                    <span className="relative z-10 inline-flex">
                      <CreditInfo label={`About this ${reading.pollutant} reading`} align="start" className="" inDialog={true}>
                        {ownTime !== null && <p data-reading-own-time={reading.pollutant}>{ownTime}</p>}
                        <p data-averaging-note={reading.pollutant} className={ownTime !== null ? 'mt-2' : ''}>
                          {averagingNote(city, reading.pollutant, reading.averaging)}
                        </p>
                      </CreditInfo>
                    </span>
                  </span>
                  {/* The city's band for this pollutant, as context. None when stale or not sent. */}
                  {fresh && reading.band !== null && city.index !== null && (
                    <span className="pointer-events-none shrink-0">
                      <BandChip index={city.index} band={reading.band} pollutant={null} stale={false} />
                    </span>
                  )}
                  {expandable ? (
                    <ChevronDown className={`pointer-events-none h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                </div>
                {open && (
                  // Starts at the value's left edge: the pollutant column (w-20) plus the gap (decision D4).
                  <div id={panelId} className="pb-4 pl-[5.75rem] pt-1" data-explainer-panel="">
                    <PollutantExplainerShort pollutant={reading.pollutant} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* 4. Go further: the city's own sites (iteration 3, decision C4), the page's Go further links. */}
      <section aria-labelledby={`bda-detail-further-${sensor.id}`} className="border-t border-border pt-4">
        <h3 id={`bda-detail-further-${sensor.id}`} className="text-base font-semibold text-foreground">
          Go further
        </h3>
        <ul className="mt-1">
          {furtherLinks.map((link) => (
            <li key={`${link.label}-${link.url}`} className="border-b border-border last:border-b-0">
              <OutboundLink href={link.url} className="w-full justify-between text-sm font-medium text-foreground">
                {link.label}
              </OutboundLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
