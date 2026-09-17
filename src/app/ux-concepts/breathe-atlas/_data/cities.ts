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
 *   - `missionLine` values are PLACEHOLDERS and read as placeholders on purpose. No real-sounding
 *     claim about any city is made here.
 *   - `tier` assignments are illustrative (brief section 3), not agreements with any city. Tiers
 *     are never labelled in the interface.
 *   - BC_MISSION_LINE is verbatim from breathecities.org, as supplied in the build brief.
 *
 * Card images (IMAGE RIGHTS)
 *   `cardImage` URLs point at Breathe Cities' own city card images on breathecities.org. The
 *   images belong to Breathe Cities. They are HOTLINKED for this internal prototype, not
 *   downloaded or copied into the repo, and are shown in greyscale (brief 4.3). Replace them with
 *   licensed or supplied assets before anything outside the prototype uses them.
 *
 * Key exports: AtlasCity (type), SharingTier (type), ATLAS_CITIES, CITIES_ALPHABETICAL,
 *   CHAPTER_CITIES, chapterCityBySlug, BC_MISSION_LINE, CYCLE_START_CITY_ID, CYCLE_ORDER
 * External dependencies: none.
 */

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
  /** Globe position: latitude in decimal degrees. */
  lat: number
  /** Globe position: longitude in decimal degrees. */
  lng: number
  /** True for the seven cities that get a chapter in this concept. */
  hasChapter: boolean
  /** One-sentence mission line shown below the globe. PLACEHOLDER copy in this build. */
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

/**
 * Builds the obviously-placeholder mission line for a city. One realistic-length sentence so the
 * layout is tested at a true length, worded so nobody can mistake it for a real claim.
 */
function placeholderMission(cityName: string): string {
  return `Placeholder: one sentence on ${cityName}'s clean air mission, roughly this long.`
}

/** All 16 Breathe Cities (kept alphabetical for readability; CITIES_ALPHABETICAL enforces the order). */
export const ATLAS_CITIES: AtlasCity[] = [
  { id: 'accra', slug: 'accra', name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.187, hasChapter: false, missionLine: placeholderMission('Accra'), cardImage: bcImage('2025/01/Card-Cities-3.png'), tier: null },
  { id: 'addis-ababa', slug: 'addis-ababa', name: 'Addis Ababa', country: 'Ethiopia', lat: 9.0054, lng: 38.7636, hasChapter: false, missionLine: placeholderMission('Addis Ababa'), cardImage: bcImage('2026/06/Addis.png'), tier: null },
  { id: 'bangkok', slug: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, hasChapter: false, missionLine: placeholderMission('Bangkok'), cardImage: bcImage('2025/07/Country-cards-65.png'), tier: null },
  { id: 'bogota', slug: 'bogota', name: 'Bogotá', country: 'Colombia', lat: 4.711, lng: -74.0721, hasChapter: true, missionLine: placeholderMission('Bogotá'), cardImage: bcImage('2024/09/Bogota-e1728988673808.png'), tier: 4 },
  { id: 'brussels', slug: 'brussels', name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, hasChapter: false, missionLine: placeholderMission('Brussels'), cardImage: bcImage('2023/11/Property-1Brussels.png'), tier: null },
  { id: 'jakarta', slug: 'jakarta', name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, hasChapter: true, missionLine: placeholderMission('Jakarta'), cardImage: bcImage('2023/11/Property-1Jakarta.png'), tier: 2 },
  { id: 'johannesburg', slug: 'johannesburg', name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, hasChapter: true, missionLine: placeholderMission('Johannesburg'), cardImage: bcImage('2025/07/card-cities-johannesburg.png'), tier: 4 },
  { id: 'london', slug: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, hasChapter: false, missionLine: placeholderMission('London'), cardImage: bcImage('2025/07/card-cities-london.png'), tier: null },
  { id: 'madrid', slug: 'madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, hasChapter: false, missionLine: placeholderMission('Madrid'), cardImage: bcImage('2026/06/Madrid_1.jpg'), tier: null },
  { id: 'mexico-city', slug: 'mexico-city', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, hasChapter: true, missionLine: placeholderMission('Mexico City'), cardImage: bcImage('2025/07/Country-cards-66.png'), tier: 3 },
  { id: 'milan', slug: 'milan', name: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.19, hasChapter: true, missionLine: placeholderMission('Milan'), cardImage: bcImage('2025/07/card-cities-milan.png'), tier: 1 },
  { id: 'nairobi', slug: 'nairobi', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, hasChapter: false, missionLine: placeholderMission('Nairobi'), cardImage: bcImage('2025/07/card-cities-nairobi.png'), tier: null },
  { id: 'paris', slug: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, hasChapter: false, missionLine: placeholderMission('Paris'), cardImage: bcImage('2025/07/card-cities-paris.png'), tier: null },
  { id: 'rio-de-janeiro', slug: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, hasChapter: false, missionLine: placeholderMission('Rio de Janeiro'), cardImage: bcImage('2025/07/card-cities-rio.png'), tier: null },
  { id: 'sofia', slug: 'sofia', name: 'Sofia', country: 'Bulgaria', lat: 42.6977, lng: 23.3219, hasChapter: true, missionLine: placeholderMission('Sofia'), cardImage: bcImage('2023/11/Property-1Sofia.png'), tier: 4 },
  { id: 'warsaw', slug: 'warsaw', name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, hasChapter: true, missionLine: placeholderMission('Warsaw'), cardImage: bcImage('2023/11/Property-1Warsaw.png'), tier: 4 },
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
