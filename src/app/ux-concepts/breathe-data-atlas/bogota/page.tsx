/**
 * bogota/page.tsx — the Bogotá city page (spec section 4), the pilot for the three-layer city page.
 *
 * Purpose
 *   Order, top to bottom (spec 4):
 *     1. City name (h1). No landmark image, no intro sentence.
 *     2. The map (section 5): AtlasDataMap, the largest element on the page, with its legend. The
 *        method line and its "i" moved into the legend's one "i" (iteration 2, decisions B1, B2).
 *     3. "Bogotá's air quality network" (decision F), then the separate "Breathe Cities in Bogotá"
 *        section (decision I).
 *     4. Go further (decision J).
 *     5. Next city (the re-skinned Atlas ending), then the city caveat in the footer (decision K1).
 *   Everything else from the copied Atlas chapter is gone: opener image, key facts, feature story,
 *   programme list, photos, the "current conditions" line and the world locator map.
 *
 * Static rendering
 *   The `?helper` variants are gone (iteration 2, decision E6), so the page reads no search params
 *   and is pre-rendered again.
 *
 * Data
 *   ../_data/bogota.ts (index, cycle, advice, sources, links, mock sensors), ../_data/boundaries.ts
 *   (the OSM outline for the map mask). All mock figures sit under the nav's "Prototype with sample
 *   data" notice, the one sample disclosure (decision K2).
 *
 * Key exports: BogotaPage (default), metadata
 * External dependencies: next (Metadata), ../_components/*, ../_data/*.
 */

import type { Metadata } from 'next'
import { AtlasNav } from '../_components/AtlasNav'
import { SiteCaveat } from '../_components/SiteCaveat'
import { AtlasDataMap } from '../_components/chapter/AtlasDataMap'
import { ChapterEnding } from '../_components/chapter/ChapterEnding'
import { GoFurther } from '../_components/chapter/GoFurther'
import { BreatheCitiesSection, CitySection } from '../_components/city/CitySection'
import { BOGOTA } from '../_data/bogota'
import { cityCaveat } from '../_data/cover-copy'
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

export default function BogotaPage() {
  const city = BOGOTA
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

          {/* 2. The map. The method line and the index credit sit behind the legend's "i". */}
          <section aria-label={`${city.name} air quality map`}>
            <AtlasDataMap city={city} boundary={cityBoundary(city.slug)} />
          </section>

          <div className="space-y-20 pb-20 pt-12 sm:space-y-28 sm:pb-28 sm:pt-16">
            {/* 3. The network, then Breathe Cities in the city. */}
            <CitySection city={city} />
            <BreatheCitiesSection city={city} />
            {/* 4. Go further. */}
            <GoFurther links={city.goFurther} cityName={city.name} />
            {/* 5. Next city. */}
            <ChapterEnding city={self} next={nextCity()} />
          </div>
        </article>
      </main>
      <SiteCaveat text={cityCaveat(city.name)} notes={[]} />
    </>
  )
}
