/**
 * country-maps.ts — which country outline each chapter's stylised country map draws (brief 5.4).
 *
 * Purpose
 *   Maps each chapter city to its country in the `world-atlas` countries dataset (Natural Earth
 *   1:50m, via the world-atlas npm package, ISC). Kept apart from chapters.ts because it is render
 *   configuration, not content a city supplies.
 *
 *   `isoNumeric` is the ISO 3166-1 numeric code, which world-atlas uses as each country's id.
 *   `keepWithin` drops far-off territories whose outline would shrink the mainland to a speck: a
 *   polygon is kept only if its centre lies inside the box. Only South Africa needs one, for the
 *   Prince Edward Islands (about 37.7 E, 46.9 S). Every other country draws all its polygons.
 *
 * Key exports: CountryMapSpec (type), GeoBox (type), COUNTRY_MAPS
 * External dependencies: ./chapters (ChapterSlug type).
 */

import type { ChapterSlug } from './chapters'

/** A longitude/latitude box: west, south, east, north, in decimal degrees. */
export type GeoBox = {
  west: number
  south: number
  east: number
  north: number
}

/** Which world-atlas country to draw, and which of its polygons to keep. */
export type CountryMapSpec = {
  /** ISO 3166-1 numeric code (world-atlas feature id), as a zero-padded string. */
  isoNumeric: string
  /** Keep only polygons whose centre is inside this box, or null to keep them all. */
  keepWithin: GeoBox | null
}

/** Country map spec for each chapter city. */
export const COUNTRY_MAPS: Record<ChapterSlug, CountryMapSpec> = {
  bogota: { isoNumeric: '170', keepWithin: null }, // Colombia
  jakarta: { isoNumeric: '360', keepWithin: null }, // Indonesia
  johannesburg: { isoNumeric: '710', keepWithin: { west: 15, south: -36, east: 34, north: -21 } }, // South Africa, mainland only
  'mexico-city': { isoNumeric: '484', keepWithin: null }, // Mexico
  milan: { isoNumeric: '380', keepWithin: null }, // Italy
  sofia: { isoNumeric: '100', keepWithin: null }, // Bulgaria
  warsaw: { isoNumeric: '616', keepWithin: null }, // Poland
}
