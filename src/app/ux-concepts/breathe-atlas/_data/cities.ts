/**
 * cities.ts — Breathe Atlas city entries (all 16 Breathe Cities).
 *
 * Purpose
 *   The local content source for the Breathe Atlas globe cover, the cover browser (city carousel)
 *   and the chapter routes. Each entry is shaped like a future content-system entry (brief
 *   section 7: "content lives in local data files shaped like future city entries"), so the
 *   prototype also tests the content structure a CMS would need. Later steps (chapters) extend the
 *   entry rather than adding parallel files.
 *
 *   Also derives the idle-cycle order: start at Bogotá, then continue eastward by longitude,
 *   wrapping round the globe (brief 4.2).
 *
 * Honesty
 *   - Coordinates are the city centre points supplied in the build brief.
 *   - `missionLine` values come from the content pack (ux-writer, 2026-09-17), drafted in our words
 *     from each city's own pages and Breathe Cities pages, with the sources recorded in the pack:
 *     design/globalsite/concepts/breathe-atlas/content/breathe-atlas-content-pack.json
 *     They are real content, not placeholders. No claim is made that a city uses a BC product, and
 *     no leader is named. Change the pack first, then this file.
 *   - `tier` assignments are illustrative (brief section 3), not agreements with any city. Tiers
 *     are never labelled in the interface.
 *   - BC_MISSION_LINE is verbatim from breathecities.org, as supplied in the build brief. The pack
 *     also records BC's longer homepage hero line; the cover keeps this shorter line, which is the
 *     one Jack signed off on the cover.
 *
 * Card images (IMAGE RIGHTS)
 *   `cardImage` URLs point at Breathe Cities' own city card images on breathecities.org. The
 *   images belong to Breathe Cities. They are HOTLINKED for this internal prototype, not
 *   downloaded or copied into the repo, and are shown in greyscale (brief 4.3). Replace them with
 *   licensed or supplied assets before anything outside the prototype uses them.
 *
 * Regions (round 2, item 6)
 *   `region` is Breathe Cities' own four-way grouping from breathecities.org/cities (Africa, Asia,
 *   Europe, LAC), Jack's call on 2026-09-22. It is an explicit field on every city, not inferred from
 *   the country. It is NOT the `region` field in global-toolkit-network or the `continent` field in
 *   /jtbd-framework, which use other labels. Each city's value matches its country's M49 region in
 *   ./m49-regions.ts.
 *
 * Key exports: AtlasCity (type), SharingTier (type), ATLAS_CITIES, CITIES_ALPHABETICAL,
 *   CHAPTER_CITIES, chapterCityBySlug, BC_MISSION_LINE, CYCLE_START_CITY_ID, CYCLE_ORDER
 * External dependencies: ./m49-regions (AtlasRegion type).
 */

import type { AtlasRegion } from './m49-regions'

/** Illustrative data-sharing tier for a chapter city (1 = shares nothing, 4 = shares its own index). */
export type SharingTier = 1 | 2 | 3 | 4

/** One Breathe Cities city, shaped like a future content entry. */
export type AtlasCity = {
  /** Stable id, used for React keys and marker ids. */
  id: string
  /** URL segment for the city's chapter route (`/ux-concepts/breathe-atlas/[slug]`). */
  slug: string
  /** Display name of the city. */
  name: string
  /** Display name of the country. */
  country: string
  /**
   * Breathe Cities region (breathecities.org/cities), set explicitly per city, never derived from
   * the country name. The globe tints this region's whole M49 extent (see ./m49-regions.ts).
   */
  region: AtlasRegion
  /** Globe position: latitude in decimal degrees. */
  lat: number
  /** Globe position: longitude in decimal degrees. */
  lng: number
  /** True for the seven cities that get a chapter in this concept. */
  hasChapter: boolean
  /** One-sentence mission line shown below the globe and in the chapter opener (from the pack). */
  missionLine: string
  /** Breathe Cities' own city card image, hotlinked from breathecities.org (see IMAGE RIGHTS). */
  cardImage: string
  /** Illustrative sharing tier for chapter cities; null for cities without a chapter. */
  tier: SharingTier | null
}

/** BC's own mission line, the same for every city. Verbatim from breathecities.org. */
export const BC_MISSION_LINE = 'Helping cities to clean the air we breathe'

/** Where Breathe Cities serves its card images (WordPress uploads on breathecities.org). */
const BC_UPLOADS_URL = 'https://breathecities.org/wp-content/uploads/'

/** Full URL of a Breathe Cities card image, from its path under the uploads folder. */
function bcImage(uploadPath: string): string {
  return `${BC_UPLOADS_URL}${uploadPath}`
}

/** All 16 Breathe Cities (kept alphabetical for readability; CITIES_ALPHABETICAL enforces the order). */
export const ATLAS_CITIES: AtlasCity[] = [
  { id: 'accra', slug: 'accra', name: 'Accra', country: 'Ghana', region: 'africa', lat: 5.6037, lng: -0.187, hasChapter: false, missionLine: 'Accra is putting free, real-time air quality data in residents\' hands and working with communities to reduce waste burning.', cardImage: bcImage('2025/01/Card-Cities-3.png'), tier: null },
  { id: 'addis-ababa', slug: 'addis-ababa', name: 'Addis Ababa', country: 'Ethiopia', region: 'africa', lat: 9.0054, lng: 38.7636, hasChapter: false, missionLine: 'Addis Ababa is expanding cycling lanes and air quality sensors to guide action for cleaner air.', cardImage: bcImage('2026/06/Addis.png'), tier: null },
  { id: 'bangkok', slug: 'bangkok', name: 'Bangkok', country: 'Thailand', region: 'asia', lat: 13.7563, lng: 100.5018, hasChapter: false, missionLine: 'Bangkok is shaping a stronger Low Emission Zone and expanding community-led air quality monitoring across the city.', cardImage: bcImage('2025/07/Country-cards-65.png'), tier: null },
  { id: 'bogota', slug: 'bogota', name: 'Bogotá', country: 'Colombia', region: 'lac', lat: 4.711, lng: -74.0721, hasChapter: true, missionLine: 'Bogotá is bringing clean air zones to its southwestern neighbourhoods, with road repairs, greening, transport and monitoring.', cardImage: bcImage('2024/09/Bogota-e1728988673808.png'), tier: 4 },
  { id: 'brussels', slug: 'brussels', name: 'Brussels', country: 'Belgium', region: 'europe', lat: 50.8503, lng: 4.3517, hasChapter: false, missionLine: 'Brussels is making air quality a public health priority, with cleaner transport, greener spaces and its Low Emission Zone.', cardImage: bcImage('2023/11/Property-1Brussels.png'), tier: null },
  { id: 'jakarta', slug: 'jakarta', name: 'Jakarta', country: 'Indonesia', region: 'asia', lat: -6.2088, lng: 106.8456, hasChapter: true, missionLine: 'Jakarta is giving residents clear, real-time air quality information and designing its next Low Emission Zone with communities.', cardImage: bcImage('2023/11/Property-1Jakarta.png'), tier: 2 },
  { id: 'johannesburg', slug: 'johannesburg', name: 'Johannesburg', country: 'South Africa', region: 'africa', lat: -26.2041, lng: 28.0473, hasChapter: true, missionLine: 'Johannesburg is working with young people and community groups to build the evidence and support for cleaner air.', cardImage: bcImage('2025/07/card-cities-johannesburg.png'), tier: 4 },
  { id: 'london', slug: 'london', name: 'London', country: 'United Kingdom', region: 'europe', lat: 51.5074, lng: -0.1278, hasChapter: false, missionLine: 'London is putting real-time air quality data into the hands of its communities to guide action on cleaner air.', cardImage: bcImage('2025/07/card-cities-london.png'), tier: null },
  { id: 'madrid', slug: 'madrid', name: 'Madrid', country: 'Spain', region: 'europe', lat: 40.4168, lng: -3.7038, hasChapter: false, missionLine: 'Madrid is electrifying its buses and expanding cycling routes as it raises its clean air ambitions.', cardImage: bcImage('2026/06/Madrid_1.jpg'), tier: null },
  { id: 'mexico-city', slug: 'mexico-city', name: 'Mexico City', country: 'Mexico', region: 'lac', lat: 19.4326, lng: -99.1332, hasChapter: true, missionLine: 'Mexico City is bringing neighbourhood-level air quality data to community hubs where residents gather every day.', cardImage: bcImage('2025/07/Country-cards-66.png'), tier: 3 },
  { id: 'milan', slug: 'milan', name: 'Milan', country: 'Italy', region: 'europe', lat: 45.4642, lng: 9.19, hasChapter: true, missionLine: 'Milan is redesigning its streets around people, with safer school streets, more space to walk and a low emission zone.', cardImage: bcImage('2025/07/card-cities-milan.png'), tier: 1 },
  { id: 'nairobi', slug: 'nairobi', name: 'Nairobi', country: 'Kenya', region: 'africa', lat: -1.2921, lng: 36.8219, hasChapter: false, missionLine: 'Nairobi runs its own network of air quality sensors, using the data to guide targeted clean air action.', cardImage: bcImage('2025/07/card-cities-nairobi.png'), tier: null },
  { id: 'paris', slug: 'paris', name: 'Paris', country: 'France', region: 'europe', lat: 48.8566, lng: 2.3522, hasChapter: false, missionLine: 'Paris is reshaping its streets for people, with more school streets and greener, walkable avenues.', cardImage: bcImage('2025/07/card-cities-paris.png'), tier: null },
  { id: 'rio-de-janeiro', slug: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil', region: 'lac', lat: -22.9068, lng: -43.1729, hasChapter: false, missionLine: 'Rio de Janeiro is widening public access to air quality data and has created a central Low Emission District.', cardImage: bcImage('2025/07/card-cities-rio.png'), tier: null },
  { id: 'sofia', slug: 'sofia', name: 'Sofia', country: 'Bulgaria', region: 'europe', lat: 42.6977, lng: 23.3219, hasChapter: true, missionLine: 'Sofia is replacing wood and coal stoves in thousands of homes and restricting older, polluting cars in its centre.', cardImage: bcImage('2023/11/Property-1Sofia.png'), tier: 4 },
  { id: 'warsaw', slug: 'warsaw', name: 'Warsaw', country: 'Poland', region: 'europe', lat: 52.2297, lng: 21.0122, hasChapter: true, missionLine: 'Warsaw is helping households switch from coal heating and working to cut traffic pollution with its Clean Transport Zone.', cardImage: bcImage('2023/11/Property-1Warsaw.png'), tier: 4 },
]

/**
 * The 16 cities sorted by name for the cover browser (brief 4.3: "all 16 cities in alphabetical
 * order"). Sorted here rather than trusting the array order, so a new entry cannot break it.
 */
export const CITIES_ALPHABETICAL: AtlasCity[] = [...ATLAS_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'en'))

/** The seven cities that have a chapter route. */
export const CHAPTER_CITIES: AtlasCity[] = CITIES_ALPHABETICAL.filter((city) => city.hasChapter)

/** The chapter city for a route slug, or null when the slug is not a chapter city. */
export function chapterCityBySlug(slug: string): AtlasCity | null {
  return CHAPTER_CITIES.find((city) => city.slug === slug) ?? null
}

/** The city the idle cycle starts on (brief 4.2: "It starts at Bogotá"). */
export const CYCLE_START_CITY_ID = 'bogota'

/**
 * Idle-cycle order: Bogotá first, then every other city eastward by longitude, wrapping round.
 *
 * Why this derivation: each city's eastward offset from Bogotá is `(lng - startLng + 360) % 360`,
 * so sorting by that offset gives a single continuous eastward sweep that starts at Bogotá and
 * wraps past the antimeridian (Jakarta, then Mexico City, then back to Bogotá). Every step in the
 * resulting loop is under 180 degrees of longitude, so globe.gl's shortest-path camera tween
 * always travels eastward.
 */
function buildCycleOrder(cities: AtlasCity[], startId: string): AtlasCity[] {
  const start = cities.find((city) => city.id === startId)
  if (start === undefined) return [...cities]
  const eastOffset = (city: AtlasCity): number => (city.lng - start.lng + 360) % 360
  return [...cities].sort((a, b) => eastOffset(a) - eastOffset(b))
}

/** The 16 cities in idle-cycle order (see buildCycleOrder). */
export const CYCLE_ORDER: AtlasCity[] = buildCycleOrder(ATLAS_CITIES, CYCLE_START_CITY_ID)
