/**
 * ConcernCardView.tsx — one city's answer to a resident concern (the detail popup).
 *
 * This is the FULL card shown inside the EntryCard modal on a concern page. After the
 * concern-centric restructure (2026-05-25) the resident's QUESTION is the concern page's header,
 * so this card is purely the CITY ANSWER. It applies the §4 card framing + content order and the
 * §7 popup-infographic requirement from the Resident Concerns queue:
 *
 *   §4 framing  — the card is headed "Here's how {City} answered their residents' question",
 *                 and the content runs in order:
 *                   category (icon + facet) → stat → lead (did) → detail (how + what it changed)
 *                   → CTA ("See the full story in {City} →") → source.
 *                 (The old "question-left / answer-right" split is superseded: the question now
 *                 lives in the page header, and the card is the answer.)
 *   §7 infographic — the popup carries the infographic, not text only: the category ICON and the
 *                 visual STAT (via the shared concern-visuals primitives), exactly as the entry
 *                 card shows them.
 *
 * The `outcome` field is either a real figure (string) or a Placeholder rendered as a clearly
 * styled [figure TK] chip — the visible-gap discipline: a missing figure is shown honestly, never
 * invented. The "why not you?" peer-learning nudge is preserved.
 *
 * CTA note: the §4 spec's "See the full story in {City} →" CTA pointed at the per-city page, which
 * the restructure RETIRED. The full story now lives on the concern page this popup opens from, so
 * the CTA is rendered as an honest INERT affordance (no dead-end link) — the §4 content order is
 * preserved without inventing a destination.
 *
 * Functional colour only (AQI-moderate token for the gap chip), light mode, no emoji.
 *
 * Key exports: ConcernCardView
 * External dependencies: shadcn Card/Badge, lucide-react, concern-visuals, concerns-data types
 */

import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { ConcernIcon, StatViz } from "./concern-visuals";
import {
  type ConcernCard,
  type City,
  isPlaceholder,
} from "../_data/concerns-data";

interface ConcernCardViewProps {
  card: ConcernCard;
  city: City;
}

/**
 * Renders the outcome row — a real figure, or a visible placeholder chip. The functional
 * [figure TK] callout uses the AQI-moderate (amber-family) tokens (dashed border + inner chip on
 * the moderate indicator, moderate bg surface, moderate text) so the honesty signal stays
 * consistent across the concept family.
 */
function Outcome({ outcome }: { outcome: ConcernCard["outcome"] }) {
  if (isPlaceholder(outcome)) {
    return (
      <div
        className="rounded-lg border border-dashed px-3 py-2"
        style={{
          borderColor: "var(--bc-semantic-aqi-moderate-indicator)",
          backgroundColor: "var(--bc-semantic-aqi-moderate-bg)",
        }}
      >
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold"
          style={{ color: "var(--bc-semantic-aqi-moderate-text)" }}
        >
          <span
            className="rounded px-1.5 py-0.5 font-mono"
            style={{
              backgroundColor: "var(--bc-semantic-aqi-moderate-indicator)",
              color: "var(--bc-color-white)",
            }}
          >
            [figure TK]
          </span>
        </span>
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--bc-semantic-aqi-moderate-text)" }}
        >
          {outcome.tk}
        </p>
      </div>
    );
  }
  return (
    <p className="text-sm font-medium leading-snug text-foreground">{outcome}</p>
  );
}

export function ConcernCardView({ card, city }: ConcernCardViewProps) {
  return (
    <Card>
      <CardHeader>
        {/* §4 framing — the card is one city's answer to the page's resident question. */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs">
            {card.facetLabel}
          </Badge>
          <span className="text-xs text-muted-foreground">{city.name}</span>
        </div>
        <p
          className="mt-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--bc-color-blue)" }}
        >
          Here&rsquo;s how {city.name} answered their residents&rsquo; question
        </p>

        {/* §4 order + §7 infographic — category (icon + facet) → stat. The icon and the
            visual stat carry the infographic, not text only. */}
        <div className="mt-3 flex items-start gap-4">
          <ConcernIcon
            iconKey={card.iconKey}
            tileClassName="h-14 w-14 shrink-0"
            iconClassName="h-7 w-7"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{card.facet}</p>
            <div className="mt-2">
              <StatViz stat={card.stat} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* lead (did) */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What the city did
          </p>
          <p className="text-sm leading-snug text-foreground">{card.did}</p>
        </div>

        {/* detail (how → what it changed) */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How
          </p>
          <p className="text-sm leading-snug text-muted-foreground">{card.how}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What it changed
          </p>
          <Outcome outcome={card.outcome} />
        </div>

        {/* why not you — the peer-learning nudge, preserved */}
        <div className="rounded-lg bg-muted/60 px-3 py-2">
          <p className="text-sm italic leading-snug text-foreground">
            {card.whyNotYou}
          </p>
        </div>

        {/* §4 CTA — kept in the content order. The per-city page it pointed at was retired in
            the concern-centric restructure, so this is an honest INERT affordance (no dead-end
            link): the full story is this concern page. */}
        <div>
          <span
            aria-disabled="true"
            className="inline-flex w-fit cursor-default items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--bc-semantic-brand) 12%, transparent)",
              color: "var(--bc-semantic-brand)",
            }}
          >
            See the full story in {city.name}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </span>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            The full {city.name} story lives on this concern page — per-city deep-dive pages were
            retired in the concern-centric restructure.
          </p>
        </div>

        {/* source — provenance, always shown, keeps the evidence honest */}
        <p className="text-[11px] leading-snug text-muted-foreground/80">
          Source: {card.source}
        </p>
      </CardContent>
    </Card>
  );
}
