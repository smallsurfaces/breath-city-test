/**
 * ChapterOpener.tsx — chapter section 1, the opener (fixed layout, brief 5.1).
 *
 * Purpose
 *   The city's small greyscale image beside the city name (the page's h1), with the city's mission
 *   line. It sits above the hero map, never over it.
 *
 *   The h1 follows the concept type cap (text-3xl, sm:text-4xl). ConceptHero is not used because
 *   it has no slot beside the heading and sets the lead in the muted steel tone, which is too faint
 *   for body text; the cover segment uses foreground/80 for body copy, and so does this.
 *
 * The image (round 3, R3.4)
 *   The city's `cardImage` from ../../_data/cities.ts: the same Breathe Cities card image the
 *   carousel and the globe card use, so each city has one image everywhere. (It used to be the
 *   content pack's separate landmark photo.) Cropped as a rounded rectangle like the globe card's
 *   photo (rounded-xl), and anchored to the bottom (object-bottom): the card images are tall
 *   cutouts with the landmark low in the frame, so a bottom-anchored crop keeps the landmark in view.
 *
 * IMAGE RIGHTS
 *   Breathe Cities' own card image, HOTLINKED from breathecities.org for this internal prototype,
 *   never downloaded, and shown in greyscale (brief 5.1, 5.6). See ../../_data/cities.ts.
 *
 * Credit (round 2, item 9; names Breathe Cities since round 3, R3.4)
 *   The credit sits behind the quiet "i" on the image's bottom-right corner (PhotoCreditInfo,
 *   labelled "Photo credit"), like every other chapter photo. It reads "Photo: Breathe Cities",
 *   because the card images are BC's own, and it links to the image itself on breathecities.org,
 *   the one source URL this prototype holds for every card image (no BC page is recorded for each
 *   city, and none is invented).
 *
 * Key exports: ChapterOpener (named)
 * External dependencies: ./PhotoFigure (PhotoCreditInfo), ../../_data/cities (AtlasCity type),
 *   ../../_data/chapters (ChapterPhoto type).
 */

import { PhotoCreditInfo } from './PhotoFigure'
import type { AtlasCity } from '../../_data/cities'
import type { ChapterPhoto } from '../../_data/chapters'

/** Props for ChapterOpener. */
type ChapterOpenerProps = {
  /** The chapter's city (name, mission line and card image). */
  city: AtlasCity
  /** Id for the h1, so the page's article can be labelled by it. */
  headingId: string
}

/**
 * The city's card image as a ChapterPhoto, so it takes the same credit "i" as every other chapter
 * photo. The alt text matches the carousel's for the same image. Pure.
 */
function cardImagePhoto(city: AtlasCity): ChapterPhoto {
  return {
    src: city.cardImage,
    alt: `Landmark in ${city.name}`,
    credit: 'Breathe Cities',
    sourceUrl: city.cardImage,
    status: 'verified',
  }
}

/** The opener. Server component. */
export function ChapterOpener({ city, headingId }: ChapterOpenerProps) {
  const photo = cardImagePhoto(city)
  return (
    <header className="mx-auto flex max-w-6xl items-start gap-4 px-4 py-8 sm:gap-6 sm:py-12">
      {/* The city's card image, hotlinked, greyscale, bottom-anchored, with its credit "i" on its
          corner. The popup lines up with the "i"'s left edge, since the image sits at the page's left. */}
      <figure className="relative w-20 shrink-0 sm:w-28">
        <img
          src={city.cardImage}
          alt={photo.alt}
          decoding="async"
          className="block h-24 w-20 rounded-xl bg-muted object-cover object-bottom grayscale sm:h-32 sm:w-28"
        />
        <figcaption className="absolute bottom-1.5 right-1.5 flex">
          <PhotoCreditInfo photo={photo} align="start" className="" />
        </figcaption>
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
