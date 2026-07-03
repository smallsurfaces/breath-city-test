/**
 * proof-cities.ts — concept-local city + tool directory for the proof-directory globe (v3).
 *
 * Purpose
 *   The single data source for the /ux-concepts/global-toolkit-network proof-directory section.
 *   Every pin on the globe and every tool row in a city panel comes from this file. It is OWNED
 *   by this concept and built fresh — it deliberately does NOT read from the aq-network-v2
 *   programme snapshot or any other concept's data (full-isolation rule from the section brief).
 *
 * v3 model — the honesty swap (supersedes v2's illustrative-tools model)
 *   v2 carried three "anchor" cities with real tools and links, and filled every other city with
 *   PLAUSIBLE but invented "illustrative" tool rows (each tagged `illustrative: true`, links off).
 *   v3 REMOVES that invention entirely (Jack, founder call, 2026-06-26): EVERY tool in EVERY city is
 *   now REAL and research-grounded — drawn from the 16-city City Product Mapping. The `illustrative`
 *   flag is RETIRED; there are no guessed tools left to flag. Honesty now rides the LINK STATE alone:
 *     - A tool with a real proven-live `url` renders the active "See the tool →" CTA.
 *     - A tool with `url: null` renders NO CTA at all (the disabled "Link coming soon" affordance was
 *       removed 2026-07-03 — the row shows name/tag/blurb/provider, just with no link).
 *   Most cities deliberately carry some `null` links — that absence IS the honesty mechanic (we hold
 *   no proven-live URL for that tool), not a gap to be filled. Each city also carries a one-line
 *   `story`: a real, research-grounded adoption note shown at the top of the panel body.
 *
 * The honesty model (the project's backbone — see proof-directory-v2-design-spec.md §4)
 *   - Population is CITY POPULATION, always a labelled estimate — never "people reached/served".
 *   - Every tool ROW is real and research-grounded; its live-link CTA only fires on a real,
 *     proven-live URL. Where we hold no URL the CTA is rendered visibly DISABLED ("Link coming
 *     soon"). There is no longer any invented/illustrative row — the link state is the only signal.
 *   - Third-party tool links are framed "see the tool this city uses" via `provider` (e.g. WAQI,
 *     OpenAQ, AirQo) — not "visit the city's own site". `provider: null` = city/region-owned tool.
 *
 * Data provenance (every tool real & research-grounded — Jack's locked call 2026-06-26)
 *   - Tool rows (name / blurb / category / provider) + per-city stories: the 16-city
 *       "City Product Mapping" research set.
 *   - Live-link URLs: the Live-Link Manifest (2026-06-26) — the proven-live set as of that date.
 *   - Coordinates + city populations are public-knowledge estimates (labelled as estimates in UI).
 *   Corollary (re-ping at promotion): these URLs are the 2026-06-26 proven-live set ONLY. They must
 *   be re-pinged for liveness at any client-tier promotion before this concept goes client-facing —
 *   a link proven live today is not guaranteed live at promotion.
 *
 * Key exports: ProofCity, ProofTool, ToolCategory, CapabilityDeployment (types); PROOF_CITIES (const);
 *   getTotalCityPopulation, getToolUsageCounts, getToolDeploymentsByCapability (pure helpers).
 * External dependencies: @/data/toolkit-data (ToolId — the catalogue capability id union).
 */

import type { ToolId } from '@/data/toolkit-data'

/** A tool's catalogue category — mirrors the toolkit's Component / Guidance split. */
export type ToolCategory = 'Component' | 'Guidance'

/**
 * One tool row inside a city panel. Every tool is real and research-grounded (v3 — the illustrative
 * concept is retired). `url` is the honest bit: a real proven-live URL renders the active "See the
 * tool →" CTA; `null` renders NO CTA at all (most cities carry some `null` links deliberately —
 * absence of a proven link is the honesty mechanic). `provider` labels third-party products
 * ("via AirQo" etc.); `null` means the tool is city/region-owned.
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
  /**
   * The toolkit catalogue capabilities this tool actually delivers — EXPLICIT, sourced from the
   * city-platform capability audit (2026-07-03), not keyword-guessed from name/blurb. Drives the
   * catalogue "N BC cities" counts and the per-capability deployment lists (getToolUsageCounts /
   * getToolDeploymentsByCapability). Ids are the shared toolkit `ToolId` union.
   */
  capabilities: ToolId[]
  /** Real proven-live URL → active CTA. `null` → no CTA rendered (no proven link held). */
  url: string | null
  /** Third-party product label, e.g. "AirQo", "WAQI", "OpenAQ". `null` for none/city-owned. */
  provider: string | null
}

/**
 * One city on the globe. v2+: every city is a uniform BC member — there is no pin-state field.
 * `population` is CITY POPULATION (a labelled estimate), never reach. `story` is a one-line, real
 * adoption note shown at the top of the panel body. `tools` is the list of real tools that city
 * runs (v3 — all real and research-grounded). Every city carries at least one tool.
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
  /** One-line real adoption story, shown as a lead paragraph at the top of the panel body. */
  story: string
  /** Tools this city runs — all real and research-grounded. Every city has at least one. */
  tools: ProofTool[]
}

/**
 * The directory — 16 cities, every tool real and research-grounded (v3 honesty swap). Honesty rides
 * the link state: a tool has an active CTA only where its `url` is a proven-live link, otherwise the
 * CTA is visibly disabled. Most cities deliberately carry some `null` links. Every city is a uniform
 * clickable BC member — no tier states. City populations are public estimates (UN/national-census
 * order of magnitude) — labelled as estimates throughout the UI.
 */
export const PROOF_CITIES: ProofCity[] = [
  // ── LatAm ──────────────────────────────────────────────────────────────────────
  {
    slug: 'cdmx',
    name: 'Mexico City',
    country: 'Mexico',
    region: 'LatAm',
    coordinates: [-99.1332, 19.4326],
    population: 9_200_000,
    summary: "The city's official air-quality platform.",
    story:
      "Mexico City's environment secretariat (SEDEMA) runs a long-standing fixed monitoring network and publishes the city's real-time air-and-health index, forecast, pollution-source data and the Hoy No Circula programme on its own platform.",
    tools: [
      {
        id: 'cdmx-simat',
        name: 'Aire CDMX (SEDEMA)',
        blurb:
          "The city's official air-quality platform — real-time air-and-health index, forecast, pollution sources and the Hoy No Circula programme.",
        category: 'Component',
        capabilities: ['monitoring', 'benchmarking', 'forecasting', 'health', 'openData', 'sourceId', 'action'],
        url: 'https://www.aire.cdmx.gob.mx/default.php',
        provider: null,
      },
    ],
  },

  // ── EU ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'paris',
    name: 'Paris',
    country: 'France',
    region: 'EU',
    coordinates: [2.3522, 48.8566],
    population: 2_100_000,
    summary: "Paris's reference air-quality network.",
    story:
      'Airparif gives Paris a dense real-time network with neighbourhood-level coverage and a public 72-hour forecast.',
    tools: [
      {
        id: 'paris-airparif',
        name: 'Airparif',
        blurb: 'Dense real-time network with neighbourhood-level coverage and a public 72-hour forecast.',
        category: 'Component',
        capabilities: ['monitoring', 'forecasting', 'openData', 'health'],
        url: null,
        provider: 'Airparif',
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
    summary: "London's official air-quality platforms.",
    story:
      "London layers a borough-wide reference network (LondonAir/LAQN), a community sensor network (Breathe London), and the Mayor's air-quality map of the city's clean-air measures.",
    tools: [
      {
        id: 'london-laqn',
        name: 'LondonAir (LAQN)',
        blurb: 'Imperial College reference network across all London boroughs, with a real-time map and forecast.',
        category: 'Component',
        capabilities: ['monitoring', 'forecasting', 'health', 'openData', 'benchmarking'],
        url: 'https://www.londonair.org.uk/LondonAir/Default.aspx',
        provider: 'Imperial College ERG',
      },
      {
        id: 'london-breathe',
        name: 'Breathe London',
        blurb: 'A community sensor network sited near roads, schools and hospitals, built with the Mayor of London.',
        category: 'Component',
        capabilities: ['monitoring', 'openData'],
        url: 'https://www.breathelondon.org/',
        provider: 'Mayor of London / Imperial College ERG',
      },
      {
        id: 'london-gla-map',
        name: "Mayor's London Air Quality Map",
        blurb:
          "City Hall's map of London's monitoring stations and the Mayor's clean-air measures, including the Ultra Low Emission Zone.",
        category: 'Guidance',
        capabilities: ['action'],
        url: 'https://www.london.gov.uk/programmes-and-strategies/environment-and-climate-change/pollution-and-air-quality/london-air-quality-map',
        provider: 'Greater London Authority',
      },
    ],
  },
  {
    slug: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    region: 'EU',
    coordinates: [-3.7038, 40.4168],
    population: 3_400_000,
    summary: "Madrid's city air-quality portal.",
    story:
      'Madrid owns a 24-station network, an AI forecast, and an interactive street-level concentration map across the city.',
    tools: [
      {
        id: 'madrid-portal',
        name: 'Air-quality portal',
        blurb: 'City-owned hub: 24 reference stations updated every 20 minutes, with index and history.',
        category: 'Component',
        capabilities: ['monitoring', 'benchmarking', 'forecasting', 'openData'],
        url: null,
        provider: null,
      },
    ],
  },
  {
    slug: 'milan',
    name: 'Milan',
    country: 'Italy',
    region: 'EU',
    coordinates: [9.19, 45.4642],
    population: 1_370_000,
    summary: "The city's air-quality report and open data.",
    story:
      "Milan's mobility-environment agency (AMAT) publishes a daily winter air-quality report from the regional ARPA Lombardia network, and the city open-data portal makes the station readings downloadable.",
    tools: [
      {
        id: 'milan-amat',
        name: 'AMAT daily report',
        blurb:
          "The city's own daily air-quality report, derived from regional data. Published October to March only.",
        category: 'Component',
        capabilities: ['monitoring', 'benchmarking'],
        url: null,
        provider: 'AMAT / Comune di Milano',
      },
      {
        id: 'milan-opendata',
        name: 'Milan open data (air quality)',
        blurb: "The city open-data portal's air-quality dataset, publishing daily station readings as downloadable CSV and JSON.",
        category: 'Component',
        capabilities: ['openData'],
        url: 'https://dati.comune.milano.it/dataset/ds406-rilevazione-qualita-aria-2025',
        provider: 'Comune di Milano',
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
    summary: "The city's air-quality index.",
    story:
      'Warsaw runs a city-owned sensor network across every district on top of the national monitoring system, and has steadily reduced its PM2.5 over the past decade.',
    tools: [
      {
        id: 'warsaw-waqi',
        name: 'Warsaw air-quality index',
        blurb: 'City-owned sensor network across every district, in the Warszawa 19115 app.',
        category: 'Component',
        capabilities: ['monitoring', 'benchmarking'],
        url: null,
        provider: 'City of Warsaw / Airly',
      },
    ],
  },
  {
    slug: 'sofia',
    name: 'Sofia',
    country: 'Bulgaria',
    region: 'EU',
    coordinates: [23.3219, 42.6977],
    population: 1_300_000,
    summary: "The city's official air-quality platform.",
    story:
      "Sofia's clean-air programme has replaced thousands of solid-fuel home heating systems; its official city air-quality platform is the endorsed data source.",
    tools: [
      {
        id: 'sofia-city',
        name: 'Sofia air quality',
        blurb: "The city's official air-quality platform.",
        category: 'Component',
        capabilities: ['monitoring'],
        url: null,
        provider: null,
      },
    ],
  },
  {
    slug: 'brussels',
    name: 'Brussels',
    country: 'Belgium',
    region: 'EU',
    coordinates: [4.3517, 50.8503],
    population: 1_200_000,
    summary: "The region's official air-quality platforms.",
    story:
      "Brussels reads its air through the region's official real-time platform and a high-resolution street-level map, both run by Bruxelles Environnement.",
    tools: [
      {
        id: 'brussels-environnement',
        name: 'Bruxelles Environnement',
        blurb: 'Region-owned real-time platform with a WHO-aligned index, forecast and peak-pollution alerts.',
        category: 'Component',
        capabilities: ['monitoring', 'forecasting', 'benchmarking', 'health'],
        url: 'https://qualitedelair.brussels',
        provider: 'Bruxelles Environnement',
      },
      {
        id: 'brussels-brusair',
        name: 'BrusAir',
        blurb: 'A high-resolution, street-level air-quality map for the Brussels region.',
        category: 'Component',
        capabilities: ['monitoring'],
        url: 'https://www.brusair.be',
        provider: 'Bruxelles Environnement',
      },
    ],
  },

  // ── Africa ─────────────────────────────────────────────────────────────────────
  {
    slug: 'accra',
    name: 'Accra',
    country: 'Ghana',
    region: 'Africa',
    coordinates: [-0.187, 5.6037],
    population: 2_600_000,
    summary: 'A Breathe Cities air-quality platform.',
    story:
      'Accra’s air is mapped by Breathe Accra, a Breathe Cities platform providing hyperlocal sensor data across the Greater Accra area, with a school and community sensor-donation programme.',
    tools: [
      {
        id: 'accra-breatheaccra',
        name: 'Breathe Accra',
        blurb:
          'A Breathe Cities platform mapping hyperlocal air quality across Greater Accra, with a school and community sensor-donation programme.',
        category: 'Component',
        capabilities: ['monitoring', 'health', 'advocacy', 'openData'],
        url: 'https://breatheaccra.org',
        provider: 'Breathe Cities',
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
    summary: "The county's official air-quality portal.",
    story:
      "Nairobi's county government runs a live air-quality portal built on a network of around 50 sensors sited at primary schools across the county, with health advice and alerts.",
    tools: [
      {
        id: 'nairobi-city-portal',
        name: 'Nairobi Air Quality Portal',
        blurb:
          "The county government's live air-quality map, drawing on around 50 sensors sited at primary schools across Nairobi, with health advice and alerts.",
        category: 'Component',
        capabilities: ['monitoring', 'benchmarking', 'health', 'openData', 'advocacy'],
        url: 'https://airquality.nairobi.go.ke',
        provider: null,
      },
    ],
  },
  {
    slug: 'addis-ababa',
    name: 'Addis Ababa',
    country: 'Ethiopia',
    region: 'Africa',
    coordinates: [38.7578, 9.025],
    population: 5_000_000,
    summary: 'Regional low-cost monitoring covers Addis.',
    story:
      "Addis Ababa's monitoring is fragmented; regional low-cost sensor networks provide the most accessible public data while the city builds out coverage.",
    tools: [
      {
        id: 'addis-airqo',
        name: 'AirQo',
        blurb: 'Regional low-cost sensor network with limited Addis Ababa coverage.',
        category: 'Component',
        capabilities: ['monitoring'],
        url: null,
        provider: 'AirQo',
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
    summary: "The national portal carrying the city's stations.",
    story:
      "Johannesburg's official monitoring rides on SAAQIS, South Africa's national air-quality platform; the city is also developing Africa's first Clean Air Zone.",
    tools: [
      {
        id: 'johannesburg-saaqis',
        name: 'SAAQIS national portal',
        blurb: 'The national platform carrying live City of Johannesburg stations, with an index gauge and station data tables.',
        category: 'Component',
        capabilities: ['monitoring', 'benchmarking', 'openData'],
        url: 'https://saaqis.environment.gov.za/',
        provider: 'DFFE / SAWS',
      },
    ],
  },

  // ── LatAm ──────────────────────────────────────────────────────────────────────
  {
    slug: 'bogota',
    name: 'Bogotá',
    country: 'Colombia',
    region: 'LatAm',
    coordinates: [-74.0721, 4.711],
    population: 7_900_000,
    summary: "Bogotá's reference network and health index.",
    story:
      'Bogotá runs the RMCAB reference network and the IBOCA health-risk index, with a public forecast and health-banded alerts.',
    tools: [
      {
        id: 'bogota-rmcab',
        name: 'RMCAB monitoring network',
        blurb: 'City-owned reference network running since 1997, reporting hourly across about 20 stations.',
        category: 'Component',
        capabilities: ['monitoring', 'benchmarking'],
        url: null,
        provider: null,
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
    summary: "The city's open air-quality data hub.",
    story:
      'Rio publishes its MonitorAr network readings through the Data.Rio open-data hub, with more than a decade of hourly air-quality data.',
    tools: [
      {
        id: 'rio-datario',
        name: 'Data.Rio (air quality)',
        blurb: "The city open-data hub's air-quality datasets, including hourly station readings from 2011 onward.",
        category: 'Component',
        capabilities: ['openData'],
        url: 'https://datariov2-pcrj.hub.arcgis.com/search?groupIds=0128241e3e024872a7eb46848eb7a7be',
        provider: null,
      },
    ],
  },

  // ── SE Asia ────────────────────────────────────────────────────────────────────
  {
    slug: 'jakarta',
    name: 'Jakarta',
    country: 'Indonesia',
    region: 'SE Asia',
    coordinates: [106.8456, -6.2088],
    population: 10_600_000,
    summary: "The city environment agency's official dashboard.",
    story:
      "Jakarta's environment agency runs a public real-time dashboard with a three-day forecast and health guidance for at-risk groups; a 2021 court ruling set a legal mandate for air-quality improvement.",
    tools: [
      {
        id: 'jakarta-dashboard',
        name: 'Udara Jakarta',
        blurb:
          "The city environment agency's real-time dashboard — live PM2.5 across around 70 stations, a three-day forecast, and health guidance for at-risk groups.",
        category: 'Component',
        capabilities: ['monitoring', 'forecasting', 'health', 'benchmarking', 'advocacy', 'openData'],
        url: 'https://udara.jakarta.go.id',
        provider: 'DLH DKI Jakarta',
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
    summary: "The city's official air-quality dashboard.",
    story:
      "Bangkok's metropolitan administration runs AirBKK, a real-time PM2.5 dashboard across district stations, updated through the day.",
    tools: [
      {
        id: 'bangkok-airbkk',
        name: 'AirBKK (BMA)',
        blurb: 'The city-owned dashboard: real-time PM2.5 across district stations, updated several times a day.',
        category: 'Component',
        capabilities: ['monitoring', 'benchmarking'],
        url: 'https://official.airbkk.com/airbkk/en',
        provider: 'BMA',
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
 * Count, per catalogue capability, how many cities run a tool that delivers that capability. WIRED into
 * the UI: this count drives the catalogue cards' prevalence-counter line ("{N} BC cities offer
 * something like this for their citizens"). The detailed WHICH-cities list is reserved for the
 * component detail page (see getToolDeploymentsByCapability).
 *
 * Matching is now EXPLICIT — a tool delivers a capability iff `tool.capabilities.includes(id)` (sourced
 * from the city-platform capability audit), replacing the old name/blurb keyword substring guess which
 * mis-counted after the single-platform strip. Iterates the caller-supplied capability ids (the shared
 * toolkit `ToolId` set, from CATALOGUE_CAPABILITIES) and counts distinct cities per id — an honest
 * "adoption breadth" figure (the cards carry breadth, not human scale — number-homes rule).
 */
export function getToolUsageCounts(
  cities: ProofCity[],
  capabilityIds: readonly ToolId[],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const capabilityId of capabilityIds) {
    let cityCount = 0
    for (const city of cities) {
      if (city.tools.some((tool) => tool.capabilities.includes(capabilityId))) {
        cityCount += 1
      }
    }
    counts[capabilityId] = cityCount
  }
  return counts
}

/**
 * One city's OWN deployment of a catalogue capability — the honest unit behind the catalogue card's
 * explorable city list. A deployment means "this city runs its OWN version of this capability" (e.g.
 * SIMAT, Airparif, AirQo), NOT that the city adopted the BC toolkit's component. The `url` is the
 * manifest-gated link to that city's REAL tool (carried straight off the matched ProofTool, never
 * synthesised): a proven-live URL → render a link to the city's own tool; `null` → render unlinked
 * (no proven-live link held). `toolName` is the city's real product name, surfaced as the chip title.
 */
export type CapabilityDeployment = {
  /** City slug (stable key). */
  slug: string
  /** City display name — the chip label. */
  name: string
  /** The city's OWN tool name that matched this capability — shown as the chip title. */
  toolName: string
  /** Manifest-gated link to the city's own tool. Proven-live URL → linked; `null` → unlinked. */
  url: string | null
}

/**
 * Build, per catalogue capability id, the list of cities that run their OWN version of that
 * capability. For each capability id, scans cities in natural order (no sorting); for each city takes
 * the FIRST tool that DELIVERS the capability (`tool.capabilities.includes(id)` — the same explicit
 * audit-sourced match as getToolUsageCounts) and records that city's own tool name + manifest-gated url.
 *
 * Honesty (the point of this helper): a listed city runs ITS OWN version of the capability — it has
 * NOT adopted the BC toolkit's component. The `url` is the link to that city's real tool exactly as
 * held in the data (`null` = no proven-live link, render the city unlinked). No url is inferred,
 * fixed, or pointed at a BC product.
 *
 * WIRED INTO the concept-local component detail page (real-time-monitoring/page.tsx) for its
 * "cities already monitoring" list; the CapabilityDeployment type + this helper serve that surface.
 */
export function getToolDeploymentsByCapability(
  cities: ProofCity[],
  capabilityIds: readonly ToolId[],
): Record<string, CapabilityDeployment[]> {
  const deployments: Record<string, CapabilityDeployment[]> = {}
  for (const capabilityId of capabilityIds) {
    const cityDeployments: CapabilityDeployment[] = []
    for (const city of cities) {
      const matchedTool = city.tools.find((tool) => tool.capabilities.includes(capabilityId))
      if (matchedTool !== undefined) {
        cityDeployments.push({
          slug: city.slug,
          name: city.name,
          toolName: matchedTool.name,
          url: matchedTool.url,
        })
      }
    }
    deployments[capabilityId] = cityDeployments
  }
  return deployments
}
