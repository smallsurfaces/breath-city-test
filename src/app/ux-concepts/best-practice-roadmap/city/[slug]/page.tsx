/**
 * City Detail Page — /ux-concepts/best-practice-roadmap/city/[slug]
 *
 * Purpose: Shows a single city's full story across the roadmap. Includes
 * city header with flag/population/membership badge, a coverage strip showing
 * which domains the city has acted in, contributions grouped by domain with
 * practice cards, and a sensor map placeholder.
 *
 * Key exports: default page component, generateStaticParams
 * External dependencies: shadcn Card/Badge/Separator, roadmap-data, CoverageStrip, PracticeCardView, StageBadge
 */

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CITIES,
  DOMAINS,
  COVERAGE_MATRIX,
  getCityBySlug,
  getCoverageCount,
  getPracticesByCity,
  getDomainById,
} from "@/data/roadmap-data";
import { CoverageStrip } from "../../_components/CoverageStrip";
import { PracticeCardView } from "../../_components/PracticeCardView";
import { StageBadge } from "../../_components/StageBadge";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-generate pages for all 14 city slugs */
export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  return {
    title: city
      ? `${city.name} — Best Practice Roadmap`
      : "City — Best Practice Roadmap",
  };
}

export default async function CityDetailPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const coverageCount = getCoverageCount(city.slug);
  const practices = getPracticesByCity(city.slug);
  const coverage = COVERAGE_MATRIX[city.slug] ?? [];

  // Group practices by domain for display
  const practicesByDomain = new Map<number, typeof practices>();
  for (const practice of practices) {
    const existing = practicesByDomain.get(practice.domainId) ?? [];
    existing.push(practice);
    practicesByDomain.set(practice.domainId, existing);
  }

  // Get domains this city is active in (from coverage matrix) for the
  // "domains without practice cards" placeholder
  const activeDomainIds = coverage
    .map((active, idx) => (active ? idx + 1 : null))
    .filter((id): id is number => id !== null);

  const domainsWithCards = new Set(practicesByDomain.keys());
  const domainsWithoutCards = activeDomainIds.filter(
    (id) => !domainsWithCards.has(id)
  );

  const hasThinCoverage = coverageCount <= 3;

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Header */}
      <section className="border-b bg-muted/30 px-4 pt-16 pb-10">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex items-center gap-2">
            <Link
              href="/ux-concepts/best-practice-roadmap"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Roadmap
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">{city.name}</span>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-4xl">{city.flag}</span>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {city.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                <span>{city.country}</span>
                <span>&middot;</span>
                <span>{city.populationLabel} people</span>
                <span>&middot;</span>
                <Badge variant="outline" className="text-xs">
                  BC Member
                </Badge>
              </div>
            </div>
          </div>

          {/* Coverage strip */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Domain coverage: {coverageCount} of 12
            </p>
            <CoverageStrip citySlug={city.slug} />
          </div>

          {hasThinCoverage && (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Journey in progress.</span>{" "}
                {city.name} is in the early stages of its clean air roadmap.
                Coverage will grow as partnerships deepen and local programmes launch.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contributions by domain */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Contributions by Domain
          </h2>

          {practices.length > 0 ? (
            <>
              {Array.from(practicesByDomain.entries()).map(
                ([domainId, domainPractices]) => {
                  const domain = getDomainById(domainId);
                  if (!domain) return null;

                  return (
                    <div key={domainId} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/ux-concepts/best-practice-roadmap/domain/${domain.slug}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {String(domain.id).padStart(2, "0")} {domain.shortName}
                        </Link>
                        <StageBadge stage={domain.stage} />
                      </div>

                      <div className="space-y-3">
                        {domainPractices.map((practice) => (
                          <PracticeCardView
                            key={practice.id}
                            practice={practice}
                            linkCities={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                No practice cards authored yet
              </p>
              <p className="text-xs text-muted-foreground">
                {city.name} has coverage in {coverageCount} domains but detailed
                practice cards have not been written for this city yet.
              </p>
            </div>
          )}

          {/* Domains active in matrix but without practice cards */}
          {domainsWithoutCards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Also active in ({domainsWithoutCards.length} domains &mdash; cards coming soon)
              </h3>
              <div className="flex flex-wrap gap-2">
                {domainsWithoutCards.map((domainId) => {
                  const domain = getDomainById(domainId);
                  if (!domain) return null;
                  return (
                    <Link
                      key={domainId}
                      href={`/ux-concepts/best-practice-roadmap/domain/${domain.slug}`}
                    >
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                        {String(domain.id).padStart(2, "0")} {domain.shortName}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <Separator className="mx-auto max-w-3xl" />

      {/* Sensor map placeholder — Stage 1 */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sensor Map
          </h2>

          <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 flex items-center justify-center aspect-video max-h-64">
            <div className="text-center space-y-1 px-4">
              <p className="text-sm font-medium text-muted-foreground">
                City sensor map &mdash; ownership &times; grade
              </p>
              <p className="text-xs text-muted-foreground">
                Stage 1: Visualising {city.name}&apos;s monitoring network —
                reference stations, low-cost sensors, and community monitors
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
