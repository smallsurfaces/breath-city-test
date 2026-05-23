/**
 * CityConcernStack.tsx — the FLATTENED Resident Concerns component (core deliverable)
 *
 * This is the Resident Concerns deck FLATTENED for embedding in a single BC city
 * page. The original deck (src/app/ux-concepts/resident-concerns) has TWO
 * switchers — concern and city. Here BOTH are removed: the page is already
 * scoped to ONE city, and the reader scrolls through ALL FIVE concerns in a
 * single vertical stack.
 *
 * Structure (per Jack's brief, 2026-05-23):
 *   - One section per concern, in CONCERNS order.
 *   - The concern's door-question (`voice`) is the section heading.
 *   - Under it, that concern's entry cards FOR THIS CITY ONLY, fanned as a small
 *     grid of EntryCards (reused verbatim — tap opens the ConcernCardView popup).
 *   - NO city switcher, NO concern switcher anywhere in this component.
 *
 * Honest data shape: a city has a different number of cards per concern (Warsaw
 * has two under "safe for my kids" — school streets + the home — but one under
 * most others). We render exactly what the evidence holds for this city and do
 * not pad. If a concern has no card for this city, we show a small honest note
 * rather than an empty section or a fabricated card.
 *
 * Reuse, not duplication: imports CONCERNS + CITIES from the existing
 * concerns-data, and EntryCard from the existing deck. No data is copied here.
 *
 * Key exports: CityConcernStack
 * External dependencies: EntryCard + concerns-data (both from resident-concerns)
 */

"use client";

import { EntryCard } from "../../resident-concerns/_components/EntryCard";
import {
  CONCERNS,
  CITIES,
  type CityKey,
} from "../../resident-concerns/_data/concerns-data";

interface CityConcernStackProps {
  cityKey: CityKey;
}

export function CityConcernStack({ cityKey }: CityConcernStackProps) {
  const city = CITIES.find((c) => c.key === cityKey) ?? CITIES[0];

  return (
    <div className="space-y-12">
      {/* Intro to the flattened component — frames it as the resident's worries,
          inferred, with the honesty discipline carried over from the deck. */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
          What residents ask
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          The questions {city.name}&rsquo;s residents are really asking
        </h2>
        <p className="max-w-2xl text-base text-muted-foreground">
          For each worry, here is what {city.name} — and its Breathe Cities peers —
          have actually done. Tap any card for the full story: what the city did,
          the outcome, and the source.
        </p>
        <p className="max-w-2xl rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          These concerns are <span className="font-semibold">inferred</span> —
          worries commonly raised by communities, voiced in residents&rsquo; words.
          They are not a survey of {city.name}.
        </p>
      </div>

      {/* One section per concern — the door-question is the heading, then this
          city's cards for that concern. Single vertical scroll, no switchers. */}
      {CONCERNS.map((concern, idx) => {
        const cityCards = concern.cards.filter((card) => card.city === cityKey);

        return (
          <section key={concern.key} className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-semibold tabular-nums text-bc-blue/70">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="space-y-1">
                {/* The concern's door-question — the section heading */}
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  &ldquo;{concern.voice}&rdquo;
                </h3>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Fanned {concern.axisLabel.toLowerCase()}.
                  </span>{" "}
                  {concern.axisDescription}
                </p>
              </div>
            </div>

            {cityCards.length > 0 ? (
              // The fanned entry cards FOR THIS CITY — reused EntryCard, tap → popup.
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cityCards.map((card) => (
                  <EntryCard
                    key={card.id}
                    card={card}
                    city={city}
                    // No localisation lead state in the flattened single-city view.
                    isLead={false}
                  />
                ))}
              </div>
            ) : (
              // Honest empty state — no card for this city under this concern.
              // We never fabricate a card to fill the grid.
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  No {city.name}-specific response is documented for this concern
                  yet. The peer-city answers live in the full Resident Concerns
                  deck.
                </p>
              </div>
            )}
          </section>
        );
      })}

      {/* City trajectory context — collective framing, never per-intervention.
          Mirrors the deck's discipline: a city-wide trend is context only. */}
      {city.trajectory && (
        <div className="rounded-xl border border-border bg-muted/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Where {city.name} is heading
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground">
            {city.trajectory}
          </p>
          <p className="mt-2 max-w-3xl text-xs text-muted-foreground">
            City-wide trend, context only — no single action above moves the whole
            ambient number. Contribution toward Breathe Cities&rsquo; collective
            goal of 30% cleaner air by 2030.
          </p>
        </div>
      )}
    </div>
  );
}
