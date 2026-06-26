/**
 * catalogue-proof.config.ts — concept-local mapping that powers the "Used by N BC cities" proof
 * line on the catalogue cards (proof-directory v2, §5 second pass).
 *
 * Purpose
 *   The catalogue entries are capability-voice ("Real-time Monitoring", id `monitoring`) while the
 *   proof-cities tool rows are city-voice ("Municipal monitoring network"). To thread an honest
 *   "Used by N BC cities" adoption count onto each card we map each catalogue capability id (the
 *   ToolId from the shared toolkit config) to the KEYWORDS that signal that capability's presence in
 *   a city's tool list, then count distinct cities via getToolUsageCounts (proof-cities.ts).
 *
 *   This is a concept-prototype approximation of "adoption breadth", NOT a production data contract
 *   (concept-prototype fidelity). It deliberately lives concept-local so the shared `toolkit`
 *   catalogue config is never mutated (isolation constraint, spec §5).
 *
 * Honesty note
 *   The count is "how many plotted BC cities run a tool of this kind" — an adoption-breadth figure
 *   (number-homes rule: cards carry breadth, never human scale / population). It draws on the same
 *   proof-cities data the globe uses, so the card claim and the globe stay consistent.
 *
 * Key exports: CATALOGUE_PROOF_KEYWORDS (Record<ToolId-string, readonly string[]>)
 * External dependencies: none (plain config consumed by getToolUsageCounts).
 */

/**
 * Keyword sets per catalogue capability id. A city "uses" the capability if any of its tool
 * name/blurb strings contains one of these keywords (case-insensitive substring). Keywords are
 * chosen to match the city-voice tool names in proof-cities.ts without over-matching.
 */
export const CATALOGUE_PROOF_KEYWORDS: Record<string, readonly string[]> = {
  // Components
  monitoring: ['monitoring', 'sensor', 'airparif', 'airqo', 'simat', 'monitor', 'air-quality map', 'air-quality network'],
  benchmarking: ['benchmark', 'standards', 'peer comparison', 'who guideline'],
  forecasting: ['forecast', 'outlook'],
  health: ['health', 'alert', 'guidance tied', 'mask', 'sensitive groups', 'most at risk'],
  openData: ['open data', 'open-data', 'downloadable', 'api', 'machine-readable'],
  // Guidance
  sourceId: ['source apportionment', 'source identification', 'source-apportionment', 'attributing pollution'],
  advocacy: ['advocacy', 'storytelling', 'case for'],
  action: ['action & behaviour', 'behaviour change', 'interventions', 'nudges'],
}
