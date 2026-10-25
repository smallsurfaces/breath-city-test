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
 *     cited there to DANE: area 1,587 km² (Capital District), population 8,034,649 (2022), shown
 *     as "8.0 million (2022)". NOTE: the Capital District includes the rural south (Sumapaz);
 *     the outline the map draws is OSM relation 7426387, "Bogotá ciudad", which does NOT, so the
 *     area label names the Capital District explicitly.
 *   - Links: the content pack's verified links, as the Atlas used them.
 *
 * Mock and sample (spec rule 8)
 *   Sensors: ./sensors/bogota-page.json (positions from the snapshot; readings, bands, freshness and
 *   station types invented). Growth series: invented, start years stated, marked "Sample figure".
 *   The Breathe Cities intro is sample copy (status 'sample').
 *
 * Helper sentences (spec 5.8, Jack 25 October)
 *   Each pollutant's `helper` is the source half of "Road dust is the largest source of PM2.5 in
 *   Bogotá. It's Bajo right now." From the inventory where the spec says it covers the pollutant
 *   (PM2.5, PM10, NOx), otherwise WHO. Wording never overstates a share: road dust is about 40% of
 *   PM2.5, so it is "the largest source", never "mostly". The band half is the sensor's own level.
 *
 * Key exports: CityLink, SourceIconId, PollutantHelper, GrowthSeries, PollutantSourceLine, PollutantCityInfo, PlaceFact, CityPage,
 *   BOGOTA, hasYearOfArchive, PROTOTYPE_YEAR
 * External dependencies: ./indexes, ./city-sensors, ./sensors/bogota-page.json.
 */

import bogotaPageSensors from './sensors/bogota-page.json'
import { CITY_INDEXES } from './indexes'
import type { CityAirQualityIndex } from './indexes'
import { parseCitySensors, POLLUTANT_ORDER } from './city-sensors'
import type { CitySensor, PollutantId, SensorType } from './city-sensors'

/** A labelled external link. */
export type CityLink = { label: string; url: string }

/** A sample growth series for a sparkline: one value per year from `startYear`. */
export type GrowthSeries = {
  startYear: number
  values: number[]
  /** Always 'sample': invented for the prototype and marked "Sample figure". */
  status: 'sample'
}

/** One source category for a pollutant, with its share only where the inventory publishes one. */
export type PollutantSourceLine = { category: string; share: string | null }

/** The concept-local source icons (spec 5.8): neutral, one per kind of source. */
export type SourceIconId = 'road-dust' | 'traffic' | 'industry' | 'home-heating' | 'forms-in-air' | 'burning-fuel'

/**
 * The "where it comes from" half of a pollutant helper sentence (spec 5.8). From the city's own
 * source study where it covers the pollutant, otherwise WHO, kept faithful. Never states a share the
 * study does not support ("the largest source", not "mostly", when the largest share is 40%).
 */
export type PollutantHelper = {
  /** The sentence, e.g. "Road dust is the largest source of PM2.5 in Bogotá." */
  sentence: string
  /** Whose statement it is: the city's study or WHO. */
  origin: 'city' | 'who'
  /** The icon for the icons variant, mapped from the source category in data. */
  icon: SourceIconId
  /** The short source label beside the icon, in the city's wording where it is the city's. */
  label: string
}

/** The Bogotá-specific steps of a pollutant explainer (spec 8, steps 2 and 4) and its tile. */
export type PollutantCityInfo = {
  /** The helper sentence's source half (spec 5.8). */
  helper: PollutantHelper
  /** Where it comes from in the city, as the inventory lists it. */
  sources: PollutantSourceLine[]
  /** A note shown above the sources (e.g. ozone is not emitted directly), or null. */
  sourcesNote: string | null
  /** Why the city measures it: one line. */
  whyMeasured: string
  /** Sample growth of the number of sites measuring it. Its last value must equal today's count. */
  sitesGrowth: GrowthSeries
}

/** A plain place fact (area, population) with its source and year, as published. */
export type PlaceFact = {
  label: string
  /** As displayed, e.g. "1,587 km²" or "8.0 million". */
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
  /** The index's credit link label: always "[Index] · Find out more" (rule 4). */
  adviceLink: CityLink
  /** The method line above the map (spec 5.1), in the city's own terms. */
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
  /** The city's advice per index level (type R only), keyed by level order. */
  advice: Record<number, string[]>
  /** Area and population, as published (spec 6.1). Empty when not published (rule 6). */
  placeFacts: PlaceFact[]
  /** Sample growth of each sensor type (spec 6.2). Last value must equal today's count. */
  sensorTypeGrowth: Record<SensorType, GrowthSeries>
  /** Pollutant-specific content and tile series (spec 6.3, 8). */
  pollutants: Record<PollutantId, PollutantCityInfo>
  /** Credit for the pollutant sources. */
  sourcesCredit: CityLink
  /** Link for "Why the city measures it" (the city's index and its legal basis). */
  standardLink: CityLink
  /** The sensor detail's source line, per sensor type. */
  sensorSource: Record<SensorType, string>
  /** "Past readings and downloads on [City]'s site" (spec 5.6). */
  pastReadings: CityLink
  /** The Breathe Cities intro blurb (spec 6.4). Sample copy. */
  bcIntro: { text: string; link: CityLink; status: 'sample' }
  /** Go further (spec 7). */
  goFurther: { checkTodaysAir: CityLink[]; getTheData: CityLink[]; programmes: { heading: string; link: CityLink } }
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
  adviceLink: { label: 'IBOCA · Find out more', url: 'https://iboca.ambientebogota.gov.co/mapa/' },
  methodLine: 'Bogotá rates air quality at each monitoring station with IBOCA.',
  // Spec 5.5 default (3 hours). IBOCA's map refreshes hourly; the default is kept for review.
  updateCycleMinutes: 180,
  // Sample: the prototype's archive start, not a researched date.
  archiveStartYear: 2015,
  // Bogotá publishes its forecast as a numeric IBOCA value per point (feature 2d partial), so there
  // is no band to show and no switch (spec 5.7).
  forecastBands: null,
  advice: {
    1: [
      'Make the most of it to do outdoor activities',
      'Air your home or workplace',
      'Prefer places with good air quality.',
      'Make the most of it to exercise outdoors without restrictions.',
    ],
    2: [
      'You can do outdoor activities',
      'Air your home or workplace',
      'Prefer places with good air quality.',
      'If you have allergies or respiratory diseases, take extra precautions.',
    ],
    3: [
      'If you have a cough or difficulty breathing(b) during physical activity, take breaks more often.',
      'Reduce physical activity that needs prolonged or intense outdoor effort and prefer to do it indoors, looking after the indoor air quality',
    ],
    4: [
      'Reduce physical activity (a) that needs prolonged or intense outdoor effort; prefer indoors, taking breaks more often and looking after the indoor air quality (c).',
    ],
    5: [
      'Avoid all outdoor activities, and indoors reduce physical activity(a), taking breaks more often and looking after the indoor air quality(c).',
      'Move to areas with less air pollution.',
      'Wear an N95 mask (d) outdoors and indoors while this level of air pollution lasts.',
    ],
  },
  placeFacts: [
    {
      label: 'Area (Capital District)',
      value: '1,587 km²',
      year: null,
      source: { label: 'Wikipedia, Bogotá (figures cited to DANE), read 25 October 2026', url: 'https://en.wikipedia.org/wiki/Bogot%C3%A1' },
      provenance: 'Wikipedia Bogotá infobox, Capital District area 1,587 km², read 2026-10-25; supplied by Jack.',
    },
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
      helper: { sentence: 'Road dust is the largest source of PM2.5 in Bogotá.', origin: 'city', icon: 'road-dust', label: 'Road dust' },
      sources: [
        { category: 'Dust lifted from roads by traffic', share: '40%' },
        { category: 'Fuel burned by vehicles on roads', share: '17%' },
        { category: 'Brake and tyre wear', share: '11%' },
        { category: 'Construction machinery', share: '10%' },
        { category: 'Construction work', share: '10%' },
        { category: 'Quarries', share: '6%' },
      ],
      sourcesNote: null,
      whyMeasured: 'PM2.5 is one of the pollutants in IBOCA, Bogotá’s air quality and health index.',
      sitesGrowth: { startYear: 2015, values: [14, 14, 15, 15, 16, 16, 18, 20, 21, 23, 24, 24], status: 'sample' },
    },
    PM10: {
      helper: { sentence: 'Road dust is the largest source of PM10 in Bogotá.', origin: 'city', icon: 'road-dust', label: 'Road dust' },
      sources: [
        { category: 'Dust lifted from roads by traffic', share: null },
        { category: 'Construction work', share: null },
        { category: 'Brake and tyre wear', share: null },
      ],
      sourcesNote: null,
      whyMeasured: 'PM10 is one of the pollutants in IBOCA, Bogotá’s air quality and health index.',
      sitesGrowth: { startYear: 2015, values: [15, 15, 15, 16, 16, 17, 18, 20, 21, 23, 24, 24], status: 'sample' },
    },
    'O₃': {
      helper: { sentence: 'O₃ forms from traffic and industrial fumes in sunlight.', origin: 'who', icon: 'forms-in-air', label: 'Forms in the air' },
      sources: [
        { category: 'Vehicles on roads', share: null },
        { category: 'Evaporation from commercial sources', share: null },
      ],
      sourcesNote: 'Ozone is not emitted directly. The inventory lists sources of the gases that form it.',
      whyMeasured: 'O₃ is one of the pollutants in IBOCA, Bogotá’s air quality and health index.',
      sitesGrowth: { startYear: 2015, values: [11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 13], status: 'sample' },
    },
    'NO₂': {
      helper: { sentence: 'Vehicles on roads are the largest source of nitrogen oxides, which include NO₂, in Bogotá.', origin: 'city', icon: 'traffic', label: 'Vehicles on roads' },
      sources: [
        { category: 'Fuel burned by vehicles on roads', share: null },
        { category: 'Off-road machinery', share: null },
        { category: 'Industry', share: null },
      ],
      sourcesNote: null,
      whyMeasured: 'NO₂ is one of the pollutants in IBOCA, Bogotá’s air quality and health index.',
      sitesGrowth: { startYear: 2015, values: [10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 13], status: 'sample' },
    },
    'SO₂': {
      helper: { sentence: 'SO₂ comes from burning fossil fuels such as coal and oil.', origin: 'who', icon: 'industry', label: 'Burning coal and oil' },
      sources: [
        { category: 'Industry', share: null },
        { category: 'Vehicles on roads', share: null },
      ],
      sourcesNote: null,
      whyMeasured: 'SO₂ is one of the pollutants in IBOCA, Bogotá’s air quality and health index.',
      sitesGrowth: { startYear: 2015, values: [6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7], status: 'sample' },
    },
    CO: {
      helper: { sentence: 'CO forms when fuels such as wood, petrol or gas burn incompletely.', origin: 'who', icon: 'burning-fuel', label: 'Fuel burning incompletely' },
      sources: [{ category: 'Fuel burned by vehicles on roads', share: null }],
      sourcesNote: null,
      whyMeasured: 'CO is one of the pollutants in IBOCA, Bogotá’s air quality and health index.',
      sitesGrowth: { startYear: 2015, values: [7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8], status: 'sample' },
    },
  },
  sourcesCredit: {
    label: 'Inventario de Emisiones de Bogotá 2023 (Secretaría Distrital de Ambiente)',
    url: 'https://www.ambientebogota.gov.co/documents/10184/397082/INVENTARIO+EMISIONES_2023_w_apnds.pdf',
  },
  standardLink: {
    label: 'About IBOCA (Resolución Conjunta 2840 de 2023)',
    url: 'https://iboca.ambientebogota.gov.co/publicaciones/175/que-es-el-iboca/',
  },
  sensorSource: {
    'reference-grade': 'Bogotá Air Quality Monitoring Network (RMCAB), Secretaría Distrital de Ambiente',
    'low-cost': 'Bogotá Collaborative Microsensor Network, Secretaría Distrital de Ambiente',
  },
  pastReadings: { label: 'Past readings and downloads on Bogotá’s site', url: 'http://rmcab.ambientebogota.gov.co/' },
  bcIntro: {
    text: 'Bogotá works with Breathe Cities on clean air zones in the southwest of the city, which bring road repairs, greening, sustainable transport and air quality monitoring together, one neighbourhood at a time.',
    link: { label: 'Bogotá on Breathe Cities', url: 'https://breathecities.org/cities/bogota/' },
    status: 'sample',
  },
  goFurther: {
    checkTodaysAir: [
      { label: 'IBOCA air quality map', url: 'https://iboca.ambientebogota.gov.co/mapa/' },
      { label: 'RMCAB live monitoring map', url: 'http://rmcab.ambientebogota.gov.co/home/map' },
    ],
    getTheData: [{ label: 'RMCAB data reports', url: 'http://rmcab.ambientebogota.gov.co/' }],
    programmes: {
      heading: 'Programmes and policies in Bogotá',
      link: { label: 'Bogotá on breathecities.org', url: 'https://breathecities.org/cities/bogota/' },
    },
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
