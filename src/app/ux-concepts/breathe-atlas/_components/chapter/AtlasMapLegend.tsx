/**
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
 * External dependencies: ./CreditInfo, ../../_data/indexes (CityAirQualityIndex, levelDisplayName).
 */

import { CreditInfo } from './CreditInfo'
import { levelDisplayName } from '../../_data/indexes'
import type { CityAirQualityIndex } from '../../_data/indexes'

/** Props for AtlasMapLegend. */
type AtlasMapLegendProps = {
  /** The city's own index, when it shares one (tier 4). Null otherwise. */
  index: CityAirQualityIndex | null
  /** Which sensor types this city actually has, so the legend never explains an absent shape. */
  hasLowCost: boolean
  hasReferenceGrade: boolean
}

/** Label style shared by the legend's rows. */
const LABEL = 'text-[11px] leading-tight text-foreground/75'

/** The legend. */
export function AtlasMapLegend({ index, hasLowCost, hasReferenceGrade }: AtlasMapLegendProps) {
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
            <span className={LABEL}>Low-cost sensor</span>
          </li>
        )}
        {hasReferenceGrade && (
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-[2px] border border-foreground/70 bg-foreground/25"
            />
            <span className={LABEL}>Reference-grade station</span>
          </li>
        )}
      </ul>

      {index !== null && (
        <div>
          {/* The index name above the bar, so the scale reads as the city's own. Its publisher line
              sits behind the "i" beside it (round 2, item 9). */}
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold leading-tight text-foreground">{index.name}</p>
            <CreditInfo label="Index source" align="start" className="">
              <p>{index.publisher}</p>
            </CreditInfo>
          </div>

          {/* The bar: one segment per level, best to worst, in the city's own colours. Decorative,
              because the list below names every level. No current-level marker: that is pending
              Jack's word (see the file header). */}
          <div aria-hidden="true" className="mt-1.5 flex h-2.5 overflow-hidden rounded-full">
            {index.levels.map((level) => (
              <span key={level.order} className="flex-1" style={{ backgroundColor: level.hex }} />
            ))}
          </div>

          {/* The level names, in the city's own wording with the English in brackets. One list, two
              layouts (see the file header): beneath their segments from `sm`, a list under the bar
              below it. */}
          <ol className="mt-1.5 flex flex-col gap-1.5 sm:flex-row sm:gap-0">
            {index.levels.map((level) => (
              <li
                key={level.order}
                className="flex items-center gap-2 sm:flex-1 sm:items-start sm:gap-0 sm:px-1 sm:text-center"
              >
                {/* Ties a name to its colour in the phone list, where the names no longer sit under
                    the bar. Hidden from `sm`, where the segment above it does that job. */}
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-4 shrink-0 rounded-[2px] sm:hidden"
                  style={{ backgroundColor: level.hex }}
                />
                <span className={LABEL}>{levelDisplayName(level)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
