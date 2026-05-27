/**
 * RoadmapRingChart.tsx — Visual Concept v1 hero data viz (pass 4, 2026-05-27).
 *
 * Purpose
 *   Replaces HeroWindComposition in the hero's right column. Two-layered ring pie chart that
 *   visualises the entire roadmap structure at a glance:
 *
 *     Inner ring — 4 equal-size stage segments (90 deg each), starting at 12 o'clock CW:
 *       Seeing (BC Blue-darker, so it reads against the BC Blue hero ground), Understanding
 *       (Africa accent teal), Acting (Tangerine), Enabling (Purple).
 *     Outer ring — N domain segments per stage, sized proportionally so each stage's outer
 *       arc occupies exactly the 90 deg of its parent stage. Outer segments use a lighter
 *       mint of the parent stage colour via colour-mix(parent 55%, white). 1.5px white stroke
 *       between outer segments.
 *
 *   Center — transparent (lets the hero BC Blue ground show through). A small text label
 *     stack at center: "Air Quality Roadmap" (Söhne Kräftig 500, 18px, white) over
 *     "11 domains · 4 stages" (Söhne Buch 400, 14px, white at 70%).
 *
 *   Outer perimeter stroke — 2px white at 25% so the chart edge reads against the BC Blue
 *     hero ground.
 *
 *   Outer labels (domain names) — NOT rendered this pass. At 480px with 11 outer segments and
 *     connector lines, the labelled treatment is too dense to read on the hero scale; the
 *     centre label carries enough orientation. Domain breakdown reveals as the reader scrolls
 *     into the chapter sections below.
 *
 * Brief deltas
 *   - Brief assumed 12 domains · 3 per stage. Actual data: 11 domains (DOMAINS skips id 11)
 *     with distribution Seeing 2 / Understanding 2 / Acting 4 / Enabling 3. The chart honours
 *     the real data; the centre label reads "11 domains" accordingly.
 *
 * Sizing
 *   Renders at the size passed via the `size` prop (default 480 desktop; 360 tablet via the
 *   parent's responsive class swap). The chart hides on mobile via the parent's
 *   `hidden lg:block` (mirrors how HeroWindComposition handled mobile).
 *
 * Implementation notes
 *   - Pure inline SVG, single component. No external chart lib.
 *   - Each ring is rendered as a set of <path> elements computed from polar -> cartesian math.
 *   - Segment colours resolve to CSS variables so any future token edit propagates.
 *
 * Key exports: RoadmapRingChart (named)
 * External dependencies: ../data via @/data/roadmap-data (DOMAINS, Stage), react.
 */

'use client'

import { DOMAINS, type Stage } from '@/data/roadmap-data'

/** Stages in render order — clockwise from 12 o'clock. */
const STAGE_ORDER: Stage[] = ['Seeing', 'Understanding', 'Acting', 'Enabling']

/**
 * Inner-segment colour per stage. Seeing uses --bc-color-blue-darker (#002A5B) instead of
 * --bc-color-blue so the Seeing wedge reads against the hero's BC Blue ground.
 */
const INNER_COLOR: Record<Stage, string> = {
  Seeing: 'var(--bc-color-blue-darker)',
  Understanding: 'var(--bc-color-region-africa)',
  Acting: 'var(--bc-color-tangerine)',
  Enabling: 'var(--bc-color-purple)',
}

/**
 * Outer-segment colour per stage. Lighter tint of the inner colour via colour-mix at 55% with
 * white — reads as "same family, dialled back" so the parent stage stays the dominant signal
 * and the outer ring registers as detail.
 */
const OUTER_COLOR: Record<Stage, string> = {
  Seeing: 'color-mix(in srgb, var(--bc-color-blue-darker) 55%, var(--bc-color-white))',
  Understanding:
    'color-mix(in srgb, var(--bc-color-region-africa) 55%, var(--bc-color-white))',
  Acting: 'color-mix(in srgb, var(--bc-color-tangerine) 55%, var(--bc-color-white))',
  Enabling: 'color-mix(in srgb, var(--bc-color-purple) 55%, var(--bc-color-white))',
}

/**
 * Polar -> cartesian helper. Angles in degrees, measured clockwise from 12 o'clock so a
 * geometric 0 degrees points up. Returns the {x, y} on a circle of radius `r` centred at
 * (cx, cy).
 */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  // Translate from "clockwise from 12 o'clock" to standard math angle (CCW from 3 o'clock).
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

/**
 * Build an SVG path "d" attribute for a single ring segment (annular wedge) between
 * `startAngle` and `endAngle` (degrees, CW from 12) with inner radius `rIn` and outer radius
 * `rOut`, centred at (cx, cy). Handles arcs up to 359.999 deg without wrap-around glitches.
 */
function buildSegmentPath(
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  startAngle: number,
  endAngle: number,
): string {
  // largeArcFlag = 1 when the arc spans more than 180 degrees.
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  const outerStart = polarToCartesian(cx, cy, rOut, startAngle)
  const outerEnd = polarToCartesian(cx, cy, rOut, endAngle)
  const innerStart = polarToCartesian(cx, cy, rIn, endAngle)
  const innerEnd = polarToCartesian(cx, cy, rIn, startAngle)

  // Outer arc (CW = sweep flag 1) -> radial line to inner -> inner arc (CCW = sweep flag 0) -> close.
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ')
}

interface RoadmapRingChartProps {
  /** Render size in CSS px. The chart is square; this is the wrapping <div>'s width and height. */
  size?: number
}

/**
 * RoadmapRingChart — two-ring SVG pie chart visualising the BC AQ Roadmap. Inner ring shows
 * the 4 stages (equal 90 deg wedges); outer ring shows the 11 domains, with each domain
 * sized to fit its parent stage's 90 deg arc. Center text labels the chart; outer perimeter
 * gets a 2px white-at-25% stroke so the chart reads against the BC Blue hero ground.
 */
export function RoadmapRingChart({ size = 480 }: RoadmapRingChartProps) {
  // Geometry — the SVG viewBox is independent of the rendered CSS size so the chart scales
  // without re-laying out paths. We work in a 480-unit viewBox; size prop drives the wrapper.
  const VB = 480
  const cx = VB / 2
  const cy = VB / 2

  // Ring radii. Outer ring: 220 outer / 160 inner. Inner ring: 158 outer / 80 inner. The 2px
  // gap between rings is implicit in the (158 vs 160) overlap = 2.
  const OUTER_R_OUTER = 220
  const OUTER_R_INNER = 160
  const INNER_R_OUTER = 158
  const INNER_R_INNER = 80

  // Inner ring: 4 stages, 90 degrees each, starting at 0 deg (12 o'clock).
  const innerSegments = STAGE_ORDER.map((stage, i) => {
    const start = i * 90
    const end = (i + 1) * 90
    return { stage, start, end }
  })

  // Outer ring: domains grouped by stage. Each stage's 90 deg arc is divided equally among
  // its domains (so Seeing's 2 domains get 45 deg each, Acting's 4 domains get 22.5 deg each,
  // etc). This is the actual-data faithful version; brief assumption was 3 domains per stage.
  const outerSegments: { stage: Stage; start: number; end: number; domainId: number }[] = []
  STAGE_ORDER.forEach((stage, stageIndex) => {
    const stageStart = stageIndex * 90
    const domainsInStage = DOMAINS.filter((d) => d.stage === stage)
    const wedgeSize = 90 / domainsInStage.length
    domainsInStage.forEach((domain, domainIndex) => {
      const start = stageStart + domainIndex * wedgeSize
      const end = start + wedgeSize
      outerSegments.push({ stage, start, end, domainId: domain.id })
    })
  })

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size, maxWidth: '100%' }}
    >
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="Breathe Cities Air Quality Roadmap — 11 domains across 4 stages: Seeing, Understanding, Acting, Enabling"
      >
        {/* Outer perimeter stroke — keeps the whole chart legible against BC Blue ground. */}
        <circle
          cx={cx}
          cy={cy}
          r={OUTER_R_OUTER + 1}
          fill="none"
          stroke="color-mix(in srgb, var(--bc-color-white) 25%, transparent)"
          strokeWidth={2}
        />

        {/* Outer ring — domain segments. Render fills first, then white separator strokes
         *  ride on top via the segment paths themselves (stroke + fill on each path). */}
        {outerSegments.map((seg) => (
          <path
            key={`outer-${seg.domainId}`}
            d={buildSegmentPath(
              cx,
              cy,
              OUTER_R_INNER,
              OUTER_R_OUTER,
              seg.start,
              seg.end,
            )}
            fill={OUTER_COLOR[seg.stage]}
            stroke="var(--bc-color-white)"
            strokeWidth={1.5}
            strokeLinejoin="miter"
          />
        ))}

        {/* Inner ring — stage segments. 2px ring gap between the two rings (OUTER_R_INNER=160
         *  vs INNER_R_OUTER=158). */}
        {innerSegments.map((seg) => (
          <path
            key={`inner-${seg.stage}`}
            d={buildSegmentPath(
              cx,
              cy,
              INNER_R_INNER,
              INNER_R_OUTER,
              seg.start,
              seg.end,
            )}
            fill={INNER_COLOR[seg.stage]}
            stroke="var(--bc-color-white)"
            strokeWidth={1.5}
            strokeLinejoin="miter"
          />
        ))}

        {/* Center text — stacked over the transparent core. Coordinates in viewBox units. */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          style={{
            fill: 'var(--bc-color-white)',
            fontSize: '20px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
          }}
        >
          Air Quality Roadmap
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          style={{
            fill: 'color-mix(in srgb, var(--bc-color-white) 70%, transparent)',
            fontSize: '14px',
            fontWeight: 400,
          }}
        >
          11 domains &middot; 4 stages
        </text>
      </svg>
    </div>
  )
}
