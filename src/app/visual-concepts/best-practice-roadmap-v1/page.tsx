/**
 * page.tsx — Visual Concept v1: BC AQ Roadmap overview, /visual-concepts/best-practice-roadmap-v1.
 *
 * Fork origin
 *   This file is a clean fork of src/app/ux-concepts/best-practice-roadmap-v2/page.tsx (commit
 *   09839c6 / tag wireframe-lock-2026-05-26). The fork exists so visual exploration on this
 *   concept cannot leak into the wireframe-locked UX concept. First-deploy render is identical
 *   to v2; visual evolution (BC brand layer — Söhne, BC blue, graphic elements) happens in
 *   subsequent sessions inside this folder only. The wireframe-locked v2 page must not be
 *   touched while visual work proceeds on this sandbox.
 *
 * Purpose (carried forward from v2)
 *   The roadmap overview surface. Same data and interactions as v1, but with a redesigned
 *   visual hierarchy. Source iteration 2 (2026-05-26) — see workflow log
 *   `roadmap-v2-jack-fixes-2026-05-26.md` in the source repo for the design history of v2.
 *
 *   Three-tier scale jumps (post-iteration-2):
 *     - Tier 1 — STAGE chapter headings (Seeing / Understanding / Acting / Enabling) rendered
 *       at ~clamp(2.25rem, 4vw, 3rem) bold dark-blue with a stage-coloured dot. NO numbered
 *       prefix ("01 / 04") — dropped in iteration 2 to clean the chapter-scale typography.
 *       Inline custom treatment — NOT the shared ConceptSectionHeader (this page consumes its
 *       own chapter scale; the shared component is untouched so other concepts render unchanged).
 *     - Tier 2 — DOMAIN titles ("Monitoring", "Data & Tech", etc.) rendered as quiet
 *       sentence-case column headers above each card. NO uppercase "domain" eyebrow label —
 *       dropped in iteration 2; the sentence-case name alone is sufficient.
 *     - Tier 3 — CARD content inverted via PracticeCardHero. The card is split into two
 *       columns: LEFT column = self-contained outcome hero, prominent city name, quiet
 *       practice description, footer metadata; RIGHT column = chart viz. Both columns
 *       top-aligned for predictable vertical rhythm card-to-card.
 *
 *   Detail pages (city/[slug], domain/[slug]) continue to use PracticeCardTile so their
 *   behaviour is unchanged — the new hierarchy only applies to this overview surface.
 *
 *   The hero (ConceptHero + four ConceptStat figures) is unchanged from the previous pass.
 *
 * Chrome: provided by visual-concepts/best-practice-roadmap-v1/layout.tsx (PrototypeHeader +
 *   BcHeader/BcFooter — all forked into ./_chrome in round 2 so future visual edits stay
 *   isolated). This page renders no chrome of its own. Light mode only. No emoji.
 *
 * Stage hue → tint mapping (BC brand pass 1 — 2026-05-26 — per design-director brief §3):
 *   Seeing        → var(--bc-color-blue)            BC Blue        — data/sensing = blue
 *   Understanding → var(--bc-color-region-africa)   bespoke teal   — analysis/insight = teal accent
 *   Acting        → var(--bc-color-tangerine)       tangerine      — intervention warmth/energy
 *   Enabling      → var(--bc-color-purple)          purple         — cross-cutting infra/support
 *
 *   Previous mapping referenced --bc-color-teal (not in the v1 token set; back-filled in
 *   _brand/tokens.css as an alias to region-africa) and --bc-color-dark-blue for Acting
 *   (the dot disappeared against the dark-blue heading) and --bc-color-steel for Enabling
 *   (also not in v1; back-filled as a muted neutral). Brand pass 1 swaps to the canonical
 *   BC palette per brief §3 — acknowledged overlap with AQI "unhealthy" semantic for
 *   Acting/tangerine, going with it for the warmth/intervention character.
 *
 * Unique build signal (for deploy-poll verification): the string
 * "120 low-cost sensors citywide" (London/Monitoring hero) appears in PracticeCardHero
 * composition only after this iteration — used as the unique-string poll target post-deploy.
 *
 * Key exports: default page component
 * External dependencies: next/link, ./_chrome (ConceptHero, ConceptStat — forked into the
 *   visual-concepts namespace so this concept has no remaining imports from the shared
 *   @/components/concept chrome), @/data/roadmap-data (DOMAINS, PRACTICE_CARDS, Stage),
 *   ./_components/PracticeCardHero (overview-only outcome-as-hero card)
 */

import Link from 'next/link'
import {
  ConceptHero,
  ConceptStat,
} from './_chrome'
import {
  DOMAINS,
  PRACTICE_CARDS,
  type Stage,
} from '@/data/roadmap-data'
import { PracticeCardHero } from './_components/PracticeCardHero'

/**
 * Stage dot style override — 4 DISTINCT --bc-* token tints applied at the presentation
 * layer so this overview uses the canonical BC brand palette instead of the tailwind
 * blue/amber/green/gray from STAGE_COLORS in roadmap-data.ts. The shared data file is NOT
 * edited.
 *
 * BC brand pass 1 (2026-05-26) — canonical mapping per design-director brief §3:
 *   Seeing        → --bc-color-blue            (BC Blue — data collection, sensing)
 *   Understanding → --bc-color-region-africa   (bespoke teal accent — analysis, insight)
 *   Acting        → --bc-color-tangerine       (intervention warmth and energy)
 *   Enabling      → --bc-color-purple          (cross-cutting infrastructure cue)
 *
 * Previous draft mapping used --bc-color-teal/--bc-color-dark-blue/--bc-color-steel — the
 * first and third tokens were not declared in the v1 token set; back-filled as aliases in
 * _brand/tokens.css so any stale lookup still resolves within-palette.
 *
 * dotColor is rendered as a w-4 h-4 chapter dot to the left of the stage heading.
 */
const STAGE_DOT_STYLE: Record<Stage, { dotColor: string }> = {
  Seeing: { dotColor: 'var(--bc-color-blue)' },
  Understanding: { dotColor: 'var(--bc-color-region-africa)' },
  Acting: { dotColor: 'var(--bc-color-tangerine)' },
  Enabling: { dotColor: 'var(--bc-color-purple)' },
}

/**
 * DARK_CARD_DOMAINS — the four featured domains that render their PracticeCardHero in the
 * DARK variant (navy surface, white text, light-blue city, white-on-blue chart inset).
 * One dark card per stage row creates the editorial card-rhythm seen in the data-vis
 * reference image. Picks per brief §4:
 *   Seeing        → 1  (London / Monitoring   — BC Blue sensor count earns the navy stage)
 *   Understanding → 2  (Accra / Source Analysis)
 *   Acting        → 4  (Brussels / Policy Timeline — the -42% PM2.5 figure)
 *   Enabling      → 8  (Bangkok / Awareness)
 * If a stage only renders one card, that card stays light per brief §4. The alternation
 * is editorial rhythm, not a rule.
 */
const DARK_CARD_DOMAINS = new Set<number>([1, 2, 4, 8])

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
    // BC brand pass 1: main background locked explicitly to BC white via inline style. The
    // brand wrapper in layout.tsx sets [data-bc-brand="v1"] so var(--bc-color-white) resolves.
    // Resists any shadcn bg-background bridging that might tint the page.
    <main
      className="min-h-screen pb-0"
      style={{ backgroundColor: 'var(--bc-color-white)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-12">

        {/* Hero — ConceptHero (h1 cap lifted to title-large in BC brand pass 1) +
            four ConceptStat figures (value promoted to BC Blue 900 weight at clamp scale,
            label muted dark-blue at 60%). gap bumped to gap-x-10 gap-y-4 pt-4 so the
            big-numbers row reads as deliberate editorial pacing — was gap-6 pt-2. */}
        <ConceptHero
          headline="Breathe Cities Air Quality Roadmap"
          body="14 Breathe Cities serving 77 million people are on the same journey toward clean air: seeing, understanding, acting and enabling. This roadmap organises 12 domains of practice across those four stages, with measurable results."
        >
          <div className="flex flex-wrap items-end gap-x-10 gap-y-4 pt-4">
            <ConceptStat value="14" label="cities" />
            <ConceptStat value="77M" label="people" />
            <ConceptStat value="12" label="domains" />
            <ConceptStat value="30%" label="reduction target by 2030" />
          </div>
        </ConceptHero>

        {/* Stage chapter sections — Tier 1 hierarchy. Each stage is its own section with a
            chapter-scale heading and generous top margin so the four stages read as distinct
            chapters rather than as siblings to the cards.

            Iteration 2: dropped the "01 / 04 ·" stage counter prefix. Stage number prefix is
            no longer rendered — the dot + chapter title alone carry the hierarchy.

            mt-32 (was mt-24) gives extra clearance between stage sections so the next stage's
            chapter heading cannot visually butt against the previous stage's card grid even
            when cards in the last row have variable heights or trailing Explore links. */}
        {PILLAR_ORDER.map((pillar) => {
          const pillarDomains = DOMAINS.filter((d) => d.stage === pillar.stage)
          const stageStyle = STAGE_DOT_STYLE[pillar.stage]

          return (
            <section key={pillar.stage} className="mt-32 first:mt-20">
              {/* Tier 1 — STAGE chapter heading. Inline custom treatment (NOT the shared
                  ConceptSectionHeader) so this page can carry its own chapter scale without
                  rippling into other concepts. Stage dot + chapter title + quiet one-line
                  description. The "01 / 04" stage counter prefix was removed in iteration 2.
                  BC brand pass 1: h2 size bound to --bc-font-size-title-medium (24→46px clamp),
                  weight bumped to 900 (Söhne Extrafett), colour to BC dark blue. Dot bumped to
                  w-4 h-4 to balance the heavier weight. Description pl bumped to pl-7 to align
                  with the larger dot. Description colour to muted dark-blue at 65%. */}
              <header className="mb-10 space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stageStyle.dotColor }}
                    aria-hidden="true"
                  />
                  <h2
                    className="tracking-tight leading-[1.05]"
                    style={{
                      fontSize: 'var(--bc-font-size-title-medium)',
                      fontWeight: 'var(--bc-font-weight-black)',
                      color: 'var(--bc-color-dark-blue)',
                    }}
                  >
                    {pillar.label}
                  </h2>
                </div>
                <p
                  className="max-w-2xl pl-7"
                  style={{
                    fontSize: 'var(--bc-font-size-body)',
                    color: 'color-mix(in srgb, var(--bc-color-dark-blue) 65%, transparent)',
                  }}
                >
                  {pillar.description}
                </p>
              </header>

              {/* Domain card grid — each cell renders the Tier 2 domain title above a Tier 3
                  PracticeCardHero card. items-start on the grid keeps cards top-aligned when
                  their heights differ (which they will, since chart types vary).

                  Iteration 2 — the per-cell wrapper uses flex-col so the Explore link sits
                  at a stable position relative to the card, and `min-h` is unset so cards
                  size to their own content (top-alignment owned by grid items-start). */}
              <div className="grid gap-x-6 gap-y-10 grid-cols-1 lg:grid-cols-2 items-start">
                {pillarDomains.filter((d) => FEATURED[d.id]).map((domain) => {
                  const domainCards = PRACTICE_CARDS.filter((p) => p.domainId === domain.id)
                  const featured = FEATURED[domain.id]
                  const card = domainCards[featured?.cardIndex ?? 0]
                  const example = card?.cityExamples[featured?.exampleIndex ?? 0]

                  if (!card || !example) {
                    return (
                      <div key={domain.id} className="flex flex-col gap-2">
                        <DomainTitle name={domain.shortName} />
                        <Link
                          href={`/visual-concepts/best-practice-roadmap-v1/domain/${domain.slug}`}
                          className="block"
                        >
                          <div className="rounded-2xl border border-border bg-background shadow-sm p-5 hover:bg-muted transition-colors">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {domain.description}
                            </p>
                          </div>
                        </Link>
                      </div>
                    )
                  }

                  return (
                    <div key={domain.id} className="flex flex-col gap-3">
                      {/* Tier 2 — quiet domain title above the card. Sentence-case heading,
                          no uppercase "domain" eyebrow label (dropped in iteration 2 — the
                          name alone is sufficient). BC brand pass 1: lifted to title-sub scale
                          in DomainTitle below. */}
                      <DomainTitle name={domain.shortName} />
                      {/* BC brand pass 1: dark variant for the first featured domain per stage
                          (the four IDs in DARK_CARD_DOMAINS), light variant otherwise — creates
                          mixed light/dark card rhythm on the white field per brief §4. */}
                      <PracticeCardHero
                        practice={card}
                        example={example}
                        variant={DARK_CARD_DOMAINS.has(domain.id) ? 'dark' : 'light'}
                      />
                      {/* BC brand pass 1: Explore link promoted to BC Blue at 600 weight.
                          Hover underline (CSS-only utility) carries the affordance — full
                          colour-state hover would require a CSS rule rather than inline style,
                          accepting the default-blue-at-rest treatment per brief §8.7. */}
                      <Link
                        href={`/visual-concepts/best-practice-roadmap-v1/domain/${domain.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
                        style={{ color: 'var(--bc-color-blue)' }}
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
 * DomainTitle — Tier 2 quiet column-header treatment for a domain title. Sentence-case
 * domain name; renders between the stage chapter heading (Tier 1) and the card outcome hero
 * (Tier 3) in the type hierarchy. Iteration 2 dropped the uppercase "domain" eyebrow label;
 * the name alone is sufficient signal.
 *
 * BC brand pass 1 (2026-05-26) — promoted to --bc-font-size-title-sub (18→26px clamp) in
 * full BC dark blue at 500 (Söhne Kräftig). Was text-base font-medium text-foreground/80,
 * which collapsed against the lifted hero stats and card outcome hero at this density.
 * The lift only works because the colour also goes to full-strength dark blue.
 */
function DomainTitle({ name }: { name: string }) {
  return (
    <div
      className="font-medium tracking-tight"
      style={{
        fontSize: 'var(--bc-font-size-title-sub)',
        color: 'var(--bc-color-dark-blue)',
      }}
    >
      {name}
    </div>
  )
}
