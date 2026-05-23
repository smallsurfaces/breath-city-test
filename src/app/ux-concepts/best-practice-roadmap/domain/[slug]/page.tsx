/**
 * Domain Detail Page — /ux-concepts/best-practice-roadmap/domain/[slug]
 *
 * Purpose: Shows a single domain with its stage badge, description, all
 * practice cards for that domain, and related domain links at the bottom.
 * Built for three domains with real data: monitoring, source-apportionment,
 * transport. Other domain slugs render a "coming soon" placeholder.
 *
 * Key exports: default page component, generateStaticParams
 * External dependencies: shadcn Card/Badge/Separator, roadmap-data, PracticeCardView, StageBadge
 */

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DOMAINS,
  getDomainBySlug,
  getPracticesByDomain,
} from "@/data/roadmap-data";
import { PracticeCardView } from "../../_components/PracticeCardView";
import { StageBadge } from "../../_components/StageBadge";

interface DomainPageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-generate pages for all 12 domain slugs */
export function generateStaticParams() {
  return DOMAINS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: DomainPageProps): Promise<Metadata> {
  const { slug } = await params;
  const domain = getDomainBySlug(slug);
  return {
    title: domain
      ? `${domain.shortName} — Best Practice Roadmap`
      : "Domain — Best Practice Roadmap",
  };
}

/** Identifies related domains based on stage proximity */
function getRelatedDomains(currentId: number) {
  const current = DOMAINS.find((d) => d.id === currentId);
  if (!current) return [];

  // Show other domains in the same stage, plus one from each adjacent stage
  return DOMAINS.filter((d) => d.id !== currentId)
    .sort((a, b) => {
      // Same stage first, then by ID proximity
      const aScore = a.stage === current.stage ? 0 : 1;
      const bScore = b.stage === current.stage ? 0 : 1;
      if (aScore !== bScore) return aScore - bScore;
      return Math.abs(a.id - currentId) - Math.abs(b.id - currentId);
    })
    .slice(0, 4);
}

export default async function DomainDetailPage({ params }: DomainPageProps) {
  const { slug } = await params;
  const domain = getDomainBySlug(slug);

  if (!domain) {
    notFound();
  }

  const practices = getPracticesByDomain(domain.id);
  const relatedDomains = getRelatedDomains(domain.id);
  const hasPractices = practices.length > 0;

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Header */}
      <section className="border-b bg-muted/30 px-4 pt-16 pb-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Link
              href="/ux-concepts/best-practice-roadmap"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Roadmap
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">Domain {domain.id}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-xs tabular-nums">
              {String(domain.id).padStart(2, "0")}
            </Badge>
            <StageBadge stage={domain.stage} />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {domain.name}
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl">
            {domain.description}
          </p>
        </div>
      </section>

      {/* Practice cards */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {hasPractices ? (
            <>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Practices ({practices.length})
              </h2>

              <div className="space-y-4">
                {practices.map((practice) => (
                  <PracticeCardView
                    key={practice.id}
                    practice={practice}
                    linkCities={true}
                    anchorId={
                      // Create anchor IDs for each city mentioned so the
                      // coverage matrix can link directly to a city's example
                      undefined
                    }
                  />
                ))}
              </div>

              {/* Per-city anchors: render invisible anchor targets for scroll-to */}
              {practices.flatMap((p) =>
                p.cityExamples.map((ex) => (
                  <div key={`${p.id}-${ex.citySlug}`} id={ex.citySlug} className="scroll-mt-16" />
                ))
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Practice cards coming soon
              </p>
              <p className="text-xs text-muted-foreground">
                This domain has city coverage in the matrix but detailed practice
                cards have not been authored yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <Separator className="mx-auto max-w-3xl" />

      {/* Related domains */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Related Domains
          </h2>

          <div className="grid gap-2 sm:grid-cols-2">
            {relatedDomains.map((rd) => (
              <Link
                key={rd.id}
                href={`/ux-concepts/best-practice-roadmap/domain/${rd.slug}`}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground tabular-nums">
                  {String(rd.id).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {rd.shortName}
                </span>
                <StageBadge stage={rd.stage} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
