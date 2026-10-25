/**
 * CitySection.tsx — the city's air quality network section, and the separate "Breathe Cities in
 * [City]" section below it (spec section 6, reworked in iteration 2, decisions F, G, H and I).
 *
 * Purpose
 *   CitySection, "[City]'s air quality network" (decision F): two groups of tiles only.
 *     - "Sensors": one tile per sensor type, with a bare count ("16") and a sample sparkline whose
 *       start year sits as a small axis label under the line's left end. Opens the sensor-type
 *       pop-up (decision H).
 *     - "Sites measuring each pollutant": one tile per pollutant the city measures, bare count
 *       ("24") and sparkline. Opens the pollutant pop-up (decision G).
 *     The WHOLE tile is the click target, with a visible affordance: a hover and press state and a
 *     small arrow. No text links, no "Sample figure" pills (decision K2: the nav's notice is the
 *     one disclosure). A city with under one year of archive shows the count only (spec 6.2).
 *   BreatheCitiesSection, "Breathe Cities in [City]" (decision I): the blurb, the population with
 *   its "i", and "More on [City]'s programmes and policies on [Breathe Cities]".
 *   Counts are of the city's own sensors; nothing is ranked or compared (rule 3).
 *
 * Accessibility
 *   Each tile is a button (at least 56px tall) whose name says what it is and what it opens. The
 *   pop-up opens in AtlasDialog, which traps focus and returns it to the tile.
 *
 * Key exports: CitySection, BreatheCitiesSection (named)
 * External dependencies: react, lucide-react, @/components/concept, ./AtlasDialog, ./Explainers,
 *   ./city-ui, ../chapter/CreditInfo, ../chapter/ChapterLink, ../../_data/bogota,
 *   ../../_data/city-sensors, ../../_data/pollutant-explainers.
 */

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { ConceptSectionHeader } from '@/components/concept'
import { AtlasDialog } from './AtlasDialog'
import { PollutantExplainerFull, SensorTypeExplainer } from './Explainers'
import { SensorTypeIcon, Sparkline } from './city-ui'
import { CreditInfo } from '../chapter/CreditInfo'
import { OutboundLink } from '../chapter/ChapterLink'
import { hasYearOfArchive } from '../../_data/bogota'
import type { CityPage, GrowthSeries } from '../../_data/bogota'
import { POLLUTANT_ORDER, sensorTypeLabel } from '../../_data/city-sensors'
import type { PollutantId, SensorType } from '../../_data/city-sensors'
import { POLLUTANT_EXPLAINERS } from '../../_data/pollutant-explainers'

/** What the pop-up is showing. */
type OpenExplainer = { kind: 'sensor-type' } | { kind: 'pollutant'; pollutant: PollutantId } | null

/** Tile surface: the whole tile is the target, with hover, press and focus states. */
const TILE =
  'group relative flex min-h-14 w-full flex-col items-start gap-2 rounded-2xl border border-border bg-background p-4 pr-12 text-left shadow-sm transition-[border-color,background-color,transform] hover:border-foreground/40 hover:bg-muted active:scale-[0.99] active:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/** Props for one tile. */
type TileProps = {
  title: string
  icon: ReactNode
  count: number
  series: GrowthSeries
  showSparkline: boolean
  /** What the tile opens, for its accessible name. */
  opensLabel: string
  onOpen: () => void
}

/** One tile. */
function Tile({ title, icon, count, series, showSparkline, opensLabel, onOpen }: TileProps) {
  return (
    <button type="button" onClick={onOpen} className={TILE} aria-label={`${title}: ${count}. ${opensLabel}`}>
      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </span>
      <span className="text-2xl font-bold leading-none text-foreground">{count}</span>
      {showSparkline && <Sparkline values={series.values} startYear={series.startYear} />}
      {/* The affordance: a small arrow that moves on hover. */}
      <span
        aria-hidden="true"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground/70 transition-transform group-hover:translate-x-0.5 group-hover:border-foreground/40 group-hover:text-foreground"
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  )
}

/** Props for CitySection. */
type CitySectionProps = {
  city: CityPage
}

/** Sites measuring a pollutant: the number of the city's sensors that report it. Pure. */
function sitesMeasuring(city: CityPage, pollutant: PollutantId): number {
  return city.sensors.filter((sensor) => sensor.readings.some((reading) => reading.pollutant === pollutant)).length
}

/** The air quality network section. */
export function CitySection({ city }: CitySectionProps) {
  const [open, setOpen] = useState<OpenExplainer>(null)
  const sparklines = hasYearOfArchive(city)
  const types: SensorType[] = ['reference-grade', 'low-cost']
  const pollutants = POLLUTANT_ORDER.filter((pollutant) => sitesMeasuring(city, pollutant) > 0)

  const dialogTitle =
    open === null ? '' : open.kind === 'sensor-type' ? 'Sensor types' : `${open.pollutant}: ${POLLUTANT_EXPLAINERS[open.pollutant].name}`

  return (
    <section aria-label={`${city.name}'s air quality network`} className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading={`${city.name}'s air quality network`} className="mb-6" />

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-base font-semibold text-foreground">Sensors</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((type) => (
              <Tile
                key={type}
                title={sensorTypeLabel(type)}
                icon={<SensorTypeIcon type={type} fill={null} />}
                count={city.sensors.filter((sensor) => sensor.type === type).length}
                series={city.sensorTypeGrowth[type]}
                showSparkline={sparklines}
                opensLabel="Opens what this sensor type is"
                onOpen={() => setOpen({ kind: 'sensor-type' })}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-base font-semibold text-foreground">Sites measuring each pollutant</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pollutants.map((pollutant) => (
              <Tile
                key={pollutant}
                title={pollutant}
                icon={null}
                count={sitesMeasuring(city, pollutant)}
                series={city.pollutants[pollutant].sitesGrowth}
                showSparkline={sparklines}
                opensLabel={`Opens about ${pollutant}`}
                onOpen={() => setOpen({ kind: 'pollutant', pollutant })}
              />
            ))}
          </div>
        </div>
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
        {open !== null && open.kind === 'pollutant' && (
          <PollutantExplainerFull
            city={city}
            pollutant={open.pollutant}
            sites={sitesMeasuring(city, open.pollutant)}
            series={city.pollutants[open.pollutant].sitesGrowth}
            showSparkline={sparklines}
          />
        )}
      </AtlasDialog>
    </section>
  )
}

/** Props for BreatheCitiesSection. */
type BreatheCitiesSectionProps = {
  city: CityPage
}

/** "Breathe Cities in [City]" (decision I). Server-safe apart from the "i" (a client component). */
export function BreatheCitiesSection({ city }: BreatheCitiesSectionProps) {
  return (
    <section aria-label={`Breathe Cities in ${city.name}`} className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading={`Breathe Cities in ${city.name}`} className="mb-6" />
      <div className="max-w-3xl space-y-6">
        <p className="text-base leading-relaxed text-foreground/85">{city.bcIntro.text}</p>

        {city.placeFacts.length > 0 && (
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {city.placeFacts.map((fact) => (
              <div key={fact.label}>
                <dt className="flex items-center gap-2 text-sm text-foreground/70">
                  {fact.label}
                  <CreditInfo label={`${fact.label} source`} align="start" className="" inDialog={false}>
                    <OutboundLink href={fact.source.url} className="-my-3 text-sm font-medium text-foreground">
                      {fact.source.label}
                    </OutboundLink>
                  </CreditInfo>
                </dt>
                <dd className="text-xl font-bold text-foreground">
                  {fact.value}
                  {fact.year !== null && <span className="text-sm font-normal text-foreground/70"> ({fact.year})</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <p className="text-base text-foreground/85">
          {city.bcIntro.linkLead}{' '}
          <a
            href={city.bcIntro.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-14 items-center gap-1 rounded-lg align-middle font-semibold text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {city.bcIntro.link.label}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </p>
      </div>
    </section>
  )
}
