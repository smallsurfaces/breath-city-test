/**
 * boundaries.ts — the data cities' administrative outlines, typed (brief 6.1).
 *
 * Purpose
 *   The data map shows "a faint city boundary line, with everything outside the boundary greyed
 *   out". This module loads the simplified outline for each of the six data cities and hands the
 *   map both the rings and the attribution it must display.
 *
 * Provenance and licence (READ BEFORE EDITING)
 *   Each outline is the city's administrative boundary from OpenStreetMap, fetched once on
 *   2026-09-17 through the Nominatim search API (polygon_geojson=1) and simplified. The exact
 *   queries, the relation chosen per city and the simplification settings are in
 *   ./generators/gen_boundaries.py; each file repeats them in its own `_note`.
 *
 *   OpenStreetMap data is (c) OpenStreetMap contributors, published under the Open Database
 *   License. ATTRIBUTION is not optional: the map adds `BOUNDARY_ATTRIBUTION` to its Mapbox
 *   attribution control. Do not render a boundary without it.
 *
 * What was simplified away
 *   Outer rings only, so lakes and enclaves inside a city are not cut out of the mask, and rings
 *   under 2e-5 square degrees were dropped. The outline is therefore honest at city zoom and
 *   approximate close in; it is a backdrop, never a statement about where a border runs.
 *
 * Key exports: CityBoundary, BOUNDARY_ATTRIBUTION, cityBoundary
 * External dependencies: ./boundaries/*.json.
 */

import bogotaBoundary from './boundaries/bogota.json'
import jakartaBoundary from './boundaries/jakarta.json'
import johannesburgBoundary from './boundaries/johannesburg.json'
import mexicoCityBoundary from './boundaries/mexico-city.json'
import sofiaBoundary from './boundaries/sofia.json'
import warsawBoundary from './boundaries/warsaw.json'

/** The credit the map must show wherever a boundary is drawn. */
export const BOUNDARY_ATTRIBUTION = '© OpenStreetMap contributors (city boundary, ODbL)'

/** One city's outline. */
export type CityBoundary = {
  /** Route slug. */
  city: string
  /** Which OpenStreetMap relation this is, and what it covers. */
  osmId: number
  osmName: string
  what: string
  /** Closed rings of [longitude, latitude] pairs, largest first. */
  rings: Array<Array<[number, number]>>
}

/** Narrow one ring, or throw: a malformed ring would draw a mask over the whole map. */
function parseRing(value: unknown, where: string): Array<[number, number]> {
  if (!Array.isArray(value) || value.length < 4) {
    throw new Error(`Breathe Atlas boundary: ${where} has fewer than 4 points`)
  }
  return value.map((point, index) => {
    if (!Array.isArray(point) || point.length !== 2 || typeof point[0] !== 'number' || typeof point[1] !== 'number') {
      throw new Error(`Breathe Atlas boundary: ${where}[${index}] is not a [lng, lat] pair`)
    }
    return [point[0], point[1]]
  })
}

/** Narrow one boundary file, or throw. The chapters are pre-rendered, so a bad file fails the build. */
function parseBoundary(value: unknown, slug: string): CityBoundary {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Breathe Atlas boundary: ${slug}.json is not an object`)
  }
  const record = value as Record<string, unknown>
  if (record.city !== slug) {
    throw new Error(`Breathe Atlas boundary: ${slug}.json says it is "${String(record.city)}"`)
  }
  if (!Array.isArray(record.rings) || record.rings.length === 0) {
    throw new Error(`Breathe Atlas boundary: ${slug}.json has no rings`)
  }
  return {
    city: slug,
    osmId: typeof record.osmId === 'number' ? record.osmId : 0,
    osmName: typeof record.osmName === 'string' ? record.osmName : slug,
    what: typeof record.what === 'string' ? record.what : '',
    rings: record.rings.map((ring, index) => parseRing(ring, `${slug}.rings[${index}]`)),
  }
}

/** Every data city's outline, keyed by route slug. */
const CITY_BOUNDARIES: Record<string, CityBoundary> = {
  bogota: parseBoundary(bogotaBoundary as unknown, 'bogota'),
  jakarta: parseBoundary(jakartaBoundary as unknown, 'jakarta'),
  johannesburg: parseBoundary(johannesburgBoundary as unknown, 'johannesburg'),
  'mexico-city': parseBoundary(mexicoCityBoundary as unknown, 'mexico-city'),
  sofia: parseBoundary(sofiaBoundary as unknown, 'sofia'),
  warsaw: parseBoundary(warsawBoundary as unknown, 'warsaw'),
}

/**
 * One city's outline, or null when there is none. Null is a supported state, not an error: the map
 * then draws no boundary and no mask rather than guessing an outline (brief 6.1 fallback).
 */
export function cityBoundary(slug: string): CityBoundary | null {
  return CITY_BOUNDARIES[slug] ?? null
}
