/**
 * region-raster.ts — paints the four Breathe Cities regions onto an equirectangular canvas, so
 * globe-texture.ts can bake each region's grey into the globe (round 2 item 6; grey since round 3
 * R3.1).
 *
 * Purpose
 *   Returns an RGBA pixel layer the size of the globe texture, in which every pixel inside a region
 *   carries the value the caller passed for that region (alpha = how much of the pixel the region
 *   covers) and every other pixel is transparent. The caller (AtlasGlobe) passes a grey level per
 *   region, derived from BC tokens; this file draws whatever it is given and holds no colour of its
 *   own. globe-texture.ts applies it to LAND pixels only, so the coastlines
 *   still come from the relief texture's own land/water mask and the outlines here only have to say
 *   which region a piece of land is in.
 *
 * Geometry
 *   Country outlines: Natural Earth 1:110m, from the `world-atlas` npm package (already a dependency,
 *   ISC). 110m rather than the chapters' 50m because this runs in the browser: the 110m file is about
 *   105 KB and is loaded with a dynamic import, so it only downloads with the globe. Each country's
 *   region comes from the M49 table in ../_data/m49-regions.ts.
 *
 *   Projection: d3-geo equirectangular, scaled so longitude -180..180 spans the texture width and
 *   latitude 90..-90 its height, which is the layout globe.gl maps onto the sphere.
 *
 *   Antimeridian (Russia's Chukotka, Fiji): d3-geo clips every polygon at the antimeridian before it
 *   projects it, so a country that crosses 180 degrees is drawn as two pieces at the two edges of the
 *   texture instead of one smear across the whole width.
 *
 *   Coastline slack: 110m outlines are simplified, so a thin strip of real coast (from the relief
 *   texture's mask) can fall just outside them. Each region is therefore also stroked COAST_SLACK_PX
 *   wide, which pushes it about half that far out to sea (the sea is never tinted, so this is safe).
 *   The spill that crosses a land border into an untinted country (Mexico into the United States,
 *   Indonesia into Papua New Guinea) is then erased by painting the untinted countries out.
 *
 * Key exports: RegionTintColours (type), buildRegionTintLayer
 * External dependencies: d3-geo (geoEquirectangular, geoPath), topojson-client (feature),
 *   world-atlas/countries-110m.json (dynamic import), ../_data/m49-regions.
 *   Browser only (canvas 2D). Never call during server rendering.
 */

import { geoEquirectangular, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import { ATLAS_REGIONS, FRANCE_ISO_NUMERIC, franceOverseasRegion, m49RegionOf } from '../_data/m49-regions'
import type { AtlasRegion } from '../_data/m49-regions'

/** One value per region, as 0-255 RGB (a grey, R = G = B, since round 3). Derived from BC tokens by the caller. */
export type RegionTintColours = Record<AtlasRegion, [number, number, number]>

/** Properties world-atlas stores on each country. */
type CountryProperties = { name: string }

/** The world-atlas countries topology, typed. (The JSON itself is untyped data.) */
type CountriesTopology = Topology<{ countries: GeometryCollection<CountryProperties> }>

/** A drawable shape and the region it belongs to (null: untinted, painted out). */
type RegionShape = { region: AtlasRegion | null; geometry: Polygon | MultiPolygon }

/**
 * Stroke width (px on the texture) added around every region to cover coast the simplified 110m
 * outlines miss. On the 2048px-wide texture 1px is about 0.18 degrees, so the region reaches about
 * 0.5 degrees out to sea.
 */
const COAST_SLACK_PX = 6

/** The polygons of a Polygon or MultiPolygon, as a list of Polygon coordinate arrays. */
function polygonsOf(geometry: Polygon | MultiPolygon): Polygon['coordinates'][] {
  return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
}

/** Mean of a polygon's outer ring, as [lng, lat]: good enough to tell which region a part is in. */
function ringMean(polygon: Polygon['coordinates']): [number, number] {
  const ring = polygon[0] ?? []
  if (ring.length === 0) return [0, 0]
  let lng = 0
  let lat = 0
  for (const [x, y] of ring) {
    lng += x
    lat += y
  }
  return [lng / ring.length, lat / ring.length]
}

/**
 * Every country as one or more RegionShapes. France is split into its parts, because world-atlas
 * draws French Guiana (M49 LAC) inside France's outline (see ../_data/m49-regions.ts).
 */
function regionShapes(countries: FeatureCollection<Geometry, CountryProperties>): RegionShape[] {
  const shapes: RegionShape[] = []
  for (const country of countries.features as Feature<Geometry, CountryProperties>[]) {
    const geometry = country.geometry
    if (geometry === null || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) continue
    const id = country.id === undefined ? undefined : String(country.id)
    if (id === FRANCE_ISO_NUMERIC) {
      for (const polygon of polygonsOf(geometry)) {
        const [lng, lat] = ringMean(polygon)
        shapes.push({ region: franceOverseasRegion(lng, lat), geometry: { type: 'Polygon', coordinates: polygon } })
      }
      continue
    }
    shapes.push({ region: m49RegionOf(id, country.properties.name), geometry })
  }
  return shapes
}

/**
 * Builds the region tint layer: RGBA pixels, `width` x `height`, equirectangular. Resolves null if
 * a canvas context is unavailable. Rejects if the countries file cannot be loaded; the caller then
 * renders the globe untinted.
 *
 * Side effects: creates an offscreen canvas; downloads world-atlas's 110m countries file (once, via
 * the bundler's dynamic import).
 */
export async function buildRegionTintLayer(
  width: number,
  height: number,
  colours: RegionTintColours,
): Promise<Uint8ClampedArray | null> {
  const countriesModule = await import('world-atlas/countries-110m.json')
  const topology = (countriesModule.default ?? countriesModule) as unknown as CountriesTopology
  const countries = feature(topology, topology.objects.countries)
  const shapes = regionShapes(countries)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (ctx === null) return null

  // Longitude -180..180 across the width, latitude 90..-90 down the height.
  const projection = geoEquirectangular()
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 2])
  const path = geoPath(projection, ctx)

  // Tinted regions: fill, plus the coastline slack stroke in the same colour.
  ctx.lineJoin = 'round'
  ctx.lineWidth = COAST_SLACK_PX
  for (const region of ATLAS_REGIONS) {
    const [r, g, b] = colours[region]
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    ctx.strokeStyle = ctx.fillStyle
    for (const shape of shapes) {
      if (shape.region !== region) continue
      ctx.beginPath()
      path(shape.geometry)
      ctx.fill()
      ctx.stroke()
    }
  }

  // Untinted countries (Northern America, Oceania, Antarctica): erase any slack that spilled onto them.
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = 'rgb(0, 0, 0)'
  for (const shape of shapes) {
    if (shape.region !== null) continue
    ctx.beginPath()
    path(shape.geometry)
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'

  return ctx.getImageData(0, 0, width, height).data
}
