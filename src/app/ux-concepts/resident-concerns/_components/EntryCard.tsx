/**
 * EntryCard.tsx — compact, graphical, scannable entry card for the deck grid
 *
 * The data-visualisation face of the Resident Concerns deck (Jack's 2026-05-23
 * review: lean data-viz, scan at a glance). Replaces the verbose inline card in
 * the grid. Each entry card shows three things only:
 *   1. An ICON for the source/setting (coal, factory, car, cooking, dust /
 *      school, commute, home, data) — lucide-react, simple and consistent.
 *   2. A HEADLINE STAT as a before→after progression, a single real figure, or a
 *      styled [TK] placeholder (StatViz). The card's most representative REAL
 *      number — same no-fabrication rule as the detailed card.
 *   3. Minimal label text — facet + city.
 *
 * TAP/CLICK → opens a modal (shadcn/base-ui Dialog) containing the FULL detailed
 * card exactly as before, via the reused ConcernCardView. Dismiss by overlay
 * click, Esc, or the close button — all provided by DialogContent.
 *
 * Light-mode styling via BC semantic Tailwind tokens.
 *
 * Key exports: EntryCard
 * External dependencies: shadcn Dialog/Card/Badge, lucide-react, ConcernCardView
 */

"use client";

import {
  Factory,
  Car,
  Flame,
  CookingPot,
  Wind,
  School,
  Footprints,
  Home,
  Radar,
  Route,
  HandCoins,
  Megaphone,
  MapPin,
  Landmark,
  Scale,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConcernCardView } from "./ConcernCardView";
import {
  type ConcernCard,
  type City,
  type IconKey,
  type EntryStat,
} from "../_data/concerns-data";

/**
 * Icon-key → lucide icon. Lives in the presentation layer so the data stays
 * presentation-agnostic. "coal" uses Flame (lucide has no coal glyph); "dust"
 * uses Wind; "data" uses Radar (sensing). Kept simple and consistent.
 */
const ICONS: Record<IconKey, LucideIcon> = {
  coal: Flame,
  factory: Factory,
  car: Car,
  cooking: CookingPot,
  dust: Wind,
  school: School,
  commute: Footprints,
  home: Home,
  data: Radar,
  // ACTION (what can I do?) — protect yourself / change the system
  route: Route, // clean-air route / protective tool
  grants: HandCoins, // a grant a resident can take up
  campaign: Megaphone, // a civic campaign residents drove
  // PLACE (which part of my city?) — neighbourhood comparison
  place: MapPin,
  // ACTOR (make the polluters stop?) — who must act
  cityGov: Landmark, // city government acted
  regulator: Scale, // a regulator / law banned or charged the polluter
  national: ShieldCheck, // national government forcing function
};

/**
 * Renders the headline stat for an entry card. Three honest shapes, mirroring
 * the EntryStat union: a before→after progression, a single real figure, or a
 * styled [TK] placeholder consistent with the detailed card's [figure TK] chip.
 */
function StatViz({ stat }: { stat: EntryStat }) {
  if (stat.kind === "tk") {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="rounded bg-amber-200 px-1.5 py-0.5 font-mono text-xs font-semibold text-amber-800">
          [TK]
        </span>
        <span className="text-xs leading-snug text-muted-foreground">
          {stat.metric}
        </span>
      </div>
    );
  }

  if (stat.kind === "figure") {
    return (
      <div className="flex flex-col items-start gap-1">
        {/* ~2x headline number (Jack 2026-05-23) — card reads as data-viz at a glance */}
        <span className="text-5xl font-bold leading-none tracking-tight text-foreground">
          {stat.value}
        </span>
        <span className="text-xs leading-snug text-muted-foreground">
          {stat.metric}
        </span>
      </div>
    );
  }

  // progression — before → after, both real
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-2">
        {/* `from` and arrow scaled up to stay balanced with the ~2x `to` value */}
        <span className="text-base font-medium text-muted-foreground">
          {stat.from}
        </span>
        <ArrowRight
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-muted-foreground/70"
        />
        <span className="text-5xl font-bold leading-none tracking-tight text-foreground">
          {stat.to}
        </span>
      </span>
      <span className="text-xs leading-snug text-muted-foreground">
        {stat.metric}
      </span>
    </div>
  );
}

interface EntryCardProps {
  card: ConcernCard;
  city: City;
  /** True when this card leads the deck for the active city (localisation). */
  isLead: boolean;
}

export function EntryCard({ card, city, isLead }: EntryCardProps) {
  const Icon = ICONS[card.iconKey];

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Card
            role="button"
            tabIndex={0}
            aria-label={`${card.facet} — ${city.name}. Open full detail.`}
            className={[
              "group cursor-pointer p-5 text-left transition-all",
              "hover:shadow-md hover:ring-1 hover:ring-foreground/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
              isLead ? "ring-2 ring-foreground/30" : "",
            ].join(" ")}
          />
        }
      >
        {/* Top row: icon + city. Icon ~2x (Jack 2026-05-23) so the card reads as
            a data-viz at a glance; city label stays as-is, top-aligned. */}
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-xl bg-muted text-foreground">
            <Icon aria-hidden="true" className="h-10 w-10" />
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span aria-hidden="true">{city.flag}</span>
            {city.name}
          </span>
        </div>

        {/* Hero: the headline stat */}
        <div className="mt-4">
          <StatViz stat={card.stat} />
        </div>

        {/* Minimal label: facet chip only. The "Leads {city}" textual marker was
            removed (Jack 2026-05-23) — redundant with the city label and ambiguous.
            Lead is now conveyed by POSITION (the per-city reorder in page.tsx) plus
            the `isLead` ring on the card; no textual marker. */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {card.facetLabel}
          </Badge>
        </div>
      </DialogTrigger>

      {/* Modal: the FULL detailed card, reused verbatim. Widened past the
          default max-w-sm so the full detail breathes. */}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {/* Accessible title/description for the dialog (visually carried by the
            card itself, so kept screen-reader-only to avoid duplication). */}
        <DialogTitle className="sr-only">
          {card.facet} — {city.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          What {city.name} did about {card.facetLabel.toLowerCase()}, the outcome,
          and why it could apply to your city.
        </DialogDescription>
        <ConcernCardView card={card} city={city} isLead={isLead} />
      </DialogContent>
    </Dialog>
  );
}
