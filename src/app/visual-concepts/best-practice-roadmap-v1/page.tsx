/**
 * page.tsx — Visual Concept v1: BC AQ Roadmap overview, /visual-concepts/best-practice-roadmap-v1.
 *
 * Fork origin
 *   Clean fork of src/app/ux-concepts/best-practice-roadmap-v2/page.tsx (commit 09839c6 / tag
 *   wireframe-lock-2026-05-26). Forked so visual exploration cannot leak into the
 *   wireframe-locked UX concept.
 *
 * Pass 4 (2026-05-27 — five-item bundle)
 *   - Hero right column now renders RoadmapRingChart (two-ring data viz of the 11-domain /
 *     4-stage structure) in place of HeroWindComposition. Wind+Windows continues at the
 *     Acting-stage WindAccent moment only.
 *   - Card template uniform across all 11 featured cards (no light/dark BC Blue alternation).
 *     DARK_CARD_DOMAINS set removed; per-card Explore pill is variant B (blue) on every card.
 *     PracticeCardHero retains its `variant` prop for backward compatibility but currently
 *     ignores it.
 *
 * BC brand pass 2 (2026-05-27 — historical, per brand-pass-2 brief)
 *   This restructures the page chrome from a single-`<main>`-with-white-background into a stack
 *   of full-bleed coloured `<section>` elements that implement the alternating BC site colour
 *   rhythm per brief §4:
 *
 *     Hero          → BC Blue full-bleed (was white)
 *     Stage 1 Seeing       → White
 *     Stage 2 Understanding → Light-blue panel wash
 *     Stage 3 Acting       → White (with Acting-tangerine Wind accent next to heading per §7)
 *     Stage 4 Enabling     → Light-blue panel wash
 *
 *   The hero gets a two-column layout (brief §5) — headline + stats + pill CTA on the left,
 *   plus a hero-right composition (pass 4: ring chart; pass 2: Wind+Windows). The hero is
 *   rendered with `<ConceptHero variant="dark">` to flip type to white-on-blue. ConceptStat
 *   instances likewise use `variant="dark"`.
 *
 *   Each stage chapter gets a section eyebrow above the h2 per brief §9 — "Chapter NN · [Stage]"
 *   in BC Blue or stage-coloured per the §9 mapping. The h2 itself stays clean (no chapter
 *   prefix). Stage dot bumped to w-5 h-5 per brief §11.
 *
 *   Per-card "Explore" link becomes a BcPill (variant B on light cards, C on dark cards) per
 *   brief §8.
 *
 *   Each card receives `cityRegion` for the optional 4px regional-colour top border per brief
 *   §6 final note — the card surface picks up the regional accent.
 *
 * Three-tier scale jumps (preserved from iteration 2)
 *   Tier 1 — STAGE chapter headings (Seeing / Understanding / Acting / Enabling) — title-medium
 *     900 dark blue with stage-coloured dot. No numbered prefix on the h2; chapter number is in
 *     the eyebrow above it (pass 2 §9 restoration).
 *   Tier 2 — DOMAIN titles — quiet sentence-case at title-sub.
 *   Tier 3 — CARD content via PracticeCardHero — outcome dominant, city prominent supporting,
 *     metadata at foot.
 *
 * Detail pages (city/[slug], domain/[slug]) continue to use PracticeCardTile so their
 * behaviour is unchanged — the new hierarchy only applies to this overview surface.
 *
 * Chrome: provided by visual-concepts/best-practice-roadmap-v1/layout.tsx (PrototypeHeader +
 *   BcHeader + BcNewsletter + BcFooter — all forked into ./_chrome). This page renders no
 *   chrome of its own. Light mode only. No emoji.
 *
 * Stage hue → tint mapping (BC brand pass 1):
 *   Seeing        → var(--bc-color-blue)            BC Blue
 *   Understanding → var(--bc-color-region-africa)   bespoke teal
 *   Acting        → var(--bc-color-tangerine)       tangerine
 *   Enabling      → var(--bc-color-purple)          purple
 *
 * Key exports: default page component
 * External dependencies: ./_chrome (ConceptHero, ConceptStat, BcPill, WindAccent),
 *   @/data/roadmap-data (DOMAINS, PRACTICE_CARDS, Stage), ./_components/PracticeCardHero,
 *   ./_components/RoadmapRingChart (pass 4 hero data viz).
 */

import {
  ConceptHero,
  ConceptStat,
  BcPill,
  WindAccent,
} from './_chrome'
import {
  DOMAINS,
  PRACTICE_CARDS,
  type Stage,
} from '@/data/roadmap-data'
import { PracticeCardHero } from './_components/PracticeCardHero'
// Pass 4 (2026-05-27): HeroWindComposition replaced in the hero's right column with the
// two-ring data viz chart per pass-4 brief item 3. HeroWindComposition stays available in
// _chrome/BcGraphics (still consumed inside WindAccent's Acting-stage accent moment, plus the
// raw primitives WindShape / Window01..05 stay exported for future moments).
import { RoadmapRingChart } from './_components/RoadmapRingChart'

/**
 * Stage dot style override — 4 distinct BC token tints applied at the presentation layer per
 * brand-pass-1 brief §3 canonical mapping. Dot rendered at w-5 h-5 in pass 2 per brief §11
 * (was w-4 h-4) so the dot balances the bumped h2 weight.
 */
const STAGE_DOT_STYLE: Record<Stage, { dotColor: string }> = {
  Seeing: { dotColor: 'var(--bc-color-blue)' },
  Understanding: { dotColor: 'var(--bc-color-region-africa)' },
  Acting: { dotColor: 'var(--bc-color-tangerine)' },
  Enabling: { dotColor: 'var(--bc-color-purple)' },
}

/**
 * Stage eyebrow colour mapping — per brand-pass-2 brief §9. Seeing/Understanding eyebrows use
 * BC Blue (stage h2 is on white/light-blue panel); Acting eyebrow uses tangerine; Enabling
 * eyebrow uses purple. The eyebrow colour matches the stage dot colour for chapters 3 and 4
 * (semantic reinforcement); chapters 1 and 2 use a single BC Blue to keep the cyan-tinted
 * panel from being noisy.
 */
const STAGE_EYEBROW_COLOR: Record<Stage, string> = {
  Seeing: 'var(--bc-color-blue)',
  Understanding: 'var(--bc-color-blue)',
  Acting: 'var(--bc-color-tangerine)',
  Enabling: 'var(--bc-color-purple)',
}

/**
 * Stage section background mapping — per brand-pass-2 brief §4. Alternating
 * white → light-blue-wash → white → light-blue-wash so the four chapters read as visual breaks
 * without breaking the reading. Returns 'transparent' for the white slots so the underlying
 * page surface (set to white in the outer `<main>`) shows through.
 */
const STAGE_SECTION_BG: Record<Stage, string> = {
  Seeing: 'var(--bc-color-white)',
  Understanding: 'var(--bc-color-light-blue-wash)',
  Acting: 'var(--bc-color-white)',
  Enabling: 'var(--bc-color-light-blue-wash)',
}

/**
 * Chapter number for the eyebrow ("Chapter 01 · Seeing"). The position in PILLAR_ORDER is the
 * canonical chapter number; rendered as zero-padded for visual consistency.
 */
function chapterNumber(stage: Stage): string {
  const ordinal = PILLAR_ORDER.findIndex((p) => p.stage === stage) + 1
  return String(ordinal).padStart(2, '0')
}

/**
 * Pass 4 (2026-05-27) — DARK_CARD_DOMAINS removed. The card template now renders uniformly
 * (white card surface with subtle full-card city image background; saturated-regional
 * fallback for Bangkok / Bogotá). Visual rhythm comes from the different city images
 * themselves, not from BC-Blue card alternation. Per-card Explore pill uses variant B
 * (blue pill) on all cards as a consequence.
 */

/**
 * Featured card per domain — picks the most visually compelling example.
 */
const FEATURED: Record<number, { cardIndex: number; exampleIndex: number }> = {
  1: { cardIndex: 0, exampleIndex: 0 },
  2: { cardIndex: 0, exampleIndex: 1 },
  3: { cardIndex: 0, exampleIndex: 0 },
  4: { cardIndex: 0, exampleIndex: 3 },
  5: { cardIndex: 1, exampleIndex: 0 },
  6: { cardIndex: 0, exampleIndex: 1 },
  7: { cardIndex: 0, exampleIndex: 1 },
  8: { cardIndex: 0, exampleIndex: 3 },
  9: { cardIndex: 0, exampleIndex: 1 },
  10: { cardIndex: 0, exampleIndex: 1 },
  12: { cardIndex: 0, exampleIndex: 3 },
}

/** Four pillars displayed in order with descriptions. */
const PILLAR_ORDER: { stage: Stage; label: string; description: string }[] = [
  { stage: 'Seeing', label: 'Seeing', description: 'Building the data infrastructure to see air quality clearly' },
  { stage: 'Understanding', label: 'Understanding', description: 'Turning data into evidence — where pollution comes from and who it hurts' },
  { stage: 'Acting', label: 'Acting', description: 'Interventions that measurably reduce pollution and exposure' },
  { stage: 'Enabling', label: 'Enabling', description: 'The cross-cutting infrastructure that makes seeing, understanding, and acting work' },
]

export default function RoadmapV2Page() {
  return (
    // BC brand pass 2 (2026-05-27): `<main>` is now a transparent shell. Each section inside
    // sets its own full-bleed background via the alternating colour rhythm per brief §4. The
    // outer white anchor remains to fall back to white between sections if any zero-height
    // edge cases occur.
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bc-color-white)' }}
    >
      {/* ─── Hero section ─── BC Blue full-bleed per brief §4 + §5.
       *  Two-column on desktop: headline+stats+CTA on the left, Wind+Windows composition on
       *  the right. Stacks on mobile (composition hidden via lg:block — see comment below). */}
      <section
        id="hero"
        className="w-full"
        style={{ backgroundColor: 'var(--bc-color-blue)' }}
      >
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT column — headline + stats + pill CTA. ConceptHero with variant='dark' flips
             *  type to white-on-blue; the eyebrow gets the cyan underline treatment per §9. */}
            <div>
              <ConceptHero
                variant="dark"
                eyebrow="The Roadmap"
                headline="Breathe Cities Air Quality Roadmap"
                body="14 Breathe Cities serving 77 million people are on the same journey toward clean air: seeing, understanding, acting and enabling. This roadmap organises 12 domains of practice across those four stages, with measurable results."
                cta={{ label: 'Read the roadmap', href: '#chapter-1' }}
              >
                {/* Stats row — four ConceptStat blocks with variant='dark' (white type on blue). */}
                <div className="flex flex-wrap items-end gap-x-10 gap-y-4 pt-8">
                  <ConceptStat variant="dark" value="14" label="cities" />
                  <ConceptStat variant="dark" value="77M" label="people" />
                  <ConceptStat variant="dark" value="12" label="domains" />
                  <ConceptStat variant="dark" value="30%" label="reduction target by 2030" />
                </div>
              </ConceptHero>
            </div>

            {/* RIGHT column — pass 4 (2026-05-27): two-ring roadmap data viz replaces the
             *  Wind+Windows composition per pass-4 brief item 3. Hidden on mobile via
             *  `hidden lg:block` (the hero collapses to single-column text-only on narrow
             *  viewports — mirrors how the previous composition handled mobile). Render size
             *  drops on tablet via lg:w-[360px] -> xl:w-[480px] (parent grid keeps the column
             *  vertically centred). */}
            <div className="hidden lg:block w-full">
              <div className="flex items-center justify-center">
                <div className="block xl:hidden">
                  <RoadmapRingChart size={360} />
                </div>
                <div className="hidden xl:block">
                  <RoadmapRingChart size={480} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stage chapter sections ─── alternating colour rhythm per brief §4.
       *  Each section element gets the full-bleed background, with the inner content
       *  constrained inside the max-w-6xl container. Scroll-anchor IDs (chapter-N) match the
       *  hero CTA's href so 'Read the roadmap' scrolls to the first chapter. */}
      {PILLAR_ORDER.map((pillar, pillarIndex) => {
        const pillarDomains = DOMAINS.filter((d) => d.stage === pillar.stage)
        const stageStyle = STAGE_DOT_STYLE[pillar.stage]
        const eyebrowColor = STAGE_EYEBROW_COLOR[pillar.stage]
        const sectionBg = STAGE_SECTION_BG[pillar.stage]
        const chapterNum = chapterNumber(pillar.stage)
        const isActing = pillar.stage === 'Acting'

        return (
          <section
            key={pillar.stage}
            id={`chapter-${pillarIndex + 1}`}
            className="w-full"
            style={{ backgroundColor: sectionBg }}
          >
            <div className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
              {/* Chapter eyebrow above the h2 per brief §9 — 13px uppercase tracking-wider
               *  Söhne Halbfett, BC Blue (chapters 1,2) / stage-coloured (chapters 3,4), with
               *  2px solid same-colour underline 4px below. Restores the chapter counter that
               *  pass 1 dropped, at a smaller scale where it doesn't compete with the h2. */}
              <div className="mb-8 flex items-center gap-4">
                <p
                  className="inline-block uppercase tracking-wider"
                  style={{
                    fontSize: '13px',
                    fontWeight: 'var(--bc-font-weight-semibold)',
                    color: eyebrowColor,
                    textDecoration: 'underline',
                    textDecorationThickness: '2px',
                    textUnderlineOffset: '4px',
                    textDecorationColor: eyebrowColor,
                  }}
                >
                  Chapter {chapterNum} &middot; {pillar.label}
                </p>
              </div>

              {/* Tier 1 — STAGE chapter heading + optional Acting Wind accent.
               *  Per brief §7 moment 2: a tangerine Wind swirl sits to the left of the
               *  Acting heading on desktop (hidden on mobile to avoid cramping). The other
               *  three stages have no Wind accent — the singular Acting tangerine swirl earns
               *  attention by being unique. */}
              <header className="mb-10 space-y-3">
                <div className="flex items-center gap-3">
                  {isActing && (
                    <div className="hidden md:block">
                      <WindAccent />
                    </div>
                  )}
                  <span
                    className="inline-block w-5 h-5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stageStyle.dotColor }}
                    aria-hidden="true"
                  />
                  <h2
                    className="tracking-tight leading-[1.05]"
                    style={{
                      fontSize: 'var(--bc-font-size-title-medium)',
                      fontWeight: 'var(--bc-font-weight-medium)',
                      color: 'var(--bc-color-dark-blue)',
                    }}
                  >
                    {pillar.label}
                  </h2>
                </div>
                <p
                  className="max-w-2xl pl-8"
                  style={{
                    fontSize: 'var(--bc-font-size-body)',
                    color: 'color-mix(in srgb, var(--bc-color-dark-blue) 75%, transparent)',
                  }}
                >
                  {pillar.description}
                </p>
              </header>

              {/* Domain card grid — 2-column on desktop, items-start to top-align cards in a row. */}
              <div className="grid gap-x-6 gap-y-10 grid-cols-1 lg:grid-cols-2 items-start">
                {pillarDomains.filter((d) => FEATURED[d.id]).map((domain) => {
                  const domainCards = PRACTICE_CARDS.filter((p) => p.domainId === domain.id)
                  const featured = FEATURED[domain.id]
                  const card = domainCards[featured?.cardIndex ?? 0]
                  const example = card?.cityExamples[featured?.exampleIndex ?? 0]

                  // Pass 4 (2026-05-27) — card template uniform across all 11 featured cards.
                  // PracticeCardHero no longer accepts a meaningful `variant` (prop preserved
                  // for backward compat, currently a no-op). Per-card Explore pill is variant B
                  // on every card (blue pill on light surface).

                  if (!card || !example) {
                    return (
                      <div key={domain.id} className="flex flex-col gap-2">
                        <DomainTitle name={domain.shortName} />
                        <div
                          className="rounded-2xl p-5 border"
                          style={{
                            backgroundColor: 'var(--bc-color-white)',
                            borderColor:
                              'color-mix(in srgb, var(--bc-color-dark-blue) 8%, transparent)',
                          }}
                        >
                          <p
                            className="text-xs line-clamp-2"
                            style={{
                              color:
                                'color-mix(in srgb, var(--bc-color-dark-blue) 65%, transparent)',
                            }}
                          >
                            {domain.description}
                          </p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={domain.id} className="flex flex-col gap-3">
                      {/* Tier 2 — quiet domain title above the card. */}
                      <DomainTitle name={domain.shortName} />
                      {/* Tier 3 — PracticeCardHero, pass-4 uniform template. */}
                      <PracticeCardHero
                        practice={card}
                        example={example}
                      />
                      {/* Per-card Explore CTA — pass 4: variant B uniformly across all cards. */}
                      <div className="pt-1">
                        <BcPill
                          label={`Explore ${domain.shortName}`}
                          href={`/visual-concepts/best-practice-roadmap-v1/domain/${domain.slug}`}
                          variant="B"
                          size="small"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}
    </main>
  )
}

/**
 * DomainTitle — Tier 2 quiet column-header treatment for a domain title. Sentence-case domain
 * name at title-sub scale in BC dark blue at 500 weight. Pass 1 lifted from text-base; pass 2
 * keeps this treatment (no further changes per brief §11).
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
