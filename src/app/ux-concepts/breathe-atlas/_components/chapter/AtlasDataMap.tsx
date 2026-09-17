/**
 * AtlasDataMap.tsx — the data map for a city that shares data (brief 6.1, 6.2).
 *
 * Purpose
 *   The chapter's hero for the six data cities: a grey Mapbox map fitted to the city's sensors, a
 *   faint city boundary with everything outside it greyed back, markers that show sensor type by
 *   shape and liveness by pulse, and a card that opens beside a tapped sensor.
 *
 *   Built from the patterns in src/app/direction-2-live-data/MapComponent.tsx (read, copied where
 *   useful, never edited there): the single-active-popup discipline, the React-root lifecycle with
 *   its double-unmount guard, the marker-sync effect that clears before it places, and Escape to
 *   close. What is NOT carried over: the probe, the dash-line overlay, the parameter switching, the
 *   stale/fresh treatment and every trace of the AQI palette. This map interprets nothing.
 *
 * Style
 *   mapbox/light-v11, with a CSS greyscale filter on the map canvas so the basemap is neutral grey
 *   like the globe on the cover, and like the chapter's greyscale photographs. The filter is on the
 *   CANVAS only: markers are separate DOM elements, so a city's index colours survive it intact.
 *
 * Keeping the card inside the map (brief 6.2)
 *   Mapbox picks which side of a marker a popup opens on from the popup's measured size, and it
 *   only ever flips between above and below. Measured: a six-pollutant card (253px) beside a
 *   marker in the middle of a 458px map fits neither way, and Mapbox hung it 54px below the map's
 *   bottom edge. So the anchor is decided here instead, from the marker's pixel position and the
 *   card's height, and it can put the card to the SIDE of a marker when there is no room above or
 *   below. The card is also capped at the map's own height (see AtlasSensorCard).
 *
 * Page scroll (brief: the wheel must not hijack the page)
 *   `cooperativeGestures: true`. Mapbox then requires ctrl (or cmd) with the wheel to zoom, and two
 *   fingers to pan, so a one-finger vertical swipe on a phone scrolls the page past the map. Mapbox
 *   shows its own "use ctrl + scroll" hint when a plain wheel reaches the map, which is the honest
 *   affordance and one we do not have to build or translate.
 *
 * Accessibility
 *   Markers are buttons with names that carry what shape and colour say (createSensorMarkerElement).
 *   Opening a card moves focus to its close button; closing it, with the button or with Escape,
 *   returns focus to the marker. The pulse stops under prefers-reduced-motion (in the marker SVG).
 *
 * Attribution
 *   The Mapbox attribution control stays on, and the boundary adds "(c) OpenStreetMap contributors"
 *   to it wherever an outline is drawn (ODbL, see ../../_data/boundaries.ts).
 *
 * Key exports: AtlasDataMap (named)
 * External dependencies: react, react-dom/client, mapbox-gl (+ its css), ./atlas-markers,
 *   ./AtlasSensorCard, ./AtlasMapLegend, ../../_data/sensors (AtlasSensor), ../../_data/indexes
 *   (CityAirQualityIndex, indexLevel, levelDisplayName), ../../_data/boundaries (CityBoundary,
 *   BOUNDARY_ATTRIBUTION), ../../_data/chapters (ChapterLink type), ../../_data/cities (AtlasCity).
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import mapboxgl from 'mapbox-gl'
import { AtlasMapLegend } from './AtlasMapLegend'
import { AtlasSensorCard } from './AtlasSensorCard'
import {
  createSensorMarkerElement,
  SENSOR_TIER_BLACK,
  SENSOR_TIER_STILL_GREY,
} from './atlas-markers'
import { indexLevel, levelDisplayName } from '../../_data/indexes'
import type { CityAirQualityIndex } from '../../_data/indexes'
import { BOUNDARY_ATTRIBUTION } from '../../_data/boundaries'
import type { CityBoundary } from '../../_data/boundaries'
import type { AtlasSensor } from '../../_data/sensors'
import type { ChapterLink } from '../../_data/chapters'

import 'mapbox-gl/dist/mapbox-gl.css'

/** Public Mapbox token, from .env.local. Never hardcoded. */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

/** Grey basemap, the same style the other prototype maps use. */
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

/** Ids for the boundary source and its two layers. */
const MASK_SOURCE = 'atlas-city-boundary'
const MASK_LAYER = 'atlas-city-mask'
const OUTLINE_LAYER = 'atlas-city-outline'

/**
 * The veil over everything outside the boundary, and the boundary line itself. Documented literals,
 * the same named exception as the marker constants (see ./atlas-markers.ts): a Mapbox paint value
 * is read by WebGL, which cannot resolve a CSS custom property. Both are neutral map chrome, and
 * neither says anything about air quality.
 */
const MASK_COLOUR = '#f5f5f4'
const OUTLINE_COLOUR = '#44403c'

/**
 * The card's height in pixels, needed to choose a side before the card is rendered.
 *
 * CALIBRATED, not guessed: measured in the browser at 227px for one row of readings, 251px for two
 * and 275px for three (a six-pollutant reference-grade station), which is 203px of header, live
 * line, sensor type, source link and padding, plus 24px a row. A first estimate derived from the
 * layout by eye was 50px short, and cards then hung up to 39px outside the map. Re-measure if the
 * card's layout changes. Overestimating is safe: it only makes the anchor more cautious.
 */
function estimateCardHeight(sensor: AtlasSensor): number {
  const readingRows = Math.ceil(sensor.readings.length / 2)
  return 203 + readingRows * 24
}

/**
 * Which side of the marker the card opens on. Above when it fits above, below when it fits below,
 * and otherwise to the side with more room, where Mapbox centres it on the marker vertically. The
 * anchor names are Mapbox's: 'bottom' puts the card ABOVE the point, 'right' puts it to the LEFT.
 */
function cardAnchor(point: mapboxgl.Point, size: { width: number; height: number }, cardHeight: number): mapboxgl.Anchor {
  const margin = 20
  if (point.y - cardHeight - margin >= 0) return 'bottom'
  if (point.y + cardHeight + margin <= size.height) return 'top'
  return point.x > size.width / 2 ? 'right' : 'left'
}

/** Props for AtlasDataMap. */
type AtlasDataMapProps = {
  /** Route slug, for marker ids and the map's accessible name. */
  citySlug: string
  /** City name, for the accessible name. */
  cityName: string
  /** The city's illustrative sharing tier: 2, 3 or 4. Never shown. */
  tier: 2 | 3 | 4
  /** The city's sensors (mock: see ../../_data/sensors.ts). */
  sensors: AtlasSensor[]
  /** The city's own index, for tier 4. Null for tiers 2 and 3. */
  index: CityAirQualityIndex | null
  /** The city's outline, or null when none could be fetched (then no boundary and no mask). */
  boundary: CityBoundary | null
  /** The bounds to open on: every sensor (brief 6.1). */
  bounds: [[number, number], [number, number]]
  /** Where the city publishes its data; every card ends with it. */
  dataSource: ChapterLink
}

/**
 * The marker colour for one sensor (brief 6.1):
 *   tier 4 — the city's own colour for that sensor's level,
 *   tier 3 — black, because readings are shared but no index is,
 *   tier 2 — dark grey and still, because only locations are shared.
 */
function markerColour(sensor: AtlasSensor, tier: 2 | 3 | 4, index: CityAirQualityIndex | null): string {
  if (tier === 2) return SENSOR_TIER_STILL_GREY
  if (tier === 3 || index === null || sensor.band === null) return SENSOR_TIER_BLACK
  return indexLevel(index, sensor.band).hex
}

/**
 * The marker's accessible name. It carries what a sighted user takes from shape and colour, because
 * neither reaches a screen reader: the sensor type always, and for a tier-4 city the level as the
 * city publishes it. No reading and no value, exactly as the marker shows none.
 */
function markerLabel(sensor: AtlasSensor, tier: 2 | 3 | 4, index: CityAirQualityIndex | null): string {
  const type = sensor.type === 'reference-grade' ? 'Reference-grade station' : 'Low-cost sensor'
  if (tier === 4 && index !== null && sensor.band !== null) {
    return `${type}, ${levelDisplayName(indexLevel(index, sensor.band))}. Open sensor details.`
  }
  return `${type}. Open sensor details.`
}

/**
 * The mask geometry: one polygon whose outer ring is the whole world and whose holes are the city's
 * rings, so a single fill layer greys everything outside the city. Mapbox treats every ring after
 * the first as a hole, whichever way it winds.
 */
function maskFeature(boundary: CityBoundary): GeoJSON.Feature<GeoJSON.Polygon> {
  const world: Array<[number, number]> = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ]
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [world, ...boundary.rings] },
  }
}

/** The city outline on its own, for the faint boundary line. */
function outlineFeature(boundary: CityBoundary): GeoJSON.Feature<GeoJSON.MultiLineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiLineString', coordinates: boundary.rings },
  }
}

/** The data map. Client component: Mapbox needs the browser. */
export function AtlasDataMap({
  citySlug,
  cityName,
  tier,
  sensors,
  index,
  boundary,
  bounds,
  dataSource,
}: AtlasDataMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const popupRootRef = useRef<ReactDOM.Root | null>(null)
  const rootUnmountedRef = useRef<boolean>(true)
  // The marker that opened the current card, so focus can go back to it on close.
  const openerRef = useRef<HTMLElement | null>(null)

  /**
   * Close the open card and unmount its React root. The unmount is deferred and guarded, because
   * this runs both from the card's own close button and from the popup's 'close' event, and React
   * must not be unmounted twice or during a render (the direction-2 pattern).
   */
  const closeCard = useCallback((restoreFocus: boolean): void => {
    if (popupRef.current !== null) {
      popupRef.current.remove()
      popupRef.current = null
    }
    const root = popupRootRef.current
    if (root !== null && !rootUnmountedRef.current) {
      rootUnmountedRef.current = true
      popupRootRef.current = null
      setTimeout(() => {
        root.unmount()
      }, 0)
    }
    if (restoreFocus && openerRef.current !== null) {
      openerRef.current.focus()
    }
    openerRef.current = null
  }, [])

  /** Open the card for one sensor, beside its marker. One card at a time. */
  const openCard = useCallback(
    (sensor: AtlasSensor, opener: HTMLElement): void => {
      const map = mapRef.current
      if (map === null) return
      closeCard(false)

      const size = { width: map.getContainer().clientWidth, height: map.getContainer().clientHeight }
      const container = document.createElement('div')
      const root = ReactDOM.createRoot(container)
      root.render(
        <AtlasSensorCard
          sensor={sensor}
          tier={tier}
          index={index}
          dataSource={dataSource}
          maxHeight={size.height - 16}
          onClose={() => {
            closeCard(true)
          }}
        />,
      )

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        maxWidth: 'none',
        offset: 16,
        className: 'atlas-sensor-popup',
        // Decided here, not by Mapbox: see "Keeping the card inside the map" above.
        anchor: cardAnchor(map.project(sensor.lngLat), size, estimateCardHeight(sensor)),
        // The card focuses its own close button; letting Mapbox focus the container first would
        // take focus twice and break the return-to-marker step.
        focusAfterOpen: false,
      })
        .setLngLat(sensor.lngLat)
        .setDOMContent(container)
        .addTo(map)

      popup.on('close', () => {
        // Reached when the map is clicked (closeOnClick) as well as from closeCard.
        const openRoot = popupRootRef.current
        if (openRoot !== null && !rootUnmountedRef.current) {
          rootUnmountedRef.current = true
          popupRootRef.current = null
          setTimeout(() => {
            openRoot.unmount()
          }, 0)
        }
      })

      popupRef.current = popup
      popupRootRef.current = root
      rootUnmountedRef.current = false
      openerRef.current = opener

      // Then pan whatever is still outside into view. The anchor above gets the card on a side
      // where it has room vertically, but on a phone the map is only 375px wide and a 252px card
      // beside a marker near the middle still hangs over the edge (measured: 80px outside the
      // viewport). Panning by exactly the overflow moves the marker, and with it the card, fully
      // inside: the behaviour a map reader expects, and it needs no card of a second size.
      requestAnimationFrame(() => {
        if (popupRef.current !== popup) return
        const element = popup.getElement()
        if (element === undefined) return
        const mapRect = map.getContainer().getBoundingClientRect()
        const cardRect = element.getBoundingClientRect()
        const margin = 10
        const overflowLeft = mapRect.left + margin - cardRect.left
        const overflowRight = cardRect.right - (mapRect.right - margin)
        const overflowTop = mapRect.top + margin - cardRect.top
        const overflowBottom = cardRect.bottom - (mapRect.bottom - margin)
        // A positive panBy x moves the view east, which moves the card west, so the sign is the
        // reverse of the overflow being corrected.
        const x = overflowLeft > 0 ? -overflowLeft : overflowRight > 0 ? overflowRight : 0
        const y = overflowTop > 0 ? -overflowTop : overflowBottom > 0 ? overflowBottom : 0
        if (x !== 0 || y !== 0) {
          map.panBy([x, y], { duration: 200 })
        }
      })

    },
    [closeCard, dataSource, index, tier],
  )

  // ── Map initialisation, once ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (container === null || MAPBOX_TOKEN === undefined || MAPBOX_TOKEN.length === 0) {
      return
    }
    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container,
      style: MAP_STYLE,
      // Opens fitted to every one of the city's sensors (brief 6.1).
      bounds,
      fitBoundsOptions: { padding: 56, maxZoom: 13 },
      maxZoom: 14,
      // A flat grey map, like the globe: no tilt, no rotation.
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: false,
      // Ctrl/cmd with the wheel to zoom, two fingers to pan: the page keeps its scroll.
      cooperativeGestures: true,
    })
    mapRef.current = map
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: boundary === null ? undefined : BOUNDARY_ATTRIBUTION,
      }),
      'bottom-right',
    )
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    map.on('load', () => {
      // Fit again now that the style is ready. The constructor fits against whatever size the
      // container had at that moment, and this one is a flex child inside a fixed-height band, so
      // it is still growing: without this the map opens far too wide (measured, not assumed).
      map.resize()
      map.fitBounds(bounds, { padding: 56, maxZoom: 13, duration: 0 })

      // The boundary line, with everything outside it greyed back. Skipped entirely when no
      // outline could be fetched for the city: no mask is better than a wrong one.
      if (boundary !== null && map.getSource(MASK_SOURCE) === undefined) {
        map.addSource(MASK_SOURCE, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [maskFeature(boundary), outlineFeature(boundary)] },
        })
        map.addLayer({
          id: MASK_LAYER,
          type: 'fill',
          source: MASK_SOURCE,
          filter: ['==', ['geometry-type'], 'Polygon'],
          paint: { 'fill-color': MASK_COLOUR, 'fill-opacity': 0.72 },
        })
        map.addLayer({
          id: OUTLINE_LAYER,
          type: 'line',
          source: MASK_SOURCE,
          filter: ['==', ['geometry-type'], 'MultiLineString'],
          paint: { 'line-color': OUTLINE_COLOUR, 'line-width': 1, 'line-opacity': 0.5 },
        })
      }

      // Markers: cleared before they are placed, so a re-run can never leave two sets behind.
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      // Placement ORDER is the stacking order: a marker placed later sits above its neighbours and
      // wins a click where two 44px hit areas overlap, which they do at this density. The sensors
      // reading above the index's best level go last, so the one moderate and one sensitive-groups
      // marker in a city are always the ones a tap on them actually opens. (Measured: before this,
      // clicking the yellow marker in Bogotá opened the green sensor drawn over it.)
      const placementOrder = [...sensors].sort((first, second) => (first.band ?? 1) - (second.band ?? 1))
      placementOrder.forEach((sensor) => {
        const element = createSensorMarkerElement(sensor, {
          colour: markerColour(sensor, tier, index),
          pulses: tier !== 2,
          label: markerLabel(sensor, tier, index),
        })
        element.addEventListener('click', (event) => {
          // Without this the map's own click handler would close the card as it opens.
          event.stopPropagation()
          openCard(sensor, element)
        })
        const marker = new mapboxgl.Marker({ element, anchor: 'center' }).setLngLat(sensor.lngLat).addTo(map)
        markersRef.current.push(marker)
      })
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      closeCard(false)
      map.remove()
      mapRef.current = null
    }
    // The map is built once. Its inputs (one city's sensors, index and boundary) are fixed for the
    // life of the page: a chapter route is one city, pre-rendered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Escape closes the card ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && popupRef.current !== null) {
        closeCard(true)
      }
    }
    // Side effect: a document-level listener, removed on unmount.
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [closeCard])

  const hasLowCost = sensors.some((sensor) => sensor.type === 'low-cost')
  const hasReferenceGrade = sensors.some((sensor) => sensor.type === 'reference-grade')

  return (
    <div className="flex h-full w-full flex-col border-y border-border bg-muted" data-city={citySlug}>
      {/* Scoped chrome: the popup's own panel replaces Mapbox's, and the basemap is greyed to match
          the globe. Rendered as part of the component, so it leaves with it. */}
      <style>{`
        .atlas-sensor-popup .mapboxgl-popup-content {
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
          border-radius: 0;
        }
        .atlas-sensor-popup .mapboxgl-popup-tip { display: none; }
        .atlas-data-map .mapboxgl-canvas { filter: grayscale(1); }
      `}</style>
      <div
        ref={containerRef}
        className="atlas-data-map relative min-h-0 w-full flex-1"
        role="region"
        aria-label={`Map of air quality sensors in ${cityName}`}
      />
      <AtlasMapLegend index={index} hasLowCost={hasLowCost} hasReferenceGrade={hasReferenceGrade} />
    </div>
  )
}
