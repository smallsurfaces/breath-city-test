/**
 * PracticeCardHero.tsx — outcome-as-hero card variant for the roadmap overview grid.
 *
 * Fork origin: clean fork of src/app/ux-concepts/best-practice-roadmap-v2/_components/
 *   PracticeCardHero.tsx (commit 09839c6 / tag wireframe-lock-2026-05-26). Forked so visual
 *   evolution stays isolated from the wireframe-locked UX concept. First-deploy render identical.
 *
 * Purpose
 *   Sibling of PracticeCardTile. Where PracticeCardTile renders city + practice name as the
 *   dominant typography with the chart as supporting evidence, PracticeCardHero inverts the
 *   hierarchy: the outcome (a self-contained metric sentence like "-42% PM2.5 since 2018")
 *   becomes the visually dominant element, the city name sits as a prominent supporting line
 *   directly beneath it, and the practice description + population + introduced-year drop to
 *   quiet metadata at the foot of the card.
 *
 *   This component is consumed only on the v2 roadmap overview page (page.tsx). Detail pages
 *   continue to use PracticeCardTile so their behaviour is unchanged.
 *
 * Iteration 2 (2026-05-26) layout — see workflow log roadmap-v2-jack-fixes-2026-05-26.md.
 *   Two columns inside the card, both top-aligned:
 *     LEFT column (top-aligned)
 *       [Outcome hero            — 2.25rem bold, top of column]
 *       [City name               — 17px medium, dark-blue, prominent]
 *       [Practice description    — 13px quiet, sits beneath city as the supporting line]
 *       [Population · year       — 11px quiet metadata, pushed to bottom of column]
 *     RIGHT column (top-aligned)
 *       [Chart viz]
 *
 *   The previous full-width practice description row beneath the chart is gone — description
 *   now nests under the hero in the left column. This shortens the card and tightens the
 *   relationship between the outcome and the programme it names.
 *
 *   Heights: cards size to their own content; the parent grid uses items-start so cards in a
 *   row top-align rather than stretching. Left column uses flex-col with mt-auto on the
 *   metadata row so it pins to the bottom of the column when the card is taller than the
 *   left content (typically pushed by chart height).
 *
 * Hero composition (fix #4 — self-contained heroes)
 *   composeHero() takes the practice + example and returns a hero string that reads as a
 *   complete sentence on its own (subject + result). Strategy: borrow nouns from chartData
 *   labels/headlines/metrics and compose with the example.outcomeChange. Hand-tuned overrides
 *   per practice-id × city-slug where the data doesn't compose cleanly. No edits to
 *   roadmap-data.ts — composition lives here.
 *
 * Key exports: PracticeCardHero (named)
 * External dependencies: shadcn Card, @/data/roadmap-data lookup helpers, sibling
 *   PracticeCardView (re-uses ChartViz dispatcher via the shared module).
 */

import type { CSSProperties } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  type PracticeCard,
  type CityExample,
  getCityBySlug,
} from "@/data/roadmap-data";
import { ChartViz } from "./PracticeCardView";

/** Props for PracticeCardHero. Mirrors the subset of PracticeCardTile props this variant needs. */
interface PracticeCardHeroProps {
  /** The practice this card belongs to — used to render its name as the supporting line. */
  practice: PracticeCard;
  /** The single city example to showcase. */
  example: CityExample;
  /**
   * BC brand pass 1 (2026-05-26) — card surface variant.
   *   'light' (default) — white background, navy hairline border, dark-blue text, BC Blue
   *     city name. Most cards on the page render light.
   *   'dark' — Dark Blue surface, no border, white text, Light Blue city name. Used for one
   *     featured card per stage row (set in page.tsx via DARK_CARD_DOMAINS) to create the
   *     mixed-card editorial rhythm seen in the data-vis reference image translated through
   *     BC palette.
   * Chart container and footer metadata both respond to variant for tonal coherence.
   */
  variant?: 'light' | 'dark';
}

/**
 * composeHero — returns a self-contained hero string for the featured card.
 *
 * Strategy (in priority order):
 *   1. Hand-tuned override keyed by `practice.id` + `example.citySlug` for the 11 featured
 *      cards on the overview surface. Overrides exist for every FEATURED card mapping in
 *      page.tsx so heroes read as complete subject+result sentences.
 *   2. Fallback to `example.outcomeChange` (the original behaviour) for any unfeatured
 *      card-example pairs that happen to consume this component in future.
 *   3. Final fallback: empty string (caller branches on null/empty to render the
 *      practice-name-as-hero treatment).
 *
 * Overrides are intentionally inline (not in roadmap-data.ts) — the data file is shared with
 * other surfaces (city detail, domain detail, v1 overview) and we don't want overview-only
 * editorial choices to leak into those.
 */
function composeHero(practice: PracticeCard, example: CityExample): string | null {
  const key = `${practice.id}|${example.citySlug}`;
  const overrides: Record<string, string> = {
    // Seeing — Monitoring (London)
    "d1-sensor-deployment|london": "120 low-cost sensors citywide",
    // Seeing — Data & Tech (Bogota open data)
    "d12-open-data|bogota": "20 reference-grade stations citywide",
    // Understanding — Source Analysis (Accra)
    "d2-source-apportionment|accra": "Transport + cookstoves identified as source",
    // Understanding — Health Impact (Paris UFP study)
    "d3-health-risk-assessment|paris": "33% fewer respiratory admissions",
    // Acting — Policy Design (Brussels)
    "d4-policy-timeline|brussels": "-42% PM2.5 since 2018",
    // Acting — Transport / Vehicle Restriction (Mexico City)
    "d5-vehicle-restriction|mexico-city": "-20% daily vehicles",
    // Acting — Clean Fuels (Johannesburg)
    "d6-clean-fuels|johannesburg": "1.2M homes electrified",
    // Acting — Green Infrastructure (Milan ForestaMi)
    "d7-green-infrastructure|milan": "3 million trees planted",
    // Enabling — Awareness (Bangkok)
    "d8-awareness|bangkok": "45% of residents now AQ-aware",
    // Enabling — Governance (Warsaw)
    "d9-governance|warsaw": "3 governance level coverage in 5 years",
    // Enabling — Funding (Warsaw)
    "d10-funding|warsaw": "PLN 2.1B unlocked for transition",
  };
  if (overrides[key]) return overrides[key];

  // Fallback to example.outcomeChange for unmapped cards.
  if (example.outcomeChange && example.outcomeChange.trim().length > 0) {
    return example.outcomeChange;
  }
  return null;
}

/**
 * isShortHero — whether the resolved hero string is "short enough" to display at full hero
 * scale (2.25rem) vs. needs to be stepped down to a medium scale because it's a sentence
 * rather than a tight number+noun. Heuristic: 28 chars or fewer = hero scale; longer =
 * stepped-down scale (still bold, but readable as a phrase).
 */
function isShortHero(outcome: string): boolean {
  return outcome.length <= 28;
}

/**
 * PracticeCardHero — outcome-first card layout for the roadmap overview grid.
 *
 * Layout (iteration 2):
 *   LEFT column (flex-col, top-aligned):
 *     Outcome hero → City name → Practice description → Population · year (mt-auto)
 *   RIGHT column (top-aligned):
 *     Chart viz
 *
 * BC brand pass 1 (2026-05-26) — applies the BC editorial visual language:
 *   - Card surface variant: 'light' (white card, navy hairline border) or 'dark' (Dark Blue
 *     surface, no border, white text). One dark card per stage row creates editorial rhythm.
 *   - Card radius bumped to 20px; shadcn's default rounded-lg overridden via inline style.
 *   - Card shadow flat — the hairline border carries the edge on light cards.
 *   - Outcome hero text: Söhne 900 weight (was bold/700). Dark blue on light, white on dark.
 *   - City name: BC Blue on light cards (was Dark Blue), Light Blue on dark cards.
 *   - Practice description: muted-navy 70% on light, muted-white 80% on dark.
 *   - Footer metadata: promoted to eyebrow treatment — uppercase tracking-wider 500 weight.
 *     Inherits currentColor at 60% so it adapts to variant automatically.
 *   - Chart container shell: rounded-2xl p-4 with inset background — BC Blue at 6% over
 *     white on light cards; white at 10% transparency on dark cards.
 *
 * When no clean composed hero exists, falls back to the practice-name-as-hero treatment
 * (intervention name promoted to large scale; chart still in right column). Both branches
 * honour the variant prop identically.
 */
export function PracticeCardHero({
  practice,
  example,
  variant = 'light',
}: PracticeCardHeroProps) {
  const city = getCityBySlug(example.citySlug);
  if (!city) return null;

  const outcome = composeHero(practice, example);
  const shortHero = outcome !== null && isShortHero(outcome);
  const isDark = variant === 'dark';

  /* Card surface treatment — variant-driven. Light: white background, navy hairline border,
   * radius 20px, flat (no shadow). Dark: Dark Blue background, no border, same radius and
   * flat. The shadcn Card primitive's default classes set a different radius and shadow;
   * inline style locks the BC brand treatment. */
  const cardStyle: CSSProperties = {
    borderRadius: '20px',
    border: isDark
      ? 'none'
      : '1px solid color-mix(in srgb, var(--bc-color-dark-blue) 10%, transparent)',
    backgroundColor: isDark
      ? 'var(--bc-color-dark-blue)'
      : 'var(--bc-color-white)',
    boxShadow: 'none',
  };

  /* Outcome hero text colour — navy on white, white on navy. Söhne 900 (Extrafett). */
  const outcomeColor = isDark
    ? 'var(--bc-color-white)'
    : 'var(--bc-color-dark-blue)';

  /* City name colour — BC Blue on light card (geographic identity anchor); Light Blue on
   * dark card so the city reads at equivalent hierarchy when the surface flips. */
  const cityColor = isDark
    ? 'var(--bc-color-light-blue)'
    : 'var(--bc-color-blue)';

  /* Practice description colour — muted-navy 70% on light, muted-white 80% on dark. */
  const descriptionColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 80%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 70%, transparent)';

  /* Country flag chip muted colour — adapts to variant so it stays legible against either
   * surface without competing with the city name. */
  const flagColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 50%, transparent)';

  /* Chart container shell — BC brand pass 1 §8.6. Light: BC Blue at 6% over white (gives the
   * chart its own quiet inset on a white card). Dark: white at 10% transparency (a subtle
   * lift on the navy surface). Radius bumped to rounded-2xl (was rounded-lg). minHeight stays
   * 160 so chart anchors the right column at a predictable size. */
  const chartContainerStyle: CSSProperties = {
    minHeight: 160,
    backgroundColor: isDark
      ? 'color-mix(in srgb, var(--bc-color-white) 10%, transparent)'
      : 'color-mix(in srgb, var(--bc-color-blue) 6%, var(--bc-color-white))',
    /* Chart `currentColor` resolution — sets the inherited foreground for SVG strokes/fills
     * in the chart dispatcher. On dark cards the chart inherits white so monochrome charts
     * remain legible; on light cards we keep the default cascade (dark blue from the card
     * surface). */
    color: isDark ? 'var(--bc-color-white)' : 'var(--bc-color-dark-blue)',
  };

  const chartBlock = example.chartData ? (
    <div
      className="rounded-2xl p-4 flex items-center justify-center"
      style={chartContainerStyle}
    >
      <div className="w-full">
        <ChartViz data={example.chartData} cityFlag={city.flag} />
      </div>
    </div>
  ) : null;

  /* Introduced-year string for the footer metadata row. Kept identical to PracticeCardTile's
   * treatment for content consistency. */
  const introducedStr =
    example.introducedYear === "ongoing"
      ? "ongoing"
      : `introduced ${example.introducedYear}`;

  /* Footer metadata block — population + year. BC brand pass 1: eyebrow treatment
   * (uppercase, tracking-wider, 500 weight). Inherits parent currentColor at 60% so the
   * row adapts to variant — readable on either white or navy surface without per-variant
   * tuning. mt-auto pins this row to the bottom of the left column. */
  const footerMeta = (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-3 mt-auto uppercase tracking-wider font-medium"
      style={{
        fontSize: '11px',
        color: 'color-mix(in srgb, currentColor 60%, transparent)',
      }}
    >
      <span>{city.populationLabel}</span>
      <span aria-hidden="true">&middot;</span>
      <span>{introducedStr}</span>
    </div>
  );

  /* Branch 1 — composed hero exists: render outcome → city → description → metadata in the
   * left column, chart in the right. */
  if (outcome !== null) {
    return (
      <Card style={cardStyle}>
        <CardContent className="p-6">
          {/* Two-column flex. md:items-stretch keeps both columns the same height so the
              metadata mt-auto can pin the population/year row to the bottom of the left
              column at the level of the chart bottom. */}
          <div className="flex flex-col md:flex-row md:items-stretch gap-5">
            {/* LEFT column — top-aligned content stack. flex-col with mt-auto on the
                metadata row produces: hero at top, metadata at bottom, city + description
                filling the middle. Outer color set so footerMeta's currentColor cascade
                resolves to the variant-correct base. */}
            <div
              className="flex-1 min-w-0 flex flex-col"
              style={{ color: outcomeColor }}
            >
              {/* Outcome hero — visually dominant, top of the left column. BC brand pass 1:
                  Söhne 900 weight (was bold/700) at variant-driven colour. */}
              <div
                className="tracking-tight leading-[1.05]"
                style={{
                  fontSize: shortHero ? "2.25rem" : "1.5rem",
                  lineHeight: shortHero ? 1.05 : 1.2,
                  fontWeight: 'var(--bc-font-weight-black)',
                  color: outcomeColor,
                }}
              >
                {outcome}
              </div>
              {/* City name — prominent supporting line beneath the hero. ~17px Söhne
                  Halbfett (600). BC brand pass 1: colour shifts BC Blue on light card,
                  Light Blue on dark card — geographic identity anchor. */}
              <div
                className="mt-2 text-[17px] font-semibold tracking-tight"
                style={{ color: cityColor }}
              >
                <span
                  className="text-[11px] font-medium mr-1.5 tracking-wider"
                  style={{ color: flagColor }}
                >
                  {city.flag}
                </span>
                {city.name}
              </div>
              {/* Practice description — quiet supporting line nested under the hero/city.
                  Reads as the programme name the outcome belongs to. BC brand pass 1:
                  variant-driven muted colour. */}
              <p
                className="mt-2 text-[13px] leading-snug"
                style={{ color: descriptionColor }}
              >
                {example.interventionName}
              </p>
              {footerMeta}
            </div>

            {/* RIGHT column — chart, top-aligned, fixed width on md+ */}
            {chartBlock && (
              <div className="md:w-[240px] flex-shrink-0 self-start">
                {chartBlock}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  /* Branch 2 — no-composed-hero fallback: promote the intervention name to hero scale.
   * Used by any cards that don't have a hand-tuned override and don't carry an outcomeChange
   * value (rare given the override coverage, but kept for safety). Honours variant identically. */
  return (
    <Card style={cardStyle}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-stretch gap-5">
          <div
            className="flex-1 min-w-0 flex flex-col"
            style={{ color: outcomeColor }}
          >
            <div
              className="text-xs uppercase tracking-wider font-medium"
              style={{ color: descriptionColor }}
            >
              {practice.name}
            </div>
            <div
              className="mt-2 tracking-tight leading-snug"
              style={{
                fontSize: "1.5rem",
                fontWeight: 'var(--bc-font-weight-black)',
                color: outcomeColor,
              }}
            >
              {example.interventionName}
            </div>
            <div
              className="mt-2 text-[17px] font-semibold tracking-tight"
              style={{ color: cityColor }}
            >
              <span
                className="text-[11px] font-medium mr-1.5 tracking-wider"
                style={{ color: flagColor }}
              >
                {city.flag}
              </span>
              {city.name}
            </div>
            {footerMeta}
          </div>
          {chartBlock && (
            <div className="md:w-[240px] flex-shrink-0 self-start">
              {chartBlock}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
