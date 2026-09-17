/**
 * [city]/page.tsx — Breathe Atlas chapter route (STUB for the seven chapter cities).
 *
 * Purpose
 *   Gives the globe card's Open and the cover browser's arrows a real destination, and gives the All
 *   cities panel a chapter page to highlight its city on (brief 5.9). This stub holds only the nav,
 *   the city name, a line saying the chapter comes next, and a link back to the cover. The next build
 *   segment replaces it with the chapter itself (brief section 5).
 *
 * Routing
 *   Only the seven chapter cities get a page: `generateStaticParams` pre-renders them and
 *   `dynamicParams = false` makes any other slug a 404. `notFound()` guards the same rule inside the
 *   page, so it holds even if the route config changes.
 *
 * Key exports: ChapterStubPage (default), generateStaticParams, dynamicParams
 * External dependencies: next/link, next/navigation (notFound), ../_components/AtlasNav,
 *   ../breathe-atlas-chrome.config, ../_data/cities.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AtlasNav } from '../_components/AtlasNav'
import { BREATHE_ATLAS_ROUTE } from '../breathe-atlas-chrome.config'
import { CHAPTER_CITIES, chapterCityBySlug } from '../_data/cities'

/** Any slug not returned by generateStaticParams is a 404. */
export const dynamicParams = false

/** The seven chapter cities' slugs. */
export function generateStaticParams(): Array<{ city: string }> {
  return CHAPTER_CITIES.map((city) => ({ city: city.slug }))
}

/** Next 15 page props: route params arrive as a promise. */
type ChapterStubPageProps = {
  params: Promise<{ city: string }>
}

export default async function ChapterStubPage({ params }: ChapterStubPageProps) {
  const { city: slug } = await params
  const city = chapterCityBySlug(slug)
  if (city === null) notFound()

  return (
    <main className="min-h-screen bg-background">
      <AtlasNav currentCityId={city.id} />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{city.name}</h1>
        <p className="mt-4 text-base text-foreground/80">This chapter is being built in the next step.</p>
        <Link
          href={BREATHE_ATLAS_ROUTE}
          className="mt-6 inline-flex min-h-14 items-center rounded-2xl text-sm font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Back to the globe
        </Link>
      </section>
    </main>
  )
}
