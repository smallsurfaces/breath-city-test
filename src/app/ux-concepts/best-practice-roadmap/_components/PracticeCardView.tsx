/**
 * PracticeCardView.tsx
 *
 * Purpose: Renders a single practice card — the atomic content unit of the
 * roadmap. Shows the practice name, domain/stage badges, description,
 * impact stats, and city examples with their outcome states.
 *
 * Key exports: PracticeCardView
 * External dependencies: shadcn Card/Badge/Progress, roadmap-data types
 */

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type PracticeCard,
  type CityExample,
  getDomainById,
  getCityBySlug,
  getPracticeById,
} from "@/data/roadmap-data";
import { StageBadge } from "./StageBadge";

interface PracticeCardViewProps {
  practice: PracticeCard;
  /** When true, links city names to their city pages */
  linkCities?: boolean;
  /** Optional HTML id for scroll-to-anchor behaviour */
  anchorId?: string;
}

/** Renders the outcome state as a visual treatment appropriate to the wireframe */
function OutcomeDisplay({ example }: { example: CityExample }) {
  if (example.outcomeState === "measured") {
    return (
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{example.outcomeBefore}</span>
          <span className="text-foreground font-medium">&rarr;</span>
          <span className="text-foreground font-medium">{example.outcomeAfter}</span>
        </div>
        {example.outcomeChange && (
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 max-w-48 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-foreground/60 rounded-full"
                style={{ width: "65%" }}
              />
            </div>
            <span className="text-xs font-medium text-foreground">
              {example.outcomeChange}
            </span>
          </div>
        )}
        {example.outcomeNote && (
          <p className="text-xs text-muted-foreground">{example.outcomeNote}</p>
        )}
      </div>
    );
  }

  if (example.outcomeState === "baseline-established") {
    return (
      <div className="mt-1.5">
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
          Measuring &mdash; baseline established {example.outcomeNote}
        </Badge>
      </div>
    );
  }

  // baseline-building
  return (
    <div className="mt-1.5">
      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
        Baseline building &mdash; first consistent data
      </Badge>
    </div>
  );
}

/** Renders a single city example within a practice card */
function CityExampleRow({
  example,
  linkCities,
}: {
  example: CityExample;
  linkCities: boolean;
}) {
  const city = getCityBySlug(example.citySlug);
  if (!city) return null;

  const cityLabel = (
    <span className="font-medium text-foreground">
      {city.flag} {city.name}
    </span>
  );

  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {linkCities ? (
          <Link
            href={`/ux-concepts/best-practice-roadmap/city/${city.slug}`}
            className="underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground"
          >
            {cityLabel}
          </Link>
        ) : (
          cityLabel
        )}
        <span className="text-muted-foreground">&middot;</span>
        <span className="text-xs text-muted-foreground">{city.populationLabel}</span>
        <span className="text-muted-foreground">&middot;</span>
        <Badge
          variant={example.provenance === "BC Partnership" ? "outline" : "secondary"}
          className="text-xs"
        >
          {example.provenance}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {example.interventionName}
        {example.introducedYear !== "ongoing" && `, introduced ${example.introducedYear}`}
        {example.introducedYear === "ongoing" && ", ongoing"}
      </p>
      <OutcomeDisplay example={example} />
    </div>
  );
}

/** The full practice card component — atomic unit of the roadmap */
export function PracticeCardView({
  practice,
  linkCities = true,
  anchorId,
}: PracticeCardViewProps) {
  const domain = getDomainById(practice.domainId);

  return (
    <Card id={anchorId} className="scroll-mt-16">
      <CardHeader>
        <CardTitle className="text-base">{practice.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {domain && (
            <Link
              href={`/ux-concepts/best-practice-roadmap/domain/${domain.slug}`}
              className="hover:underline"
            >
              <Badge variant="outline" className="text-xs">
                {domain.shortName}
              </Badge>
            </Link>
          )}
          {domain && <StageBadge stage={domain.stage} />}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{practice.description}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {practice.totalPopulationImpacted} people impacted
          </span>
          <span>&middot;</span>
          <span>
            {practice.cityCount} {practice.cityCount === 1 ? "city" : "cities"}
          </span>
        </div>

        <Separator />

        <div className="space-y-4">
          {practice.cityExamples.map((example) => (
            <CityExampleRow
              key={example.citySlug}
              example={example}
              linkCities={linkCities}
            />
          ))}
        </div>

        {practice.relatedPracticeIds.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Related:</span>
              {practice.relatedPracticeIds.map((relId) => {
                const related = getPracticeById(relId);
                if (!related) return null;
                const relDomain = getDomainById(related.domainId);
                return (
                  <Link
                    key={relId}
                    href={`/ux-concepts/best-practice-roadmap/domain/${relDomain?.slug ?? ""}`}
                    className="underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground text-foreground"
                  >
                    {related.name}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
