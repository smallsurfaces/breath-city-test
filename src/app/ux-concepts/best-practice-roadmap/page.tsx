/**
 * Best Practice Roadmap — Overview Page
 *
 * Purpose: Main landing page for the roadmap wireframe. Structure:
 * 1. Hero with headline stats (cities, population, domains, target)
 * 2. Four pillar sections (Seeing, Understanding, Acting, Enabling)
 *    — each pillar shows its domains with one featured PracticeCardTile per domain
 * 3. Links to full domain pages
 *
 * Key exports: default page component (Next.js App Router)
 * External dependencies: shadcn Badge/Separator, roadmap-data, PracticeCardTile
 */

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DOMAINS,
  PRACTICE_CARDS,
  CITIES,
  STAGE_COLORS,
  type Stage,
} from "@/data/roadmap-data";
import { PracticeCardTile } from "./_components/PracticeCardView";

/**
 * Featured card per domain — picks the most visually compelling example.
 * Keyed by domainId; cardIndex selects within that domain's practice cards,
 * exampleIndex selects within that card's cityExamples array.
 */
const FEATURED: Record<number, { cardIndex: number; exampleIndex: number }> = {
  1: { cardIndex: 0, exampleIndex: 1 },   // Nairobi sensors
  2: { cardIndex: 0, exampleIndex: 1 },   // Accra source analysis
  3: { cardIndex: 0, exampleIndex: 0 },   // Paris health study
  4: { cardIndex: 0, exampleIndex: 3 },   // Brussels policy timeline
  5: { cardIndex: 1, exampleIndex: 0 },   // Mexico City vehicle restriction
  6: { cardIndex: 0, exampleIndex: 1 },   // Johannesburg fuel transition
  7: { cardIndex: 0, exampleIndex: 1 },   // Milan tree planting
  8: { cardIndex: 0, exampleIndex: 3 },   // Bangkok awareness timeline
  9: { cardIndex: 0, exampleIndex: 1 },   // Warsaw governance staircase
  10: { cardIndex: 0, exampleIndex: 0 },  // London investment ROI
  11: { cardIndex: 0, exampleIndex: 2 },  // Jakarta peer network
  12: { cardIndex: 0, exampleIndex: 3 },  // Bogota open data
};

/** Four pillars displayed in order with descriptions */
const PILLAR_ORDER: { stage: Stage; label: string; description: string }[] = [
  { stage: "Seeing", label: "Seeing", description: "Building the data infrastructure to see air quality clearly" },
  { stage: "Understanding", label: "Understanding", description: "Turning data into evidence — where pollution comes from and who it hurts" },
  { stage: "Acting", label: "Acting", description: "Interventions that measurably reduce pollution and exposure" },
  { stage: "Enabling", label: "Enabling", description: "The cross-cutting infrastructure that makes seeing, understanding, and acting work" },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span>Best Practice Roadmap</span>
        </div>

        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Best Practice Roadmap
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            How 14 cities serving 77 million people are building clean air — domain by domain, with measurable results.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-2xl font-bold text-foreground">14</span>
              <span className="text-muted-foreground ml-1">cities</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">77M</span>
              <span className="text-muted-foreground ml-1">people</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">12</span>
              <span className="text-muted-foreground ml-1">domains</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">30%</span>
              <span className="text-muted-foreground ml-1">reduction target by 2030</span>
            </div>
          </div>
        </div>

        {/* Pillar sections */}
        {PILLAR_ORDER.map((pillar) => {
          const pillarDomains = DOMAINS.filter((d) => d.stage === pillar.stage);
          const stageColor = STAGE_COLORS[pillar.stage];

          return (
            <section key={pillar.stage} className="space-y-6">
              <div className="space-y-1">
                <Badge className={`${stageColor.bg} ${stageColor.text} text-xs`}>
                  {pillar.label}
                </Badge>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pillarDomains.map((domain) => {
                  const domainCards = PRACTICE_CARDS.filter((p) => p.domainId === domain.id);
                  const featured = FEATURED[domain.id];
                  const card = domainCards[featured?.cardIndex ?? 0];
                  const example = card?.cityExamples[featured?.exampleIndex ?? 0];

                  if (!card || !example) {
                    return (
                      <Link
                        key={domain.id}
                        href={`/ux-concepts/best-practice-roadmap/domain/${domain.slug}`}
                        className="block"
                      >
                        <div className="rounded-lg border border-border/50 p-4 h-full hover:border-foreground/20 transition-colors">
                          <div className="text-xs text-muted-foreground mb-1">
                            {String(domain.id).padStart(2, "0")}
                          </div>
                          <div className="text-sm font-semibold text-foreground">
                            {domain.shortName}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {domain.description}
                          </p>
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <div key={domain.id} className="space-y-2">
                      <Link
                        href={`/ux-concepts/best-practice-roadmap/domain/${domain.slug}`}
                        className="block"
                      >
                        <div className="text-xs text-muted-foreground mb-0.5">
                          {String(domain.id).padStart(2, "0")}
                        </div>
                        <div className="text-sm font-semibold text-foreground hover:underline">
                          {domain.shortName}
                        </div>
                      </Link>
                      <PracticeCardTile
                        practice={card}
                        example={example}
                        linkCity={false}
                      />
                      <Link
                        href={`/ux-concepts/best-practice-roadmap/domain/${domain.slug}`}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      >
                        See all {domainCards.reduce((acc, c) => acc + c.cityExamples.length, 0)} cities →
                      </Link>
                    </div>
                  );
                })}
              </div>

              <Separator />
            </section>
          );
        })}
      </div>
    </main>
  );
}
