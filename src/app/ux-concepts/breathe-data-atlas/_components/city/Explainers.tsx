/**
 * Explainers.tsx — the pollutant explainer and the sensor-type explainer (spec section 8).
 *
 * Purpose
 *   ONE content component per explainer, shown in two places with the same content: inline in the
 *   sensor detail (a pollutant row expands to it) and in a dialog opened from the city section's
 *   tiles. Neither place adds or drops anything.
 *
 * Pollutant explainer, in the spec's order
 *   1. What it is                     WHO, plain words (../../_data/pollutant-explainers)
 *   2. Where it comes from in Bogotá  the city's own inventory categories, shares only where
 *                                     published, credited to the inventory
 *   3. What it does to the body       WHO, short and long term where stated, no numbers
 *   4. Why Bogotá measures it         one line, with a link to the city's index and its legal basis
 *   5. What Bogotá advises            every IBOCA level as label and colour, each with Bogotá's own
 *                                     advice (type R), and "IBOCA · Find out more". No breakpoints.
 *   Marked "Draft content": CAF has not confirmed WHO as the source.
 *
 * Sensor-type explainer
 *   What a reference monitor and a low-cost sensor are, what the square and circle on the map mean,
 *   and what each typically measures. Short, neutral, no accuracy figures.
 *
 * Key exports: PollutantExplainer, SensorTypeExplainer (named)
 * External dependencies: ./city-ui, ../chapter/ChapterLink, ../../_data/*.
 */

import { AdviceBlock, DraftTag, SensorTypeIcon } from './city-ui'
import { OutboundLink } from '../chapter/ChapterLink'
import { levelDisplayName } from '../../_data/indexes'
import type { CityPage } from '../../_data/bogota'
import type { PollutantId } from '../../_data/city-sensors'
import { POLLUTANT_EXPLAINERS, WHO_GROUPS_LINE, WHO_SOURCE_LINKS } from '../../_data/pollutant-explainers'

/** Heading style for each step. */
const STEP_HEADING = 'text-sm font-semibold text-foreground'
/** Body text style. */
const BODY = 'mt-1 text-sm leading-relaxed text-foreground/85'

/** Props for PollutantExplainer. */
type PollutantExplainerProps = {
  city: CityPage
  pollutant: PollutantId
}

/** The pollutant explainer's content. Server-safe: no state. */
export function PollutantExplainer({ city, pollutant }: PollutantExplainerProps) {
  const global = POLLUTANT_EXPLAINERS[pollutant]
  const local = city.pollutants[pollutant]
  return (
    <div className="space-y-5">
      <DraftTag>Draft content</DraftTag>

      <section>
        <h4 className={STEP_HEADING}>What it is</h4>
        <p className={BODY}>
          <span className="font-medium text-foreground">{global.name}.</span> {global.whatItIs}
        </p>
      </section>

      <section>
        <h4 className={STEP_HEADING}>Where it comes from in {city.name}</h4>
        {local.sourcesNote !== null && <p className={BODY}>{local.sourcesNote}</p>}
        <ul className="mt-1 space-y-1">
          {local.sources.map((line) => (
            <li key={line.category} className="flex items-baseline justify-between gap-3 border-b border-border py-1 text-sm text-foreground/85">
              <span>{line.category}</span>
              {line.share !== null && <span className="tabular-nums text-foreground">{line.share}</span>}
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-foreground/70">
          Source:{' '}
          <a href={city.sourcesCredit.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {city.sourcesCredit.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </section>

      <section>
        <h4 className={STEP_HEADING}>What it does to the body</h4>
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
        <p className="mt-1 text-xs text-foreground/70">
          Source: WHO.{' '}
          {WHO_SOURCE_LINKS.map((link, position) => (
            <span key={link.url}>
              {position > 0 && ' · '}
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </span>
          ))}
        </p>
      </section>

      <section>
        <h4 className={STEP_HEADING}>Why {city.name} measures it</h4>
        <p className={BODY}>{local.whyMeasured}</p>
        <OutboundLink href={city.standardLink.url} className="-my-2 text-sm font-medium text-foreground underline">
          {city.standardLink.label}
        </OutboundLink>
      </section>

      <section>
        <h4 className={STEP_HEADING}>What {city.name} advises</h4>
        <ol className="mt-2 space-y-4">
          {city.index.levels.map((level) => (
            <li key={level.order}>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span aria-hidden="true" className="inline-block h-3 w-5 shrink-0 rounded-[3px]" style={{ backgroundColor: level.hex }} />
                {city.index.name} · {levelDisplayName(level)}
              </p>
              <div className="mt-1">
                <AdviceBlock city={city} band={level.order} compact={false} />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

/** The sensor-type explainer's content. Server-safe: no state. */
export function SensorTypeExplainer() {
  return (
    <div className="space-y-5">
      <section>
        <h4 className={`${STEP_HEADING} flex items-center gap-2`}>
          <SensorTypeIcon type="reference-grade" />
          Reference monitor
        </h4>
        <p className={BODY}>
          A monitoring station run to official methods, usually in a small cabin with its own instruments for each
          pollutant. Reference monitors typically measure several pollutants, such as PM2.5, PM10, ozone, nitrogen
          dioxide, sulfur dioxide and carbon monoxide. On the map it is a square.
        </p>
      </section>
      <section>
        <h4 className={`${STEP_HEADING} flex items-center gap-2`}>
          <SensorTypeIcon type="low-cost" />
          Low-cost sensor
        </h4>
        <p className={BODY}>
          A small device that can be placed in many more locations, closer to where people live and move. Low-cost
          sensors typically measure particles (PM2.5, sometimes PM10). On the map it is a circle.
        </p>
      </section>
      <p className="text-xs text-foreground/70">
        Grey on the map means the last reading is older than the city&apos;s update cycle. A hollow shape means no
        reading for more than a day.
      </p>
    </div>
  )
}
