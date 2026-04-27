/**
 * MapComponent.tsx — Mapbox GL JS map with PM2.5 sensor markers, probe mode, and triangulation
 *
 * Responsibilities:
 * - Initialises a Mapbox GL JS map centred on Vienna
 * - Renders sensor markers as custom HTML elements (triangles for high
 *   quality, circles for low quality) via mapboxgl.Marker
 * - Three mutually exclusive interaction modes:
 *     default  — normal pan/zoom, no triangulation on click
 *     probe    — map click drops a probe pin and triggers triangulation
 *     annotate — AnnotationLayer capture overlay handles clicks
 * - Probe pin: custom SVG location-pin-with-signal-waves, coloured by AQI result
 * - Dash lines: SVG overlay drawing animated lines from 3 sensors to the probe pin
 * - TriangulationPopup rendered inside a Mapbox popup anchored to the probe pin
 * - Escape key clears any active probe and returns to default mode
 * - Exposes mapRef so parent can pass it to the AnnotationLayer MapAdapter
 * - Cleans up all markers, lines, popups, and event listeners on unmount
 *
 * Key exports: MapComponent (default export), MapHandle, MapMode
 * External dependencies: mapbox-gl, TriangulationPopup, triangulate, SENSORS
 *
 * Ported from: design/prototypes/air-quality-map/src/components/Map.tsx
 * Changes from prototype:
 *   - Added 'use client' directive (required for Next.js App Router)
 *   - Replaced import.meta.env.VITE_MAPBOX_TOKEN with process.env.NEXT_PUBLIC_MAPBOX_TOKEN
 *   - Renamed export from Map to MapComponent (avoids conflict with global Map type)
 *   - Updated import paths to co-located files
 */

'use client'

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from 'react'
import mapboxgl from 'mapbox-gl'
import ReactDOM from 'react-dom/client'
import { SENSORS } from './sensors'
import type { Sensor } from './sensors'
import { triangulate } from './triangulation'
import { getAQICategory } from './aqi'
import { TriangulationPopup } from './TriangulationPopup'

import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox token loaded from Next.js environment variable.
// The NEXT_PUBLIC_ prefix makes it available on the client bundle.
// Token value must be set in .env.local (already present in target repo).
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

/** Vienna geographic centre */
const VIENNA_CENTER: [number, number] = [16.3738, 48.2082]

/**
 * The three mutually exclusive interaction modes for the map.
 * - default: normal pan/zoom, no triangulation
 * - probe: next map click drops a probe pin and triangulates
 * - annotate: AnnotationLayer capture overlay is active
 */
export type MapMode = 'default' | 'probe' | 'annotate'

/**
 * Public handle exposed to parent via forwardRef.
 * App uses this to pass the map instance to the AnnotationLayer MapAdapter
 * and to clear any open probe when annotation mode is entered.
 */
export type MapHandle = {
  getMap: () => mapboxgl.Map | null
  /** Programmatically clear any active probe pin, lines, and popup */
  clearPopup: () => void
}

type Props = {
  /** Current interaction mode — controls what a map click does */
  mapMode: MapMode
  /** Called by the Escape key handler and popup close to return to default */
  onExitProbe: () => void
}

/**
 * Creates an SVG triangle string for a high-quality sensor marker.
 * Colour and size are parameterised to allow hover state variation.
 */
function makeTriangleSVG(size: number, color: string): string {
  const half = size / 2
  // Equilateral triangle pointing upward, centred in the viewBox
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <polygon points="${half},2 ${size - 2},${size - 2} 2,${size - 2}" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
  </svg>`
}

/**
 * Creates an HTML element for a sensor marker.
 * High quality → filled triangle SVG; Low quality → filled circle div.
 * Includes a title attribute for hover tooltip showing sensor name + PM2.5.
 */
function createMarkerElement(sensor: Sensor): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('title', `${sensor.name}: ${sensor.pm25} µg/m³`)
  el.style.cursor = 'pointer'

  const aqiColor = getAQICategory(sensor.pm25).color

  if (sensor.quality === 'high') {
    // High quality: triangular marker, 22px, AQI-coloured
    el.style.width = '22px'
    el.style.height = '22px'
    el.innerHTML = makeTriangleSVG(22, aqiColor)
  } else {
    // Low quality: circular marker, 14px, AQI-coloured
    el.style.width = '14px'
    el.style.height = '14px'
    el.style.borderRadius = '50%'
    el.style.background = aqiColor
    el.style.border = '2px solid #ffffff'
    el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.25)'
  }

  return el
}

/**
 * Creates the probe pin SVG element — a location-pin shape with
 * three radiating wave arcs on the right side to suggest signal/live data.
 * The pin body and waves are coloured by the AQI result colour.
 */
function createProbePinElement(aqiColor: string): HTMLElement {
  const el = document.createElement('div')
  el.style.width = '36px'
  el.style.height = '48px'
  el.style.cursor = 'default'
  el.style.filter = 'drop-shadow(0 3px 8px rgba(0,0,0,0.45))'

  // SVG: teardrop pin body (32×44 viewBox) with 3 signal-wave arcs
  // The pin tapers to a point at the bottom; the circle window in the
  // body is white so the map colour shows through as a contrast element.
  el.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <!-- Pin teardrop body -->
      <path
        d="M18 2 C9 2, 2 9, 2 18 C2 27, 18 46, 18 46 C18 46, 34 27, 34 18 C34 9, 27 2, 18 2 Z"
        fill="${aqiColor}"
        stroke="#ffffff"
        stroke-width="2"
      />
      <!-- Inner white circle window -->
      <circle cx="18" cy="17" r="7" fill="rgba(255,255,255,0.9)" />
      <!-- Signal wave arcs — 3 concentric arcs radiating from centre-right -->
      <path d="M22 13 Q28 17 22 21" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
      <path d="M24 11 Q33 17 24 23" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M26 9  Q36 17 26 25" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>
    </svg>
  `

  return el
}

/**
 * Projects a Mapbox [lng, lat] coordinate to pixel [x, y] on the map canvas.
 * Used to position SVG line endpoints for the dash-line overlay.
 */
function lngLatToPixel(
  map: mapboxgl.Map,
  lngLat: [number, number],
): { x: number; y: number } {
  const point = map.project(new mapboxgl.LngLat(lngLat[0], lngLat[1]))
  return { x: point.x, y: point.y }
}

// ── SVG dash-line overlay ──────────────────────────────────────────────────────
//
// Rather than using Mapbox GL layer sources (which require GeoJSON setup and
// re-render on every move), the dash lines are drawn on a fixed-position SVG
// overlay that sits above the map canvas. The SVG covers the full map container.
//
// On map move/zoom, the lines are redrawn by re-projecting the stored coordinates
// to the new pixel positions. This keeps the lines locked to their geographic
// positions without needing to hook into the Mapbox source/layer system.

/**
 * Creates or reuses the SVG overlay element inside the map container.
 * The SVG is fixed over the map and ignores pointer events.
 */
function getOrCreateSVGOverlay(container: HTMLElement): SVGSVGElement {
  let svg = container.querySelector<SVGSVGElement>('[data-probe-lines]')
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('data-probe-lines', 'true')
    svg.style.position = 'absolute'
    svg.style.top = '0'
    svg.style.left = '0'
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.pointerEvents = 'none'
    svg.style.zIndex = '5'
    container.appendChild(svg)
  }
  return svg
}

/**
 * Removes the SVG overlay from the container if it exists.
 * Called when the probe is dismissed.
 */
function removeSVGOverlay(container: HTMLElement): void {
  const svg = container.querySelector('[data-probe-lines]')
  if (svg) svg.remove()
}

/**
 * Removes the probe keyframes <style> element from document.head.
 * Must be called from clearProbe() to avoid accumulating stale @keyframes
 * definitions across multiple probe activations.
 *
 * Why document.head not SVG: @keyframes injected inside an SVG <style> element
 * are scoped to the SVG document fragment and cannot be referenced by HTML-side
 * CSS animation properties. Injecting into document.head makes the keyframes
 * available to all elements in the main document.
 */
function removeProbeKeyframes(): void {
  const existing = document.getElementById('probe-keyframes')
  if (existing) existing.remove()
}

/**
 * Draws (or redraws) the three animated dash lines from sensor positions
 * to the probe pin position on the SVG overlay.
 *
 * On initial draw (isRedraw = false), each line animates in with a staggered
 * draw-in effect using stroke-dashoffset animation. On subsequent redraws
 * (triggered by map pan/zoom), lines are updated in place without re-animating.
 *
 * Why SVG stroke-dashoffset for draw-in: animating dashoffset from
 * stroke-dasharray length → 0 makes the line appear to draw itself from
 * start to finish. After draw-in, a separate travel animation cycles the
 * offset to create a flowing dash effect.
 */
function drawDashLines(
  map: mapboxgl.Map,
  container: HTMLElement,
  sensors: Sensor[],
  probeLngLat: [number, number],
  lineColor: string,
  isRedraw: boolean,
): void {
  const svg = getOrCreateSVGOverlay(container)

  // Clear existing lines before redrawing
  while (svg.firstChild) svg.removeChild(svg.firstChild)

  const probePixel = lngLatToPixel(map, probeLngLat)

  sensors.slice(0, 3).forEach((sensor, index) => {
    const sensorPixel = lngLatToPixel(map, sensor.coordinates)

    // Calculate the pixel distance to set dasharray length appropriately
    const dx = probePixel.x - sensorPixel.x
    const dy = probePixel.y - sensorPixel.y
    const lineLength = Math.sqrt(dx * dx + dy * dy)

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', String(sensorPixel.x))
    line.setAttribute('y1', String(sensorPixel.y))
    line.setAttribute('x2', String(probePixel.x))
    line.setAttribute('y2', String(probePixel.y))
    line.setAttribute('stroke', lineColor)
    line.setAttribute('stroke-width', '1.5')
    line.setAttribute('stroke-opacity', '0.7')

    if (!isRedraw) {
      // ── Draw-in phase ──────────────────────────────────────────────────────
      // Dash pattern: the full line length as both dash and gap creates a
      // solid dashed appearance that starts fully hidden (dashoffset = length).
      // Animating dashoffset to 0 draws the line in from sensor → probe.
      //
      // After draw-in completes, a travel animation takes over on the same
      // element to suggest flowing data. The travel animation uses a short
      // repeating dash (8px dash, 8px gap) cycling offset to create movement.
      //
      // Both animations are expressed as CSS animations to avoid JS animation
      // loops. The transition from draw-in to travel is managed by chaining
      // animation-delay on the travel animation to start after draw-in ends.
      const drawDuration = 0.7 // seconds per line
      const staggerDelay = index * 0.15 // seconds between each line start

      // Draw-in: solid line appearing from sensor to probe
      line.style.strokeDasharray = `${lineLength}`
      line.style.strokeDashoffset = `${lineLength}`

      // Apply draw-in animation, staggered per line
      line.style.animation = `
        draw-in-${index} ${drawDuration}s ease-out ${staggerDelay}s forwards,
        dash-travel-${index} 1.8s linear ${staggerDelay + drawDuration}s infinite
      `
    } else {
      // ── Redraw (pan/zoom) — skip draw-in, apply travel animation only ──────
      // Lines are already established; just keep them visible with travel effect.
      line.style.strokeDasharray = '8 8'
      line.style.strokeDashoffset = '0'
      line.style.animation = `dash-travel-redraw 1.8s linear ${index * 0.1}s infinite`
    }

    svg.appendChild(line)
  })

  // ── Inject @keyframes into document.head ────────────────────────────────────
  // Why document.head, not SVG <style>: @keyframes inside an SVG <style> element
  // are scoped to the SVG document fragment and are unreachable by HTML-side CSS
  // animation references. Injecting a single <style id="probe-keyframes"> into
  // document.head makes all animation definitions available to the main document.
  // We replace (not append) the element on each new probe so stale keyframes
  // from previous probe positions do not accumulate.
  if (!isRedraw) {
    const existing = document.getElementById('probe-keyframes')
    if (existing) existing.remove()

    const headStyle = document.createElement('style')
    headStyle.id = 'probe-keyframes'
    headStyle.textContent = sensors.slice(0, 3).map((sensor, index) => {
      const sensorPixel = lngLatToPixel(map, sensor.coordinates)
      const probePixel = lngLatToPixel(map, probeLngLat)
      const dx = probePixel.x - sensorPixel.x
      const dy = probePixel.y - sensorPixel.y
      const lineLength = Math.sqrt(dx * dx + dy * dy)
      return `
        @keyframes draw-in-${index} {
          from { stroke-dasharray: ${lineLength}; stroke-dashoffset: ${lineLength}; }
          to   { stroke-dasharray: ${lineLength}; stroke-dashoffset: 0; }
        }
        @keyframes dash-travel-${index} {
          from { stroke-dasharray: 8 8; stroke-dashoffset: 16; }
          to   { stroke-dasharray: 8 8; stroke-dashoffset: 0; }
        }
      `
    }).join('')
    // Side effect: injects a <style id="probe-keyframes"> tag into document.head
    document.head.appendChild(headStyle)
  } else {
    // Shared travel keyframes for redraw case — injected into document.head
    const existing = document.getElementById('probe-keyframes')
    if (!existing) {
      const headStyle = document.createElement('style')
      headStyle.id = 'probe-keyframes'
      headStyle.textContent = `
        @keyframes dash-travel-redraw {
          from { stroke-dashoffset: 16; }
          to   { stroke-dashoffset: 0; }
        }
      `
      // Side effect: injects a <style id="probe-keyframes"> tag into document.head
      document.head.appendChild(headStyle)
    }
  }
}

export const MapComponent = forwardRef<MapHandle, Props>(function MapComponent(
  { mapMode, onExitProbe },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  // Track all placed sensor markers for cleanup on unmount
  const markersRef = useRef<mapboxgl.Marker[]>([])
  // Single active triangulation popup — only one open at a time
  const activePopupRef = useRef<mapboxgl.Popup | null>(null)
  // React root for the popup's React content — needed for proper cleanup
  const popupRootRef = useRef<ReactDOM.Root | null>(null)
  // Container div that hosts the React popup content inside mapboxgl.Popup
  const popupContainerRef = useRef<HTMLDivElement | null>(null)
  // The Mapbox marker for the probe pin — removed when probe is cleared
  const probePinMarkerRef = useRef<mapboxgl.Marker | null>(null)
  // Store the last probe position and sensors so dash lines can be redrawn on map move
  const probeStateRef = useRef<{
    lngLat: [number, number]
    sensors: Sensor[]
    lineColor: string
  } | null>(null)

  // Throttle flag for the map 'move' handler — prevents SVG redraw on every
  // animation frame during continuous pan. Only one rAF is queued at a time.
  const rafPendingRef = useRef<boolean>(false)

  // mapMode ref — used inside event handlers to read the current mode value
  // without recreating handlers on every mode change. This is the standard
  // pattern for reading mutable state inside stable callbacks.
  const mapModeRef = useRef<MapMode>(mapMode)
  const onExitProbeRef = useRef<() => void>(onExitProbe)

  // Guards a React root against double-unmount between clearProbe() setTimeout
  // and the popup 'close' event handler. Both paths check this flag before
  // calling root.unmount() and set it true after, ensuring unmount fires at most once.
  const rootUnmountedRef = useRef<boolean>(false)

  // Keep refs in sync with props on every render
  useEffect(() => {
    mapModeRef.current = mapMode
  }, [mapMode])

  useEffect(() => {
    onExitProbeRef.current = onExitProbe
  }, [onExitProbe])

  const [, forceUpdate] = useState(0)

  // ── clearProbe ───────────────────────────────────────────────────────────────
  // Removes the probe pin marker, SVG dash lines, and any open popup.
  // Does NOT call onExitProbe — callers that need to exit probe mode call that
  // separately (e.g. the close button calls both clearProbe and onExitProbe).

  const clearProbe = useCallback((): void => {
    // Remove probe pin marker
    if (probePinMarkerRef.current) {
      probePinMarkerRef.current.remove()
      probePinMarkerRef.current = null
    }

    // Remove SVG dash-line overlay
    if (containerRef.current) {
      removeSVGOverlay(containerRef.current)
    }

    // Remove probe @keyframes injected into document.head
    removeProbeKeyframes()

    // Clear probe state so the move handler doesn't redraw removed lines
    probeStateRef.current = null

    // Remove popup and unmount React root.
    // rootUnmountedRef guards against double-unmount: this setTimeout path and
    // the popup 'close' handler both try to unmount the same root. The flag
    // ensures only the first caller actually unmounts.
    if (activePopupRef.current) {
      activePopupRef.current.remove()
      activePopupRef.current = null
    }
    if (popupRootRef.current) {
      // Reset the guard flag before scheduling — the upcoming setTimeout is a
      // new unmount attempt for this root instance.
      rootUnmountedRef.current = false
      // Defer unmount — avoids React warning about unmounting during render cycle
      setTimeout(() => {
        if (!rootUnmountedRef.current) {
          rootUnmountedRef.current = true
          popupRootRef.current?.unmount()
          popupRootRef.current = null
        }
      }, 0)
    }
    popupContainerRef.current = null
  }, [])

  // ── showProbe ────────────────────────────────────────────────────────────────
  // Drops a probe pin at the clicked position, draws animated dash lines to
  // the 3 nearest sensors, and opens the triangulation popup.
  //
  // Why we manage the popup separately from the pin marker: Mapbox popups
  // and markers are independent objects. We keep both refs so both can be
  // removed cleanly on dismiss, pan-move, or Escape.

  const showProbe = useCallback(
    (lngLat: mapboxgl.LngLat): void => {
      const map = mapRef.current
      const container = containerRef.current
      if (!map || !container) return

      // Clear any existing probe first
      clearProbe()

      const clickedPoint: [number, number] = [lngLat.lng, lngLat.lat]
      // triangulate() returns null when the sensor array is empty — do nothing
      // rather than allowing NaN to flow into getAQICategory() and display
      // a false "Very Unhealthy / Hazardous" alarm.
      const result = triangulate(clickedPoint, SENSORS)
      if (result === null) return
      const aqiCategory = getAQICategory(result.averagePM25)
      const lineColor = 'rgba(255, 255, 255, 0.75)' // white reads cleanly on dark map

      // ── Drop probe pin marker ─────────────────────────────────────────────
      const pinEl = createProbePinElement(aqiCategory.color)
      const probePinMarker = new mapboxgl.Marker({
        element: pinEl,
        anchor: 'bottom', // pin tip points at the location
      })
        .setLngLat(lngLat)
        .addTo(map)
      probePinMarkerRef.current = probePinMarker

      // ── Draw animated dash lines from sensors to pin ──────────────────────
      // Store probe state so the map 'move' handler can redraw lines on pan/zoom
      probeStateRef.current = {
        lngLat: clickedPoint,
        sensors: result.nearestSensors,
        lineColor,
      }
      drawDashLines(map, container, result.nearestSensors, clickedPoint, lineColor, false)

      // ── Open triangulation popup ──────────────────────────────────────────
      // Side effect: renders a React component inside a Mapbox popup anchored
      // to the probe pin. onClose clears the probe and exits probe mode.
      const popupContainer = document.createElement('div')
      popupContainerRef.current = popupContainer

      const popup = new mapboxgl.Popup({
        closeButton: false,  // we render our own close button in React
        closeOnClick: false, // we manage close state ourselves
        maxWidth: 'none',
        offset: [0, -44], // offset upward past the pin tip (44px = pin height)
        className: 'triangulation-popup',
      })
        .setLngLat(lngLat)
        .setDOMContent(popupContainer)
        .addTo(map)

      // Side effect: creates a React root inside the Mapbox popup DOM container
      const root = ReactDOM.createRoot(popupContainer)
      root.render(
        <TriangulationPopup
          result={result}
          onClose={() => {
            clearProbe()
            onExitProbeRef.current()
          }}
        />,
      )

      activePopupRef.current = popup
      popupRootRef.current = root

      // Side effect: listen for Mapbox's own close event to clean up React root.
      // rootUnmountedRef guards against double-unmount — clearProbe()'s setTimeout
      // and this handler can both fire for the same root. Only the first one
      // that finds the flag false will call unmount().
      popup.on('close', () => {
        setTimeout(() => {
          if (!rootUnmountedRef.current) {
            rootUnmountedRef.current = true
            root.unmount()
          }
        }, 0)
      })
    },
    [clearProbe],
  )

  // ── Map initialisation ───────────────────────────────────────────────────────
  // Side effect: creates the Mapbox GL map, places sensor markers, and
  // attaches the map click handler. Runs once on mount.

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN ?? ''

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: VIENNA_CENTER,
      zoom: 11.5,
      attributionControl: false,
    })

    // Compact attribution in the bottom-right
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    mapRef.current = map

    // ── Place sensor markers after map loads ─────────────────────────────────
    // Markers are added after 'load' to ensure the map style is ready.
    // Each marker gets a click listener that shows a sensor-specific popup.

    map.on('load', () => {
      SENSORS.forEach((sensor) => {
        const el = createMarkerElement(sensor)

        // Side effect: click on a sensor marker shows a small info tooltip.
        // stopPropagation prevents the map click handler from also firing.
        // clearProbe() removes the active probe UI; onExitProbeRef.current() syncs
        // mapMode in the page back to 'default' — without this call, the page would still
        // think probe mode is active while no probe is visible (mode desync).
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          clearProbe()
          onExitProbeRef.current()

          const aqiCategory = getAQICategory(sensor.pm25)
          const container = document.createElement('div')

          // Side effect: creates a React root inside the Mapbox popup DOM container
          const root = ReactDOM.createRoot(container)
          root.render(
            <div
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.96)',
                borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                minWidth: 160,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: 4,
                  color: '#0f1117',
                }}
              >
                {sensor.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    background: aqiCategory.color,
                    color: aqiCategory.textColor,
                    borderRadius: 4,
                    padding: '1px 7px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {sensor.pm25} µg/m³
                </span>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                  {aqiCategory.label}
                </span>
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: '0.65rem',
                  color: '#6b7280',
                }}
              >
                {sensor.quality === 'high' ? 'High quality sensor' : 'Low quality sensor'}
              </div>
            </div>,
          )

          const sensorPopup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: 'none',
            offset: 8,
            className: 'sensor-popup',
          })
            .setLngLat(sensor.coordinates)
            .setDOMContent(container)
            .addTo(map)

          sensorPopup.on('close', () => {
            setTimeout(() => root.unmount(), 0)
          })

          activePopupRef.current = sensorPopup
          popupRootRef.current = root
        })

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(sensor.coordinates)
          .addTo(map)

        markersRef.current.push(marker)
      })

      // Force re-render to signal map is ready (mapRef.current is now set)
      forceUpdate((n) => n + 1)

      // Apply the crosshair here if probe mode was already active at the moment
      // the map finished loading. The cursor effect runs before 'load' fires and
      // exits early because mapRef.current is null.
      if (mapModeRef.current === 'probe') {
        map.getCanvas().style.cursor = 'crosshair'
      }
    })

    // ── Map click handler ────────────────────────────────────────────────────
    // Fires on map clicks that are NOT on a sensor marker (those stopPropagation).
    // Only acts when probe mode is active — reads mapModeRef to avoid stale closure.

    map.on('click', (e) => {
      if (mapModeRef.current === 'probe') {
        showProbe(e.lngLat)
      }
      // default and annotate modes: no action on map click
    })

    // ── Redraw dash lines on map move/zoom ────────────────────────────────────
    // When the map pans or zooms, pixel positions of sensor and probe coordinates
    // change. The SVG overlay lines must be redrawn to the new pixel positions.
    // isRedraw = true skips the draw-in animation.
    //
    // Throttled via rafPendingRef: map 'move' fires on every animation frame
    // during continuous pan. Without throttling, drawDashLines() runs ~60× per
    // second, each time clearing and reconstructing all SVG children. The rAF
    // flag collapses any burst of 'move' events into a single redraw per frame.

    map.on('move', () => {
      if (!probeStateRef.current || !containerRef.current || rafPendingRef.current) return
      rafPendingRef.current = true
      requestAnimationFrame(() => {
        rafPendingRef.current = false
        if (!probeStateRef.current || !containerRef.current) return
        const { lngLat, sensors, lineColor } = probeStateRef.current
        drawDashLines(map, containerRef.current, sensors, lngLat, lineColor, true)
      })
    })

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    // Side effect cleanup: removes all markers, the SVG overlay, popups, and
    // the map instance itself.

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      clearProbe()
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — map initialises once only

  // ── Escape key handler ────────────────────────────────────────────────────────
  // Clears any active probe and returns to default mode when Escape is pressed.
  // Side effect: attaches a keydown listener to the document.

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        // Guard: in annotate mode, Escape is handled by AnnotationLayer's own
        // keydown listener on window. Calling onExitProbeRef here would set
        // mapMode to 'default' while the map remains frozen, locking interaction.
        if (mapModeRef.current === 'annotate') return
        clearProbe()
        onExitProbeRef.current()
      }
    }
    // Side effect: attaches keydown listener to document
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      // Side effect cleanup: removes the keydown listener
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [clearProbe])

  // ── Update cursor on mode change ──────────────────────────────────────────────
  // Crosshair cursor in probe mode signals the map is clickable for probing.
  // Default cursor otherwise.

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const canvas = map.getCanvas()
    if (mapMode === 'probe') {
      canvas.style.cursor = 'crosshair'
    } else {
      canvas.style.cursor = ''
    }
  }, [mapMode])

  // ── Expose map handle to parent ───────────────────────────────────────────────
  // Parent uses getMap() to build the MapAdapter for AnnotationLayer.
  // clearPopup() is called by onEnterMode to dismiss any active probe.

  useImperativeHandle(
    ref,
    () => ({
      getMap: () => mapRef.current,
      clearPopup: clearProbe,
    }),
    [clearProbe],
  )

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      data-slot="map-container"
    />
  )
})
