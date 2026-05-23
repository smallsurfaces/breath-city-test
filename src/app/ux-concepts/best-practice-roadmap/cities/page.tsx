/**
 * cities/page.tsx -- Cities index page for the Best Practice Roadmap
 *
 * Purpose: A card grid of all 14 roadmap cities, mimicking the real BC cities
 * page at breathecities.org/cities/. Each card links into the city detail page.
 * Region filter chips are rendered inert (visual IA fidelity only).
 *
 * This route sits inside the roadmap layout so BcHeader/BcFooter are applied
 * automatically -- they are NOT imported here.
 *
 * Key exports: default page component
 * External dependencies: next/link, lucide-react, @/data/roadmap-data
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CITIES, getCoverageCount } from "@/data/roadmap-data";

/* Gradient combos cycled by card index -- uses BC colour tokens (hex vars). */
const GRADIENTS = [
  "linear-gradient(135deg, var(--bc-color-dark-blue), var(--bc-color-blue))",
  "linear-gradient(135deg, var(--bc-color-blue), var(--bc-color-teal))",
  "linear-gradient(135deg, var(--bc-color-teal), var(--bc-color-light-blue))",
  "linear-gradient(135deg, var(--bc-color-dark-blue), var(--bc-color-teal))",
];

/* Region filter chip labels -- inert, for IA fidelity with the real BC site. */
const REGION_FILTERS = [
  "All regions",
  "Europe",
  "Africa",
  "Asia",
  "Latin America",
];

export default function CitiesPage() {
  return (
    <main className="min-h-screen bg-background pb-0">
      {/* Hero section */}
      <section className="border-b border-border px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
            Cities
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A network of cities cutting air pollution.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            14 cities across four continents, working together through the
            Breathe Cities family to deliver measurable clean-air progress.
          </p>
        </div>
      </section>

      {/* Region filter chips -- inert, first chip styled as active */}
      <section className="border-b border-border px-4 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
          {REGION_FILTERS.map((label, i) => {
            const isActive = i === 0;
            return (
              <span
                key={label}
                className={[
                  "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-bc-white"
                    : "border border-border text-muted-foreground",
                ].join(" ")}
                style={
                  isActive
                    ? { backgroundColor: "var(--bc-color-dark-blue)" }
                    : undefined
                }
                aria-disabled="true"
              >
                {label}
              </span>
            );
          })}
        </div>
      </section>

      {/* City card grid */}
      <section className="px-4 py-10 sm:py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city, index) => {
            const coverage = getCoverageCount(city.slug);
            const gradient = GRADIENTS[index % GRADIENTS.length];

            return (
              <Link
                key={city.slug}
                href={`/ux-concepts/best-practice-roadmap/city/${city.slug}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl transition-shadow hover:shadow-lg"
                style={{ background: gradient }}
              >
                {/* Coverage badge -- top-right corner */}
                <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {coverage} {coverage === 1 ? "domain" : "domains"}
                </span>

                {/* Hover arrow -- top-right, revealed on hover */}
                <span className="absolute right-3 top-12 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4" />
                </span>

                {/* Bottom scrim with city name and country */}
                <div className="relative z-10 bg-gradient-to-t from-black/45 to-transparent px-4 pb-4 pt-10">
                  <h2 className="text-xl font-bold text-white">{city.name}</h2>
                  <p className="text-sm text-white/80">{city.country}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footnote */}
      <section className="border-t border-border px-4 py-6">
        <p className="mx-auto max-w-4xl text-center text-xs text-muted-foreground">
          City photography is BC&rsquo;s on the live site; coloured blocks
          stand in here.
        </p>
      </section>
    </main>
  );
}
