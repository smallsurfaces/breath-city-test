/**
 * Wordmark.tsx — the oversized "BREATHE / CITIES" type behind the globe, with the city name in
 * the gap between the two lines.
 *
 * Purpose
 *   Brief 4.2 wordmark (updated 2026-09-17 after Jack's phone test; swap mode removed):
 *   - "BREATHE" / "CITIES" stays still at low contrast, pinned to the top and bottom of the stage.
 *   - While the globe rests on a city, the city name fades in on ONE line in the gap between the two
 *     words, in the same type treatment (bold, uppercase, tight tracking and leading) but in a dark,
 *     high-contrast colour. It sits BEHIND the globe, so the globe covers its middle. It fades out as
 *     the globe moves on.
 *   The whole layer renders before the globe canvas in the stage, so the canvas paints over it.
 *
 * NAMED EXCEPTION to the concept-prototyping display-type cap (h1 capped at text-3xl sm:text-4xl):
 *   this oversized background type is a founder-approved exception for the Breathe Atlas concept
 *   only (brief section 8, "Named exception to the concept standard"). Do not copy this type scale
 *   into other concepts.
 *
 * Sizing
 *   - Wordmark lines: sized in container query units so "BREATHE" fills the stage width (capped),
 *     as before. The stage is a size container, so cqw/cqh resolve against it.
 *   - City name: BLEEDS OFF BOTH EDGES (Jack, second round, brief 4.2). The name is set to the
 *     VIEWPORT width plus BLEED_PX * 2, and centred, so it hangs BLEED_PX past each edge and its
 *     first and last letters are cropped. Every name therefore lands with the same impact whatever
 *     its length, and a short name ("SOFIA") comes out much larger than the wordmark, which is
 *     intended. THE NAME NEVER SHRINKS TO FIT: there is deliberately no width cap and no gap cap.
 *     The crop is the point.
 *
 *     This replaced a measure-and-fit-inside-the-page rule, which took the smaller of a width limit
 *     (fill 90% of the stage) and a gap limit (fit the space between the two wordmark lines).
 *
 *   Why the name's width is still MEASURED: to bleed by exactly BLEED_PX the font size has to be
 *   derived from the name's real advance width, and a character-count estimate was off by up to 30%
 *   between names ("WARSAW" overflowed a 390px screen while "PARIS" filled 78% of it). Each name is
 *   rendered once, hidden, at MEASURE_PX in the real type treatment; its width per em gives the font
 *   size that makes the name (100vw + 2 * BLEED_PX) wide. Until the first measurement (and if it
 *   fails) the GLYPH_EM estimate is used, which bleeds by roughly rather than exactly BLEED_PX.
 *   Measured again once web fonts finish loading.
 *
 *   Why vw and not cqw here: the bleed is measured against the VIEWPORT, and from `lg` the stage is
 *   narrower than the viewport (max-w-6xl, centred). The stage is horizontally centred, so centring
 *   the name in the stage centres it in the viewport, and sizing it in vw makes it overhang the
 *   viewport rather than the stage. Where the browser draws a classic scrollbar, 100vw includes it,
 *   so the bleed comes out slightly larger than BLEED_PX, never smaller.
 *
 *   Overflow: the cover <section> in GlobeCover is `overflow-hidden` and spans the full page width,
 *   so the name is clipped at the viewport edges and no horizontal page scrollbar can appear at any
 *   width. That clip is what crops the letters.
 *
 * Accessibility
 *   Decorative: the whole layer is aria-hidden. The page carries a visually hidden h1, the city card
 *   carries the city name as text, and the fade is switched off under prefers-reduced-motion.
 *
 * Styling
 *   Colour only via the bridged `--foreground` semantic (mixed toward transparent for the low-contrast
 *   wordmark, full strength for the city name). No hex, no decorative colour.
 *
 * Key exports: Wordmark (named)
 * External dependencies: react, ../_data/cities (ATLAS_CITIES, for the names to measure).
 *
 * Side effects: reads the width of the hidden measuring spans on mount and after document.fonts.ready.
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ATLAS_CITIES } from '../_data/cities'

/** Props for Wordmark. */
type WordmarkProps = {
  /**
   * The most recent city the globe rested on. Kept after the globe moves on so the name can fade
   * out rather than vanish.
   */
  cityName: string
  /** True while the globe is resting on `cityName`. */
  visible: boolean
}

/** Largest wordmark size, as a percentage of stage width (cqw). */
const MAX_SIZE_CQW = 20.5
/** Share of stage width a wordmark line may fill. */
const FILL_CQW = 94
/**
 * How far the city name hangs past each edge of the viewport, in px (Jack, brief 4.2). The name is
 * set to the viewport width plus twice this, so its first and last letters are cropped.
 */
const BLEED_PX = 20
/** Approximate advance width of one bold uppercase glyph with tight tracking, in em (fallback only). */
const GLYPH_EM = 0.66
/** Font size the hidden measuring spans render at, in px. */
const MEASURE_PX = 100

/** Low-contrast wordmark colour (foreground mixed to transparent). */
const WORDMARK_COLOUR = 'color-mix(in srgb, var(--foreground) 7%, transparent)'
/** Dark, high-contrast city-name colour. */
const CITY_NAME_COLOUR = 'var(--foreground)'

/** Font size (cqw) that fits `chars` characters across `fillCqw` of the stage, capped at `maxCqw`. */
function fitSizeCqw(chars: number, fillCqw: number, maxCqw: number): number {
  return Math.min(maxCqw, fillCqw / (Math.max(chars, 1) * GLYPH_EM))
}

/** Rounds a unit value for readable inline CSS. */
function round3(value: number): number {
  return Math.round(value * 1000) / 1000
}

/** The wordmark size (cqw): "BREATHE", the longer word, fills the stage width up to the cap. */
const WORDMARK_SIZE_CQW = fitSizeCqw('Breathe'.length, FILL_CQW, MAX_SIZE_CQW)

/**
 * CSS font size for a city name, so the name renders (100vw + 2 * BLEED_PX) wide and therefore
 * hangs BLEED_PX past each edge of the viewport (see the file header, "Sizing").
 *
 * `emWidth` is the name's measured advance width per em. Dividing the target width by it gives the
 * font size that produces exactly that width. There is NO cap in either direction: the name never
 * shrinks to fit the page, and a short name is deliberately enormous.
 *
 * Before the first measurement, `emWidth` is null and the GLYPH_EM character-count estimate stands
 * in, which bleeds by roughly rather than exactly BLEED_PX for one paint.
 */
function cityNameFontSize(name: string, emWidth: number | null): string {
  const perEm = emWidth ?? Math.max(name.length, 1) * GLYPH_EM
  return `calc((100vw + ${BLEED_PX * 2}px) / ${round3(perEm)})`
}

/** Shared type treatment for the wordmark lines and the city name. */
const TYPE_CLASS = 'block whitespace-nowrap font-bold uppercase leading-[0.8] tracking-[-0.04em]'

/** Every city name, measured once each. */
const MEASURED_NAMES: string[] = ATLAS_CITIES.map((city) => city.name)

/** The behind-the-globe wordmark layer, with the city name in the gap. */
export function Wordmark({ cityName, visible }: WordmarkProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  // Measured width per em, by name. Empty until measured.
  const [emWidths, setEmWidths] = useState<Record<string, number>>({})

  // Side effect: read the hidden measuring spans' widths now and again once web fonts have loaded.
  useEffect(() => {
    let cancelled = false
    const measure = () => {
      const host = measureRef.current
      if (cancelled || host === null) return
      const next: Record<string, number> = {}
      host.querySelectorAll<HTMLSpanElement>('span[data-name]').forEach((span) => {
        const width = span.getBoundingClientRect().width
        const name = span.dataset.name
        if (name !== undefined && width > 0) next[name] = width / MEASURE_PX
      })
      setEmWidths(next)
    }
    measure()
    document.fonts.ready.then(measure).catch(() => {
      // Font loading failed: keep the measurement taken with the fallback font.
    })
    return () => {
      cancelled = true
    }
  }, [])

  const wordmarkStyle: CSSProperties = { color: WORDMARK_COLOUR, fontSize: `${round3(WORDMARK_SIZE_CQW)}cqw` }
  const showName = visible && cityName.length > 0
  const emWidth = emWidths[cityName] ?? null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
      {/* "BREATHE" pinned to the top, "CITIES" to the bottom: still, low contrast. */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-[2cqw]">
        <span className={TYPE_CLASS} style={wordmarkStyle}>
          Breathe
        </span>
        <span className={TYPE_CLASS} style={wordmarkStyle}>
          Cities
        </span>
      </div>

      {/* The city name, centred in the gap between the lines (the stage's vertical centre) and
          bleeding BLEED_PX past each edge of the viewport.
          Positioned with left-1/2 and a -50% shift rather than by flex centring, because the box is
          WIDER than the stage that contains it: this way its centre is the stage's centre (and so
          the viewport's, the stage being centred) whatever the two widths are, instead of depending
          on how overflow resolves in a centred flex line. `text-center` keeps the crop symmetric if
          the measurement is slightly off. */}
      <span
        className={`${TYPE_CLASS} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-opacity duration-700 ease-out motion-reduce:transition-none`}
        style={{
          color: CITY_NAME_COLOUR,
          fontSize: cityNameFontSize(cityName, emWidth),
          width: `calc(100vw + ${BLEED_PX * 2}px)`,
          opacity: showName ? 1 : 0,
        }}
      >
        {cityName}
      </span>

      {/* Hidden measuring spans: every city name at MEASURE_PX in the same type treatment. */}
      <div ref={measureRef} className="invisible absolute left-0 top-0 h-0 overflow-visible">
        {MEASURED_NAMES.map((name) => (
          <span key={name} data-name={name} className={`${TYPE_CLASS} absolute left-0 top-0`} style={{ fontSize: MEASURE_PX }}>
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}
