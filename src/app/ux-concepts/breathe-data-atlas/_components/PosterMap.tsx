/**
 * PosterMap.tsx — the poster map that replaces the landmark photo on every city card (spec 3.1).
 *
 * Purpose
 *   Two layers, both static:
 *     1. The poster image (outline, faint land, major streets), generated once by
 *        ../_data/generators/gen_posters.py. It is drawn as a CSS MASK over a BC token colour, so
 *        what reaches the screen is always a token grey and the image file carries no colour of its
 *        own. No Mapbox, no live map.
 *     2. The city's stations as an inline SVG in the SAME viewBox, laid exactly over the mask, each
 *        pulsing softly in ONE neutral colour (the foreground token). No band colours, no values, no
 *        counts. The pulse is decorative timing only: staggered so it reads as a working network,
 *        and switched off under prefers-reduced-motion.
 *   A city without a poster gets the shared placeholder: an abstract street texture with no
 *   outline, no stations and no pulses, so it can never be mistaken for a real network.
 *
 * Fit rule (spec 3.1)
 *   The caller gives the component a box (the card's safe area). The poster is fitted inside it with
 *   `contain` and bottom-aligned, like the landmarks were. The mask uses `mask-size: contain;
 *   mask-position: bottom center` and the station SVG uses `preserveAspectRatio="xMidYMax meet"`,
 *   which are the same fit, so the dots stay on their streets at every card size.
 *
 * Globe card (spec 3.1, developer's call)
 *   At 80px wide every station turns to texture (Jakarta has about 100), so the globe card shows
 *   the outline with a handful of pulses from the real positions (`globeStations`, picked spread out
 *   by the generator). The carousel and the ending card show every station.
 *
 * Greyscale (spec 3.1)
 *   The concept's text token is a dark blue-grey, so the whole poster carries the Atlas's CSS
 *   `grayscale` filter (the same treatment its photos had) to read as a neutral grey poster.
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

/**
 * Dot radius in viewBox units (posters are 1000 units on their long side). Chosen so a dot reads at
 * about 2 to 3 screen pixels at each card size: the globe card's poster is about 70px across, the
 * carousel's about 150px, the ending card's about 100px.
 */
const DOT_RADIUS: Record<PosterVariant, number> = { globe: 30, carousel: 12, ending: 18 }

/** One pulse cycle, in ms. Slow, so the network breathes rather than blinks. */
const PULSE_MS = 3200

/**
 * The stagger for station `index`, in ms: spread over one cycle by the golden ratio, so neighbours
 * in the list never pulse together and the network reads as working, not as a single beat.
 */
function pulseDelay(index: number): number {
  return Math.round(((index * 0.618034) % 1) * PULSE_MS)
}

/** The mask style for an image URL, fitted the way the spec asks. */
function maskStyle(url: string, fit: 'contain' | 'cover'): CSSProperties {
  const image = `url(${url})`
  return {
    backgroundColor: 'var(--bc-semantic-text)',
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: fit,
    WebkitMaskSize: fit,
    maskPosition: 'center bottom',
    WebkitMaskPosition: 'center bottom',
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

  const indexes = variant === 'globe' ? poster.globeStations : poster.stations.map((_, index) => index)
  const radius = DOT_RADIUS[variant]

  return (
    <div aria-hidden="true" className="absolute inset-0 grayscale">
      <div className="absolute inset-0" style={maskStyle(posterUrl(poster.city), 'contain')} />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${poster.width} ${poster.height}`}
        preserveAspectRatio="xMidYMax meet"
        focusable="false"
        style={{ color: 'var(--bc-semantic-text)' }}
      >
        {/* Keyframes inside the SVG (prototype build standard 4). Scoped class names. */}
        <style>{`
          .bda-poster-pulse {
            transform-box: fill-box;
            transform-origin: center;
            animation: bda-poster-pulse ${PULSE_MS}ms ease-out infinite;
            opacity: 0;
          }
          @keyframes bda-poster-pulse {
            0%   { transform: scale(1);   opacity: 0.45; }
            70%  { transform: scale(3.2); opacity: 0; }
            100% { transform: scale(3.2); opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .bda-poster-pulse { animation: none; opacity: 0; }
          }
        `}</style>
        {indexes.map((index) => {
          const [x, y] = poster.stations[index]
          const delay = `${pulseDelay(index)}ms`
          return (
            <g key={index}>
              <circle className="bda-poster-pulse" cx={x} cy={y} r={radius} fill="currentColor" style={{ animationDelay: delay }} />
              <circle cx={x} cy={y} r={radius} fill="currentColor" fillOpacity={0.85} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
