/**
 * country-map-geometry.ts — builds the stylised country map's outline and layout numbers (brief 5.4).
 *
 * Purpose
 *   Pure geometry for StylisedCountryMap. Given a country (see ../../_data/country-maps.ts) and a
 *   city position, it returns:
 *   - the country outline as an SVG path on a flat 1000 x 1000 "plane" (Mercator, fitted),
 *   - where that plane sits inside a "stage" box once CSS tilts it, so the tilted outline fills the
 *     stage with no empty margin,
 *   - where the city lands on screen after the tilt, so the dot and label can sit in an untilted
 *     overlay and stay upright and readable,
 *   - the in-plane offsets that make the slab edge and the shadow fall straight down on screen.
 *
 * SERVER ONLY
 *   Imports the Natural Earth 1:50m countries TopoJSON (world-atlas, about 750 KB). Only import this
 *   from server components: the chapter pages are pre-rendered, so the data is read at build time
 *   and only the one finished path string reaches the browser. No download happens at runtime.
 *
 * The tilt (why the maths is exact)
 *   The plane is drawn with `transform: rotateX(TILT_X_DEG) rotateZ(TURN_Z_DEG)` and no perspective.
 *   CSS applies the right-most function first, so a plane point (x, y), measured from the plane's
 *   centre with y pointing down, lands on screen at
 *     screenX = x cos(turn) - y sin(turn)
 *     screenY = (x sin(turn) + y cos(turn)) cos(tilt)
 *   With no perspective this is a parallel (isometric-style) projection, so every result is a
 *   fraction of the stage and holds at any rendered size. The angles were picked so the seven
 *   countries' tilted outlines stay between about 1:1 and 2.3:1 wide.
 *
 * Key exports: TILT_X_DEG, TURN_Z_DEG, PLANE_SIZE, CountryMapGeometry (type), buildCountryMapGeometry
 * External dependencies: topojson-client (feature), d3-geo (geoMercator, geoPath, geoCentroid),
 *   world-atlas/countries-50m.json, geojson + topojson-specification types.
 */

import { feature } from 'topojson-client'
import { geoCentroid, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import countries50m from 'world-atlas/countries-50m.json'
import type { CountryMapSpec, GeoBox } from '../../_data/country-maps'

/** Tilt away from the viewer, in degrees (CSS rotateX). */
export const TILT_X_DEG = 50

/** Clockwise turn on the table before tilting, in degrees (CSS rotateZ). */
export const TURN_Z_DEG = 30

/** Side of the square plane the outline is drawn on, in SVG units. */
export const PLANE_SIZE = 1000

/** How far the slab edge shows below the top face, in on-screen plane units. */
const EDGE_DROP = 10

/** How far the shadow falls below the map, in on-screen plane units. */
const SHADOW_DROP = 34

/** Blur of the shadow (SVG feGaussianBlur standard deviation), in plane units. */
export const SHADOW_BLUR = 16

/** A point or offset in plane or screen units. */
type Vec = { x: number; y: number }

/** Everything StylisedCountryMap needs to draw one country. All percentages are 0 to 100. */
export type CountryMapGeometry = {
  /** The outline as an SVG path, in plane units (0 to PLANE_SIZE). */
  pathD: string
  /** Stage width divided by stage height (for CSS aspect-ratio). */
  stageAspect: number
  /** The plane box inside the stage, before the CSS tilt, as percentages of the stage. */
  plane: { leftPct: number; topPct: number; widthPct: number; heightPct: number }
  /** The city's on-screen position inside the stage, as percentages of the stage. */
  city: { leftPct: number; topPct: number }
  /** In-plane translation that puts the slab edge straight below the top face on screen. */
  edgeOffset: Vec
  /** In-plane translation that puts the shadow straight below the map on screen. */
  shadowOffset: Vec
}

/** Properties world-atlas stores on each country. */
type CountryProperties = { name: string }

/** The world-atlas countries topology, typed. (The JSON import itself is untyped data.) */
type CountriesTopology = Topology<{ countries: GeometryCollection<CountryProperties> }>

/** Degrees to radians. */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Where a plane point (measured from the plane's centre) lands on screen after the CSS tilt. */
function planeToScreen(point: Vec): Vec {
  const turn = toRadians(TURN_Z_DEG)
  const tilt = toRadians(TILT_X_DEG)
  return {
    x: point.x * Math.cos(turn) - point.y * Math.sin(turn),
    y: (point.x * Math.sin(turn) + point.y * Math.cos(turn)) * Math.cos(tilt),
  }
}

/**
 * The in-plane offset that appears as a straight drop of `screenDrop` units on screen. Solves
 * planeToScreen(offset) = (0, screenDrop): offset = screenDrop / cos(tilt) * (sin(turn), cos(turn)).
 */
function planeOffsetForScreenDrop(screenDrop: number): Vec {
  const turn = toRadians(TURN_Z_DEG)
  const length = screenDrop / Math.cos(toRadians(TILT_X_DEG))
  return { x: length * Math.sin(turn), y: length * Math.cos(turn) }
}

/** The world's countries as GeoJSON, converted once per server process. */
let countriesCache: FeatureCollection<Geometry, CountryProperties> | null = null

/** All world-atlas countries as a GeoJSON feature collection (cached). */
function allCountries(): FeatureCollection<Geometry, CountryProperties> {
  if (countriesCache === null) {
    const topology = countries50m as unknown as CountriesTopology
    countriesCache = feature(topology, topology.objects.countries)
  }
  return countriesCache
}

/** True when a lng/lat position is inside the box. */
function isInside(position: Position, box: GeoBox): boolean {
  const [lng, lat] = position
  return lng >= box.west && lng <= box.east && lat >= box.south && lat <= box.north
}

/** The country's polygons, as one list of polygon coordinate arrays. */
function polygonsOf(geometry: Geometry): Position[][][] {
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

/**
 * The country outline to draw: the world-atlas feature for `spec.isoNumeric`, minus any polygon
 * whose centre falls outside `spec.keepWithin`. Throws if the country is missing or ends up empty,
 * which fails the (pre-rendering) build rather than drawing a blank map.
 */
function countryFeature(spec: CountryMapSpec): Feature<MultiPolygon, CountryProperties> {
  const country = allCountries().features.find((entry) => String(entry.id) === spec.isoNumeric)
  if (country === undefined) {
    throw new Error(`Breathe Atlas: no world-atlas country with id ${spec.isoNumeric}`)
  }
  const keepWithin = spec.keepWithin
  const polygons = polygonsOf(country.geometry).filter((coordinates) => {
    if (keepWithin === null) return true
    const polygon: Polygon = { type: 'Polygon', coordinates }
    return isInside(geoCentroid(polygon), keepWithin)
  })
  if (polygons.length === 0) {
    throw new Error(`Breathe Atlas: country ${spec.isoNumeric} has no polygons inside its keepWithin box`)
  }
  return {
    type: 'Feature',
    properties: country.properties,
    geometry: { type: 'MultiPolygon', coordinates: polygons },
  }
}

/**
 * Builds the geometry for one country map. Pure apart from the module-level cache of the parsed
 * world data. `cityLngLat` is the city's [longitude, latitude].
 */
export function buildCountryMapGeometry(spec: CountryMapSpec, cityLngLat: [number, number]): CountryMapGeometry {
  const country = countryFeature(spec)
  const projection = geoMercator().fitExtent(
    [
      [0, 0],
      [PLANE_SIZE, PLANE_SIZE],
    ],
    country,
  )
  // Whole-unit coordinates: at the rendered sizes one plane unit is under a pixel, and it keeps the
  // largest outline (Indonesia) near 30 KB instead of 40 KB.
  const pathD = geoPath(projection).digits(0)(country)
  if (pathD === null) {
    throw new Error(`Breathe Atlas: could not draw country ${spec.isoNumeric}`)
  }

  const centre = PLANE_SIZE / 2
  /** Projects a lng/lat position to a plane point measured from the plane's centre. */
  const toPlane = (position: Position): Vec | null => {
    const projected = projection([position[0], position[1]])
    if (projected === null) return null
    return { x: projected[0] - centre, y: projected[1] - centre }
  }

  // On-screen bounding box of the tilted outline, including the slab edge and the blurred shadow
  // below it, so nothing is clipped and there is no dead margin.
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  const shadowReach = SHADOW_DROP + SHADOW_BLUR * 2
  for (const polygon of country.geometry.coordinates) {
    for (const ring of polygon) {
      for (const position of ring) {
        const point = toPlane(position)
        if (point === null) continue
        const screen = planeToScreen(point)
        minX = Math.min(minX, screen.x - SHADOW_BLUR * 2)
        maxX = Math.max(maxX, screen.x + SHADOW_BLUR * 2)
        minY = Math.min(minY, screen.y)
        maxY = Math.max(maxY, screen.y + shadowReach)
      }
    }
  }
  const stageWidth = maxX - minX
  const stageHeight = maxY - minY

  const cityPlane = toPlane(cityLngLat) ?? { x: 0, y: 0 }
  const cityScreen = planeToScreen(cityPlane)

  return {
    pathD,
    stageAspect: stageWidth / stageHeight,
    plane: {
      leftPct: ((-centre - minX) / stageWidth) * 100,
      topPct: ((-centre - minY) / stageHeight) * 100,
      widthPct: (PLANE_SIZE / stageWidth) * 100,
      heightPct: (PLANE_SIZE / stageHeight) * 100,
    },
    city: {
      leftPct: ((cityScreen.x - minX) / stageWidth) * 100,
      topPct: ((cityScreen.y - minY) / stageHeight) * 100,
    },
    edgeOffset: planeOffsetForScreenDrop(EDGE_DROP),
    shadowOffset: planeOffsetForScreenDrop(SHADOW_DROP),
  }
}
