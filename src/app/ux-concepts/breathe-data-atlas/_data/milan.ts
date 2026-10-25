/**
 * milan.ts — the Milan city page's data (SPEC ADDENDUM, Milan: "no live band").
 *
 * Map method: 'none'. ARPA Lombardia's IQA is published only as a daily image, so Milan is treated
 * as having no live band, exactly like Sofia: neutral markers, no scale, no band, no advice.
 *
 * Sources (READ BEFORE EDITING; research files under
 *   research/landscape/analysis/_data-catalogue/validation/milan/v2/)
 *   - Pollutant sources: milan-sources-of-pollutants.csv, ARPA Lombardia's INEMAR inventory 2023 for
 *     the Comune di Milano. Category names as INEMAR's macro-sectors, numbers dropped; shares as
 *     published. Ozone lists its precursors only, so it has no icon.
 *   - Population: the Atlas content pack's verified figure (Comune di Milano, 2025).
 *   - Links: ARPA Lombardia's daily air quality index page (in the research files), AMAT's daily
 *     report and the open data, from the content pack; the Breathe Cities page checked live on
 *     2026-10-25.
 *
 * Mock and sample (spec rule 8): sensors (approximate positions from the city's own map; locality
 * labels, readings and freshness mock), growth series, the blurb.
 *
 * Key exports: MILAN
 * External dependencies: ./city-sensors, ./city-page, ./sensors/milan-page.json.
 */

import milanSensors from './sensors/milan-page.json'
import { parseCitySensors } from './city-sensors'
import { checkCityPage } from './city-page'
import type { CityPage } from './city-page'

/** INEMAR credit. */
const INEMAR = {
  label: 'ARPA Lombardia, INEMAR emissions inventory 2023 (Comune di Milano)',
  url: 'https://www.arpalombardia.it/temi-ambientali/aria/le-emissioni/',
}

/** The Milan page entry. */
export const MILAN: CityPage = {
  slug: 'milan',
  name: 'Milan',
  country: 'Italy',
  index: null,
  mapMethod: 'none',
  indexLinks: [],
  methodLine: 'ARPA Lombardia publishes its air quality index for Milan once a day, as an image, not as a live level per station.',
  legendLine: 'Milan does not publish a live air quality level per station. Tap a sensor to see its latest readings.',
  mapCredit: null,
  updateCycleMinutes: 180,
  archiveStartYear: 2010,
  forecastBands: null,
  advice: {},
  placeFacts: [
    {
      label: 'Population',
      value: '1.4 million',
      year: '2025',
      source: { label: 'Comune di Milano, Portale del Dato, La popolazione a Milano nel 2025', url: 'https://dati.comune.milano.it/web/portale-del-dato/w/la-popolazione-a-milano-nel-2025' },
      provenance: 'Atlas content pack (verified): Comune di Milano, 31 December 2025, resident register.',
    },
  ],
  sensorTypeGrowth: {
    'reference-grade': { startYear: 2010, values: [6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], status: 'sample' },
  },
  pollutants: {
    'PM2.5': {
      sources: [
        { category: 'Road transport', share: '31.47%' },
        { category: 'Other sources and sinks', share: '29.96%' },
        { category: 'Non-industrial combustion (heating)', share: '20.92%' },
        { category: 'Combustion in industry', share: '7.11%' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sitesGrowth: { startYear: 2010, values: [3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5], status: 'sample' },
    },
    PM10: {
      sources: [
        { category: 'Road transport', share: '39.13%' },
        { category: 'Other sources and sinks', share: '22.58%' },
        { category: 'Production processes', share: '13.67%' },
        { category: 'Non-industrial combustion (heating)', share: '13.36%' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sitesGrowth: { startYear: 2010, values: [6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], status: 'sample' },
    },
    'O₃': {
      sources: [
        { category: 'Solvent use', share: '47.79%' },
        { category: 'Road transport', share: '27.59%' },
        { category: 'Non-industrial combustion (heating)', share: '8.29%' },
      ],
      sourcesNote: 'Ozone is not emitted directly. The inventory lists sources of the gases that form it.',
      largestSource: null,
      sitesGrowth: { startYear: 2010, values: [3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], status: 'sample' },
    },
    'NO₂': {
      sources: [
        { category: 'Road transport', share: '61.61%' },
        { category: 'Non-industrial combustion (heating)', share: '21.60%' },
        { category: 'Combustion in industry', share: '6.02%' },
        { category: 'Energy production and fuel transformation', share: '5.94%' },
      ],
      sourcesNote: 'Shares are of nitrogen oxides, the group nitrogen dioxide belongs to.',
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sitesGrowth: { startYear: 2010, values: [6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], status: 'sample' },
    },
    'SO₂': {
      sources: [
        { category: 'Non-industrial combustion (heating)', share: '48.75%' },
        { category: 'Combustion in industry', share: '39.78%' },
        { category: 'Waste treatment and disposal', share: '6.60%' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'home-heating', label: 'Heating' },
      sitesGrowth: { startYear: 2010, values: [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], status: 'sample' },
    },
    CO: {
      sources: [
        { category: 'Road transport', share: '63.39%' },
        { category: 'Non-industrial combustion (heating)', share: '19.53%' },
        { category: 'Other sources and sinks', share: '13.68%' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sitesGrowth: { startYear: 2010, values: [3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], status: 'sample' },
    },
  },
  sourcesCredit: INEMAR,
  bcIntro: {
    text: 'Milan works with Breathe Cities on redesigning its streets around people, with safer school streets, more space to walk and a low emission zone.',
    linkLead: 'More on Milan’s programmes and policies on',
    link: { label: 'Breathe Cities', url: 'https://breathecities.org/cities/milan/' },
  },
  goFurther: {
    services: [
      { label: 'Daily air quality index (ARPA Lombardia)', url: 'https://www.arpalombardia.it/temi-ambientali/aria/modellistica/lindice-di-qualita-dellaria/' },
      { label: 'Daily air quality report (AMAT)', url: 'https://www.amat-mi.it/it/agenzia/rapporto-qualita-aria/' },
    ],
    getTheData: [
      { label: 'City of Milan Open Data: air quality 2025', url: 'https://dati.comune.milano.it/dataset/ds406-rilevazione-qualita-aria-2025' },
      { label: 'Lombardy Open Data: air quality stations', url: 'https://www.dati.lombardia.it/Ambiente/Stazioni-qualit-dell-aria/ib47-atvt' },
    ],
  },
  sensors: parseCitySensors(milanSensors as unknown, 'milan', 0),
  districts: null,
  surface: null,
}

checkCityPage(MILAN)
