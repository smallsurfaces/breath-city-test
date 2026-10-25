/**
 * Explainers.tsx — the pollutant explainer at two levels, and the sensor-type explainer
 * (spec section 8, reworked in iteration 2, decisions E4, G and H).
 *
 * Purpose
 *   Two levels of pollutant explainer (confirmed by Jack, round 1):
 *   - FULL, the pollutant pop-up opened from a tile (PollutantExplainerFull, decision G), in order:
 *       1. Sites measuring it: the count and the sparkline, as on the tile
 *       2. What it is                     (WHO)
 *       3. What it does to the body       (WHO, no numbers)
 *       4. What Bogotá advises            all bands: "IBOCA index" once, then each band as
 *                                         swatch and label with its items (AdviceLadder)
 *       5. Where it comes from in Bogotá  the inventory's categories, shares only where published
 *     "Why Bogotá measures it" is dropped. Each section's source link sits behind an "i" next to
 *     its heading (SourceInfo), not as a visible line.
 *   - SHORT, inline in the sensor detail (PollutantExplainerShort, decision E4): "What it is" and
 *     "What it does to the body" only.
 *   The "Draft content" tag is gone (decision K2).
 *
 * Sensor-type explainer (decision H)
 *   The two descriptions only: no "On the map it is a square/circle" lines, no grey/hollow footnote.
 *
 * Key exports: PollutantExplainerFull, PollutantExplainerShort, SensorTypeExplainer (named)
 * External dependencies: react (types), ./city-ui, ../chapter/CreditInfo, ../chapter/ChapterLink,
 *   ../../_data/*.
 */

import type { ReactNode } from 'react'
import { AdviceLadder, SensorTypeIcon, Sparkline } from './city-ui'
import { CreditInfo } from '../chapter/CreditInfo'
import { OutboundLink } from '../chapter/ChapterLink'
import type { CityLink, CityPage, GrowthSeries } from '../../_data/bogota'
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
}

/** A step heading, with its sources behind an "i" (decision G). Sits inside a dialog. */
function StepHeading({ children, sources, sourcesLabel }: StepHeadingProps) {
  return (
    <h4 className={`${STEP_HEADING} flex items-center gap-2`}>
      {children}
      {sources.length > 0 && (
        <CreditInfo label={sourcesLabel} align="start" className="" inDialog={true}>
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

/** WHO's source links, as CityLinks. */
const WHO_SOURCES: CityLink[] = WHO_SOURCE_LINKS.map((link) => ({ label: `WHO: ${link.label}`, url: link.url }))

/** Props for the two WHO steps. */
type WhoStepsProps = {
  pollutant: PollutantId
}

/** "What it is". */
function WhatItIs({ pollutant }: WhoStepsProps) {
  const global = POLLUTANT_EXPLAINERS[pollutant]
  return (
    <section>
      <StepHeading sources={WHO_SOURCES} sourcesLabel="Sources for what it is">
        What it is
      </StepHeading>
      <p className={BODY}>
        <span className="font-medium text-foreground">{global.name}.</span> {global.whatItIs}
      </p>
    </section>
  )
}

/** "What it does to the body". */
function WhatItDoes({ pollutant }: WhoStepsProps) {
  const global = POLLUTANT_EXPLAINERS[pollutant]
  return (
    <section>
      <StepHeading sources={WHO_SOURCES} sourcesLabel="Sources for what it does to the body">
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
      <p className={BODY}>{WHO_GROUPS_LINE}</p>
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
  /** Sites measuring it today (the tile's count). */
  sites: number
  series: GrowthSeries
  /** Whether the city has a year of archive, so the sparkline shows (spec 6.2). */
  showSparkline: boolean
}

/** The full explainer, the pollutant pop-up (decision G). Server-safe: no state. */
export function PollutantExplainerFull({ city, pollutant, sites, series, showSparkline }: PollutantExplainerFullProps) {
  const local = city.pollutants[pollutant]
  return (
    <div className="space-y-6">
      <section aria-label={`Sites measuring ${pollutant}`}>
        <h4 className={STEP_HEADING}>Sites measuring it</h4>
        <div className="mt-1 flex items-end gap-5">
          <span className="text-3xl font-bold leading-none text-foreground">{sites}</span>
          {showSparkline && <Sparkline values={series.values} startYear={series.startYear} />}
        </div>
      </section>

      <WhatItIs pollutant={pollutant} />
      <WhatItDoes pollutant={pollutant} />

      <section>
        <h4 className={STEP_HEADING}>What {city.name} advises</h4>
        <div className="mt-1">
          <AdviceLadder city={city} />
        </div>
      </section>

      <section>
        <StepHeading sources={[city.sourcesCredit]} sourcesLabel={`Source for where it comes from in ${city.name}`}>
          Where it comes from in {city.name}
        </StepHeading>
        {local.sourcesNote !== null && <p className={BODY}>{local.sourcesNote}</p>}
        <ul className="mt-1 space-y-1">
          {local.sources.map((line) => (
            <li key={line.category} className="flex items-baseline justify-between gap-3 border-b border-border py-1 text-sm text-foreground/85">
              <span>{line.category}</span>
              {line.share !== null && <span className="tabular-nums text-foreground">{line.share}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** The sensor-type explainer's content (decision H). Server-safe: no state. */
export function SensorTypeExplainer() {
  return (
    <div className="space-y-5">
      <section>
        <h4 className={`${STEP_HEADING} flex items-center gap-2`}>
          <SensorTypeIcon type="reference-grade" fill={null} />
          Reference monitor
        </h4>
        <p className={BODY}>
          A monitoring station run to official methods, usually in a small cabin with its own instruments for each
          pollutant. Reference monitors typically measure several pollutants, such as PM2.5, PM10, ozone, nitrogen
          dioxide, sulfur dioxide and carbon monoxide.
        </p>
      </section>
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
    </div>
  )
}
