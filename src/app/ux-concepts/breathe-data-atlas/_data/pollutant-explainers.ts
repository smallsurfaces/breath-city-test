/**
 * pollutant-explainers.ts — the global part of each pollutant explainer: what it is and what it does
 * to the body (spec section 8, steps 1 and 3). DRAFT CONTENT.
 *
 * Purpose
 *   One explainer per pollutant, the same for every city. The city-specific steps (where it comes
 *   from in the city, why the city measures it, what the city advises) live in the city's data file.
 *
 * Source and status (READ BEFORE EDITING)
 *   Wording kept close to the source notes:
 *     research/landscape/analysis/_data-catalogue/CONTENT — Learn about each pollutant (7-alt-iii) —
 *     WHO source notes — 2026-10-24.md
 *   which read the WHO fact sheet "Ambient (outdoor) air quality and health" (24 October 2024) and
 *   the WHO global air quality guidelines (2021). The body lines are plain-English paraphrases of the
 *   outcomes WHO's guidelines rest on, not WHO wording. CAF has not confirmed WHO as the source, so
 *   the explainer is marked "Draft content" wherever it shows.
 *
 *   WHO explains; only the city advises (spec rule 5). No numbers here: no guideline values, no risk
 *   percentages, no thresholds (rules 1, 3, 5). Short-term and long-term lines appear only where the
 *   notes state one; an absent line is left out, never filled in (rule 6).
 *
 * Key exports: PollutantExplainer, POLLUTANT_EXPLAINERS, WHO_GROUPS_LINE, WHO_SOURCE_LINKS
 * External dependencies: ./city-sensors (PollutantId type).
 */

import type { PollutantId } from './city-sensors'

/** The global steps of one pollutant explainer. */
export type PollutantExplainer = {
  /** The pollutant's full name. */
  name: string
  /** What it is, in plain words (WHO). */
  whatItIs: string
  /** Short-term effects (WHO), or null where the notes state none. */
  shortTerm: string | null
  /** Long-term effects (WHO), or null where the notes state none. */
  longTerm: string | null
  /**
   * Round 3 decision Y (the additional pollutants): one "What it does to the body" paragraph, only
   * where the content file gives WHO body text; null otherwise. The original six use shortTerm and
   * longTerm instead and leave this null.
   */
  body: string | null
  /** The sources behind both sections' "i": WHO_SOURCE_LINKS for the original six, the file's own for the rest. */
  sources: Array<{ label: string; url: string }>
}

/** Who is more affected, which WHO states for air pollution as a whole, not per pollutant. */
export const WHO_GROUPS_LINE =
  'For air pollution as a whole, WHO notes that people with chronic conditions such as asthma, COPD or heart disease, children and pregnant women are often affected most.'

/** WHO pages the explainer draws on. */
export const WHO_SOURCE_LINKS: Array<{ label: string; url: string }> = [
  {
    label: 'WHO fact sheet: ambient air quality and health',
    url: 'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health',
  },
  { label: 'WHO global air quality guidelines (2021)', url: 'https://www.who.int/publications/i/item/9789240034433' },
]

/** The global explainer steps for each pollutant. */
/**
 * WHO's wording for the six pollutants the WHO source notes cover. Round 3 decision X: a pollutant a
 * city publishes without a sourced description gets NO explainer sections (Partial on purpose).
 */
export const POLLUTANT_EXPLAINERS: Partial<Record<PollutantId, PollutantExplainer>> = {
  'PM2.5': {
    name: 'Fine particulate matter',
    whatItIs:
      'Very small particles in the air. WHO describes particulate matter as a common indicator of air pollution, made of things like sulfates, nitrates, ammonia, sodium chloride, black carbon, mineral dust and water.',
    shortTerm: null,
    longTerm:
      'Strong evidence links long-term exposure to more deaths from heart and circulatory disease and from lung cancer, and moderate evidence to more deaths from respiratory disease.',
    body: null,
    sources: WHO_SOURCE_LINKS,
  },
  PM10: {
    name: 'Coarse particulate matter',
    whatItIs:
      'Particles in the air, larger than PM2.5 and including it. Made of the same kinds of things: sulfates, nitrates, black carbon, mineral dust and water.',
    shortTerm: null,
    longTerm: 'Strong evidence links long-term exposure to more deaths overall.',
    body: null,
    sources: WHO_SOURCE_LINKS,
  },
  'O₃': {
    name: 'Ground-level ozone',
    whatItIs:
      'Ozone near the ground, not the ozone layer, and a major part of smog. It is not released directly: it forms when other gases, mainly nitrogen dioxide and volatile organic compounds, react in sunlight.',
    shortTerm: null,
    longTerm:
      'Moderate evidence links long-term exposure in the peak season to more deaths overall, with limited evidence for deaths from respiratory disease.',
    body: null,
    sources: WHO_SOURCE_LINKS,
  },
  'NO₂': {
    name: 'Nitrogen dioxide',
    whatItIs:
      'A reddish-brown gas with a sharp smell, commonly released when fuel burns in transport and industry. It also helps form other pollutants, including some particles.',
    shortTerm: null,
    longTerm:
      'Strong evidence links long-term exposure to deaths from COPD, and moderate evidence to deaths from respiratory disease and lung infections.',
    body: null,
    sources: WHO_SOURCE_LINKS,
  },
  'SO₂': {
    name: 'Sulfur dioxide',
    whatItIs:
      'A colourless gas with a sharp smell, produced by burning fossil fuels such as coal and oil, and by smelting ores that contain sulfur.',
    shortTerm:
      'Over a day, exposure is linked to more deaths overall (strong evidence) and from respiratory causes (moderate evidence), and to more asthma hospital visits (limited evidence).',
    longTerm: null,
    body: null,
    sources: WHO_SOURCE_LINKS,
  },
  CO: {
    name: 'Carbon monoxide',
    whatItIs:
      'A colourless, odourless, tasteless toxic gas that forms when fuels such as wood, petrol, charcoal, natural gas or kerosene burn incompletely.',
    shortTerm:
      'Over a day, exposure is linked to more hospital admissions and deaths from heart attack (moderate evidence), mainly in studies with higher levels.',
    longTerm: null,
    body: null,
    sources: WHO_SOURCE_LINKS,
  },
  // Round 3 decision Y: the additional pollutants, verbatim from research/landscape/analysis/
  // _data-catalogue/CONTENT — What it is — additional pollutants — 2026-10-25.md (design-director
  // reviewed). The name is the leading sentence the file gives ("Benzene."). Jakarta's HC is blank in
  // the file, so HC has no entry and no explainer sections.
  PM1: {
    name: 'Particulate matter PM1',
    whatItIs: 'Particles in the air with a diameter of less than 1 micrometre.',
    shortTerm: null,
    longTerm: null,
    body: null,
    sources: [{ label: 'Secretaría Distrital de Ambiente, Bogotá microsensor network FAQ', url: 'https://microsensores.ambientebogota.gov.co/rcmca/preguntas-frecuentes' }],
  },
  NO: {
    name: 'Nitrogen monoxide',
    whatItIs: 'Also called nitric oxide. A gas in the nitrogen oxides family that turns into nitrogen dioxide when exposed to air.',
    shortTerm: null,
    longTerm: null,
    body: null,
    sources: [{ label: 'WHO global air quality guidelines (2021)', url: 'https://iris.who.int/handle/10665/345329' }, { label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }],
  },
  'NOₓ': {
    name: 'Nitrogen oxides',
    whatItIs: 'The combined name for nitrogen monoxide and nitrogen dioxide, two gases from the same family.',
    shortTerm: null,
    longTerm: null,
    body: null,
    sources: [{ label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }, { label: 'EEA, Air quality in Europe 2022: sources and emissions of air pollutants', url: 'https://www.eea.europa.eu/en/analysis/publications/air-quality-in-europe-2022/sources-and-emissions-of-air-pollutants-in-europe' }],
  },
  'Black carbon': {
    name: 'Black carbon',
    whatItIs: 'Soot-like carbon in the air, measured by how much light it absorbs. It is formed when fossil fuels, biofuels and biomass burn incompletely.',
    shortTerm: null,
    longTerm: null,
    body: 'Studies link black carbon particles with heart and circulatory health problems and with earlier death, for both short-term and long-term exposure.',
    sources: [{ label: 'WHO global air quality guidelines (2021)', url: 'https://iris.who.int/handle/10665/345329' }],
  },
  Benzene: {
    name: 'Benzene',
    whatItIs: 'A chemical found in petrol. It enters the air when petrol evaporates or burns, from petrochemical industries and from tobacco smoke.',
    shortTerm: null,
    longTerm: null,
    body: 'Prolonged exposure can damage the blood and bone marrow and genetic material, and benzene causes cancer, including leukaemia in people exposed at work.',
    sources: [{ label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }],
  },
  BaP: {
    name: 'Benzo(a)pyrene',
    whatItIs: 'One of a family of chemicals called polycyclic aromatic hydrocarbons, formed when oil, gas, coal, wood and other organic material burn incompletely. It is the best studied of the family.',
    shortTerm: null,
    longTerm: null,
    body: 'Several polycyclic aromatic hydrocarbons, of which benzo(a)pyrene is the most widely used indicator, are carcinogenic.',
    sources: [{ label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }],
  },
  As: {
    name: 'Arsenic',
    whatItIs: 'Occurs in many compounds in the environment. In the air it comes from sources such as metal smelters and power plants burning arsenic-rich coal.',
    shortTerm: null,
    longTerm: null,
    body: 'Inhaled inorganic arsenic can have short-term and long-term effects on the body. Lung cancer is the main concern.',
    sources: [{ label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }],
  },
  Cd: {
    name: 'Cadmium',
    whatItIs: 'Released into the air by industry.',
    shortTerm: null,
    longTerm: null,
    body: 'Inhaled cadmium can cause lung cancer, and cadmium, whether breathed in or eaten in contaminated food, can damage the kidneys.',
    sources: [{ label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }, { label: 'EEA, Air quality in Europe 2022: sources and emissions of air pollutants', url: 'https://www.eea.europa.eu/en/analysis/publications/air-quality-in-europe-2022/sources-and-emissions-of-air-pollutants-in-europe' }],
  },
  Ni: {
    name: 'Nickel',
    whatItIs: 'Found throughout nature; it reaches the air from both natural sources and human activity.',
    shortTerm: null,
    longTerm: null,
    body: 'Nickel\'s most common health effect is allergic skin reactions, mostly from contact with products. Breathing in nickel compounds at work has been linked to lung and nasal cancers.',
    sources: [{ label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }],
  },
  Pb: {
    name: 'Lead',
    whatItIs: 'Reaches the air mainly from ore and metal processing and from piston-engine aircraft using leaded fuel.',
    shortTerm: null,
    longTerm: null,
    body: 'Lead affects the blood and the nervous system. In children it is linked to impaired thinking and learning and to hearing problems.',
    sources: [{ label: 'US EPA, Basic information about lead air pollution', url: 'https://www.epa.gov/lead-air-pollution/basic-information-about-lead-air-pollution' }, { label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }],
  },
  'NH₃': {
    name: 'Ammonia',
    whatItIs: 'A gas released mainly by agriculture. In the air it helps form fine particles.',
    shortTerm: null,
    longTerm: null,
    body: null,
    sources: [{ label: 'EEA, Air quality in Europe 2022: sources and emissions of air pollutants', url: 'https://www.eea.europa.eu/en/analysis/publications/air-quality-in-europe-2022/sources-and-emissions-of-air-pollutants-in-europe' }],
  },
  'H₂S': {
    name: 'Hydrogen sulphide',
    whatItIs: 'A gas with an unpleasant smell, released from natural sources and from industries such as pulp production and oil refineries.',
    shortTerm: null,
    longTerm: null,
    body: 'At low levels the first thing people notice is its smell. It can then irritate the eyes. Very high levels, as in industrial accidents, can be fatal.',
    sources: [{ label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }],
  },
  'CH₄': {
    name: 'Methane',
    whatItIs: 'A gas released by farming, mainly from livestock, and by the use of fuels. It is a greenhouse gas and contributes to the formation of ozone.',
    shortTerm: null,
    longTerm: null,
    body: null,
    sources: [{ label: 'EEA, Air quality in Europe 2022: sources and emissions of air pollutants', url: 'https://www.eea.europa.eu/en/analysis/publications/air-quality-in-europe-2022/sources-and-emissions-of-air-pollutants-in-europe' }, { label: 'WHO global air quality guidelines (2021)', url: 'https://iris.who.int/handle/10665/345329' }],
  },
  NMHC: {
    name: 'Non-methane hydrocarbons',
    whatItIs: 'All the hydrocarbon gases in the air except methane.',
    shortTerm: null,
    longTerm: null,
    body: null,
    sources: [{ label: 'US EPA, Ambient Air Non-Methane Hydrocarbon Monitor (EPA/600/2-80/201)', url: 'https://cfpub.epa.gov/si/si_public_record_Report.cfm?Lab=ORD&dirEntryId=33789' }],
  },
  THC: {
    name: 'Total hydrocarbons',
    whatItIs: 'All the hydrocarbon gases in the air taken together, including methane.',
    shortTerm: null,
    longTerm: null,
    body: null,
    sources: [{ label: 'US EPA, Ambient Air Non-Methane Hydrocarbon Monitor (EPA/600/2-80/201)', url: 'https://cfpub.epa.gov/si/si_public_record_Report.cfm?Lab=ORD&dirEntryId=33789' }],
  },
  TSP: {
    name: 'Total suspended particulates',
    whatItIs: 'All the solid and liquid particles floating in the air, measured without selecting by size, so large particles are included as well as small ones.',
    shortTerm: null,
    longTerm: null,
    body: null,
    sources: [{ label: 'US EPA, Compendium Method IO-2.1 (1999)', url: 'https://www.epa.gov/sites/default/files/2015-07/documents/epa-io-2.1.pdf' }, { label: 'WHO, Air Quality Guidelines for Europe, 2nd ed. (2000)', url: 'https://iris.who.int/handle/10665/107335' }],
  },
}
