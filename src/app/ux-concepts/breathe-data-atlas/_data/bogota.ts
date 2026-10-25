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
 * Phase 2 (2026-10-25): the types moved to ./city-page.ts, shared by every city page; Bogotá uses
 *   the 'station' map method. Each pollutant names its largest source (round 3 decision J) from
 *   bogota-sources-of-pollutants.csv: the category with the largest share, mapped explicitly to an icon.
 *
 * Key exports: BOGOTA
 * External dependencies: ./indexes, ./city-sensors, ./city-page, ./sensors/bogota-page.json.
 */

import bogotaPageSensors from './sensors/bogota-page.json'
import { CITY_INDEXES } from './indexes'
import { parseCitySensors } from './city-sensors'
import { checkCityPage } from './city-page'
import type { CityPage } from './city-page'

/** Bogotá's two named groups (decision E), English names. */
const PHYSICAL_ACTIVITY = 'People doing physical activity'
const ALLERGIES = 'People with allergies or respiratory diseases'

const IBOCA = CITY_INDEXES.bogota

/** The Bogotá page entry. */
export const BOGOTA: CityPage = {
  slug: 'bogota',
  name: 'Bogotá',
  country: 'Colombia',
  index: IBOCA,
  mapMethod: 'station',
  // Round 3 decision O: three labelled links (Jack's list).
  indexLinks: [
    { label: 'About IBOCA', url: 'http://iboca.ambientebogota.gov.co/publicaciones/175/que-es-el-iboca/' },
    { label: 'IBOCA map: health advice by station', url: 'https://iboca.ambientebogota.gov.co/mapa/' },
    { label: 'Citizen measures to improve air quality', url: 'http://iboca.ambientebogota.gov.co/publicaciones/181/recomendaciones/' },
  ],
  methodLine: 'Bogotá rates air quality at each monitoring station with IBOCA.',
  legendLine: 'Colour shows each station’s IBOCA level.',
  legendNote: null,
  mapCredit: null,
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
  // Round 3 decision X: every pollutant the city publishes in its station data, in tile order.
  publishedPollutants: ['PM1', 'PM2.5', 'PM10', 'O₃', 'NO₂', 'NO', 'NOₓ', 'SO₂', 'CO', 'Black carbon'],
  publishedPollutantsSource: 'bogota-pollutant-names.csv: RMCAB station feed (PM10, O3, NO2, NO, NOX, SO2, CO, eBC), microsensor tables (PM1, PM2.5); BBP excluded (not a pollutant, per the file).',
  indexPollutants: ['PM2.5', 'PM10', 'O₃', 'NO₂', 'SO₂', 'CO'],
  pollutants: {
    'PM2.5': {
      sources: [
        { category: 'Dust lifted from roads by traffic', share: '40%', icon: 'road-dust' },
        { category: 'Fuel burned by vehicles on roads', share: '17%', icon: 'road-traffic' },
        { category: 'Brake and tyre wear', share: '11%', icon: 'road-traffic' },
        { category: 'Construction machinery', share: '10%', icon: 'construction' },
        { category: 'Construction work', share: '10%', icon: 'construction' },
        { category: 'Quarries', share: '6%', icon: 'quarrying' },
      ],
      sourcesNote: null,
      // Largest share: road dust resuspension, 40%.
      largestSource: { icon: 'road-dust', label: 'Road dust' },
      sourcesSubject: null,
    },
    PM10: {
      sources: [
        { category: 'Dust lifted from roads by traffic', share: null, icon: 'road-dust' },
        { category: 'Construction work', share: null, icon: 'construction' },
        { category: 'Brake and tyre wear', share: null, icon: 'road-traffic' },
      ],
      sourcesNote: null,
      // Largest share in the file: road dust resuspension (76.2%, derived from the inventory's tonnes).
      largestSource: { icon: 'road-dust', label: 'Road dust' },
      sourcesSubject: null,
    },
    'O₃': {
      sources: [
        { category: 'Vehicles on roads', share: null, icon: 'road-traffic' },
        { category: 'Evaporation from commercial sources', share: null, icon: 'other' },
      ],
      sourcesNote: 'Ozone is not emitted directly. The inventory lists sources of the gases that form it.',
      // Ozone forms in the air: no direct source, so no icon (decision J).
      largestSource: null,
      sourcesSubject: null,
    },
    'NO₂': {
      sources: [
        { category: 'Fuel burned by vehicles on roads', share: null, icon: 'road-traffic' },
        { category: 'Off-road machinery', share: null, icon: 'construction' },
        { category: 'Industry', share: null, icon: 'industry' },
      ],
      sourcesNote: null,
      // Largest share in the file: on-road mobile sources, combustion (79.4% of NOx, derived).
      largestSource: { icon: 'road-traffic', label: 'Vehicle exhaust' },
      sourcesSubject: 'nitrogen oxides',
    },
    'SO₂': {
      sources: [
        { category: 'Industry', share: null, icon: 'industry' },
        { category: 'Vehicles on roads', share: null, icon: 'road-traffic' },
      ],
      sourcesNote: null,
      // Largest share in the file: industrial fixed sources (81.1% of SOx, derived).
      largestSource: { icon: 'industry', label: 'Industry' },
      sourcesSubject: null,
    },
    CO: {
      sources: [{ category: 'Fuel burned by vehicles on roads', share: null, icon: 'road-traffic' }],
      sourcesNote: null,
      // Largest share in the file: on-road mobile sources, combustion (92.6%, derived).
      largestSource: { icon: 'road-traffic', label: 'Vehicle exhaust' },
      sourcesSubject: null,
    },
    PM1: {
      sources: [],
      sourcesNote: null,
      largestSource: null,
      sourcesSubject: null,
    },
    NO: {
      sources: [],
      sourcesNote: null,
      largestSource: null,
      sourcesSubject: null,
    },
    'NOₓ': {
      sources: [
        { category: 'Fuel burned by vehicles on roads', share: null, icon: 'road-traffic' },
        { category: 'Off-road machinery', share: null, icon: 'construction' },
        { category: 'Industry', share: null, icon: 'industry' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'road-traffic', label: 'Vehicle exhaust' },
      sourcesSubject: null,
    },
    'Black carbon': {
      sources: [
        { category: 'Off-road machinery', share: null, icon: 'construction' },
        { category: 'Vehicles on roads', share: null, icon: 'road-traffic' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'construction', label: 'Off-road machinery' },
      sourcesSubject: null,
    },
  },
  sourcesCredit: {
    label: 'Inventario de Emisiones de Bogotá 2023 (Secretaría Distrital de Ambiente)',
    url: 'https://www.ambientebogota.gov.co/documents/10184/397082/INVENTARIO+EMISIONES_2023_w_apnds.pdf',
  },
  bcIntro: {
    text: 'Bogotá works with Breathe Cities on clean air zones in the southwest of the city, which bring road repairs, greening, sustainable transport and air quality monitoring together, one neighbourhood at a time.',
    linkLead: 'More on Bogotá’s programmes and policies on',
    link: { label: 'Breathe Cities', url: 'https://breathecities.org/cities/bogota/' },
  },
  // Round 3 decision AC (refined): where to get the sensor data for each pollutant, labelled for
  // what each link holds; every URL checked with curl on 2026-10-25.
  pollutantData: {
    'PM2.5': [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }, { label: 'Microsensor readings (PM1, PM2.5, PM10), Bogotá open GIS service', url: 'https://geocimab.ambientebogota.gov.co/wserver/rest/services/RED_MICROSENSORES/tabla_microsensores/FeatureServer/0' }],
    PM10: [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }, { label: 'Microsensor readings (PM1, PM2.5, PM10), Bogotá open GIS service', url: 'https://geocimab.ambientebogota.gov.co/wserver/rest/services/RED_MICROSENSORES/tabla_microsensores/FeatureServer/0' }],
    'O₃': [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }],
    'NO₂': [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }],
    NO: [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }],
    'NOₓ': [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }],
    'SO₂': [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }],
    CO: [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }],
    'Black carbon': [{ label: 'Station reports by parameter, RMCAB (choose the pollutant there)', url: 'https://rmcab.ambientebogota.gov.co/Report/stationreport' }],
    PM1: [{ label: 'Microsensor readings (PM1, PM2.5, PM10), Bogotá open GIS service', url: 'https://geocimab.ambientebogota.gov.co/wserver/rest/services/RED_MICROSENSORES/tabla_microsensores/FeatureServer/0' }],
  },
  goFurther: {
    services: [
      { label: 'IBOCA air quality map', url: 'https://iboca.ambientebogota.gov.co/mapa/' },
      { label: 'RMCAB live monitoring map', url: 'http://rmcab.ambientebogota.gov.co/home/map' },
    ],
    getTheData: [{ label: 'RMCAB data reports', url: 'http://rmcab.ambientebogota.gov.co/' }],
  },
  sensors: parseCitySensors(bogotaPageSensors as unknown, 'bogota', IBOCA.levels.length),
  passiveTubes: null,
  districts: null,
  surface: null,
}

// Build-time checks (the page is pre-rendered, so a mismatch fails the build).
checkCityPage(BOGOTA)
