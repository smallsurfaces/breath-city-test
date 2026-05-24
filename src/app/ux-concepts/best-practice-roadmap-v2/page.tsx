/**
 * page.tsx — Best Practice Roadmap v2 overview, /ux-concepts/best-practice-roadmap-v2.
 *
 * Purpose
 *   Synchronised v2 copy of the Best Practice Roadmap overview page. SAME structure, content,
 *   data, and interactions as v1 — four pillar sections, featured PracticeCardTile per domain,
 *   domain explore links. The ONLY differences from v1 are skin-level:
 *     - The hero uses ConceptHero (shared primitive) instead of inline h1/p markup.
 *     - The four stat figures use ConceptStat (shared primitive) instead of inline div markup.
 *     - Pillar section headers use ConceptSectionHeader (shared primitive) instead of inline h2/p.
 *     - The stage indicator dot overrides STAGE_COLORS at the PRESENTATION LAYER using inline
 *       style with distinct --bc-* token tints (see STAGE_DOT_STYLE below) — the shared data
 *       file (roadmap-data.ts) is NOT edited.
 *     - All internal links point at the -v2 routes so the concept is self-contained.
 *
 * Chrome: provided by best-practice-roadmap-v2/layout.tsx (PrototypeHeader + shared BcHeader/
 *   BcFooter). This page renders no chrome of its own. Light mode only. No emoji.
 *
 * Stage hue → tint mapping (flagged for design-qa/Jack review):
 *   Seeing     → var(--bc-color-blue)       cool blue  — data/sensing = blue
 *   Understanding → var(--bc-color-teal)    teal       — analysis/insight = teal
 *   Acting     → var(--bc-color-dark-blue)  deep navy  — action/impact = weight
 *   Enabling   → var(--bc-color-steel)      steel grey — support/infrastructure = neutral
 *
 * Key exports: default page component
 * External dependencies: next/link, shadcn Separator, @/components/concept (ConceptHero,
 *   ConceptStat, ConceptSectionHeader), @/data/roadmap-data (DOMAINS, PRACTICE_CARDS, Stage),
 *   ./_components/PracticeCardView (PracticeCardTile)
 */

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { ConceptHero, ConceptStat, ConceptSectionHeader } from '@/components/concept'
import {
  DOMAINS,
  PRACTICE_CARDS,
  type Stage,
} from '@/data/roadmap-data'
import { PracticeCardTile } from './_components/PracticeCardView'

/**
 * Stage dot style override — 4 DISTINCT --bc-* token tints applied at the presentation
 * layer so v2 uses BC brand colours instead of the tailwind blue/amber/green/gray from
 * STAGE_COLORS in roadmap-data.ts. The shared data file is NOT edited.
 *
 * Hue → stage rationale (flagged for design-qa/Jack):
 *   Seeing        → --bc-color-blue       (cool blue — data collection, sensing)
 *   Understanding → --bc-color-teal       (teal — analysis, insight)
 *   Acting        → --bc-color-dark-blue  (deep navy — intervention, weight)
 *   Enabling      → --bc-color-steel      (steel grey — infrastructure, support)
 */
const STAGE_DOT_STYLE: Record<Stage, { dotColor: string; badgeBg: string; badgeText: string }> = {
  Seeing: {
    dotColor: 'var(--bc-color-blue)',
    badgeBg: 'color-mix(in srgb, var(--bc-color-blue) 18%, var(--bc-color-white))',
    badgeText: 'color-mix(in srgb, var(--bc-color-blue) 90%, var(--bc-color-dark-blue))',
  },
  Understanding: {
    dotColor: 'var(--bc-color-teal)',
    badgeBg: 'color-mix(in srgb, var(--bc-color-teal) 18%, var(--bc-color-white))',
    badgeText: 'color-mix(in srgb, var(--bc-color-teal) 90%, var(--bc-color-dark-blue))',
  },
  Acting: {
    dotColor: 'var(--bc-color-dark-blue)',
    badgeBg: 'color-mix(in srgb, var(--bc-color-dark-blue) 14%, var(--bc-color-white))',
    badgeText: 'var(--bc-color-dark-blue)',
  },
  Enabling: {
    dotColor: 'var(--bc-color-steel)',
    badgeBg: 'color-mix(in srgb, var(--bc-color-steel) 18%, var(--bc-color-white))',
    badgeText: 'color-mix(in srgb, var(--bc-color-steel) 90%, var(--bc-color-dark-blue))',
  },
}

/**
 * Featured card per domain — picks the most visually compelling example.
 * Identical to v1: keyed by domainId; cardIndex/exampleIndex select within the practice data.
 */
const FEATURED: Record<number, { cardIndex: number; exampleIndex: number }> = {
  1: { cardIndex: 0, exampleIndex: 0 },   // London sensors
  2: { cardIndex: 0, exampleIndex: 1 },   // Accra source analysis
  3: { cardIndex: 0, exampleIndex: 0 },   // Paris health study
  4: { cardIndex: 0, exampleIndex: 3 },   // Brussels policy timeline
  5: { cardIndex: 1, exampleIndex: 0 },   // Mexico City vehicle restriction
  6: { cardIndex: 0, exampleIndex: 1 },   // Johannesburg fuel transition
  7: { cardIndex: 0, exampleIndex: 1 },   // Milan tree planting
  8: { cardIndex: 0, exampleIndex: 3 },   // Bangkok awareness timeline
  9: { cardIndex: 0, exampleIndex: 1 },   // Warsaw governance staircase
  10: { cardIndex: 0, exampleIndex: 1 },  // Warsaw funding progression
  12: { cardIndex: 0, exampleIndex: 3 },  // Bogota open data
}

/** Four pillars displayed in order with descriptions — identical to v1. */
const PILLAR_ORDER: { stage: Stage; label: string; description: string }[] = [
  { stage: 'Seeing', label: 'Seeing', description: 'Building the data infrastructure to see air quality clearly' },
  { stage: 'Understanding', label: 'Understanding', description: 'Turning data into evidence — where pollution comes from and who it hurts' },
  { stage: 'Acting', label: 'Acting', description: 'Interventions that measurably reduce pollution and exposure' },
  { stage: 'Enabling', label: 'Enabling', description: 'The cross-cutting infrastructure that makes seeing, understanding, and acting work' },
]

export default function RoadmapV2Page() {
  return (
    <main className="min-h-screen bg-background pb-0">
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-16">

        {/* Breadcrumb — identical to v1 (back-nav is the PrototypeHeader "Back to hub"). */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Best Practice Roadmap</span>
        </div>

        {/* Hero — shared ConceptHero primitive replaces v1's inline h1/p. The four stat figures
            use ConceptStat (bare, no card wrapper) in a flex row below the lead, matching v1's
            inline stat row layout (all values are ≤ text-3xl, within the primitive's cap). */}
        <ConceptHero
          eyebrow="Best Practice Roadmap · concept"
          headline="Best Practice Roadmap"
          body="How 14 cities serving 77 million people are building clean air — domain by domain, with measurable results."
        >
          {/* Hero stat row — four ConceptStat blocks (bare, no card), matching v1's layout. */}
          <div className="flex flex-wrap items-end gap-6 pt-2">
            <ConceptStat value="14" label="cities" />
            <ConceptStat value="77M" label="people" />
            <ConceptStat value="12" label="domains" />
            <ConceptStat value="30%" label="reduction target by 2030" />
          </div>
        </ConceptHero>

        {/* Pillar sections — four stages, each with a ConceptSectionHeader and a domain grid. */}
        {PILLAR_ORDER.map((pillar) => {
          const pillarDomains = DOMAINS.filter((d) => d.stage === pillar.stage)
          const stageStyle = STAGE_DOT_STYLE[pillar.stage]

          return (
            <section key={pillar.stage} className="space-y-6">
              {/* Section header: stage dot (BC-token tinted) + ConceptSectionHeader. The dot is
                  a functional-colour indicator (which stage this is) and uses a distinct --bc-*
                  token per stage, applied inline. The heading text uses ConceptSectionHeader. */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stageStyle.dotColor }}
                    aria-hidden="true"
                  />
                  <ConceptSectionHeader heading={pillar.label} />
                </div>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </div>

              {/* Domain card grid — identical to v1; links updated to -v2 routes. */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {pillarDomains.filter((d) => FEATURED[d.id]).map((domain) => {
                  const domainCards = PRACTICE_CARDS.filter((p) => p.domainId === domain.id)
                  const featured = FEATURED[domain.id]
                  const card = domainCards[featured?.cardIndex ?? 0]
                  const example = card?.cityExamples[featured?.exampleIndex ?? 0]

                  if (!card || !example) {
                    return (
                      <Link
                        key={domain.id}
                        href={`/ux-concepts/best-practice-roadmap-v2/domain/${domain.slug}`}
                        className="block"
                      >
                        <div className="rounded-2xl border border-border bg-background shadow-sm p-5 h-full hover:bg-muted transition-colors">
                          <div className="text-sm font-semibold text-foreground">
                            {domain.shortName}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {domain.description}
                          </p>
                        </div>
                      </Link>
                    )
                  }

                  return (
                    <div key={domain.id} className="space-y-2">
                      <Link
                        href={`/ux-concepts/best-practice-roadmap-v2/domain/${domain.slug}`}
                        className="block"
                      >
                        <div className="text-base font-semibold text-foreground hover:underline">
                          {domain.shortName}
                        </div>
                      </Link>
                      <PracticeCardTile
                        practice={card}
                        example={example}
                        linkCity={false}
                        layout="horizontal"
                      />
                      <Link
                        href={`/ux-concepts/best-practice-roadmap-v2/domain/${domain.slug}`}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                      >
                        Explore {domain.shortName} &rarr;
                      </Link>
                    </div>
                  )
                })}
              </div>

              <Separator />
            </section>
          )
        })}
      </div>
    </main>
  )
}
