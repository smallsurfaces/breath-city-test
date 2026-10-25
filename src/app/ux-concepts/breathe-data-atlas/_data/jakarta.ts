/**
 * jakarta.ts — the Jakarta city page's data (SPEC ADDENDUM, Jakarta: "band per district").
 *
 * Map method: 'district'. Jakarta's districts (kecamatan) are shaded lightly in their ISPU band
 * colour; sensor markers are neutral (the band belongs to the district, not the sensor).
 *
 * Sources (READ BEFORE EDITING; research files under
 *   research/landscape/analysis/_data-catalogue/validation/jakarta/v2/)
 *   - Index: ISPU as Permen LHK P.14/2020 sets it (./indexes.ts, ISPU rows of jakarta-aqi-bands.csv).
 *   - Advice: jakarta-health-advice.csv, column advice_text_translation_ours, never reworded:
 *       * Udara Jakarta (the city's own platform, DLH DKI Jakarta) for levels 1 to 3: its summary
 *         sentence per group (general population, pregnant women, children, older people, people with
 *         chronic illness). The platform's longer DO / DON'T lists are not shown in this pass.
 *         Udara Jakarta publishes no items for levels 4 and 5 ("n/a").
 *       * The national ISPU portal (KLH/BPLH) for every level: "everyone" items as general advice,
 *         and its sensitive groups, people with asthma and people with heart disease items.
 *     Group names in English, from the file's `group` column. The smoke event advisory is not tied
 *     to a band, so it is not shown (round 3 decision E).
 *   - Pollutant sources: jakarta-sources-of-pollutants.csv, the city's Grand Design (DLH with ITB,
 *     Bab 4.1). Shares as published (ranges, "above 46%"). CO and ozone have only national, generic,
 *     unquantified entries, so "Where it comes from in Jakarta" is absent for them (rule 6).
 *   - Largest source (decision J): PM2.5 and PM10's largest category is "transport and industry
 *     (combined)", which no single icon can say, so it takes the 'other' icon with the city's wording.
 *   - Population: the Atlas content pack's verified figure (Dinas Kependudukan dan Pencatatan Sipil
 *     DKI Jakarta, 10.88 million on 31 December 2025, civil registration).
 *   - Links: the content pack's verified links (Udara Jakarta; PPID data requests); the Breathe Cities
 *     page was checked live on 2026-10-25.
 *
 * Mock and sample (spec rule 8): sensors (./sensors/jakarta-page.json; approximate positions from the
 * city's own map), district bands (./areas/jakarta-districts.json), growth series, the blurb.
 *
 * Key exports: JAKARTA
 * External dependencies: ./indexes, ./city-sensors, ./city-page, ./sensors/jakarta-page.json,
 *   ./areas/jakarta-districts.json.
 */

import jakartaSensors from './sensors/jakarta-page.json'
import jakartaDistricts from './areas/jakarta-districts.json'
import { CITY_INDEXES } from './indexes'
import { parseCitySensors } from './city-sensors'
import { checkCityPage, parseDistricts } from './city-page'
import type { CityPage } from './city-page'

const ISPU = CITY_INDEXES.jakarta

/** Jakarta's named advice groups, English names from the advice file's `group` column. */
const PREGNANT = 'Pregnant women'
const CHILDREN = 'Children'
const OLDER = 'Older people'
const CHRONIC = 'People with chronic illness'
const SENSITIVE = 'Sensitive groups'
const ASTHMA = 'People with asthma'
const HEART = 'People with heart disease'

/** Grand Design credit, shared by every Jakarta source line. */
const GRAND_DESIGN = {
  label: 'Grand Design Pengendalian Pencemaran Udara Provinsi DKI Jakarta (DLH with ITB), section 4.1',
  url: 'https://lingkunganhidup.jakarta.go.id/uploads/images/galery/publikasi_data_20250710081938.pdf',
}

/** The Jakarta page entry. */
export const JAKARTA: CityPage = {
  slug: 'jakarta',
  name: 'Jakarta',
  country: 'Indonesia',
  index: ISPU,
  mapMethod: 'district',
  // Round 3 decision O: from jakarta-aqi-bands.csv (source_document) and jakarta-health-advice.csv
  // (source_url), labelled for what each page holds.
  indexLinks: [
    { label: 'ISPU regulation (Permen LHK P.14/2020)', url: 'https://peraturan.bpk.go.id/Details/163466/permen-lhk-no-14-tahun-2020' },
    { label: 'Udara Jakarta: health advice by ISPU level', url: 'https://udara.jakarta.go.id/' },
    { label: 'National ISPU portal: what to do at each level', url: 'https://ispu.kemenlh.go.id/app/' },
  ],
  methodLine: 'Jakarta rates air quality for each district with ISPU.',
  legendLine: 'Colour shows each district’s ISPU level.',
  legendNote: null,
  mapCredit: { label: 'District outlines: © OpenStreetMap contributors (ODbL)', url: 'https://www.openstreetmap.org/copyright' },
  updateCycleMinutes: 180,
  archiveStartYear: 2019,
  forecastBands: null,
  advice: {
    1: [
      { text: 'Air quality is good and safe to breathe; health risk very low, so people can be active outdoors as usual.', group: null },
      { text: 'Very good for outdoor activities.', group: null },
      { text: "Pregnant women can be active and do light exercise outdoors comfortably, to support the mother's health and the baby's development.", group: PREGNANT },
      { text: 'Children can play and exercise outdoors comfortably, supporting growth, lung health and fitness.', group: CHILDREN },
      { text: 'Older people can do light outdoor activity such as relaxed walking or light exercise, for heart, lung and general fitness.', group: OLDER },
      { text: 'People with chronic illness can still do light outdoor activity as their condition and doctor allow.', group: CHRONIC },
    ],
    2: [
      { text: 'Air quality is still within safe limits for the general public; low health risk, but limiting long exposure is advised.', group: null },
      { text: 'Can still be active outdoors.', group: null },
      { text: 'Pregnant women should stay alert to air pollution; though still safe, avoid prolonged exposure, especially near pollution sources.', group: PREGNANT },
      { text: 'Children are more vulnerable because their respiratory system is still developing; they can still be active outdoors, but watch for cough, shortness of breath or other complaints.', group: CHILDREN },
      { text: 'Older people should watch their exposure, especially with a history of heart or lung disease; limit strenuous outdoor activity.', group: OLDER },
      { text: 'People with chronic illness should be careful because pollution can worsen symptoms; monitor your body and keep routine medicine at hand.', group: CHRONIC },
      { text: 'Reduce prolonged or strenuous physical activity.', group: SENSITIVE },
    ],
    3: [
      { text: 'Air quality is starting to affect health, especially with long exposure; reduce strenuous outdoor physical activity.', group: null },
      { text: 'Reduce prolonged physical activity outdoors.', group: null },
      { text: 'Pregnant women are a vulnerable group; exposure at this level can increase the risk of respiratory problems and affect mother and baby; reduce outdoor activity.', group: PREGNANT },
      { text: 'Children are at risk of respiratory problems such as cough, shortness of breath or throat irritation; their developing airways make them more sensitive; limit outdoor activity.', group: CHILDREN },
      { text: 'Older people are more vulnerable; the risk of shortness of breath, chest pain and fatigue rises; reduce outdoor activity and stay indoors if possible.', group: OLDER },
      { text: 'People with chronic illness should not be active outdoors; pollution can trigger asthma attacks, breathlessness or heart problems; use an N95 mask if you must go out.', group: CHRONIC },
      { text: 'May be active outdoors with more frequent breaks and light activity. Watch for symptoms such as cough or shortness of breath.', group: SENSITIVE },
      { text: 'People with asthma should follow health instructions and carry their medicine.', group: ASTHMA },
      { text: 'People with heart disease should watch for symptoms such as palpitations, shortness of breath or unusual tiredness.', group: HEART },
    ],
    4: [
      { text: 'Avoid prolonged outdoor physical activity and consider indoor activity.', group: null },
      { text: 'Avoid all outdoor activity; do more indoors or reschedule.', group: SENSITIVE },
    ],
    5: [
      { text: 'Avoid all outdoor activity.', group: null },
      { text: 'Stay indoors and keep activity low.', group: SENSITIVE },
    ],
  },
  placeFacts: [
    {
      label: 'Population',
      value: '10.9 million',
      year: '2025',
      source: {
        label: 'Dinas Kependudukan dan Pencatatan Sipil Provinsi DKI Jakarta',
        url: 'https://kependudukancapil.jakarta.go.id/2026/03/13/data-kependudukan-bersih-semester-ii-2025-dirilis-penduduk-dki-jakarta-tercatat-1088-juta-jiwa/',
      },
      provenance: 'Atlas content pack (verified): 10.88 million, DKI Jakarta province, 31 December 2025, civil registration.',
    },
  ],
  sensorTypeGrowth: {
    'reference-grade': { startYear: 2019, values: [5, 5, 5, 6, 8, 10, 11, 12], status: 'sample' },
    'low-cost': { startYear: 2023, values: [12, 40, 72, 90], status: 'sample' },
  },
  // Round 3 decision X: every pollutant the city publishes in its station data, in tile order.
  publishedPollutants: ['PM2.5', 'PM10', 'TSP', 'O₃', 'NO₂', 'NO', 'SO₂', 'CO', 'HC'],
  publishedPollutantsSource: 'jakarta-pollutant-names.csv: Udara Jakarta station pages (PM2.5, PM10, CO, SO2, NO2, O3, HC, NO); BMKG (TSP).',
  indexPollutants: ['PM2.5', 'PM10', 'O₃', 'NO₂', 'SO₂', 'CO', 'HC'],
  pollutants: {
    'PM2.5': {
      sources: [
        { category: 'Transport and industry (combined)', share: 'above 46%', icon: 'other' },
        { category: 'Waste burning', share: '5%', icon: 'waste-burning' },
        { category: 'Commercial', share: '5%', icon: 'other' },
        { category: 'Road dust', share: '3%', icon: 'road-dust' },
      ],
      sourcesNote: null,
      largestSource: { icon: 'other', label: 'Transport and industry' },
      sourcesSubject: null,
    },
    PM10: {
      sources: [{ category: 'Transport and industry (combined)', share: 'above 46%', icon: 'other' }],
      sourcesNote: null,
      largestSource: { icon: 'other', label: 'Transport and industry' },
      sourcesSubject: null,
    },
    'O₃': {
      sources: [],
      sourcesNote: null,
      largestSource: null,
      sourcesSubject: null,
    },
    'NO₂': {
      sources: [
        { category: 'Transport', share: '57% to 84%', icon: 'road-traffic' },
        { category: 'Power generation', share: '12% to 24%', icon: 'industry' },
        { category: 'Industry (manufacturing)', share: '2% to 26%', icon: 'industry' },
      ],
      sourcesNote: 'Shares are ranges across the emission inventories the plan reviewed.',
      largestSource: { icon: 'road-traffic', label: 'Transport' },
      sourcesSubject: 'nitrogen oxides',
    },
    'SO₂': {
      sources: [
        { category: 'Industry (manufacturing)', share: 'above 62%', icon: 'industry' },
        { category: 'Power generation', share: 'about 24%', icon: 'industry' },
        { category: 'Transport', share: '3% to 21%', icon: 'road-traffic' },
      ],
      sourcesNote: 'Shares are ranges across the emission inventories the plan reviewed.',
      largestSource: { icon: 'industry', label: 'Industry' },
      sourcesSubject: null,
    },
    CO: {
      sources: [],
      sourcesNote: null,
      largestSource: null,
      sourcesSubject: null,
    },
    TSP: {
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
    HC: {
      sources: [],
      sourcesNote: null,
      largestSource: null,
      sourcesSubject: null,
    },
  },
  sourcesCredit: GRAND_DESIGN,
  bcIntro: {
    text: 'Jakarta works with Breathe Cities on giving residents clear, real-time air quality information and on designing its next Low Emission Zone with communities.',
    linkLead: 'More on Jakarta’s programmes and policies on',
    link: { label: 'Breathe Cities', url: 'https://breathecities.org/cities/jakarta/' },
  },
  goFurther: {
    services: [{ label: 'Udara Jakarta', url: 'https://udara.jakarta.go.id/' }],
    getTheData: [{ label: 'Request air monitoring data (PPID)', url: 'https://lingkunganhidup.jakarta.go.id/layanan/ppid' }],
  },
  sensors: parseCitySensors(jakartaSensors as unknown, 'jakarta', ISPU.levels.length),
  passiveTubes: null,
  districts: parseDistricts(jakartaDistricts as unknown, ISPU.levels.length),
  surface: null,
}

checkCityPage(JAKARTA)
