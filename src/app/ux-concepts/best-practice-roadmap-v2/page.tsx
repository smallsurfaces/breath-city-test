/**
 * page.tsx — Best Practice Roadmap v2 overview, /ux-concepts/best-practice-roadmap-v2.
 *
 * Purpose
 *   The roadmap overview surface. Same data and interactions as v1, but with a redesigned
 *   visual hierarchy (post 2026-05-26 Russ-style critique — the previous "wall of words"
 *   treatment was too flat to skim).
 *
 *   Three-tier scale jumps:
 *     - Tier 1 — STAGE chapter headings (Seeing / Understanding / Acting / Enabling) rendered
 *       at ~clamp(2.25rem, 4vw, 3rem) bold dark-blue with a stage-coloured dot, a numbered
 *       prefix ("01 / 04 · Seeing"), generous top margin. Inline custom treatment — NOT the
 *       shared ConceptSectionHeader (this page consumes its own chapter scale; the shared
 *       component is untouched so other concepts render unchanged).
 *     - Tier 2 — DOMAIN titles ("Monitoring", "Data & Tech", etc.) rendered as quiet
 *       sentence-case column headers above each card, with a small uppercase "domain" label.
 *     - Tier 3 — CARD content inverted via PracticeCardHero (new sibling of PracticeCardTile):
 *       outcome number is the hero, practice/intervention is the supporting line, city +
 *       population + introduced-year are quiet footer metadata.
 *
 *   Detail pages (city/[slug], domain/[slug]) continue to use PracticeCardTile so their
 *   behaviour is unchanged — the new hierarchy only applies to this overview surface.
 *
 *   The hero (ConceptHero + four ConceptStat figures) is unchanged from the previous pass.
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
 * Unique build signal (for deploy-poll verification): the string "01 / 04 · Seeing" appears
 * in this page's markup only after this redesign — used as the unique-string poll target
 * post-deploy.
 *
 * Key exports: default page component
 * External dependencies: next/link, @/components/concept (ConceptHero, ConceptStat),
 *   @/data/roadmap-data (DOMAINS, PRACTICE_CARDS, Stage),
 *   ./_components/PracticeCardHero (overview-only outcome-as-hero card)
 */

import Link from 'next/link'
import {
  ConceptHero,
  ConceptStat,
} from '@/components/concept'
import {
  DOMAINS,
  PRACTICE_CARDS,
  type Stage,
} from '@/data/roadmap-data'
import { PracticeCardHero } from './_components/PracticeCardHero'

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
 *
 * dotColor is now used at chapter scale (larger w-3 h-3 dot beside the stage heading) and
 * also as the colour of the "01 / 04" prefix numeral for that stage.
 */
const STAGE_DOT_STYLE: Record<Stage, { dotColor: string }> = {
  Seeing: { dotColor: 'var(--bc-color-blue)' },
  Understanding: { dotColor: 'var(--bc-color-teal)' },
  Acting: { dotColor: 'var(--bc-color-dark-blue)' },
  Enabling: { dotColor: 'var(--bc-color-steel)' },
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
  const totalStages = PILLAR_ORDER.length

  return (
    <main className="min-h-screen bg-background pb-0">
      <div className="mx-auto max-w-6xl px-4 py-12">

        {/* Hero — unchanged from previous pass: shared ConceptHero + four ConceptStat figures. */}
        <ConceptHero
          headline="Breathe Cities Air Quality Roadmap"
          body="Every BC city walks the same journey toward clean air: seeing their pollution, understanding where it comes from, acting to cut it, and enabling the infrastructure that makes the rest possible. The roadmap below organises 12 domains of practice across those four stages, domain by domain, with measurable results."
        >
          <div className="flex flex-wrap items-end gap-6 pt-2">
            <ConceptStat value="14" label="cities" />
            <ConceptStat value="77M" label="people" />
            <ConceptStat value="12" label="domains" />
            <ConceptStat value="30%" label="reduction target by 2030" />
          </div>
        </ConceptHero>

        {/* Stage chapter sections — Tier 1 hierarchy. Each stage is its own section with a
            chapter-scale heading and generous top margin so the four stages read as distinct
            chapters rather than as siblings to the cards. */}
        {PILLAR_ORDER.map((pillar, pillarIndex) => {
          const pillarDomains = DOMAINS.filter((d) => d.stage === pillar.stage)
          const stageStyle = STAGE_DOT_STYLE[pillar.stage]
          const stageNumberStr = `${String(pillarIndex + 1).padStart(2, '0')} / ${String(totalStages).padStart(2, '0')}`

          return (
            <section key={pillar.stage} className="mt-24 first:mt-20">
              {/* Tier 1 — STAGE chapter heading. Inline custom treatment (NOT the shared
                  ConceptSectionHeader) so this page can carry its own chapter scale without
                  rippling into other concepts. Stage number prefix + dot + headline + quiet
                  one-line description. */}
              <header className="mb-10 space-y-3">
                <div
                  className="text-sm font-semibold tracking-wider"
                  style={{ color: stageStyle.dotColor }}
                >
                  {stageNumberStr}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stageStyle.dotColor }}
                    aria-hidden="true"
                  />
                  <h2
                    className="font-bold tracking-tight text-foreground leading-[1.05]"
                    style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)' }}
                  >
                    {pillar.label}
                  </h2>
                </div>
                <p className="text-base text-muted-foreground max-w-2xl pl-6">
                  {pillar.description}
                </p>
              </header>

              {/* Domain card grid — each cell has a Tier 2 quiet eyebrow domain title above
                  a Tier 3 PracticeCardHero card. */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {pillarDomains.filter((d) => FEATURED[d.id]).map((domain) => {
                  const domainCards = PRACTICE_CARDS.filter((p) => p.domainId === domain.id)
                  const featured = FEATURED[domain.id]
                  const card = domainCards[featured?.cardIndex ?? 0]
                  const example = card?.cityExamples[featured?.exampleIndex ?? 0]

                  if (!card || !example) {
                    return (
                      <div key={domain.id} className="space-y-2">
                        <DomainEyebrow name={domain.shortName} />
                        <Link
                          href={`/ux-concepts/best-practice-roadmap-v2/domain/${domain.slug}`}
                          className="block"
                        >
                          <div className="rounded-2xl border border-border bg-background shadow-sm p-5 h-full hover:bg-muted transition-colors">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {domain.description}
                            </p>
                          </div>
                        </Link>
                      </div>
                    )
                  }

                  return (
                    <div key={domain.id} className="space-y-3">
                      {/* Tier 2 — quiet domain eyebrow above the card. Sentence-case heading
                          with small uppercase "domain" label so it reads as a column header
                          rather than as a sibling to the stage chapter. */}
                      <DomainEyebrow name={domain.shortName} />
                      <PracticeCardHero practice={card} example={example} />
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
            </section>
          )
        })}
      </div>
    </main>
  )
}

/**
 * DomainEyebrow — Tier 2 quiet column-header treatment for a domain title. Small uppercase
 * "domain" label above the sentence-case domain name. Renders quieter than the stage chapter
 * heading and quieter than the card outcome hero — sits cleanly as a column header inside
 * its stage section.
 */
function DomainEyebrow({ name }: { name: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80 font-medium">
        domain
      </div>
      <div className="text-base font-medium text-foreground/80">{name}</div>
    </div>
  )
}
