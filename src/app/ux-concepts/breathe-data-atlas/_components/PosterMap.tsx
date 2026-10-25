/**
 * PosterMap.tsx — the city map on every city card (spec 3.1, reworked by round 3 decision K).
 *
 * Purpose
 *   Decision K (2026-10-25): the card shows the city's map with its outline and MAJOR ROADS only
 *   (OpenStreetMap motorway, trunk and primary), greyscale, filling the WHOLE image area edge to
 *   edge (cover-scaled, cropped as needed). No sensor dots and no pulses: the dense dots read as bad
 *   air. The poster image is generated once (../_data/generators/gen_posters.py, reduced to major
 *   roads by gen_posters_major_roads.py) and drawn as a CSS MASK over a BC token colour, so what
 *   reaches the screen is always a token grey. No Mapbox, no live map.
 *   A city without a poster gets the shared placeholder: an abstract street texture with no
 *   outline, so it can never be mistaken for a real place.
 *
 * Greyscale (spec 3.1)
 *   The concept's text token is a dark blue-grey, so the poster carries the Atlas's CSS `grayscale`
 *   filter to read as a neutral grey map.
 *
 * Accessibility
 *   Decorative: the card is named by the city name, so the whole poster is aria-hidden.
 *
 * Key exports: PosterMap (named), PosterVariant (type)
 * External dependencies: ../_data/posters.
 */

import type { CSSProperties } from 'react'
import { PLACEHOLDER_POSTER_URL, posterFor, posterUrl } from '../_data/posters'

/** Where the poster is shown; sets which stations are drawn and how big the dots are. */
export type PosterVariant = 'globe' | 'carousel' | 'ending'

/** The mask style for an image URL, fitted the way the spec asks. */
function maskStyle(url: string, fit: 'contain' | 'cover'): CSSProperties {
  const image = `url(${url})`
  return {
    backgroundColor: 'var(--bc-semantic-text)',
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: fit,
    WebkitMaskSize: fit,
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
}

/** Props for PosterMap. */
type PosterMapProps = {
  /** The city's slug. */
  slug: string
  /** Which card the poster sits on. */
  variant: PosterVariant
}

/** The poster map. Fills its parent box, which the caller sizes as the card's safe area. */
export function PosterMap({ slug, variant }: PosterMapProps) {
  const poster = posterFor(slug)

  if (poster === null) {
    // The shared placeholder: abstract texture, covering the box, fainter than a real poster.
    return (
      <div aria-hidden="true" className="absolute inset-0 opacity-60 grayscale" style={maskStyle(PLACEHOLDER_POSTER_URL, 'cover')} />
    )
  }

  // Decision K: the map covers the whole image area, centred, cropped as needed. `variant` is kept
  // so the cards can still say where the map sits; every variant renders the same now.
  return (
    <div aria-hidden="true" className="absolute inset-0 grayscale" data-poster={poster.city} data-poster-variant={variant}>
      <div className="absolute inset-0" style={maskStyle(posterUrl(poster.city), 'cover')} />
    </div>
  )
}
