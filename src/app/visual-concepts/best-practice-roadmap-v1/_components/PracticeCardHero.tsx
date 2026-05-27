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
 *   city name sits as a prominent supporting line beneath it, and the introduced-year drops to
 *   quiet metadata at the foot of the card.
 *
 *   This component is consumed only on the v1 roadmap overview page (page.tsx). Detail pages
 *   continue to use PracticeCardTile so their behaviour is unchanged.
 *
 * BC brand pass 3 v2 (2026-05-27 — per brand-pass-3-v2 brief §4)
 *   This is the composition density refinement pass. Subtraction and confidence:
 *
 *   - HERO NUMBER hits HARD. Token swap from --bc-font-weight-black (900) → --bc-font-weight-medium
 *     (500, Söhne Kräftig — BC's actual headline weight). Token swap from hardcoded 2.25rem /
 *     1.5rem → var(--bc-font-size-title-large) which clamps 38px→84px responsively. No size
 *     branch for long hero — long values wrap to two lines and stay loud (BC pattern from
 *     "$147 billion in avoided hospitalisations" treatment on What We Do).
 *   - isShortHero() helper DELETED. Branch no longer needed.
 *   - DESCRIPTION removed from the hero card. <p>{example.interventionName}</p> deleted from
 *     both branches. Intervention name lives on city/[slug] drill-in only — in the card the
 *     data IS the story; policy mechanism is one click deeper.
 *   - POPULATION removed from metadata. Only `introduced YYYY` remains. Population competes
 *     with the hero for "the number that matters" — it belongs on the city drill-in.
 *   - CHART DEMOTED. Container width 240→180px, radius 16→12px, padding 16→10px,
 *     min-height 160→120px, light card bg 6%→4%, dark card bg 12%→8%. Reads as a sparkline
 *     accent rather than a co-hero.
 *   - CITY PHOTO sibling tile added. Right column becomes vertical stack: photo (top) → chart
 *     (bottom), gap-3. Square 180×180 with 16px radius, 1px navy-6% hairline on light, no
 *     border on dark. Sourced from _brand/graphics/cities/${slug}.png — already brand-colour
 *     duotones.
 *   - BANGKOK + BOGOTÁ fallback. Photo not yet shot for these two; render a flat
 *     regional-colour solid tile at the same dimensions (Asia-Pacific fuchsia for Bangkok,
 *     Latin America green for Bogotá). Placeholder is intentional — when the city photo PNG
 *     lands at the canonical path, just add the slug to CITIES_WITH_PHOTOS and the photo
 *     branch renders automatically.
 *   - cityRegion prop REMOVED. REGION_COLOR + resolveRegionColor() helpers DELETED.
 *     borderTop regional accent dropped — it was a vestigial signifier between
 *     navigation-tile saturated-fill (BC pattern) and our data-card hairline.
 *
 * Iteration 2 (2026-05-26) layout — preserved.
 *   Two columns inside the card, both top-aligned:
 *     LEFT column [Outcome hero → City name → introduced YYYY]
 *     RIGHT column [Photo (180×180) → Chart (180×~120)]
 *
 * Pass 2 (2026-05-27) surface treatment — preserved.
 *   - Card radius 24px, light card box shadow, hover lift on light cards (translate-y -2px,
 *     shadow grows to 4px), dark variant is BC Blue (not navy).
 *
 * Hover state — preserved.
 *   Hover tracked in component state (useState) — swaps shadow + transform inline.
 *   Acceptable on a page with low card count (11 max).
 *
 * Hero composition — preserved.
 *   composeHero() takes the practice + example and returns a hero string. Hand-tuned overrides
 *   per practice-id × city-slug; falls back to example.outcomeChange. No edits to roadmap-data.ts.
 *
 * Key exports: PracticeCardHero (named), CITIES_WITH_PHOTOS (Set)
 * External dependencies: shadcn Card, next/image, @/data/roadmap-data lookup helpers, sibling
 *   PracticeCardView (re-uses ChartViz dispatcher).
 */

'use client'

import { useState, type CSSProperties } from 'react'
import Image, { type StaticImageData } from 'next/image'
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

// Static asset imports — Next.js resolves these to optimised public paths.
// 12 city photos already staged and brand-colour-duotone-treated at 315×400 native.
// Bangkok + Bogotá: photo assets pending; rendered via regional-colour fallback tile (see below).
import accraPhoto from '../_brand/graphics/cities/accra.png'
import brusselsPhoto from '../_brand/graphics/cities/brussels.png'
import jakartaPhoto from '../_brand/graphics/cities/jakarta.png'
import johannesburgPhoto from '../_brand/graphics/cities/johannesburg.png'
import londonPhoto from '../_brand/graphics/cities/london.png'
import mexicoCityPhoto from '../_brand/graphics/cities/mexico-city.png'
import milanPhoto from '../_brand/graphics/cities/milan.png'
import nairobiPhoto from '../_brand/graphics/cities/nairobi.png'
import parisPhoto from '../_brand/graphics/cities/paris.png'
import rioPhoto from '../_brand/graphics/cities/rio-de-janeiro.png'
import sofiaPhoto from '../_brand/graphics/cities/sofia.png'
import warsawPhoto from '../_brand/graphics/cities/warsaw.png'

/**
 * CITY_PHOTOS — slug → imported StaticImageData. Acts as the existence check for the photo
 * branch: a slug present here renders the photo tile, a slug absent renders the
 * regional-colour fallback. When Bangkok or Bogotá photos land at
 * `_brand/graphics/cities/{slug}.png`, import the asset and add the entry here — the
 * photo branch will pick it up automatically.
 */
const CITY_PHOTOS: Record<string, StaticImageData> = {
  accra: accraPhoto,
  brussels: brusselsPhoto,
  jakarta: jakartaPhoto,
  johannesburg: johannesburgPhoto,
  london: londonPhoto,
  'mexico-city': mexicoCityPhoto,
  milan: milanPhoto,
  nairobi: nairobiPhoto,
  paris: parisPhoto,
  'rio-de-janeiro': rioPhoto,
  sofia: sofiaPhoto,
  warsaw: warsawPhoto,
}

/**
 * FALLBACK_TILE_COLOR — slug → BC regional-colour token for cities without staged photos.
 * Bangkok (Asia-Pacific) and Bogotá (Latin America). Flat solid square reads as "place
 * placeholder, not yet illustrated" — visually consistent with the photo tiles in shape and
 * dimensions. When a photo for either lands, add to CITY_PHOTOS above; no need to remove
 * from here (CITY_PHOTOS takes priority in the resolver below).
 */
const FALLBACK_TILE_COLOR: Record<string, string> = {
  bangkok: 'var(--bc-color-region-asia-pacific)',
  bogota: 'var(--bc-color-region-latin-america)',
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
 * PracticeCardHero — outcome-first card layout for the roadmap overview grid. Pass 3 v2
 * applies BC's data-as-hero asymmetry: hero number HITS at title-large Kräftig 500, chart
 * demotes to a quiet sparkline-ish accent, a square city-landmark photo sits as sibling tile
 * above the chart in the right column, description drops to drill-in, metadata strips to
 * introduced-year only.
 */
export function PracticeCardHero({
  practice,
  example,
  variant = 'light',
}: PracticeCardHeroProps) {
  const city = getCityBySlug(example.citySlug);
  if (!city) return null;

  const outcome = composeHero(practice, example);
  const isDark = variant === 'dark';

  // Side effect: hover state stored in component memory so lift effect can swap shadow + transform.
  const [hovered, setHovered] = useState(false);

  /* Card surface treatment — pass 2 spec preserved.
   *  Light: white BG, 8% navy hairline, radius 24px, subtle 1px shadow at rest, lifts to 4px
   *         shadow + translate-y -2px on hover.
   *  Dark:  BC Blue BG, no border, radius 24px, no shadow, gentle BG-lift on hover.
   *  No regional top-border accent (pass 3 v2 §4.5 — REGION_COLOR + resolveRegionColor removed). */
  const cardStyle: CSSProperties = {
    borderRadius: '24px',
    border: isDark
      ? 'none'
      : '1px solid color-mix(in srgb, var(--bc-color-dark-blue) 8%, transparent)',
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

  /* Outcome hero text colour — navy on white, white on BC Blue. */
  const outcomeColor = isDark
    ? 'var(--bc-color-white)'
    : 'var(--bc-color-dark-blue)';

  /* City name colour — BC Blue on light card; white at 95% on dark card. */
  const cityColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 95%, transparent)'
    : 'var(--bc-color-blue)';

  /* Practice eyebrow colour (Branch 2 only) — muted-navy 70% on light, muted-white 85% on dark. */
  const descriptionColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 85%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 70%, transparent)';

  /* Country flag chip muted colour — adapts to variant so it stays legible against either
   * surface without competing with the city name. */
  const flagColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 50%, transparent)';

  /* Chart container shell — pass 3 v2 §4.2 demotion: rounded-xl (12px), p-2.5 (10px),
   * min-height 120, BG 4% (light) / 8% (dark). Reads as a quiet sparkline accent, not a co-hero. */
  const chartContainerStyle: CSSProperties = {
    minHeight: 120,
    backgroundColor: isDark
      ? 'color-mix(in srgb, var(--bc-color-white) 8%, transparent)'
      : 'color-mix(in srgb, var(--bc-color-blue) 4%, var(--bc-color-white))',
    /* Chart `currentColor` resolution — sets the inherited foreground for SVG strokes/fills
     * in the chart dispatcher. Dark cards inherit white; light cards inherit dark blue. */
    color: isDark ? 'var(--bc-color-white)' : 'var(--bc-color-dark-blue)',
  };

  const chartBlock = example.chartData ? (
    <div
      className="rounded-xl p-2.5 flex items-center justify-center"
      style={chartContainerStyle}
    >
      <div className="w-full">
        {/* compactMode signals the dispatcher to render the sparkline-ish low-density variant.
         * Container demotion (width/padding/min-h above) does most of the visual work; the
         * prop is a forward-compatible hook for per-chart axis/legend suppression. */}
        <ChartViz data={example.chartData} cityFlag={city.flag} compactMode />
      </div>
    </div>
  ) : null;

  /* City photo (sibling tile) — pass 3 v2 §4.5. Square 180×180 above the chart in the right
   * column. Resolves to one of:
   *   - CITY_PHOTOS[slug]   → next/image render of the brand-colour-duotone PNG.
   *   - FALLBACK_TILE_COLOR[slug] → flat regional-colour solid square.
   *   - neither             → no tile rendered (graceful degrade; chart stays).
   * The brand-colour duotone is the place signal; no additional opacity / blend mode.
   * Light cards get a 1px navy-6% hairline; dark cards none (photo sits flush against BC Blue). */
  const photoSrc = CITY_PHOTOS[example.citySlug];
  const fallbackColor = FALLBACK_TILE_COLOR[example.citySlug];

  const photoTile = photoSrc ? (
    <div
      className="relative aspect-square w-full overflow-hidden"
      style={{
        borderRadius: '16px',
        border: isDark
          ? 'none'
          : '1px solid color-mix(in srgb, var(--bc-color-dark-blue) 6%, transparent)',
      }}
    >
      <Image
        src={photoSrc}
        alt={`${city.name} city landmark`}
        fill
        sizes="(min-width: 768px) 180px, 140px"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        unoptimized
      />
    </div>
  ) : fallbackColor ? (
    <div
      className="aspect-square w-full"
      style={{
        backgroundColor: fallbackColor,
        borderRadius: '16px',
        border: isDark
          ? 'none'
          : '1px solid color-mix(in srgb, var(--bc-color-dark-blue) 6%, transparent)',
      }}
      aria-label={`${city.name} (illustration pending)`}
      role="img"
    />
  ) : null;

  /* Introduced-year string for the footer metadata row. Pass 3 v2 §4.4 — population removed,
   * only year remains. */
  const introducedStr =
    example.introducedYear === "ongoing"
      ? "ongoing"
      : `introduced ${example.introducedYear}`;

  /* Footer metadata block — introduced year only. Eyebrow treatment (uppercase, tracking-wider,
   * 500 weight, currentColor at 60%). mt-auto pins to bottom. */
  const footerMeta = (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-3 mt-auto uppercase tracking-wider font-medium"
      style={{
        fontSize: '11px',
        color: 'color-mix(in srgb, currentColor 60%, transparent)',
      }}
    >
      <span>{introducedStr}</span>
    </div>
  );

  /* Wrapper props — hover handlers shared by both branches. Both branches use Card with the
   * full pass-2 surface treatment and a p-7 inner padding. */
  const cardWrapperProps = {
    style: cardStyle,
    // Side effect: hover state mutates inline style via React re-render.
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  };

  /* Right-column stack: photo (top) → chart (bottom), gap-3. Single flex column.
   * If neither photo nor chart exists, the wrapper renders nothing (md:w-[180px] suppresses
   * a phantom column). On mobile the column stacks below the text block; on desktop it sits
   * side-by-side at 180px width.
   *
   * Mobile (below md): if both photo and chart exist, an inner 2-col grid keeps them
   * side-by-side at full card width to avoid the right column doubling page height. */
  const rightColumn = (photoTile || chartBlock) ? (
    <div className="md:w-[180px] flex-shrink-0 self-start w-full">
      <div className="hidden md:flex flex-col gap-3">
        {photoTile}
        {chartBlock}
      </div>
      <div className="md:hidden grid grid-cols-2 gap-3">
        {photoTile}
        {chartBlock}
      </div>
    </div>
  ) : null;

  /* Branch 1 — composed hero exists: outcome → city → metadata, with photo+chart sibling. */
  if (outcome !== null) {
    return (
      <Card {...cardWrapperProps}>
        <CardContent className="p-7">
          <div className="flex flex-col md:flex-row md:items-stretch gap-5">
            <div
              className="flex-1 min-w-0 flex flex-col"
              style={{ color: outcomeColor }}
            >
              {/* Pass 3 v2 §4.1 — hero number HITS. title-large clamps 38→84px; Söhne Kräftig
               * 500 (BC's actual headline weight; was Extrafett 900 — wrong for BC). Long
               * values wrap to two lines and stay loud. */}
              <div
                style={{
                  fontSize: 'var(--bc-font-size-title-large)',
                  lineHeight: 'var(--bc-line-height-title-large)',
                  fontWeight: 'var(--bc-font-weight-medium)',
                  letterSpacing: '-0.025em',
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
              {footerMeta}
            </div>

            {rightColumn}
          </div>
        </CardContent>
      </Card>
    );
  }

  /* Branch 2 — no-composed-hero fallback: promote intervention name to hero scale.
   * Same right-column treatment (photo + chart) for visual consistency across all 11 featured
   * cards on the overview. */
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
            {/* Branch 2 keeps intervention-name-as-hero at a medium-large step (this branch
             * is a rare authoring fallback — most cards have composed-hero overrides). */}
            <div
              className="mt-2 tracking-tight leading-snug"
              style={{
                fontSize: 'var(--bc-font-size-title-medium)',
                fontWeight: 'var(--bc-font-weight-medium)',
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
          {rightColumn}
        </div>
      </CardContent>
    </Card>
  );
}
