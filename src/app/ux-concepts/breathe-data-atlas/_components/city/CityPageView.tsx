/**
 * CityPageView.tsx — one city page, the same for every city (SPEC ADDENDUM: "Every city page uses the
 * same components and order; only the map method and the data change").
 *
 * Purpose
 *   The Bogotá page after iteration 4 is the template. Order, top to bottom:
 *     1. The nav, carrying "Breathe Cities / [City]" as the page's one h1 (round 3 decision G); the
 *        large title under the nav is gone, so the map moves up.
 *     2. The map with its legend and "i" (AtlasDataMap), in the city's own method.
 *     3. "[City]'s air quality network" (sensor types, pollutants monitored), then "Breathe Cities in
 *        [City]" (population where confirmed, blurb, programmes-and-policies link).
 *     4. Go further (the city's air quality services, Get the data).
 *     5. Next city (the built cities in carousel order), then the city caveat in the footer.
 *
 * Key exports: CityPageView (named)
 * External dependencies: ../AtlasNav, ../SiteCaveat, ../chapter/*, ./CitySection,
 *   ../../_data/*, ../../breathe-data-atlas-chrome.config.
 */

import { AtlasNav } from '../AtlasNav'
import { SiteCaveat } from '../SiteCaveat'
import { AtlasDataMap } from '../chapter/AtlasDataMap'
import { ChapterEnding } from '../chapter/ChapterEnding'
import { GoFurther } from '../chapter/GoFurther'
import { BreatheCitiesSection, CitySection } from './CitySection'
import { cityCaveat } from '../../_data/cover-copy'
import { cityBoundary } from '../../_data/boundaries'
import { CITIES_ALPHABETICAL } from '../../_data/cities'
import type { CityPage } from '../../_data/city-page'
import { nextCityPageSlug } from '../../breathe-data-atlas-chrome.config'

/** Id of the city name h1 (in the nav), which labels the page's article. */
const TITLE_ID = 'bda-city-title'

/** Props for CityPageView. */
type CityPageViewProps = {
  city: CityPage
}

/** A city page. Server component; the map and the tiles are its client parts. */
export function CityPageView({ city }: CityPageViewProps) {
  const self = CITIES_ALPHABETICAL.find((entry) => entry.slug === city.slug)
  if (self === undefined) throw new Error(`Breathe Data Atlas: ${city.name} is missing from the city list`)
  const nextSlug = nextCityPageSlug(city.slug, CITIES_ALPHABETICAL.map((entry) => entry.slug))
  const next = CITIES_ALPHABETICAL.find((entry) => entry.slug === nextSlug)
  if (next === undefined) throw new Error(`Breathe Data Atlas: ${nextSlug} is missing from the city list`)

  return (
    <>
      <main className="min-h-screen bg-background">
        <AtlasNav cityName={city.name} titleId={TITLE_ID} />
        <article aria-labelledby={TITLE_ID}>
          {/* The map, straight under the nav (decision G). */}
          <section aria-label={`${city.name} air quality map`} className="pt-4 sm:pt-6">
            <AtlasDataMap city={city} boundary={cityBoundary(city.slug)} />
          </section>

          <div className="space-y-20 pb-20 pt-12 sm:space-y-28 sm:pb-28 sm:pt-16">
            <CitySection city={city} />
            <BreatheCitiesSection city={city} />
            <GoFurther links={city.goFurther} cityName={city.name} />
            <ChapterEnding city={self} next={next} />
          </div>
        </article>
      </main>
      <SiteCaveat text={cityCaveat(city.name)} notes={[]} />
    </>
  )
}
