/**
 * BandScale.tsx — the city's band scale bar, with a tooltip on every segment (Breathe Data Atlas
 * iteration 3, round 2 decision A4). Moved out of city-ui.tsx because the tooltips need state.
 *
 * Purpose
 *   One EQUAL-WIDTH segment per band of the city's index, in the city's colours, best to worst.
 *   Iteration 4 (round 3 decision C): the current band's CAPSULE is the marker. It sits directly
 *   above its segment, centred on it, and the old triangle is gone (as BrusAir's "Very good" label
 *   does). The capsule is clamped inside the bar's edges: measured after layout (and on resize), it
 *   never runs past the first or last band; before measurement it starts flush left at the first band,
 *   flush right at the last, centred otherwise. Never an exact position: the segments are equal, so
 *   nothing about the reading's value is implied (spec rule 5). With no current band (stale, or no
 *   band reported) the bar is grey and carries no capsule; the caller says why in words.
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

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { indexLevel, levelDisplayName } from '../../_data/indexes'
import type { CityAirQualityIndex } from '../../_data/indexes'

/** Props for BandScale. */
type BandScaleProps = {
  index: CityAirQualityIndex
  /** The current band, or null for no current band (stale, or none reported): grey, no capsule. */
  band: number | null
}

/** Dark or light text on a city colour (same rule as city-ui's readableTextOn; local to avoid a cycle). */
function textOn(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (match === null) return '#1f2328'
  const channels = [0, 2, 4].map((offset) => {
    const part = Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255
    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2] > 0.4 ? '#1f2328' : '#ffffff'
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
  // The segment opened by a tap (touch) or click; null for none. Hover and focus need no state.
  const [tapped, setTapped] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const capsuleRef = useRef<HTMLSpanElement | null>(null)
  // The capsule's measured left edge in px, clamped inside the bar; null until measured.
  const [capsuleLeft, setCapsuleLeft] = useState<number | null>(null)
  const position = band === null ? -1 : index.levels.findIndex((level) => level.order === band)

  // Side effect: centre the capsule on its segment, clamped inside the bar, now and on resize.
  useLayoutEffect(() => {
    const root = rootRef.current
    const capsule = capsuleRef.current
    if (root === null || capsule === null || position < 0) return
    const place = (): void => {
      const width = root.clientWidth
      const own = capsule.offsetWidth
      const centre = ((position + 0.5) / count) * width
      setCapsuleLeft(Math.round(Math.max(0, Math.min(width - own, centre - own / 2))))
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(root)
    return () => observer.disconnect()
  }, [position, count])

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
      className={`relative ${position >= 0 ? 'pt-8' : 'pt-1'}`}
      data-band-scale={band === null ? 'none' : String(band)}
    >
      {position >= 0 && band !== null && (
        // The capsule IS the marker (decision C): above its segment, centred, clamped to the edges.
        <span
          ref={capsuleRef}
          data-band-capsule={band}
          data-scale-capsule=""
          className={`pointer-events-none absolute top-0 inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-tight ${
            capsuleLeft === null ? (position === 0 ? 'left-0' : position === count - 1 ? 'right-0' : '-translate-x-1/2') : ''
          }`}
          style={{
            ...(capsuleLeft !== null
              ? { left: capsuleLeft }
              : position > 0 && position < count - 1
                ? { left: `${((position + 0.5) / count) * 100}%` }
                : {}),
            backgroundColor: indexLevel(index, band).hex,
            color: textOn(indexLevel(index, band).hex),
          }}
        >
          {levelDisplayName(indexLevel(index, band))}
        </span>
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
