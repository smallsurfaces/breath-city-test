/**
 * BcGraphics.tsx — Visual Concept v1 inline-SVG BC brand graphic primitives.
 *
 * Purpose
 *   BC brand pass 2 (2026-05-27) deploys Wind + Window graphics at three moments per brief §7
 *   (hero composition, Acting stage accent, footer top edge). Rather than rendering each asset
 *   via `next/image` from the `_brand/graphics/` SVG files — which fixes their fill colour to
 *   the source `#0071C7` — we inline the SVG path data as React components so each instance
 *   accepts an arbitrary fill colour and opacity via props. This allows the same Wind primitive
 *   to render in cyan (hero), tangerine (Acting accent), and white-at-25% (footer), all from
 *   one source of truth.
 *
 *   Path data extracted verbatim from `_brand/graphics/wind/wind.svg` and `_brand/graphics/
 *   windows/window-0{1..5}.svg`. The original SVG files stay in `_brand/graphics/` as the
 *   canonical assets — these inline copies are derived rendering primitives. If the source
 *   asset changes, regenerate this file's path data.
 *
 * Three deployment moments (brief §7)
 *   1. Hero composition (right column) — `<HeroWindComposition />` (Wind + 2 Windows + 1 photo)
 *   2. Acting stage accent — `<WindAccent />` (single small Wind, tangerine, hidden mobile)
 *   3. Footer top edge — `<FooterWindowsStrip />` (three small windows, white at 25%)
 *
 * Window primitives are kept atomic so the same files can be re-mixed for future layouts —
 * adding a fourth deployment moment is one new composite, not a re-build.
 *
 * Key exports: WindShape, Window01..05 (atomic primitives); HeroWindComposition, WindAccent,
 *   FooterWindowsStrip (composite layouts).
 * External dependencies: react.
 */

import type { CSSProperties, ReactNode } from 'react'

/* ──────────────────────────────────────────────────────────────────────────
 * Atomic primitives — one component per source SVG, fill colour as a prop.
 * Each accepts `fill`, `opacity`, `className`, and `style` so the parent
 * controls rendering. ViewBox preserved from the source so aspect ratios are
 * exact. width/height default to 100% so the parent sizes via CSS.
 * ────────────────────────────────────────────────────────────────────────── */

interface SvgShapeProps {
  fill?: string
  opacity?: number
  className?: string
  style?: CSSProperties
  width?: number | string
  height?: number | string
  ariaHidden?: boolean
  title?: string
}

/** Wind swirl — source: _brand/graphics/wind/wind.svg, viewBox 600×400. */
export function WindShape({
  fill = 'currentColor',
  opacity = 1,
  className,
  style,
  width = '100%',
  height = '100%',
  ariaHidden = true,
  title,
}: SvgShapeProps) {
  return (
    <svg
      viewBox="0 0 600 400"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
      role={ariaHidden ? undefined : 'img'}
    >
      {title && <title>{title}</title>}
      <g fill={fill} opacity={opacity}>
        <path d="M468.3,78.2c-31.3,0-56.7,25.4-56.7,56.7v5.8h32.7v-5.8c0-13.2,10.8-23.9,24-23.9c13.2,0,24,10.7,24,23.9c0,13.2-10.8,23.9-24,23.9H137.4v32.7h330.8c31.3,0,56.7-25.4,56.7-56.7S499.6,78.2,468.3,78.2" />
        <path d="M406.5,321.9c-31.3,0-56.8-25.5-56.8-56.8v-5.8h32.8v5.8c0,13.2,10.8,24,24,24c13.2,0,24-10.8,24-24c0-13.2-10.8-24-24-24H75v-32.8h331.5c31.3,0,56.8,25.5,56.8,56.8C463.4,296.4,437.9,321.9,406.5,321.9" />
      </g>
    </svg>
  )
}

/** Window 01 — source: window-01.svg, two arches meeting on top of a square. ViewBox 600×600. */
export function Window01({
  fill = 'currentColor',
  opacity = 1,
  className,
  style,
  width = '100%',
  height = '100%',
  ariaHidden = true,
}: SvgShapeProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      <path
        fill={fill}
        opacity={opacity}
        d="M500,142.3c-73.1,1.1-132,60.7-132,134c0-74-60-134-134-134s-134,60-134,134v181.4h268h132V142.3z"
      />
    </svg>
  )
}

/** Window 02 — source: window-02.svg, half-dome on a square base. ViewBox 600×600. */
export function Window02({
  fill = 'currentColor',
  opacity = 1,
  className,
  style,
  width = '100%',
  height = '100%',
  ariaHidden = true,
}: SvgShapeProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      <path
        fill={fill}
        opacity={opacity}
        d="M164.3,324c0,74.9,60.7,135.7,135.7,135.7S435.7,398.9,435.7,324V140.3H164.3C164.3,140.3,164.3,398.2,164.3,324z"
      />
    </svg>
  )
}

/** Window 03 — source: window-03.svg, full circle. ViewBox 600×600. */
export function Window03({
  fill = 'currentColor',
  opacity = 1,
  className,
  style,
  width = '100%',
  height = '100%',
  ariaHidden = true,
}: SvgShapeProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      <circle fill={fill} opacity={opacity} cx="300" cy="300" r="175" />
    </svg>
  )
}

/** Window 04 — source: window-04.svg, lower half-circle. ViewBox 600×600. */
export function Window04({
  fill = 'currentColor',
  opacity = 1,
  className,
  style,
  width = '100%',
  height = '100%',
  ariaHidden = true,
}: SvgShapeProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      <path
        fill={fill}
        opacity={opacity}
        d="M475,212.5c0,96.6-78.4,175-175,175s-175-78.4-175-175H475z"
      />
    </svg>
  )
}

/** Window 05 — source: window-05.svg, irregular polygon (flag-like). ViewBox 600×600. */
export function Window05({
  fill = 'currentColor',
  opacity = 1,
  className,
  style,
  width = '100%',
  height = '100%',
  ariaHidden = true,
}: SvgShapeProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    >
      <polygon
        fill={fill}
        opacity={opacity}
        points="340,125 122.3,125 122.3,421.2 340,421.2 477.7,475 477.7,178.8 "
      />
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * Composite layouts — the three brief §7 deployment moments.
 * ────────────────────────────────────────────────────────────────────────── */

interface HeroWindCompositionProps {
  /** Optional photograph child to embed inside the large Window 01 mask.
   *  When omitted, a placeholder cyan fill panel renders inside the window —
   *  per brief §5 the composition shape is what matters; real photography
   *  lands on a later pass. */
  photoSlot?: ReactNode
  /** Optional aria-label override; defaults to a generic decorative label. */
  ariaLabel?: string
}

/**
 * HeroWindComposition — brief §7 moment 1. Right-column hero composition:
 *   - Wind swirl behind, cyan at 60% opacity, scaled ~120% of column.
 *   - Window 01 (large arched window) upper-right, ~60% column width, contains
 *     the photo slot (or a placeholder cyan panel).
 *   - Window 03 (full circle) lower-left of the large window, ~35% column width.
 *
 * Both windows are filled white at 100% so they read as white frames on the BC
 * Blue ground (the hero section background). The Wind reads cyan-on-blue behind
 * them as the brand's signature "motion behind static frames" pattern.
 *
 * Sizing
 *   Outer container is `aspect-square` so the composition reads as a confident
 *   block in the right column. Parent supplies width; the absolute children
 *   resolve from percentages of the outer.
 *
 * Mobile
 *   Caller decides whether to render at all on mobile (brief §5 suggests
 *   stacking above the headline at reduced height, or hidden via
 *   `hidden lg:block`). This component renders the full composition unconditionally;
 *   the page wraps it in the appropriate responsive utilities.
 */
export function HeroWindComposition({
  photoSlot,
  ariaLabel = 'Decorative graphic composition — wind and window shapes',
}: HeroWindCompositionProps) {
  return (
    <div
      className="relative w-full aspect-square"
      role="img"
      aria-label={ariaLabel}
    >
      {/* Wind swirl — sits behind both windows, cyan against BC Blue ground.
       * Scaled past 100% so the swirl extends slightly past the right edge of
       * the column, giving the motion a sense of leaving the frame. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: 'scale(1.2)',
          transformOrigin: 'center center',
        }}
      >
        <WindShape
          fill="var(--bc-hero-wind-color)"
          opacity={Number('0.6')}
          ariaHidden
        />
      </div>

      {/* Window 01 — large arched window upper-right. Holds the photo slot or
       * a placeholder cyan panel if no photo is supplied. Mask achieved via
       * SVG fill — the window IS the white shape; the photo sits BEHIND it
       * and is clipped by an inner overlay. */}
      <div
        className="absolute"
        style={{
          top: '0%',
          right: '0%',
          width: '60%',
          height: '60%',
        }}
      >
        {/* Photo placeholder layer — sits behind the white window frame.
         * The white frame has cutouts (the SVG's path is the visible white
         * shape, leaving negative space transparent) so the photo shows
         * through. With this geometry, fill the entire box with the photo
         * placeholder and let the white SVG render on top — the SVG's
         * solid white where the path is and transparent elsewhere gives
         * the framed-window look. */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backgroundColor: 'var(--bc-color-light-blue)',
            opacity: 0.85,
          }}
        >
          {photoSlot}
        </div>
        <div className="absolute inset-0">
          <Window01 fill="var(--bc-color-white)" opacity={1} ariaHidden />
        </div>
      </div>

      {/* Window 03 — full circle, lower-left of the large window. Pure white
       * shape on the BC Blue ground; reads as a secondary brand mark. */}
      <div
        className="absolute"
        style={{
          bottom: '8%',
          left: '5%',
          width: '35%',
          height: '35%',
        }}
      >
        <Window03 fill="var(--bc-color-white)" opacity={1} ariaHidden />
      </div>
    </div>
  )
}

/**
 * WindAccent — brief §7 moment 2. Single small Wind swirl, intended as a section-divider
 * accent next to the "Acting" stage heading. Hidden on mobile via parent caller's `hidden
 * md:block` (we don't enforce here; caller decides container width / breakpoint).
 *
 * Default colour: tangerine at 70% opacity (per brief §7 — reinforces the Acting stage's
 * pass-1 hue mapping).
 */
export function WindAccent({
  fill = 'var(--bc-color-tangerine)',
  opacity = 0.7,
  size = 80,
}: {
  fill?: string
  opacity?: number
  size?: number
}) {
  return (
    <div
      style={{ width: size, height: size * (400 / 600) }}
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <WindShape fill={fill} opacity={opacity} ariaHidden />
    </div>
  )
}

/**
 * FooterWindowsStrip — brief §7 moment 3. Three small Window shapes (02, 04, 05) in a
 * horizontal row at the top of the BC Blue footer band. Each ~40px tall, white at 25%
 * opacity — decorative accent that wraps the page closing.
 *
 * If the footer-windows count needs to drop (per brief §7 warning about exceeding the
 * 4-per-layout brand-guide cap), reduce to 2 by removing one Window from the row.
 */
export function FooterWindowsStrip() {
  return (
    <div
      className="flex items-center justify-center gap-8"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <div style={{ width: 40, height: 40 }}>
        <Window02
          fill="var(--bc-color-white)"
          opacity={0.25}
          ariaHidden
        />
      </div>
      <div style={{ width: 40, height: 40 }}>
        <Window04
          fill="var(--bc-color-white)"
          opacity={0.25}
          ariaHidden
        />
      </div>
      <div style={{ width: 40, height: 40 }}>
        <Window05
          fill="var(--bc-color-white)"
          opacity={0.25}
          ariaHidden
        />
      </div>
    </div>
  )
}
