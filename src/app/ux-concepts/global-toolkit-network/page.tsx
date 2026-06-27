/**
 * page.tsx — BC Global Toolkit Network concept landing page, /ux-concepts/global-toolkit-network.
 *
 * Purpose
 *   A merged concept combining the AQ Toolkit catalogue with a PROOF-DIRECTORY globe. The page shows:
 *     1. ConceptHero — framing the concept as ENABLEMENT: "everything your city needs to act on its
 *        air quality", shown through the cities already running the toolkit ("this could be your city
 *        too"). The network-JOIN invitation deliberately lives in the closing section (6), not here.
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
 *     5. How to implement — a 4-step adoption path (Assess → Choose → Deploy → Communicate),
 *        each step a ConceptCard, plus one muted reference line pointing at the Guidance catalogue
 *        and the two confirmed-live BC partner links (OpenAQ, Clean Air Fund).
 *     6. Bring the toolkit to your city — the closing onramp: completes the "you could have this
 *        too" arc and carries the network-join invitation moved out of the hero. ConceptSectionHeader
 *        + ConceptCard + one INERT soft CTA (href="#", shown-not-dead per the no-dead-ends rule).
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

/** One step in the "How to implement" adoption path. */
type ImplementationStep = {
  /** The step's short imperative title (rendered as an h3). */
  title: string
  /** The one-line description of what the city does in this step. */
  body: string
}

/**
 * The 4-step adoption path shown under "How to implement". Static content — order IS the sequence
 * (Assess → Choose → Deploy → Communicate); the step number is derived from the array index at
 * render time, so the numbering can never drift from the order.
 */
const IMPLEMENTATION_STEPS: ImplementationStep[] = [
  {
    title: 'Assess',
    body: 'Map what your city already monitors, and where the gaps are.',
  },
  {
    title: 'Choose your components',
    body: 'Pick the monitoring, forecasting, and communication pieces that fit your context, from the catalogue above.',
  },
  {
    title: 'Deploy & integrate',
    body: 'Stand up sensors and data pipelines, and connect them to public-facing surfaces.',
  },
  {
    title: 'Communicate & act',
    body: 'Turn readings into guidance residents act on, and into the case for policy.',
  },
]

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

        {/* SECTION 0 — HERO. Reframed from membership (a network you JOIN) to ENABLEMENT
            (what your city could be running too). The join invitation now lives in the closing
            onramp section, not here. */}
        <ConceptHero
          headline="Everything your city needs to act on its air quality"
          body="A toolkit of the digital components and guidance a city adopts to understand, communicate, and act on air quality — shown through the cities already putting them to work. This is what your city could be running, too."
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

        {/* SECTION 4 — HOW TO IMPLEMENT. The "coming soon" placeholder is replaced with the real
            4-step adoption path: each step is a numbered ConceptCard, followed by one muted
            reference line pointing at the Guidance catalogue and the two confirmed-live BC partner
            links. These two URLs (OpenAQ, Clean Air Fund) are the ONLY real external links on the
            page — every other onward action is inert per the concept honesty rule. */}
        <ConceptSectionHeader
          heading="How to implement"
          body="Adopting the toolkit is a path, not a switch. Here is how a city moves from first reading to public action — and where the guides for each step live."
          className="mt-16"
        />
        <section className="mt-6">
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {IMPLEMENTATION_STEPS.map((step, index) => (
              <li key={step.title}>
                <ConceptCard className="h-full">
                  {/* Step number — brand-blue marker; encodes sequence (functional colour). */}
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--bc-color-blue)' }}
                  >
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.body}
                  </p>
                </ConceptCard>
              </li>
            ))}
          </ol>
          {/* Reference line — the ONLY two real external links on the page (both confirmed live).
              New tab + rel="noopener noreferrer" per the external-link safety convention. */}
          <p className="mt-4 text-sm text-muted-foreground">
            Step-by-step guides come from the Guidance catalogue above and Breathe Cities partners
            —{' '}
            <a
              href="https://openaq.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              OpenAQ
            </a>{' '}
            and the{' '}
            <a
              href="https://cleanairfund.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Clean Air Fund
            </a>
            .
          </p>
        </section>

        {/* SECTION 5 — BRING THE TOOLKIT TO YOUR CITY. The closing onramp — completes the
            "you could have this too" arc and carries the network-join invitation deliberately
            moved out of the hero. The CTA is INERT (href="#"): shown as a real styled button per
            the no-dead-ends rule, but it goes nowhere in this concept. Brand-blue fill, white
            label, 56px minimum touch target. */}
        <ConceptSectionHeader
          heading="Bring the toolkit to your city"
          body="Every city here started where yours is now. Breathe Cities works with you to assess, choose, and deploy the tools that fit your context — and to join the network of cities already on the path to 2030."
          className="mt-16"
        />
        <section className="mt-6">
          <ConceptCard>
            <a
              href="#"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl px-6 text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--bc-color-blue)' }}
            >
              Start the conversation
            </a>
          </ConceptCard>
        </section>

      </div>
    </main>
  )
}
