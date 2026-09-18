/**
 * ChapterKeyFacts.tsx — chapter section 3, key facts (fixed layout, brief 5.3).
 *
 * Purpose
 *   The city's key facts as tiles, in the brief's order:
 *   - Population: each city's OWN published figure for the area it administers, labelled
 *     "City population · city's own figure" and credited to the city's source (Jack, 2026-09-17).
 *     The area and date sit under it, then the pack's `basis` line, which is how a rounded or
 *     estimated figure says so in the publisher's own terms. The credit LINKS to the page the
 *     figure is published on (see PopulationCredit). The UN urban-area estimate is carried in the
 *     data but NOT rendered; it appears as the figure only where the pack labels it as one, for a
 *     city that publishes nothing we can confirm.
 *   - Sensors by type (tiers 2 to 4): a circle for low-cost, a square for reference-grade, with counts.
 *   - Lead agency.
 *   - Joined Breathe Cities.
 *   - Current conditions: tier 4 "[Index name]: [level]"; tier 3 "Live from N sensors · updated N min
 *     ago" with no number; nothing for tiers 1 and 2.
 *   - "Where in the world": the stylised country map, for the six data cities only (Milan has it as
 *     its hero instead).
 *
 * No gaps (brief 2, 5.3)
 *   A fact the city does not have is not rendered at all: no empty tile, no "not shared" message.
 *   The grid's column count is chosen from the number of facts present (factColumnsClass), so the
 *   tiles always fill their rows; current conditions spans the full row after the other facts.
 *   A sensor count of 0 is left out the same way. A fact the CONTENT PACK could not confirm arrives
 *   here as null and is left out identically (brief 2, added 2026-09-17: "placeholders are absent,
 *   never displayed") — Bogotá's population is the live case. Nothing is bracketed, greyed or
 *   labelled to stand in for it, and the grid re-columns so the absence leaves no hole.
 *
 * Honesty
 *   "Sample figure" marks the two facts this build DERIVES from the mock sensors — the sensor
 *   counts and the current conditions — and only those. They carry `DerivedStatus`, a vocabulary
 *   of one ('sample'), separate from the pack's `ContentStatus`, so the marker can never be
 *   reached by pack content. Pack content renders as real content or not at all.
 *   No colour: current conditions is text only, since a city's index colours belong to the data
 *   map and the sensor card (brief 2).
 *
 * Semantics
 *   A <dl>: each tile is a <div> holding its <dt> label and <dd> value. The map tile sits beside the
 *   list. Labels use foreground/70 rather than the muted steel tone, for contrast.
 *
 * Key exports: ChapterKeyFacts (named)
 * External dependencies: react (Fragment, ReactNode), @/components/concept (ConceptCard, ConceptSectionHeader),
 *   ./StylisedCountryMap, ./ChapterLink, ../../_data/cities (type), ../../_data/chapters (types),
 *   ../../_data/country-maps (COUNTRY_MAPS).
 */

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { ConceptCard, ConceptSectionHeader } from '@/components/concept'
import { OutboundLink } from './ChapterLink'
import { StylisedCountryMap } from './StylisedCountryMap'
import type { AtlasCity } from '../../_data/cities'
import type {
  ChapterCredit,
  ChapterSensorCounts,
  CityChapter,
  DerivedStatus,
  IndexConditions,
  LiveConditions,
} from '../../_data/chapters'
import { COUNTRY_MAPS } from '../../_data/country-maps'

/** Props for ChapterKeyFacts. */
type ChapterKeyFactsProps = {
  /** The chapter's city. */
  city: AtlasCity
  /** The chapter content. */
  chapter: CityChapter
}

/** Number formatting for figures (thousands separators). */
const FIGURE_FORMAT = new Intl.NumberFormat('en-GB')

/** Label style shared by every tile. */
const TILE_LABEL = 'text-sm font-medium text-foreground/70'

/**
 * Grid columns for `count` regular fact tiles, chosen so no row is left part-empty: 4 facts make a
 * 2 x 2 (or one row of 4 when there is no map tile beside them), 3 facts one row of 3, 2 facts a row
 * of 2. The full-width current conditions tile does not count.
 */
function factColumnsClass(count: number, hasMapTile: boolean): string {
  if (count === 4) return hasMapTile ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'
  if (count === 3) return 'md:grid-cols-3'
  if (count === 2) return 'sm:grid-cols-2'
  return ''
}

/**
 * "Sample figure" note, for a fact derived from the mock sensors (brief section 7). It takes
 * `DerivedStatus`, so only a derived fact can reach it: pack content is either real content or
 * absent, and can no longer be labelled instead of omitted (brief section 2).
 */
function SampleNote({ status }: { status: DerivedStatus }) {
  if (status !== 'sample') return null
  return <p className="mt-1 text-xs text-foreground/60">Sample figure</p>
}

/**
 * The population figure's credit, linked to the page the figure is published on.
 *
 * Unlinked where `url` is null: the pack may name the publication behind a figure without a public
 * page that carries it. A credit is never dropped, and a URL is never invented to make one
 * linkable. (A figure the pack could not confirm at all never reaches this component — the whole
 * tile is absent; see the header.)
 */
function PopulationCredit({ source }: { source: ChapterCredit }) {
  if (source.url === null) {
    return <p className="mt-2 text-xs font-medium leading-snug text-foreground/70">Source: {source.label}</p>
  }
  return (
    // leading-snug because the pack's `sourceName` is the publication in full, so several of these
    // credits wrap to three or four lines inside a tile.
    <OutboundLink href={source.url} className="-mb-3 text-xs font-medium leading-snug text-foreground/70">
      Source: {source.label}
    </OutboundLink>
  )
}

/** One fact tile: a ConceptCard holding a <dt> label and a <dd> value. */
function FactTile({ label, children, wide }: { label: string; children: ReactNode; wide: boolean }) {
  return (
    <ConceptCard className={wide ? 'col-span-full' : ''}>
      <dt className={TILE_LABEL}>{label}</dt>
      <dd className="mt-2">{children}</dd>
    </ConceptCard>
  )
}

/** Sensor counts by type: circle for low-cost, square for reference-grade (brief 5.3). Zero counts are left out. */
function SensorCounts({ sensors }: { sensors: ChapterSensorCounts }) {
  const rows = [
    { key: 'low-cost', count: sensors.lowCost, noun: 'low-cost sensors', shape: 'rounded-full' },
    { key: 'reference', count: sensors.referenceGrade, noun: 'reference-grade stations', shape: 'rounded-[2px]' },
  ].filter((row) => row.count > 0)
  return (
    <>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-baseline gap-3">
            <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 shrink-0 self-center bg-foreground ${row.shape}`} />
            <span className="text-2xl font-bold tabular-nums text-foreground">{FIGURE_FORMAT.format(row.count)}</span>
            <span className="text-sm text-foreground/80">{row.noun}</span>
          </li>
        ))}
      </ul>
      <SampleNote status={sensors.status} />
    </>
  )
}

/**
 * Current conditions text. Tier 4: the city's own index and its city-wide level, as the city
 * publishes the level name. Tier 3: the live line, with no reading and no level (brief 5.3).
 * Both are derived from the mock sensors, so both carry the sample marker.
 */
function ConditionsLine({ conditions }: { conditions: IndexConditions | LiveConditions }) {
  if ('indexName' in conditions) {
    return (
      <>
        <p className="text-2xl font-bold text-foreground">
          {conditions.indexName}: {conditions.level}
        </p>
        <SampleNote status={conditions.status} />
      </>
    )
  }
  return (
    <>
      <p className="text-lg font-semibold text-foreground">
        Live from {FIGURE_FORMAT.format(conditions.liveSensors)} sensors · updated {conditions.updatedMinutesAgo} min ago
      </p>
      <SampleNote status={conditions.status} />
    </>
  )
}

/** The key facts section. Server component. */
export function ChapterKeyFacts({ city, chapter }: ChapterKeyFactsProps) {
  const facts = chapter.keyFacts
  const hasMapTile = chapter.tier !== 1

  // The regular tiles present for this city, in the brief's order. Absent facts are simply not here.
  const tiles: Array<{ key: string; node: ReactNode }> = []
  if (facts.population !== null) {
    const population = facts.population
    tiles.push({
      key: 'population',
      node: (
        <FactTile label="Population" wide={false}>
          {/* The figure as the pack publishes it ("10.9 million"), not a re-derived number. */}
          <p className="text-3xl font-bold tracking-tight text-foreground">{population.display}</p>
          <p className="mt-1 text-sm text-foreground/80">{population.label}</p>
          {/* What the figure covers and when, so a city figure is never read as a metro one, and a
              census year is never read as today (brief 5.3). */}
          <p className="mt-1 text-xs leading-snug text-foreground/70">
            {population.covers} · {population.asAt}
          </p>
          {/* The pack's own `basis` line: it is what makes a rounded or estimated figure say so,
              in the publisher's terms, rather than the build classifying the figure itself. */}
          <p className="mt-1 text-xs leading-snug text-foreground/70">{population.basis}</p>
          {/* No "Sample figure" here: a population is pack content, so it is either the city's own
              confirmed figure or absent altogether (brief 2). The `basis` line above carries any
              hedge the publisher itself states. */}
          <PopulationCredit source={population.source} />
        </FactTile>
      ),
    })
  }
  if (facts.sensors !== null) {
    const sensors = facts.sensors
    tiles.push({
      key: 'sensors',
      node: (
        <FactTile label="Sensors" wide={false}>
          <SensorCounts sensors={sensors} />
        </FactTile>
      ),
    })
  }
  if (facts.leadAgency !== null) {
    const leadAgency = facts.leadAgency
    tiles.push({
      key: 'lead-agency',
      node: (
        <FactTile label="Lead agency" wide={false}>
          <p className="text-lg font-semibold leading-snug text-foreground">{leadAgency.name}</p>
        </FactTile>
      ),
    })
  }
  if (facts.joinedBC !== null) {
    const joined = facts.joinedBC
    tiles.push({
      key: 'joined',
      node: (
        <FactTile label="Joined Breathe Cities" wide={false}>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">{joined.year}</p>
        </FactTile>
      ),
    })
  }

  const factList = (
    <dl className={`grid grid-cols-1 gap-4 ${factColumnsClass(tiles.length, hasMapTile)}`}>
      {tiles.map((tile) => (
        <Fragment key={tile.key}>{tile.node}</Fragment>
      ))}
      {facts.currentConditions !== null && (
        <FactTile label="Current conditions" wide={true}>
          <ConditionsLine conditions={facts.currentConditions} />
        </FactTile>
      )}
    </dl>
  )

  return (
    <section aria-label="Key facts" className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading="Key facts" className="mb-6" />
      {hasMapTile ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {factList}
          <ConceptCard className="flex flex-col">
            <p className={TILE_LABEL}>Where in the world</p>
            <div className="flex flex-1 items-center justify-center pt-4">
              <StylisedCountryMap
                spec={COUNTRY_MAPS[chapter.slug]}
                countryName={city.country}
                cityName={city.name}
                cityLngLat={[city.lng, city.lat]}
                size="tile"
              />
            </div>
          </ConceptCard>
        </div>
      ) : (
        factList
      )}
    </section>
  )
}
