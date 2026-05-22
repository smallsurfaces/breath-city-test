/**
 * cities.ts — Typed city registry for OpenAQ data fetching
 *
 * Purpose:
 *   The single source of truth for which cities the data core can serve. Each city carries
 *   the map framing (center, zoom) and the OpenAQ query bbox. Adding a new city is one entry
 *   in CITIES — no other file needs to change.
 *
 * Key exports: City, CITIES, getCity, isKnownCity, CITY_SLUGS
 * External dependencies: none.
 *
 * Why bbox, not radius: OpenAQ v3 /locations supports a `radius` filter but caps it at 25 km,
 * which is smaller than these cities. bbox is the only geographic filter that reliably scopes
 * a whole city (probe-verified — parameter-scoped latest endpoints ignore bbox entirely).
 * bbox order is [minLon, minLat, maxLon, maxLat].
 */

/**
 * A city served by the data core.
 * `center` is [longitude, latitude] (Mapbox order). `bbox` is [minLon, minLat, maxLon, maxLat]
 * (the order OpenAQ's /locations endpoint expects).
 */
export type City = {
  slug: string
  name: string
  center: [number, number]
  zoom: number
  bbox: [number, number, number, number]
}

/**
 * Registry of supported cities. bboxes are probe-verified against the live OpenAQ API
 * (London returns >100 locations; Accra returns 83). Centers/zooms are chosen to frame each
 * city sensibly on the existing Mapbox view.
 */
export const CITIES: readonly City[] = [
  {
    slug: 'london',
    name: 'London',
    center: [-0.118, 51.509],
    zoom: 10.5,
    bbox: [-0.51, 51.287, 0.334, 51.692],
  },
  {
    slug: 'accra',
    name: 'Accra',
    center: [-0.187, 5.604],
    zoom: 11,
    bbox: [-0.35, 5.45, 0.1, 5.85],
  },
] as const

/** All registered city slugs — convenient for error messages and validation. */
export const CITY_SLUGS: readonly string[] = CITIES.map((city) => city.slug)

/**
 * Look up a city by slug. Returns undefined for unknown slugs so callers can decide how to
 * respond (the route handler turns this into an HTTP 400 rather than throwing).
 */
export function getCity(slug: string): City | undefined {
  return CITIES.find((city) => city.slug === slug)
}

/** Type guard: true when `slug` matches a registered city. */
export function isKnownCity(slug: string): boolean {
  return CITIES.some((city) => city.slug === slug)
}
