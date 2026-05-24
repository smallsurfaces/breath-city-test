/**
 * PillarRadar.tsx — the four-pillar radar, DERIVED from the achievement timeline.
 *
 * Purpose
 *   Summarises how Breathe Cities supports a city across its four pillars as a single
 *   four-axis radar. The values are NOT authored — the page counts achievement cards per
 *   pillar and passes those counts in. This component only draws; it never decides a score.
 *
 *   Framing (load-bearing, shown in the UI by the page, not here): the radar is a
 *   PROGRAMME scorecard ("How Breathe Cities supports Accra"), never a city grade. A light
 *   axis means less BC support FOCUS on that pillar — never "the city is bad". An empty
 *   pillar (count 0, e.g. Accra's Lesson sharing) is honest and renders as a point at the
 *   centre on that axis.
 *
 * Rendering approach
 *   A small inline SVG (no chart library — keeps the prototype dependency-light). Four axes
 *   at 90° apart, value rings, a filled value polygon, and a label per axis. All geometry is
 *   derived from named constants below so the math is explicit and reviewable, never magic.
 *   Colours come from BC tokens only (no hardcoded hex).
 *
 * Key exports: PillarRadar (named)
 * External dependencies: react (types only), ../_data/types (PILLARS, PillarId).
 */

import type { ReactElement } from 'react'
import { PILLARS, type PillarId } from '../_data/types'

// ── Geometry constants — every coordinate below derives from these, so the layout is
//    explicit and tunable in one place (no magic numbers in the JSX). ─────────────────
/** SVG viewBox is SIZE x SIZE; the radar is centred in it. */
const SIZE = 260
/** Centre point (x and y are equal — square canvas). */
const CENTER = SIZE / 2
/** Radius of the outer ring (the maximum value). Leaves room for axis labels outside it. */
const MAX_RADIUS = 78
/** Number of concentric guide rings (also the max value an axis can represent). */
const RING_COUNT = 3
/** How far out (beyond MAX_RADIUS) the text label for each axis sits. */
const LABEL_OFFSET = 30

/**
 * The four axis directions in radians, pillar 1 at the TOP and going clockwise:
 *   pillar 1 → up, pillar 2 → right, pillar 3 → down, pillar 4 → left.
 * -90° (−π/2) is straight up in SVG's y-down coordinate space; each subsequent axis adds 90°.
 */
const AXIS_ANGLES: Readonly<Record<PillarId, number>> = {
  1: -Math.PI / 2,
  2: 0,
  3: Math.PI / 2,
  4: Math.PI,
}

/**
 * BC token colour per pillar (CSS custom properties — never hardcoded hex). Distinct hues so
 * each pillar is visually identifiable in the tag system AND the radar consistently.
 */
const PILLAR_COLOR_VAR: Readonly<Record<PillarId, string>> = {
  1: 'var(--bc-color-blue)',
  2: 'var(--bc-color-teal)',
  3: 'var(--bc-color-tangerine)',
  4: 'var(--bc-color-green)',
}

/**
 * Convert a pillar's value (0..maxValue) on a given axis into an [x, y] SVG point.
 * value 0 sits at the centre; value === maxValue sits on the outer ring. Pure helper.
 */
function pointFor(
  pillarId: PillarId,
  value: number,
  maxValue: number,
): [number, number] {
  // Guard a zero/!finite max so an all-empty radar collapses to the centre rather than NaN.
  const safeMax = maxValue > 0 ? maxValue : 1
  const ratio = value / safeMax
  const radius = ratio * MAX_RADIUS
  const angle = AXIS_ANGLES[pillarId]
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)]
}

/** Props for PillarRadar. */
type PillarRadarProps = {
  /**
   * Achievement count per pillar, DERIVED by the page from the timeline. Keyed by PillarId.
   * The component renders these as-is and never recomputes them.
   */
  counts: Readonly<Record<PillarId, number>>
}

/**
 * The four-pillar radar. Draws guide rings, four labelled axes, and the value polygon from
 * the supplied per-pillar counts. The maximum ring equals the largest count (min 1) so the
 * shape always fills the canvas sensibly regardless of absolute counts.
 */
export function PillarRadar({ counts }: PillarRadarProps): ReactElement {
  // The outer ring represents the highest pillar count (at least 1, and at least RING_COUNT
  // is NOT forced — we let the data set the scale, but never below 1 to avoid divide-by-zero).
  const maxValue = Math.max(1, ...PILLARS.map((p) => counts[p.id]))

  // Value polygon points, in pillar order, as an SVG points string.
  const polygonPoints = PILLARS.map((pillar) => {
    const [x, y] = pointFor(pillar.id, counts[pillar.id], maxValue)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Four-pillar support radar, derived from the achievement timeline"
      className="h-auto w-full max-w-[280px]"
    >
      {/* Concentric guide rings — purely visual scale reference. */}
      {Array.from({ length: RING_COUNT }, (_, i) => {
        const r = (MAX_RADIUS * (i + 1)) / RING_COUNT
        return (
          <circle
            key={`ring-${i}`}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke="var(--bc-semantic-border)"
            strokeWidth={1}
          />
        )
      })}

      {/* Four axes from the centre to each outer point. */}
      {PILLARS.map((pillar) => {
        const [x, y] = pointFor(pillar.id, maxValue, maxValue)
        return (
          <line
            key={`axis-${pillar.id}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="var(--bc-semantic-border)"
            strokeWidth={1}
          />
        )
      })}

      {/* The value polygon — brand-tinted fill with a brand stroke. */}
      <polygon
        points={polygonPoints}
        fill="var(--bc-color-blue)"
        fillOpacity={0.18}
        stroke="var(--bc-semantic-brand)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* A dot at each pillar's value, in that pillar's colour (empty pillars sit at centre). */}
      {PILLARS.map((pillar) => {
        const [x, y] = pointFor(pillar.id, counts[pillar.id], maxValue)
        return (
          <circle
            key={`dot-${pillar.id}`}
            cx={x}
            cy={y}
            r={4}
            fill={PILLAR_COLOR_VAR[pillar.id]}
          />
        )
      })}

      {/* Axis labels — short labels just outside the outer ring, anchored per quadrant. */}
      {PILLARS.map((pillar) => {
        const [lx, ly] = (() => {
          const angle = AXIS_ANGLES[pillar.id]
          const r = MAX_RADIUS + LABEL_OFFSET
          return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
        })()
        // Anchor so labels don't overrun the canvas: top/bottom centred, right start, left end.
        const anchor =
          pillar.id === 2 ? 'start' : pillar.id === 4 ? 'end' : 'middle'
        return (
          <text
            key={`label-${pillar.id}`}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {pillar.shortLabel}
          </text>
        )
      })}
    </svg>
  )
}
