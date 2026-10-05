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
 * Pass 4 (2026-05-27 — five-item bundle, card template restructure per pass-4 brief item 4)
 *   Two-zone composition replacing pass 3 v2's sibling-tile + chart-stack pattern. Cleaner,
 *   image-first surface treatment per Jack's hand sketch:
 *
 *   - FULL-CARD CITY IMAGE BACKGROUND. The city PNG fills the entire card surface at
 *     opacity 0.20 (judgment call — "subtle but identifies the city"). Renders inside an
 *     absolutely-positioned wrapper layer behind the content. object-fit: cover so the
 *     image fills the card.
 *   - TWO ZONES inside the card. Top-left text block (title, flag+city, introduced YYYY)
 *     anchored to top-left; bottom-right chart block anchored to bottom-right. Implemented
 *     via flex column with a top sub-zone (text) and a bottom sub-zone (right-aligned chart).
 *   - NO SIBLING TILE. The 180x180 photo square next to the chart from pass 3 v2 is removed —
 *     the full-card background absorbs the place signal.
 *   - NO LIGHT/DARK VARIANT ALTERNATION. All cards now render with white card surface +
 *     subtle city-image overlay. The visual rhythm comes from the different city images
 *     themselves, not BC Blue alternation. `variant` prop is preserved in the signature for
 *     backward compatibility with the page.tsx call site but is currently a no-op (kept for
 *     potential pass-5 re-introduction).
 *   - BANGKOK + BOGOTÁ FALLBACK. No photos staged for either; their cards render with a
 *     regional-colour solid background (Asia-Pacific fuchsia for Bangkok, Latin America rich
 *     green for Bogotá) instead of the white card + image overlay. Text on those cards
 *     switches to white (rather than dark blue) for legibility on the saturated regional
 *     colour; the chart container inside also flips to a navy-on-image-tile treatment to keep
 *     the data readable on the coloured surface.
 *   - CARD RADIUS preserved at 24px from pass 3 v2.
 *   - REGIONAL TOP BORDER (4px) — not introduced; not in sketch.
 *   - HOVER LIFT preserved from pass 3 v2 (translateY -2px + shadow expand).
 *
 *   The chart dispatcher inside the chart block stays unchanged from pass 3 v2 — same
 *   compactMode prop, same per-chart dispatch via ChartViz. Chart container is sized to fit
 *   the bottom-right block (180px wide).
 *
 * Iteration 2 (2026-05-26) layout — replaced by pass 4 two-zone composition.
 * Pass 2 (2026-05-27) surface treatment — partial carry: hover lift + 24px radius preserved.
 *
 * Hover state — preserved. Hover tracked in component state (useState); swaps shadow +
 *   transform inline. Acceptable on a page with low card count (11 max).
 *
 * Hero composition — preserved. composeHero() takes the practice + example and returns a
 *   hero string. Hand-tuned overrides per practice-id × city-slug; falls back to
 *   example.outcomeChange. No edits to roadmap-data.ts.
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
// 12 city photos already staged and brand-colour-duotone-treated at 315×400 native. Per pass 4
// they now render as full-card background overlays (at opacity 0.20) instead of as 180×180
// sibling tiles. Bangkok + Bogotá: photo assets pending; rendered via regional-colour fallback
// background (see FALLBACK_BG_COLOR below).
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
 * branch: a slug present here renders the photo as a full-card background overlay; a slug
 * absent renders the regional-colour fallback background. When Bangkok or Bogotá photos land
 * at `_brand/graphics/cities/{slug}.png`, import the asset and add the entry here — the
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
 * FALLBACK_BG_COLOR — slug → BC regional-colour token for cities without staged photos.
 * Bangkok (Asia-Pacific fuchsia) and Bogotá (Latin America rich green). Used as the entire
 * card background; text + chart switch to a white-on-regional treatment for legibility. When
 * a photo for either lands, add to CITY_PHOTOS above and the regional fallback stops applying
 * (CITY_PHOTOS takes priority in the resolver below).
 */
const FALLBACK_BG_COLOR: Record<string, string> = {
  bangkok: 'var(--bc-color-region-asia-pacific)',
  bogota: 'var(--bc-color-region-latin-america)',
}

/** Opacity applied to the full-card city image background. Tuned to "subtle but identifies
 *  the city" — high enough that the place silhouette reads, low enough that text and chart
 *  stay dominant. */
const CITY_IMAGE_OPACITY = 0.2

/** Props for PracticeCardHero. Mirrors the subset of PracticeCardTile props this variant needs. */
interface PracticeCardHeroProps {
  /** The practice this card belongs to — used to render its name as the supporting line. */
  practice: PracticeCard;
  /** The single city example to showcase. */
  example: CityExample;
  /**
   * Card surface variant. Pass 4 (2026-05-27): preserved in the prop signature for backward
   * compatibility with page.tsx, but currently a no-op — the new full-card-image template
   * uses one uniform surface for cities with photos (white + image overlay) and a regional
   * solid for the two fallback cities. Variant may be re-activated in a future pass.
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
 * PracticeCardHero — pass 4 two-zone card template. The card surface is a relatively-positioned
 * shell with a city-image background overlay (or regional-colour fallback for Bangkok/Bogotá).
 * Above the overlay sit two content zones: top-left text block (hero outcome + flag/city +
 * introduced-year metadata) and bottom-right chart block (existing ChartViz dispatcher in a
 * compact container).
 */
export function PracticeCardHero({
  practice,
  example,
}: PracticeCardHeroProps) {
  const city = getCityBySlug(example.citySlug);
  if (!city) return null;

  const outcome = composeHero(practice, example);

  // Side effect: hover state stored in component memory so lift effect can swap shadow + transform.
  const [hovered, setHovered] = useState(false);

  // Resolve the surface treatment. Three branches:
  //   1. Photo branch — white card surface, city image overlay at opacity 0.20, dark-blue text,
  //      navy-tinted chart container.
  //   2. Regional-colour fallback (Bangkok / Bogotá) — saturated regional-colour surface, white
  //      text, white-tinted chart container.
  //   3. No photo, no fallback — falls back to plain white surface (graceful degrade).
  const photoSrc = CITY_PHOTOS[example.citySlug];
  const fallbackBg = FALLBACK_BG_COLOR[example.citySlug];
  const isRegionalFallback = !photoSrc && Boolean(fallbackBg);

  /* Card surface treatment. Radius 24px, white BG by default; regional fallback overrides BG.
   *  Subtle 1px shadow at rest, lifts to 4px shadow + translate-y -2px on hover. */
  const cardStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '24px',
    border: isRegionalFallback
      ? 'none'
      : '1px solid color-mix(in srgb, var(--bc-color-dark-blue) 8%, transparent)',
    backgroundColor: isRegionalFallback
      ? fallbackBg
      : 'var(--bc-color-white)',
    boxShadow: hovered
      ? '0 4px 16px color-mix(in srgb, var(--bc-color-blue) 12%, transparent)'
      : '0 1px 3px color-mix(in srgb, var(--bc-color-dark-blue) 6%, transparent)',
    transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'transform 200ms ease, box-shadow 200ms ease',
  };

  /* Text colours per branch. Regional fallback uses white text; photo branch uses dark blue. */
  const outcomeColor = isRegionalFallback
    ? 'var(--bc-color-white)'
    : 'var(--bc-color-dark-blue)';
  const cityColor = isRegionalFallback
    ? 'color-mix(in srgb, var(--bc-color-white) 95%, transparent)'
    : 'var(--bc-color-blue)';
  const flagColor = isRegionalFallback
    ? 'color-mix(in srgb, var(--bc-color-white) 70%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 50%, transparent)';
  const descriptionColor = isRegionalFallback
    ? 'color-mix(in srgb, var(--bc-color-white) 85%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 70%, transparent)';

  /* Chart container shell — sits in the bottom-right block. Wider on regional fallback
   *  branch (white-on-saturated) and tighter alpha on the photo branch. */
  const chartContainerStyle: CSSProperties = {
    minHeight: 120,
    backgroundColor: isRegionalFallback
      ? 'color-mix(in srgb, var(--bc-color-white) 12%, transparent)'
      : 'color-mix(in srgb, var(--bc-color-blue) 4%, var(--bc-color-white))',
    /* Chart `currentColor` resolution — sets the inherited foreground for SVG strokes/fills
     * in the chart dispatcher. Regional fallback inherits white; photo branch inherits dark blue. */
    color: isRegionalFallback
      ? 'var(--bc-color-white)'
      : 'var(--bc-color-dark-blue)',
  };

  const chartBlock = example.chartData ? (
    <div
      className="rounded-xl p-2.5 flex items-center justify-center"
      style={chartContainerStyle}
    >
      <div className="w-full">
        {/* compactMode signals the dispatcher to render the sparkline-ish low-density variant. */}
        <ChartViz data={example.chartData} cityFlag={city.flag} compactMode />
      </div>
    </div>
  ) : null;

  /* Introduced-year string for the footer metadata row. Population removed in pass 3 v2 §4.4. */
  const introducedStr =
    example.introducedYear === "ongoing"
      ? "ongoing"
      : `introduced ${example.introducedYear}`;

  /* Footer metadata block — introduced year only. Eyebrow treatment (uppercase, tracking-wider,
   * 500 weight, currentColor at 60%). */
  const footerMeta = (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-3 uppercase tracking-wider font-medium"
      style={{
        fontSize: '11px',
        color: 'color-mix(in srgb, currentColor 60%, transparent)',
      }}
    >
      <span>{introducedStr}</span>
    </div>
  );

  /* Wrapper props — hover handlers shared by both branches. */
  const cardWrapperProps = {
    style: cardStyle,
    // Side effect: hover state mutates inline style via React re-render.
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  };

  /* Full-card city-image background overlay — sits behind the content layers. opacity 0.20
   *  "subtle but identifies the city". Only renders on the photo branch. */
  const imageOverlay = photoSrc ? (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: CITY_IMAGE_OPACITY }}
    >
      <Image
        src={photoSrc}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        unoptimized
      />
    </div>
  ) : null;

  /* Top-left text block — the title, flag+city, introduced YYYY stacked vertically.
   * Anchored to top-left via the parent flex layout. */
  const topLeftBlock = (
    <div
      className="flex flex-col"
      style={{ color: outcomeColor }}
    >
      {outcome !== null ? (
        // Branch 1: composed hero string. Title at title-large Söhne Kräftig 500.
        <>
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
        </>
      ) : (
        // Branch 2 fallback: practice eyebrow + intervention name as hero.
        <>
          <div
            className="text-xs uppercase tracking-wider font-medium"
            style={{ color: descriptionColor }}
          >
            {practice.name}
          </div>
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
        </>
      )}
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
  );

  /* Bottom-right chart block — anchored to bottom-right by parent's flex justify-end + margin
   *  on the wrapper. Renders nothing if the example carries no chartData (defensive — most
   *  examples do). */
  const bottomRightBlock = chartBlock ? (
    <div className="self-end ml-auto" style={{ width: '180px', maxWidth: '100%' }}>
      {chartBlock}
    </div>
  ) : null;

  return (
    <Card {...cardWrapperProps}>
      {/* Image overlay layer — absolutely positioned behind content. Photo branch only. */}
      {imageOverlay}

      {/* Content layer — relatively positioned above the overlay. The two-zone layout uses a
       *  vertical flex with the text block at top and chart block at bottom-right; min-height
       *  ensures cards in a row top-align cleanly without the chart pushing height variance. */}
      <CardContent
        className="relative p-7 flex flex-col"
        style={{ minHeight: '280px' }}
      >
        {topLeftBlock}
        {/* Spacer keeps the chart block hugging the bottom-right; mt-auto pushes it down. */}
        <div className="mt-auto pt-5 w-full flex">
          {bottomRightBlock}
        </div>
      </CardContent>
    </Card>
  );
}
