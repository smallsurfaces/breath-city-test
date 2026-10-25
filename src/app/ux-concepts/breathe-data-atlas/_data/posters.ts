/**
 * posters.ts — the poster maps on the city cards, typed (spec 3.1).
 *
 * Purpose
 *   Five prototype cities (Bogotá, Jakarta, Brussels, Sofia, Milan) have a poster map: a static,
 *   greyscale render of the city's administrative outline and major streets, with the city's
 *   stations at their positions, clipped to the outline. Every other city shares ONE abstract
 *   placeholder that looks like no real place: no outline, no stations, no pulses.
 *
 *   The poster images are generated once by ./generators/gen_posters.py into
 *   public/ux-concepts/breathe-data-atlas/posters/. This module reads ./posters.json (viewBox size
 *   and station positions in viewBox units) and validates it, so a bad regeneration fails the build.
 *
 * Station positions (spec 3.1)
 *   Bogotá and Sofia: only Atlas sensor entries with `placed: false` (real positions from the
 *   official-network snapshot). Jakarta, Brussels and Milan: approximate positions read by eye from
 *   each city's own official map, recorded with `positionSource` in ./poster-stations/*.json and
 *   never mistaken for surveyed coordinates. Positions are never shown as numbers anywhere.
 *
 * Credit
 *   Outlines and streets are OpenStreetMap data, (c) OpenStreetMap contributors, ODbL.
 *   POSTER_ATTRIBUTION is shown behind the "i" wherever posters appear.
 *
 * Key exports: PosterCity, Poster, POSTER_ATTRIBUTION, POSTER_STATION_NOTE, posterFor,
 *   PLACEHOLDER_POSTER_URL, posterUrl
 * External dependencies: ./posters.json.
 */

import postersJson from './posters.json'

/** The five cities with a poster map in this pass (Jack, 25 October). */
export type PosterCity = 'bogota' | 'jakarta' | 'brussels' | 'sofia' | 'milan'

/** One city's poster geometry. */
export type Poster = {
  /** Route slug. */
  city: PosterCity
  /** viewBox width and height of the poster image. */
  width: number
  height: number
  /** Station positions in viewBox units, clipped to the outline. */
  stations: Array<[number, number]>
  /** Indexes into `stations`: the handful shown on the small globe card (spec 3.1). */
  globeStations: number[]
}

/** Credit for the poster maps, shown behind an "i". */
export const POSTER_ATTRIBUTION = 'City outlines and streets: © OpenStreetMap contributors (ODbL).'

/** How the station positions on the posters were taken (spec 3.1). */
export const POSTER_STATION_NOTE =
  "Stations: Bogotá and Sofia from their official networks; Jakarta, Brussels and Milan approximate, read from each city's own map. Other cities show a placeholder until the five are approved."

/** Public folder the generator writes the poster images to. */
const POSTER_FOLDER = '/ux-concepts/breathe-data-atlas/posters'

/** The shared placeholder image for every city without a poster. */
export const PLACEHOLDER_POSTER_URL = `${POSTER_FOLDER}/placeholder.svg`

/** The image URL of a city's poster. */
export function posterUrl(city: PosterCity): string {
  return `${POSTER_FOLDER}/${city}.svg`
}

/** Narrow one pair of numbers, or throw. */
function asPoint(value: unknown, where: string): [number, number] {
  if (!Array.isArray(value) || value.length !== 2 || typeof value[0] !== 'number' || typeof value[1] !== 'number') {
    throw new Error(`Breathe Data Atlas posters: ${where} is not a point`)
  }
  return [value[0], value[1]]
}

/** Narrow one city's poster record, or throw (the pages are pre-rendered, so this fails the build). */
function parsePoster(city: PosterCity, value: unknown): Poster {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Breathe Data Atlas posters: ${city} is missing from posters.json`)
  }
  const record = value as Record<string, unknown>
  const [width, height] = asPoint(record.viewBox, `${city}.viewBox`)
  if (!Array.isArray(record.stations) || !Array.isArray(record.globeStations)) {
    throw new Error(`Breathe Data Atlas posters: ${city} has no stations`)
  }
  const stations = record.stations.map((point, index) => asPoint(point, `${city}.stations[${index}]`))
  const globeStations = record.globeStations.map((entry) => {
    if (typeof entry !== 'number' || entry < 0 || entry >= stations.length) {
      throw new Error(`Breathe Data Atlas posters: ${city}.globeStations has a bad index`)
    }
    return entry
  })
  return { city, width, height, stations, globeStations }
}

const POSTER_CITIES: PosterCity[] = ['bogota', 'jakarta', 'brussels', 'sofia', 'milan']

const POSTERS_RECORD = (postersJson as { posters: Record<string, unknown> }).posters

/** Every poster, keyed by slug. */
const POSTERS: Record<PosterCity, Poster> = Object.fromEntries(
  POSTER_CITIES.map((city) => [city, parsePoster(city, POSTERS_RECORD[city])]),
) as Record<PosterCity, Poster>

/** A city's poster, or null when the city shows the shared placeholder. */
export function posterFor(slug: string): Poster | null {
  return (POSTER_CITIES as string[]).includes(slug) ? POSTERS[slug as PosterCity] : null
}
