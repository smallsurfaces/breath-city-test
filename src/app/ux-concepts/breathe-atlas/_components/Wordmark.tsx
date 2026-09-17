/**
 * Wordmark.tsx — the oversized "BREATHE / CITIES" type behind the globe, and the city name.
 *
 * Purpose
 *   Brief 4.2 wordmark, in its two prototype modes:
 *   - Mode A, "overlay" (default): "BREATHE" / "CITIES" stays still at low contrast behind the
 *     globe. While the globe rests on a city, the city name fades in over the wordmark at higher
 *     contrast and fades out as the globe moves on. The name is smaller than the wordmark and
 *     sits in front of the globe over the top line, so it stays readable where the globe covers
 *     the middle of the stage (it never covers the centred city marker).
 *   - Mode B, "swap" (`?wordmark=swap`): the big word itself crossfades to the city name while the
 *     globe rests, and back to "BREATHE CITIES" while it turns.
 *
 * NAMED EXCEPTION to the concept-prototyping display-type cap (h1 capped at text-3xl sm:text-4xl):
 *   this oversized background wordmark is a founder-approved exception for the Breathe Atlas
 *   concept only (brief section 8, "Named exception to the concept standard"). Do not copy this
 *   type scale into other concepts.
 *
 * Accessibility
 *   Decorative: the whole wordmark is aria-hidden. The page carries a visually hidden h1, and the
 *   city's mission line below the globe is real text. Fades are CSS opacity transitions and are
 *   switched off under prefers-reduced-motion.
 *
 * Sizing
 *   Type is sized in container query units (cqw) against the cover stage, so each line fits the
 *   stage width at every breakpoint. Longer city names get proportionally smaller type.
 *
 * Styling
 *   Colour only via the bridged `--foreground` semantic mixed toward transparent (low contrast for
 *   the wordmark, higher for the city name). No hex, no decorative colour.
 *
 * Key exports: WordmarkBackdrop, WordmarkCityName (named), WordmarkMode (type)
 * External dependencies: react.
 */

import type { CSSProperties } from 'react'

/** Which wordmark behaviour to show: A = overlay (default), B = swap. */
export type WordmarkMode = 'overlay' | 'swap'

/** Props for Wordmark. */
type WordmarkProps = {
  /** Mode A or B. */
  mode: WordmarkMode
  /**
   * The most recent city the globe rested on ('' before any). Kept after the globe moves on so
   * the name can fade out rather than vanish.
   */
  cityName: string
  /** True while the globe is resting on `cityName`. */
  visible: boolean
}

/** Largest wordmark size, as a percentage of stage width (cqw). */
const MAX_SIZE_CQW = 20.5
/** Share of stage width a line may fill. */
const FILL_CQW = 94
/** Approximate advance width of one bold uppercase glyph with tight tracking, in em. */
const GLYPH_EM = 0.66

/** Low-contrast wordmark colour and higher-contrast city-name colour (foreground mixed to transparent). */
const WORDMARK_COLOUR = 'color-mix(in srgb, var(--foreground) 7%, transparent)'
const CITY_NAME_COLOUR = 'color-mix(in srgb, var(--foreground) 62%, transparent)'

/** Font size (cqw) that fits a line of `chars` characters across the stage, capped at the wordmark size. */
function fitSizeCqw(chars: number, maxCqw: number): number {
  return Math.min(maxCqw, FILL_CQW / (Math.max(chars, 1) * GLYPH_EM))
}

/**
 * Splits a city name into at most two lines for the swap mode, at the word boundary that makes the
 * two lines closest in length ("Rio de Janeiro" becomes "Rio de" / "Janeiro"). Single words stay
 * on one line.
 */
function splitIntoTwoLines(name: string): string[] {
  const words = name.split(' ')
  if (words.length < 2) return [name]
  let best: string[] = [name]
  let bestDiff = Number.POSITIVE_INFINITY
  for (let i = 1; i < words.length; i++) {
    const first = words.slice(0, i).join(' ')
    const second = words.slice(i).join(' ')
    const diff = Math.abs(first.length - second.length)
    if (diff < bestDiff) {
      bestDiff = diff
      best = [first, second]
    }
  }
  return best
}

/**
 * Two stacked lines pinned to the top and bottom of the stage (single lines use the top slot).
 * Shared by the resting wordmark and the swap-mode city name so they occupy the same positions.
 */
function StackedLines({ lines, style }: { lines: string[]; style: CSSProperties }) {
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 0)
  const size = `${fitSizeCqw(longest, MAX_SIZE_CQW)}cqw`
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-between py-[2cqw] transition-opacity duration-700 ease-out motion-reduce:transition-none"
      style={style}
    >
      {lines.map((line) => (
        <span
          key={line}
          className="block whitespace-nowrap font-bold uppercase leading-[0.8] tracking-[-0.04em]"
          style={{ fontSize: size }}
        >
          {line}
        </span>
      ))}
    </div>
  )
}

/** The behind-the-globe wordmark layer (and, in swap mode, the city name that replaces it). */
export function WordmarkBackdrop({ mode, cityName, visible }: WordmarkProps) {
  const showSwap = mode === 'swap' && visible && cityName.length > 0
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
      <StackedLines
        lines={['Breathe', 'Cities']}
        style={{
          color: WORDMARK_COLOUR,
          opacity: showSwap ? 0 : 1,
        }}
      />
      {mode === 'swap' && (
        <StackedLines
          lines={splitIntoTwoLines(cityName)}
          style={{
            color: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
            opacity: showSwap ? 1 : 0,
          }}
        />
      )}
    </div>
  )
}

/**
 * Mode A city name, in front of the globe over the top wordmark line. Rendered as a separate layer
 * from WordmarkBackdrop because it must stack above the globe canvas, not behind it.
 */
export function WordmarkCityName({ mode, cityName, visible }: WordmarkProps) {
  if (mode !== 'overlay') return null
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 flex select-none justify-center pt-[3cqw]"
    >
      <span
        className="block whitespace-nowrap font-bold uppercase leading-none tracking-[-0.03em] transition-opacity duration-700 ease-out motion-reduce:transition-none"
        style={{
          color: CITY_NAME_COLOUR,
          fontSize: `${fitSizeCqw(cityName.length, 7.5)}cqw`,
          opacity: visible ? 1 : 0,
        }}
      >
        {cityName}
      </span>
    </div>
  )
}

