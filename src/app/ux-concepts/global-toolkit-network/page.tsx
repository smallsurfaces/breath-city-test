/**
 * page.tsx — BC Global Toolkit Network concept landing page, /ux-concepts/global-toolkit-network.
 *
 * Purpose
 *   A merged concept combining the AQ Toolkit catalogue with a PROOF-DIRECTORY globe. The page shows:
 *     1. ConceptHero — framing the concept as the global network a city joins when it adopts the toolkit.
 *     2. Proof directory — the section header ("BC cities already on the path"), one aggregate
 *        city-population stat (labelled Estimate), and the ProofGlobe: UNIFORM "BC member" pins
 *        (v2 — no proven/newly-joined/member tier states) where clicking ANY pin opens a panel
 *        listing the tools that city runs. Honesty rides the link state inside the panel (real
 *        links for CDMX/Paris/Accra, illustrative-and-link-off elsewhere), not a city ranking.
 *        This is a FRESH, fully-isolated globe + data set owned by this concept — it does NOT
 *        import aq-network-v2's NetworkGlobe, programme snapshot, or city data.
 *     3. Components catalogue — the COMPONENT_ENTRIES grid, rendered via the concept-local
 *        ProofCatalogueCard (threads the "Used by N BC cities" proof line).
 *     4. Guidance catalogue — the GUIDANCE_ENTRIES grid, same proof-card treatment.
 *     5. How to implement — placeholder section for implementation guides.
 *
 *   The toolkit catalogue ENTRIES + sketch preview are imported read-only (shared content, per the
 *   section brief), but the CARD is a concept-local fork (ProofCatalogueCard) so the "Used by N BC
 *   cities" proof line never mutates the locked toolkit card (isolation, spec §5). The aq-network-v2
 *   globe + snapshot are NOT imported — the membership/sensor globe section was replaced by the
 *   proof directory. Chrome is provided by layout.tsx (PrototypeHeader + BcHeader/BcFooter).
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
import { PROOF_CITIES, getTotalCityPopulation, getToolUsageCounts } from './_data/proof-cities'
import { COMPONENT_ENTRIES, GUIDANCE_ENTRIES } from '../toolkit/_components/toolkit-catalogue.config'
import { ProofCatalogueCard } from './_components/ProofCatalogueCard'
import { CATALOGUE_PROOF_KEYWORDS } from './_components/catalogue-proof.config'

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

  // "Used by N BC cities" adoption counts per catalogue capability (proof-directory §5 second pass).
  // Computed once on the server from the same PROOF_CITIES the globe uses, so the card claim and the
  // globe stay consistent. Adoption breadth only — population never goes on the cards (number-homes).
  const toolUsageCounts = getToolUsageCounts(PROOF_CITIES, CATALOGUE_PROOF_KEYWORDS)

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
          body="Breathe Cities members putting these tools to work toward the 2030 target. Every pin is a real city — open any one to see what it's running."
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
              <ProofCatalogueCard
                key={entry.id}
                entry={entry}
                cityCount={toolUsageCounts[entry.id] ?? 0}
              />
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
              <ProofCatalogueCard
                key={entry.id}
                entry={entry}
                cityCount={toolUsageCounts[entry.id] ?? 0}
              />
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
