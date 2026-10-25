/**
 * SensorDetail.tsx — the sensor detail's content (spec 5.6, reworked in iteration 2, decision E),
 * shown in AtlasDialog, opened from the sensor card's "More".
 *
 * Purpose
 *   The expert layer: the only place raw numbers appear (rule 7). Contents, in order:
 *     1. The dialog header carries the station name or location (set by the map; E1).
 *     2. "What Bogotá advises" for the station's CURRENT band only (E2): "IBOCA index" once, then
 *        the band's colour, label and Bogotá's health items (type R). A stale or dead sensor has no
 *        current band, so no advice block: no current band, no advice.
 *     3. Sensor type, station type and update time (E3).
 *     4. The readings: each pollutant with raw value, unit, averaging time and time of reading, and
 *        the city's per-pollutant band as smaller context, set apart from the averaging time
 *        (spec 5.6: never next to it). Each pollutant expands to two parts only (E4): "What it is"
 *        and "What it does to the body" (WHO).
 *     5. Data source and "Past readings and downloads on Bogotá's site" (E5).
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
 *   ../../_data/bogota (CityPage), ../../_data/city-sensors.
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BandChip, CurrentAdvice, SensorTypeIcon } from './city-ui'
import { PollutantExplainerShort } from './Explainers'
import { OutboundLink } from '../chapter/ChapterLink'
import type { CityPage } from '../../_data/bogota'
import { ageWords, freshnessOf, sensorTypeCardLabel } from '../../_data/city-sensors'
import type { CitySensor, PollutantId } from '../../_data/city-sensors'

/** Props for SensorDetail. */
type SensorDetailProps = {
  city: CityPage
  sensor: CitySensor
}

/** The sensor detail's content. */
export function SensorDetail({ city, sensor }: SensorDetailProps) {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
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
        <h3 className="text-base font-semibold text-foreground">Readings available</h3>
        {freshness === 'dead' ? (
          <p className="mt-2 text-sm text-foreground/80">This sensor has sent no readings in the last 24 hours.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border border-y border-border">
            {sensor.readings.map((reading) => {
              const open = openPollutant === reading.pollutant
              const panelId = `bda-explainer-${sensor.id}-${reading.pollutant}`
              return (
                <li key={reading.pollutant}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenPollutant(open ? null : reading.pollutant)}
                    className="flex min-h-14 w-full items-center gap-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    <span className="w-14 shrink-0 text-sm font-semibold text-foreground">{reading.pollutant}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold tabular-nums text-foreground">
                        {reading.value}
                        <span className="ml-1 text-xs font-normal text-foreground/70">{reading.unit}</span>
                      </span>
                      <span className="block text-xs text-foreground/70">
                        {reading.averaging} · read {ageWords(sensor.updatedMinutesAgo)}
                      </span>
                    </span>
                    {/* The city's band for this pollutant, as context, at the row's far end. */}
                    <span className="shrink-0">
                      <BandChip index={city.index} band={reading.band} pollutant={null} stale={freshness !== 'fresh'} />
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    <span className="sr-only">{open ? 'Hide' : 'Show'} what {reading.pollutant} is</span>
                  </button>
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

      {/* 5. Data source and past readings. */}
      <section className="space-y-1 border-t border-border pt-4 text-sm text-foreground/80">
        <p>Source: {city.sensorSource[sensor.type]}</p>
        <OutboundLink href={city.pastReadings.url} className="-my-2 font-medium text-foreground underline">
          {city.pastReadings.label}
        </OutboundLink>
      </section>
    </div>
  )
}
