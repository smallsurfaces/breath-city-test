/**
 * AtlasDataMap.tsx — the data map for a city that shares data (brief 6.1, 6.2).
 *
 * Purpose
 *   The chapter's hero for the six data cities: a grey Mapbox map fitted to the city's sensors, the
 *   city boundary with everything outside it scrimmed back so the map reads as being about the city
 *   and not the region (all six values in THE BOUNDARY MASK below), markers that show sensor type
 *   by shape and liveness by pulse, and a card that opens beside a tapped sensor.
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
 * First render, and the wireframe while it happens (bug report 2026-09-17, BUG 4)
 *   The sensors are placed synchronously, off the style's critical path, and the boundary work has
 *   four independent routes to the style with one-way latches behind them. Until the sensors are
 *   down the band shows a quiet grey wireframe with a status line, so a slow basemap never reads as
 *   a city with no sensor network. The reasoning is in the init effect, next to the code.
 *
 * Accessibility
 *   Markers are buttons with names that carry what shape and colour say (createSensorMarkerElement).
 *   The wireframe's status line is a live region, so the wait is announced rather than silent.
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

import { useCallback, useEffect, useRef, useState } from 'react'
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

/** Ids for the boundary source and its three layers, in the order they stack. */
const MASK_SOURCE = 'atlas-city-boundary'
const MASK_LAYER = 'atlas-city-mask'
const OUTLINE_HALO_LAYER = 'atlas-city-outline-halo'
const OUTLINE_LAYER = 'atlas-city-outline'

/**
 * THE BOUNDARY MASK — the six values that set how strongly the map reads as being about the CITY
 * rather than the region (brief 6.1: "a faint city boundary line. Everything outside the boundary
 * is greyed out").
 *
 * Tune here and nowhere else. Every one of these is used exactly once, in the three layers added on
 * `load` below, so changing a number here is the whole change.
 *
 * Why they moved (design-director's call, 2026-09-17, taken in Jack's absence)
 *   Two separate causes, one symptom.
 *   1. The first build veiled the outside with a NEAR-WHITE fill (#f5f5f4) at 0.72. On mapbox
 *      light-v11 the land is already near-white, so a white veil has nowhere to go: the inside and
 *      the outside came out within a few percent of each other and the mask read as a slight tonal
 *      shift, not as a boundary. The fix is to scrim the outside DOWN instead of washing it up —
 *      the same neutral grey as the outline, at an opacity chosen to leave the streets outside
 *      faintly legible so the region still reads as continuing past the edge.
 *   2. The boundary LINE was never drawn at all: its layer filter could not match (see the FILTER
 *      note beside the layers). So there was nothing holding the edge either. With the filter
 *      fixed, the line gets enough weight and contrast to hold the edge between the bright inside
 *      and the dimmed outside, and a halo under it for where the boundary crosses dark map detail.
 *
 *   Still grey wireframe, still no colour: both values are neutral greys, and neither says anything
 *   about air quality. Judged by eye at 390px and 1280px on Bogotá (compact boundary) and Jakarta
 *   (large boundary), which are the two extremes of boundary size in the seven chapters.
 *
 * Documented literals, the same named exception as the marker constants (see ./atlas-markers.ts):
 * a Mapbox paint value is read by WebGL, which cannot resolve a CSS custom property.
 */
/** The scrim over everything outside the boundary. Neutral grey, matching the outline's family. */
const MASK_COLOUR = '#44403c'
/** How far down the outside is scrimmed. Higher dims harder; above ~0.45 the outside goes unreadable. */
const MASK_OPACITY = 0.34
/** The boundary line. Near-black, so it holds against both the bright inside and the dimmed outside. */
const OUTLINE_COLOUR = '#1c1917'
/** Boundary line weight in px. 2.5 reads at 390px and stays a boundary, not a border, at 1280px. */
const OUTLINE_WIDTH = 2.5
/** Boundary line opacity. Just short of solid, so the line still belongs to the map. */
const OUTLINE_OPACITY = 0.9
/**
 * A soft light halo drawn UNDER the boundary line, wider than it. The line sits exactly on the
 * edge between the bright inside and the scrimmed outside, so a halo on its dim side is what stops
 * it dissolving into the scrim where the boundary runs through dark map detail.
 */
const OUTLINE_HALO_COLOUR = '#fafaf9'
const OUTLINE_HALO_WIDTH = 6
const OUTLINE_HALO_OPACITY = 0.45

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
  // One-way latches for the two pieces of first-render work that must happen exactly once, however
  // many of the four style-ready routes fire (see "First render" in the init effect below).
  const fittedRef = useRef<boolean>(false)
  const boundaryDoneRef = useRef<boolean>(false)
  /**
   * False until the city's sensors are on the map, which is what the quiet wireframe below waits
   * for. Deliberately NOT tied to the basemap or to Mapbox's `load`: a data city must never read
   * as a city with no sensors (bug report 2026-09-17, BUG 4), and the sensors are the one thing
   * this map exists to show. Stays false, and the wireframe stays up, when there is no Mapbox
   * token and no map is built at all.
   */
  const [sensorsPlaced, setSensorsPlaced] = useState<boolean>(false)
  // The marker that opened the current card, so focus can go back to it on close.
  const openerRef = useRef<HTMLElement | null>(null)
  /**
   * True while an open card's pan is outstanding, so closing knows to put the view back.
   *
   * THE BUG (bug report 2026-09-17, BUG 12). Opening a card pans the map so the card fits, which
   * is deliberate and right. But the pans ACCUMULATED: closing left the map where the pan had put
   * it, and after two cards on Bogotá at 390px the top marker had been pushed out of the frame
   * entirely, with no way back but a page reload.
   *
   * THE RESTORE IS AN ABSOLUTE TARGET — the same `fitBounds` the map opened on — and not the
   * reverse of the pan, nor a remembered centre. Both of those are only correct if the pan they
   * refer to actually finished, and an eased Mapbox move does not progress while the tab is not
   * rendering: measured here in a background tab, the open pan had moved nothing after 2.5s, so
   * reversing its delta moved the map the wrong way by the full amount, and a centre captured
   * mid-flight remembered a place the map was never at. Re-fitting needs no memory of the pan at
   * all, cannot drift, and is exactly the view the reader started from. (The same lesson as the
   * carousel's rapid clicks: an absolute target survives an animation a relative one does not.)
   */
  const cardPannedRef = useRef<boolean>(false)
  /**
   * True once the READER has dragged, zoomed or wheeled the map themselves. From then on the view
   * is theirs and the restore above never runs again: snapping someone back to the whole-city view
   * after they went looking at one district would be its own bug.
   */
  const readerMovedRef = useRef<boolean>(false)
  /** The city's sensor bounds, so the restore can re-fit without re-creating closeCard. */
  const boundsRef = useRef<[[number, number], [number, number]]>(bounds)

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
    // Undo the pan that opening this card applied (see cardPanRef), unless the reader has moved the
    // map since, in which case their view wins and the pan is simply forgotten.
    const panned = cardPannedRef.current
    cardPannedRef.current = false
    const panMap = mapRef.current
    if (panned && !readerMovedRef.current && panMap !== null) {
      // duration 0, so this is a jump and not an ease. A Mapbox ease is driven by the rendering
      // loop and simply does not progress while the tab is not rendering, which left the open
      // card's own eased pan outstanding and the view drifting a little further with every card
      // (measured in a background tab). A jump also stops whatever ease is in flight, so this is
      // the last word on the camera rather than one more animation queued behind the others. It
      // is the same call, with the same arguments, that the map opens on.
      panMap.fitBounds(boundsRef.current, { padding: 56, maxZoom: 13, duration: 0 })
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
          cardPannedRef.current = true
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

    // ── First render: markers off the style path, the boundary on it ───────────────────────────
    //
    // THE BUG THIS REPLACES (bug report 2026-09-17, BUG 4). Everything below used to hang off one
    // `map.on('load')`. Measured on four loads, a data chapter could sit with an empty pale panel
    // and ZERO markers for 30 to 90 seconds: no basemap detail, no boundary, no mask and no
    // sensors, with no error and no loading state. A reviewer reads that as a city with no sensor
    // network, which is the one thing this map must never say. `load` is a single, late,
    // fire-once event — it waits on the style AND its sources — so a delayed or missed one took
    // the whole hero with it, and there was no second route to any of the work.
    //
    // THE FIX, in three parts.
    //   1. SPLIT BY WHAT EACH PART ACTUALLY NEEDS. A Mapbox Marker is a DOM element positioned by
    //      projection: it needs the map, not the style. So the markers are placed IMMEDIATELY,
    //      synchronously after the constructor, and no longer wait on anything. Only the mask and
    //      outline need `addSource`/`addLayer`, so only they wait for the style.
    //   2. FOUR ROUTES TO THE STYLE WORK, not one: an immediate attempt (for a style that is
    //      already loaded by the time we subscribe), `load`, `styledata` and `idle`. `styledata`
    //      and `idle` both fire repeatedly and neither depends on `load` having fired.
    //   3. IDEMPOTENT, so those four routes are safe: `boundaryDoneRef` and `fittedRef` are
    //      one-way latches, and the marker pass clears before it places. Running the work twice is
    //      impossible, so a redundant route costs nothing.
    //
    // The loading state is driven off the markers, not off `load`: see `sensorsPlaced` below.

    // Markers: cleared before they are placed, so a re-run can never leave two sets behind.
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    // Placement ORDER is the stacking order: a marker placed later sits above its neighbours and
    // wins a click where two hit areas overlap, which they do at this density. The sensors
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
    // The sensors are on the map, so the wireframe can go. Set from the effect body, which React
    // runs after paint, so this is a normal state update and not a render-phase one.
    setSensorsPlaced(true)

    /**
     * Fit to every one of the city's sensors (brief 6.1), once.
     *
     * The constructor already fits, but against whatever size the container had at that moment,
     * and this one is a flex child inside a fixed-height band that is still growing: without a
     * second fit the map opens far too wide (measured, not assumed). A zero-height container
     * cannot be fitted against at all, so this waits for one with a real height, and the latch
     * means a later `idle` can never re-fit a map the reader has since panned or zoomed.
     */
    const fitToSensors = (): void => {
      if (fittedRef.current) return
      const size = map.getContainer()
      if (size.clientWidth === 0 || size.clientHeight === 0) return
      fittedRef.current = true
      map.resize()
      map.fitBounds(bounds, { padding: 56, maxZoom: 13, duration: 0 })
    }

    /**
     * The boundary line, with everything outside it greyed back. Needs the style, so it runs from
     * whichever of the four routes gets there first and latches. Skipped entirely when no outline
     * could be fetched for the city: no mask is better than a wrong one.
     */
    const addBoundary = (): void => {
      if (boundaryDoneRef.current || boundary === null) return
      // The guard that makes the four routes safe: `styledata` fires before the style is usable as
      // well as after, and `addLayer` on a half-loaded style throws.
      if (!map.isStyleLoaded()) return
      boundaryDoneRef.current = true
      if (map.getSource(MASK_SOURCE) !== undefined) return
      map.addSource(MASK_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [maskFeature(boundary), outlineFeature(boundary)] },
      })
      // Three layers, added in stacking order: the scrim over everything outside, then the
      // line's halo, then the line itself. The scrim goes on last of the basemap's layers, so it
      // dims the outside's labels and roads too; the halo and the line sit above it, so the edge
      // is never dimmed by the thing it is the edge of. All six paint values are named constants
      // at the top of this file (see THE BOUNDARY MASK) — tune them there.
      //
      // FILTER — 'LineString', NOT 'MultiLineString'. Mapbox GL's `geometry-type` expression
      // normalises the Multi* types to their singular form, so the MultiLineString feature
      // outlineFeature() builds reports 'LineString'. The two line layers previously filtered on
      // 'MultiLineString', which can never match, so the boundary line was never drawn in any
      // build and what read as "a faint boundary" was only the edge of the fill. Measured in the
      // browser, not reasoned: a pure-black 6px opaque line under the old filter rendered
      // nothing, and the same line under this one rendered immediately. 'Polygon' below is
      // already the singular form, which is why the mask fill always worked.
      map.addLayer({
        id: MASK_LAYER,
        type: 'fill',
        source: MASK_SOURCE,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': MASK_COLOUR, 'fill-opacity': MASK_OPACITY },
      })
      map.addLayer({
        id: OUTLINE_HALO_LAYER,
        type: 'line',
        source: MASK_SOURCE,
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: {
          'line-color': OUTLINE_HALO_COLOUR,
          'line-width': OUTLINE_HALO_WIDTH,
          'line-opacity': OUTLINE_HALO_OPACITY,
        },
      })
      map.addLayer({
        id: OUTLINE_LAYER,
        type: 'line',
        source: MASK_SOURCE,
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: { 'line-color': OUTLINE_COLOUR, 'line-width': OUTLINE_WIDTH, 'line-opacity': OUTLINE_OPACITY },
      })
    }

    /** Everything that needs the style. Safe to call any number of times, from any route. */
    const onStyleReady = (): void => {
      fitToSensors()
      addBoundary()
    }

    /**
     * The reader has taken hold of the map. Subscribed to the INPUT events rather than to
     * `movestart`, because the card's own panBy and the restore's fitBounds are moves too, and
     * only the input events are unambiguously the reader's. From here the view is theirs: the
     * pending restore is dropped and no later one runs.
     */
    const onUserMove = (): void => {
      readerMovedRef.current = true
      cardPannedRef.current = false
    }

    map.on('load', onStyleReady)
    map.on('styledata', onStyleReady)
    map.on('idle', onStyleReady)
    map.on('dragstart', onUserMove)
    map.on('touchstart', onUserMove)
    map.on('wheel', onUserMove)
    map.on('dblclick', onUserMove)
    // Route four: the style may already be loaded by the time we subscribe, in which case `load`
    // has fired and will never fire again. Cheap, and it is the only route that covers that case.
    onStyleReady()

    return () => {
      map.off('load', onStyleReady)
      map.off('styledata', onStyleReady)
      map.off('idle', onStyleReady)
      map.off('dragstart', onUserMove)
      map.off('touchstart', onUserMove)
      map.off('wheel', onUserMove)
      map.off('dblclick', onUserMove)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      closeCard(false)
      map.remove()
      mapRef.current = null
      // Reset the latches with the map they belong to, so a remount (React strict mode in
      // development runs this effect twice) rebuilds rather than skipping the work as done.
      fittedRef.current = false
      boundaryDoneRef.current = false
      setSensorsPlaced(false)
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
      <div className="relative min-h-0 w-full flex-1">
        <div
          ref={containerRef}
          className="atlas-data-map absolute inset-0"
          role="region"
          aria-label={`Map of air quality sensors in ${cityName}`}
        />
        {/* The quiet loading state (bug report 2026-09-17, BUG 4). It covers the map band until the
            sensors are placed, so the reader never sees an empty pale panel and reads it as a city
            with no sensor network. Grey wireframe only — a rule grid and a line of text, no colour,
            no spinner and no motion, in keeping with the concept's grey-wireframe fidelity and with
            the functional-colour rule (colour encodes data here, and there is no data yet).
            `pointer-events-none` so it never eats a gesture during its short life, and it unmounts
            entirely once the markers are down. The message is a live region, so a screen reader
            hears the wait rather than meeting a silent map. */}
        {!sensorsPlaced && (
          <div
            className="pointer-events-none absolute inset-0 flex items-end justify-start bg-muted"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--bc-semantic-border) 1px, transparent 1px), linear-gradient(to bottom, var(--bc-semantic-border) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          >
            <p role="status" className="m-4 rounded-lg bg-background/90 px-3 py-2 text-sm text-foreground/70">
              Loading the sensor map for {cityName}
            </p>
          </div>
        )}
      </div>
      <AtlasMapLegend index={index} hasLowCost={hasLowCost} hasReferenceGrade={hasReferenceGrade} />
    </div>
  )
}
