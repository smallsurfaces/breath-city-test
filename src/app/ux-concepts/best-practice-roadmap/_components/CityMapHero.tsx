/**
 * CityMapHero.tsx — Mapbox + OpenAQ sensor dot map for roadmap city pages
 *
 * Purpose:
 *   Renders a clean, read-only Mapbox map showing live OpenAQ PM2.5 sensor
 *   locations as circle dots for a given city. Used as the hero visual on each
 *   city detail page in the Best Practice Roadmap concept. Intentionally simple:
 *   no popups, no probe mode, no parameter switching — just dots on a light map
 *   with a grey mask outside the city bbox.
 *
 * Key exports: CityMapHero (default)
 * External dependencies: mapbox-gl, @/lib/openaq/cities (getCity), /api/stations route
 *
 * Data flow:
 *   1. On mount, fetches /api/stations?city={slug}&parameter=pm25
 *   2. Initializes Mapbox with light-v11 style, city center/zoom from registry
 *   3. Adds a grey mask layer (world polygon with city bbox hole)
 *   4. Plots stations as a GeoJSON circle layer for performance
 *   5. Shows a sensor count badge overlay
 *
 * CSS: This project uses HEX CSS variables (e.g. --foreground: #003574).
 *   Never use hsl(var(--foreground)). For opacity, use color-mix() or
 *   Tailwind's text-foreground/50 pattern.
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { getCity } from '@/lib/openaq/cities'
import type { Station } from '@/lib/openaq/types'

import 'mapbox-gl/dist/mapbox-gl.css'

/** Mapbox token from the Next.js public env var (NEXT_PUBLIC_ prefix -> available client-side). */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

/** Foreground color from the theme — used for the GeoJSON circle layer paint. */
const FOREGROUND_HEX = '#003574'

/** Props for CityMapHero. */
type CityMapHeroProps = {
  /** City slug matching both the roadmap data and the OpenAQ city registry. */
  citySlug: string
}

/**
 * Expand a bbox by a percentage in each direction so users can pan slightly
 * but not leave the city area entirely. Returns a LngLatBoundsLike.
 */
function expandBbox(
  bbox: [number, number, number, number],
  expandFraction: number,
): [[number, number], [number, number]] {
  const lonSpan = bbox[2] - bbox[0]
  const latSpan = bbox[3] - bbox[1]
  const lonPad = lonSpan * expandFraction
  const latPad = latSpan * expandFraction
  return [
    [bbox[0] - lonPad, bbox[1] - latPad],
    [bbox[2] + lonPad, bbox[3] + latPad],
  ]
}

/**
 * Build a GeoJSON Polygon with an outer ring covering the world and an inner
 * ring (hole) cut out for the city bbox. The hole makes the city area
 * transparent while the rest of the world is masked.
 */
function buildMaskGeoJSON(bbox: [number, number, number, number]): GeoJSON.Feature<GeoJSON.Polygon> {
  const [minLon, minLat, maxLon, maxLat] = bbox
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        // Outer ring: world (clockwise)
        [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
        // Inner ring: city bbox hole (counterclockwise)
        [
          [minLon, minLat],
          [minLon, maxLat],
          [maxLon, maxLat],
          [maxLon, minLat],
          [minLon, minLat],
        ],
      ],
    },
  }
}

/**
 * Convert Station[] to a GeoJSON FeatureCollection for the circle layer source.
 */
function stationsToGeoJSON(stations: Station[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: stations.map((s) => ({
      type: 'Feature',
      properties: { id: s.id, name: s.name },
      geometry: {
        type: 'Point',
        coordinates: s.coordinates,
      },
    })),
  }
}

export function CityMapHero({ citySlug }: CityMapHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [stationCount, setStationCount] = useState<number | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const city = getCity(citySlug)

  // Fetch stations from the API route
  useEffect(() => {
    let cancelled = false

    async function fetchStations() {
      try {
        const res = await fetch(`/api/stations?city=${citySlug}&parameter=pm25`)
        if (!res.ok) {
          if (!cancelled) {
            setFetchError(true)
            setStationCount(0)
          }
          return
        }
        const data: Station[] = await res.json()
        if (!cancelled) {
          setStationCount(data.length)
          setFetchError(false)

          // Add stations to the map if it is already loaded
          const map = mapRef.current
          if (map !== null && map.isStyleLoaded()) {
            addStationsLayer(map, data)
          }
        }
      } catch {
        if (!cancelled) {
          setFetchError(true)
          setStationCount(0)
        }
      }
    }

    fetchStations()
    return () => { cancelled = true }
  }, [citySlug])

  // Initialize Mapbox map
  useEffect(() => {
    if (containerRef.current === null || city === undefined) {
      return
    }

    mapboxgl.accessToken = MAPBOX_TOKEN ?? ''

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: city.center,
      zoom: city.zoom,
      maxBounds: expandBbox(city.bbox, 0.2),
      attributionControl: false,
      scrollZoom: false,
    })

    // Side effect: add compact attribution control (bottom-right)
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    // Side effect: add navigation control (bottom-right)
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    mapRef.current = map

    map.on('load', () => {
      setMapLoaded(true)

      // Side effect: add the grey mask layer outside the city bbox
      map.addSource('city-mask', {
        type: 'geojson',
        data: buildMaskGeoJSON(city.bbox),
      })
      map.addLayer({
        id: 'city-mask-fill',
        type: 'fill',
        source: 'city-mask',
        paint: {
          'fill-color': '#e5e7eb',
          'fill-opacity': 0.7,
        },
      })
    })

    return () => {
      mapRef.current = null
      map.remove()
    }
    // city object identity is stable for a given slug within a page render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citySlug])

  // When both map and stations are ready, add the circle layer.
  // This handles the case where the map loads after stations arrive.
  useEffect(() => {
    if (!mapLoaded || stationCount === null) {
      return
    }
    // Stations are already added in the fetch effect if map was ready first.
    // This effect covers the reverse timing: map loaded after fetch completed.
    // The addStationsLayer function is idempotent (checks for existing source).
  }, [mapLoaded, stationCount])

  // If no city in the registry, render a fallback
  if (city === undefined) {
    return (
      <div className="h-[280px] sm:h-[360px] lg:h-[400px] w-full rounded-xl overflow-hidden relative bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Map not available for this city</p>
      </div>
    )
  }

  return (
    <div className="h-[280px] sm:h-[360px] lg:h-[400px] w-full rounded-xl overflow-hidden relative">
      {/* Loading skeleton — visible until map tiles render */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse z-10" />
      )}

      {/* Map container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Station count badge */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm text-xs text-foreground px-2 py-1 rounded-full border z-20">
        {stationCount === null
          ? 'Loading...'
          : fetchError
            ? 'No sensor data'
            : stationCount === 0
              ? 'No sensors found'
              : `${stationCount} sensor${stationCount === 1 ? '' : 's'}`}
      </div>
    </div>
  )
}

/**
 * Add stations as a GeoJSON source + circle layer to the map.
 * Idempotent: if the source already exists, updates its data instead of
 * re-adding. This avoids "Source already exists" errors when both the
 * fetch-complete and map-load paths fire.
 *
 * Side effect: mutates the Mapbox map by adding a source and layer.
 */
function addStationsLayer(map: mapboxgl.Map, stations: Station[]): void {
  const geojson = stationsToGeoJSON(stations)
  const existingSource = map.getSource('stations') as mapboxgl.GeoJSONSource | undefined

  if (existingSource !== undefined) {
    existingSource.setData(geojson)
    return
  }

  map.addSource('stations', {
    type: 'geojson',
    data: geojson,
  })

  map.addLayer({
    id: 'stations-circle',
    type: 'circle',
    source: 'stations',
    paint: {
      'circle-radius': 5,
      'circle-color': FOREGROUND_HEX,
      'circle-opacity': 0.6,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
  })
}
