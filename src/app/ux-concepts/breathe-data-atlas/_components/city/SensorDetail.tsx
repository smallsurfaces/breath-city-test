/**
 * SensorDetail.tsx — the sensor detail's content (spec 5.6), shown in AtlasDialog.
 *
 * Purpose
 *   The expert layer: the only place raw numbers appear (rule 7). Contents, in order:
 *     - Freshness in words, and the station type where the city publishes one (feature 14).
 *     - "Readings available": each pollutant with its raw value, unit, averaging time and time of
 *       reading. The averaging time is shown as data and never next to a band (spec 5.6).
 *       Each row expands to the pollutant explainer inline (section 8), one row at a time.
 *     - FIRST, the helper block (spec 5.8): one plain line per pollutant above any raw number, in
 *       the chosen variant; it carries the station's level per pollutant, smaller than the readings.
 *     - Sensor type, the source line, and "Past readings and downloads on Bogotá's site".
 *   No history chart, no weather, no forecast, no limit or guideline lines.
 *
 * Card or dialog (spec 5.6, developer's call)
 *   Tried against the brief's test: a six-pollutant reference monitor's readings, levels, source
 *   and expandable explainers do not fit at 390px wide inside the map without scrolling past one
 *   screen, so the detail is a DIALOG (full-height sheet on a phone), as the spec's fallback says.
 *
 * Freshness
 *   Stale: the last reading is kept and labelled with its age; levels are grey, never band colour.
 *   Dead: no readings are listed (none in the last 24 hours); the age is stated.
 *
 * Key exports: SensorDetail (named)
 * External dependencies: react, lucide-react, ./city-ui, ./Explainers, ../chapter/ChapterLink,
 *   ../../_data/bogota (CityPage), ../../_data/city-sensors.
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AdviceBlock, SensorTypeIcon } from './city-ui'
import { PollutantHelperLine } from './PollutantHelper'
import type { HelperVariant } from './PollutantHelper'
import { PollutantExplainer } from './Explainers'
import { OutboundLink } from '../chapter/ChapterLink'
import type { CityPage } from '../../_data/bogota'
import { ageWords, freshnessOf, sensorTypeLabel } from '../../_data/city-sensors'
import type { CitySensor, PollutantId } from '../../_data/city-sensors'

/** Props for SensorDetail. */
type SensorDetailProps = {
  city: CityPage
  sensor: CitySensor
  /** How the helper block shows each pollutant (spec 5.8). */
  variant: HelperVariant
}

/** The sensor detail's content. */
export function SensorDetail({ city, sensor, variant }: SensorDetailProps) {
  const freshness = freshnessOf(sensor, city.updateCycleMinutes)
  // One pollutant explainer open at a time.
  const [openPollutant, setOpenPollutant] = useState<PollutantId | null>(null)
  // One helper chip's advice open at a time.
  const [openAdvice, setOpenAdvice] = useState<PollutantId | null>(null)
  const adviceReading = sensor.readings.find((reading) => reading.pollutant === openAdvice) ?? null

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-sm text-foreground/85">
        <p className="flex items-center gap-2">
          <SensorTypeIcon type={sensor.type} />
          {sensorTypeLabel(sensor.type)}
          {sensor.stationType !== null && <span className="text-foreground/70">· Station type: {sensor.stationType}</span>}
        </p>
        <p className={freshness === 'fresh' ? '' : 'font-medium text-foreground'}>
          {freshness === 'dead'
            ? `No reading for ${ageWords(sensor.updatedMinutesAgo).replace(' ago', '')}`
            : freshness === 'stale'
              ? `Last reading ${ageWords(sensor.updatedMinutesAgo)}`
              : `Updated ${ageWords(sensor.updatedMinutesAgo)}`}
        </p>
      </div>

      {/* The helper block (spec 5.8): one plain line per pollutant, above any raw number. It also
          carries the station's level per pollutant (spec 5.6's context line), so that separate
          list is not repeated below. */}
      {freshness !== 'dead' && (
        <section aria-label={`${city.index.name} level per pollutant`} className="rounded-xl bg-muted p-3">
          <ul className={variant === 'chips' ? 'flex flex-wrap gap-x-2 gap-y-3' : 'space-y-2'}>
            {sensor.readings.map((reading) => (
              <li key={reading.pollutant}>
                <PollutantHelperLine
                  city={city}
                  reading={reading}
                  stale={freshness === 'stale'}
                  variant={variant}
                  expanded={openAdvice === reading.pollutant}
                  onToggle={() => setOpenAdvice(openAdvice === reading.pollutant ? null : reading.pollutant)}
                />
              </li>
            ))}
          </ul>
          {adviceReading !== null && freshness === 'fresh' && (
            <div className="mt-3 border-t border-border pt-2">
              <p className="text-xs font-semibold text-foreground/70">What {city.name} advises</p>
              <AdviceBlock city={city} band={adviceReading.band} compact={true} />
            </div>
          )}
        </section>
      )}

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
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    <span className="sr-only">{open ? 'Hide' : 'Show'} what {reading.pollutant} is</span>
                  </button>
                  {open && (
                    <div id={panelId} className="pb-4 pt-1">
                      <PollutantExplainer city={city} pollutant={reading.pollutant} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="space-y-1 border-t border-border pt-4 text-sm text-foreground/80">
        <p>Source: {city.sensorSource[sensor.type]}</p>
        <OutboundLink href={city.pastReadings.url} className="-my-2 font-medium text-foreground underline">
          {city.pastReadings.label}
        </OutboundLink>
      </section>
    </div>
  )
}
