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
 *   `landmark` is the content pack's landmark image for the city: Breathe Cities' own photograph
 *   where BC has one, otherwise a free-licence Unsplash photo. Both are HOTLINKED for this internal
 *   prototype, never downloaded, and shown in greyscale (brief 5.1, 5.6).
 *
 * Credit
 *   The credit sits under the image as plain text, not a link: it is a two-line caption, and every
 *   link in a chapter is a 56px touch target (ChapterLink), which a caption this size cannot be.
 *   The same photo's source page is linked wherever it appears in the photo section.
 *
 * Key exports: ChapterOpener (named)
 * External dependencies: ../../_data/cities (AtlasCity type), ../../_data/chapters (ChapterPhoto type).
 */

import type { AtlasCity } from '../../_data/cities'
import type { ChapterPhoto } from '../../_data/chapters'

/** Props for ChapterOpener. */
type ChapterOpenerProps = {
  /** The chapter's city. */
  city: AtlasCity
  /** The city's landmark image, from the content pack. */
  landmark: ChapterPhoto
  /** Id for the h1, so the page's article can be labelled by it. */
  headingId: string
}

/** The opener. Server component. */
export function ChapterOpener({ city, landmark, headingId }: ChapterOpenerProps) {
  return (
    <header className="mx-auto flex max-w-6xl items-start gap-4 px-4 py-8 sm:gap-6 sm:py-12">
      {/* The city's landmark image, hotlinked and in greyscale, with its credit underneath. */}
      <figure className="w-20 shrink-0 sm:w-28">
        <img
          src={landmark.src ?? undefined}
          alt={landmark.alt}
          decoding="async"
          className="h-24 w-20 rounded-2xl bg-muted object-cover grayscale sm:h-32 sm:w-28"
        />
        <figcaption className="mt-1.5 text-[11px] leading-tight text-foreground/60">{landmark.credit}</figcaption>
      </figure>
      <div className="min-w-0">
        <h1 id={headingId} className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {city.name}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">{city.missionLine}</p>
      </div>
    </header>
  )
}
