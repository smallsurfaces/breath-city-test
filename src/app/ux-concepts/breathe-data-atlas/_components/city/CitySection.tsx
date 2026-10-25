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
 *   pop-up opens in AtlasDialog, which traps focus and returns it to the tile. A pollutant tile's
 *   source icon is its own sibling button, named with the city's category, with a tooltip.
 *
 * Key exports: CitySection, BreatheCitiesSection (named)
 * External dependencies: react, lucide-react, @/components/concept, ./AtlasDialog, ./Explainers,
 *   ./city-ui, ../../_data/bogota,
 *   ../../_data/city-sensors, ../../_data/pollutant-explainers.
 */

'use client'

import { useEffect, useRef, useState } from 'react'
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
        {showSparkline && series !== null && grew(series) ? (
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

/**
 * True when the network grew over the series (Jack, round 3): today's count is higher than the
 * series' first value. Flat or falling series get no sparkline and no start year: the sparkline
 * tells a growth story, so it only shows one. Pure.
 */
function grew(series: GrowthSeries): boolean {
  return series.values.length > 1 && series.values[series.values.length - 1] > series.values[0]
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
 * the city's own source study names a largest source, that source's ICON ONLY (round 3, Jack: the
 * text label under it is gone). The city's category wording stays as the icon's accessible name and
 * as a hover / focus / tap tooltip, and in the tile's own name. No count and no sparkline (decision
 * I: a rising line read as the pollutant trending up).
 *
 * Structure: the tile is a box holding two SIBLING buttons, never one nested in the other. The main
 * button's ::after covers the whole tile, so the whole tile still opens the pop-up; the source icon
 * button sits above it and only toggles its tooltip.
 */
function PollutantTile({ pollutant, source, onOpen }: PollutantTileProps) {
  return (
    <div className={TILE} data-pollutant-tile={pollutant}>
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 break-words pr-9 text-left text-lg font-bold leading-tight text-foreground outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-foreground"
        aria-label={`${pollutant}${source === null ? '' : `, largest source: ${source.label}`}. Opens about ${pollutant}`}
      >
        {pollutant}
      </button>
      {source !== null && <SourceTooltipIcon source={source} />}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground/70 transition-transform group-hover:translate-x-0.5 group-hover:border-foreground/40 group-hover:text-foreground"
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </div>
  )
}

/** Props for SourceTooltipIcon. */
type SourceTooltipIconProps = {
  source: LargestSource
}

/**
 * The largest-source icon on a pollutant tile, with the city's category wording as its accessible
 * name and as a tooltip on hover, keyboard focus or tap (the BandScale tooltip pattern). Side
 * effect: while open by tap, a tap elsewhere or Escape closes it.
 */
function SourceTooltipIcon({ source }: SourceTooltipIconProps) {
  const [tapped, setTapped] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!tapped) return
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (root !== null && event.target instanceof Node && root.contains(event.target)) return
      setTapped(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTapped(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [tapped])
  return (
    <span ref={rootRef} className="relative z-10 mt-auto self-start pt-1" data-largest-source={source.icon}>
      <button
        type="button"
        aria-label={source.label}
        onClick={() => setTapped((open) => !open)}
        className="group/source relative -m-1 flex cursor-default rounded-md p-1 text-foreground/75 before:absolute before:-inset-2 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <SourceIcon icon={source.icon} className="h-6 w-6" />
        <span
          role="tooltip"
          data-source-tooltip=""
          className={`pointer-events-none absolute left-full top-1/2 z-20 ml-2 w-max max-w-[9rem] -translate-y-1/2 rounded-md bg-foreground px-2 py-1 text-left text-xs font-semibold leading-tight text-background shadow-md group-hover/source:block group-focus-visible/source:block ${
            tapped ? 'block' : 'hidden'
          }`}
        >
          {source.label}
        </span>
      </button>
    </span>
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
    open === null ? '' : open.kind === 'sensor-type' ? 'Sensor types' : POLLUTANT_NAMES[open.pollutant] === open.pollutant ? open.pollutant : `${open.pollutant}: ${POLLUTANT_NAMES[open.pollutant]}`

  return (
    <section aria-label={`${city.name}'s air quality network`} className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading={`${city.name}'s air quality network`} className="mb-6" />

      <div className="space-y-8">
        <div>
          <h3 className="mb-3 text-base font-semibold text-foreground">Sensor types</h3>
          {/* Two columns across the full content width at every size (decision E2). */}
          <div className="grid auto-rows-fr grid-cols-2 gap-3" data-tile-grid="sensor-types">
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
          {/* Every row the same height, also a row with no source icon (auto-rows-fr). */}
          <div className="grid auto-rows-fr grid-cols-2 gap-3 md:grid-cols-4" data-tile-grid="pollutants">
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
