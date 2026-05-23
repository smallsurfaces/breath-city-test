/**
 * Cities index mock — /ux-concepts/cities
 *
 * Recreates Breathe Cities' REAL cities-index IA (light) so our Resident
 * Concerns concept can be shown in context. Server component.
 *
 * BC's real cities-index structure (from breathecities.org/cities/), light:
 *   - Header (BcChrome) + hero: banner + intro line + the 30%-by-2030 mission.
 *   - A responsive card grid of cities — each a full-bleed image with the city
 *     name overlaid. We don't have BC's photos, so cards use coloured blocks.
 *   - Email signup + partner logos + footer (BcChrome).
 *
 * Our concept insertion (where it earns its place on an index page):
 *   - A concern-led HERO SHOWCASE STACK — FIVE full-size heros stacked vertically,
 *     one per concern (Jack's locked call, 2026-05-23). Each is a full hero with
 *     the same structure and scale as the others (NOT compacted): a brand-gradient
 *     stat panel + the "here's how it was answered" narrative + a "See the full
 *     story in {city}" CTA. The five concerns, each paired with the STRONGEST real
 *     answer in the deck, with the CITY VARIED across the stack so it reads as a
 *     family showcase (Warsaw / London / Warsaw / Accra / London):
 *       A1 who-polluting   → Warsaw  who-warsaw-coal   (~65% winter PM10, banned)
 *       B1 safe-for-kids   → London  kids-london-school (3,500+ schools on alerts)
 *       D1 what-can-i-do   → Warsaw  do-warsaw-grants  (~1M switch-grant applications)
 *       C1 worst-part      → Accra   place-accra-coverage (headline stat honestly [TK])
 *       A3 make-them-stop  → London  stop-london-city  (46k fewer/day → −21% NO₂)
 *     All pulled straight from concerns-data, never re-typed.
 *   - The city directory is scoped to OUR three BC-family cities (London / Warsaw
 *     / Accra), each linking to its /ux-concepts/cities/[slug] page.
 *
 * EVIDENCE DISCIPLINE: every showcase figure is the real `stat` from its data card.
 * No fabricated figures. Where a concern's best answer has no real headline number
 * (C1 / Accra — neighbourhood readings are genuinely thin), the stat renders as a
 * visible [TK] chip, never an invented number. No real BC photography (coloured
 * blocks as placeholders).
 *
 * Key exports: default page component, metadata
 * External dependencies: BcChrome, concerns-data (CONCERNS, CITIES)
 */

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { BcHeader, BcFooter } from "./_components/BcChrome";
import {
  CONCERNS,
  CITIES,
  type Concern,
  type ConcernCard,
  type City,
  type CityKey,
} from "../resident-concerns/_data/concerns-data";

export const metadata: Metadata = {
  title: "Cities — Breathe Cities (concept mock)",
};

/**
 * The concern-led showcase stack: FIVE picks, one per concern, in Jack's locked
 * order (2026-05-23). Each pick names the concern and the single strongest real
 * answer for it, with the CITY deliberately VARIED across the five so the stack
 * reads as a family showcase, not five Warsaw heros. Resolved from the data (not
 * hardcoded copy) so every figure stays in sync with concerns-data.
 *
 * C1 (worst-part) intentionally picks Accra's coverage card: the neighbourhood
 * readings are genuinely thin across the deck, so its headline stat is an honest
 * [TK] — we show the gap rather than fabricate a neighbourhood number.
 */
const SHOWCASE_PICKS: { concernKey: string; cardId: string }[] = [
  { concernKey: "who-polluting", cardId: "who-warsaw-coal" }, // A1 → Warsaw
  { concernKey: "safe-for-kids", cardId: "kids-london-school" }, // B1 → London
  { concernKey: "what-can-i-do", cardId: "do-warsaw-grants" }, // D1 → Warsaw
  { concernKey: "worst-part", cardId: "place-accra-coverage" }, // C1 → Accra ([TK])
  { concernKey: "make-them-stop", cardId: "stop-london-city" }, // A3 → London
];

/** A per-city placeholder block colour (we have no BC photography). */
const CITY_BLOCK: Record<CityKey, string> = {
  london: "linear-gradient(135deg, var(--bc-color-dark-blue), var(--bc-color-blue))",
  warsaw: "linear-gradient(135deg, var(--bc-color-blue), var(--bc-color-teal))",
  accra: "linear-gradient(135deg, var(--bc-color-teal), var(--bc-color-light-blue))",
};

/** BC's real region filter labels (inert in the mock — shown for IA fidelity). */
const REGIONS = ["All regions", "Europe", "Africa", "Asia", "Latin America"];

/** Directory order for our three cities (London / Warsaw / Accra per brief). */
const DIRECTORY_ORDER: CityKey[] = ["london", "warsaw", "accra"];

/**
 * One full-size concern hero. Identical structure and scale for every concern in
 * the stack (no compaction): a brand-gradient stat panel on the left, the
 * "here's how it was answered" narrative + CTA on the right. The stat panel
 * renders the card's real headline figure, or — where the evidence has a genuine
 * gap (e.g. C1 / Accra neighbourhood readings) — a visible [TK] chip. The figure
 * is never invented.
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
  // The headline value for the gradient panel. A figure shows its value; a
  // progression shows its achieved (`to`) value; a `tk` stat has no real number,
  // so the panel falls back to an honest [TK] chip rather than a fabricated one.
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
    <div className="grid gap-8 overflow-hidden rounded-3xl border border-border lg:grid-cols-2">
      {/* Lead visual — the showcase stat on a brand-gradient block */}
      <div
        className="flex flex-col justify-center gap-3 p-10 lg:p-12"
        style={{ background: CITY_BLOCK[city.key] }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-bc-white/80">
          {city.name} · {card.facetLabel}
        </p>
        {isTk ? (
          // Honest gap: no real headline figure for this answer (C1 / Accra
          // neighbourhood readings). Show a [TK] chip, never an invented number.
          <span className="w-fit rounded-lg bg-bc-white/20 px-3 py-1.5 font-mono text-3xl font-bold leading-none tracking-tight text-bc-white">
            [TK]
          </span>
        ) : (
          <span className="text-7xl font-bold leading-none tracking-tight text-bc-white">
            {statValue}
          </span>
        )}
        <p className="text-base font-medium text-bc-white/90">{statMetric}</p>
      </div>

      {/* The "here's how it was answered" narrative — pulled from the card */}
      <div className="flex flex-col justify-center gap-4 p-10 lg:p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
          Here&rsquo;s how a resident&rsquo;s question was answered
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          &ldquo;{concern.voice}&rdquo;
        </h2>
        <p className="text-base text-muted-foreground">{card.did}</p>
        <p className="text-sm text-muted-foreground">{card.how}</p>
        <Link
          href={`/ux-concepts/cities/${city.key}`}
          className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-bc-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--bc-semantic-brand)" }}
        >
          See the full story in {city.name}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-[11px] text-muted-foreground/80">
          Source: {card.source}
        </p>
      </div>
    </div>
  );
}

export default function CitiesIndexMock() {
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
    <main className="min-h-screen bg-background">
      <BcHeader />

      {/* ── Hero: intro + 30%-by-2030 mission ────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          {/* Banner placeholder */}
          <div
            className="mb-10 flex aspect-[16/5] items-center justify-center rounded-2xl"
            style={{
              background:
                "linear-gradient(120deg, var(--bc-color-dark-blue), var(--bc-color-blue) 55%, var(--bc-color-teal))",
            }}
          >
            <span className="px-6 text-center text-sm font-medium text-bc-white/85">
              Cities banner — image placeholder (no BC photography in the prototype)
            </span>
          </div>
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
              Cities
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-bc-dark-blue sm:text-5xl">
              A network of cities cutting air pollution.
            </h1>
            <p className="text-lg text-muted-foreground">
              Breathe Cities is working with city governments and local partners to
              deliver{" "}
              <span className="font-semibold text-foreground">
                30% cleaner air by 2030
              </span>{" "}
              (against a 2019 baseline) — with modelled projections of ~55,000
              premature deaths prevented and ~$147B in avoided health costs across
              the family.
            </p>
          </div>
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

      {/* ── City directory (BC-style image+name cards) ───────────────────── */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Explore the cities
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground">
              Each city has its own concerns and its own response. (This prototype
              covers three of the Breathe Cities family.)
            </p>
          </div>

          {/* Region filter labels — inert, shown for IA fidelity */}
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region, i) => (
              <span
                key={region}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm font-medium",
                  i === 0
                    ? "border-transparent bg-bc-dark-blue text-bc-white"
                    : "border-border text-muted-foreground",
                ].join(" ")}
              >
                {region}
              </span>
            ))}
          </div>

          {/* The card grid — full-bleed coloured block with city name overlaid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DIRECTORY_ORDER.map((key) => {
              const city = CITIES.find((c) => c.key === key);
              if (!city) return null;
              return (
                <Link
                  key={key}
                  href={`/ux-concepts/cities/${key}`}
                  className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl"
                  style={{ background: CITY_BLOCK[key] }}
                >
                  {/* Bottom scrim so the overlaid name reads on any block */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <div className="relative z-10 flex w-full items-end justify-between gap-2 p-5">
                    <div>
                      <span className="text-2xl font-bold tracking-tight text-bc-white">
                        {city.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-bc-white/80">
                        {city.country}
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-bc-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            City photography is BC&rsquo;s on the live site; coloured blocks stand
            in here — we never reproduce real assets in the prototype.
          </p>
        </div>
      </section>

      <BcFooter />
    </main>
  );
}
