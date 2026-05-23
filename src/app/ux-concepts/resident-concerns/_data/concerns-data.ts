/**
 * concerns-data.ts — Resident Concerns prototype content model
 *
 * Purpose: static, authored content for the "Resident Concerns" global-site UX
 * concept. A deck of cards organised by resident/community concern, presented to
 * city officials as: "These are the concerns of your residents — and here's what
 * peer cities have done about each."
 *
 * Two concerns, each with its OWN fan-out axis:
 *   - "Who's polluting my neighbourhood?" fans by SOURCE (coal, traffic, cooking…)
 *   - "Is the air safe for my kids?" fans by SETTING / LEVER (school air, commute, home…)
 *
 * Concern→answer-fit rule (critical): each card's evidence MUST answer the question
 * its concern actually asks. Under "safe for my kids" we use school-zone air /
 * children's-exposure / asthma evidence — NEVER a generic city-wide PM2.5 drop.
 *
 * EVIDENCE DISCIPLINE — read before editing:
 *   - BC family cities ONLY (here: Warsaw, London, Accra).
 *   - NEVER fabricate a figure. Every numeric/policy claim traces to a research file
 *     (see `source` on each card). Where the evidence has a genuine gap, the field is
 *     a Placeholder (`{ tk: "..." }`) rendered as a visible [figure TK] chip — never
 *     an invented number.
 *   - No per-intervention health attribution. City-wide −% trend figures (e.g. Warsaw
 *     −46% PM2.5) are city TRAJECTORY context only, never presented as a card's outcome.
 *     This mirrors BC's own published methodology (the Breathe Better report explicitly
 *     declines single-intervention attribution).
 *
 * Sources (files under design/globalsite/concepts/best-practice-roadmap/):
 *   [R1] city-initiatives-research.md          (London, Accra)
 *   [R2] city-initiatives-research-2.md         (Warsaw)
 *   [R3] breathe-better-report-domain-mapping.md
 *   [R4] city-sensor-ownership.md
 *   [R5] brief.md (BC published anchors: 30%-by-2030; 55K deaths / $147B; 10,000+ children asthma)
 *
 * Key exports: CONCERNS, CITIES, type Concern, type ConcernCard, type CityKey
 */

/** The three BC-family cities this prototype covers. */
export type CityKey = "warsaw" | "london" | "accra";

export interface City {
  key: CityKey;
  name: string;
  country: string;
  flag: string;
  populationLabel: string;
  /** One-line characterisation of the city's dominant source/lever mix. */
  mix: string;
  /**
   * City-wide trajectory context — used ONLY as a "where the city is heading"
   * caption, never as a per-card outcome. `null` where no published city-wide
   * BC figure exists for this city (Accra), to avoid implying one.
   */
  trajectory: string | null;
  trajectorySource: string | null;
}

export const CITIES: City[] = [
  {
    key: "warsaw",
    name: "Warsaw",
    country: "Poland",
    flag: "\u{1F1F5}\u{1F1F1}",
    populationLabel: "1.8M",
    mix: "Coal & solid-fuel home heating leads the winter pollution mix.",
    // [R3] Breathe Better report city-wide trend, 2010→2024, population-weighted.
    trajectory: "−46% PM2.5 city-wide (2010–2024) — the largest cut of any Breathe City.",
    trajectorySource: "[R3] breathe-better-report-domain-mapping.md",
  },
  {
    key: "london",
    name: "London",
    country: "United Kingdom",
    flag: "\u{1F1EC}\u{1F1E7}",
    populationLabel: "9.0M",
    mix: "Road transport dominates — roughly half of the city's NOx.",
    // [R3] city-wide trend.
    trajectory: "−28% PM2.5 city-wide (2010–2024) on the path to 30% by 2030.",
    trajectorySource: "[R3] breathe-better-report-domain-mapping.md",
  },
  {
    key: "accra",
    name: "Accra",
    country: "Ghana",
    flag: "\u{1F1EC}\u{1F1ED}",
    populationLabel: "5.4M",
    mix: "Household fuel, waste burning and dust/transport share the load.",
    // No published city-wide BC trend figure for Accra — kept null deliberately.
    trajectory: null,
    trajectorySource: null,
  },
];

/** A placeholder for a field where the evidence genuinely has a gap. */
export interface Placeholder {
  tk: string;
}

export function isPlaceholder(v: unknown): v is Placeholder {
  return typeof v === "object" && v !== null && "tk" in v;
}

export interface ConcernCard {
  /** Stable id, unique within a concern. */
  id: string;
  /** Which city's response this card describes. */
  city: CityKey;
  /**
   * The facet this card sits under, on the concern's axis.
   * For "who's-polluting" this is a SOURCE; for "safe-for-kids" a SETTING/LEVER.
   */
  facet: string;
  /** Short label for the facet chip (e.g. "Coal heating", "Air outside schools"). */
  facetLabel: string;
  /** The peer-city response, in plain language: what the city did. */
  did: string;
  /** How they did it — the mechanism. */
  how: string;
  /**
   * The outcome that answers THIS concern. A string for a real figure, or a
   * Placeholder for a genuine gap. Must answer the concern, not generic progress.
   */
  outcome: string | Placeholder;
  /** The "why not you?" peer-learning nudge. */
  whyNotYou: string;
  /** Provenance — which research file each claim traces to. Always present. */
  source: string;
}

export interface Concern {
  key: string;
  /** The resident worry, in the resident's voice. */
  voice: string;
  /** The axis label shown to officials (SOURCE vs SETTING/LEVER). */
  axisLabel: string;
  /** One-line framing of how this concern fans out. */
  axisDescription: string;
  /**
   * How the responses to this concern ladder toward BC's collective 2030 goal.
   * Contribution framing — never implies one action moves the whole number.
   */
  contribution: string;
  cards: ConcernCard[];
}

/* ------------------------------------------------------------------ *
 * CONCERN 1 — "Who's polluting my neighbourhood?"  → fans by SOURCE
 * The source breakdown IS the answer to this concern.
 * ------------------------------------------------------------------ */

const WHO_POLLUTING: Concern = {
  key: "who-polluting",
  voice: "Who's polluting my neighbourhood?",
  axisLabel: "By source",
  axisDescription:
    "Each card names a pollution source and a peer city that identified it and cut it. The source breakdown is the answer.",
  contribution:
    "Naming the dominant source is the turn from Seeing to Acting — every city that has apportioned its emissions and cut the biggest source is contributing to the collective 30%-cleaner-air-by-2030 goal. [R5]",
  cards: [
    // WARSAW — coal/solid-fuel heating leads.
    {
      id: "who-warsaw-coal",
      city: "warsaw",
      facet: "Coal & solid-fuel home heating",
      facetLabel: "Coal heating",
      did: "Banned coal and solid-fuel combustion across the city, and pays households to switch their boilers.",
      how: "A Mazovia regional anti-smog resolution banned coal/solid-fuel heating in Warsaw from 1 Sept 2023; the national Clean Air Programme provides subsidy and soft loans for boiler replacement and thermal renovation.",
      outcome:
        "Residential solid-fuel heating was identified as ~65% of Warsaw's winter PM10 — the single largest source, now being phased out.",
      whyNotYou:
        "If home heating is your winter peak, a fuel ban paired with switch-grants targets the source residents smell first.",
      source: "[R2] city-initiatives-research-2.md (anti-smog resolution; Clean Air Programme)",
    },
    {
      id: "who-warsaw-traffic",
      city: "warsaw",
      facet: "Road traffic",
      facetLabel: "Traffic",
      did: "Opened a central Low Emission Zone restricting the oldest, dirtiest vehicles.",
      how: "A 37 km² LEZ (Śródmieście + adjacent) launched July 2024; Phase 1 bans older diesel and petrol vehicles, tightening through 2032.",
      outcome:
        "Forecast NO2 −11% and PM −20% in the zone by the early 2030s as the phasing tightens.",
      whyNotYou:
        "A zone that tightens on a published schedule lets a city act on traffic before fleet turnover would deliver it on its own.",
      source: "[R2] city-initiatives-research-2.md (Warsaw LEZ, July 2024)",
    },
    // LONDON — road transport leads.
    {
      id: "who-london-traffic",
      city: "london",
      facet: "Road transport",
      facetLabel: "Traffic",
      did: "Apportioned its emissions, found traffic was the dominant source, then charged the dirtiest vehicles to enter.",
      how: "The London Atmospheric Emissions Inventory (LAEI) attributed ~50% of NOx to road transport; that evidence shaped the Ultra Low Emission Zone (ULEZ), expanded city-wide in 2023.",
      outcome:
        "21% reduction in roadside NO2, with ~46,000 fewer polluting vehicles driving in the zone each day.",
      whyNotYou:
        "Apportion first, then act: London targeted the source the inventory proved was biggest, not the one that was loudest.",
      source: "[R1] city-initiatives-research.md (LAEI; ULEZ)",
    },
    // ACCRA — household fuel / waste burning / transport share the load.
    {
      id: "who-accra-household",
      city: "accra",
      facet: "Household fuel & waste burning",
      facetLabel: "Cooking & waste",
      did: "Ran a source apportionment study that named household fuel, waste burning and vehicles as the dominant sources.",
      how: "A C40 / CCAC urban air-quality assessment identified the dominant PM2.5 sources; Clean Air Accra (Clean Air Fund partnership) is now building the city's first comprehensive emissions inventory and AQ management plan.",
      // Genuine gap: no per-source % published for Accra in the evidence.
      outcome: {
        tk: "Per-source % split for Accra — being established by the in-progress emissions inventory.",
      },
      whyNotYou:
        "You don't need a mature network to start: a source study tells you where to aim before the readings are dense.",
      source: "[R1] city-initiatives-research.md (C40/CCAC study; Clean Air Accra)",
    },
  ],
};

/* ------------------------------------------------------------------ *
 * CONCERN 2 — "Is the air safe for my kids?"  → fans by SETTING / LEVER
 * Every card answers the kids/safety question (school air, the commute,
 * the home) — NOT a generic city-wide PM2.5 drop.
 * ------------------------------------------------------------------ */

const SAFE_FOR_KIDS: Concern = {
  key: "safe-for-kids",
  voice: "Is the air safe for my kids?",
  axisLabel: "By setting",
  axisDescription:
    "Each card answers for a place a child spends time — outside school, on the commute, at home. No generic city-wide progress here.",
  contribution:
    "Across the Breathe Cities, the collective programme reports over 10,000 children already prevented from developing asthma in two years — the kids-safety dividend of these settings-level actions adding up. [R5]",
  cards: [
    // LONDON — strongest kids-specific evidence (schools + commute).
    {
      id: "kids-london-school",
      city: "london",
      facet: "Air outside schools",
      facetLabel: "School air",
      did: "Enrolled thousands of schools in daily air-quality alerts with action advice for children.",
      how: "The School Air Quality Alerts (Breathe Clean) programme sends schools daily AQ forecasts plus advice — moving play indoors, changing routes — on high-pollution days.",
      outcome:
        "3,500+ schools enrolled in daily AQ forecasts and action advice for pupils.",
      whyNotYou:
        "Schools are a precise, trusted channel to protect children on the exact days the air is worst.",
      source: "[R1] city-initiatives-research.md (School AQ Alerts / Breathe Clean)",
    },
    {
      id: "kids-london-commute",
      city: "london",
      facet: "The walk / cycle to school",
      facetLabel: "The commute",
      did: "Published lower-pollution walking and cycling routes so families can avoid the dirtiest streets.",
      how: "The Clean Air Route Finder maps walking/cycling routes optimised for lower exposure — a back-street route can cut a child's dose versus the main-road route.",
      // Genuine gap: no published exposure-reduction % for the route tool.
      outcome: {
        tk: "Exposure reduction on a clean-air route vs the main-road route — not published in the evidence.",
      },
      whyNotYou:
        "The same journey, a quieter street: a low-cost lever that puts the choice in parents' hands every morning.",
      source: "[R1] city-initiatives-research.md (Clean Air Route Finder)",
    },
    // WARSAW — kids via Streets for Kids + the home (coal ban protects indoor air).
    {
      id: "kids-warsaw-streets",
      city: "warsaw",
      facet: "Streets around schools",
      facetLabel: "School streets",
      did: "Ran 'Streets for Kids' — reclaiming the streets outside schools for children and clean-air campaigning.",
      how: "Streets for Kids and LEZ-linked community campaigns (cited in BC's awareness pillar) mobilise parents and schools around the air children breathe near the school gate.",
      // Genuine gap: no measured school-zone AQ outcome published for Warsaw.
      outcome: {
        tk: "Measured school-gate air-quality change for Warsaw — not quantified in the evidence.",
      },
      whyNotYou:
        "Parent-led school-street action builds the political will that makes the harder source policies stick.",
      source: "[R3] breathe-better-report-domain-mapping.md (Warsaw 'Streets for Kids')",
    },
    {
      id: "kids-warsaw-home",
      city: "warsaw",
      facet: "Air at home",
      facetLabel: "The home",
      did: "Removed coal heating from homes — cutting the smoke children breathe indoors and on their own street.",
      how: "The coal/solid-fuel ban plus Clean Air Programme boiler-replacement grants take the dirtiest combustion out of residential neighbourhoods where children live and play.",
      outcome:
        "Targets the source identified as ~65% of winter PM10 — the smoke closest to where children sleep.",
      whyNotYou:
        "Cleaning home heating protects the youngest where they spend the most hours: indoors, at home.",
      source: "[R2] city-initiatives-research-2.md (anti-smog resolution; Clean Air Programme)",
    },
    // ACCRA — honest 'started' framing; kids-specific evidence is genuinely sparse.
    {
      id: "kids-accra-sensing",
      city: "accra",
      facet: "Seeing children's exposure",
      facetLabel: "Getting data",
      did: "Started filling the data gaps so children's exposure can be seen before it can be acted on.",
      how: "AirQo low-cost PM2.5 sensors and a US Embassy reference monitor give Accra its first real-time picture; Clean Air Accra is building the AQ management plan that would target children's settings.",
      // Genuine gap: no kids-specific exposure figure for Accra.
      outcome: {
        tk: "Children's-exposure figures for Accra — the monitoring base to measure them is still being built.",
      },
      whyNotYou:
        "Seeing comes first: even a sparse sensor layer is the honest start every city's kids-safety story is built on.",
      source: "[R1] city-initiatives-research.md + [R4] city-sensor-ownership.md (AirQo; Embassy monitor)",
    },
  ],
};

export const CONCERNS: Concern[] = [WHO_POLLUTING, SAFE_FOR_KIDS];

/**
 * Per-city facet ordering — drives localisation. When a city is active, its
 * dominant facets lead the deck for each concern; other cities' cards follow.
 * This is what makes the city switcher visibly reorder the deck (Warsaw → coal
 * leads; London → traffic leads; Accra → its own mix leads).
 */
export const CITY_LEAD_FACET: Record<CityKey, { [concernKey: string]: string }> = {
  warsaw: { "who-polluting": "Coal heating", "safe-for-kids": "The home" },
  london: { "who-polluting": "Traffic", "safe-for-kids": "School air" },
  accra: { "who-polluting": "Cooking & waste", "safe-for-kids": "Getting data" },
};
