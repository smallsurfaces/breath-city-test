/**
 * PhotoFigure.tsx — one chapter photo with its credit (brief 5.6).
 *
 * Purpose
 *   Renders a ChapterPhoto: the image in greyscale (brief 5.6: all photos in greyscale), or, while
 *   the content has no real photo (`src: null`), a neutral placeholder tile that carries the alt text
 *   as its accessible name and shows it in small type. Below it, the credit linked to the photo's
 *   source page (opens in a new tab).
 *
 *   The media box's size comes from the caller (`mediaClassName`), so the same figure serves the
 *   grid, the one-large-two-small layout, the strip, and the feature story's lead photo.
 *
 * Key exports: PhotoFigure (named)
 * External dependencies: lucide-react (ImageIcon), ./ChapterLink, ../../_data/chapters (type).
 */

import { ImageIcon } from 'lucide-react'
import { OutboundLink } from './ChapterLink'
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

/** One photo and its credit. Server component. */
export function PhotoFigure({ photo, mediaClassName, className }: PhotoFigureProps) {
  return (
    <figure className={`flex min-w-0 flex-col ${className}`}>
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
      <figcaption className="text-xs text-foreground/70">
        <OutboundLink href={photo.sourceUrl} className="font-medium">
          Photo: {photo.credit}
        </OutboundLink>
      </figcaption>
    </figure>
  )
}
