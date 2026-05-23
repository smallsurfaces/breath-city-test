/**
 * Domain Detail Page — /ux-concepts/best-practice-roadmap/domain/[slug]
 *
 * Purpose: Shows a single domain with its stage badge, description, and all
 * practice cards for that domain. Built for three domains with real data:
 * monitoring, source-apportionment, transport. Other domain slugs render a
 * "coming soon" placeholder.
 *
 * Key exports: default page component, generateStaticParams
 * External dependencies: roadmap-data, PracticeCardView, StageBadge
 */

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DOMAINS,
  getDomainBySlug,
  getPracticesByDomain,
} from "@/data/roadmap-data";
import { PracticeCardTile } from "../../_components/PracticeCardView";
import { StageBadge } from "../../_components/StageBadge";
import { SensorLandscape } from "../../_components/SensorLandscape";

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

export default async function DomainDetailPage({ params }: DomainPageProps) {
  const { slug } = await params;
  const domain = getDomainBySlug(slug);

  if (!domain) {
    notFound();
  }

  const practices = getPracticesByDomain(domain.id);
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
            <span className="text-xs text-muted-foreground">{domain.shortName}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
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

      {/* Sensor landscape (monitoring domain only) */}
      {slug === "monitoring" && (
        <section className="px-4 py-10">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Sensor Coverage Landscape
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                How three BC cities achieve monitoring coverage through different
                ownership models and sensor types.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SensorLandscape />
            </div>
          </div>
        </section>
      )}

      {/* Practice cards */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          {hasPractices ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {practices.flatMap((practice) =>
                  practice.cityExamples.map((example) => (
                    <PracticeCardTile
                      key={`${practice.id}-${example.citySlug}`}
                      practice={practice}
                      example={example}
                      linkCity={true}
                    />
                  ))
                )}
              </div>
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

    </main>
  );
}
