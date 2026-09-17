/**
 * atlas-markers.ts — the data map's sensor markers (brief 6.1).
 *
 * Purpose
 *   Builds the detached DOM element for one sensor marker. Copied in spirit from
 *   src/app/direction-2-live-data/markers.ts (never edited there, per the concept standard) and
 *   then cut down hard, because this map encodes far less:
 *
 *     Shape  = sensor type      circle for low-cost, square for reference-grade
 *     Colour = the city's index  tier 4 only, the level's own published colour
 *     Pulse  = live              every sensor here is live; there is no stale state
 *
 *   Markers show NO VALUES (brief 6.1). Nothing about a reading reaches the marker except, for a
 *   tier-4 city, which band of the city's own index it sits in.
 *
 * Marker states by tier (brief 6.1)
 *   Tier 4: pulses in the city's index colour for that sensor's level.
 *   Tier 3: pulses in black, because the city shares readings but no index of its own.
 *   Tier 2: still and dark grey, because the city shares locations only.
 *
 * Motion
 *   The pulse means "live". Its keyframes live in a <style> INSIDE each marker's SVG (the project's
 *   prototype standard for animated inline SVG), and a prefers-reduced-motion block in that same
 *   style hides the pulse ring, so markers stay still with no JavaScript involved.
 *
 * Accessibility
 *   The marker IS a <button>: keyboard reachable in document order, with an accessible name that
 *   says what a sighted user reads from shape and colour (sensor type, and the level name for a
 *   tier-4 city), because colour alone can carry nothing. The hit area is 44px square even though
 *   the shape is ~16px: see TOUCH_TARGET.
 *
 * TOKEN EXCEPTION (named)
 *   The two chrome colours below are documented literals, the carve-out the concept standard makes
 *   for Mapbox marker constants: a detached marker element is built before it is in the document,
 *   and WebGL and SVG string markup cannot read CSS custom properties. They are neutral chrome, not
 *   BC brand colour and not an interpretation of air quality. Every colour that MEANS anything on
 *   this map comes from the city's own index (../../_data/indexes.ts).
 *
 * Key exports: createSensorMarkerElement, SENSOR_MARKER_INK, SENSOR_TIER_STILL_GREY, TOUCH_TARGET
 * External dependencies: ../../_data/sensors (AtlasSensor type).
 */

import type { AtlasSensor } from '../../_data/sensors'

/**
 * Near-black hairline around every marker. Load-bearing: a pale index colour (Bogotá's yellow,
 * Sofia's cyan) has almost no edge against a light grey basemap without it.
 */
export const SENSOR_MARKER_INK = '#1f2328'

/** The dark grey of a tier-2 marker: the city shares locations only, so the marker carries no index. */
export const SENSOR_TIER_STILL_GREY = '#5a6675'

/** The black of a tier-3 marker: readings are shared, but the city publishes no index of its own. */
export const SENSOR_TIER_BLACK = '#1f2328'

/**
 * Hit area, in pixels. 44 is the accessible minimum rather than this project's usual 56: on a city
 * map 10 to 24 sensors sit within a few hundred pixels, and 56px areas would overlap enough that
 * tapping one sensor would reliably hit its neighbour, which is worse for everyone. The visible
 * shape stays small so the map is readable; the invisible button around it is what you press.
 */
export const TOUCH_TARGET = 44

/** Radius of the visible shape. */
const SHAPE_SIZE = 15

/** How far the pulse ring grows past the shape. */
const PULSE_SIZE = 30

/** Props the marker needs that do not live on the sensor itself. */
export type SensorMarkerStyle = {
  /** Fill colour: the index level's own colour (tier 4), black (tier 3) or dark grey (tier 2). */
  colour: string
  /** False for tier 2, where markers are still. */
  pulses: boolean
  /** The accessible name for the button, e.g. "Low-cost sensor, Bajo (Low)". */
  label: string
}

/**
 * The SVG for one marker. `square` switches between the reference-grade square and the low-cost
 * circle. The pulse ring is drawn first (under the shape) and animates scale and opacity from its
 * own centre; `transform-origin` is given in user units because a percentage origin needs
 * transform-box support that older Safari lacks.
 */
function markerSVG(square: boolean, colour: string, pulses: boolean): string {
  const centre = TOUCH_TARGET / 2
  const shape = square
    ? `<rect x="${centre - SHAPE_SIZE / 2}" y="${centre - SHAPE_SIZE / 2}" width="${SHAPE_SIZE}" height="${SHAPE_SIZE}" rx="1.5"
         fill="${colour}" stroke="${SENSOR_MARKER_INK}" stroke-width="1.25" />`
    : `<circle cx="${centre}" cy="${centre}" r="${SHAPE_SIZE / 2}"
         fill="${colour}" stroke="${SENSOR_MARKER_INK}" stroke-width="1.25" />`
  const ring = pulses
    ? `<circle class="atlas-sensor-pulse" cx="${centre}" cy="${centre}" r="${PULSE_SIZE / 2}" fill="${colour}" />`
    : ''
  // Keyframes inside the SVG, per the prototype standard for animated inline SVG. The class name is
  // prefixed so it cannot collide with anything else on the page.
  const style = pulses
    ? `<style>
         .atlas-sensor-pulse {
           transform-origin: ${centre}px ${centre}px;
           animation: atlas-sensor-pulse 2400ms ease-out infinite;
         }
         @keyframes atlas-sensor-pulse {
           0%   { transform: scale(0.35); opacity: 0.55; }
           70%  { transform: scale(1);    opacity: 0; }
           100% { transform: scale(1);    opacity: 0; }
         }
         @media (prefers-reduced-motion: reduce) {
           .atlas-sensor-pulse { animation: none; opacity: 0; }
         }
       </style>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TOUCH_TARGET}" height="${TOUCH_TARGET}"
      viewBox="0 0 ${TOUCH_TARGET} ${TOUCH_TARGET}" aria-hidden="true" focusable="false">
      ${style}${ring}${shape}
    </svg>`
}

/**
 * Build the button element for one sensor marker.
 *
 * Side effects: creates a detached DOM element and sets its innerHTML. Nothing is inserted into the
 * document here; the caller attaches it through mapboxgl.Marker, and the caller also owns the click
 * handler, so this module stays free of map imports.
 */
export function createSensorMarkerElement(sensor: AtlasSensor, style: SensorMarkerStyle): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.setAttribute('aria-label', style.label)
  button.setAttribute('data-sensor-id', sensor.id)
  button.style.width = `${TOUCH_TARGET}px`
  button.style.height = `${TOUCH_TARGET}px`
  button.style.padding = '0'
  button.style.border = 'none'
  button.style.background = 'transparent'
  button.style.cursor = 'pointer'
  button.style.display = 'block'
  button.style.borderRadius = '50%'
  button.innerHTML = markerSVG(sensor.type === 'reference-grade', style.colour, style.pulses)
  return button
}
