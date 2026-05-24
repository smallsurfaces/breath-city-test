/**
 * Cities index mock (v2) — /ux-concepts/cities-v2
 *
 * The synchronised v2 copy of the Cities (Resident Concerns) index. SAME structure,
 * content, data, and interactions as v1 — the ONLY differences are skin-level:
 * decorative colour (per-city brand gradients, the banner gradient, the directory
 * card gradients + black scrim) is removed in favour of the SHARED concept
 * composition layer (ConceptHero / ConceptSectionHeader / ConceptCard / ConceptStat
 * from @/components/concept), oversized display type is capped to the shared scale,
 * and all internal links point at the v2 route so v2 is self-contained.
 *
 * Server component.
 *
 * BC's real cities-index structure (recreated, light):
 *   - Header (BcChrome) + hero: banner + intro line + the 30%-by-2030 mission.
 *   - A responsive card grid of cities. We don't have BC's photos; v1 used coloured
 *     gradient blocks, v2 uses OUTLINED ConceptCards (city name + country) — no
 *     gradient, no scrim, link + hover arrow preserved.
 *   - Email signup + partner logos + footer (BcChrome).
 *
 * Chrome: rendered PER-PAGE (the shared BcHeader/BcFooter from @/components/concept,
 * driven by the co-located CITIES_CHROME config) — NOT in the layout. This is the
 * Cities concept's deliberate structural pattern, preserved from v1: the in-context
 * BC-site recreation IS the build, so the pages own the chrome. The PrototypeHeader
 * tooling bar is added above by cities-v2/layout.tsx.
 *
 * Our concept insertion (where it earns its place on an index page):
 *   - A concern-led HERO SHOWCASE STACK — FIVE full-size heros stacked vertically,
 *     one per concern (Jack's locked call, 2026-05-23). Each is a full hero with the
 *     same structure and scale as the others (NOT compacted): an OUTLINED stat panel
 *     (ConceptCard + ConceptStat) + the "here's how it was answered" narrative + a
 *     "See the full story in {city}" CTA. The five concerns, each paired with the
 *     STRONGEST real answer in the deck, with the CITY VARIED across the stack so it
 *     reads as a family showcase (Warsaw / London / Warsaw / Bangkok / London):
 *       A1 who-polluting   → Warsaw   who-warsaw-coal       (~65% winter PM10, banned)
 *       B1 safe-for-kids   → London   kids-london-school    (3,500+ schools on alerts)
 *       D1 what-can-i-do   → Warsaw   do-warsaw-grants      (~1M switch-grant applications)
 *       C1 worst-part      → Bangkok  place-bangkok-network (~68 reference stations — REAL)
 *       A3 make-them-stop  → London   stop-london-city      (46k fewer/day → −21% NO₂)
 *     All pulled straight from concerns-data, never re-typed. Every hero now carries
 *     a REAL headline figure — there is no [TK] in any hero.
 *   - The city directory is scoped to OUR three BC-family cities (London / Warsaw
 *     / Bangkok), each linking to its /ux-concepts/cities-v2/[slug] page.
 *
 * EVIDENCE DISCIPLINE: every showcase figure is the real `stat` from its data card.
 * No fabricated figures, and — after the Bangkok swap — no [TK] in any hero, because
 * Bangkok's C1 answer carries a real ~68-reference-station figure. The [TK] fallback
 * in ConcernHero is retained for honesty if a future pick has a genuine gap; v2 maps
 * its colour to the AQI-moderate (amber-family) token so the honesty signal stays
 * consistent with the rest of the concept family. No real BC photography.
 *
 * Key exports: default page component, metadata
 * External dependencies: next/link, lucide-react, @/components/concept (ConceptHero,
 *   ConceptSectionHeader, ConceptCard, ConceptStat, BcHeader, BcFooter), the
 *   co-located CITIES_CHROME chrome config, concerns-data (CONCERNS, CITIES).
 *
 * Route: /ux-concepts/cities-v2
 */

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import {
  BcHeader,
  BcFooter,
  ConceptHero,
  ConceptSectionHeader,
  ConceptCard,
  ConceptStat,
} from "@/components/concept";
import { CITIES_CHROME } from "./_components/bc-chrome.config";
import {
  CONCERNS,
  CITIES,
  type Concern,
  type ConcernCard,
  type City,
  type CityKey,
} from "./_data/concerns-data";

export const metadata: Metadata = {
  title: "Cities — Breathe Cities (concept mock) v2",
};

/**
 * The concern-led showcase stack: FIVE picks, one per concern, in Jack's locked
 * order (2026-05-23). Each pick names the concern and the single strongest real
 * answer for it, with the CITY deliberately VARIED across the five so the stack
 * reads as a family showcase, not five Warsaw heros. Resolved from the data (not
 * hardcoded copy) so every figure stays in sync with concerns-data.
 *
 * C1 (worst-part) picks Bangkok's reference-station card: its ~68-station network is
 * a REAL infrastructure figure, so this hero now shows a real headline stat — there
 * is no [TK] in any hero. (Per-neighbourhood readings stay [TK] inside the card's
 * detail, but the hero stat is the real network figure.)
 */
const SHOWCASE_PICKS: { concernKey: string; cardId: string }[] = [
  { concernKey: "who-polluting", cardId: "who-warsaw-coal" }, // A1 → Warsaw
  { concernKey: "safe-for-kids", cardId: "kids-london-school" }, // B1 → London
  { concernKey: "what-can-i-do", cardId: "do-warsaw-grants" }, // D1 → Warsaw
  { concernKey: "worst-part", cardId: "place-bangkok-network" }, // C1 → Bangkok (~68 stations, REAL)
  { concernKey: "make-them-stop", cardId: "stop-london-city" }, // A3 → London
];

/** BC's real region filter labels (inert in the mock — shown for IA fidelity). */
const REGIONS = ["All regions", "Europe", "Africa", "Asia", "Latin America"];

/** Directory order for our three cities (London / Warsaw / Bangkok per brief). */
const DIRECTORY_ORDER: CityKey[] = ["london", "warsaw", "bangkok"];

/**
 * One full-size concern hero. Identical structure and scale for every concern in
 * the stack (no compaction): an OUTLINED stat panel on the left, the "here's how it
 * was answered" narrative + CTA on the right. The stat panel renders the card's real
 * headline figure via ConceptStat, or — where the evidence has a genuine gap (a `tk`
 * stat) — a visible [TK] chip on the AQI-moderate (amber-family) token. The figure is
 * never invented. After the Bangkok swap no current pick is `tk`, but the fallback is
 * retained for honesty.
 *
 * v2 skin change vs v1: the lead visual was a brand-gradient block with a text-7xl
 * white figure; it is now an outlined ConceptCard wrapping a ConceptStat (text-3xl),
 * so the figure carries no decorative colour. The whole hero is wrapped in a
 * ConceptCard surface (replacing v1's bare `rounded-3xl border` div).
 */
function ConcernHero({
  concern,
  card,
  city,
}: {
  concern: Concern;
  card: ConcernCard;
  city: City;
}) {
  // The headline value for the stat panel. A figure shows its value; a progression
  // shows its achieved (`to`) value; a `tk` stat has no real number, so the panel
  // falls back to an honest [TK] chip rather than a fabricated one. Retained honesty
  // fallback: if a future pick has a genuine gap, the panel shows a [TK] chip rather
  // than a fabricated number. After the Bangkok swap, no current hero hits this
  // branch — every showcase pick carries a real figure or progression.
  const isTk = card.stat.kind === "tk";
  const statValue =
    card.stat.kind === "figure"
      ? card.stat.value
      : card.stat.kind === "progression"
        ? card.stat.to
        : null;
  // `metric` is present on every EntryStat variant, so it reads uniformly here.
  const statMetric = card.stat.metric;

  return (
    <ConceptCard noPadding className="overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Lead visual — the showcase stat in an outlined, muted panel (no gradient). */}
        <div className="flex flex-col justify-center gap-3 p-10 lg:p-12">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--bc-color-blue)" }}
          >
            {city.name} · {card.facetLabel}
          </p>
          {isTk ? (
            // Honest gap fallback: if a pick has no real headline figure, show a [TK]
            // chip on the AQI-moderate (amber-family) token, never an invented number.
            // No current hero hits this after the Bangkok swap — kept for honesty if a
            // future pick has a genuine gap.
            <span
              className="w-fit rounded-lg px-3 py-1.5 font-mono text-3xl font-bold leading-none tracking-tight"
              style={{
                backgroundColor: "var(--bc-semantic-aqi-moderate-bg)",
                color: "var(--bc-semantic-aqi-moderate-text)",
              }}
            >
              [TK]
            </span>
          ) : (
            // Real figure via the shared stat primitive (capped at text-3xl).
            <ConceptStat value={statValue ?? ""} label={statMetric} />
          )}
        </div>

        {/* The "here's how it was answered" narrative — pulled from the card */}
        <div className="flex flex-col justify-center gap-4 p-10 lg:p-12">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--bc-color-blue)" }}
          >
            Here&rsquo;s how a resident&rsquo;s question was answered
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            &ldquo;{concern.voice}&rdquo;
          </h2>
          <p className="text-base text-muted-foreground">{card.did}</p>
          <p className="text-sm text-muted-foreground">{card.how}</p>
          <Link
            href={`/ux-concepts/cities-v2/${city.key}`}
            className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--bc-semantic-brand)",
              color: "var(--bc-color-white)",
            }}
          >
            See the full story in {city.name}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-[11px] text-muted-foreground/80">
            Source: {card.source}
          </p>
        </div>
      </div>
    </ConceptCard>
  );
}

export default function CitiesV2IndexMock() {
  // Resolve the five showcase picks from the data — concern, its chosen card, and
  // that card's city. Any pick that can't resolve is skipped (defensive), so the
  // stack only ever renders real, in-data heros.
  const showcaseHeros = SHOWCASE_PICKS.map(({ concernKey, cardId }) => {
    const concern = CONCERNS.find((c) => c.key === concernKey);
    const card = concern?.cards.find((c) => c.id === cardId);
    const city = card ? CITIES.find((c) => c.key === card.city) : undefined;
    if (!concern || !card || !city) return null;
    return { concern, card, city };
  }).filter((h): h is { concern: Concern; card: ConcernCard; city: City } =>
    Boolean(h),
  );

  return (
    // Chrome is rendered per-page (the Cities concept's structural pattern): the
    // shared BcHeader/BcFooter, driven by the co-located CITIES_CHROME config. The
    // PrototypeHeader tooling bar sits above, added by cities-v2/layout.tsx.
    <main className="min-h-screen bg-background">
      <BcHeader config={CITIES_CHROME} />

      {/* ── Hero: intro + 30%-by-2030 mission ────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          {/* Banner placeholder — neutral, outlined/muted (no gradient). */}
          <div className="mb-10 flex aspect-[16/5] items-center justify-center rounded-2xl border border-border bg-muted/40">
            <span className="px-6 text-center text-sm font-medium text-muted-foreground">
              Cities banner — image placeholder (no BC photography in the prototype)
            </span>
          </div>
          <ConceptHero
            eyebrow="Cities"
            headline="A network of cities cutting air pollution."
            body="Breathe Cities is working with city governments and local partners to deliver 30% cleaner air by 2030 (against a 2019 baseline) — with modelled projections of ~55,000 premature deaths prevented and ~$147B in avoided health costs across the family."
          />
        </div>
      </section>

      {/* ── Concern-led HERO SHOWCASE STACK (five full-size heros) ────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-8">
          {showcaseHeros.map(({ concern, card, city }) => (
            <ConcernHero
              key={concern.key}
              concern={concern}
              card={card}
              city={city}
            />
          ))}
        </div>
      </section>

      {/* ── City directory (BC-style name cards) ─────────────────────────── */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-6">
          <ConceptSectionHeader
            heading="Explore the cities"
            body="Each city has its own concerns and its own response. (This prototype covers three of the Breathe Cities family.)"
          />

          {/* Region filter labels — inert, shown for IA fidelity */}
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region, i) => (
              <span
                key={region}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm font-medium",
                  i === 0
                    ? "border-transparent text-foreground"
                    : "border-border text-muted-foreground",
                ].join(" ")}
                style={
                  i === 0
                    ? {
                        backgroundColor: "var(--bc-color-dark-blue)",
                        color: "var(--bc-color-white)",
                      }
                    : undefined
                }
              >
                {region}
              </span>
            ))}
          </div>

          {/* The card grid — outlined ConceptCards with city name + country (no
              gradient, no scrim). Link + hover arrow preserved. */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DIRECTORY_ORDER.map((key) => {
              const city = CITIES.find((c) => c.key === key);
              if (!city) return null;
              return (
                <Link
                  key={key}
                  href={`/ux-concepts/cities-v2/${key}`}
                  // Hover colour uses the shadcn-bridged `primary` token (globals.css
                  // maps --primary → --bc-semantic-brand = brand blue), so the hover
                  // is brand blue via a bridged semantic — NOT a `*-bc-*` utility and
                  // NOT a JS handler, keeping this page a server component.
                  className="group flex items-end justify-between gap-2 rounded-2xl border border-border bg-background p-5 shadow-sm transition-colors hover:border-primary"
                >
                  <div>
                    <span className="text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {city.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {city.country}
                    </span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            City photography is BC&rsquo;s on the live site; outlined cards stand in
            here — we never reproduce real assets in the prototype.
          </p>
        </div>
      </section>

      <BcFooter />
    </main>
  );
}
