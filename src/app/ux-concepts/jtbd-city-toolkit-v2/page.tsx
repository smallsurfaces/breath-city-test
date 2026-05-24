/**
 * page.tsx — JTBD City Toolkit v2 dashboard page.
 *
 * Purpose
 *   Synchronised v2 copy of the JTBD City Toolkit. SAME structure, data, and city-switch
 *   interaction as v1 — the only differences are skin-level:
 *     - The page canvas is white (`bg-background`) instead of the v1 `--bc-color-light-grey`.
 *     - The hero uses `<ConceptHeroPlain>` (left-aligned eyebrow-less hero) instead of inline
 *       centred markup. (The eyebrow was dropped in the concept-housekeeping pass.)
 *     - The sensor density strip uses `<ConceptCard>` surface (border-border, rounded-2xl,
 *       shadow-sm) instead of the v1 steel border / white fill.
 *     - The city selector label and select styling use shadcn bridged semantics where possible.
 *   All functional elements — the 8 ToolCards, the city-switch mechanic, the dim/partial states,
 *   the AQI traffic-light colours — are fully intact.
 *
 * Route: /ux-concepts/jtbd-city-toolkit-v2
 *
 * Key exports: ToolkitV2Page (default)
 * External dependencies: toolkit-data, ToolPanels, ToolCard, ConceptCard,
 *   ../../_components/ConceptHeroPlain (eyebrow-less hero)
 */

'use client'

import { useState } from 'react'
import { CITIES, TOOL_LABELS } from '@/data/toolkit-data'
import type { CityData, ToolId } from '@/data/toolkit-data'
import { ConceptCard } from '@/components/concept'
import { ConceptHeroPlain } from '../../_components/ConceptHeroPlain'
import { ToolCard } from './_components/ToolCard'
import {
  MonitoringPanel,
  BenchmarkingPanel,
  SourceIdPanel,
  ForecastingPanel,
  HealthPanel,
  AdvocacyPanel,
  ActionPanel,
  OpenDataPanel,
} from './_components/ToolPanels'

/** Returns a count of active panels for the summary strip. */
function countActiveTools(city: CityData): number {
  return Object.values(city.toolStatus).filter((s) => s === 'active').length
}

/** Returns a count of partially-active panels. */
function countPartialTools(city: CityData): number {
  return Object.values(city.toolStatus).filter((s) => s === 'partial').length
}

/** Tool panel order for the grid. */
const TOOL_ORDER: ToolId[] = [
  'monitoring',
  'benchmarking',
  'sourceId',
  'forecasting',
  'health',
  'advocacy',
  'action',
  'openData',
]

export default function ToolkitV2Page() {
  const [selectedSlug, setSelectedSlug] = useState('london')

  const city = CITIES.find((c) => c.slug === selectedSlug)
  if (!city) return null

  const activeCount = countActiveTools(city)
  const partialCount = countPartialTools(city)

  return (
    // V2 skin change: white canvas (bg-background) instead of v1's var(--bc-color-light-grey).
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* ---- Page hero — eyebrow-less ConceptHeroPlain (eyebrow dropped this pass). Same
                left-aligned type scale as ConceptHero; city selector lives in the children slot. ---- */}
        <ConceptHeroPlain
          headline="City Air Quality Toolkit"
          body="8 digital tools that together form the complete air quality infrastructure a city needs. Select a city to see which tools are available today — and where the gaps are."
        >
          {/* City selector lives in the hero's children slot — structure unchanged. */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="city-select"
              className="text-sm font-medium text-foreground"
            >
              Select a city:
            </label>
            <select
              id="city-select"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground"
              style={{ minWidth: '220px' }}
            >
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
        </ConceptHeroPlain>

        {/* ---- Sensor density strip — V2 skin: ConceptCard surface. ---- */}
        <ConceptCard className="mb-8 mt-6 text-center">
          <p className="text-sm font-medium text-foreground">
            {city.name} &mdash; {city.stationCount} monitoring stations (
            {city.stationTypes})
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {city.densityMessage} &middot; {activeCount} of 8 tools active
            {partialCount > 0 && `, ${partialCount} partial`}
          </p>
        </ConceptCard>

        {/* ---- Tools grid — unchanged from v1. ---- */}
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOL_ORDER.map((toolId) => (
            <ToolCard
              key={toolId}
              title={TOOL_LABELS[toolId]}
              status={city.toolStatus[toolId]}
              dimReason={city.dimReasons[toolId]}
            >
              {toolId === 'monitoring' && (
                <MonitoringPanel
                  sensors={city.sensors}
                  stationCount={city.stationCount}
                />
              )}
              {toolId === 'benchmarking' && (
                <BenchmarkingPanel
                  currentAqi={city.currentAqi}
                  whoGuideline={city.whoGuideline}
                  nationalStandard={city.nationalStandard}
                  nationalStandardLabel={city.nationalStandardLabel}
                />
              )}
              {toolId === 'sourceId' && (
                <SourceIdPanel sources={city.sources} />
              )}
              {toolId === 'forecasting' && (
                <ForecastingPanel forecast={city.forecast} />
              )}
              {toolId === 'health' && <HealthPanel alerts={city.alerts} />}
              {toolId === 'advocacy' && (
                <AdvocacyPanel
                  trendLine={city.trendLine}
                  trendStat={city.trendStat}
                  trendDirection={city.trendDirection}
                />
              )}
              {toolId === 'action' && <ActionPanel actions={city.actions} />}
              {toolId === 'openData' && (
                <OpenDataPanel
                  dataRows={city.dataRows}
                  apiEndpoint={city.apiEndpoint}
                />
              )}
            </ToolCard>
          ))}
        </div>
      </div>
    </main>
  )
}
