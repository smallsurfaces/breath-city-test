/**
 * bogota.ts — the Bogotá city page's data (spec sections 4 to 8): the city's own index, update
 * cycle, advice, pollutant sources, links, the mock sensors and the sample growth series.
 *
 * Purpose
 *   Everything the Bogotá page shows that is specific to Bogotá, in one entry shaped like a future
 *   city entry, so Jakarta, Brussels, Sofia and Milan can follow with the same shape. The global
 *   pollutant wording (WHO) is in ./pollutant-explainers.ts.
 *
 * Sources (READ BEFORE EDITING; research files under
 *   research/landscape/analysis/_data-catalogue/validation/bogota/v2/)
 *   - Index levels and colours: ./indexes.ts (IBOCA, copied from the Atlas, the city's own colours).
 *   - Advice: bogota-health-advice.csv, column advice_text_translation_ours, type R items only
 *     (Jack, 25 October). Checked against the live service on 2026-10-25: each band's items come
 *     from https://iboca.ambientebogota.gov.co/iboca/service/recomendationsRange/{25,75,125,175,250}
 *     (rango_id 3 to 7 map to IBOCA levels 1 to 5; /400 returns no items, so level 5 "Peligroso"
 *     carries the 201-300 items). Wording is never changed. The city's own footnote markers (a) to
 *     (d) are kept verbatim: the feed does not define them and their notes were not found online.
 *   - Pollutant sources: bogota-sources-of-pollutants.csv (SDA emissions inventory 2023). Shares
 *     are shown ONLY where the inventory publishes them (PM2.5, Tabla 1 and its text). For the other
 *     pollutants the file's shares are "derived" (computed by the researcher from tonnes), which
 *     would be a number of ours (rule 1), so only the category names are shown.
 *   - Pollutant names: bogota-pollutant-names.csv. The page shows the six core pollutants IBOCA
 *     uses; the feed's other channels (NO, NOx, black carbon, PM1) are not IBOCA pollutants.
 *   - Averaging times: bogota-aqi-bands.csv (IBOCA's own), carried on each mock reading.
 *   - Area and population (Jack, 25 October): the spec's named file publishes neither, so Jack
 *     supplied the Capital District figures from Wikipedia's Bogotá infobox, read 2026-10-25 and
 *     cited there to DANE: population 8,034,649 (2022), shown as "8.0 million (2022)". The area
 *     (1,587 km², Capital District) is NOT shown (Jack, 25 October): it includes the rural south
 *     (Sumapaz), which the map's OSM outline (relation 7426387, "Bogotá ciudad") excludes.
 *   - Links: the content pack's verified links, as the Atlas used them.
 *
 * Mock and sample (spec rule 8)
 *   Sensors: ./sensors/bogota-page.json (positions from the snapshot; readings, bands, freshness and
 *   station types invented). Growth series: invented, start years stated. Iteration 2 removes the
 *   on-page sample markers (decision K2): the nav's "Prototype with sample data" notice is the one
 *   disclosure. The Breathe Cities blurb is still draft copy, not taken from Breathe Cities.
 *
 * Iteration 2 (round 1 feedback, "Decisions for iteration 2", 25 October)
 *   The helper sentences and the `?helper` variants are gone (decision E6), and with them each
 *   pollutant's `helper` field. "Why Bogotá measures it" is dropped (G), so `whyMeasured` and
 *   `standardLink` are gone. The index link reads "IBOCA index" (feedback item 8). Go further has
 *   two groups (J); the Breathe Cities link moved to the "Breathe Cities in Bogotá" section (I).
 *
 * Key exports: AdviceItem, CityLink, GrowthSeries, PollutantSourceLine, PollutantCityInfo, PlaceFact, CityPage,
 *   BOGOTA, hasYearOfArchive, PROTOTYPE_YEAR
 * External dependencies: ./indexes, ./city-sensors, ./sensors/bogota-page.json.
 */

import bogotaPageSensors from './sensors/bogota-page.json'
import { CITY_INDEXES } from './indexes'
import type { CityAirQualityIndex } from './indexes'
import { parseCitySensors, POLLUTANT_ORDER } from './city-sensors'
import type { CitySensor, PollutantId, SensorType } from './city-sensors'

/**
 * One advice item, as the city publishes it (never reworded), with the group the city ties it to
 * (iteration 4, decision E). `group` is null for general advice, else the group's English name,
 * from the `group` column of the city's *-health-advice.csv.
 */
export type AdviceItem = { text: string; group: string | null }

/** Bogotá's two named groups (decision E), English names. */
const PHYSICAL_ACTIVITY = 'People doing physical activity'
const ALLERGIES = 'People with allergies or respiratory diseases'

/** A labelled external link. */
export type CityLink = { label: string; url: string }

/** A sample growth series for a sparkline: one value per year from `startYear`. */
export type GrowthSeries = {
  startYear: number
  values: number[]
  /** Always 'sample': invented for the prototype (covered by the nav notice). */
  status: 'sample'
}

/** One source category for a pollutant, with its share only where the inventory publishes one. */
export type PollutantSourceLine = { category: string; share: string | null }

/** The Bogotá-specific step of a pollutant explainer ("Where it comes from") and its tile. */
export type PollutantCityInfo = {
  /** Where it comes from in the city, as the inventory lists it. */
  sources: PollutantSourceLine[]
  /** A note shown above the sources (e.g. ozone is not emitted directly), or null. */
  sourcesNote: string | null
  /** Sample growth of the number of sites measuring it. Its last value must equal today's count. */
  sitesGrowth: GrowthSeries
}

/** A plain place fact (area, population) with its source and year, as published. */
export type PlaceFact = {
  label: string
  /** As displayed, e.g. "8.0 million". */
  value: string
  /** The figure's year where the source gives one, else null. */
  year: string | null
  /** Where the figure comes from, shown behind the "i". */
  source: CityLink
  /** The exact figure and how it was read, kept as provenance (not displayed). */
  provenance: string
}

/** One city page's data. */
export type CityPage = {
  slug: string
  name: string
  country: string
  /** The city's own index. Colour on the page comes only from here (rule 2). */
  index: CityAirQualityIndex
  /** The index's link, named once wherever advice appears: "IBOCA index" (feedback item 8). */
  adviceLink: CityLink
  /** The method line, now behind the legend's "i" (decision B2), in the city's own terms. */
  methodLine: string
  /** The feed's update cycle in minutes: a reading older than this is stale (spec 5.5). */
  updateCycleMinutes: number
  /** First year of the city's archive; under one year shows counts without sparklines (spec 6.2). */
  archiveStartYear: number
  /**
   * The city's forecast, only when published AS A BAND. Null when there is none or when it is
   * published as a number (converting it would be ours, spec 5.7). The Today / Tomorrow switch
   * appears only when this is not null.
   */
  forecastBands: Record<string, number> | null
  /**
   * The city's advice per index level, keyed by level order (Bogotá: type R only). Items carry their
   * group (decision E); the page lists general items first, then each group under its own heading.
   */
  advice: Record<number, AdviceItem[]>
  /** Population (and area where it matches the map), as published. Shown in the Breathe Cities
   *  section (decision I). Empty when not published (rule 6). */
  placeFacts: PlaceFact[]
  /** Sample growth of each sensor type (spec 6.2). Last value must equal today's count. */
  sensorTypeGrowth: Record<SensorType, GrowthSeries>
  /** Pollutant-specific content and tile series (spec 6.3, 8). */
  pollutants: Record<PollutantId, PollutantCityInfo>
  /** Credit for the pollutant sources. */
  sourcesCredit: CityLink
  /** The sensor detail's source line, per sensor type. */
  sensorSource: Record<SensorType, string>
  /** "Past readings and downloads on [City]'s site" (spec 5.6). */
  pastReadings: CityLink
  /**
   * The "Breathe Cities in [City]" section (decision I): the blurb, then the line
   * "[linkLead] [link]", e.g. "More on Bogotá's programmes and policies on [Breathe Cities]".
   */
  bcIntro: { text: string; linkLead: string; link: CityLink }
  /** Go further (decision J): the city's own air quality services, and where to get the data. */
  goFurther: { services: CityLink[]; getTheData: CityLink[] }
  /** The city's mock sensors. */
  sensors: CitySensor[]
}

/**
 * The year the prototype treats as "now", for the one-year archive rule. A constant, not the
 * clock, so the server and the browser always agree and the page renders the same every time.
 */
export const PROTOTYPE_YEAR = 2026

/** True when the city has at least one year of archive, so its tiles can show sparklines (spec 6.2). */
export function hasYearOfArchive(city: CityPage): boolean {
  return PROTOTYPE_YEAR - city.archiveStartYear >= 1
}

const IBOCA = CITY_INDEXES.bogota

/** The Bogotá page entry. */
export const BOGOTA: CityPage = {
  slug: 'bogota',
  name: 'Bogotá',
  country: 'Colombia',
  index: IBOCA,
  adviceLink: { label: 'IBOCA index', url: 'https://iboca.ambientebogota.gov.co/mapa/' },
  methodLine: 'Bogotá rates air quality at each monitoring station with IBOCA.',
  // Spec 5.5 default (3 hours). IBOCA's map refreshes hourly; the default is kept for review.
  updateCycleMinutes: 180,
  // Sample: the prototype's archive start, not a researched date.
  archiveStartYear: 2015,
  // Bogotá publishes its forecast as a numeric IBOCA value per point (feature 2d partial), so there
  // is no band to show and no switch (spec 5.7).
  forecastBands: null,
  // Groups from the `group` column of bogota-health-advice.csv (decision E): "people doing physical
  // activity / exercise" and "people with allergies or respiratory diseases"; the rest is general.
  advice: {
    1: [
      { text: 'Make the most of it to do outdoor activities', group: null },
      { text: 'Air your home or workplace', group: null },
      { text: 'Prefer places with good air quality.', group: null },
      { text: 'Make the most of it to exercise outdoors without restrictions.', group: PHYSICAL_ACTIVITY },
    ],
    2: [
      { text: 'You can do outdoor activities', group: null },
      { text: 'Air your home or workplace', group: null },
      { text: 'Prefer places with good air quality.', group: null },
      { text: 'If you have allergies or respiratory diseases, take extra precautions.', group: ALLERGIES },
    ],
    3: [
      { text: 'If you have a cough or difficulty breathing(b) during physical activity, take breaks more often.', group: PHYSICAL_ACTIVITY },
      { text: 'Reduce physical activity that needs prolonged or intense outdoor effort and prefer to do it indoors, looking after the indoor air quality', group: PHYSICAL_ACTIVITY },
    ],
    4: [
      { text: 'Reduce physical activity (a) that needs prolonged or intense outdoor effort; prefer indoors, taking breaks more often and looking after the indoor air quality (c).', group: PHYSICAL_ACTIVITY },
    ],
    5: [
      { text: 'Avoid all outdoor activities, and indoors reduce physical activity(a), taking breaks more often and looking after the indoor air quality(c).', group: PHYSICAL_ACTIVITY },
      { text: 'Move to areas with less air pollution.', group: null },
      { text: 'Wear an N95 mask (d) outdoors and indoors while this level of air pollution lasts.', group: null },
    ],
  },
  placeFacts: [
    // No area fact (Jack, 25 October): the 1,587 km² Capital District figure includes Sumapaz,
    // which our OSM outline 7426387 ("Bogotá ciudad") excludes. Add an area only when there is an
    // official figure for the exact outline the map draws.
    {
      label: 'Population',
      value: '8.0 million',
      year: '2022',
      source: { label: 'Wikipedia, Bogotá (figures cited to DANE), read 25 October 2026', url: 'https://en.wikipedia.org/wiki/Bogot%C3%A1' },
      provenance: 'Wikipedia Bogotá infobox, population 8,034,649 (2022, cited to DANE), read 2026-10-25; supplied by Jack.',
    },
  ],
  sensorTypeGrowth: {
    'reference-grade': { startYear: 2015, values: [13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16], status: 'sample' },
    'low-cost': { startYear: 2022, values: [2, 4, 6, 7, 8], status: 'sample' },
  },
  pollutants: {
    'PM2.5': {
      sources: [
        { category: 'Dust lifted from roads by traffic', share: '40%' },
        { category: 'Fuel burned by vehicles on roads', share: '17%' },
        { category: 'Brake and tyre wear', share: '11%' },
        { category: 'Construction machinery', share: '10%' },
        { category: 'Construction work', share: '10%' },
        { category: 'Quarries', share: '6%' },
      ],
      sourcesNote: null,
      sitesGrowth: { startYear: 2015, values: [14, 14, 15, 15, 16, 16, 18, 20, 21, 23, 24, 24], status: 'sample' },
    },
    PM10: {
      sources: [
        { category: 'Dust lifted from roads by traffic', share: null },
        { category: 'Construction work', share: null },
        { category: 'Brake and tyre wear', share: null },
      ],
      sourcesNote: null,
      sitesGrowth: { startYear: 2015, values: [15, 15, 15, 16, 16, 17, 18, 20, 21, 23, 24, 24], status: 'sample' },
    },
    'O₃': {
      sources: [
        { category: 'Vehicles on roads', share: null },
        { category: 'Evaporation from commercial sources', share: null },
      ],
      sourcesNote: 'Ozone is not emitted directly. The inventory lists sources of the gases that form it.',
      sitesGrowth: { startYear: 2015, values: [11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 13], status: 'sample' },
    },
    'NO₂': {
      sources: [
        { category: 'Fuel burned by vehicles on roads', share: null },
        { category: 'Off-road machinery', share: null },
        { category: 'Industry', share: null },
      ],
      sourcesNote: null,
      sitesGrowth: { startYear: 2015, values: [10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 13], status: 'sample' },
    },
    'SO₂': {
      sources: [
        { category: 'Industry', share: null },
        { category: 'Vehicles on roads', share: null },
      ],
      sourcesNote: null,
      sitesGrowth: { startYear: 2015, values: [6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7], status: 'sample' },
    },
    CO: {
      sources: [{ category: 'Fuel burned by vehicles on roads', share: null }],
      sourcesNote: null,
      sitesGrowth: { startYear: 2015, values: [7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8], status: 'sample' },
    },
  },
  sourcesCredit: {
    label: 'Inventario de Emisiones de Bogotá 2023 (Secretaría Distrital de Ambiente)',
    url: 'https://www.ambientebogota.gov.co/documents/10184/397082/INVENTARIO+EMISIONES_2023_w_apnds.pdf',
  },
  sensorSource: {
    'reference-grade': 'Bogotá Air Quality Monitoring Network (RMCAB), Secretaría Distrital de Ambiente',
    'low-cost': 'Bogotá Collaborative Microsensor Network, Secretaría Distrital de Ambiente',
  },
  pastReadings: { label: 'Past readings and downloads on Bogotá’s site', url: 'http://rmcab.ambientebogota.gov.co/' },
  bcIntro: {
    text: 'Bogotá works with Breathe Cities on clean air zones in the southwest of the city, which bring road repairs, greening, sustainable transport and air quality monitoring together, one neighbourhood at a time.',
    linkLead: 'More on Bogotá’s programmes and policies on',
    link: { label: 'Breathe Cities', url: 'https://breathecities.org/cities/bogota/' },
  },
  goFurther: {
    services: [
      { label: 'IBOCA air quality map', url: 'https://iboca.ambientebogota.gov.co/mapa/' },
      { label: 'RMCAB live monitoring map', url: 'http://rmcab.ambientebogota.gov.co/home/map' },
    ],
    getTheData: [{ label: 'RMCAB data reports', url: 'http://rmcab.ambientebogota.gov.co/' }],
  },
  sensors: parseCitySensors(bogotaPageSensors as unknown, 'bogota', IBOCA.levels.length),
}

// ── Build-time checks: the page is pre-rendered, so a mismatch here fails the build ──────────────

/** Every sample series must end on today's count, so a sparkline never contradicts its tile. */
function checkSeries(label: string, series: GrowthSeries, count: number): void {
  const last = series.values[series.values.length - 1]
  if (last !== count) {
    throw new Error(`Breathe Data Atlas: ${label} series ends at ${last}, but the sensor file has ${count}`)
  }
}

for (const type of ['reference-grade', 'low-cost'] as SensorType[]) {
  checkSeries(type, BOGOTA.sensorTypeGrowth[type], BOGOTA.sensors.filter((s) => s.type === type).length)
}
for (const pollutant of POLLUTANT_ORDER) {
  const count = BOGOTA.sensors.filter((s) => s.readings.some((r) => r.pollutant === pollutant)).length
  checkSeries(pollutant, BOGOTA.pollutants[pollutant].sitesGrowth, count)
}
for (const level of IBOCA.levels) {
  if ((BOGOTA.advice[level.order] ?? []).length === 0) {
    throw new Error(`Breathe Data Atlas: Bogotá has no advice for IBOCA level ${level.order}`)
  }
}
