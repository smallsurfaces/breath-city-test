/**
 * BandScale.tsx — the city's band scale bar, with a tooltip on every segment (Breathe Data Atlas
 * iteration 3, round 2 decision A4). Moved out of city-ui.tsx because the tooltips need state.
 *
 * Purpose
 *   One EQUAL-WIDTH segment per band of the city's index, in the city's colours, best to worst, with
 *   a marker in the MIDDLE of the current band's segment (iteration 2, decision C1). Never an exact
 *   position: the segments are equal, so nothing about the reading's value is implied (spec rule 5).
 *   With no current band (stale or dead) the bar is grey and carries no marker.
 *
 *   Each segment names its band in a small tooltip:
 *     - Pointer: hover a segment (Tailwind's hover variant only applies on hover-capable devices).
 *     - Touch: tap a segment; tap it again, tap anywhere else or press Escape to close.
 *     - Keyboard: each segment is a button whose accessible name is the band's label; focus shows
 *       the same tooltip. The current band carries aria-current.
 *   The tooltip lines up with the segment's left edge for the first band and its right edge for the
 *   last, centred otherwise, so it never runs past the bar's ends inside a narrow card.
 *
 * Touch target (named exception)
 *   The segments are as wide as the bar allows (a fifth of an 18rem card each), so they cannot be
 *   56px wide without overlapping. Each segment's hit area is extended to 32px tall; the tooltip is
 *   informational only, and the band is also named in words in the capsule beside the bar.
 *
 * TOKEN EXCEPTION (inherited)
 *   Segment colours are the city's own index colours (data, from ../../_data/indexes). Everything
 *   else uses bridged semantics.
 *
 * Key exports: BandScale (named)
 * External dependencies: react, ../../_data/indexes (CityAirQualityIndex, levelDisplayName).
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { levelDisplayName } from '../../_data/indexes'
import type { CityAirQualityIndex } from '../../_data/indexes'

/** Props for BandScale. */
type BandScaleProps = {
  index: CityAirQualityIndex
  /** The current band, or null for a sensor with no current band (stale or dead): no marker. */
  band: number | null
}

/** Where a segment's tooltip lines up, by the segment's position in the bar. Pure. */
function tooltipAlign(position: number, count: number): string {
  if (position === 0) return 'left-0'
  if (position === count - 1) return 'right-0'
  return 'left-1/2 -translate-x-1/2'
}

/** The band scale bar. */
export function BandScale({ index, band }: BandScaleProps) {
  const count = index.levels.length
  const markerLeft = band === null ? null : `${((band - 0.5) / count) * 100}%`
  // The segment opened by a tap (touch) or click; null for none. Hover and focus need no state.
  const [tapped, setTapped] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Side effect: while a tooltip is open by tap, a tap elsewhere or Escape closes it.
  useEffect(() => {
    if (tapped === null) return
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (root === null) return
      if (event.target instanceof Node && root.contains(event.target)) return
      setTapped(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTapped(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [tapped])

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={`${index.name} scale`}
      className="relative pt-3"
      data-band-scale={band === null ? 'none' : String(band)}
    >
      {markerLeft !== null && (
        // A small downward caret above the bar, centred on the band's segment.
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[9px] border-x-transparent"
          style={{ left: markerLeft, borderTopColor: 'var(--foreground)' }}
        />
      )}
      <div className="flex h-2.5 gap-0.5">
        {index.levels.map((level, position) => {
          const label = levelDisplayName(level)
          const open = tapped === level.order
          return (
            <button
              key={level.order}
              type="button"
              aria-label={label}
              aria-current={band === level.order ? 'true' : undefined}
              data-scale-segment={level.order}
              onClick={() => setTapped(open ? null : level.order)}
              className="group/segment relative h-full flex-1 cursor-default first:rounded-l-full last:rounded-r-full before:absolute before:inset-x-0 before:-inset-y-[11px] before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              style={{ backgroundColor: band === null ? 'var(--bc-semantic-border)' : level.hex }}
            >
              <span
                role="tooltip"
                data-scale-tooltip={level.order}
                className={`pointer-events-none absolute bottom-full z-20 mb-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-semibold leading-tight text-background shadow-md group-hover/segment:block group-focus-visible/segment:block ${
                  open ? 'block' : 'hidden'
                } ${tooltipAlign(position, count)}`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
