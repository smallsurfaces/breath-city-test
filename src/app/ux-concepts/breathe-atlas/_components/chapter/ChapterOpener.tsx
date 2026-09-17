/**
 * ChapterOpener.tsx — chapter section 1, the opener (fixed layout, brief 5.1).
 *
 * Purpose
 *   The city's small greyscale Breathe Cities landmark image beside the city name (the page's h1),
 *   with the city's mission line. It sits above the hero map, never over it.
 *
 *   The h1 follows the concept type cap (text-3xl, sm:text-4xl). ConceptHero is not used because
 *   it has no slot beside the heading and sets the lead in the muted steel tone, which is too faint
 *   for body text; the cover segment uses foreground/80 for body copy, and so does this.
 *
 * IMAGE RIGHTS
 *   `city.cardImage` is Breathe Cities' own card image, HOTLINKED from breathecities.org for this
 *   internal prototype (see ../../_data/cities.ts). Shown in greyscale (filter: grayscale(1)).
 *
 * Key exports: ChapterOpener (named)
 * External dependencies: ../../_data/cities (AtlasCity type).
 */

import type { AtlasCity } from '../../_data/cities'

/** Props for ChapterOpener. */
type ChapterOpenerProps = {
  /** The chapter's city. */
  city: AtlasCity
  /** Id for the h1, so the page's article can be labelled by it. */
  headingId: string
}

/** The opener. Server component. */
export function ChapterOpener({ city, headingId }: ChapterOpenerProps) {
  return (
    <header className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-8 sm:gap-6 sm:py-12">
      {/* BC's landmark card image, cropped to its illustrated lower part, in greyscale. */}
      <img
        src={city.cardImage}
        alt={`Landmark in ${city.name}`}
        decoding="async"
        className="h-24 w-20 shrink-0 rounded-2xl bg-muted object-cover object-bottom grayscale sm:h-32 sm:w-28"
      />
      <div className="min-w-0">
        <h1 id={headingId} className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {city.name}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">{city.missionLine}</p>
      </div>
    </header>
  )
}
