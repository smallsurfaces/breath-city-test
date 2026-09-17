/**
 * AtlasMapLegend.tsx — the data map's legend (brief 6.1).
 *
 * Purpose
 *   "Legend: sensor types. Tier 4 adds the index name and its levels." Sensor shape always: a
 *   circle for low-cost, a square for reference-grade. For a city that shares its own index, the
 *   index's levels follow, each with the colour and the name that city publishes.
 *
 *   The legend sits UNDER the map rather than over it, so it never covers a sensor and never has to
 *   be dismissed on a phone. It is the only place a chapter explains a colour, and the only colour
 *   it shows is the city's own.
 *
 *   The publisher line is deliberate: for Johannesburg the index is the national one, because the
 *   city publishes none of its own, and the legend should not imply otherwise.
 *
 * Key exports: AtlasMapLegend (named)
 * External dependencies: ../../_data/indexes (CityAirQualityIndex, levelDisplayName).
 */

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
    <div className="flex flex-col gap-2 border-t border-border bg-background px-4 py-3">
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
          <p className="text-[11px] font-semibold leading-tight text-foreground">
            {index.name}
            <span className="font-normal text-foreground/65"> · {index.publisher}</span>
          </p>
          <ul className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {index.levels.map((level) => (
              <li key={level.order} className="flex items-center gap-1.5">
                {/* The city's own colour for this level. The only colour in the chapter. */}
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 shrink-0 rounded-full border border-foreground/40"
                  style={{ backgroundColor: level.hex }}
                />
                <span className={LABEL}>{levelDisplayName(level)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
