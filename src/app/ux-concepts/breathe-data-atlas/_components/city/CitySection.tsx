/**
 * CitySection.tsx — the city's air quality network section, and the separate "Breathe Cities in
 * [City]" section below it (spec section 6, reworked in iteration 2, decisions F, G, H and I).
 *
 * Purpose
 *   CitySection, "[City]'s air quality network" (decision F): two groups of tiles only.
 *     - "Sensor types" (iteration 3, decision E1): one tile per sensor type, number first (a bare
 *       count, "16", leads) and a sample sparkline across the tile's full width whose start year
 *       sits under the line's left end. Two columns across the full content width at every size
 *       (E2). Opens the sensor-type pop-up (decision H).
 *     - "Pollutants monitored (number of sensors)" (E1): one tile per pollutant the city measures,
 *       the pollutant name leading ("PM2.5" larger than "24", E5), and the sparkline. Two columns
 *       on a phone, four from tablet (768px) up (E3). Opens the pollutant pop-up (decision G).
 *     The counts are the map's markers (16 reference grade plus 8 low-cost; all 24 measure PM2.5).
 *     The WHOLE tile is the click target, with a visible affordance: a hover and press state and a
 *     small arrow. No text links, no "Sample figure" pills (decision K2: the nav's notice is the
 *     one disclosure). A city with under one year of archive shows the count only (spec 6.2).
 *   BreatheCitiesSection, "Breathe Cities in [City]" (decision I; iteration 3, decision F): the
 *   population ("8.0 million (2022)") with NO "i", then the blurb, then "More on [City]'s programmes
 *   and policies on [Breathe Cities]". The real build needs the population source back (DANE); the
 *   provenance stays in the data file.
 *   Counts are of the city's own sensors; nothing is ranked or compared (rule 3).
 *
 * Iteration 4 (round 3 decision F)
 *   Both tile kinds share one layout: title top left (a sensor type with its icon, or the pollutant
 *   name, bold), the count in the bottom-right corner, larger than the title and aligned with the
 *   sparkline's end, the sparkline from the left edge to just before it, the start year under its
 *   left end. Sensor-type counts are bold (number-led); pollutant counts are light.
 *
 * Accessibility
 *   Each tile is a button (at least 56px tall) whose name says what it is and what it opens. The
 *   pop-up opens in AtlasDialog, which traps focus and returns it to the tile.
 *
 * Key exports: CitySection, BreatheCitiesSection (named)
 * External dependencies: react, lucide-react, @/components/concept, ./AtlasDialog, ./Explainers,
 *   ./city-ui, ../../_data/bogota,
 *   ../../_data/city-sensors, ../../_data/pollutant-explainers.
 */

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { ConceptSectionHeader } from '@/components/concept'
import { AtlasDialog } from './AtlasDialog'
import { PollutantExplainerFull, SensorTypeExplainer } from './Explainers'
import type { SensorKind } from './Explainers'
import { PassiveTubeIcon, SensorTypeIcon, Sparkline } from './city-ui'
import { hasYearOfArchive } from '../../_data/city-page'
import type { CityPage, GrowthSeries, LargestSource } from '../../_data/city-page'
import { SourceIcon } from './SourceIcon'
import { POLLUTANT_NAMES, sensorTypeLabel } from '../../_data/city-sensors'
import type { PollutantId, SensorType } from '../../_data/city-sensors'

/** What the pop-up is showing. */
type OpenExplainer = { kind: 'sensor-type' } | { kind: 'pollutant'; pollutant: PollutantId } | null

/** Tile surface: the whole tile is the target, with hover, press and focus states. */
const TILE =
  'group relative flex min-h-14 w-full min-w-0 flex-col items-stretch gap-2 rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition-[border-color,background-color,transform] hover:border-foreground/40 hover:bg-muted active:scale-[0.99] active:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/**
 * Which figure leads a tile (iteration 4, decision F, replacing iteration 3's E5): 'count' for a
 * sensor-type tile (bold count, number-led), 'title' for a pollutant tile (bold name, light count).
 * Both put the count bottom right, larger than the title.
 */
type TileLead = 'count' | 'title'

/** Props for one tile. */
type TileProps = {
  title: string
  icon: ReactNode
  count: number
  lead: TileLead
  /** Null when the city has no sample series for it (then the count stands alone). */
  series: GrowthSeries | null
  showSparkline: boolean
  /** What the tile opens, for its accessible name. */
  opensLabel: string
  onOpen: () => void
}

/**
 * One tile (iteration 4, decision F). Top left: the title (a sensor type with its icon, or the
 * pollutant name, bold). Bottom: the sparkline from the left edge to just before the count, the
 * count in the bottom-right corner aligned with the line's end, the start year under the line's left
 * end. The count is larger than the title on both kinds; a sensor-type tile keeps it BOLD
 * (number-led), a pollutant tile sets it LIGHT. Without a year of archive the count sits alone,
 * bottom right (spec 6.2). Labels may wrap (E6).
 */
function Tile({ title, icon, count, lead, series, showSparkline, opensLabel, onOpen }: TileProps) {
  const countNode = (
    <span
      data-tile-count=""
      className={`shrink-0 text-3xl leading-none tabular-nums text-foreground ${lead === 'count' ? 'font-bold' : 'font-light'}`}
    >
      {count}
    </span>
  )
  return (
    <button type="button" onClick={onOpen} className={TILE} aria-label={`${title}: ${count}. ${opensLabel}`} data-tile-lead={lead}>
      {lead === 'count' ? (
        <span className="flex items-start gap-2 pr-9 text-sm font-semibold leading-snug text-foreground">
          <span className="mt-1 flex">{icon}</span>
          <span className="min-w-0 break-words">{title}</span>
        </span>
      ) : (
        <span className="min-w-0 break-words pr-9 text-lg font-bold leading-tight text-foreground">{title}</span>
      )}
      <span className="mt-auto block w-full pt-1">
        {showSparkline && series !== null ? (
          <Sparkline values={series.values} startYear={series.startYear} end={countNode} />
        ) : (
          <span className="flex justify-end">{countNode}</span>
        )}
      </span>
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

/** Props for PollutantTile. */
type PollutantTileProps = {
  pollutant: PollutantId
  /** The pollutant's largest source in the city (decision J), or null: notation only. */
  source: LargestSource | null
  onOpen: () => void
}

/**
 * One pollutant tile (round 3 decisions I and J): the pollutant's notation and its arrow, and, where
 * the city's own source study names a largest source, that source's icon with a small label under
 * it. No count and no sparkline (decision I: a rising line read as the pollutant trending up).
 */
function PollutantTile({ pollutant, source, onOpen }: PollutantTileProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={TILE}
      aria-label={`${pollutant}${source === null ? '' : `, largest source: ${source.label}`}. Opens about ${pollutant}`}
      data-pollutant-tile={pollutant}
    >
      <span className="min-w-0 break-words pr-9 text-lg font-bold leading-tight text-foreground">{pollutant}</span>
      {source !== null && (
        <span className="mt-auto flex flex-col items-start gap-1 pt-1 text-foreground/75" data-largest-source={source.icon}>
          <SourceIcon icon={source.icon} className="h-6 w-6" />
          <span className="text-xs leading-tight">{source.label}</span>
        </span>
      )}
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
  // Only the sensor types the city has (Brussels and Milan: reference grade only).
  const types: SensorType[] = (['reference-grade', 'low-cost'] as SensorType[]).filter((type) =>
    city.sensors.some((sensor) => sensor.type === type),
  )
  // Round 3 decision T: the pop-up lists exactly the kinds the tiles show (S adds passive tubes).
  const kinds: SensorKind[] = [...types, ...(city.passiveTubes === null ? [] : (['passive-tubes'] as SensorKind[]))]
  // Decision X: exactly the city's published list (the build checks each has a reporting station).
  const pollutants = city.publishedPollutants

  const dialogTitle =
    open === null ? '' : open.kind === 'sensor-type' ? 'Sensor types' : `${open.pollutant}: ${POLLUTANT_NAMES[open.pollutant]}`

  return (
    <section aria-label={`${city.name}'s air quality network`} className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading={`${city.name}'s air quality network`} className="mb-6" />

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-base font-semibold text-foreground">Sensor types</h3>
          {/* Two columns across the full content width at every size (decision E2). */}
          <div className="grid grid-cols-2 gap-3" data-tile-grid="sensor-types">
            {types.map((type) => (
              <Tile
                key={type}
                title={sensorTypeLabel(type)}
                icon={<SensorTypeIcon type={type} fill={null} />}
                count={city.sensors.filter((sensor) => sensor.type === type).length}
                lead="count"
                series={city.sensorTypeGrowth[type] ?? null}
                showSparkline={sparklines}
                opensLabel="Opens what this sensor type is"
                onOpen={() => setOpen({ kind: 'sensor-type' })}
              />
            ))}
            {/* Round 3 decision S: the city's passive tubes, count only (no sparkline: no per-site
                dates), never on the map. */}
            {city.passiveTubes !== null && (
              <Tile
                title="Passive NO₂ diffusion tubes"
                icon={<PassiveTubeIcon />}
                count={city.passiveTubes.count}
                lead="count"
                series={null}
                showSparkline={false}
                opensLabel="Opens what this sensor type is"
                onOpen={() => setOpen({ kind: 'sensor-type' })}
              />
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-base font-semibold text-foreground">Pollutants monitored</h3>
          {/* Two columns on a phone, four from tablet up (decision E3). Decision I: name and arrow
              only, plus the largest-source icon where the city's study names one (decision J). */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-tile-grid="pollutants">
            {pollutants.map((pollutant) => (
              <PollutantTile
                key={pollutant}
                pollutant={pollutant}
                source={city.pollutants[pollutant]?.largestSource ?? null}
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
        {open !== null && open.kind === 'sensor-type' && <SensorTypeExplainer kinds={kinds} />}
        {open !== null && open.kind === 'pollutant' && (
          <PollutantExplainerFull
            city={city}
            pollutant={open.pollutant}
            sites={sitesMeasuring(city, open.pollutant)}
            series={null}
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

/** "Breathe Cities in [City]" (decision I; order reworked in iteration 3, decision F). Server-safe. */
export function BreatheCitiesSection({ city }: BreatheCitiesSectionProps) {
  return (
    <section aria-label={`Breathe Cities in ${city.name}`} className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading={`Breathe Cities in ${city.name}`} className="mb-6" />
      {/* Round 3 decision Q: the section runs the full content width. */}
      <div className="space-y-6">
        {/* Iteration 3 (decision F): population first, with no "i", then the blurb, then the link. */}
        {city.placeFacts.length > 0 && (
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {city.placeFacts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm text-foreground/70">{fact.label}</dt>
                <dd className="text-xl font-bold text-foreground">
                  {/* Round 3 decision P: the value only; the year stays in the data's provenance. */}
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <p className="text-base leading-relaxed text-foreground/85">{city.bcIntro.text}</p>

        {city.bcIntro.link !== null && (
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
        )}
      </div>
    </section>
  )
}
