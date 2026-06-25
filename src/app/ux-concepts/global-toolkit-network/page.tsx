/**
 * page.tsx — Global Network concept landing page, /ux-concepts/global-toolkit-network.
 *
 * Purpose
 *   A merged concept combining the existing AQ Toolkit catalogue with network membership
 *   elements (globe, stats, city stories, "how to implement"). The page shows:
 *     1. ConceptHero — framing the concept as the global network a city joins when it
 *        adopts the toolkit.
 *     2. Network stats + globe — the NetworkGlobe and city/sensor ConceptStat counters
 *        reused directly from the AQ Network v2 concept's snapshot data.
 *     3. Components catalogue — the COMPONENT_ENTRIES grid from the Toolkit concept.
 *     4. Guidance catalogue — the GUIDANCE_ENTRIES grid from the Toolkit concept.
 *     5. How to implement — placeholder section for implementation guides.
 *     6. City stories — three placeholder story cards showing cities using the tools.
 *
 *   All existing toolkit and aq-network-v2 source files are UNTOUCHED — this page imports
 *   from them read-only. Chrome is provided by layout.tsx (PrototypeHeader + BcHeader/BcFooter).
 *
 * Key exports: default page component, metadata.
 * External dependencies: next (Metadata), @/components/concept (ConceptHero, ConceptSectionHeader,
 *   ConceptStat, ConceptCard), NetworkGlobe, getProgrammeSnapshot,
 *   COMPONENT_ENTRIES / GUIDANCE_ENTRIES, CatalogueCard.
 *
 * Route: /ux-concepts/global-toolkit-network
 */

import type { Metadata } from 'next'
import { ConceptHero, ConceptSectionHeader, ConceptStat, ConceptCard } from '@/components/concept'
import { NetworkGlobe } from '../aq-network-v2/_components/NetworkGlobe'
import { getProgrammeSnapshot } from '../aq-network-v2/_data/sensor-snapshots/programme'
import { COMPONENT_ENTRIES, GUIDANCE_ENTRIES } from '../toolkit/_components/toolkit-catalogue.config'
import { CatalogueCard } from '../toolkit/_components/CatalogueCard'

export const metadata: Metadata = {
  title: 'Global Network (concept)',
}

/**
 * Placeholder city story data for the City Stories section.
 * These are illustrative examples — content to be replaced with real city contributions.
 */
const CITY_STORIES = [
  {
    city: 'Accra, Ghana',
    tool: 'Real-time monitoring',
    excerpt: 'First city-wide AQ sensor network in West Africa.',
  },
  {
    city: 'London, UK',
    tool: 'AQI dashboard',
    excerpt: 'Integrated BC data tools into open data portal.',
  },
  {
    city: 'Bogotá, Colombia',
    tool: 'Health alerts',
    excerpt: 'Threshold alerts reaching 1.2M residents.',
  },
] as const

/**
 * The Global Network landing page. Server component — all data is bundled JSON (programme
 * snapshot) or static config (catalogue entries). No client-side fetching.
 */
export default function GlobalNetworkPage() {
  // Programme snapshot is bundled JSON — read synchronously on the server.
  const programme = getProgrammeSnapshot()

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">

        {/* SECTION 0 — HERO. Frames the page as the global network story. */}
        <ConceptHero
          headline="The global network your city joins when it adopts the toolkit"
          body="A catalogue of the digital components and guidance a city needs to understand, communicate, and act on its air quality — and how cities around the world are already using them."
        />

        {/* SECTION 1 — NETWORK STATS + GLOBE. City and sensor counters above the interactive
            globe, reusing the programme snapshot and NetworkGlobe from AQ Network v2.
            ConceptStat blocks are wrapped in ConceptCard to match the counter card pattern
            used elsewhere in the AQ Network concept. */}
        <section className="mt-10">
          {/* Counter row — cities and sensors side by side, each in a card. */}
          <div className="mb-6 flex gap-4">
            <ConceptCard className="flex-1">
              <ConceptStat
                value={String(programme.counts.cities)}
                label="member cities"
              />
            </ConceptCard>
            <ConceptCard className="flex-1">
              <ConceptStat
                value={programme.counts.sensors.toLocaleString()}
                label="sensors in the network"
              />
            </ConceptCard>
          </div>
          {/* Interactive 3D globe — sourced from the programme snapshot. */}
          <NetworkGlobe snapshot={programme} />
        </section>

        {/* SECTION 2 — COMPONENTS CATALOGUE. Live digital surfaces a city embeds — imported
            directly from the Toolkit concept's catalogue config. Source files are untouched. */}
        <ConceptSectionHeader
          heading="Components"
          body="Live digital surfaces a city embeds — interactive pieces residents and city teams use directly."
          className="mt-16"
        />
        <section className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPONENT_ENTRIES.map((entry) => (
              <CatalogueCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>

        {/* SECTION 3 — GUIDANCE CATALOGUE. Studies, methodologies, and programmes — imported
            directly from the Toolkit concept's catalogue config. Source files are untouched. */}
        <ConceptSectionHeader
          heading="Guidance"
          body="Studies, methodologies, and programmes — the expertise that turns data into action."
          className="mt-16"
        />
        <section className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDANCE_ENTRIES.map((entry) => (
              <CatalogueCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>

        {/* SECTION 4 — HOW TO IMPLEMENT. Placeholder for implementation guides — content
            coming in a future pass. */}
        <ConceptSectionHeader
          heading="How to implement"
          body="Step-by-step guides for every tool — from sensor procurement to public-facing deployment."
          className="mt-16"
        />
        <section className="mt-6">
          {/* Placeholder card — implementation guides to be added in a future pass. */}
          <div className="rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground">
              Implementation guides — coming soon
            </p>
          </div>
        </section>

        {/* SECTION 5 — CITY STORIES. Three placeholder story cards showing cities using
            the toolkit tools. Layout: 3-column grid on large screens, stacked on mobile.
            Each card uses ConceptCard for visual consistency with the rest of the concept layer. */}
        <ConceptSectionHeader
          heading="City stories"
          body="How cities around the world are using these tools."
          className="mt-16"
        />
        <section className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CITY_STORIES.map((story) => (
              <ConceptCard key={story.city} className="flex flex-col gap-1.5">
                {/* City name — prominent */}
                <p className="text-sm font-semibold text-foreground">{story.city}</p>
                {/* Tool name — muted, small */}
                <p className="text-xs text-muted-foreground">{story.tool}</p>
                {/* One-line excerpt */}
                <p className="mt-1 text-sm text-foreground">{story.excerpt}</p>
              </ConceptCard>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
