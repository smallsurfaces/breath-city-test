/**
 * PhotoStrip.tsx — the sideways-swipe photo strip (photos layout `strip`, brief 5.2, 5.6).
 *
 * Purpose
 *   The one sideways-moving layout in a chapter. A horizontally scrolling row of photos that snaps to
 *   photo edges: it swipes on touch, and from the `md` breakpoint prev/next arrow buttons scroll it one
 *   photo at a time. The row bleeds to the screen edge on a phone so the next photo peeks in.
 *
 *   The photos themselves (PhotoFigure, a server-renderable component) are passed in as children
 *   list items, so this client component only owns the scrolling.
 *
 * Accessibility
 *   - The row is a labelled list and is keyboard-focusable, so arrow keys scroll it without a mouse
 *     (and on a phone-width desktop window, where the buttons are hidden).
 *   - Arrow buttons are 56px, name the row they control (aria-controls), and use aria-disabled (not
 *     `disabled`) at either end so keyboard focus is never dropped.
 *   - Button scrolling is instant under prefers-reduced-motion.
 *
 * Key exports: PhotoStrip (named)
 * External dependencies: react, lucide-react (ArrowLeft, ArrowRight).
 *
 * Side effects (cleaned up on unmount): a passive scroll listener and a ResizeObserver on the row,
 * which update the arrow states, with at most one pending animation frame.
 */

'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

/** Props for PhotoStrip. */
type PhotoStripProps = {
  /** Accessible name of the row. */
  label: string
  /** The photos, each already wrapped in an <li>. */
  children: ReactNode
}

/** Whether the row can scroll further in each direction. */
type StripEnds = {
  atStart: boolean
  atEnd: boolean
}

/** Shared focus ring. */
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/** Reads whether the row is at either end. 1px tolerance for fractional scroll positions. */
function readEnds(row: HTMLElement): StripEnds {
  const maxScroll = Math.max(row.scrollWidth - row.clientWidth, 0)
  return { atStart: row.scrollLeft <= 1, atEnd: row.scrollLeft >= maxScroll - 1 }
}

/** The strip. */
export function PhotoStrip({ label, children }: PhotoStripProps) {
  const rowRef = useRef<HTMLUListElement>(null)
  const rowId = useId()
  const [ends, setEnds] = useState<StripEnds>({ atStart: true, atEnd: false })

  /** Re-reads the row's ends into state. */
  const measure = useCallback(() => {
    const row = rowRef.current
    if (row === null) return
    setEnds(readEnds(row))
  }, [])

  // Side effect: follow the row's scroll position and size (scroll listener + ResizeObserver).
  useEffect(() => {
    const row = rowRef.current
    if (row === null) return
    let frame: number | null = null
    const onScroll = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        measure()
      })
    }
    row.addEventListener('scroll', onScroll, { passive: true })
    const observer = new ResizeObserver(() => measure())
    observer.observe(row)
    measure()
    return () => {
      row.removeEventListener('scroll', onScroll)
      observer.disconnect()
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [measure])

  /** Scrolls the row one photo left (-1) or right (1). Does nothing at that end. */
  const scrollByPhoto = (direction: -1 | 1) => {
    const row = rowRef.current
    if (row === null) return
    if ((direction === -1 && ends.atStart) || (direction === 1 && ends.atEnd)) return
    const firstItem = row.querySelector<HTMLElement>('li')
    const gap = Number.parseFloat(window.getComputedStyle(row).columnGap)
    const step = firstItem === null ? row.clientWidth : firstItem.offsetWidth + (Number.isNaN(gap) ? 0 : gap)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Side effect: scroll the row. Scroll snap settles it on a photo edge.
    row.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const arrowClass = (disabled: boolean) =>
    `flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${FOCUS_RING} ${
      disabled
        ? 'cursor-default border-foreground/15 text-foreground/35'
        : 'border-foreground/60 text-foreground hover:bg-foreground hover:text-background'
    }`

  return (
    <div>
      <div className="mb-3 hidden justify-end gap-3 md:flex">
        <button
          type="button"
          onClick={() => scrollByPhoto(-1)}
          aria-controls={rowId}
          aria-disabled={ends.atStart}
          aria-label="Previous photos"
          className={arrowClass(ends.atStart)}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPhoto(1)}
          aria-controls={rowId}
          aria-disabled={ends.atEnd}
          aria-label="Next photos"
          className={arrowClass(ends.atEnd)}
        >
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {/* Keyboard-focusable so the arrow keys scroll it. The scrollbar is hidden: swipe or buttons.
          `relative` makes the row the containing block for absolutely positioned descendants (the
          links' sr-only text); without it they escape the row's scroll clip and widen the page. */}
      <ul
        id={rowId}
        ref={rowRef}
        aria-label={label}
        tabIndex={0}
        className={`relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden ${FOCUS_RING}`}
      >
        {children}
      </ul>
    </div>
  )
}
