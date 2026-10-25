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
  },
  PM10: {
    name: 'Coarse particulate matter',
    whatItIs:
      'Particles in the air, larger than PM2.5 and including it. Made of the same kinds of things: sulfates, nitrates, black carbon, mineral dust and water.',
    shortTerm: null,
    longTerm: 'Strong evidence links long-term exposure to more deaths overall.',
  },
  'O₃': {
    name: 'Ground-level ozone',
    whatItIs:
      'Ozone near the ground, not the ozone layer, and a major part of smog. It is not released directly: it forms when other gases, mainly nitrogen dioxide and volatile organic compounds, react in sunlight.',
    shortTerm: null,
    longTerm:
      'Moderate evidence links long-term exposure in the peak season to more deaths overall, with limited evidence for deaths from respiratory disease.',
  },
  'NO₂': {
    name: 'Nitrogen dioxide',
    whatItIs:
      'A reddish-brown gas with a sharp smell, commonly released when fuel burns in transport and industry. It also helps form other pollutants, including some particles.',
    shortTerm: null,
    longTerm:
      'Strong evidence links long-term exposure to deaths from COPD, and moderate evidence to deaths from respiratory disease and lung infections.',
  },
  'SO₂': {
    name: 'Sulfur dioxide',
    whatItIs:
      'A colourless gas with a sharp smell, produced by burning fossil fuels such as coal and oil, and by smelting ores that contain sulfur.',
    shortTerm:
      'Over a day, exposure is linked to more deaths overall (strong evidence) and from respiratory causes (moderate evidence), and to more asthma hospital visits (limited evidence).',
    longTerm: null,
  },
  CO: {
    name: 'Carbon monoxide',
    whatItIs:
      'A colourless, odourless, tasteless toxic gas that forms when fuels such as wood, petrol, charcoal, natural gas or kerosene burn incompletely.',
    shortTerm:
      'Over a day, exposure is linked to more hospital admissions and deaths from heart attack (moderate evidence), mainly in studies with higher levels.',
    longTerm: null,
  },
}
