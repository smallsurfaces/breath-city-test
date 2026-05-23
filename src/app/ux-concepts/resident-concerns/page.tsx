/**
 * Resident Concerns — global-site UX concept (rapid prototype)
 *
 * A deck of cards organised by resident/community CONCERN, presented to city
 * officials as: "These are the concerns of your residents — and here's what peer
 * cities have done about each."
 *
 * Two interactions:
 *   1. Concern switcher (2 concerns) — each fans out on its OWN axis:
 *        "Who's polluting my neighbourhood?" → by SOURCE
 *        "Is the air safe for my kids?"      → by SETTING / LEVER
 *   2. City switcher (Warsaw / London / Bangkok) — reorders the deck so the active
 *      city's dominant facet leads (localisation).
 *
 * Honesty discipline rendered in the UI:
 *   - Concerns labelled as INFERRED, never "your residents said".
 *   - Missing figures shown as visible [figure TK] chips, never invented.
 *   - Contribution framing toward 30%-by-2030 — never implies one action moves
 *     the whole ambient number.
 *
 * Light mode. Single in-flow "Back to hub" button is the sole back-nav for this
 * route; the global HomeNav is suppressed here (see HomeNav SELF_NAV_PREFIXES) to
 * avoid a duplicate.
 *
 * Key exports: default page component (Next.js App Router, client component)
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switcher } from "./_components/Switcher";
import { EntryCard } from "./_components/EntryCard";
import {
  CONCERNS,
  CITIES,
  CITY_LEAD_FACET,
  type CityKey,
} from "./_data/concerns-data";

export default function ResidentConcernsPage() {
  const [concernKey, setConcernKey] = useState(CONCERNS[0].key);
  const [cityKey, setCityKey] = useState<CityKey>("warsaw");

  const concern = CONCERNS.find((c) => c.key === concernKey) ?? CONCERNS[0];
  const city = CITIES.find((c) => c.key === cityKey) ?? CITIES[0];
  const leadFacetLabel = CITY_LEAD_FACET[cityKey]?.[concernKey];

  /**
   * Localisation ordering: the active city's cards come first, with its lead
   * facet at the very top; other cities' cards follow. This is what makes the
   * city switcher visibly reorder the deck.
   */
  const orderedCards = useMemo(() => {
    const cards = [...concern.cards];
    return cards.sort((a, b) => {
      const aActive = a.city === cityKey ? 0 : 1;
      const bActive = b.city === cityKey ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      const aLead = a.facetLabel === leadFacetLabel ? 0 : 1;
      const bLead = b.facetLabel === leadFacetLabel ? 0 : 1;
      return aLead - bLead;
    });
  }, [concern, cityKey, leadFacetLabel]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        {/* Back-to-hub — explicit in-flow button (required by brief) */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to hub
        </Link>

        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Global site · Resident Concerns
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            These are the concerns of your residents.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Here&rsquo;s what peer cities have done about each — proven responses
            from the Breathe Cities family, organised by the worry residents
            actually raise.
          </p>
          {/* Inferred label — honesty discipline */}
          <p className="max-w-2xl rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            The concerns below are <span className="font-semibold">inferred</span>{" "}
            — worries commonly raised by communities and civil-society groups,
            voiced in residents&rsquo; words. They are not a survey of your city.
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
          <Switcher
            caption="Concern"
            options={CONCERNS.map((c) => ({ value: c.key, label: c.voice }))}
            value={concernKey}
            onChange={setConcernKey}
          />
          <Switcher
            caption="Active city"
            options={CITIES.map((c) => ({
              value: c.key,
              label: c.name,
            }))}
            value={cityKey}
            onChange={(v) => setCityKey(v as CityKey)}
          />
        </div>

        <Separator />

        {/* Concern framing + active-city localisation note */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {concern.voice}
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              Fanned {concern.axisLabel.toLowerCase()}.
            </span>{" "}
            {concern.axisDescription}
          </p>
          <p className="max-w-3xl text-sm text-muted-foreground">
            For{" "}
            <span className="font-semibold text-foreground">{city.name}</span>:{" "}
            {city.mix}
            {leadFacetLabel && (
              <>
                {" "}
                <span className="text-foreground">
                  {leadFacetLabel} leads the deck below.
                </span>
              </>
            )}
          </p>
        </section>

        {/* Scan hint — the deck is now a grid of compact, tappable entry cards */}
        <p className="text-xs text-muted-foreground">
          Each card leads with one real headline figure. Tap any card for the
          full story — what the city did, the outcome, and the provenance.
        </p>

        {/* The deck — compact graphical entry cards; tap to open full detail */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderedCards.map((card) => (
            <EntryCard
              key={card.id}
              card={card}
              city={CITIES.find((c) => c.key === card.city) ?? CITIES[0]}
              isLead={
                card.city === cityKey && card.facetLabel === leadFacetLabel
              }
            />
          ))}
        </section>

        {/* Contribution to 2030 — collective framing, never per-intervention */}
        <section className="rounded-xl border border-border bg-muted/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contribution to 2030
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground">
            {concern.contribution}
          </p>
          <p className="mt-3 max-w-3xl text-xs text-muted-foreground">
            Breathe Cities&rsquo; collective goal is{" "}
            <span className="font-semibold">
              30% cleaner air by 2030 (vs 2019)
            </span>
            , with modelled projections of ~55,000 premature deaths prevented and
            ~$147B in avoided health costs across the 14-city family. These are{" "}
            <span className="font-semibold">contributions</span> toward a
            collective trajectory — no single action or city moves the whole
            ambient number.
          </p>
          {city.trajectory && (
            <p className="mt-3 max-w-3xl text-xs text-muted-foreground">
              Where {city.name} is heading (city-wide trend, context only):{" "}
              {city.trajectory}
            </p>
          )}
        </section>

        {/* Honesty footer */}
        <footer className="space-y-1 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            Rapid prototype · Breathe Cities global-site concept · static authored
            content, no live data.
          </p>
          <p>
            All figures trace to Breathe Cities city-initiatives research; gaps
            are shown as{" "}
            <span className="font-mono text-amber-700">[figure TK]</span>{" "}
            placeholders, never invented. City-wide trend figures are trajectory
            context, not per-intervention outcomes.
          </p>
        </footer>
      </div>
    </main>
  );
}
