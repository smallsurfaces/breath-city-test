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
 * Sizing (container query units against the cover stage, which is a size container)
 *   - Wordmark lines: sized so "BREATHE" fills the stage width (capped), as before.
 *   - City name: the smaller of two limits, so it always fits on one line inside the viewport and
 *     inside the gap:
 *       width limit  the name fills NAME_FILL_CQW of the stage width (long names such as
 *                    "Rio de Janeiro" get smaller type),
 *       gap limit    NAME_GAP_SHARE of the vertical gap between the two wordmark lines, which is the
 *                    stage height minus the two wordmark line boxes and their padding.
 *     On a phone the gap is tall (the globe sits in it), so the width limit wins and every name spans
 *     most of the screen, letting its ends show either side of the globe. On desktop the gap is about
 *     one line tall, so short names are held to the gap.
 *   Why the name's width is MEASURED: a character-count estimate was off by up to 30% between names
 *   ("WARSAW" overflowed a 390px screen while "PARIS" filled 78% of it). Each name is rendered once,
 *   hidden, at MEASURE_PX in the real type treatment; its width per em sets the width limit. Until
 *   the first measurement (and if it fails) the GLYPH_EM estimate is used. Measured again once web
 *   fonts finish loading.
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
/** Share of stage width the city name fills (measured, so this is the real share). */
const NAME_FILL_CQW = 90
/** Approximate advance width of one bold uppercase glyph with tight tracking, in em (fallback only). */
const GLYPH_EM = 0.66
/** Font size the hidden measuring spans render at, in px. */
const MEASURE_PX = 100
/** Line height of the wordmark type, in em (matches the `leading-[0.8]` class). */
const LEADING_EM = 0.8
/** Vertical padding above "BREATHE" and below "CITIES", in cqw (matches `py-[2cqw]`). */
const PAD_CQW = 2
/**
 * Share of the gap between the two wordmark lines that the city name's line may fill. Leaves clear
 * space above and below the name (room for accents such as the one in BOGOTÁ) where the gap is
 * tight, at desktop widths.
 */
const NAME_GAP_SHARE = 0.75

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
 * The space the two wordmark lines and their padding take out of the stage height, in cqw.
 * Why cqw: the wordmark is sized in cqw, so its line boxes are too; the gap is then
 * `100cqh - WORDMARK_BLOCK_CQW cqw`.
 */
const WORDMARK_BLOCK_CQW = 2 * PAD_CQW + 2 * LEADING_EM * WORDMARK_SIZE_CQW

/**
 * CSS font size for a city name: the width limit or the gap limit, whichever is smaller (see the
 * file header, "Sizing"). `emWidth` is the name's measured width per em, or null to use the
 * estimate. The gap limit converts a line-box height to a font size by dividing by the line height.
 */
function cityNameFontSize(name: string, emWidth: number | null): string {
  const widthCqw = round3(
    emWidth === null ? fitSizeCqw(name.length, NAME_FILL_CQW, Number.POSITIVE_INFINITY) : NAME_FILL_CQW / emWidth,
  )
  const gapFactor = round3(NAME_GAP_SHARE / LEADING_EM)
  return `min(${widthCqw}cqw, calc((100cqh - ${round3(WORDMARK_BLOCK_CQW)}cqw) * ${gapFactor}))`
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

      {/* The city name, centred in the gap between the lines (the stage's vertical centre). */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`${TYPE_CLASS} transition-opacity duration-700 ease-out motion-reduce:transition-none`}
          style={{ color: CITY_NAME_COLOUR, fontSize: cityNameFontSize(cityName, emWidth), opacity: showName ? 1 : 0 }}
        >
          {cityName}
        </span>
      </div>

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
