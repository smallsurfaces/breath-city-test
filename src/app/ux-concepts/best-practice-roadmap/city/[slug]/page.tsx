/**
 * City Detail Page — /ux-concepts/best-practice-roadmap/city/[slug]
 *
 * Purpose: Shows a single city's full story across the roadmap. Layout:
 * city header (flag/population) → full-width sensor map
 * (if city has sensor data) → contributions grouped by domain with practice cards.
 *
 * Key exports: default page component, generateStaticParams
 * External dependencies: shadcn Badge, roadmap-data, CitySensorMap/SENSOR_DATA, PracticeCardView
 */

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  CITIES,
  COVERAGE_MATRIX,
  getCityBySlug,
  getCoverageCount,
  getPracticesByCity,
  getDomainById,
} from "@/data/roadmap-data";
import { CitySensorMap, SENSOR_DATA } from "../../_components/SensorLandscape";
import { PracticeCardTile } from "../../_components/PracticeCardView";

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
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Sensor map — full width if city has data */}
      {SENSOR_DATA.some((s) => s.city.toLowerCase() === slug || s.shapeKey === slug) && (
        <section className="px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <CitySensorMap citySlug={slug} />
          </div>
        </section>
      )}

      {/* Contributions by domain */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Contributions by Domain
          </h2>

          {practices.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {practices.flatMap((practice) =>
                practice.cityExamples
                  .filter((ex) => ex.citySlug === city.slug)
                  .map((example) => (
                    <PracticeCardTile
                      key={`${practice.id}-${example.citySlug}`}
                      practice={practice}
                      example={example}
                      linkCity={false}
                    />
                  ))
              )}
            </div>
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
                        {domain.shortName}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
