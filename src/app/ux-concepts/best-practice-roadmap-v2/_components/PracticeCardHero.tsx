/**
 * PracticeCardHero.tsx — outcome-as-hero card variant for the roadmap overview grid.
 *
 * Purpose
 *   Sibling of PracticeCardTile. Where PracticeCardTile renders city + practice name as the
 *   dominant typography with the chart as supporting evidence, PracticeCardHero inverts the
 *   hierarchy: the outcome (a number / metric like "+100 sensors", "20 stations", "-42% PM2.5")
 *   becomes the visually dominant element alongside the chart, the practice/intervention name
 *   becomes a single supporting line, and the city + population + introduced-year sit as quiet
 *   footer metadata.
 *
 *   This component is consumed only on the v2 roadmap overview page (page.tsx). Detail pages
 *   continue to use PracticeCardTile so their behaviour is unchanged.
 *
 * Outcome resolution
 *   The hero text is picked in this order (first non-empty wins):
 *     1. example.outcomeChange — short, hand-authored change string (most cards have this)
 *     2. example.chartData.change — change field on numeric chart types (deltaBar, sparkline, etc.)
 *     3. example.chartData.value — primary value for outcomeHighlight cards
 *     4. example.chartData.investment — primary value for investmentROI cards
 *     5. example.chartData.headline — narrative headline for complex/timeline cards
 *     6. null — caller falls back to the intervention-name-as-hero treatment
 *
 *   When (1–5) all fail (typical for policyTimeline / governanceStaircase / awarenessTimeline
 *   cards where the story isn't a single number), the practice name is promoted to hero scale
 *   and treated typographically — see the "no-outcome fallback" branch below.
 *
 * Key exports: PracticeCardHero (named)
 * External dependencies: shadcn Card, @/data/roadmap-data lookup helpers, sibling
 *   PracticeCardView (re-uses ChartViz dispatcher via the shared module).
 */

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

/** Props for PracticeCardHero. Mirrors the subset of PracticeCardTile props this variant needs. */
interface PracticeCardHeroProps {
  /** The practice this card belongs to — used to render its name as the supporting line. */
  practice: PracticeCard;
  /** The single city example to showcase. */
  example: CityExample;
}

/**
 * Resolve the hero outcome string from the example data. Walks the priority order documented
 * above and returns the first non-empty match, or null if no clean numeric/metric outcome
 * exists. The caller branches on the null result to render the fallback layout.
 */
function resolveOutcomeHero(example: CityExample): string | null {
  if (example.outcomeChange && example.outcomeChange.trim().length > 0) {
    return example.outcomeChange;
  }
  const cd = example.chartData;
  if (!cd) return null;
  if (typeof cd.change === "string" && cd.change.trim().length > 0) return cd.change;
  if (typeof cd.value === "string" && cd.value.trim().length > 0) return cd.value;
  if (typeof cd.investment === "string" && cd.investment.trim().length > 0) return cd.investment;
  if (typeof cd.headline === "string" && cd.headline.trim().length > 0) return cd.headline;
  return null;
}

/**
 * Decide whether the resolved hero string is "short enough" to display at full hero scale
 * (28–40px) vs. needs to be stepped down to a medium scale because it's a sentence rather than
 * a number. Heuristic: 24 chars or fewer = hero scale; longer = stepped-down scale.
 */
function isShortHero(outcome: string): boolean {
  return outcome.length <= 24;
}

/**
 * PracticeCardHero — outcome-first card layout for the roadmap overview grid. Three zones:
 *
 *   1. Hero zone (visually dominant): outcome number/metric + chart viz
 *   2. Supporting line: the intervention name as a single readable line
 *   3. Footer metadata: city + population + introduced year, quiet and small
 *
 * When no clean numeric outcome exists for a card, the intervention name is promoted up to
 * the hero zone and rendered at a larger scale instead. The chart still renders below it.
 */
export function PracticeCardHero({ practice, example }: PracticeCardHeroProps) {
  const city = getCityBySlug(example.citySlug);
  if (!city) return null;

  const outcome = resolveOutcomeHero(example);
  const shortHero = outcome !== null && isShortHero(outcome);

  /* Chart viz block — shared dispatcher from PracticeCardView. Kept in a tinted muted-bg panel
   * matching the existing PracticeCardTile chart treatment for visual continuity. */
  const chartBlock = example.chartData ? (
    <div
      className="rounded-lg bg-muted/30 p-3 flex items-center justify-center"
      style={{ minHeight: 140 }}
    >
      <div className="w-full">
        <ChartViz data={example.chartData} cityFlag={city.flag} />
      </div>
    </div>
  ) : null;

  /* Introduced-year string for the footer metadata row. Kept identical to PracticeCardTile's
   * treatment for content consistency. */
  const introducedStr =
    example.introducedYear === "ongoing"
      ? "ongoing"
      : `introduced ${example.introducedYear}`;

  /* Footer metadata block — city + population + year, quiet and small. Treated as the
   * caption rather than a heading. */
  const footerMeta = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground pt-3 mt-auto">
      <span className="font-medium text-foreground/70">
        {city.flag} {city.name}
      </span>
      <span aria-hidden="true">&middot;</span>
      <span>{city.populationLabel}</span>
      <span aria-hidden="true">&middot;</span>
      <span>{introducedStr}</span>
    </div>
  );

  /* Branch 1 — clean numeric / short outcome exists: render outcome as the hero text */
  if (outcome !== null) {
    return (
      <Card className="flex flex-col h-full">
        <CardContent className="flex flex-col h-full gap-4 p-6">
          {/* Hero zone — outcome number/metric on the left, chart on the right (md+) */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div
                className="font-bold tracking-tight text-foreground leading-[1.05]"
                style={{
                  fontSize: shortHero ? "2.25rem" : "1.375rem",
                  lineHeight: shortHero ? 1.05 : 1.2,
                }}
              >
                {outcome}
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                outcome
              </div>
            </div>
            {chartBlock && (
              <div className="md:w-[200px] flex-shrink-0">{chartBlock}</div>
            )}
          </div>

          {/* Supporting line — practice intervention name as a single readable line */}
          <p className="text-[15px] leading-snug text-foreground/80">
            {example.interventionName}
          </p>

          {footerMeta}
        </CardContent>
      </Card>
    );
  }

  /* Branch 2 — no-outcome fallback: promote the intervention name to hero scale and treat it
   * typographically. Chart still renders below. This handles policyTimeline / governanceStaircase
   * / awarenessTimeline / fundingProgression style cards where the story is a sequence, not a
   * single number. */
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex flex-col h-full gap-4 p-6">
        {/* Hero zone — intervention name at large scale, chart below */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {practice.name}
          </div>
          <div
            className="font-bold tracking-tight text-foreground leading-snug"
            style={{ fontSize: "1.375rem" }}
          >
            {example.interventionName}
          </div>
        </div>

        {chartBlock}

        {footerMeta}
      </CardContent>
    </Card>
  );
}
