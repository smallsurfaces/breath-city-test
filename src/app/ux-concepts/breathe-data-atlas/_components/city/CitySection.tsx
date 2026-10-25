/**
 * CitySection.tsx — the city section: the air quality network and the Breathe Cities intro,
 * together (spec section 6).
 *
 * Purpose
 *   6.1 Area and population: two plain facts with an "i" credit, ONLY when the city's data carries
 *       them with a source and year. Bogotá's named source publishes neither, so none render (rule 6).
 *   6.2 Sensor-type tiles: one per type, today's count (derived from the mock sensor file, so
 *       "Sample figure") and a sample sparkline with its start year. Each opens the sensor-type
 *       explainer. A city with under one year of archive shows the count only (hasYearOfArchive).
 *   6.3 Pollutant tiles: one per pollutant the city measures, the number of sites measuring it and a
 *       sample sparkline. Each opens the pollutant explainer.
 *   6.4 The Breathe Cities intro: one short sample blurb inside this section, leading to the city's
 *       Breathe Cities profile. No separate credit line.
 *   Counts are of the city's own sensors; nothing is ranked or compared (rule 3).
 *
 * Accessibility
 *   Each tile is a button (at least 56px tall) whose name says what it opens. The explainer opens
 *   in AtlasDialog, which traps focus and returns it to the tile.
 *
 * Key exports: CitySection (named)
 * External dependencies: react, lucide-react, ./AtlasDialog, ./Explainers, ./city-ui,
 *   ../chapter/CreditInfo, ../chapter/ChapterLink, ../../_data/bogota, ../../_data/city-sensors,
 *   ../../_data/pollutant-explainers.
 */

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ConceptSectionHeader } from '@/components/concept'
import { AtlasDialog } from './AtlasDialog'
import { PollutantExplainer, SensorTypeExplainer } from './Explainers'
import { SampleTag, SensorTypeIcon, Sparkline } from './city-ui'
import { CreditInfo } from '../chapter/CreditInfo'
import { OutboundLink } from '../chapter/ChapterLink'
import { hasYearOfArchive } from '../../_data/bogota'
import type { CityPage, GrowthSeries } from '../../_data/bogota'
import { POLLUTANT_ORDER, sensorTypeLabel } from '../../_data/city-sensors'
import type { PollutantId, SensorType } from '../../_data/city-sensors'
import { POLLUTANT_EXPLAINERS } from '../../_data/pollutant-explainers'

/** What the explainer dialog is showing. */
type OpenExplainer = { kind: 'sensor-type' } | { kind: 'pollutant'; pollutant: PollutantId } | null

/** Tile surface classes. */
const TILE =
  'flex min-h-14 w-full flex-col items-start gap-2 rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition-colors hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/** Props for one tile. */
type TileProps = {
  title: string
  icon: ReactNode
  /** The count line, e.g. "16 sensors". */
  countLine: string
  series: GrowthSeries
  showSparkline: boolean
  /** What the tile opens, for its accessible name. */
  opensLabel: string
  onOpen: () => void
}

/** One tile. */
function Tile({ title, icon, countLine, series, showSparkline, opensLabel, onOpen }: TileProps) {
  return (
    <button type="button" onClick={onOpen} className={TILE} aria-label={`${title}: ${countLine}. ${opensLabel}`}>
      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </span>
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-2xl font-bold leading-none text-foreground">{countLine}</span>
        <SampleTag />
      </span>
      {showSparkline && <Sparkline values={series.values} startYear={series.startYear} />}
      <span className="mt-auto text-xs font-medium text-foreground/70 underline underline-offset-4">{opensLabel}</span>
    </button>
  )
}

/** Props for CitySection. */
type CitySectionProps = {
  city: CityPage
}

/** The city section. */
export function CitySection({ city }: CitySectionProps) {
  const [open, setOpen] = useState<OpenExplainer>(null)
  const sparklines = hasYearOfArchive(city)
  const types: SensorType[] = ['reference-grade', 'low-cost']
  const pollutants = POLLUTANT_ORDER.filter((pollutant) =>
    city.sensors.some((sensor) => sensor.readings.some((reading) => reading.pollutant === pollutant)),
  )

  const dialogTitle =
    open === null ? '' : open.kind === 'sensor-type' ? 'Sensor types' : `${open.pollutant}: ${POLLUTANT_EXPLAINERS[open.pollutant].name}`

  return (
    <section aria-label={`${city.name}'s air quality network`} className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading={`${city.name}'s air quality network`} className="mb-6" />

      {city.placeFacts.length > 0 && (
        <dl className="mb-8 flex flex-wrap gap-x-10 gap-y-4">
          {city.placeFacts.map((fact) => (
            <div key={fact.label}>
              <dt className="flex items-center gap-2 text-sm text-foreground/70">
                {fact.label}
                <CreditInfo label={`${fact.label} source`} align="start" className="">
                  <OutboundLink href={fact.source.url} className="-my-3 text-sm font-medium text-foreground">
                    {fact.source.label}
                  </OutboundLink>
                </CreditInfo>
              </dt>
              <dd className="text-xl font-bold text-foreground">
                {fact.value} <span className="text-sm font-normal text-foreground/70">({fact.year})</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-base font-semibold text-foreground">Sensors</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {types.map((type) => {
                const count = city.sensors.filter((sensor) => sensor.type === type).length
                return (
                  <Tile
                    key={type}
                    title={sensorTypeLabel(type)}
                    icon={<SensorTypeIcon type={type} />}
                    countLine={`${count} ${count === 1 ? 'sensor' : 'sensors'}`}
                    series={city.sensorTypeGrowth[type]}
                    showSparkline={sparklines}
                    opensLabel="What this sensor type is"
                    onOpen={() => setOpen({ kind: 'sensor-type' })}
                  />
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-semibold text-foreground">Pollutants measured</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {pollutants.map((pollutant) => {
                const sites = city.sensors.filter((sensor) => sensor.readings.some((reading) => reading.pollutant === pollutant)).length
                return (
                  <Tile
                    key={pollutant}
                    title={pollutant}
                    icon={null}
                    countLine={`${sites} ${sites === 1 ? 'site' : 'sites'}`}
                    series={city.pollutants[pollutant].sitesGrowth}
                    showSparkline={sparklines}
                    opensLabel={`About ${pollutant}`}
                    onOpen={() => setOpen({ kind: 'pollutant', pollutant })}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* The Breathe Cities intro (spec 6.4): inside the section, beside the tiles from `lg`. */}
        <aside className="self-start rounded-2xl bg-muted p-5">
          <h3 className="text-base font-semibold text-foreground">Breathe Cities in {city.name}</h3>
          <p className="mt-2 text-base leading-relaxed text-foreground/85">{city.bcIntro.text}</p>
          <a
            href={city.bcIntro.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex min-h-14 items-center gap-1.5 rounded-lg text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {city.bcIntro.link.label}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </aside>
      </div>

      <AtlasDialog
        open={open !== null}
        onOpenChange={(next) => {
          if (!next) setOpen(null)
        }}
        eyebrow={open !== null && open.kind === 'pollutant' ? 'Pollutant' : ''}
        title={dialogTitle}
      >
        {open !== null && open.kind === 'sensor-type' && <SensorTypeExplainer />}
        {open !== null && open.kind === 'pollutant' && <PollutantExplainer city={city} pollutant={open.pollutant} />}
      </AtlasDialog>
    </section>
  )
}
