/**
 * SensorDetail.tsx — the sensor detail's content (spec 5.6, reworked in iteration 2, decision E),
 * shown in AtlasDialog, opened from the sensor card's "More".
 *
 * Purpose
 *   The expert layer: the only place raw numbers appear (rule 7). Contents, in order:
 *     1. The dialog header carries the station name or location (set by the map; E1).
 *     2. The advice block for the station's CURRENT band only (E2; iteration 3, decision C1, C2): no
 *        heading, the band capsule and the card's scale bar, then Bogotá's health items (type R);
 *        the "IBOCA index" link sits behind an "i" at the block's top right. A stale or dead sensor
 *        has no current band, so no advice block: no current band, no advice.
 *     3. Sensor type, station type and update time (E3).
 *     4. "Latest readings" (iteration 3, decision C3; was "Readings available"). Decision C5: each
 *        row shows value, unit, "read N min ago" and an "i" right after it holding that pollutant's
 *        averaging time, worded as what IBOCA uses to set its level (never as what the displayed
 *        number is), from the data file. No averaging line in the row. Each row
 *        carries the city's per-pollutant band capsule as smaller context at its far end. Each
 *        pollutant expands to two parts only (E4): "What it is"
 *        and "What it does to the body" (WHO).
 *     5. A small "Go further" block with Bogotá's own links (iteration 3, decision C4): IBOCA air
 *        quality map, RMCAB live monitoring map, RMCAB data reports. It replaces the source line and
 *        the past-readings link.
 *   The helper sentences and the `?helper` variants are gone (E6).
 *
 * Card or dialog (spec 5.6, developer's call, round 1): a dialog (full-height sheet on a phone).
 *
 * Freshness
 *   Stale: the last readings are kept with their age; bands are grey, never band colour; no advice.
 *   Dead: no readings are listed (none in the last 24 hours); the age is stated; no advice.
 *
 * Key exports: SensorDetail (named)
 * External dependencies: react, lucide-react, ./city-ui, ./Explainers, ../chapter/ChapterLink,
 *   ../chapter/CreditInfo, ../../_data/bogota (CityPage, CityLink), ../../_data/city-sensors.
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BandChip, CurrentAdvice, SensorTypeIcon } from './city-ui'
import { PollutantExplainerShort } from './Explainers'
import { CreditInfo } from '../chapter/CreditInfo'
import { OutboundLink } from '../chapter/ChapterLink'
import type { CityLink, CityPage } from '../../_data/bogota'
import { ageWords, freshnessOf, sensorTypeCardLabel } from '../../_data/city-sensors'
import type { CitySensor, PollutantId } from '../../_data/city-sensors'

/** Props for SensorDetail. */
type SensorDetailProps = {
  city: CityPage
  sensor: CitySensor
}

/** How the averaging note names a pollutant in prose: particles by symbol, gases by name. */
const POLLUTANT_PROSE_NAME: Record<PollutantId, string> = {
  'PM2.5': 'PM2.5',
  PM10: 'PM10',
  'O₃': 'ozone',
  'NO₂': 'nitrogen dioxide',
  'SO₂': 'sulfur dioxide',
  CO: 'carbon monoxide',
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
function averagingNote(indexName: string, pollutant: PollutantId, averaging: string): string {
  return `${indexName} sets the ${POLLUTANT_PROSE_NAME[pollutant]} level from ${articleFor(averaging)} ${averaging}.`
}

/** The sensor detail's content. */
export function SensorDetail({ city, sensor }: SensorDetailProps) {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
  // Bogotá's own sites, in the page's Go further order: services, then the data.
  const furtherLinks: CityLink[] = [...city.goFurther.services, ...city.goFurther.getTheData]
  // One pollutant explainer open at a time.
  const [openPollutant, setOpenPollutant] = useState<PollutantId | null>(null)

  return (
    <div className="space-y-6" data-sensor-detail={sensor.id}>
      {/* 2. Advice for the current band only; none without a current band. */}
      {freshness === 'fresh' && <CurrentAdvice city={city} band={sensor.overallBand} />}

      {/* 3. Sensor type, station type, update time. */}
      <div className="space-y-1 text-sm text-foreground/85">
        <p className="flex items-center gap-2">
          <SensorTypeIcon type={sensor.type} fill={null} />
          {sensorTypeCardLabel(sensor.type)}
        </p>
        {sensor.stationType !== null && <p>Station type: {sensor.stationType}</p>}
        <p className={freshness === 'fresh' ? '' : 'font-medium text-foreground'}>
          {freshness === 'dead'
            ? `No reading for ${ageWords(sensor.updatedMinutesAgo).replace(' ago', '')}`
            : freshness === 'stale'
              ? `Last reading ${ageWords(sensor.updatedMinutesAgo)}`
              : `Updated ${ageWords(sensor.updatedMinutesAgo)}`}
        </p>
      </div>

      {/* 4. Readings. */}
      <section>
        <h3 className="text-base font-semibold text-foreground">Latest readings</h3>
        {freshness === 'dead' ? (
          <p className="mt-2 text-sm text-foreground/80">This sensor has sent no readings in the last 24 hours.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border border-y border-border">
            {sensor.readings.map((reading) => {
              const open = openPollutant === reading.pollutant
              const panelId = `bda-explainer-${sensor.id}-${reading.pollutant}`
              return (
                <li key={reading.pollutant}>
                  {/* The whole row toggles the explainer: the pollutant's button stretches over the
                      row (after:inset-0). The "i" sits above that layer (z-10), outside the button,
                      since a button cannot hold another button (decision C5). */}
                  <div className="relative flex min-h-14 w-full items-center gap-3 py-2" data-reading-row={reading.pollutant}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenPollutant(open ? null : reading.pollutant)}
                      className="w-14 shrink-0 text-left text-sm font-semibold text-foreground outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-foreground"
                    >
                      {reading.pollutant}
                      <span className="sr-only">: {open ? 'hide' : 'show'} what {reading.pollutant} is</span>
                    </button>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold tabular-nums text-foreground">
                        {reading.value}
                        <span className="ml-1 text-xs font-normal text-foreground/70">{reading.unit}</span>
                      </span>
                      <span className="flex items-center gap-2 text-xs text-foreground/70">
                        read {ageWords(sensor.updatedMinutesAgo)}
                        <span className="relative z-10 inline-flex">
                          <CreditInfo label={`How ${city.index.name} sets the ${reading.pollutant} level`} align="start" className="" inDialog={true}>
                            <p data-averaging-note={reading.pollutant}>{averagingNote(city.index.name, reading.pollutant, reading.averaging)}</p>
                          </CreditInfo>
                        </span>
                      </span>
                    </span>
                    {/* The city's band for this pollutant, as context, at the row's far end. */}
                    <span className="pointer-events-none shrink-0">
                      <BandChip index={city.index} band={reading.band} pollutant={null} stale={freshness !== 'fresh'} />
                    </span>
                    <ChevronDown className={`pointer-events-none h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </div>
                  {open && (
                    <div id={panelId} className="pb-4 pt-1">
                      <PollutantExplainerShort pollutant={reading.pollutant} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* 5. Go further: Bogotá's own sites (iteration 3, decision C4), the page's Go further links. */}
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
