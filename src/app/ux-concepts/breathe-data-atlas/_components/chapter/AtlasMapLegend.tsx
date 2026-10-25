/**
 * ITERATION 4 (round 3 decision A1)
 *   The phone layout matches desktop: the bar with each level's English name in plain text,
 *   centred under its own segment, at every width. The phone's capsule row is gone. Long names wrap
 *   inside their column ("Hazardous" fits under its fifth of a 390px bar on one line).
 *
 * ITERATION 3 (round 2 feedback, decisions A1, A2 and B)
 *   - Sensor types use OpenAQ's names via sensorTypeLabel: "Reference grade", "Low-cost sensor".
 *   - Level names are English only ("Low", not "Bajo (Low)"). On a phone the names list as band
 *     capsules (the one capsule style), replacing the swatch-plus-name rows; from `sm` the plain
 *     name sits under its segment. The bar itself stays a key, without a marker or tooltips: every
 *     level is named in words beside it.
 *
 * ITERATION 2 (round 1 feedback, decisions B2 and B3)
 *   - ONE "i" for the index, above the colour bands, beside the index name. It holds the method
 *     line ("Bogotá rates air quality at each monitoring station with IBOCA."), the publisher text
 *     and the "IBOCA index" link. The page header no longer carries a method line or its own "i".
 *   - The visible line "Colour shows each station's IBOCA level." stays as the one visible
 *     explanation of the map's colour.
 *   - The marker key lists sensor types only (low-cost sensor, reference monitor). The grey and
 *     hollow entries are gone: a stale or dead sensor explains itself when tapped (B4).
 *
 * AtlasMapLegend.tsx — the city map's legend. Copied from breathe-atlas on 2026-10-25 (the original
 * is never edited). Breathe Data Atlas changes (spec 5.3, 5.5): the index is always present (a city
 * page needs its index); one line names the colour's job ("Colour shows each station's IBOCA
 * level."); the key adds the stale (grey) and dead (hollow) marker states when the city's sensors
 * include them. Still KEY ONLY: no current-level marker, no breakpoint numbers.
 *
 * Original header follows.
 *
 * AtlasMapLegend.tsx — the data map's legend (brief 6.1).
 *
 * Purpose
 *   "Legend: sensor types. Tier 4 adds the index name and its levels." Sensor shape always: a
 *   circle for low-cost, a square for reference-grade. For a city that shares its own index, the
 *   index follows as a segmented bar in that city's own colours and wording.
 *
 *   The legend sits UNDER the map rather than over it, so it never covers a sensor and never has to
 *   be dismissed on a phone. It is the only place a chapter explains a colour, and the only colour
 *   it shows is the city's own.
 *
 * The index bar (Jack, brief 6.1, 2026-09-17)
 *   The index legend is a SEGMENTED COLOURED BAR, in the style of a published air quality index
 *   scale, not the list of coloured dots it was before. Segments run best to worst, left to right,
 *   in the city's own published colours; the index name sits above the bar so the scale reads as the
 *   city's; each level's name sits beneath its segment in the city's own wording with the English in
 *   brackets (levelDisplayName). The four indexes disagree with each other by design — five levels
 *   in Bogotá, Johannesburg and Sofia, six in Warsaw — and the bar just takes however many there are.
 *
 *   KEY ONLY: the bar does NOT mark where the city currently sits. Adding a current-level marker to
 *   the bar is pending Jack's word.
 *
 *   The publisher line is deliberate: for Johannesburg the index is the national one, because the
 *   city publishes none of its own, and the legend should not imply otherwise. Since round 2 (item 9,
 *   2026-09-22) it is no longer a visible text line beside the index name: it sits behind the "i"
 *   next to the name (CreditInfo, labelled "Index source"), like every other source in a chapter,
 *   and is kept word for word.
 *
 * How the two layouts work, and why the names are not duplicated
 *   The bar is one element. The level names are ONE list, laid out two ways:
 *   - From `sm`, the names row distributes the same width into the same number of equal columns as
 *     the bar (`flex-1` in both), so each name lines up beneath its own segment without any
 *     measuring, at any level count.
 *   - Below `sm` the names become a plain list under the bar, each with a small swatch tying it to
 *     its colour, RATHER THAN SHRINKING to fit beneath the segments (brief 6.1). The swatch is the
 *     only thing that is breakpoint-specific, and it is decorative.
 *   A long name simply wraps inside its column; nothing is scaled down to make it fit.
 *
 * TOKEN EXCEPTION (named, inherited)
 *   The hex values come from ../../_data/indexes, where they are documented as DATA rather than
 *   design: each is a city's own published index colour and cannot be a BC token. Nothing else here
 *   carries colour.
 *
 * Key exports: AtlasMapLegend (named)
 * External dependencies: ./CreditInfo, ./ChapterLink, ../city/city-ui (BandChip),
 *   ../../_data/indexes (levelDisplayName), ../../_data/city-sensors (sensorTypeLabel).
 */

import { CreditInfo } from './CreditInfo'
import { OutboundLink } from './ChapterLink'
import { levelDisplayName } from '../../_data/indexes'
import { sensorTypeLabel } from '../../_data/city-sensors'
import type { CityPage } from '../../_data/city-page'

/** Props for AtlasMapLegend. */
type AtlasMapLegendProps = {
  /** The city: its own index, method line and index link. */
  city: CityPage
  /** Which sensor types this city actually has, so the legend never explains an absent shape. */
  hasLowCost: boolean
  hasReferenceGrade: boolean
}

/** Label style shared by the legend's rows. */
const LABEL = 'text-[11px] leading-tight text-foreground/75'

/** The legend. */
export function AtlasMapLegend({ city, hasLowCost, hasReferenceGrade }: AtlasMapLegendProps) {
  const index = city.index
  return (
    <div className="flex flex-col gap-3 border-t border-border bg-background px-4 py-3">
      {/* Sensor types: a separate small key, above the index bar (brief 6.1). */}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        {hasLowCost && (
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-full border border-foreground/70 bg-foreground/25"
            />
            <span className={LABEL}>{sensorTypeLabel('low-cost')}</span>
          </li>
        )}
        {hasReferenceGrade && (
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-[2px] border border-foreground/70 bg-foreground/25"
            />
            <span className={LABEL}>{sensorTypeLabel('reference-grade')}</span>
          </li>
        )}
      </ul>

      <div>
        {/* The index name above the bar, so the scale reads as the city's own, with its method line,
            publisher, map credit and link behind the "i". A city with no index (Sofia, Milan) gets
            the "i" beside "Readings" and no bar (SPEC ADDENDUM). */}
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold leading-tight text-foreground">{index === null ? 'Readings' : index.name}</p>
          <CreditInfo label={index === null ? 'About these readings' : `About ${index.name}`} align="start" className="" inDialog={false}>
            <p>{city.methodLine}</p>
            {index !== null && <p className="mt-2">{index.publisher}</p>}
            {city.mapCredit !== null && <p className="mt-2">{city.mapCredit.label}</p>}
            {city.adviceLink !== null && (
              <OutboundLink href={city.adviceLink.url} className="-mb-3 text-sm font-semibold text-foreground underline">
                {city.adviceLink.label}
              </OutboundLink>
            )}
          </CreditInfo>
        </div>
        {/* The colour's one job (spec 5.3), or why there is no colour. */}
        <p className={`mt-1 ${LABEL}`} data-legend-line="">{city.legendLine}</p>

        {index !== null && (
          <>
            {/* The bar: one segment per level, best to worst, in the city's own colours. Key only. */}
            <div aria-hidden="true" className="mt-1.5 flex h-2.5 overflow-hidden rounded-full">
              {index.levels.map((level) => (
                <span key={level.order} className="flex-1" style={{ backgroundColor: level.hex }} />
              ))}
            </div>
            {/* Iteration 4 (decision A1): the plain name under its own segment at every width. With
                many levels (BelAQI's ten) a long name hyphenates inside its column. */}
            <ol className="mt-1.5 flex" lang="en">
              {index.levels.map((level) => (
                <li key={level.order} className="min-w-0 flex-1 px-0.5 text-center" data-legend-level={level.order}>
                  <span className={`block break-words [hyphens:auto] ${LABEL} ${index.levels.length > 6 ? 'max-sm:text-[9px]' : ''}`}>
                    {levelDisplayName(level)}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}
