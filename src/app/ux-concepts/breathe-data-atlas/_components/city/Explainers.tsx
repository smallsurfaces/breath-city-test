/**
 * Explainers.tsx — the pollutant explainer at two levels, and the sensor-type explainer
 * (spec section 8, reworked in iteration 2, decisions E4, G and H).
 *
 * Purpose
 *   Two levels of pollutant explainer (confirmed by Jack, round 1):
 *   - FULL, the pollutant pop-up opened from a tile (PollutantExplainerFull, decision G), in order:
 *       1. Sensors measuring [pollutant]: the count and the sparkline, as on the tile (iteration 3,
 *          decision D1; was "Sites measuring it")
 *       2. What it is                     (WHO)
 *       3. What it does to the body       (WHO, no numbers)
 *       4. IBOCA                          all bands, each as its capsule with its items
 *                                         (AdviceLadder); the "IBOCA index" link sits behind the
 *                                         heading's "i" (iteration 3, decisions D2 and D3)
 *       5. Where it comes from in Bogotá  the inventory's categories, shares only where published
 *     "Why Bogotá measures it" is dropped. Each section's source link sits behind an "i" next to
 *     its heading (SourceInfo), not as a visible line.
 *   - SHORT, inline in the sensor detail (PollutantExplainerShort, decision E4): "What it is" and
 *     "What it does to the body" only.
 *   The "Draft content" tag is gone (decision K2).
 *
 * Sensor-type explainer (decision H)
 *   The two descriptions only: no "On the map it is a square/circle" lines, no grey/hollow footnote.
 *   Iteration 3 (decision B): headed with OpenAQ's names, "Reference grade" and "Low-cost sensor".
 *
 * Key exports: PollutantExplainerFull, PollutantExplainerShort, SensorTypeExplainer (named)
 * External dependencies: react (types), ./city-ui, ../chapter/CreditInfo, ../chapter/ChapterLink,
 *   ../../_data/*.
 */

import type { ReactNode } from 'react'
import { AdviceLadder, PassiveTubeIcon, SensorTypeIcon, Sparkline } from './city-ui'
import { CreditInfo } from '../chapter/CreditInfo'
import { SourcesChart } from './SourcesChart'
import { OutboundLink } from '../chapter/ChapterLink'
import type { CityLink, CityPage, GrowthSeries } from '../../_data/city-page'
import type { PollutantId } from '../../_data/city-sensors'
import { POLLUTANT_EXPLAINERS, WHO_GROUPS_LINE, WHO_SOURCE_LINKS } from '../../_data/pollutant-explainers'

/** Heading style for each step. */
const STEP_HEADING = 'text-sm font-semibold text-foreground'
/** Body text style. */
const BODY = 'mt-1 text-sm leading-relaxed text-foreground/85'

/** Props for StepHeading. */
type StepHeadingProps = {
  children: ReactNode
  /** The section's sources, behind an "i" beside the heading; empty for none. */
  sources: CityLink[]
  /** Accessible name for the "i". */
  sourcesLabel: string
  /** Lines shown above the links in the "i" (decision W: the exact published shares); empty for none. */
  notes: string[]
}

/** A step heading, with its sources behind an "i" (decision G). Sits inside a dialog. */
function StepHeading({ children, sources, sourcesLabel, notes }: StepHeadingProps) {
  return (
    <h4 className={`${STEP_HEADING} flex items-center gap-2`}>
      {children}
      {sources.length > 0 && (
        <CreditInfo label={sourcesLabel} align="start" className="" inDialog={true}>
          {notes.length > 0 && (
            <ul className="mb-2 space-y-0.5 text-xs text-foreground/80" data-exact-shares="">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
          <ul className="space-y-1">
            {sources.map((source) => (
              <li key={source.url}>
                <OutboundLink href={source.url} className="-my-3 text-sm font-medium text-foreground underline">
                  {source.label}
                </OutboundLink>
              </li>
            ))}
          </ul>
        </CreditInfo>
      )}
    </h4>
  )
}

/**
 * A pollutant's sources as CityLinks for the "i": WHO's two pages for the original six (labelled
 * "WHO: ..."), the content file's own sources for the rest (decision Y). Pure.
 */
function sourcesFor(sources: Array<{ label: string; url: string }>): CityLink[] {
  if (sources === WHO_SOURCE_LINKS) return WHO_SOURCE_LINKS.map((link) => ({ label: `WHO: ${link.label}`, url: link.url }))
  return sources.map((link) => ({ label: link.label, url: link.url }))
}

/** Props for the two WHO steps. */
type WhoStepsProps = {
  pollutant: PollutantId
}

/** "What it is". */
function WhatItIs({ pollutant }: WhoStepsProps) {
  const global = POLLUTANT_EXPLAINERS[pollutant]
  if (global === undefined) return null
  return (
    <section>
      <StepHeading sources={sourcesFor(global.sources)} sourcesLabel="Sources for what it is" notes={[]}>
        What it is
      </StepHeading>
      <p className={BODY}>
        {/* The name leads the text as the source gives it: "Benzene. A chemical…", or with a comma
            where the text continues the sentence ("Nitrogen monoxide, also called nitric oxide."). */}
        <span className="font-medium text-foreground">
          {global.name}
          {/^[a-z]/.test(global.whatItIs) ? ',' : '.'}
        </span>{' '}
        {global.whatItIs}
      </p>
    </section>
  )
}

/** "What it does to the body". */
function WhatItDoes({ pollutant }: WhoStepsProps) {
  const global = POLLUTANT_EXPLAINERS[pollutant]
  // Decision Y: only where WHO body text exists; never filled in.
  if (global === undefined || (global.body === null && global.shortTerm === null && global.longTerm === null)) return null
  const whoSix = global.body === null
  return (
    <section>
      <StepHeading sources={sourcesFor(global.sources)} sourcesLabel="Sources for what it does to the body" notes={[]}>
        What it does to the body
      </StepHeading>
      {global.shortTerm !== null && (
        <p className={BODY}>
          <span className="font-medium text-foreground">Short term: </span>
          {global.shortTerm}
        </p>
      )}
      {global.longTerm !== null && (
        <p className={BODY}>
          <span className="font-medium text-foreground">Long term: </span>
          {global.longTerm}
        </p>
      )}
      {global.body !== null && <p className={BODY}>{global.body}</p>}
      {/* The groups line is WHO's statement for air pollution as a whole: kept with the original six. */}
      {whoSix && <p className={BODY}>{WHO_GROUPS_LINE}</p>}
    </section>
  )
}

/** Props for PollutantExplainerShort. */
type PollutantExplainerShortProps = {
  pollutant: PollutantId
}

/** The short explainer, inline in the sensor detail (decision E4). Server-safe: no state. */
export function PollutantExplainerShort({ pollutant }: PollutantExplainerShortProps) {
  return (
    <div className="space-y-4">
      <WhatItIs pollutant={pollutant} />
      <WhatItDoes pollutant={pollutant} />
    </div>
  )
}

/** Props for PollutantExplainerFull. */
type PollutantExplainerFullProps = {
  city: CityPage
  pollutant: PollutantId
  /** Sensors measuring it today (the tile's count). */
  sites: number
  series: GrowthSeries | null
  /** Whether the city has a year of archive, so the sparkline shows (spec 6.2). */
  showSparkline: boolean
}

/** The full explainer, the pollutant pop-up (decision G). Server-safe: no state. */
export function PollutantExplainerFull({ city, pollutant, sites, series, showSparkline }: PollutantExplainerFullProps) {
  const local = city.pollutants[pollutant]
  return (
    <div className="space-y-6">
      {/* Round 3 decision I (addition): one plain sentence, no sparkline (a rising line read as the
          pollutant trending up). The count is the city's own sensors that report the pollutant. */}
      <p className="text-sm text-foreground" data-sensors-measuring="">
        {sites} {sites === 1 ? 'sensor' : 'sensors'} measuring {pollutant} in {city.name}
      </p>

      <WhatItIs pollutant={pollutant} />
      <WhatItDoes pollutant={pollutant} />

      {/* The city's advice ladder: only for a city with an index (none for Sofia and Milan). */}
      {city.index !== null && city.indexPollutants.includes(pollutant) && (
        <section>
          <StepHeading sources={city.indexLinks} sourcesLabel={`About ${city.index.name}`} notes={[]}>
            {city.index.name}
          </StepHeading>
          <div className="mt-2">
            <AdviceLadder city={city} index={city.index} />
          </div>
        </section>
      )}

      {/* Where it comes from: only where the city's own study covers the pollutant (rule 6). */}
      {local !== undefined && local.sources.length > 0 && (
        <section>
          <StepHeading
            sources={city.sourcesCredit === null ? [] : [city.sourcesCredit]}
            sourcesLabel={`Source for where it comes from in ${city.name}`}
            notes={local.sources.filter((line) => line.share !== null).map((line) => `${line.category}: ${line.share} (as published)`)}
          >
            {local.sourcesSubject === null ? 'Where it comes from' : `Where ${local.sourcesSubject} come from`} in {city.name}
          </StepHeading>
          {local.sourcesNote !== null && <p className={BODY}>{local.sourcesNote}</p>}
          {/* Decision W: a donut where every share is a single published figure, else icons only. */}
          <SourcesChart lines={local.sources} />
        </section>
      )}
    </div>
  )
}

/** A sensor kind the city has: a sensor type on its map, or its passive tubes (decision S). */
export type SensorKind = 'reference-grade' | 'low-cost' | 'passive-tubes'

/** Props for SensorTypeExplainer. */
type SensorTypeExplainerProps = {
  /** The kinds this city has, from the same data as its tiles (round 3 decision T). */
  kinds: SensorKind[]
}

/**
 * The sensor-type explainer's content (decision H). Round 3 decision T: only the kinds the city has,
 * in tile order. Server-safe: no state.
 */
export function SensorTypeExplainer({ kinds }: SensorTypeExplainerProps) {
  return (
    <div className="space-y-5">
      {kinds.includes('reference-grade') && (
      <section>
        <h4 className={`${STEP_HEADING} flex items-center gap-2`}>
          <SensorTypeIcon type="reference-grade" fill={null} />
          Reference grade
        </h4>
        <p className={BODY}>
          A monitoring station run to official methods, usually in a small cabin with its own instruments for each
          pollutant. These stations typically measure several pollutants, such as PM2.5, PM10, ozone, nitrogen
          dioxide, sulfur dioxide and carbon monoxide.
        </p>
      </section>
      )}
      {kinds.includes('low-cost') && (
      <section>
        <h4 className={`${STEP_HEADING} flex items-center gap-2`}>
          <SensorTypeIcon type="low-cost" fill={null} />
          Low-cost sensor
        </h4>
        <p className={BODY}>
          A small device that can be placed in many more locations, closer to where people live and move. Low-cost
          sensors typically measure particles (PM2.5, sometimes PM10).
        </p>
      </section>
      )}
      {kinds.includes('passive-tubes') && (
        <section data-explainer-kind="passive-tubes">
          <h4 className={`${STEP_HEADING} flex items-center gap-2`}>
            <PassiveTubeIcon />
            Passive NO₂ diffusion tubes
          </h4>
          <p className={BODY}>
            Small passive tubes that absorb nitrogen dioxide from the air over a few weeks, then are analysed in a
            laboratory. They give an average over the exposure period rather than a live reading, and are cheap
            enough to place at many sites.
          </p>
        </section>
      )}
    </div>
  )
}
