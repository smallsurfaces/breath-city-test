/**
 * SourcesChart.tsx — "Where it comes from in [City]" as a donut chart plus list (round 3 decision W).
 *
 * Purpose
 *   Where the city's source study gives a single published share for EVERY listed category, the
 *   shares draw as an SVG donut (no chart library), each segment labelled with its source icon (the
 *   decision J set) and its percentage, above the list. Otherwise (shares missing, or published as a
 *   range or "above N%") there is no chart: the list of categories with their icons only.
 *
 * Rules (design-director, decision W)
 *   - Segment colours are neutral, distinct BC token tints (concept standard section 2), NEVER an
 *     index's band colours, so a source can't be read as an air quality level.
 *   - Shares that add to less than 100% get a grey "Other sources" segment for the remainder; the
 *     listed shares are never stretched to fill the circle. (Shares that add to more than 100%
 *     through the source's own rounding are drawn as published, the last segment trimmed to close.)
 *   - Percentages are rounded to whole numbers in the chart and the list; the exact published
 *     figures stay in the data and are listed behind the section's "i" (the caller's StepHeading).
 *   - Segment labels sit outside the ring, only for segments of 8% or more (smaller ones would
 *     collide); every segment is named in the list underneath, with the same swatch.
 *
 * Accessibility
 *   The chart is decorative (aria-hidden): the list carries every category and share in text.
 *
 * TOKEN EXCEPTION: none. Colours are BC tokens mixed at the presentation layer.
 *
 * Key exports: SourcesChart (named), chartableShares
 * External dependencies: ./SourceIcon, ../../_data/city-page (PollutantSourceLine).
 */

import { SourceIcon } from './SourceIcon'
import type { PollutantSourceLine } from '../../_data/city-page'

/** Neutral, distinct segment tints from BC tokens (never band colours). */
const TINTS = [
  'color-mix(in srgb, var(--bc-color-blue) 75%, var(--bc-color-white))',
  'color-mix(in srgb, var(--bc-color-teal) 70%, var(--bc-color-white))',
  'color-mix(in srgb, var(--bc-color-dark-blue) 55%, var(--bc-color-white))',
  'color-mix(in srgb, var(--bc-color-steel) 75%, var(--bc-color-white))',
  'color-mix(in srgb, var(--bc-color-dark-blue) 25%, var(--bc-color-white))',
  'color-mix(in srgb, var(--bc-color-light-teal) 80%, var(--bc-color-teal))',
]
/** The grey for "Other sources". */
const OTHER_TINT = 'color-mix(in srgb, var(--bc-color-light-grey) 80%, var(--bc-color-steel))'

/** A segment label is drawn only from this share up (percent). */
const LABEL_MIN = 8

/**
 * The shares as numbers, when EVERY line has a single published percentage ("40%", "41.6%");
 * otherwise null (no chart). Pure.
 */
export function chartableShares(lines: PollutantSourceLine[]): number[] | null {
  if (lines.length === 0) return null
  const values = lines.map((line) => {
    const match = line.share === null ? null : /^(\d+(?:\.\d+)?)%$/.exec(line.share.trim())
    return match === null ? null : Number(match[1])
  })
  return values.every((v) => v !== null) ? (values as number[]) : null
}

/** A whole-number percentage for display. Pure. */
function wholePercent(value: number): string {
  return `${Math.round(value)}%`
}

/** Props for SourcesChart. */
type SourcesChartProps = {
  lines: PollutantSourceLine[]
}

/** One drawn segment. */
type Segment = { key: string; label: string; share: number; tint: string; icon: PollutantSourceLine['icon'] | null }

/** The donut (when chartable) and the list. */
export function SourcesChart({ lines }: SourcesChartProps) {
  const shares = chartableShares(lines)
  const segments: Segment[] =
    shares === null
      ? []
      : lines.map((line, index) => ({ key: line.category, label: line.category, share: shares[index], tint: TINTS[index % TINTS.length], icon: line.icon }))
  const total = segments.reduce((sum, s) => sum + s.share, 0)
  if (shares !== null && total < 99.5) {
    segments.push({ key: 'other', label: 'Other sources', share: 100 - total, tint: OTHER_TINT, icon: null })
  }

  // Geometry: a ring of radius R in a 200-unit box; segments as stroked arcs (dasharray).
  const R = 52
  const STROKE = 24
  const C = 2 * Math.PI * R
  let start = 0
  const arcs = segments.map((segment) => {
    const share = Math.min(segment.share, 100 - start)
    const arc = { ...segment, from: start, share }
    start += share
    return arc
  })

  return (
    <div className="mt-2 space-y-3" data-sources-chart={shares === null ? 'list' : 'donut'}>
      {shares !== null && (
        <div aria-hidden="true" className="relative mx-auto h-[220px] w-[220px] max-w-full">
          <svg viewBox="0 0 200 200" className="h-full w-full" focusable="false">
            <g transform="rotate(-90 100 100)">
              {arcs.map((arc) => (
                <circle
                  key={arc.key}
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  stroke={arc.tint}
                  strokeWidth={STROKE}
                  strokeDasharray={`${(arc.share / 100) * C} ${C}`}
                  strokeDashoffset={-(arc.from / 100) * C}
                />
              ))}
            </g>
          </svg>
          {/* Labels outside the ring, at each large segment's middle. */}
          {arcs
            .filter((arc) => arc.share >= LABEL_MIN)
            .map((arc) => {
              const angle = ((arc.from + arc.share / 2) / 100) * 2 * Math.PI - Math.PI / 2
              const radius = 86 // in the 200-unit box: outside the ring (52 + 12)
              const left = 50 + (Math.cos(angle) * radius) / 2
              const top = 50 + (Math.sin(angle) * radius) / 2
              return (
                <span
                  key={arc.key}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-[11px] font-semibold leading-none text-foreground"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  {arc.icon !== null ? <SourceIcon icon={arc.icon} className="mb-0.5 h-4 w-4" /> : null}
                  {wholePercent(arc.share)}
                </span>
              )
            })}
        </div>
      )}

      <ul className="space-y-1">
        {lines.map((line, index) => (
          <li key={line.category} className="flex items-center gap-2 border-b border-border py-1 text-sm text-foreground/85">
            {shares !== null && (
              <span aria-hidden="true" className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: TINTS[index % TINTS.length] }} />
            )}
            <SourceIcon icon={line.icon} className="h-4 w-4 shrink-0 text-foreground/70" />
            <span className="min-w-0 flex-1">{line.category}</span>
            {line.share !== null && (
              <span className="shrink-0 tabular-nums text-foreground">
                {shares !== null ? wholePercent(shares[index]) : line.share}
              </span>
            )}
          </li>
        ))}
        {shares !== null && total < 99.5 && (
          <li className="flex items-center gap-2 border-b border-border py-1 text-sm text-foreground/70">
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: OTHER_TINT }} />
            <span className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">Other sources</span>
            <span className="shrink-0 tabular-nums">{wholePercent(100 - total)}</span>
          </li>
        )}
      </ul>
    </div>
  )
}
