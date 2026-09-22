/**
 * PhotoFigure.tsx — one chapter photo with its credit (brief 5.6).
 *
 * Purpose
 *   Renders a ChapterPhoto: the image in greyscale (brief 5.6: all photos in greyscale), or, while
 *   the content has no real photo (`src: null`), a neutral placeholder tile that carries the alt text
 *   as its accessible name and shows it in small type.
 *
 *   The media box's size comes from the caller (`mediaClassName`), so the same figure serves the
 *   grid, the one-large-two-small layout, the strip, and the feature story's lead photo.
 *
 * Credit (round 2, item 9, 2026-09-22)
 *   The credit no longer runs as a text line under the photo. It sits behind a quiet "i" on the
 *   photo's bottom-right corner (CreditInfo, labelled "Photo credit"). The popover holds the credit
 *   in either of the content pack's two formats, "Photo by X on Unsplash" or "Breathe Cities" (shown
 *   as "Photo: Breathe Cities"), and the credit LINKS to the photo's source page (new tab), so the
 *   source stays one tap away (data attribution and traceability decision). PhotoCreditInfo is the
 *   same "i" for the chapter opener's landmark image.
 *
 * Key exports: PhotoFigure (named), PhotoCreditInfo (named)
 * External dependencies: lucide-react (ImageIcon), ./ChapterLink, ./CreditInfo, ../../_data/chapters (type).
 */

import { ImageIcon } from 'lucide-react'
import { OutboundLink } from './ChapterLink'
import { CreditInfo } from './CreditInfo'
import type { ChapterPhoto } from '../../_data/chapters'

/** Props for PhotoFigure. */
type PhotoFigureProps = {
  /** The photo. */
  photo: ChapterPhoto
  /** Size and aspect classes for the image box (e.g. "aspect-[4/3]"). */
  mediaClassName: string
  /** Layout classes for the figure itself. */
  className: string
}

/**
 * The visible credit line. The pack writes an Unsplash credit as a full sentence ("Photo by X on
 * Unsplash") and a Breathe Cities credit as the name alone, so only the name gets a "Photo:" prefix.
 */
function creditLine(credit: string): string {
  return credit.startsWith('Photo by ') ? credit : `Photo: ${credit}`
}

/** Props for PhotoCreditInfo. */
type PhotoCreditInfoProps = {
  /** The photo whose credit this is. */
  photo: ChapterPhoto
  /** Which edge of the "i" the popup lines up with. */
  align: 'start' | 'center' | 'end'
  /** Placement classes from the caller. */
  className: string
}

/** A photo's credit behind the "i": the credit line, linked to the photo's source page. */
export function PhotoCreditInfo({ photo, align, className }: PhotoCreditInfoProps) {
  return (
    <CreditInfo label="Photo credit" align={align} className={className}>
      {/* -my-3 tucks the link's 56px touch target into the popup's own padding. */}
      <OutboundLink href={photo.sourceUrl} className="-my-3 text-sm font-medium text-foreground">
        {creditLine(photo.credit)}
      </OutboundLink>
    </CreditInfo>
  )
}

/** One photo and its credit. Server component (the "i" is the only client part). */
export function PhotoFigure({ photo, mediaClassName, className }: PhotoFigureProps) {
  return (
    <figure className={`relative flex min-w-0 flex-col ${className}`}>
      <div className={`overflow-hidden rounded-2xl bg-foreground/[0.06] ${mediaClassName}`}>
        {photo.src !== null ? (
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover grayscale"
          />
        ) : (
          // Placeholder tile: neutral, named by the alt text, no image request.
          <div role="img" aria-label={photo.alt} className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <ImageIcon className="h-6 w-6 text-foreground/35" aria-hidden="true" />
            <span aria-hidden="true" className="max-w-[16rem] text-xs leading-snug text-foreground/60">
              {photo.alt}
            </span>
          </div>
        )}
      </div>
      {/* The credit "i", on the photo's bottom-right corner. The figure ends where the photo ends,
          so this is the photo's corner at every size and in every layout. */}
      <figcaption className="absolute bottom-2.5 right-2.5 flex">
        <PhotoCreditInfo photo={photo} align="end" className="" />
      </figcaption>
    </figure>
  )
}
