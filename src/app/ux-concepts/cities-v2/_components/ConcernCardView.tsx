/**
 * ConcernCardView.tsx — one proven-response card in the Resident Concerns deck (v2)
 *
 * The synchronised v2 copy. SAME structure, content, data, and behaviour as v1 — the
 * ONLY difference is skin-level: the functional [figure TK] evidence-gap callout moves
 * from the amber-* Tailwind utilities to the AQI-moderate (amber-family) token, so the
 * honesty signal stays consistent across the concept family. (This is the card shown
 * inside the EntryCard modal — its open/close behaviour is unchanged.)
 *
 * Renders a single peer-city response to the active concern:
 *   facet chip · city · did → how → outcome → why-not-you · provenance
 *
 * The `outcome` field is either a real figure (string) or a Placeholder, which
 * renders as a clearly-styled [figure TK] chip. This is the visible-gap discipline:
 * a missing figure is shown honestly, never invented.
 *
 * `isLead` highlights cards that lead the deck for the active city (localisation).
 *
 * Key exports: ConcernCardView
 * External dependencies: shadcn Card/Badge, concerns-data types
 */

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type ConcernCard,
  type City,
  isPlaceholder,
} from "../_data/concerns-data";

interface ConcernCardViewProps {
  card: ConcernCard;
  city: City;
  /** True when this card leads the deck for the active city. */
  isLead: boolean;
}

/**
 * Renders the outcome row — a real figure, or a visible placeholder chip. v2 skin: the
 * functional [figure TK] callout's amber-* utilities map to the AQI-moderate
 * (amber-family) tokens — the dashed border + inner chip use the moderate indicator,
 * the surface uses the moderate bg, the text uses the moderate text token.
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

export function ConcernCardView({ card, city, isLead }: ConcernCardViewProps) {
  return (
    <Card
      className={
        isLead ? "ring-2 ring-foreground/30" : undefined
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs">
            {card.facetLabel}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {city.name}
          </span>
        </div>
        <CardTitle className="mt-1 text-base">{card.facet}</CardTitle>
        {isLead && (
          <span className="mt-1 inline-flex w-fit items-center rounded bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Leads {city.name}&rsquo;s mix
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* did → how */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What the city did
          </p>
          <p className="text-sm leading-snug text-foreground">{card.did}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How
          </p>
          <p className="text-sm leading-snug text-muted-foreground">{card.how}</p>
        </div>

        {/* outcome — answers the concern */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What it changed
          </p>
          <Outcome outcome={card.outcome} />
        </div>

        {/* why not you */}
        <div className="rounded-lg bg-muted/60 px-3 py-2">
          <p className="text-sm italic leading-snug text-foreground">
            {card.whyNotYou}
          </p>
        </div>

        {/* provenance — always shown, keeps the evidence honest */}
        <p className="text-[11px] leading-snug text-muted-foreground/80">
          Source: {card.source}
        </p>
      </CardContent>
    </Card>
  );
}
