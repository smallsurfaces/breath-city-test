/**
 * [city]/page.tsx — a Breathe Atlas city chapter (brief section 5).
 *
 * Purpose
 *   One chapter per chapter city, built from the same eight sections in the same order (brief 5.1):
 *     1. Opener (fixed)         ChapterOpener
 *     2. Hero map (fixed)       ChapterHeroMap: stylised country map for Milan, data map slot otherwise
 *     3. Key facts (fixed)      ChapterKeyFacts
 *     4. Feature story          FeatureStory (layout per city)
 *     5. Programme list         ProgrammeList (layout per city)
 *     6. Photos                 PhotoSection (layout per city)
 *     7. Go further (fixed)     GoFurther
 *     8. Ending (fixed)         ChapterEnding
 *   Content and layout choices come from ../_data/chapters.ts; the city's name, country, card image and
 *   mission line from ../_data/cities.ts. The chapter's ending carries the "All cities" button that
 *   opens the panel with this city highlighted (the nav no longer does, brief 4.1).
 *
 * Routing
 *   Only the seven chapter cities get a page: `generateStaticParams` pre-renders them and
 *   `dynamicParams = false` makes any other slug a 404. `getChapter` returns null for a non-chapter
 *   slug (404) and throws if the two data files disagree, which fails the build.
 *
 * Headings
 *   h1 is the city name (opener). Each later section has an h2 (the feature story's h2 is its
 *   headline; the ending's is "Next: [City]") and any sub-groups are h3. The hero map is a labelled
 *   region with no heading.
 *
 * Key exports: ChapterPage (default), generateStaticParams, generateMetadata, dynamicParams
 * External dependencies: next (Metadata type), next/navigation (notFound), ../_components/AtlasNav,
 *   ../_components/chapter/*, ../_data/cities, ../_data/chapters.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AtlasNav } from '../_components/AtlasNav'
import { ChapterEnding } from '../_components/chapter/ChapterEnding'
import { ChapterHeroMap } from '../_components/chapter/ChapterHeroMap'
import { ChapterKeyFacts } from '../_components/chapter/ChapterKeyFacts'
import { ChapterOpener } from '../_components/chapter/ChapterOpener'
import { FeatureStory } from '../_components/chapter/FeatureStory'
import { GoFurther } from '../_components/chapter/GoFurther'
import { PhotoSection } from '../_components/chapter/PhotoSection'
import { ProgrammeList } from '../_components/chapter/ProgrammeList'
import { CHAPTER_CITIES } from '../_data/cities'
import { chapterBySlug, getChapter, nextChapterCity } from '../_data/chapters'

/** Any slug not returned by generateStaticParams is a 404. */
export const dynamicParams = false

/** Id of the city name h1, which labels the chapter article. */
const TITLE_ID = 'atlas-chapter-title'

/** The seven chapter cities' slugs. */
export function generateStaticParams(): Array<{ city: string }> {
  return CHAPTER_CITIES.map((city) => ({ city: city.slug }))
}

/** Next 15 page props: route params arrive as a promise. */
type ChapterPageProps = {
  params: Promise<{ city: string }>
}

/** Browser tab title: the city name. */
export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { city: slug } = await params
  const entry = getChapter(slug)
  return { title: entry === null ? 'Breathe Atlas' : `${entry.city.name} · Breathe Atlas` }
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { city: slug } = await params
  const entry = getChapter(slug)
  if (entry === null) notFound()
  const { city, chapter } = entry

  const next = nextChapterCity(city.slug)
  if (next === null) {
    throw new Error(`Breathe Atlas: no next chapter after "${city.slug}"`)
  }
  // The next-city card shows that city's landmark image, which lives in its own chapter entry.
  const nextChapter = chapterBySlug(next.slug)
  if (nextChapter === null) {
    throw new Error(`Breathe Atlas: next city "${next.slug}" has no chapter entry`)
  }

  return (
    <main className="min-h-screen bg-background">
      <AtlasNav />
      <article aria-labelledby={TITLE_ID}>
        <ChapterOpener city={city} landmark={chapter.landmark} headingId={TITLE_ID} />
        <ChapterHeroMap city={city} chapter={chapter} />
        <div className="space-y-20 pb-20 pt-12 sm:space-y-28 sm:pb-28 sm:pt-16">
          <ChapterKeyFacts city={city} chapter={chapter} />
          <FeatureStory story={chapter.featureStory} layout={chapter.layouts.featureStory} />
          <ProgrammeList programmes={chapter.programmes} layout={chapter.layouts.programmes} />
          <PhotoSection photos={chapter.photos} layout={chapter.layouts.photos} cityName={city.name} />
          <GoFurther links={chapter.goFurther} />
          <ChapterEnding city={city} next={next} nextLandmark={nextChapter.landmark} />
        </div>
      </article>
    </main>
  )
}
