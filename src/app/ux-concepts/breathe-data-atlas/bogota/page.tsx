/**
 * bogota/page.tsx — the Bogotá city page (spec section 4), the pilot for the three-layer city page.
 *
 * Purpose
 *   Order, top to bottom (spec 4):
 *     1. City name (h1). No landmark image, no intro sentence.
 *     2. The map (section 5): method line with the IBOCA "i" credit above it, then AtlasDataMap,
 *        the largest element on the page, with its legend.
 *     3. The city section (section 6): the air quality network and the Breathe Cities intro.
 *     4. Go further (section 7).
 *     5. Next city (the re-skinned Atlas ending), then the site-level caveat in the footer (3.4).
 *   Everything else from the copied Atlas chapter is gone: opener image, key facts, feature story,
 *   programme list, photos, the "current conditions" line and the world locator map.
 *
 * Helper variants (spec 5.8)
 *   `?helper=text` (default), `?helper=icons`, `?helper=chips` switch how each pollutant reads in
 *   the tap card and the sensor detail. Reading the search param makes this page render per request.
 *
 * Data
 *   ../_data/bogota.ts (index, cycle, advice, sources, links, mock sensors), ../_data/boundaries.ts
 *   (the OSM outline for the map mask). All mock figures sit under the nav's "Prototype with sample
 *   data" notice; derived figures carry "Sample figure" (rule 8).
 *
 * Key exports: BogotaPage (default), metadata
 * External dependencies: next (Metadata), ../_components/*, ../_data/*.
 */

import type { Metadata } from 'next'
import { AtlasNav } from '../_components/AtlasNav'
import { SiteCaveat } from '../_components/SiteCaveat'
import { AtlasDataMap } from '../_components/chapter/AtlasDataMap'
import { ChapterEnding } from '../_components/chapter/ChapterEnding'
import { CreditInfo } from '../_components/chapter/CreditInfo'
import { OutboundLink } from '../_components/chapter/ChapterLink'
import { GoFurther } from '../_components/chapter/GoFurther'
import { CitySection } from '../_components/city/CitySection'
import { helperVariantFrom } from '../_components/city/PollutantHelper'
import { BOGOTA } from '../_data/bogota'
import { cityBoundary } from '../_data/boundaries'
import { ATLAS_CITIES } from '../_data/cities'

/** Browser tab title. */
export const metadata: Metadata = { title: 'Bogotá · Breathe Data Atlas' }

/** Id of the city name h1, which labels the page's article. */
const TITLE_ID = 'bda-city-title'

/**
 * The next city for the ending: Jakarta, the next city in the spec's order (Bogotá, then Jakarta,
 * Brussels, Sofia and Milan in the later pass). Throws if the city list ever loses it, which fails
 * the build rather than rendering a broken ending.
 */
function nextCity() {
  const next = ATLAS_CITIES.find((city) => city.slug === 'jakarta')
  if (next === undefined) throw new Error('Breathe Data Atlas: Jakarta is missing from the city list')
  return next
}

/** Next 15 page props: search params arrive as a promise. */
type BogotaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BogotaPage({ searchParams }: BogotaPageProps) {
  const city = BOGOTA
  // The pollutant helper variant (spec 5.8): ?helper=text (default), ?helper=icons, ?helper=chips.
  const helperVariant = helperVariantFrom((await searchParams).helper)
  const self = ATLAS_CITIES.find((entry) => entry.slug === city.slug)
  if (self === undefined) throw new Error('Breathe Data Atlas: Bogotá is missing from the city list')

  return (
    <>
      <main className="min-h-screen bg-background">
        <AtlasNav />
        <article aria-labelledby={TITLE_ID}>
          {/* 1. City name. */}
          <header className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:pt-12">
            <h1 id={TITLE_ID} className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              {city.name}
            </h1>
          </header>

          {/* 2. The map, with its method line (spec 5.1) and the IBOCA credit. */}
          <section aria-label={`${city.name} air quality map`}>
            <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 pb-3">
              <p className="text-base text-foreground/85">{city.methodLine}</p>
              <CreditInfo label={`About ${city.index.name}`} align="start" className="">
                <p>{city.index.publisher}</p>
                <OutboundLink href={city.adviceLink.url} className="-mb-3 text-sm font-semibold text-foreground underline">
                  {city.adviceLink.label}
                </OutboundLink>
              </CreditInfo>
            </div>
            <AtlasDataMap city={city} boundary={cityBoundary(city.slug)} helperVariant={helperVariant} />
          </section>

          <div className="space-y-20 pb-20 pt-12 sm:space-y-28 sm:pb-28 sm:pt-16">
            {/* 3. The city section. */}
            <CitySection city={city} />
            {/* 4. Go further. */}
            <GoFurther links={city.goFurther} />
            {/* 5. Next city. */}
            <ChapterEnding city={self} next={nextCity()} />
          </div>
        </article>
      </main>
      <SiteCaveat />
    </>
  )
}
