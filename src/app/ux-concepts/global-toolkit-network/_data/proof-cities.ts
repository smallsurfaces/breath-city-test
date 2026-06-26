/**
 * proof-cities.ts — concept-local city + tool directory for the proof-directory globe (v2).
 *
 * Purpose
 *   The single data source for the /ux-concepts/global-toolkit-network proof-directory section.
 *   Every pin on the globe and every tool row in a city panel comes from this file. It is OWNED
 *   by this concept and built fresh — it deliberately does NOT read from the aq-network-v2
 *   programme snapshot or any other concept's data (full-isolation rule from the section brief).
 *
 * v2 model (supersedes v1's three pin states)
 *   v1 split cities into 'proven' / 'newly-joined' / 'member' pin states with three pin colours and
 *   a league-table feel. v2 REVERSES that lock (Jack, founder call, 2026-06-26): every plotted city
 *   is a UNIFORM "BC member" — one pin treatment, every pin clickable, no tier ranking. Honesty
 *   rides the LINK STATE, not a city ranking:
 *     - CDMX, Paris, Accra carry REAL researched tools with REAL live-link URLs.
 *     - Every other city carries 2–3 PLAUSIBLE, region-appropriate ILLUSTRATIVE tools — each tagged
 *       `illustrative: true`, each with `url: null` so its live-link CTA renders visibly DISABLED.
 *   Guessed PRESENCE is allowed (Jack's product call); a fabricated LINK or an unlabelled claim is
 *   never allowed (Discovery Finding 1; the data-attribution decision).
 *
 * The honesty model (the project's backbone — see proof-directory-v2-design-spec.md §4)
 *   - Population is CITY POPULATION, always a labelled estimate — never "people reached/served".
 *   - A tool ROW may exist on educated-guess presence, but its live-link CTA only fires on a REAL
 *     researched URL. Where we hold no URL the CTA is rendered visibly DISABLED ("Link coming
 *     soon"). Illustrative rows carry `illustrative: true` and never an active CTA.
 *   - Third-party tool links are framed "see the tool this city uses" via `provider` (e.g. WAQI,
 *     OpenAQ, AirQo) — not "visit the city's own site".
 *
 * Data provenance (real where it exists — Jack's locked call 2026-06-25)
 *   - CDMX + Paris tool rows + URLs: research/landscape/analysis/
 *       "JTBD Job Chains — City Product Mapping — NOTES.md" (deep CDMX + Paris mapping).
 *   - Accra tool rows + URLs: research/landscape/archive/
 *       "Global South AQ Products — SUM.md" (AirQo, Breathe Accra, Ghana EPA, GHAir, AfriqAir,
 *       Clean Air Network Africa — all real URLs).
 *   - Every other city's rows are ILLUSTRATIVE (region-appropriate, plausible, links off).
 *   - Coordinates + city populations are public-knowledge estimates (labelled as estimates in UI).
 *
 * Key exports: ProofCity, ProofTool, ToolCategory (types); PROOF_CITIES (const);
 *   getTotalCityPopulation, getToolUsageCounts (pure helpers).
 * External dependencies: none (plain data + pure functions).
 */

/** A tool's catalogue category — mirrors the toolkit's Component / Guidance split. */
export type ToolCategory = 'Component' | 'Guidance'

/**
 * One tool row inside a city panel. `url` is the honest bit: a real researched URL renders the
 * active "See the tool →" CTA; `null` renders a visibly DISABLED "Link coming soon". `provider`
 * labels third-party products ("via AirQo" etc.). `illustrative` flags an educated-guess presence
 * (carries a small "illustrative" tag and never an active CTA — its `url` is always `null`).
 */
export type ProofTool = {
  /** Stable id, unique within a city (used as React key). */
  id: string
  /** Tool / product name as shown in the row heading. */
  name: string
  /** One-line plain-language blurb of what the tool does for that city (revealed on row expand). */
  blurb: string
  /** Catalogue category tag. */
  category: ToolCategory
  /** Real researched URL → active CTA. `null` → disabled "Link coming soon" (always null when illustrative). */
  url: string | null
  /** Third-party product label, e.g. "AirQo", "WAQI", "OpenAQ". `null` for none/city-owned. */
  provider: string | null
  /** True when tool PRESENCE is an educated guess (not confirmed in research) — carries a tag, CTA off. */
  illustrative: boolean
}

/**
 * One city on the globe. v2: every city is a uniform BC member — there is no pin-state field.
 * `population` is CITY POPULATION (a labelled estimate), never reach. `tools` is the list of tools
 * that city runs (real for CDMX/Paris/Accra, illustrative for the rest). Every city carries tools —
 * there is no honest-empty-state panel in v2 (it was replaced by illustrative-tools-with-links-off).
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
  /** City population — a labelled estimate (shown with the Estimate pill). */
  population: number
  /** One-line proof summary surfaced in the sticky panel header (e.g. "Running 5 AQ tools."). */
  summary: string
  /** Tools this city runs (real or illustrative). Every city has at least one. */
  tools: ProofTool[]
}

/**
 * The directory. CDMX / Paris / Accra carry REAL researched tool rows + real links. Every other
 * city carries 2–3 ILLUSTRATIVE rows (region-appropriate, tagged, links off). Every city is a
 * uniform clickable BC member — no tier states. City populations are public estimates
 * (UN/national-census order of magnitude) — labelled as estimates throughout the UI.
 */
export const PROOF_CITIES: ProofCity[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // REAL DATA — researched tool rows + real live-link URLs (the honesty anchor cities).
  // ─────────────────────────────────────────────────────────────────────────────

  // CDMX (Mexico City). LatAm. Tools + URLs from City Product Mapping NOTES (deep CDMX chain map).
  // SIMAT is the city's own official monitoring; WAQI / OpenAQ are the third-party access layers.
  {
    slug: 'cdmx',
    name: 'Mexico City',
    country: 'Mexico',
    region: 'LatAm',
    coordinates: [-99.1332, 19.4326],
    population: 9_200_000,
    summary: 'Running 4 AQ tools.',
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
    population: 2_100_000,
    summary: 'Running 4 AQ tools.',
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
    population: 2_600_000,
    summary: 'Running 5 AQ tools.',
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
  // ILLUSTRATIVE — region-appropriate, plausible tools. Every row tagged `illustrative`
  // with `url: null` (CTA disabled). Guessed presence is allowed; a fabricated link is not.
  // These read as real BC members running plausible AQ stacks — the link state carries the honesty.
  // ─────────────────────────────────────────────────────────────────────────────

  // EU
  {
    slug: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    region: 'EU',
    coordinates: [-3.7038, 40.4168],
    population: 3_300_000,
    summary: 'Running 3 AQ tools.',
    tools: [
      {
        id: 'madrid-network',
        name: 'Municipal monitoring network',
        blurb: 'City-run reference stations reporting PM2.5, NO₂ and ozone across the metro area.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'madrid-alerts',
        name: 'Public air-quality alerts',
        blurb: 'High-pollution episode warnings tied to the city traffic-restriction protocol.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'madrid-eea',
        name: 'European peer comparison',
        blurb: 'Standing against EU cities benchmarked through the European Environment Agency.',
        category: 'Guidance',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },
  {
    slug: 'london',
    name: 'London',
    country: 'United Kingdom',
    region: 'EU',
    coordinates: [-0.1278, 51.5074],
    population: 8_900_000,
    summary: 'Running 3 AQ tools.',
    tools: [
      {
        id: 'london-network',
        name: 'City-wide monitoring network',
        blurb: 'A dense reference + low-cost sensor network reporting street-level air quality.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'london-forecast',
        name: 'Daily air-quality forecast',
        blurb: 'Next-day pollution outlook with health advice for sensitive groups.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'london-sourceid',
        name: 'Source apportionment study',
        blurb: 'Attributing pollution to traffic, domestic and industrial sources to target action.',
        category: 'Guidance',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },
  {
    slug: 'warsaw',
    name: 'Warsaw',
    country: 'Poland',
    region: 'EU',
    coordinates: [21.0122, 52.2297],
    population: 1_800_000,
    summary: 'Running 2 AQ tools.',
    tools: [
      {
        id: 'warsaw-network',
        name: 'Smog monitoring network',
        blurb: 'Reference + low-cost sensors tracking winter smog from heating and traffic.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'warsaw-alerts',
        name: 'Smog alert notifications',
        blurb: 'Public warnings on high-pollution heating-season days.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },

  // Africa
  {
    slug: 'addis-ababa',
    name: 'Addis Ababa',
    country: 'Ethiopia',
    region: 'Africa',
    coordinates: [38.7578, 9.0250],
    population: 3_900_000,
    summary: 'Running 2 AQ tools.',
    tools: [
      {
        id: 'addis-sensors',
        name: 'Low-cost sensor pilot',
        blurb: 'A growing network of low-cost PM2.5 sensors across the city.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'addis-health',
        name: 'Health & education guidance',
        blurb: 'Plain-language advice tied to daily readings for the people most at risk.',
        category: 'Guidance',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },
  {
    slug: 'nairobi',
    name: 'Nairobi',
    country: 'Kenya',
    region: 'Africa',
    coordinates: [36.8219, -1.2921],
    population: 4_400_000,
    summary: 'Running 3 AQ tools.',
    tools: [
      {
        id: 'nairobi-sensors',
        name: 'Low-cost sensor network',
        blurb: 'Community-sited PM2.5 sensors filling the reference-station gap.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'nairobi-map',
        name: 'Public air-quality map',
        blurb: 'A live neighbourhood map of current readings for residents.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'nairobi-advocacy',
        name: 'Advocacy & storytelling',
        blurb: 'Turning the data into a case for cleaner-air policy with local partners.',
        category: 'Guidance',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },
  {
    slug: 'johannesburg',
    name: 'Johannesburg',
    country: 'South Africa',
    region: 'Africa',
    coordinates: [28.0473, -26.2041],
    population: 5_600_000,
    summary: 'Running 2 AQ tools.',
    tools: [
      {
        id: 'joburg-network',
        name: 'Municipal monitoring network',
        blurb: 'Reference stations reporting against the national ambient standard.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'joburg-benchmark',
        name: 'Standards benchmarking',
        blurb: 'Readings judged against the WHO guideline and the national standard.',
        category: 'Guidance',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },

  // LatAm
  {
    slug: 'bogota',
    name: 'Bogotá',
    country: 'Colombia',
    region: 'LatAm',
    coordinates: [-74.0721, 4.7110],
    population: 7_900_000,
    summary: 'Running 3 AQ tools.',
    tools: [
      {
        id: 'bogota-network',
        name: 'City monitoring network',
        blurb: "The district's reference network reporting PM2.5 across the city.",
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'bogota-forecast',
        name: 'Air-quality forecast',
        blurb: 'Short-range outlook to plan around poor-air days.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'bogota-action',
        name: 'Action & behaviour change',
        blurb: 'Interventions tied to high-pollution episodes — traffic and burning measures.',
        category: 'Guidance',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },
  {
    slug: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'LatAm',
    coordinates: [-43.1729, -22.9068],
    population: 6_700_000,
    summary: 'Running 2 AQ tools.',
    tools: [
      {
        id: 'rio-network',
        name: 'State monitoring network',
        blurb: 'Reference stations reporting regional air quality to the public.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'rio-opendata',
        name: 'Open data access',
        blurb: 'Underlying readings made downloadable for researchers and developers.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },

  // SE Asia
  {
    slug: 'jakarta',
    name: 'Jakarta',
    country: 'Indonesia',
    region: 'SE Asia',
    coordinates: [106.8456, -6.2088],
    population: 10_600_000,
    summary: 'Running 3 AQ tools.',
    tools: [
      {
        id: 'jakarta-network',
        name: 'Air-quality monitoring network',
        blurb: 'Reference + low-cost sensors tracking the city PM2.5 burden.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'jakarta-alerts',
        name: 'Public health alerts',
        blurb: 'Episode warnings and mask/limit guidance on high-pollution days.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'jakarta-sourceid',
        name: 'Source identification study',
        blurb: 'Attributing pollution to traffic, industry and regional burning.',
        category: 'Guidance',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },
  {
    slug: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    region: 'SE Asia',
    coordinates: [100.5018, 13.7563],
    population: 10_700_000,
    summary: 'Running 2 AQ tools.',
    tools: [
      {
        id: 'bangkok-network',
        name: 'City monitoring network',
        blurb: 'Reference stations reporting PM2.5, with a focus on the seasonal haze period.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
      {
        id: 'bangkok-forecast',
        name: 'Haze-season forecast',
        blurb: 'Short-range outlook for the burning season, with health guidance.',
        category: 'Component',
        url: null,
        provider: null,
        illustrative: true,
      },
    ],
  },
]

/**
 * Total CITY POPULATION across every plotted city. This is the section's aggregate stat — a
 * "why it matters" human-scale figure, shown with an Estimate pill. It is city population, NEVER
 * an implied "people reached/served" number (honesty rule).
 */
export function getTotalCityPopulation(cities: ProofCity[]): number {
  return cities.reduce((sum, city) => sum + city.population, 0)
}

/**
 * Count, per tool CATEGORY label, how many cities run a tool whose name matches that catalogue
 * capability. Used to thread the "Used by N BC cities" proof line onto the catalogue cards.
 *
 * Why a keyword map rather than a hard join: the proof-cities tool names are city-voice ("Municipal
 * monitoring network") while the catalogue entries are capability-voice ("Real-time Monitoring").
 * This maps each catalogue capability id to the keywords that signal its presence in a city's tool
 * list, then counts distinct cities — an honest "adoption breadth" approximation for the concept,
 * not a production data contract (the cards carry breadth, not human scale — number-homes rule).
 */
export function getToolUsageCounts(
  cities: ProofCity[],
  keywordsByCapability: Record<string, readonly string[]>,
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const capabilityId of Object.keys(keywordsByCapability)) {
    const keywords = keywordsByCapability[capabilityId]
    let cityCount = 0
    for (const city of cities) {
      const matches = city.tools.some((tool) => {
        const haystack = `${tool.name} ${tool.blurb}`.toLowerCase()
        return keywords.some((kw) => haystack.includes(kw.toLowerCase()))
      })
      if (matches) {
        cityCount += 1
      }
    }
    counts[capabilityId] = cityCount
  }
  return counts
}
