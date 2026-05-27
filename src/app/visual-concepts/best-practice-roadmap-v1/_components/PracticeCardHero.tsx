/**
 * PracticeCardHero.tsx — outcome-as-hero card variant for the roadmap overview grid.
 *
 * Fork origin: clean fork of src/app/ux-concepts/best-practice-roadmap-v2/_components/
 *   PracticeCardHero.tsx (commit 09839c6 / tag wireframe-lock-2026-05-26). Forked so visual
 *   evolution stays isolated from the wireframe-locked UX concept.
 *
 * Purpose
 *   Sibling of PracticeCardTile. Where PracticeCardTile renders city + practice name as the
 *   dominant typography, PracticeCardHero inverts the hierarchy: the outcome (a self-contained
 *   metric sentence like "-42% PM2.5 since 2018") becomes the visually dominant element, the
 *   city name sits as a prominent supporting line beneath it, and the practice description +
 *   population + introduced-year drop to quiet metadata at the foot of the card.
 *
 *   This component is consumed only on the v1 roadmap overview page (page.tsx). Detail pages
 *   continue to use PracticeCardTile so their behaviour is unchanged.
 *
 * Iteration 2 (2026-05-26) layout — see workflow log roadmap-v2-jack-fixes-2026-05-26.md.
 *   Two columns inside the card, both top-aligned:
 *     LEFT column [Outcome hero → City name → Practice description → Population · year]
 *     RIGHT column [Chart viz]
 *
 * BC brand pass 1 (2026-05-26)
 *   - Card surface variant: 'light' (white, navy hairline) or 'dark' (Dark Blue, white text).
 *   - Card radius 20px, shadcn rounded-lg overridden via inline style.
 *   - Outcome hero text Söhne 900; city name BC Blue on light / Light Blue on dark.
 *   - Chart container shell rounded-2xl p-4 with inset BG (BC Blue 6% over white on light,
 *     white 10% on dark).
 *
 * BC brand pass 2 (2026-05-27 — per brand-pass-2 brief §6)
 *   - Card radius bumped to 24px (was 20px) — live-site cards are softer.
 *   - Border 8% (was 10%) — quieter hairline on light.
 *   - Box shadow added on light variant (0 1px 3px at 6% navy).
 *   - Dark variant background flipped from --bc-color-dark-blue to --bc-color-blue — dark cards
 *     are now the BC anchor blue, not navy. THIS IS THE KEY VISUAL CHANGE that ties the card
 *     surface to the live-site BC Blue brand presence.
 *   - Hover lift on light cards: shadow grows to 4px at 12% blue, translate-y -2px,
 *     transition-all 200ms.
 *   - Dark variant city name: white at 95% (was Light Blue) — Light Blue on BC Blue surface is
 *     too close in chroma; pure white reads cleaner.
 *   - Dark variant chart container: white at 12% (was 10%) — slight lift to keep the chart
 *     panel distinct on the new BC Blue surface.
 *   - Padding bumped to p-7 (was p-6) per brief table.
 *   - Optional regional-colour top border (4px) — driven by `cityRegion` prop. Renders as
 *     `border-top: 4px solid var(--bc-region-color)` with `--bc-region-color` set inline at
 *     card scope from the city's region. Quiet identity marker per brief §6 final note.
 *
 * Hover state implementation
 *   Hover is tracked in component state (useState) so the lift effect can swap shadow + transform
 *   inline. React state hover is acceptable on a content page with low card count (11 max).
 *
 * Hero composition (composeHero)
 *   composeHero() takes the practice + example and returns a hero string that reads as a
 *   complete sentence. Hand-tuned overrides per practice-id × city-slug; falls back to
 *   example.outcomeChange. No edits to roadmap-data.ts.
 *
 * Key exports: PracticeCardHero (named)
 * External dependencies: shadcn Card, @/data/roadmap-data lookup helpers, sibling
 *   PracticeCardView (re-uses ChartViz dispatcher).
 */

'use client'

import { useState, type CSSProperties } from 'react'
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

/** Region → BC regional-colour token map. Used to drive the optional 4px top border per
 *  brand-pass-2 brief §6 (final note). Africa uses the bespoke teal; Europe → tangerine;
 *  Asia → fuchsia (BC's asia-pacific region); Latin America → rich green.  */
const REGION_COLOR: Record<string, string> = {
  'Africa': 'var(--bc-color-region-africa)',
  'Europe': 'var(--bc-color-region-europe)',
  'Asia': 'var(--bc-color-region-asia-pacific)',
  'Asia-Pacific': 'var(--bc-color-region-asia-pacific)',
  'Latin America': 'var(--bc-color-region-latin-america)',
}

/** Resolve a region string to its BC regional colour token; falls back to BC Blue. */
function resolveRegionColor(region: string | undefined): string {
  if (region && REGION_COLOR[region]) return REGION_COLOR[region]
  return 'var(--bc-color-blue)'
}

/** Props for PracticeCardHero. Mirrors the subset of PracticeCardTile props this variant needs. */
interface PracticeCardHeroProps {
  /** The practice this card belongs to — used to render its name as the supporting line. */
  practice: PracticeCard;
  /** The single city example to showcase. */
  example: CityExample;
  /**
   * BC brand pass 1 — card surface variant.
   *   'light' (default) — white background, navy hairline border, dark-blue text, BC Blue
   *     city name. Most cards on the page render light.
   *   'dark' — BC Blue surface (pass 2: was Dark Blue), no border, white text, white-95% city
   *     name. Used for one featured card per stage row to create mixed editorial rhythm.
   */
  variant?: 'light' | 'dark';
  /**
   * BC brand pass 2 — optional `cityRegion` for the 4px regional-colour top border per
   *   brief §6 final note. Quiet identity marker. When omitted, no regional border is drawn.
   *   Pass via `card.region` resolved from the city.
   */
  cityRegion?: string;
}

/**
 * composeHero — returns a self-contained hero string for the featured card.
 *
 * Strategy (priority order):
 *   1. Hand-tuned override keyed by `practice.id` + `example.citySlug` — 11 entries cover
 *      every FEATURED card on the overview surface.
 *   2. Fallback to `example.outcomeChange`.
 *   3. Final fallback: null (caller renders the practice-name-as-hero treatment).
 *
 * Overrides intentionally inline (not in roadmap-data.ts) — the data file is shared with
 * other surfaces and we don't want overview-only editorial choices to leak.
 */
function composeHero(practice: PracticeCard, example: CityExample): string | null {
  const key = `${practice.id}|${example.citySlug}`;
  const overrides: Record<string, string> = {
    "d1-sensor-deployment|london": "120 low-cost sensors citywide",
    "d12-open-data|bogota": "20 reference-grade stations citywide",
    "d2-source-apportionment|accra": "Transport + cookstoves identified as source",
    "d3-health-risk-assessment|paris": "33% fewer respiratory admissions",
    "d4-policy-timeline|brussels": "-42% PM2.5 since 2018",
    "d5-vehicle-restriction|mexico-city": "-20% daily vehicles",
    "d6-clean-fuels|johannesburg": "1.2M homes electrified",
    "d7-green-infrastructure|milan": "3 million trees planted",
    "d8-awareness|bangkok": "45% of residents now AQ-aware",
    "d9-governance|warsaw": "3 governance level coverage in 5 years",
    "d10-funding|warsaw": "PLN 2.1B unlocked for transition",
  };
  if (overrides[key]) return overrides[key];
  if (example.outcomeChange && example.outcomeChange.trim().length > 0) {
    return example.outcomeChange;
  }
  return null;
}

/**
 * isShortHero — whether the resolved hero string is "short enough" to display at full hero
 * scale (2.25rem) vs. needs to be stepped down to a medium scale (1.5rem). Heuristic: 28
 * chars or fewer = hero scale; longer = stepped-down phrase scale.
 */
function isShortHero(outcome: string): boolean {
  return outcome.length <= 28;
}

/**
 * PracticeCardHero — outcome-first card layout for the roadmap overview grid. Pass 2 evolves
 * the card toward BC live-site fidelity: 24px radius, BC Blue (not navy) for dark variant,
 * hover lift, optional regional-colour top border.
 */
export function PracticeCardHero({
  practice,
  example,
  variant = 'light',
  cityRegion,
}: PracticeCardHeroProps) {
  const city = getCityBySlug(example.citySlug);
  if (!city) return null;

  const outcome = composeHero(practice, example);
  const shortHero = outcome !== null && isShortHero(outcome);
  const isDark = variant === 'dark';
  const regionColor = resolveRegionColor(cityRegion ?? city.region);

  // Side effect: hover state stored in component memory so lift effect can swap shadow + transform.
  const [hovered, setHovered] = useState(false);

  /* Card surface treatment — pass 2 spec per brief §6 table.
   *  Light: white BG, 8% navy hairline (was 10%), radius 24px (was 20px), subtle 1px shadow
   *         at rest, lifts to 4px shadow + translate-y -2px on hover.
   *  Dark:  BC Blue BG (was --bc-color-dark-blue), no border, radius 24px, no shadow, gentle
   *         BG-lift on hover (mix in 4% white).
   *  Both: optional 4px top border in city regional colour (when cityRegion supplied).
   */
  const cardStyle: CSSProperties = {
    borderRadius: '24px',
    border: isDark
      ? 'none'
      : '1px solid color-mix(in srgb, var(--bc-color-dark-blue) 8%, transparent)',
    borderTop: cityRegion !== undefined
      ? `4px solid ${regionColor}`
      : undefined,
    backgroundColor: isDark
      ? hovered
        ? 'color-mix(in srgb, var(--bc-color-blue) 96%, var(--bc-color-white))'
        : 'var(--bc-color-blue)'
      : 'var(--bc-color-white)',
    boxShadow: isDark
      ? 'none'
      : hovered
        ? '0 4px 16px color-mix(in srgb, var(--bc-color-blue) 12%, transparent)'
        : '0 1px 3px color-mix(in srgb, var(--bc-color-dark-blue) 6%, transparent)',
    transform: !isDark && hovered ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease',
  };

  /* Outcome hero text colour — navy on white, white on BC Blue. Söhne 900 (Extrafett). */
  const outcomeColor = isDark
    ? 'var(--bc-color-white)'
    : 'var(--bc-color-dark-blue)';

  /* City name colour — BC Blue on light card; white at 95% on dark card (pass 2 — was Light
   * Blue, which sat too close to BC Blue chroma to read). */
  const cityColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 95%, transparent)'
    : 'var(--bc-color-blue)';

  /* Practice description colour — muted-navy 70% on light, muted-white 85% on dark (pass 2:
   * was 80%, bumped for the lighter BC Blue surface). */
  const descriptionColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 85%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 70%, transparent)';

  /* Country flag chip muted colour — adapts to variant so it stays legible against either
   * surface without competing with the city name. */
  const flagColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 50%, transparent)';

  /* Chart container shell — pass 2 §6: 24px-card matches 16px-chart-container (rounded-2xl).
   *  Light: BC Blue at 6% over white (unchanged from pass 1).
   *  Dark: white at 12% transparency (pass 2 — was 10%; slightly more lift on BC Blue ground). */
  const chartContainerStyle: CSSProperties = {
    minHeight: 160,
    backgroundColor: isDark
      ? 'color-mix(in srgb, var(--bc-color-white) 12%, transparent)'
      : 'color-mix(in srgb, var(--bc-color-blue) 6%, var(--bc-color-white))',
    /* Chart `currentColor` resolution — sets the inherited foreground for SVG strokes/fills
     * in the chart dispatcher. Dark cards inherit white; light cards inherit dark blue. */
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

  /* Introduced-year string for the footer metadata row. */
  const introducedStr =
    example.introducedYear === "ongoing"
      ? "ongoing"
      : `introduced ${example.introducedYear}`;

  /* Footer metadata block — population + year. Eyebrow treatment (uppercase, tracking-wider,
   * 500 weight, currentColor at 60%) — adapts to variant automatically. mt-auto pins to bottom. */
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

  /* Wrapper props — hover handlers shared by both branches. Both branches use Card with the
   * full pass-2 surface treatment and a p-7 inner padding (was p-6). */
  const cardWrapperProps = {
    style: cardStyle,
    // Side effect: hover state mutates inline style via React re-render.
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  };

  /* Branch 1 — composed hero exists: outcome → city → description → metadata. */
  if (outcome !== null) {
    return (
      <Card {...cardWrapperProps}>
        <CardContent className="p-7">
          <div className="flex flex-col md:flex-row md:items-stretch gap-5">
            <div
              className="flex-1 min-w-0 flex flex-col"
              style={{ color: outcomeColor }}
            >
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
              <p
                className="mt-2 text-[13px] leading-snug"
                style={{ color: descriptionColor }}
              >
                {example.interventionName}
              </p>
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

  /* Branch 2 — no-composed-hero fallback: promote intervention name to hero scale. */
  return (
    <Card {...cardWrapperProps}>
      <CardContent className="p-7">
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
