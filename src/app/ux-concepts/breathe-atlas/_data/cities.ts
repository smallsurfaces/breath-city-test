/**
 * cities.ts — Breathe Atlas city entries (all 16 Breathe Cities).
 *
 * Purpose
 *   The local content source for the Breathe Atlas globe cover. Each entry is shaped like a
 *   future content-system entry (brief section 7: "content lives in local data files shaped like
 *   future city entries"), so the prototype also tests the content structure a CMS would need.
 *   This first build step uses only the fields the cover needs; later steps (cover browser,
 *   chapters) extend the entry rather than adding parallel files.
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
 * Key exports: AtlasCity (type), SharingTier (type), ATLAS_CITIES, BC_MISSION_LINE,
 *   CYCLE_START_CITY_ID, CYCLE_ORDER
 * External dependencies: none.
 */

/** Illustrative data-sharing tier for a chapter city (1 = shares nothing, 4 = shares its own index). */
export type SharingTier = 1 | 2 | 3 | 4

/** One Breathe Cities city, shaped like a future content entry. */
export type AtlasCity = {
  /** Stable slug id, used for keys, marker ids and future chapter routes. */
  id: string
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
  /** Illustrative sharing tier for chapter cities; null for cities without a chapter. */
  tier: SharingTier | null
}

/** BC's own mission line, the same for every city. Verbatim from breathecities.org. */
export const BC_MISSION_LINE = 'Helping cities to clean the air we breathe'

/**
 * Builds the obviously-placeholder mission line for a city. One realistic-length sentence so the
 * layout is tested at a true length, worded so nobody can mistake it for a real claim.
 */
function placeholderMission(cityName: string): string {
  return `Placeholder: one sentence on ${cityName}'s clean air mission, roughly this long.`
}

/** All 16 Breathe Cities, in alphabetical order (the order the cover browser will use later). */
export const ATLAS_CITIES: AtlasCity[] = [
  { id: 'accra', name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.187, hasChapter: false, missionLine: placeholderMission('Accra'), tier: null },
  { id: 'addis-ababa', name: 'Addis Ababa', country: 'Ethiopia', lat: 9.0054, lng: 38.7636, hasChapter: false, missionLine: placeholderMission('Addis Ababa'), tier: null },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, hasChapter: false, missionLine: placeholderMission('Bangkok'), tier: null },
  { id: 'bogota', name: 'Bogotá', country: 'Colombia', lat: 4.711, lng: -74.0721, hasChapter: true, missionLine: placeholderMission('Bogotá'), tier: 4 },
  { id: 'brussels', name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, hasChapter: false, missionLine: placeholderMission('Brussels'), tier: null },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, hasChapter: true, missionLine: placeholderMission('Jakarta'), tier: 2 },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, hasChapter: true, missionLine: placeholderMission('Johannesburg'), tier: 4 },
  { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, hasChapter: false, missionLine: placeholderMission('London'), tier: null },
  { id: 'madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, hasChapter: false, missionLine: placeholderMission('Madrid'), tier: null },
  { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, hasChapter: true, missionLine: placeholderMission('Mexico City'), tier: 3 },
  { id: 'milan', name: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.19, hasChapter: true, missionLine: placeholderMission('Milan'), tier: 1 },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, hasChapter: false, missionLine: placeholderMission('Nairobi'), tier: null },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, hasChapter: false, missionLine: placeholderMission('Paris'), tier: null },
  { id: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, hasChapter: false, missionLine: placeholderMission('Rio de Janeiro'), tier: null },
  { id: 'sofia', name: 'Sofia', country: 'Bulgaria', lat: 42.6977, lng: 23.3219, hasChapter: true, missionLine: placeholderMission('Sofia'), tier: 4 },
  { id: 'warsaw', name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, hasChapter: true, missionLine: placeholderMission('Warsaw'), tier: 4 },
]

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
