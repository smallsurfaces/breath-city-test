/**
 * Best Practice Roadmap — Overview Page
 *
 * Purpose: Main landing page for the roadmap wireframe. Three sections:
 * 1. Hero with headline stats
 * 2. Three stages (Seeing / Understanding / Acting) with domain cards
 * 3. Coverage matrix (14 cities x 12 domains) as the navigation engine
 *
 * Key exports: default page component (Next.js App Router)
 * External dependencies: shadcn Card/Badge/Separator, roadmap-data, CoverageMatrix
 */

import Link from "next/link";
import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DOMAINS, CITIES, type Stage, STAGE_COLORS } from "@/data/roadmap-data";
import { CoverageMatrix } from "./_components/CoverageMatrix";
import { StageBadge } from "./_components/StageBadge";

export const metadata: Metadata = {
  title: "Best Practice Roadmap — Breathe Cities",
  description: "Every BC city is on the path to clean air by 2030.",
};

/** Groups domains by their stage for the three horizontal sections */
function groupByStage(): { stage: Stage; domains: typeof DOMAINS }[] {
  const stageOrder: Stage[] = ["Seeing", "Understanding", "Acting", "All stages"];
  const grouped = new Map<Stage, typeof DOMAINS>();

  for (const domain of DOMAINS) {
    const existing = grouped.get(domain.stage) ?? [];
    existing.push(domain);
    grouped.set(domain.stage, existing);
  }

  return stageOrder
    .filter((s) => grouped.has(s))
    .map((stage) => ({
      stage,
      domains: grouped.get(stage)!,
    }));
}

/** Subtitle text for each stage */
const STAGE_SUBTITLES: Record<Stage, string> = {
  Seeing: "Building the data infrastructure to understand what you are breathing",
  Understanding: "Diagnosing sources and quantifying health impacts",
  Acting: "Deploying interventions that measurably reduce pollution",
  "All stages": "Cross-cutting capabilities that support every stage of the journey",
};

export default function RoadmapOverviewPage() {
  const stages = groupByStage();
  const totalPopulation = CITIES.reduce((sum, c) => sum + c.populationMillions, 0);

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Hero */}
      <section className="border-b bg-muted/30 px-4 pt-16 pb-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <Badge variant="outline" className="text-xs">
            UX Wireframe — Best Practice Roadmap
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground max-w-2xl">
            Every BC city is on the path to clean air by 2030. Here&apos;s what&apos;s working &mdash; and who&apos;s doing it.
          </h1>

          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-2xl font-bold text-foreground">{CITIES.length}</span>
              <span className="ml-1.5 text-muted-foreground">cities</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">
                {totalPopulation.toFixed(0)}M
              </span>
              <span className="ml-1.5 text-muted-foreground">people</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">30%</span>
              <span className="ml-1.5 text-muted-foreground">cleaner air by 2030</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stage sections with domain cards */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {stages.map(({ stage, domains }) => (
            <div key={stage} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <StageBadge stage={stage} />
                  <h2 className="text-lg font-semibold text-foreground">{stage}</h2>
                </div>
                <p className="text-sm text-muted-foreground pl-0">
                  {STAGE_SUBTITLES[stage]}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {domains.map((domain) => (
                  <Link
                    key={domain.id}
                    href={`/ux-concepts/best-practice-roadmap/domain/${domain.slug}`}
                  >
                    <Card className="h-full hover:ring-2 hover:ring-foreground/20 transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-sm">
                          <span className="text-muted-foreground mr-1.5">
                            {String(domain.id).padStart(2, "0")}
                          </span>
                          {domain.shortName}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {domain.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-4xl" />

      {/* Coverage Matrix */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Coverage Matrix
            </h2>
            <p className="text-sm text-muted-foreground">
              14 cities &times; 12 domains. Filled dots = acted. Click any dot to see
              that city&apos;s contribution in that domain.
            </p>
          </div>

          <CoverageMatrix />

          <p className="text-xs text-muted-foreground">
            Column numbers correspond to domain IDs. Hover for domain name. Click
            a city name to see its full story.
          </p>
        </div>
      </section>
    </main>
  );
}
