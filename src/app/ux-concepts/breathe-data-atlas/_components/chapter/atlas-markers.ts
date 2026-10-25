/**
 * atlas-markers.ts — the city map's sensor markers and the tap pin (spec 5.2, 5.4, 5.5).
 *
 * Purpose
 *   Copied from breathe-atlas/_components/chapter/atlas-markers.ts on 2026-10-25 and changed for
 *   the Breathe Data Atlas city page (the original is never edited). Builds the detached DOM
 *   elements Mapbox positions:
 *
 *     Shape  = sensor type   circle for a low-cost sensor, square for a reference monitor
 *     Fill (SensorMarkerStyle.fill), iteration 4 (round 3 decisions B1 to B3):
 *       band     fresh, the city's band: the station's OVERALL level in the city's own colour, with a
 *                soft pulse (live). Nothing is computed: the level comes from the feed's own field.
 *       no-band  fresh, but the city sent no band (Bogotá's "SIN DATOS"): BLACK with a white "–"
 *                inside, echoing the "--" on Bogotá's own IBOCA map; the hyphen keeps it apart from
 *                any dark band colour and does not rely on colour alone. Pulses (it is live).
 *       no-index fresh, in a city that has NO live index at all (Sofia, Milan, round 3, Jack's marker
 *                rule): PLAIN BLACK, no hyphen. The sensor publishes readings; there is no band to
 *                miss. Driven by the city's data (index === null), never by city name. Pulses.
 *       neutral  fresh, where the city rates areas, not stations (Brussels): a plain
 *                neutral fill with a neutral pulse. Nothing is missing.
 *       stale    older than the city's cycle, however old: grey, still, never a band colour.
 *     There is no dead or hollow state any more (decision B1).
 *
 *   Markers show NO VALUES (rule 7).
 *
 * Selected state (iteration 2, decision B6)
 *   While a sensor's card is open its marker is ENLARGED with a DARK OUTLINE RING (a white halo
 *   under a near-black ring, so it reads on the grey basemap and on any band colour). Other markers
 *   are unchanged. setMarkerSelected toggles it; the ring is in every marker's SVG, hidden until then.
 *
 * Motion
 *   Keyframes in a <style> inside each marker's SVG (prototype build standard 4); a
 *   prefers-reduced-motion block in that style hides the pulse ring.
 *
 * Accessibility
 *   The marker is a <button> with a name that says what shape, colour and fill say. Hit area 44px
 *   (TOUCH_TARGET): the map is dense, so the Atlas's 44px is kept for markers rather than the 56px
 *   page minimum, which would make neighbouring hit areas swallow each other.
 *
 * TOKEN EXCEPTION (named)
 *   The neutral literals below are the concept standard's carve-out for marker constants: a
 *   detached marker is built as SVG markup before it is in the document. They are neutral chrome and
 *   say nothing about air quality. Every colour that MEANS something comes from the city's index.
 *
 * Key exports: createSensorMarkerElement, setMarkerSelected, createPinElement, markerFillFor,
 *   SensorMarkerStyle, MarkerFill, TOUCH_TARGET, SENSOR_MARKER_INK, SENSOR_STALE_GREY,
 *   SENSOR_NO_BAND_FILL, SENSOR_NEUTRAL_FILL
 * External dependencies: ../../_data/city-sensors (CitySensor, Freshness types).
 */

import type { CitySensor, Freshness } from '../../_data/city-sensors'

/** Outline colour for every marker shape. Near-black, neutral. */
export const SENSOR_MARKER_INK = '#1f2328'

/** Fill for a stale marker: neutral grey, never a band colour (spec 5.5). */
export const SENSOR_STALE_GREY = '#9aa1a9'

/** White: the selected ring's halo, the pin's centre and the no-band hyphen. */
const SENSOR_HOLLOW_FILL = '#ffffff'

/** Fill for a fresh reading with no band (decision B2): black, as Bogotá's feed colours "Sin data". */
export const SENSOR_NO_BAND_FILL = '#000000'

/** Fill for a neutral marker (a city that rates areas, not stations): a light neutral grey-white. */
export const SENSOR_NEUTRAL_FILL = '#f4f4f5'

/** Hit area in px (see Accessibility in the header). */
export const TOUCH_TARGET = 44

/** Drawn size of the shape in px. */
const SHAPE_SIZE = 15

/** Radius in px of the selected-state ring (decision B6), in the marker's own units. */
const SELECTED_RING_R = 12.5

/** Scale applied to a selected marker's drawing (decision B6). */
const SELECTED_SCALE = 1.35

/** Diameter in px the pulse ring grows to. */
const PULSE_SIZE = 30

/** What a marker's fill says (see the header). */
export type MarkerFill = 'band' | 'no-band' | 'no-index' | 'neutral' | 'stale'

/** What one marker shows. */
export type SensorMarkerStyle = {
  fill: MarkerFill
  /** The station's level colour, from the city's index; used only when `fill` is 'band'. */
  colour: string | null
  /** The accessible name. */
  label: string
}

/**
 * The marker fill for a sensor: stale beats everything; then a city with no index (plain black);
 * then band, no band, or neutral. `cityHasIndex` is the city's data (index !== null). Pure.
 */
export function markerFillFor(freshness: Freshness, ratesStations: boolean, band: number | null, cityHasIndex: boolean): MarkerFill {
  if (freshness === 'stale') return 'stale'
  if (!cityHasIndex) return 'no-index'
  if (!ratesStations) return 'neutral'
  return band === null ? 'no-band' : 'band'
}

/** The marker SVG markup. Pure. */
function markerSVG(square: boolean, style: SensorMarkerStyle): string {
  const centre = TOUCH_TARGET / 2
  const fill =
    style.fill === 'band'
      ? (style.colour ?? SENSOR_STALE_GREY)
      : style.fill === 'no-band' || style.fill === 'no-index'
        ? SENSOR_NO_BAND_FILL
        : style.fill === 'neutral'
          ? SENSOR_NEUTRAL_FILL
          : SENSOR_STALE_GREY
  const stroke = `stroke="${SENSOR_MARKER_INK}" stroke-width="${style.fill === 'neutral' ? 1.5 : 1.25}"`
  // The white hyphen inside a no-band marker (decision B2).
  const hyphen =
    style.fill === 'no-band'
      ? `<line x1="${centre - 3.5}" y1="${centre}" x2="${centre + 3.5}" y2="${centre}" stroke="${SENSOR_HOLLOW_FILL}" stroke-width="2" stroke-linecap="round" />`
      : ''
  const shape = square
    ? `<rect x="${centre - SHAPE_SIZE / 2}" y="${centre - SHAPE_SIZE / 2}" width="${SHAPE_SIZE}" height="${SHAPE_SIZE}" rx="1.5" fill="${fill}" ${stroke} />`
    : `<circle cx="${centre}" cy="${centre}" r="${SHAPE_SIZE / 2}" fill="${fill}" ${stroke} />`
  const pulses = style.fill !== 'stale'
  const pulseColour = style.fill === 'band' ? (style.colour ?? SENSOR_MARKER_INK) : SENSOR_MARKER_INK
  const ring = pulses
    ? `<circle class="bda-sensor-pulse" cx="${centre}" cy="${centre}" r="${PULSE_SIZE / 2}" fill="${pulseColour}" ${style.fill === 'band' ? '' : 'fill-opacity="0.45"'} />`
    : ''
  const css = pulses
    ? `<style>
         .bda-sensor-pulse { transform-origin: ${centre}px ${centre}px; animation: bda-sensor-pulse 2400ms ease-out infinite; }
         @keyframes bda-sensor-pulse {
           0%   { transform: scale(0.35); opacity: 0.55; }
           70%  { transform: scale(1);    opacity: 0; }
           100% { transform: scale(1);    opacity: 0; }
         }
         @media (prefers-reduced-motion: reduce) { .bda-sensor-pulse { animation: none; opacity: 0; } }
       </style>`
    : ''
  // The selected-state ring (decision B6): hidden until setMarkerSelected shows it.
  const selected = `<g class="bda-sensor-selected" style="display:none"><circle cx="${centre}" cy="${centre}" r="${SELECTED_RING_R}" fill="none" stroke="${SENSOR_HOLLOW_FILL}" stroke-width="5" /><circle cx="${centre}" cy="${centre}" r="${SELECTED_RING_R}" fill="none" stroke="${SENSOR_MARKER_INK}" stroke-width="2.5" /></g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TOUCH_TARGET}" height="${TOUCH_TARGET}" viewBox="0 0 ${TOUCH_TARGET} ${TOUCH_TARGET}" aria-hidden="true" focusable="false" style="overflow:visible;transition:transform 150ms ease-out">${css}${ring}${selected}${shape}${hyphen}</svg>`
}

/** The marker button for one sensor. Side effects: none (the caller adds it to the map). */
export function createSensorMarkerElement(sensor: CitySensor, style: SensorMarkerStyle): HTMLButtonElement {
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
  button.innerHTML = markerSVG(sensor.type === 'reference-grade', style)
  return button
}

/**
 * Show or clear a marker's selected state (decision B6): enlarge its drawing, show the dark ring,
 * raise it above its neighbours and mark it for assistive tech. Side effects: mutates the element.
 */
export function setMarkerSelected(element: HTMLElement, selected: boolean): void {
  const svg = element.querySelector('svg')
  const ring = element.querySelector<SVGGElement>('.bda-sensor-selected')
  if (svg !== null) svg.style.transform = selected ? `scale(${SELECTED_SCALE})` : ''
  if (ring !== null) ring.style.display = selected ? '' : 'none'
  element.style.zIndex = selected ? '3' : ''
  element.setAttribute('aria-pressed', selected ? 'true' : 'false')
  if (selected) element.setAttribute('data-selected', 'true')
  else element.removeAttribute('data-selected')
}

/**
 * The pin dropped where the map is tapped (spec 5.4): a neutral teardrop, anchored at its tip.
 * Decorative (the card names the place as "Where you tapped").
 */
export function createPinElement(): HTMLDivElement {
  const pin = document.createElement('div')
  pin.setAttribute('aria-hidden', 'true')
  pin.style.pointerEvents = 'none'
  pin.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36" focusable="false"><path d="M14 35C14 35 26 21.5 26 13A12 12 0 0 0 2 13C2 21.5 14 35 14 35Z" fill="${SENSOR_MARKER_INK}" stroke="${SENSOR_HOLLOW_FILL}" stroke-width="2"/><circle cx="14" cy="13" r="4.5" fill="${SENSOR_HOLLOW_FILL}"/></svg>`
  return pin
}
