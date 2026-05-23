/**
 * markers.ts — Live-data station marker construction (three-channel encoding)
 *
 * Purpose:
 *   Builds the detached DOM/SVG element for a single Station marker on the live-data map.
 *   Ported and generalised from the validated spike (spike/marker-density:src/app/spike-density/
 *   markers.ts), which proved design-director's locked three-channel treatment at real London
 *   density. The spike was PM2.5-hardcoded; this version is parameter-aware via aqiParameters.ts.
 *
 *   Three channels (design-owned — NOT redesigned here, see brief "Marker treatment"):
 *     - Hue   = AQI value     (active parameter -> EPA tier -> BC AQI indicator token)
 *     - Shape = quality        (high -> triangle, low -> circle)
 *     - Fill  = freshness       (fresh -> SOLID full hue + white border + drop shadow;
 *                                stale -> HOLLOW outline only, muted steel, AQI hue drained,
 *                                with a dark under-stroke so the outline survives on dark-v11)
 *   Fresh markers are sized a hair larger + (caller z-boosts) so the few live readings win
 *   attention against the many stale ghosts (the dominant London case).
 *
 * Key exports: createStationMarkerElement
 *
 * External dependencies:
 *   - ../../lib/openaq/types (Station type only — read-only, never modified)
 *   - ./aqiParameters (classifyAqi + runtime token resolution; the single AQI source)
 *
 * Token discipline (brief): colours are NOT inlined as hex. The AQI hue and the stale steel are
 *   read at runtime from the BC tokens via aqiParameters.resolveTierColor / resolveMutedColor
 *   (getComputedStyle off :root). White border + dark halo are structural marker chrome (not
 *   AQI semantics), kept as literals as in the spike. If a token cannot be resolved (SSR /
 *   pre-apply), the helpers return '' and we fall back to the muted token / a neutral grey —
 *   never an arbitrary AQI hex.
 */

import type { Station } from '../../lib/openaq/types'
import {
  classifyAqi,
  formatReading,
  resolveMutedColor,
  resolveTierColor,
  type ParameterKey,
} from './aqiParameters'

/** White marker border for fresh/solid markers (confident, live). Structural chrome, not AQI. */
const WHITE = '#ffffff'

/** Dark under-stroke colour for hollow markers, so the steel outline survives on the dark map. */
const HALO_DARK = 'rgba(0,0,0,0.55)'

/** Last-resort neutral if even the muted token cannot be resolved (SSR/pre-apply only). */
const NEUTRAL_FALLBACK = 'rgba(178,194,213,0.9)'

/**
 * Resolve the marker fill hue for a fresh reading: the active parameter's AQI tier colour,
 * read live from the BC indicator token. Falls back to the muted token if the tier colour
 * cannot be read (never an inlined AQI hex).
 */
function freshHueFor(value: number, parameter: ParameterKey): string {
  const tier = classifyAqi(value, parameter)
  const hue = resolveTierColor(tier, 'indicator')
  if (hue.length > 0) {
    return hue
  }
  // Token not yet resolvable — fall back to muted (then neutral), never an arbitrary AQI hex.
  const muted = resolveMutedColor()
  return muted.length > 0 ? muted : NEUTRAL_FALLBACK
}

/** Resolve the muted steel used for stale markers, with a neutral last-resort fallback. */
function staleSteel(): string {
  const muted = resolveMutedColor()
  return muted.length > 0 ? muted : NEUTRAL_FALLBACK
}

/**
 * Triangle SVG (high quality). `fresh` switches between a solid AQI-filled triangle with a
 * white border, and a hollow steel-outlined triangle (no fill). The hollow variant carries a
 * darker under-stroke (drawn first, slightly fatter) so the light steel outline survives
 * against the dark-v11 basemap — design-director's "is a small hollow triangle still a
 * triangle?" legibility hedge, validated in the spike.
 */
function triangleSVG(size: number, fresh: boolean, hue: string): string {
  const half = size / 2
  const pts = `${half},2 ${size - 2},${size - 2} 2,${size - 2}`
  if (fresh) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <polygon points="${pts}" fill="${hue}" stroke="${WHITE}" stroke-width="1.5"
        style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.45))"/>
    </svg>`
  }
  // Hollow: dark halo stroke under a steel outline, no fill (AQI hue drained).
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <polygon points="${pts}" fill="none" stroke="${HALO_DARK}" stroke-width="3.5" stroke-linejoin="round"/>
    <polygon points="${pts}" fill="none" stroke="${hue}" stroke-width="2" stroke-linejoin="round"/>
  </svg>`
}

/**
 * Circle SVG (low quality). Same solid/hollow logic as the triangle. The hollow circle is the
 * smallest element in the set so it gets the same dark-halo + steel-outline pairing to stay
 * legible as an outline-only ring on the dark basemap.
 */
function circleSVG(size: number, fresh: boolean, hue: string): string {
  const r = size / 2 - 2
  const c = size / 2
  if (fresh) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${c}" cy="${c}" r="${r}" fill="${hue}" stroke="${WHITE}" stroke-width="2"
        style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.45))"/>
    </svg>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${HALO_DARK}" stroke-width="3.5"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${hue}" stroke-width="2"/>
  </svg>`
}

/**
 * Build the DOM element for one station marker for the active parameter. Reads the parameter
 * reading off the station, derives the three channels (hue from AQI tier, shape from quality,
 * fill from freshness), and returns a detached <div> wrapping the right SVG. Fresh markers are
 * sized larger (triangle 24 / circle 16) than stale (22 / 14) so the few live readings stand
 * out against the many stale ones.
 *
 * Guards (brief / prototype-build-standard item 1):
 *   - A station may lack the requested parameter reading (defensive — fetchStations should not
 *     produce one, but the projection must not assume it): render a tiny neutral dot, never throw.
 *   - The hollow (stale) path uses the muted steel for BOTH the outline hue and is fed by
 *     staleSteel(); the fresh path uses the AQI tier hue. Stale markers therefore never carry an
 *     AQI hue (it is "drained"), matching the locked treatment.
 *
 * Side effects: creates a detached DOM element and sets a hover `title`. No DOM insertion here —
 * the caller attaches it via mapboxgl.Marker.
 */
export function createStationMarkerElement(
  station: Station,
  parameter: ParameterKey,
): HTMLElement {
  const reading = station.parameters[parameter]
  const el = document.createElement('div')
  el.style.cursor = 'pointer'

  // Defensive: no reading for this parameter -> tiny neutral dot rather than throwing.
  if (reading === undefined) {
    el.style.width = '8px'
    el.style.height = '8px'
    el.style.borderRadius = '50%'
    el.style.background = NEUTRAL_FALLBACK
    el.style.opacity = '0.4'
    return el
  }

  const fresh = !reading.isStale
  // Fresh markers carry the AQI hue; stale markers drain it to muted steel (design-owned).
  const hue = fresh ? freshHueFor(reading.value, parameter) : staleSteel()
  const isTriangle = station.quality === 'high'
  const size = isTriangle ? (fresh ? 24 : 22) : fresh ? 16 : 14

  el.style.width = `${size}px`
  el.style.height = `${size}px`
  // Side effect: sets the hover title. The reading is rounded for display at the parameter's
  // precision (formatReading); the underlying station data stays at full precision.
  el.setAttribute(
    'title',
    `${station.name} — ${formatReading(reading.value, parameter)} ${reading.unit} · ${station.quality} · ${fresh ? 'live' : 'stale'}`,
  )
  el.innerHTML = isTriangle ? triangleSVG(size, fresh, hue) : circleSVG(size, fresh, hue)
  return el
}
