/**
 * PhotoSection.tsx — chapter section 6, photos (content section, brief 5.6).
 *
 * Purpose
 *   The city's photos, all in greyscale, in one of three layouts picked per city in
 *   ../../_data/chapters.ts:
 *   - `grid`: an even grid (1, 2 then 3 columns).
 *   - `one-large-two-small`: from `md`, one large photo beside two small ones stacked. Any photos
 *     after the third follow in a row below, so nothing in the data is silently dropped.
 *   - `strip`: a sideways-swipe strip (PhotoStrip), the only sideways-moving layout in a chapter.
 *
 * Accessibility
 *   h2 "Photos" labels the section. Every photo has alt text (placeholder tiles use it as their
 *   accessible name). A city with no photos renders nothing.
 *
 * Credits (round 2, item 9)
 *   Each photo's credit and source link sit behind the "i" on its corner (PhotoFigure). The grids
 *   use an even 16px gap in both directions: the 8px row gap was sized for the text credit row that
 *   used to sit under every photo.
 *
 * Key exports: PhotoSection (named)
 * External dependencies: @/components/concept (ConceptSectionHeader), ./PhotoFigure, ./PhotoStrip
 *   (client), ../../_data/chapters (types).
 */

import { ConceptSectionHeader } from '@/components/concept'
import { PhotoFigure } from './PhotoFigure'
import { PhotoStrip } from './PhotoStrip'
import type { ChapterPhoto, PhotosLayout } from '../../_data/chapters'

/** Props for PhotoSection. */
type PhotoSectionProps = {
  /** The photos, in order. */
  photos: ChapterPhoto[]
  /** The city's layout choice. */
  layout: PhotosLayout
  /** City name, for the strip's accessible name. */
  cityName: string
}

/** Stable React key for a photo. */
function photoKey(photo: ChapterPhoto, index: number): string {
  return `${index}-${photo.alt}`
}

/** The photos section. Server component (the strip's scrolling is the only client part). */
export function PhotoSection({ photos, layout, cityName }: PhotoSectionProps) {
  if (photos.length === 0) return null

  return (
    <section aria-label="Photos" className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading="Photos" className="mb-6" />

      {layout === 'grid' && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photoKey(photo, index)}>
              <PhotoFigure photo={photo} mediaClassName="aspect-[4/3]" className="" />
            </li>
          ))}
        </ul>
      )}

      {layout === 'one-large-two-small' && (
        <>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
            {photos.slice(0, 3).map((photo, index) => (
              <li
                key={photoKey(photo, index)}
                className={index === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-start-3'}
              >
                <PhotoFigure
                  photo={photo}
                  mediaClassName={index === 0 ? 'aspect-[4/3] md:aspect-auto md:flex-1' : 'aspect-[4/3]'}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
          {photos.length > 3 && (
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {photos.slice(3).map((photo, index) => (
                <li key={photoKey(photo, index + 3)}>
                  <PhotoFigure photo={photo} mediaClassName="aspect-[4/3]" className="" />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {layout === 'strip' && (
        <PhotoStrip label={`Photos from ${cityName}`}>
          {photos.map((photo, index) => (
            <li key={photoKey(photo, index)} className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]">
              <PhotoFigure photo={photo} mediaClassName="aspect-[3/4]" className="" />
            </li>
          ))}
        </PhotoStrip>
      )}
    </section>
  )
}
