/**
 * proof-cities.ts — concept-local city + tool directory for the proof-directory globe.
 *
 * Purpose
 *   The single data source for the /ux-concepts/global-toolkit-network proof-directory section.
 *   Every pin on the globe and every tool row in a city panel comes from this file. It is OWNED
 *   by this concept and built fresh — it deliberately does NOT read from the aq-network-v2
 *   programme snapshot or any other concept's data (full-isolation rule from the section brief).
 *
 * The honesty model (the project's backbone — see globe-directory-section-brief.md §"Honesty rules")
 *   - Three pin STATES: 'proven' (clickable, real tool list), 'newly-joined' (clickable, honest
 *     empty state — no fabricated rows), 'member' (presence dot, NOT clickable).
 *   - Population is CITY POPULATION, always a labelled estimate — never "people reached/served".
 *   - A tool ROW may exist on educated-guess presence, but its live-link CTA only fires on a REAL
 *     researched URL. Where we hold no URL the CTA is rendered visibly DISABLED ("Link coming
 *     soon"). Guessed-presence rows carry `illustrative: true` and never an active CTA.
 *   - Third-party tool links are framed "see the tool this city uses" via `provider` (e.g. WAQI,
 *     OpenAQ, AirQo) — not "visit the city's own site".
 *
 * Data provenance (real where it exists — Jack's locked call 2026-06-25)
 *   - CDMX + Paris tool rows + URLs: research/landscape/analysis/
 *       "JTBD Job Chains — City Product Mapping — NOTES.md" (deep CDMX + Paris mapping).
 *   - Accra tool rows + URLs: research/landscape/archive/
 *       "Global South AQ Products — SUM.md" (AirQo, Breathe Accra, Ghana EPA, GHAir, AfriqAir,
 *       Clean Air Network Africa — all real URLs).
 *   - Coordinates + city populations are public-knowledge estimates (labelled as estimates in UI).
 *
 * Key exports: ProofCity, ProofTool, ToolCategory, PinState (types); PROOF_CITIES (const);
 *   getTotalCityPopulation, getClickableCities (pure helpers).
 * External dependencies: none (plain data + pure functions).
 */

/** Which directory state a pin is in — drives colour, clickability, and panel content. */
export type PinState = 'proven' | 'newly-joined' | 'member'

/** A tool's catalogue category — mirrors the toolkit's Component / Guidance split. */
export type ToolCategory = 'Component' | 'Guidance'

/**
 * One tool row inside a city panel. `url` is the honest bit: a real researched URL renders the
 * active "See the tool →" CTA; `null` renders a visibly DISABLED "Link coming soon". `provider`
 * labels third-party products ("via AirQo" etc.). `illustrative` flags an educated-guess presence
 * (carries a small "illustrative" tag and never an active CTA).
 */
export type ProofTool = {
  /** Stable id, unique within a city (used as React key). */
  id: string
  /** Tool / product name as shown in the row heading. */
  name: string
  /** One-line plain-language blurb of what the tool does for that city. */
  blurb: string
  /** Catalogue category tag. */
  category: ToolCategory
  /** Real researched URL → active CTA. `null` → disabled "Link coming soon". */
  url: string | null
  /** Third-party product label, e.g. "AirQo", "WAQI", "OpenAQ". `null` for none/city-owned. */
  provider: string | null
  /** True when tool PRESENCE is an educated guess (not confirmed in research) — carries a tag. */
  illustrative: boolean
}

/**
 * One city on the globe. `population` is CITY POPULATION (a labelled estimate), never reach.
 * `tools` is the list of tools that city RUNS (only ones it has — never a has/doesn't scorecard).
 * Newly-joined cities carry an empty `tools` array (honest empty state, no fabricated rows).
 */
export type ProofCity = {
  /** Stable slug / React key. */
  slug: string
  /** City display name. */
  name: string
  /** Country display name. */
  country: string
  /** Region tag shown in the panel (LatAm / EU / Africa / etc.). */
  region: string
  /** [lng, lat] for the Mapbox pin. */
  coordinates: [number, number]
  /** Directory state — proven / newly-joined / member. */
  state: PinState
  /** City population — a labelled estimate (shown with the Estimate pill). */
  population: number
  /** Tools this city runs. Empty for newly-joined and member pins. */
  tools: ProofTool[]
}

/**
 * The directory. Three PROVEN clickable cities carry real researched tool rows; two NEWLY-JOINED
 * cities are honest empty states; the rest are MEMBER presence dots. City populations are public
 * estimates (UN/national-census order of magnitude) — labelled as estimates throughout the UI.
 */
export const PROOF_CITIES: ProofCity[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // PROVEN — clickable, real tool lists from the research.
  // ─────────────────────────────────────────────────────────────────────────────

  // CDMX (Mexico City). LatAm. Tools + URLs from City Product Mapping NOTES (deep CDMX chain map).
  // SIMAT is the city's own official monitoring; WAQI / OpenAQ are the third-party access layers.
  {
    slug: 'cdmx',
    name: 'Mexico City',
    country: 'Mexico',
    region: 'LatAm',
    coordinates: [-99.1332, 19.4326],
    state: 'proven',
    population: 9_200_000,
    tools: [
      {
        id: 'cdmx-simat',
        name: 'SIMAT',
        blurb: "The city's own real-time monitoring network — ~35 fixed stations across the metro area.",
        category: 'Component',
        url: 'http://www.aire.cdmx.gob.mx',
        provider: null,
        illustrative: false,
      },
      {
        id: 'cdmx-waqi',
        name: 'Real-time AQI map',
        blurb: 'City-level PM2.5 from SIMAT stations, surfaced on a public map.',
        category: 'Component',
        url: 'https://waqi.info',
        provider: 'WAQI',
        illustrative: false,
      },
      {
        id: 'cdmx-openaq',
        name: 'Open data API',
        blurb: 'SIMAT data made machine-readable — documented, downloadable for researchers.',
        category: 'Component',
        url: 'https://api.openaq.org',
        provider: 'OpenAQ',
        illustrative: false,
      },
      {
        id: 'cdmx-compare',
        name: 'Compare across places & times',
        blurb: 'Historical SIMAT records ingested for trend and cross-place comparison.',
        category: 'Guidance',
        url: 'https://openaq.org',
        provider: 'OpenAQ',
        illustrative: false,
      },
    ],
  },

  // Paris. EU. Tools + URLs from City Product Mapping NOTES (Paris = the reference model — Airparif).
  {
    slug: 'paris',
    name: 'Paris',
    country: 'France',
    region: 'EU',
    coordinates: [2.3522, 48.8566],
    state: 'proven',
    population: 2_100_000,
    tools: [
      {
        id: 'paris-airparif',
        name: 'Airparif',
        blurb: "Dense real-time network, neighbourhood-level coverage, WHO standards shown — the city's monitoring backbone.",
        category: 'Component',
        url: 'https://www.airparif.fr',
        provider: 'Airparif',
        illustrative: false,
      },
      {
        id: 'paris-forecast',
        name: '72-hour forecast',
        blurb: 'Localised AQ forecast integrated with weather, available in the public app.',
        category: 'Component',
        url: 'https://www.airparif.fr',
        provider: 'Airparif',
        illustrative: false,
      },
      {
        id: 'paris-opendata',
        name: 'Open data portal',
        blurb: 'Documented AQ datasets available for download and reuse.',
        category: 'Component',
        url: 'https://data-airparif-asso.opendata.arcgis.com',
        provider: 'Airparif',
        illustrative: false,
      },
      {
        id: 'paris-eea',
        name: 'European peer comparison',
        blurb: 'Cross-country position against EU cities via the European Environment Agency.',
        category: 'Guidance',
        url: 'https://www.eea.europa.eu',
        provider: 'EEA',
        illustrative: false,
      },
    ],
  },

  // Accra. Africa. Tools + URLs from Global South AQ Products SUM (richest linkable GS set).
  {
    slug: 'accra',
    name: 'Accra',
    country: 'Ghana',
    region: 'Africa',
    coordinates: [-0.1870, 5.6037],
    state: 'proven',
    population: 2_600_000,
    tools: [
      {
        id: 'accra-airqo',
        name: 'AirQo',
        blurb: 'Low-cost sensor network built for African cities, with open data and an API.',
        category: 'Component',
        url: 'https://airqo.net',
        provider: 'AirQo',
        illustrative: false,
      },
      {
        id: 'accra-breathe-accra',
        name: 'Breathe Accra',
        blurb: 'Hyperlocal sensor map using Clarity Node devices — data plus public communication.',
        category: 'Component',
        url: 'https://breatheaccra.org',
        provider: 'Breathe Accra',
        illustrative: false,
      },
      {
        id: 'accra-ghana-epa',
        name: 'Ghana EPA AQ portal',
        blurb: "The national environment agency's official monitoring portal, including Accra station data.",
        category: 'Component',
        url: 'https://epa.gov.gh',
        provider: 'Ghana EPA',
        illustrative: false,
      },
      {
        id: 'accra-ghair',
        name: 'GHAir',
        blurb: 'Community platform aggregating PurpleAir and other low-cost sensor data for Ghana.',
        category: 'Component',
        url: 'https://aqi-gh.org',
        provider: 'GHAir',
        illustrative: false,
      },
      {
        id: 'accra-cana',
        name: 'Clean Air Network Africa',
        blurb: 'Pan-African clean-air network — capacity building and shared monitoring data.',
        category: 'Guidance',
        url: 'https://cana.africa',
        provider: 'Clean Air Network Africa',
        illustrative: false,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // NEWLY-JOINED — clickable, HONEST EMPTY STATE (no fabricated tool rows).
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'addis-ababa',
    name: 'Addis Ababa',
    country: 'Ethiopia',
    region: 'Africa',
    coordinates: [38.7578, 9.0250],
    state: 'newly-joined',
    population: 3_900_000,
    tools: [],
  },
  {
    slug: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    region: 'EU',
    coordinates: [-3.7038, 40.4168],
    state: 'newly-joined',
    population: 3_300_000,
    tools: [],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MEMBER — presence dots only, NOT clickable. Other BC member cities plotted so the
  // globe reads as a real network. No tool data (no panel). Populations are estimates.
  // City set drawn from BC cities named across the research (Global South AQ Products SUM
  // "BC Cities" column + the concept family).
  // ─────────────────────────────────────────────────────────────────────────────
  { slug: 'nairobi', name: 'Nairobi', country: 'Kenya', region: 'Africa', coordinates: [36.8219, -1.2921], state: 'member', population: 4_400_000, tools: [] },
  { slug: 'johannesburg', name: 'Johannesburg', country: 'South Africa', region: 'Africa', coordinates: [28.0473, -26.2041], state: 'member', population: 5_600_000, tools: [] },
  { slug: 'bogota', name: 'Bogotá', country: 'Colombia', region: 'LatAm', coordinates: [-74.0721, 4.7110], state: 'member', population: 7_900_000, tools: [] },
  { slug: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil', region: 'LatAm', coordinates: [-43.1729, -22.9068], state: 'member', population: 6_700_000, tools: [] },
  { slug: 'jakarta', name: 'Jakarta', country: 'Indonesia', region: 'SE Asia', coordinates: [106.8456, -6.2088], state: 'member', population: 10_600_000, tools: [] },
  { slug: 'bangkok', name: 'Bangkok', country: 'Thailand', region: 'SE Asia', coordinates: [100.5018, 13.7563], state: 'member', population: 10_700_000, tools: [] },
  { slug: 'london', name: 'London', country: 'United Kingdom', region: 'EU', coordinates: [-0.1278, 51.5074], state: 'member', population: 8_900_000, tools: [] },
  { slug: 'warsaw', name: 'Warsaw', country: 'Poland', region: 'EU', coordinates: [21.0122, 52.2297], state: 'member', population: 1_800_000, tools: [] },
]

/**
 * Total CITY POPULATION across every plotted city (proven + newly-joined + member). This is the
 * section's aggregate stat — a "why it matters" human-scale figure, shown with an Estimate pill.
 * It is city population, NEVER an implied "people reached/served" number (honesty rule 1).
 */
export function getTotalCityPopulation(cities: ProofCity[]): number {
  return cities.reduce((sum, city) => sum + city.population, 0)
}

/**
 * The clickable cities (proven + newly-joined), in plot order. Used to drive pointer/hover
 * affordances and the panel-open click set — member dots are excluded so there are no dead-end
 * clicks.
 */
export function getClickableCities(cities: ProofCity[]): ProofCity[] {
  return cities.filter((city) => city.state !== 'member')
}
