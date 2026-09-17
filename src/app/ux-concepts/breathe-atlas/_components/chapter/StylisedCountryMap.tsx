/**
 * StylisedCountryMap.tsx — flat grey country outline, tilted in 3D, with the city marked (brief 5.4).
 *
 * Purpose
 *   One reusable, non-interactive map in two sizes:
 *   - `hero`: Milan's hero map (tier 1 shares no data, so the stylised map is its hero, brief 3).
 *   - `tile`: the "Where in the world" tile in the key facts of the six data cities (brief 5.3).
 *   Visual reference: isometric city maps. The fully 3D, branded look comes later (brief 9).
 *
 * How it is built (see ./country-map-geometry.ts for the maths)
 *   - The outline is an SVG path drawn from Natural Earth 1:50m data (world-atlas) at build time, in
 *     this server component. No map library, tiles or runtime download reach the browser.
 *   - The SVG "plane" is tilted with CSS `rotateX() rotateZ()` and no perspective. A soft shadow (a
 *     blurred copy) and a thin slab edge (stacked copies) sit straight below it on screen.
 *   - The city dot and label are NOT on the tilted plane: they sit in a flat overlay at the city's
 *     computed on-screen position, so the label stays upright and sharp. The label flips to the
 *     left of the dot when the city is in the right part of the map, so it never runs off the edge.
 *   - The "stage" box takes the tilted outline's own aspect ratio and is as tall as the size allows
 *     (`--atlas-map-h`) without getting wider than its container, so the map never scrolls sideways.
 *
 * Accessibility
 *   The stage is one image (role="img") named "Map of [country] with [city] marked". Everything
 *   inside it is hidden from assistive technology. The country name is also a visible caption.
 *
 * Styling
 *   Grey wireframe from bridged semantics only (foreground mixed toward background). No hex, no
 *   decorative colour.
 *
 * Key exports: StylisedCountryMap (named), CountryMapSize (type)
 * External dependencies: ./country-map-geometry (server-only data), ../../_data/country-maps (type).
 */

import { buildCountryMapGeometry, PLANE_SIZE, SHADOW_BLUR, TILT_X_DEG, TURN_Z_DEG } from './country-map-geometry'
import type { CountryMapSpec } from '../../_data/country-maps'

/** The two sizes: the Milan hero, or a key facts tile. */
export type CountryMapSize = 'hero' | 'tile'

/** Props for StylisedCountryMap. */
type StylisedCountryMapProps = {
  /** Which world-atlas country to draw. */
  spec: CountryMapSpec
  /** Country display name (caption and accessible name). */
  countryName: string
  /** City display name (label and accessible name). */
  cityName: string
  /** City position as [longitude, latitude]. */
  cityLngLat: [number, number]
  /** Hero or tile size. */
  size: CountryMapSize
}

/** Largest stage height for each size, per breakpoint (a CSS custom property read by the stage width). */
const STAGE_HEIGHT_CLASSES: Record<CountryMapSize, string> = {
  hero: '[--atlas-map-h:200px] sm:[--atlas-map-h:300px] lg:[--atlas-map-h:380px]',
  tile: '[--atlas-map-h:120px] sm:[--atlas-map-h:150px] lg:[--atlas-map-h:200px]',
}

/** Caption type size for each size. */
const CAPTION_CLASSES: Record<CountryMapSize, string> = {
  hero: 'mt-4 text-sm font-medium text-foreground/70',
  tile: 'mt-3 text-sm text-foreground/70',
}

/** Number of stacked copies that draw the slab edge (enough that thin islands show a solid edge). */
const EDGE_LAYERS = 5

/** Past this share of the stage width, the city label goes to the left of the dot. */
const LABEL_FLIP_LEFT_PCT = 58

/** Top face, slab edge, outline and shadow tones: foreground mixed toward the background. */
const TONES = {
  face: 'color-mix(in srgb, var(--foreground) 9%, var(--background))',
  edge: 'color-mix(in srgb, var(--foreground) 30%, var(--background))',
  outline: 'color-mix(in srgb, var(--foreground) 38%, var(--background))',
  shadow: 'var(--foreground)',
}

/** Rounds a layout number for inline styles (keeps the markup short, well under a pixel of error). */
function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/** The tilted country map. Server component. */
export function StylisedCountryMap({ spec, countryName, cityName, cityLngLat, size }: StylisedCountryMapProps) {
  const geometry = buildCountryMapGeometry(spec, cityLngLat)
  // Ids are unique per page: a chapter shows at most one map of each size.
  const pathId = `atlas-country-${spec.isoNumeric}-${size}`
  const blurId = `${pathId}-blur`
  const labelOnLeft = geometry.city.leftPct > LABEL_FLIP_LEFT_PCT
  const edgeSteps = Array.from({ length: EDGE_LAYERS }, (_, index) => (EDGE_LAYERS - index) / EDGE_LAYERS)

  return (
    // overflow-hidden: the tilted plane's square box pokes past the outline at its empty corners; without
    // the clip those transparent corners can widen the page on a phone. The outline, edge, shadow and
    // label all sit inside the stage, so nothing visible is cut.
    <figure className="flex w-full min-w-0 flex-col items-center overflow-hidden">
      <div
        role="img"
        aria-label={`Map of ${countryName} with ${cityName} marked`}
        className={`relative max-w-full ${STAGE_HEIGHT_CLASSES[size]}`}
        style={{
          width: `min(100%, calc(var(--atlas-map-h) * ${round(geometry.stageAspect)}))`,
          aspectRatio: `${round(geometry.stageAspect)}`,
        }}
      >
        {/* The tilted plane: shadow, slab edge, top face. */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: `${round(geometry.plane.leftPct)}%`,
            top: `${round(geometry.plane.topPct)}%`,
            width: `${round(geometry.plane.widthPct)}%`,
            height: `${round(geometry.plane.heightPct)}%`,
            transform: `rotateX(${TILT_X_DEG}deg) rotateZ(${TURN_Z_DEG}deg)`,
            transformOrigin: '50% 50%',
          }}
        >
          <svg viewBox={`0 0 ${PLANE_SIZE} ${PLANE_SIZE}`} className="block h-full w-full overflow-visible">
            <defs>
              <path id={pathId} d={geometry.pathD} />
              <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={SHADOW_BLUR} />
              </filter>
            </defs>
            <use
              href={`#${pathId}`}
              transform={`translate(${round(geometry.shadowOffset.x)} ${round(geometry.shadowOffset.y)})`}
              filter={`url(#${blurId})`}
              style={{ fill: TONES.shadow, fillOpacity: 0.16 }}
            />
            {edgeSteps.map((step) => (
              <use
                key={step}
                href={`#${pathId}`}
                transform={`translate(${round(geometry.edgeOffset.x * step)} ${round(geometry.edgeOffset.y * step)})`}
                style={{ fill: TONES.edge, stroke: TONES.edge, strokeWidth: 2, strokeLinejoin: 'round' }}
              />
            ))}
            <use
              href={`#${pathId}`}
              style={{ fill: TONES.face, stroke: TONES.outline, strokeWidth: 2, strokeLinejoin: 'round' }}
            />
          </svg>
        </div>

        {/* The city: an upright dot and label in a flat overlay at the city's on-screen position. */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{ left: `${round(geometry.city.leftPct)}%`, top: `${round(geometry.city.topPct)}%` }}
        >
          <span className="absolute left-0 top-0 block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-[3px] ring-background" />
          <span
            className={`absolute top-0 -translate-y-1/2 whitespace-nowrap rounded-full border border-foreground/15 bg-background px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm ${
              labelOnLeft ? 'right-3' : 'left-3'
            }`}
          >
            {cityName}
          </span>
        </div>
      </div>
      <figcaption className={CAPTION_CLASSES[size]}>{countryName}</figcaption>
    </figure>
  )
}
