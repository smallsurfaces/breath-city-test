/**
 * sofia.ts — the Sofia city page's data (SPEC ADDENDUM, Sofia: "no index").
 *
 * Map method: 'none'. Sofia publishes a PM10 concentration scale, not an index, and its colours do
 * not reliably carry a band, so the page shows NO band anywhere: neutral markers (shape for sensor
 * type only), no scale, no advice. The European index the old Atlas showed is NOT used (the 'sofia'
 * entry in ./indexes.ts belongs to the locked Atlas copy and is never read here).
 *
 * Sources (READ BEFORE EDITING; research files under
 *   research/landscape/analysis/_data-catalogue/validation/sofia/v2/)
 *   - Pollutant sources: sofia-sources-of-pollutants.csv, the municipality's air quality programme
 *     2021-2026, Table IV-17 (emissions 2018). Shares as published. SO₂ and ozone have only national,
 *     generic, unquantified entries, so "Where it comes from in Sofia" and the tile icon are absent.
 *   - Population: the Atlas content pack's verified figure (NSI, 2025 final data, Sofia Municipality).
 *   - Links: the content pack's verified links; the Breathe Cities page was checked live on 2026-10-25.
 *
 * Mock and sample (spec rule 8): sensors (six real EEA/AMS positions and the placed low-cost ones
 * from the Atlas file; readings, freshness and locality labels mock), growth series, the blurb.
 *
 * Key exports: SOFIA
 * External dependencies: ./city-sensors, ./city-page, ./sensors/sofia-page.json.
 */

import sofiaSensors from './sensors/sofia-page.json'
import { parseCitySensors } from './city-sensors'
import { checkCityPage } from './city-page'
import type { CityPage } from './city-page'

/** The programme credit. */
const PROGRAMME = {
  label: 'Sofia Municipality, air quality programme 2021-2026, Table IV-17 (emissions 2018)',
  url: 'https://air.sofia.bg/docs/Programme.pdf',
}

/** The Sofia page entry. */
export const SOFIA: CityPage = {
  slug: 'sofia',
  name: 'Sofia',
  country: 'Bulgaria',
  index: null,
  mapMethod: 'none',
  indexLinks: [],
  methodLine: 'Sofia publishes readings from its monitoring stations and a PM10 concentration scale, but no air quality index.',
  legendLine: 'Sofia does not publish an air quality index. Tap a sensor to see its latest readings.',
  // Round 3 decision U, extended to Sofia (Jack): one line in place of the legend's index block.
  // "forecast" is confirmed: sofia-aqi-bands.csv lists the NIMH PM10 forecast on air.sofia.bg
  // (https://air.sofia.bg/airpublic/forecasts/list/).
  legendNote: {
    text: 'For Sofia’s air quality readings and forecast, visit',
    link: { label: 'air.sofia.bg', url: 'https://air.sofia.bg/' },
  },
  mapCredit: null,
  updateCycleMinutes: 180,
  archiveStartYear: 2012,
  forecastBands: null,
  advice: {},
  placeFacts: [
    {
      label: 'Population',
      value: '1.3 million',
      year: '2025',
      source: { label: 'National Statistical Institute, Population and demographic processes in 2025, final data', url: 'https://www.nsi.bg/press-release/naselenie-i-demografski-procesi-9002' },
      provenance: 'Atlas content pack (verified): Stolichna obshtina (Sofia Municipality), 31 December 2025.',
    },
  ],
  sensorTypeGrowth: {
    'reference-grade': { startYear: 2012, values: [5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6], status: 'sample' },
    'low-cost': { startYear: 2021, values: [2, 3, 5, 6, 7, 8], status: 'sample' },
  },
  pollutants: {
    'PM2.5': {
      sources: [
        { category: 'Household heating', share: '73.28%', icon: 'home-heating' },
        { category: 'Resuspended particles from area sources', share: '14.10%', icon: 'road-dust' },
        { category: 'Road transport', share: '11.13%', icon: 'road-traffic' },
        { category: 'Industry', share: '1.40%', icon: 'industry' },
        { category: 'Construction', share: '0.09%', icon: 'construction' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'home-heating', label: 'Household heating' },
      sitesGrowth: { startYear: 2012, values: [3, 3, 3, 4, 4, 5, 5, 5, 5, 7, 8, 10, 11, 13, 14], status: 'sample' },
    },
    PM10: {
      sources: [
        { category: 'Household heating', share: '55.97%', icon: 'home-heating' },
        { category: 'Resuspended particles from area sources', share: '31.50%', icon: 'road-dust' },
        { category: 'Road transport', share: '10.78%', icon: 'road-traffic' },
        { category: 'Industry', share: '1.09%', icon: 'industry' },
        { category: 'Construction', share: '0.66%', icon: 'construction' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'home-heating', label: 'Household heating' },
      sitesGrowth: { startYear: 2012, values: [5, 5, 5, 5, 5, 6, 6, 6, 6, 8, 9, 11, 12, 13, 14], status: 'sample' },
    },
    'O₃': {
      sources: [],
      sourcesNote: null,
      largestSource: null,
      sitesGrowth: { startYear: 2012, values: [4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6], status: 'sample' },
    },
    'NO₂': {
      sources: [
        { category: 'Road transport', share: '78.73%', icon: 'road-traffic' },
        { category: 'Industry', share: '15.55%', icon: 'industry' },
        { category: 'Household heating', share: '5.72%', icon: 'home-heating' },
      ],
      sourcesNote: 'Shares are of nitrogen oxides, the group nitrogen dioxide belongs to.',
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sitesGrowth: { startYear: 2012, values: [4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6], status: 'sample' },
    },
    'SO₂': {
      sources: [],
      sourcesNote: null,
      largestSource: null,
      sitesGrowth: { startYear: 2012, values: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], status: 'sample' },
    },
    CO: {
      sources: [
        { category: 'Household heating', share: '69.09%', icon: 'home-heating' },
        { category: 'Road transport', share: '30.41%', icon: 'road-traffic' },
        { category: 'Industry', share: '0.50%', icon: 'industry' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'home-heating', label: 'Household heating' },
      sitesGrowth: { startYear: 2012, values: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], status: 'sample' },
    },
  },
  sourcesCredit: PROGRAMME,
  bcIntro: {
    text: 'Sofia works with Breathe Cities on replacing wood and coal stoves in homes and on restricting older, more polluting cars in its centre.',
    linkLead: 'More on Sofia’s programmes and policies on',
    link: { label: 'Breathe Cities', url: 'https://breathecities.org/cities/sofia/' },
  },
  goFurther: {
    services: [{ label: 'Sofia air quality information system', url: 'https://air.sofia.bg/' }],
    getTheData: [{ label: 'Data from automatic monitoring stations', url: 'https://air.sofia.bg/airpublic/air/data/forecasts/measures/list/' }],
  },
  sensors: parseCitySensors(sofiaSensors as unknown, 'sofia', 0),
  passiveTubes: null,
  districts: null,
  surface: null,
}

checkCityPage(SOFIA)
