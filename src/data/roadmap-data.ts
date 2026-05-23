/**
 * roadmap-data.ts
 *
 * Purpose: Central data source for the Best Practice Roadmap wireframe prototype.
 * Contains all mock data for cities, domains, practice cards, and the coverage matrix.
 * All roadmap pages import from this single file — no data is inlined in components.
 *
 * Key exports: CITIES, DOMAINS, COVERAGE_MATRIX, PRACTICE_CARDS, helper lookup functions.
 * External dependencies: none — pure data.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One of the three stages every domain belongs to */
export type Stage = "Seeing" | "Understanding" | "Acting" | "All stages";

/** Outcome measurement status of a city's contribution to a practice */
export type OutcomeState = "measured" | "baseline-established" | "baseline-building";

/** Whether the work was a BC partnership or the city's own achievement */
export type ProvenanceBadge = "BC Partnership" | "City Achievement";

/** A Breathe Cities member city */
export interface City {
  slug: string;
  name: string;
  country: string;
  flag: string;
  populationMillions: number;
  populationLabel: string;
}

/** A domain in the roadmap (the 12 thematic areas) */
export interface Domain {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  stage: Stage;
  description: string;
}

/** A city's contribution to a specific practice */
export interface CityExample {
  citySlug: string;
  provenance: ProvenanceBadge;
  interventionName: string;
  introducedYear: number | string;
  outcomeState: OutcomeState;
  outcomeBefore?: string;
  outcomeAfter?: string;
  outcomeChange?: string;
  outcomeNote?: string;
  link?: string;
}

/** A practice card — the atomic content unit */
export interface PracticeCard {
  id: string;
  name: string;
  domainId: number;
  description: string;
  totalPopulationImpacted: string;
  cityCount: number;
  cityExamples: CityExample[];
  relatedPracticeIds: string[];
}

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

export const CITIES: City[] = [
  { slug: "paris", name: "Paris", country: "France", flag: "\u{1F1EB}\u{1F1F7}", populationMillions: 12.2, populationLabel: "12.2M" },
  { slug: "london", name: "London", country: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", populationMillions: 9.0, populationLabel: "9.0M" },
  { slug: "mexico-city", name: "Mexico City", country: "Mexico", flag: "\u{1F1F2}\u{1F1FD}", populationMillions: 21.8, populationLabel: "21.8M" },
  { slug: "milan", name: "Milan", country: "Italy", flag: "\u{1F1EE}\u{1F1F9}", populationMillions: 1.4, populationLabel: "1.4M" },
  { slug: "brussels", name: "Brussels", country: "Belgium", flag: "\u{1F1E7}\u{1F1EA}", populationMillions: 1.2, populationLabel: "1.2M" },
  { slug: "jakarta", name: "Jakarta", country: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", populationMillions: 10.6, populationLabel: "10.6M" },
  { slug: "johannesburg", name: "Johannesburg", country: "South Africa", flag: "\u{1F1FF}\u{1F1E6}", populationMillions: 6.0, populationLabel: "6.0M" },
  { slug: "accra", name: "Accra", country: "Ghana", flag: "\u{1F1EC}\u{1F1ED}", populationMillions: 5.4, populationLabel: "5.4M" },
  { slug: "nairobi", name: "Nairobi", country: "Kenya", flag: "\u{1F1F0}\u{1F1EA}", populationMillions: 4.4, populationLabel: "4.4M" },
  { slug: "bangkok", name: "Bangkok", country: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", populationMillions: 10.7, populationLabel: "10.7M" },
  { slug: "bogota", name: "Bogota", country: "Colombia", flag: "\u{1F1E8}\u{1F1F4}", populationMillions: 7.9, populationLabel: "7.9M" },
  { slug: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", populationMillions: 6.7, populationLabel: "6.7M" },
  { slug: "sofia", name: "Sofia", country: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}", populationMillions: 1.3, populationLabel: "1.3M" },
  { slug: "warsaw", name: "Warsaw", country: "Poland", flag: "\u{1F1F5}\u{1F1F1}", populationMillions: 1.8, populationLabel: "1.8M" },
];

// ---------------------------------------------------------------------------
// Domains
// ---------------------------------------------------------------------------

export const DOMAINS: Domain[] = [
  { id: 1, slug: "monitoring", name: "AQ Monitoring & Data Infrastructure", shortName: "Monitoring", stage: "Seeing", description: "Building the sensor networks and data systems cities need to see their air quality clearly. From reference-grade stations to low-cost sensor grids, this domain covers the infrastructure that makes everything else possible." },
  { id: 2, slug: "source-apportionment", name: "Source Apportionment & Emissions Analysis", shortName: "Source Analysis", stage: "Understanding", description: "Understanding where pollution comes from. Emissions inventories and source apportionment studies that identify the dominant contributors — transport, industry, cooking fuels, waste burning — so cities can target interventions where they will have the greatest impact." },
  { id: 3, slug: "health-impact", name: "Health Impact Assessment & Evidence Building", shortName: "Health Impact", stage: "Understanding", description: "Quantifying the health burden of air pollution. Epidemiological studies, health impact assessments, and evidence building that connects air quality data to public health outcomes and builds the case for action." },
  { id: 4, slug: "policy-design", name: "Policy Design & Adoption", shortName: "Policy Design", stage: "Acting", description: "Translating evidence into enforceable policy. National air quality standards, clean air acts, emission limits, and the regulatory frameworks that give cities the authority and mandate to act." },
  { id: 5, slug: "transport", name: "Transport & Mobility", shortName: "Transport", stage: "Acting", description: "Cleaning up how cities move. Low-emission zones, vehicle restrictions, public transit investment, cycling infrastructure, and the modal shifts that reduce transport-related emissions." },
  { id: 6, slug: "clean-fuels", name: "Clean Fuels for Cooking & Heating", shortName: "Clean Fuels", stage: "Acting", description: "Transitioning households away from solid fuels. Clean cookstove programmes, LPG subsidies, and heating fuel transitions that address the indoor-outdoor pollution nexus — especially critical in the Global South." },
  { id: 7, slug: "green-infrastructure", name: "Green Infrastructure & Urban Planning", shortName: "Green Infra", stage: "Acting", description: "Designing cities that breathe. Green corridors, urban forests, low-emission building standards, and spatial planning that reduces exposure and creates natural buffers between pollution sources and people." },
  { id: 8, slug: "awareness", name: "Raising Awareness & Community Engagement", shortName: "Awareness", stage: "All stages", description: "Making air quality visible to citizens. Public awareness campaigns, school programmes, community monitoring, and the civic engagement that builds demand for clean air and sustains political will." },
  { id: 9, slug: "governance", name: "Multi-Level Governance & Coordination", shortName: "Governance", stage: "All stages", description: "Aligning national, regional, and municipal action. Inter-agency coordination, multi-level governance frameworks, and the institutional arrangements that prevent fragmented or contradictory policy responses." },
  { id: 10, slug: "funding", name: "Funding, Sustainability & Progress Tracking", shortName: "Funding", stage: "All stages", description: "Financing the transition and tracking progress. Climate finance, development bank loans, municipal budgets, and the monitoring frameworks that measure whether investments are delivering cleaner air." },
  { id: 11, slug: "lesson-sharing", name: "Lesson Sharing & Peer Learning", shortName: "Peer Learning", stage: "All stages", description: "Cities learning from cities. Study tours, peer exchanges, knowledge platforms, and the networks that accelerate adoption by letting cities learn from each other rather than starting from scratch." },
  { id: 12, slug: "data-technology", name: "Data & Technology Infrastructure", shortName: "Data & Tech", stage: "Seeing", description: "The digital backbone. Open data platforms, APIs, forecasting models, and the technology infrastructure that turns raw sensor readings into actionable intelligence for city managers and citizens." },
];

// ---------------------------------------------------------------------------
// Coverage Matrix — binary: has the city acted in this domain?
// Index matches domain ID (1-indexed), so index 0 = domain 1
// ---------------------------------------------------------------------------

export const COVERAGE_MATRIX: Record<string, boolean[]> = {
  "paris":          [true,  true,  true,  true,  true,  true,  true,  true,  true,  false, true,  true],
  "london":         [true,  true,  true,  true,  true,  false, false, true,  true,  true,  true,  true],
  "mexico-city":    [true,  true,  false, true,  true,  false, false, true,  true,  false, false, true],
  "milan":          [true,  false, false, true,  true,  false, true,  true,  false, false, false, false],
  "brussels":       [true,  false, false, true,  true,  false, true,  true,  true,  false, true,  false],
  "jakarta":        [true,  false, false, false, false, false, false, true,  false, false, true,  true],
  "johannesburg":   [true,  false, false, true,  false, true,  false, false, true,  false, false, true],
  "accra":          [true,  true,  false, false, false, false, false, false, false, false, false, false],
  "nairobi":        [true,  true,  false, false, false, false, false, false, false, false, false, false],
  "bangkok":        [true,  false, false, true,  true,  false, false, true,  true,  false, true,  false],
  "bogota":         [true,  false, false, true,  true,  false, false, true,  false, false, true,  false],
  "rio-de-janeiro": [true,  false, false, true,  true,  false, false, true,  false, false, false, true],
  "sofia":          [true,  false, false, true,  false, false, false, false, true,  false, false, false],
  "warsaw":         [true,  false, false, true,  true,  true,  true,  true,  true,  true,  true,  true],
};

// ---------------------------------------------------------------------------
// Practice Cards
// ---------------------------------------------------------------------------

export const PRACTICE_CARDS: PracticeCard[] = [
  // Domain 1 — Low-Cost Sensor Deployment
  {
    id: "d1-sensor-deployment",
    name: "Low-Cost Sensor Deployment",
    domainId: 1,
    description: "Deploying networks of affordable PM2.5 and NO2 sensors across neighbourhoods, schools, and transport corridors to fill gaps in official monitoring and give communities real-time air quality data.",
    totalPopulationImpacted: "20.8M",
    cityCount: 3,
    cityExamples: [
      {
        citySlug: "london",
        provenance: "City Achievement",
        interventionName: "Breathe London — 100+ low-cost sensors city-wide",
        introducedYear: 2019,
        outcomeState: "measured",
        outcomeBefore: "Sparse coverage (reference stations only)",
        outcomeAfter: "First city-scale network validated against reference monitoring",
        outcomeChange: "100+ sensors",
        outcomeNote: "Open-access data",
      },
      {
        citySlug: "nairobi",
        provenance: "BC Partnership",
        interventionName: "AirQo + sensors.AFRICA at schools & community centres",
        introducedYear: "ongoing",
        outcomeState: "baseline-building",
        outcomeNote: "First consistent data",
      },
      {
        citySlug: "accra",
        provenance: "BC Partnership",
        interventionName: "AirQo PM2.5 sensors",
        introducedYear: "ongoing",
        outcomeState: "baseline-building",
        outcomeNote: "First consistent data",
      },
    ],
    relatedPracticeIds: ["d2-source-apportionment", "d12-open-data"],
  },

  // Domain 2 — Source Apportionment Study
  {
    id: "d2-source-apportionment",
    name: "Source Apportionment Study",
    domainId: 2,
    description: "Comprehensive emissions inventories and receptor modelling studies that identify the dominant pollution sources in a city — the essential diagnostic step before designing targeted interventions.",
    totalPopulationImpacted: "18.8M",
    cityCount: 3,
    cityExamples: [
      {
        citySlug: "london",
        provenance: "City Achievement",
        interventionName: "London Atmospheric Emissions Inventory (LAEI)",
        introducedYear: 2013,
        outcomeState: "measured",
        outcomeBefore: "Uncertain source contribution",
        outcomeAfter: "Road transport identified as ~50% of London NOx",
        outcomeChange: "Informed ULEZ design",
      },
      {
        citySlug: "accra",
        provenance: "BC Partnership",
        interventionName: "C40/CCAC emissions study",
        introducedYear: 2020,
        outcomeState: "measured",
        outcomeBefore: "Limited emissions data",
        outcomeAfter: "Household solid fuel + waste burning + vehicles identified as dominant PM2.5 sources",
        outcomeChange: "Priority sectors identified",
      },
      {
        citySlug: "nairobi",
        provenance: "BC Partnership",
        interventionName: "CCAC emissions inventory",
        introducedYear: 2021,
        outcomeState: "measured",
        outcomeBefore: "No city-level inventory",
        outcomeAfter: "Transport + cooking/heating fuels identified as dominant PM sources",
        outcomeChange: "Priority sectors identified",
      },
    ],
    relatedPracticeIds: ["d1-sensor-deployment", "d5-lez"],
  },

  // Domain 5 — Low-Emission Zone
  {
    id: "d5-lez",
    name: "Low-Emission Zone",
    domainId: 5,
    description: "Geographically defined areas where the most polluting vehicles are restricted or charged, incentivising fleet turnover and reducing roadside pollution concentrations in the most affected neighbourhoods.",
    totalPopulationImpacted: "22.6M",
    cityCount: 3,
    cityExamples: [
      {
        citySlug: "london",
        provenance: "City Achievement",
        interventionName: "Ultra Low Emission Zone (ULEZ)",
        introducedYear: 2019,
        outcomeState: "measured",
        outcomeBefore: "High roadside NO2",
        outcomeAfter: "NO2: -21% at roadside monitoring stations",
        outcomeChange: "-21%",
        outcomeNote: "City-wide expansion 2023",
      },
      {
        citySlug: "paris",
        provenance: "City Achievement",
        interventionName: "Zone a Faibles Emissions (ZFE)",
        introducedYear: 2015,
        outcomeState: "measured",
        outcomeBefore: "High near-road NO2",
        outcomeAfter: "NO2: -30% near major roads (2012-2022)",
        outcomeChange: "-30%",
      },
      {
        citySlug: "milan",
        provenance: "City Achievement",
        interventionName: "Area B — covers 72% of city",
        introducedYear: 2019,
        outcomeState: "measured",
        outcomeBefore: "Elevated PM10 and black carbon",
        outcomeAfter: "PM10: -10%, Black carbon: -30%",
        outcomeChange: "-10% PM10, -30% BC",
      },
    ],
    relatedPracticeIds: ["d5-vehicle-restriction", "d2-source-apportionment"],
  },

  // Domain 5 — Vehicle Restriction Programme
  {
    id: "d5-vehicle-restriction",
    name: "Vehicle Restriction Programme",
    domainId: 5,
    description: "Programmes that restrict vehicle use by plate number or day to reduce traffic volume and emissions. Among the earliest air quality interventions adopted by megacities.",
    totalPopulationImpacted: "21.8M",
    cityCount: 1,
    cityExamples: [
      {
        citySlug: "mexico-city",
        provenance: "City Achievement",
        interventionName: "Hoy No Circula",
        introducedYear: 1989,
        outcomeState: "measured",
        outcomeBefore: "Severe traffic congestion and vehicle emissions",
        outcomeAfter: "Removes ~20% of vehicles daily",
        outcomeChange: "-20% daily vehicles",
      },
    ],
    relatedPracticeIds: ["d5-lez"],
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Get a city by slug, or undefined if not found */
export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

/** Get a domain by slug, or undefined if not found */
export function getDomainBySlug(slug: string): Domain | undefined {
  return DOMAINS.find((d) => d.slug === slug);
}

/** Get a domain by numeric ID */
export function getDomainById(id: number): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}

/** Get all practice cards for a given domain ID */
export function getPracticesByDomain(domainId: number): PracticeCard[] {
  return PRACTICE_CARDS.filter((p) => p.domainId === domainId);
}

/** Get all practice cards that include a given city slug */
export function getPracticesByCity(citySlug: string): PracticeCard[] {
  return PRACTICE_CARDS.filter((p) =>
    p.cityExamples.some((ex) => ex.citySlug === citySlug)
  );
}

/** Get the coverage count for a city (how many domains they've acted in) */
export function getCoverageCount(citySlug: string): number {
  const row = COVERAGE_MATRIX[citySlug];
  if (!row) return 0;
  return row.filter(Boolean).length;
}

/** Get a practice card by ID */
export function getPracticeById(id: string): PracticeCard | undefined {
  return PRACTICE_CARDS.find((p) => p.id === id);
}

/** Stage colour mapping for wireframe badges — neutral tones */
export const STAGE_COLORS: Record<Stage, { bg: string; text: string }> = {
  "Seeing": { bg: "bg-blue-100", text: "text-blue-800" },
  "Understanding": { bg: "bg-amber-100", text: "text-amber-800" },
  "Acting": { bg: "bg-green-100", text: "text-green-800" },
  "All stages": { bg: "bg-gray-100", text: "text-gray-700" },
};
