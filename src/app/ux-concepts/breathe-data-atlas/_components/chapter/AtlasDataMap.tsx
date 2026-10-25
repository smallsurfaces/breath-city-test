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
 *     - The card is TapCard (5.4): tap the map to drop a pin and list the nearest three reporting
 *       sensors, with dashed lines from the pin to each; tap a sensor for that sensor and its three
 *       nearest neighbours, with dashed lines to them. One card, docked inside the map frame.
 *     - "Sensor details" opens the sensor detail in a dialog (5.6, see ../city/SensorDetail).
 *     - Pollutant helper lines (spec 5.8) in the card and the detail, in the variant the page
 *       passes from ?helper= (text, icons or chips; see ../city/PollutantHelper).
 *     - A Today / Tomorrow switch appears ONLY when the city's data carries a forecast published as
 *       a band (5.7). Bogotá's carries none, so there is no switch.
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
 * External dependencies: react, mapbox-gl (+ css), ./atlas-markers, ./AtlasMapLegend,
 *   ../city/TapCard, ../city/AtlasDialog, ../city/SensorDetail, ../../_data/*.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { AtlasMapLegend } from './AtlasMapLegend'
import { createPinElement, createSensorMarkerElement } from './atlas-markers'
import { AtlasDialog } from '../city/AtlasDialog'
import { SensorDetail } from '../city/SensorDetail'
import { neighboursFor, TapCard } from '../city/TapCard'
import type { MapSelection } from '../city/TapCard'
import type { HelperVariant } from '../city/PollutantHelper'
import { BOUNDARY_ATTRIBUTION } from '../../_data/boundaries'
import type { CityBoundary } from '../../_data/boundaries'
import { indexLevel, levelDisplayName } from '../../_data/indexes'
import type { CityPage } from '../../_data/bogota'
import { freshnessOf, sensorTypeLabel } from '../../_data/city-sensors'
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

/** The marker's accessible name: what shape, colour and fill say, with no value (rule 7). */
function markerLabel(city: CityPage, sensor: CitySensor, freshness: Freshness): string {
  const type = sensorTypeLabel(sensor.type)
  if (freshness === 'dead') return `${type}, no reading for over 24 hours. Open sensor card.`
  if (freshness === 'stale') return `${type}, last reading older than the update cycle. Open sensor card.`
  const level = levelDisplayName(indexLevel(city.index, sensor.overallBand))
  return `${type}, ${city.index.name} ${level}. Open sensor card.`
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
  /** The pollutant helper variant (spec 5.8, from ?helper=). */
  helperVariant: HelperVariant
}

/** The city map. Client component: Mapbox needs the browser. */
export function AtlasDataMap({ city, boundary, helperVariant }: AtlasDataMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
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

    // Markers first, off the style path (the Atlas's first-render fix). Order is stacking order:
    // dead under stale under fresh, and worse levels last, so the meaningful marker wins a tap.
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    const rank = (sensor: CitySensor): number => {
      const freshness = freshnessOf(sensor, city.updateCycleMinutes)
      return freshness === 'dead' ? 0 : freshness === 'stale' ? 1 : 2 + sensor.overallBand
    }
    ;[...city.sensors]
      .sort((a, b) => rank(a) - rank(b))
      .forEach((sensor) => {
        const freshness = freshnessOf(sensor, city.updateCycleMinutes)
        const element = createSensorMarkerElement(sensor, {
          colour: indexLevel(city.index, sensor.overallBand).hex,
          freshness,
          label: markerLabel(city, sensor, freshness),
        })
        element.addEventListener('click', (event) => {
          // Without this the map's own click would also fire and drop a pin.
          event.stopPropagation()
          openerRef.current = element
          setSelection({ kind: 'sensor', sensor })
        })
        markersRef.current.push(new mapboxgl.Marker({ element, anchor: 'center' }).setLngLat(sensor.lngLat).addTo(map))
      })
    setSensorsPlaced(true)

    const fit = (): void => {
      if (fittedRef.current) return
      const box = map.getContainer()
      if (box.clientWidth === 0 || box.clientHeight === 0) return
      fittedRef.current = true
      map.resize()
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
      if (current !== null && source !== undefined) {
        const origin = current.kind === 'point' ? current.lngLat : current.sensor.lngLat
        source.setData(linkFeatures(origin, neighboursFor(city, current).map((n) => n.sensor)))
      }
    }

    const onStyleReady = (): void => {
      fit()
      addStyleLayers()
    }

    // Tap the map (not a marker): drop a pin and open the card for that point (spec 5.4).
    const onMapClick = (event: mapboxgl.MapMouseEvent): void => {
      openerRef.current = null
      setSelection({ kind: 'point', lngLat: [event.lngLat.lng, event.lngLat.lat] })
    }

    map.on('load', onStyleReady)
    map.on('styledata', onStyleReady)
    map.on('idle', onStyleReady)
    map.on('click', onMapClick)
    onStyleReady()

    return () => {
      map.off('load', onStyleReady)
      map.off('styledata', onStyleReady)
      map.off('idle', onStyleReady)
      map.off('click', onMapClick)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
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
    const origin = selection.kind === 'point' ? selection.lngLat : selection.sensor.lngLat
    if (selection.kind === 'point') {
      pinRef.current = new mapboxgl.Marker({ element: createPinElement(), anchor: 'bottom' }).setLngLat(origin).addTo(map)
    }
    source?.setData(linkFeatures(origin, neighboursFor(city, selection).map((n) => n.sensor)))
  }, [selection, city])

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
  const hasStale = city.sensors.some((s) => freshnessOf(s, city.updateCycleMinutes) === 'stale')
  const hasDead = city.sensors.some((s) => freshnessOf(s, city.updateCycleMinutes) === 'dead')

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
            onClose={() => closeCard(true)}
            onOpenDetail={(sensor) => setDetailSensor(sensor)}
            variant={helperVariant}
          />
        )}
      </div>
      <AtlasMapLegend
        index={city.index}
        hasLowCost={hasLowCost}
        hasReferenceGrade={hasReferenceGrade}
        hasStale={hasStale}
        hasDead={hasDead}
      />
      <AtlasDialog
        open={detailSensor !== null}
        onOpenChange={(open) => {
          if (!open) setDetailSensor(null)
        }}
        eyebrow="Sensor details"
        title={detailSensor === null ? '' : sensorTypeLabel(detailSensor.type)}
      >
        {detailSensor !== null && <SensorDetail city={city} sensor={detailSensor} variant={helperVariant} />}
      </AtlasDialog>
    </div>
  )
}
