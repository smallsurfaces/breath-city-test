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
  // Round 3 decision U: one line in place of the legend's index block. Link from
  // milan-aqi-bands.csv source_document (ARPA Lombardia's air quality index page).
  legendNote: {
    text: 'For today’s air quality report, visit',
    link: { label: 'ARPA Lombardia', url: 'https://www.arpalombardia.it/temi-ambientali/aria/modellistica/lindice-di-qualita-dellaria/' },
  },
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
  // Round 3 decision X: every pollutant the city publishes in its station data, in tile order.
  publishedPollutants: ['PM2.5', 'PM10', 'O₃', 'NO₂', 'NOₓ', 'SO₂', 'CO', 'Black carbon', 'Benzene', 'NH₃', 'As', 'Cd', 'Ni', 'Pb', 'BaP'],
  publishedPollutantsSource: 'milan-pollutant-names.csv: Regione Lombardia sensor registry for Milan (nometiposensore).',
  indexPollutants: [],
  pollutants: {
    'PM2.5': {
      sources: [
        { category: 'Road transport', share: '31.47%', icon: 'road-traffic' },
        { category: 'Other sources and sinks', share: '29.96%', icon: 'other' },
        { category: 'Non-industrial combustion (heating)', share: '20.92%', icon: 'home-heating' },
        { category: 'Combustion in industry', share: '7.11%', icon: 'industry' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sourcesSubject: null,
    },
    PM10: {
      sources: [
        { category: 'Road transport', share: '39.13%', icon: 'road-traffic' },
        { category: 'Other sources and sinks', share: '22.58%', icon: 'other' },
        { category: 'Production processes', share: '13.67%', icon: 'industry' },
        { category: 'Non-industrial combustion (heating)', share: '13.36%', icon: 'home-heating' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sourcesSubject: null,
    },
    'O₃': {
      sources: [
        { category: 'Solvent use', share: '47.79%', icon: 'other' },
        { category: 'Road transport', share: '27.59%', icon: 'road-traffic' },
        { category: 'Non-industrial combustion (heating)', share: '8.29%', icon: 'home-heating' },
      ],
      sourcesNote: 'Ozone is not emitted directly. The inventory lists sources of the gases that form it.',
      largestSource: null,
      sourcesSubject: null,
    },
    'NO₂': {
      sources: [
        { category: 'Road transport', share: '61.61%', icon: 'road-traffic' },
        { category: 'Non-industrial combustion (heating)', share: '21.60%', icon: 'home-heating' },
        { category: 'Combustion in industry', share: '6.02%', icon: 'industry' },
        { category: 'Energy production and fuel transformation', share: '5.94%', icon: 'industry' },
      ],
      sourcesNote: 'Shares are of nitrogen oxides, the group nitrogen dioxide belongs to.',
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sourcesSubject: 'nitrogen oxides',
    },
    'SO₂': {
      sources: [
        { category: 'Non-industrial combustion (heating)', share: '48.75%', icon: 'home-heating' },
        { category: 'Combustion in industry', share: '39.78%', icon: 'industry' },
        { category: 'Waste treatment and disposal', share: '6.60%', icon: 'waste-burning' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'home-heating', label: 'Heating' },
      sourcesSubject: null,
    },
    CO: {
      sources: [
        { category: 'Road transport', share: '63.39%', icon: 'road-traffic' },
        { category: 'Non-industrial combustion (heating)', share: '19.53%', icon: 'home-heating' },
        { category: 'Other sources and sinks', share: '13.68%', icon: 'other' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sourcesSubject: null,
    },
    'NOₓ': {
      sources: [
        { category: 'Road transport', share: '61.61%', icon: 'road-traffic' },
        { category: 'Non-industrial combustion (heating)', share: '21.60%', icon: 'home-heating' },
        { category: 'Combustion in industry', share: '6.02%', icon: 'industry' },
        { category: 'Energy production and fuel transformation', share: '5.94%', icon: 'industry' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sourcesSubject: null,
    },
    'Black carbon': {
      sources: [
        { category: 'Road transport', share: '47.06%', icon: 'road-traffic' },
        { category: 'Other sources and sinks', share: '39.06%', icon: 'other' },
        { category: 'Non-industrial combustion (heating)', share: '8.21%', icon: 'home-heating' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sourcesSubject: null,
    },
    Benzene: {
      sources: [],
      sourcesNote: null,
      largestSource: null,
      sourcesSubject: null,
    },
    'NH₃': {
      sources: [
        { category: 'Other sources and sinks', share: '46.87%', icon: 'other' },
        { category: 'Agriculture', share: '33.11%', icon: 'other' },
        { category: 'Road transport', share: '12.63%', icon: 'road-traffic' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'other', label: 'Other sources and sinks' },
      sourcesSubject: null,
    },
    As: {
      sources: [
        { category: 'Combustion in industry', share: '39.03%', icon: 'industry' },
        { category: 'Road transport', share: '21.16%', icon: 'road-traffic' },
        { category: 'Waste treatment and disposal', share: '13.88%', icon: 'waste-burning' },
        { category: 'Non-industrial combustion (heating)', share: '12.01%', icon: 'home-heating' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'industry', label: 'Industry' },
      sourcesSubject: null,
    },
    Cd: {
      sources: [
        { category: 'Non-industrial combustion (heating)', share: '35.39%', icon: 'home-heating' },
        { category: 'Other sources and sinks', share: '25.92%', icon: 'other' },
        { category: 'Combustion in industry', share: '20.48%', icon: 'industry' },
        { category: 'Road transport', share: '15.67%', icon: 'road-traffic' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'home-heating', label: 'Heating' },
      sourcesSubject: null,
    },
    Ni: {
      sources: [
        { category: 'Combustion in industry', share: '47.12%', icon: 'industry' },
        { category: 'Road transport', share: '32.65%', icon: 'road-traffic' },
        { category: 'Other sources and sinks', share: '10.80%', icon: 'other' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'industry', label: 'Industry' },
      sourcesSubject: null,
    },
    Pb: {
      sources: [
        { category: 'Road transport', share: '70.58%', icon: 'road-traffic' },
        { category: 'Combustion in industry', share: '12.32%', icon: 'industry' },
        { category: 'Other sources and sinks', share: '10.82%', icon: 'other' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Road transport' },
      sourcesSubject: null,
    },
    BaP: {
      sources: [
        { category: 'Non-industrial combustion (heating)', share: '51.81%', icon: 'home-heating' },
        { category: 'Other sources and sinks', share: '30.25%', icon: 'other' },
        { category: 'Road transport', share: '10.14%', icon: 'road-traffic' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'home-heating', label: 'Heating' },
      sourcesSubject: null,
    },
  },
  sourcesCredit: INEMAR,
  bcIntro: {
    text: 'Milan works with Breathe Cities on redesigning its streets around people, with safer school streets, more space to walk and a low emission zone.',
    linkLead: 'More on Milan’s programmes and policies on',
    link: { label: 'Breathe Cities', url: 'https://breathecities.org/cities/milan/' },
  },
  // Round 3 decision AC, readable pages (Jack): human-readable pages only, checked as text/html on
  // 2026-10-25. Lombardy's open data has no verified filtered page view, so the labels say where to
  // filter. ARPA Lombardia's pollutant pages are information pages, not data, so they are not used.
  pollutantData: {
    'PM2.5': [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and PM2.5 there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    PM10: [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and PM10 there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    'O₃': [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and O₃ there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    'NO₂': [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and NO₂ there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    'NOₓ': [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and NOₓ there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    'SO₂': [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and SO₂ there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    CO: [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and CO there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    'Black carbon': [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and Black carbon there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    Benzene: [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and Benzene there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    'NH₃': [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and NH₃ there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    As: [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and As there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    Cd: [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and Cd there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    Ni: [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and Ni there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    Pb: [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and Pb there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
    BaP: [{ label: 'Sensors by station and pollutant, Lombardy open data (filter to Milano and BaP there)', url: 'https://www.dati.lombardia.it/d/ib47-atvt' }, { label: 'Air sensor measurements since 2018, Lombardy open data (by sensor)', url: 'https://www.dati.lombardia.it/d/g2hp-ar79' }],
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
  passiveTubes: null,
  districts: null,
  surface: null,
}

checkCityPage(MILAN)
