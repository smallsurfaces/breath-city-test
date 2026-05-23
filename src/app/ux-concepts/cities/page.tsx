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
 *   - A concern-led HERO SHOWCASE band — "Here's how [concern] was answered" —
 *     featuring the single strongest answer in the deck: Warsaw, "Who's polluting?
 *     → coal, now banned" (~65% of winter PM10, banned 1 Sept 2023). Pulled
 *     straight from concerns-data (who-warsaw-coal), never re-typed.
 *   - The city directory is scoped to OUR three BC-family cities (London / Warsaw
 *     / Accra), each linking to its /ux-concepts/cities/[slug] page.
 *
 * EVIDENCE DISCIPLINE: the showcase figure is the real `stat` from the data card.
 * No fabricated figures, no real BC photography (coloured blocks as placeholders).
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
  type CityKey,
} from "../resident-concerns/_data/concerns-data";

export const metadata: Metadata = {
  title: "Cities — Breathe Cities (concept mock)",
};

/**
 * The concern-led showcase pick: the single strongest, most legible answer in
 * the deck. Warsaw's coal card — a real ~65% share and a binding 2023 ban — is
 * the clearest "concern → answered" story we have. Resolved from the data, not
 * hardcoded copy, so it stays in sync with concerns-data.
 */
const SHOWCASE_CONCERN_KEY = "who-polluting";
const SHOWCASE_CARD_ID = "who-warsaw-coal";

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

export default function CitiesIndexMock() {
  const showcaseConcern =
    CONCERNS.find((c) => c.key === SHOWCASE_CONCERN_KEY) ?? CONCERNS[0];
  const showcaseCard =
    showcaseConcern.cards.find((c) => c.id === SHOWCASE_CARD_ID) ??
    showcaseConcern.cards[0];
  const showcaseCity =
    CITIES.find((c) => c.key === showcaseCard.city) ?? CITIES[0];
  // The showcase stat is a `figure` for this card (~65%); guard the type anyway.
  const showcaseStatValue =
    showcaseCard.stat.kind === "figure"
      ? showcaseCard.stat.value
      : showcaseCard.stat.kind === "progression"
        ? showcaseCard.stat.to
        : "[TK]";
  // `metric` is present on every EntryStat variant, so it reads uniformly here.
  const showcaseStatMetric = showcaseCard.stat.metric;

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

      {/* ── Concern-led HERO SHOWCASE ────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 overflow-hidden rounded-3xl border border-border lg:grid-cols-2">
            {/* Lead visual — the showcase stat on a brand-gradient block */}
            <div
              className="flex flex-col justify-center gap-3 p-10 lg:p-12"
              style={{ background: CITY_BLOCK[showcaseCity.key] }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-bc-white/80">
                {showcaseCity.flag} {showcaseCity.name} · {showcaseCard.facetLabel}
              </p>
              <span className="text-7xl font-bold leading-none tracking-tight text-bc-white">
                {showcaseStatValue}
              </span>
              <p className="text-base font-medium text-bc-white/90">
                {showcaseStatMetric}
              </p>
            </div>

            {/* The "here's how it was answered" narrative — pulled from the card */}
            <div className="flex flex-col justify-center gap-4 p-10 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
                Here&rsquo;s how a resident&rsquo;s question was answered
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                &ldquo;{showcaseConcern.voice}&rdquo;
              </h2>
              <p className="text-base text-muted-foreground">{showcaseCard.did}</p>
              <p className="text-sm text-muted-foreground">{showcaseCard.how}</p>
              <Link
                href={`/ux-concepts/cities/${showcaseCity.key}`}
                className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-bc-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--bc-semantic-brand)" }}
              >
                See the full story in {showcaseCity.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-muted-foreground/80">
                Source: {showcaseCard.source}
              </p>
            </div>
          </div>
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
