/**
 * AtlasDataMap.tsx — the city page's map (spec section 5), the largest element on the page.
 *
 * Purpose
 *   Copied from breathe-atlas/_components/chapter/AtlasDataMap.tsx on 2026-10-25 and reworked for
 *   the Breathe Data Atlas (the original is never edited, and no module it imports is mutated).
 *   KEPT from the Atlas: the greyscale light-v11 basemap, the boundary mask and outline (same six
 *   values), cooperative gestures (the page keeps its scroll), the markers-off-the-style-path first
 *   render with its quiet wireframe, the Mapbox attribution with the OpenStreetMap credit, and the
 *   single-card discipline. CHANGED:
 *     - Markers: shape = sensor type; colour = the station's overall IBOCA level as Bogotá
 *       publishes it (spec 5.2), fresh only; stale grey; dead hollow (5.5). See ./atlas-markers.
 *     - The card is TapCard: tap the map to drop a pin and list the nearest three reporting
 *       sensors, with dashed lines from the pin to each (decision D); tap a sensor for that sensor
 *       alone, with NO dashed lines (decisions B7, C). One card at a time.
 *     - "More" opens the sensor detail in a dialog (5.6, see ../city/SensorDetail).
 *     - A Today / Tomorrow switch appears ONLY when the city's data carries a forecast published as
 *       a band (5.7). Bogotá's carries none, so there is no switch.
 *
 * Iteration 3 (round 2): a "Recentre map" button directly below the zoom buttons, in their style
 *   (RecentreControl). It returns the map to its starting view and clears any card, pin, dashed
 *   lines and selected marker.
 *
 * Iteration 2 (round 1 feedback, decisions B5, B6 and B8)
 *   - CITY LOCK (B5): `maxBounds` is the city outline's bounding box plus LOCK_MARGIN of its size on
 *     each side, so panning stops at the city, and minZoom is the zoom that shows that whole box, so
 *     zooming out stops there. Mercator projection: Mapbox ignores maxBounds on the globe.
 *   - SELECTED STATE (B6): the tapped sensor's marker is enlarged with a dark outline ring
 *     (setMarkerSelected); the others are unchanged.
 *   - CARD NEXT TO THE TAP (B8): the map moves, not the card. On a sensor tap the map eases so the
 *     sensor sits to one side (from 640px wide: to the right of the card; on a phone: in the lower
 *     part of the map), zooming in to SENSOR_MIN_ZOOM if it is further out. On a tap anywhere it fits
 *     the pin and the three nearest sensors into the space beside the card. The card is then placed
 *     next to what it describes (placeCard), and follows it while the map moves. Every move goes
 *     through the camera, so it stays inside the city lock; where the lock stops the map short, the
 *     card takes whichever side still has room.
 *
 * Nothing on the map interprets air quality (spec section 2)
 *   No averaging, no interpolation, no value for the pin: the pin only orders sensors by distance.
 *
 * Dashed lines
 *   A GeoJSON line layer with a dash array (moves with the map, no SVG overlay to keep in sync).
 *   Neutral near-black: the lines connect, they do not rate.
 *
 * Accessibility
 *   Markers are buttons named with type, level and freshness. The card takes focus on open; Escape
 *   or its close button closes it and focus returns to the marker that opened it (or to the map).
 *   Tapping the map with a keyboard is not possible in Mapbox; every sensor is reachable as a
 *   marker button, which opens the same card.
 *
 * TOKEN EXCEPTION (named)
 *   Mapbox paint values below are literals: WebGL cannot read CSS custom properties. All neutral.
 *
 * Key exports: AtlasDataMap (named)
 * External dependencies: react, mapbox-gl (+ css), ./atlas-markers (incl. setMarkerSelected), ./AtlasMapLegend,
 *   ../city/TapCard, ../city/AtlasDialog, ../city/SensorDetail, ../../_data/*.
 */

'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { AtlasMapLegend } from './AtlasMapLegend'
import { createPinElement, createSensorMarkerElement, markerFillFor, setMarkerSelected } from './atlas-markers'
import { AtlasDialog } from '../city/AtlasDialog'
import { SensorDetail, SensorDetailAbove, SensorDetailBelow } from '../city/SensorDetail'
import { neighboursFor, TapCard } from '../city/TapCard'
import type { CardPlacement, MapSelection } from '../city/TapCard'
import { BOUNDARY_ATTRIBUTION } from '../../_data/boundaries'
import type { CityBoundary } from '../../_data/boundaries'
import { indexLevel, levelDisplayName } from '../../_data/indexes'
import type { CityPage } from '../../_data/bogota'
import { ageWords, freshnessOf, placeName, sensorTypeLabel } from '../../_data/city-sensors'
import type { CitySensor, Freshness } from '../../_data/city-sensors'

import 'mapbox-gl/dist/mapbox-gl.css'

/** Public Mapbox token, from .env.local. Never hardcoded. */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

/** Grey basemap, as the Atlas. */
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11'

/** Boundary source and layers, and the Atlas's six mask values (unchanged; see the Atlas file). */
const MASK_SOURCE = 'bda-city-boundary'
const MASK_LAYER = 'bda-city-mask'
const OUTLINE_HALO_LAYER = 'bda-city-outline-halo'
const OUTLINE_LAYER = 'bda-city-outline'
const MASK_COLOUR = '#44403c'
const MASK_OPACITY = 0.34
const OUTLINE_COLOUR = '#1c1917'
const OUTLINE_WIDTH = 2.5
const OUTLINE_OPACITY = 0.9
const OUTLINE_HALO_COLOUR = '#fafaf9'
const OUTLINE_HALO_WIDTH = 6
const OUTLINE_HALO_OPACITY = 0.45

/** The dashed lines from the pin (or tapped sensor) to its nearest sensors. */
const LINKS_SOURCE = 'bda-links'
const LINKS_LAYER = 'bda-links-line'
const LINKS_COLOUR = '#1f2328'

/** How the map fits on load. */
const FIT_OPTIONS = { padding: 48, maxZoom: 13 }

/** City lock (decision B5): margin around the outline's bounding box, as a share of its size. */
const LOCK_MARGIN = 0.12

/** A sensor tap zooms in to at least this (decision B8, "zoom in slightly if needed"). */
const SENSOR_MIN_ZOOM = 12.5

/** Map frame width from which the card sits beside the tap rather than above it (phone). */
const SIDE_LAYOUT_MIN_PX = 640

/** Space kept between the card and the marker or pin it describes, and from the frame edges, px. */
const CARD_GAP_PX = 26
const FRAME_INSET_PX = 8

/** Card widths, px: the sensor card, the nearest-three card, and the cap on a phone. */
const SENSOR_CARD_W = 288
const NEAREST_CARD_W = 320
const PHONE_CARD_MAX_W = 380

/** How long the map takes to make room, ms (0 under reduced motion). */
const MOVE_MS = 650

/** The lock box: the outline's (or, without one, the sensors') bounds plus LOCK_MARGIN. Pure. */
function lockBounds(boundary: CityBoundary | null, sensors: CitySensor[]): [[number, number], [number, number]] | null {
  const points: Array<[number, number]> =
    boundary !== null ? boundary.rings.flat() as Array<[number, number]> : sensors.map((s) => s.lngLat)
  if (points.length === 0) return null
  const lngs = points.map((p) => p[0])
  const lats = points.map((p) => p[1])
  const [west, east, south, north] = [Math.min(...lngs), Math.max(...lngs), Math.min(...lats), Math.max(...lats)]
  const padLng = (east - west) * LOCK_MARGIN
  const padLat = (north - south) * LOCK_MARGIN
  return [
    [west - padLng, south - padLat],
    [east + padLng, north + padLat],
  ]
}

/** True when the visitor asked for reduced motion. */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** The marker's accessible name: what shape, colour and fill say, with no value (rule 7). */
function markerLabel(city: CityPage, sensor: CitySensor, freshness: Freshness): string {
  const type = sensorTypeLabel(sensor.type)
  const name = placeName(sensor)
  if (freshness === 'stale') return `${name}, ${type}, last reading ${ageWords(sensor.updatedMinutesAgo)}. Open sensor card.`
  if (sensor.overallBand === null) return `${name}, ${type}, no ${city.index.name} level reported. Open sensor card.`
  const level = levelDisplayName(indexLevel(city.index, sensor.overallBand))
  return `${name}, ${type}, ${city.index.name} ${level}. Open sensor card.`
}

/** The mask polygon: the world with the city's rings as holes. */
function maskFeature(boundary: CityBoundary): GeoJSON.Feature<GeoJSON.Polygon> {
  const world: Array<[number, number]> = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ]
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [world, ...boundary.rings] } }
}

/** The city outline as lines. */
function outlineFeature(boundary: CityBoundary): GeoJSON.Feature<GeoJSON.MultiLineString> {
  return { type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: boundary.rings } }
}

/** Dashed links from an origin to each neighbour. Pure. */
function linkFeatures(origin: [number, number], targets: CitySensor[]): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: 'FeatureCollection',
    features: targets.map((target) => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: [origin, target.lngLat] },
    })),
  }
}

/** The bounds of every sensor, [[west, south], [east, north]]. Pure; guards an empty list. */
function sensorBounds(sensors: CitySensor[]): [[number, number], [number, number]] | null {
  if (sensors.length === 0) return null
  const lngs = sensors.map((s) => s.lngLat[0])
  const lats = sensors.map((s) => s.lngLat[1])
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

/** Props for AtlasDataMap. */
type AtlasDataMapProps = {
  city: CityPage
  /** The city's outline, or null (then no mask and no outline, as in the Atlas). */
  boundary: CityBoundary | null
}

/**
 * The recentre icon (lucide "rotate-ccw" geometry), drawn in currentColor. Decorative. Iteration 4
 * (round 3 decision A2): a reset icon, because the crosshair read as "show my location".
 */
const RECENTRE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block;margin:auto"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>'

/**
 * The recentre button (iteration 3, decision A2 of the coordinator's additions): a Mapbox control
 * in the zoom buttons' own group style, added straight after NavigationControl in the top-right
 * corner, so it sits directly below "+" and "−". It matches the zoom buttons' size (Mapbox's
 * 29px control stack): a 56px button would not fit that stack. Built as an IControl because the
 * control lives in Mapbox's own DOM, outside React; the press calls back into the component.
 */
class RecentreControl implements mapboxgl.IControl {
  private readonly onRecentre: () => void
  private container: HTMLDivElement | null = null

  constructor(onRecentre: () => void) {
    this.onRecentre = onRecentre
  }

  onAdd(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'
    const button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('aria-label', 'Recentre map')
    button.title = 'Recentre map'
    button.dataset.recentre = ''
    button.innerHTML = RECENTRE_ICON
    button.addEventListener('click', () => this.onRecentre())
    container.appendChild(button)
    this.container = container
    return container
  }

  onRemove(): void {
    this.container?.remove()
    this.container = null
  }
}

/** The city map. Client component: Mapbox needs the browser. */
export function AtlasDataMap({ city, boundary }: AtlasDataMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const markerElementsRef = useRef<Record<string, HTMLButtonElement>>({})
  const cardRef = useRef<HTMLElement | null>(null)
  const [placement, setPlacement] = useState<CardPlacement>(null)
  const pinRef = useRef<mapboxgl.Marker | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const fittedRef = useRef<boolean>(false)
  const styleDoneRef = useRef<boolean>(false)
  const [sensorsPlaced, setSensorsPlaced] = useState<boolean>(false)
  const [selection, setSelection] = useState<MapSelection | null>(null)
  const [detailSensor, setDetailSensor] = useState<CitySensor | null>(null)
  // The latest selection, for map handlers created once.
  const selectionRef = useRef<MapSelection | null>(null)
  useEffect(() => {
    selectionRef.current = selection
  }, [selection])

  const bounds = sensorBounds(city.sensors)
  const lock = lockBounds(boundary, city.sensors)

  /** Open the card for a selection: the card is re-placed once the map has made room. */
  const select = useCallback((next: MapSelection): void => {
    setPlacement(null)
    setSelection(next)
  }, [])

  /**
   * Place the card next to what it describes (decision B8), from where those points are on screen
   * NOW. Side layout from SIDE_LAYOUT_MIN_PX: beside the points (left of them when there is room,
   * else right), vertically centred on the tap. Phone: above the points when there is room, else
   * below. Clamped inside the frame. Called on every map move while a card is open.
   */
  const placeCard = useCallback((): void => {
    const map = mapRef.current
    const card = cardRef.current
    const current = selectionRef.current
    if (map === null || card === null || current === null) return
    const box = map.getContainer()
    const width = box.clientWidth
    const height = box.clientHeight
    const anchor = current.kind === 'point' ? current.lngLat : current.sensor.lngLat
    const lngLats = [anchor, ...neighboursFor(city, current).map((n) => n.sensor.lngLat)]
    const points = lngLats.map((lngLat) => map.project(lngLat))
    const minX = Math.min(...points.map((p) => p.x))
    const maxX = Math.max(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxY = Math.max(...points.map((p) => p.y))
    const anchorPoint = points[0]
    const cardH = card.offsetHeight
    const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value))
    if (width >= SIDE_LAYOUT_MIN_PX) {
      const cardW = current.kind === 'point' ? NEAREST_CARD_W : SENSOR_CARD_W
      const leftOfPoints = minX - CARD_GAP_PX - cardW
      const left =
        leftOfPoints >= FRAME_INSET_PX
          ? leftOfPoints
          : maxX + CARD_GAP_PX + cardW <= width - FRAME_INSET_PX
            ? maxX + CARD_GAP_PX
            : clamp(leftOfPoints, FRAME_INSET_PX, width - cardW - FRAME_INSET_PX)
      const top = clamp(anchorPoint.y - cardH / 2, FRAME_INSET_PX, Math.max(FRAME_INSET_PX, height - cardH - FRAME_INSET_PX))
      setPlacement({ left: Math.round(left), top: Math.round(top), width: cardW })
      return
    }
    const cardW = Math.min(width - FRAME_INSET_PX * 2, PHONE_CARD_MAX_W)
    const left = clamp(anchorPoint.x - cardW / 2, FRAME_INSET_PX, width - cardW - FRAME_INSET_PX)
    const above = minY - CARD_GAP_PX - cardH
    const top =
      above >= FRAME_INSET_PX
        ? above
        : maxY + CARD_GAP_PX + cardH <= height - FRAME_INSET_PX
          ? maxY + CARD_GAP_PX
          : FRAME_INSET_PX
    setPlacement({ left: Math.round(left), top: Math.round(top), width: Math.round(cardW) })
  }, [city])

  /** Close the card, clear the pin and the lines, and return focus to whatever opened it. */
  const closeCard = useCallback((restoreFocus: boolean): void => {
    setSelection(null)
    if (restoreFocus) {
      const target = openerRef.current ?? containerRef.current
      target?.focus({ preventScroll: true })
    }
    openerRef.current = null
  }, [])

  // ── Map initialisation, once ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (container === null || MAPBOX_TOKEN === undefined || MAPBOX_TOKEN.length === 0 || bounds === null) return
    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container,
      style: MAP_STYLE,
      bounds,
      fitBoundsOptions: FIT_OPTIONS,
      maxZoom: 15,
      // City lock (decision B5). Mercator, because Mapbox ignores maxBounds on the globe projection.
      projection: 'mercator',
      maxBounds: lock ?? undefined,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: false,
      cooperativeGestures: true,
    })
    mapRef.current = map
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true, customAttribution: boundary === null ? undefined : BOUNDARY_ATTRIBUTION }),
      'bottom-right',
    )
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    // Directly below the zoom buttons: back to the starting view, with any card, pin, dashed lines
    // and selected marker cleared (closing the card clears the selection, which clears the rest).
    map.addControl(
      new RecentreControl(() => {
        closeCard(false)
        map.fitBounds(bounds, { ...FIT_OPTIONS, duration: prefersReducedMotion() ? 0 : 600 })
      }),
      'top-right',
    )

    // Markers first, off the style path (the Atlas's first-render fix). Order is stacking order:
    // stale under fresh, and worse levels last, so the meaningful marker wins a tap.
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    const rank = (sensor: CitySensor): number => {
      const freshness = freshnessOf(sensor, city.updateCycleMinutes)
      return freshness === 'stale' ? 0 : 1 + (sensor.overallBand ?? 0)
    }
    ;[...city.sensors]
      .sort((a, b) => rank(a) - rank(b))
      .forEach((sensor) => {
        const freshness = freshnessOf(sensor, city.updateCycleMinutes)
        const element = createSensorMarkerElement(sensor, {
          fill: markerFillFor(freshness, true, sensor.overallBand),
          colour: sensor.overallBand === null ? null : indexLevel(city.index, sensor.overallBand).hex,
          label: markerLabel(city, sensor, freshness),
        })
        element.addEventListener('click', (event) => {
          // Without this the map's own click would also fire and drop a pin.
          event.stopPropagation()
          openerRef.current = element
          select({ kind: 'sensor', sensor })
        })
        markerElementsRef.current[sensor.id] = element
        markersRef.current.push(new mapboxgl.Marker({ element, anchor: 'center' }).setLngLat(sensor.lngLat).addTo(map))
      })
    setSensorsPlaced(true)

    const fit = (): void => {
      if (fittedRef.current) return
      const box = map.getContainer()
      if (box.clientWidth === 0 || box.clientHeight === 0) return
      fittedRef.current = true
      map.resize()
      // City lock (decision B5). Mapbox keeps the whole VIEWPORT inside maxBounds, so a lock box
      // narrower than the frame's shape would stop the map before the whole city fits (Bogotá is
      // tall; the desktop frame is wide). So: frame the lock box once, widen the lock to the
      // viewport it produces, and make that framing the furthest zoom-out.
      if (lock !== null) {
        map.setMaxBounds([[-180, -85], [180, 85]])
        map.fitBounds(lock, { padding: 0, duration: 0 })
        const view = map.getBounds()
        if (view !== null) {
          map.setMaxBounds([
            [Math.min(lock[0][0], view.getWest()), Math.min(lock[0][1], view.getSouth())],
            [Math.max(lock[1][0], view.getEast()), Math.max(lock[1][1], view.getNorth())],
          ])
        }
        map.setMinZoom(map.getZoom())
      }
      map.fitBounds(bounds, { ...FIT_OPTIONS, duration: 0 })
    }

    // Everything that needs the style: boundary mask and outline, and the (empty) links layer.
    const addStyleLayers = (): void => {
      if (styleDoneRef.current || !map.isStyleLoaded()) return
      styleDoneRef.current = true
      if (boundary !== null && map.getSource(MASK_SOURCE) === undefined) {
        map.addSource(MASK_SOURCE, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [maskFeature(boundary), outlineFeature(boundary)] },
        })
        // 'LineString', not 'MultiLineString': Mapbox normalises Multi* (see the Atlas file).
        map.addLayer({ id: MASK_LAYER, type: 'fill', source: MASK_SOURCE, filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': MASK_COLOUR, 'fill-opacity': MASK_OPACITY } })
        map.addLayer({ id: OUTLINE_HALO_LAYER, type: 'line', source: MASK_SOURCE, filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': OUTLINE_HALO_COLOUR, 'line-width': OUTLINE_HALO_WIDTH, 'line-opacity': OUTLINE_HALO_OPACITY } })
        map.addLayer({ id: OUTLINE_LAYER, type: 'line', source: MASK_SOURCE, filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': OUTLINE_COLOUR, 'line-width': OUTLINE_WIDTH, 'line-opacity': OUTLINE_OPACITY } })
      }
      if (map.getSource(LINKS_SOURCE) === undefined) {
        map.addSource(LINKS_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
        map.addLayer({
          id: LINKS_LAYER,
          type: 'line',
          source: LINKS_SOURCE,
          layout: { 'line-cap': 'round' },
          paint: { 'line-color': LINKS_COLOUR, 'line-width': 2, 'line-opacity': 0.8, 'line-dasharray': [2, 2] },
        })
      }
      // Draw links for a selection made before the style was ready.
      const current = selectionRef.current
      const source = map.getSource(LINKS_SOURCE) as mapboxgl.GeoJSONSource | undefined
      if (current !== null && current.kind === 'point' && source !== undefined) {
        source.setData(linkFeatures(current.lngLat, neighboursFor(city, current).map((n) => n.sensor)))
      }
    }

    const onStyleReady = (): void => {
      fit()
      addStyleLayers()
    }

    // Tap the map (not a marker): drop a pin and open the card for that point (spec 5.4).
    const onMapClick = (event: mapboxgl.MapMouseEvent): void => {
      openerRef.current = null
      select({ kind: 'point', lngLat: [event.lngLat.lng, event.lngLat.lat] })
    }

    // The open card follows what it describes while the map moves (decision B8).
    const onMove = (): void => placeCard()

    map.on('load', onStyleReady)
    map.on('move', onMove)
    map.on('styledata', onStyleReady)
    map.on('idle', onStyleReady)
    map.on('click', onMapClick)
    onStyleReady()

    return () => {
      map.off('load', onStyleReady)
      map.off('styledata', onStyleReady)
      map.off('idle', onStyleReady)
      map.off('click', onMapClick)
      map.off('move', onMove)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      markerElementsRef.current = {}
      pinRef.current?.remove()
      pinRef.current = null
      map.remove()
      mapRef.current = null
      fittedRef.current = false
      styleDoneRef.current = false
      setSensorsPlaced(false)
    }
    // Built once: a city page is one city, pre-rendered; its inputs never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Pin and dashed lines follow the selection ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (map === null) return
    pinRef.current?.remove()
    pinRef.current = null
    const source = map.getSource(LINKS_SOURCE) as mapboxgl.GeoJSONSource | undefined
    if (selection === null) {
      source?.setData({ type: 'FeatureCollection', features: [] })
      return
    }
    // Dashed lines belong to a tap on an empty spot only (decision B7); a sensor tap draws none.
    if (selection.kind === 'point') {
      pinRef.current = new mapboxgl.Marker({ element: createPinElement(), anchor: 'bottom' }).setLngLat(selection.lngLat).addTo(map)
      source?.setData(linkFeatures(selection.lngLat, neighboursFor(city, selection).map((n) => n.sensor)))
    } else {
      source?.setData({ type: 'FeatureCollection', features: [] })
    }
  }, [selection, city])

  // ── Selected state on the tapped sensor's marker (decision B6) ──────────────────────────────
  useEffect(() => {
    const selectedId = selection !== null && selection.kind === 'sensor' ? selection.sensor.id : null
    Object.entries(markerElementsRef.current).forEach(([id, element]) => setMarkerSelected(element, id === selectedId))
  }, [selection, sensorsPlaced])

  // ── Make room for the card, then place it (decision B8) ─────────────────────────────────────
  // Layout effect: the card has rendered (invisible) so its height can be measured first.
  useLayoutEffect(() => {
    const map = mapRef.current
    const card = cardRef.current
    if (map === null || selection === null || card === null) return
    const box = map.getContainer()
    const width = box.clientWidth
    const height = box.clientHeight
    const cardH = card.offsetHeight
    const duration = prefersReducedMotion() ? 0 : MOVE_MS
    const side = width >= SIDE_LAYOUT_MIN_PX
    if (selection.kind === 'sensor') {
      const zoom = Math.max(map.getZoom(), SENSOR_MIN_ZOOM)
      // Where the sensor should land: right of a left-hand card (side layout), or in the lower part
      // of the map below the card (phone).
      const target = side
        ? { x: FRAME_INSET_PX + SENSOR_CARD_W + CARD_GAP_PX + 24, y: height / 2 }
        : { x: width / 2, y: Math.max(height * 0.72, Math.min(height - 48, FRAME_INSET_PX + cardH + CARD_GAP_PX + 24)) }
      map.easeTo({ center: selection.sensor.lngLat, zoom, offset: [target.x - width / 2, target.y - height / 2], duration })
    } else {
      const lngLats = [selection.lngLat, ...neighboursFor(city, selection).map((n) => n.sensor.lngLat)]
      const lngs = lngLats.map((p) => p[0])
      const lats = lngLats.map((p) => p[1])
      const box2: [[number, number], [number, number]] = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ]
      const padding = side
        ? { left: FRAME_INSET_PX + NEAREST_CARD_W + CARD_GAP_PX + 16, right: 48, top: 56, bottom: 56 }
        : { left: 40, right: 40, top: Math.min(height * 0.6, FRAME_INSET_PX + cardH + CARD_GAP_PX + 24), bottom: 40 }
      map.fitBounds(box2, { padding, maxZoom: 15, duration })
    }
    placeCard()
    if (duration === 0) return
    // Place again once the move has settled (the move handler places it on the way).
    const settle = (): void => placeCard()
    map.once('moveend', settle)
    return () => {
      map.off('moveend', settle)
    }
  }, [selection, city, placeCard])

  // ── Escape closes the card (when no dialog is open: the dialog owns Escape then) ─────────────
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && selectionRef.current !== null && detailSensor === null) {
        closeCard(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeCard, detailSensor])

  const hasLowCost = city.sensors.some((s) => s.type === 'low-cost')
  const hasReferenceGrade = city.sensors.some((s) => s.type === 'reference-grade')

  return (
    <div className="flex w-full flex-col border-y border-border bg-muted" data-city={city.slug}>
      <style>{`.bda-city-map .mapboxgl-canvas { filter: grayscale(1); }`}</style>
      {/* Today / Tomorrow appears only for a forecast published as a band (spec 5.7). */}
      {city.forecastBands !== null && (
        <div role="group" aria-label="Day" className="flex gap-2 border-b border-border bg-background px-4 py-2">
          <span className="inline-flex min-h-14 items-center rounded-full border border-foreground px-4 text-sm font-semibold">Today</span>
          <span className="inline-flex min-h-14 items-center rounded-full border border-border px-4 text-sm">Tomorrow</span>
        </div>
      )}
      <div className="relative h-[72vh] min-h-[460px] w-full md:h-[640px]">
        {/* Positioning on a plain wrapper: mapbox-gl.css's `.mapboxgl-map { position: relative }`
            beats Tailwind's layered `absolute` (see the Atlas file). */}
        <div className="absolute inset-0">
          <div
            ref={containerRef}
            tabIndex={-1}
            className="bda-city-map h-full w-full outline-none"
            role="region"
            aria-label={`Map of air quality sensors in ${city.name}. Tap the map for the nearest sensors, or a sensor for its details.`}
          />
        </div>
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
              Loading the sensor map for {city.name}
            </p>
          </div>
        )}
        {selection !== null && (
          <TapCard
            city={city}
            selection={selection}
            placement={placement}
            cardRef={cardRef}
            onClose={() => closeCard(true)}
            onOpenDetail={(sensor) => setDetailSensor(sensor)}
            onSelectSensor={(sensor) => {
              openerRef.current = markerElementsRef.current[sensor.id] ?? null
              select({ kind: 'sensor', sensor })
            }}
          />
        )}
      </div>
      <AtlasMapLegend city={city} hasLowCost={hasLowCost} hasReferenceGrade={hasReferenceGrade} />
      <AtlasDialog
        open={detailSensor !== null}
        onOpenChange={(open) => {
          if (!open) setDetailSensor(null)
        }}
        eyebrow=""
        title={detailSensor === null ? '' : placeName(detailSensor)}
        above={detailSensor === null ? null : <SensorDetailAbove sensor={detailSensor} />}
        below={detailSensor === null || detailSensor.stationType === null ? null : <SensorDetailBelow sensor={detailSensor} />}
      >
        {detailSensor !== null && <SensorDetail city={city} sensor={detailSensor} />}
      </AtlasDialog>
    </div>
  )
}
