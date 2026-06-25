/**
 * page.tsx — BC Global Toolkit Network concept landing page, /ux-concepts/global-toolkit-network.
 *
 * Purpose
 *   A merged concept combining the AQ Toolkit catalogue with a PROOF-DIRECTORY globe. The page shows:
 *     1. ConceptHero — framing the concept as the global network a city joins when it adopts the toolkit.
 *     2. Proof directory — the section header ("BC cities already on the path"), one aggregate
 *        city-population stat (labelled Estimate), and the ProofGlobe: city pins in three states
 *        (proven / newly-joined / member) where clicking a clickable pin opens a panel listing the
 *        real tools that city runs. This is a FRESH, fully-isolated globe + data set owned by this
 *        concept — it does NOT import aq-network-v2's NetworkGlobe, programme snapshot, or city data.
 *     3. Components catalogue — the COMPONENT_ENTRIES grid from the Toolkit concept.
 *     4. Guidance catalogue — the GUIDANCE_ENTRIES grid from the Toolkit concept.
 *     5. How to implement — placeholder section for implementation guides.
 *
 *   The toolkit catalogue is imported read-only (shared content, per the section brief). The
 *   aq-network-v2 globe + snapshot are NO LONGER imported — the membership/sensor globe section
 *   was replaced by the proof directory (the reframe: membership story → directory of proven tool
 *   deployments). Chrome is provided by layout.tsx (PrototypeHeader + BcHeader/BcFooter).
 *
 * Honesty (the project's backbone)
 *   The aggregate stat is CITY POPULATION across the plotted cities, labelled an estimate — never
 *   implied "people reached/served". See proof-cities.ts + CityPanel.tsx for the full honesty model.
 *
 * Key exports: default page component, metadata.
 * External dependencies: next (Metadata), @/components/concept (ConceptHero, ConceptSectionHeader,
 *   ConceptStat, ConceptCard), ./_components/ProofGlobe, ./_data/proof-cities,
 *   COMPONENT_ENTRIES / GUIDANCE_ENTRIES + CatalogueCard (toolkit concept, read-only).
 *
 * Route: /ux-concepts/global-toolkit-network
 */

import type { Metadata } from 'next'
import { ConceptHero, ConceptSectionHeader, ConceptStat, ConceptCard } from '@/components/concept'
import { ProofGlobe } from './_components/ProofGlobe'
import { PROOF_CITIES, getTotalCityPopulation } from './_data/proof-cities'
import { COMPONENT_ENTRIES, GUIDANCE_ENTRIES } from '../toolkit/_components/toolkit-catalogue.config'
import { CatalogueCard } from '../toolkit/_components/CatalogueCard'

export const metadata: Metadata = {
  title: 'BC Global Toolkit Network (concept)',
}

/**
 * The BC Global Toolkit Network landing page. Server component — the catalogue entries are static
 * config and the proof-directory cities are static data; the ProofGlobe is the only client island.
 * The aggregate city-population stat is computed once here on the server from PROOF_CITIES.
 */
export default function GlobalToolkitNetworkPage() {
  // Aggregate CITY POPULATION across every plotted city — the section's "why it matters" stat.
  // City population, NEVER implied reach (honesty rule 1); shown with an Estimate pill below.
  const totalCityPopulation = getTotalCityPopulation(PROOF_CITIES)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">

        {/* SECTION 0 — HERO. Frames the page as the global network story. */}
        <ConceptHero
          headline="The global network your city joins when it adopts the toolkit"
          body="A catalogue of the digital components and guidance a city needs to understand, communicate, and act on its air quality — and how cities around the world are already using them."
        />

        {/* SECTION 1 — PROOF DIRECTORY. Locked section header, one aggregate city-population stat,
            then the proof-directory globe. Every pin is a real BC member city; clicking a clickable
            pin opens a panel of the real tools that city runs. Replaces the old membership/sensor
            globe (NetworkGlobe + counters) — the reframe from membership story to proven deployments. */}
        <ConceptSectionHeader
          heading="BC cities already on the path"
          body="Breathe Cities members putting these tools to work on the way to the 2030 target. Every pin is a real city — open one to see what it deployed."
          className="mt-12"
        />
        <section className="mt-6">
          {/* Aggregate stat — combined city population across the plotted cities, labelled Estimate.
              Single stat, carded (wrap ConceptStat in ConceptCard per the concept-layer pattern). */}
          <div className="mb-6 max-w-xs">
            <ConceptCard>
              <ConceptStat
                value={`~${totalCityPopulation.toLocaleString()}`}
                label="combined city population across these cities"
                estimate
              />
            </ConceptCard>
          </div>
          {/* The proof-directory globe — fresh, fully-isolated component + data for this concept. */}
          <ProofGlobe cities={PROOF_CITIES} />
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

      </div>
    </main>
  )
}
