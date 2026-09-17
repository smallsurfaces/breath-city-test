/**
 * CityBrowser.tsx — the cover browser: all 16 cities in a sideways-scrolling carousel (brief 4.3).
 *
 * Purpose
 *   A copy of the LAYOUT of Breathe Cities' own city carousel on breathecities.org (homepage and
 *   /cities/), in grey wireframe:
 *   - a text block on the left: a heading derived from the data ("16 cities"), the one line about
 *     BC, and a link to breathecities.org,
 *   - prev/next arrow buttons and a progress bar (a thin track with a darker thumb showing which part
 *     of the row is in view),
 *   - a sideways-scrolling row of tall city cards on the right (BC's 6:7.5 card shape).
 *   On a phone the text block stacks above the row, the row swipes (scroll snap), and the arrow
 *   buttons and progress bar sit below the row, as on BC's site. The arrows still work on a phone.
 *
 *   Used twice with the same markup: below the globe on the cover, and inside the All cities panel
 *   (AllCitiesPanel), where `currentCityId` highlights the chapter's city and scrolls it into view.
 *
 * Cards
 *   All 16 cities in alphabetical order (CITIES_ALPHABETICAL). Each card: city name top-left, a
 *   circular arrow button under it (accessible name "Open [City]"), and BC's city card image anchored
 *   to the bottom in greyscale. The arrow links to the chapter for the seven chapter cities; for the
 *   other nine it is greyed out and not focusable (the same pattern as the globe card's disabled
 *   Open: a role="link" span with aria-disabled).
 *
 * IMAGE RIGHTS
 *   The card images belong to Breathe Cities. They are HOTLINKED from breathecities.org for this
 *   internal prototype (URLs in ../_data/cities.ts), never downloaded into the repo. Plain lazy-loaded
 *   <img> elements are used (no next/image), so no remote image pattern is configured.
 *   Note: the site's CSP is Report-Only (next.config.ts) and does not list breathecities.org in
 *   img-src, so the browser logs a CSP report for these images but still loads them.
 *
 * Grey wireframe
 *   BC's images carry their own brand-colour card backgrounds. `grayscale` turns those into greys of
 *   different darkness, which made dark text unreadable on some cards. The image is therefore also
 *   washed toward the light card background (opacity), giving every card a pale neutral grey on which
 *   the dark city name keeps its contrast. No gradients, no decorative colour.
 *
 * Accessibility
 *   Section heading (h2) labels the list; each card name is an h3. Arrow buttons are 56px, carry
 *   aria-controls for the row, and use aria-disabled (not `disabled`) at either end so keyboard focus
 *   is never dropped. The progress bar is decorative (aria-hidden): the row itself is the content.
 *   Scrolling by button is instant under prefers-reduced-motion.
 *
 * Key exports: CityBrowser (named)
 * External dependencies: react, next/link, lucide-react (ArrowLeft, ArrowRight, ArrowUpRight),
 *   ../breathe-atlas-chrome.config (atlasChapterHref), ../_data/cities, ../_data/cover-copy.
 *
 * Side effects (all cleaned up on unmount):
 *   - Scroll listener on the row and a ResizeObserver on it (progress bar and arrow states), with one
 *     pending animation frame at most.
 *   - On mount with a `currentCityId`: sets the row's scroll position so that city is in view.
 */

'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { atlasChapterHref } from '../breathe-atlas-chrome.config'
import { CITIES_ALPHABETICAL } from '../_data/cities'
import type { AtlasCity } from '../_data/cities'
import { BC_ABOUT_LINK, BC_ONE_LINER } from '../_data/cover-copy'

/** Props for CityBrowser. */
type CityBrowserProps = {
  /** Id for the section heading, so the caller can label its landmark or dialog with it. */
  headingId: string
  /** The chapter city to highlight and scroll into view (All cities panel on a chapter), or null. */
  currentCityId: string | null
}

/** Which part of the row is in view, as fractions of the row's full scroll width. */
type RowWindow = {
  /** Left edge of the visible part (0 to 1). */
  start: number
  /** Width of the visible part (0 to 1). 0 until first measured. */
  size: number
  /** True when scrolled fully left. */
  atStart: boolean
  /** True when scrolled fully right. */
  atEnd: boolean
}

/** Shared focus ring for the controls. */
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/** Reads the row's scroll position into a RowWindow. Pure: no side effects. */
function readRowWindow(row: HTMLElement): RowWindow {
  const { scrollLeft, scrollWidth, clientWidth } = row
  if (scrollWidth <= 0) return { start: 0, size: 0, atStart: true, atEnd: true }
  const maxScroll = Math.max(scrollWidth - clientWidth, 0)
  return {
    start: scrollLeft / scrollWidth,
    size: Math.min(clientWidth / scrollWidth, 1),
    // 1px tolerance: fractional scroll positions on high-density screens never hit the exact end.
    atStart: scrollLeft <= 1,
    atEnd: scrollLeft >= maxScroll - 1,
  }
}

/** One tall city card. */
function CityBrowserCard({ city, current }: { city: AtlasCity; current: boolean }) {
  return (
    <li
      data-city-id={city.id}
      className={`relative aspect-[6/7.5] w-[218px] shrink-0 snap-start overflow-hidden rounded-2xl bg-muted sm:w-[250px] lg:w-[280px] ${
        current ? 'ring-4 ring-foreground ring-offset-2 ring-offset-background' : ''
      }`}
    >
      {/* BC's card image (hotlinked, see IMAGE RIGHTS), anchored to the bottom, greyscale and washed
          toward the light card background. */}
      <img
        src={city.cardImage}
        alt={`Landmark in ${city.name}`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-bottom opacity-60 grayscale"
      />

      <div className="relative flex flex-col items-start gap-3 p-4 sm:p-5">
        <h3 className="text-xl font-medium leading-tight text-foreground sm:text-2xl">{city.name}</h3>

        {city.hasChapter ? (
          <Link
            href={atlasChapterHref(city.slug)}
            aria-label={`Open ${city.name}`}
            aria-current={current ? 'page' : undefined}
            className={`flex h-14 w-14 items-center justify-center rounded-full border border-foreground bg-background text-foreground transition-colors hover:bg-foreground hover:text-background ${FOCUS_RING}`}
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        ) : (
          // Greyed out and not focusable: this city has no chapter in the concept.
          <span
            role="link"
            aria-disabled="true"
            aria-label={`Open ${city.name}`}
            className="flex h-14 w-14 cursor-default items-center justify-center rounded-full border border-foreground/15 bg-muted text-foreground/35"
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </li>
  )
}

/** The cover browser. */
export function CityBrowser({ headingId, currentCityId }: CityBrowserProps) {
  const rowRef = useRef<HTMLUListElement>(null)
  const rowId = useId()
  const [rowWindow, setRowWindow] = useState<RowWindow>({ start: 0, size: 0, atStart: true, atEnd: false })

  /** Re-reads the row's scroll position into state. */
  const measure = useCallback(() => {
    const row = rowRef.current
    if (row === null) return
    setRowWindow(readRowWindow(row))
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

  // Side effect: on mount, scroll the row (never the page) so the current city is the first card in view.
  useEffect(() => {
    if (currentCityId === null) return
    const row = rowRef.current
    if (row === null) return
    const item = row.querySelector<HTMLElement>(`li[data-city-id="${currentCityId}"]`)
    if (item === null) return
    const paddingLeft = Number.parseFloat(window.getComputedStyle(row).paddingLeft)
    row.scrollLeft = item.offsetLeft - (Number.isNaN(paddingLeft) ? 0 : paddingLeft)
    measure()
  }, [currentCityId, measure])

  /** Scroll the row one card left (-1) or right (1). */
  const scrollByCard = (direction: -1 | 1) => {
    const row = rowRef.current
    if (row === null) return
    if ((direction === -1 && rowWindow.atStart) || (direction === 1 && rowWindow.atEnd)) return
    const firstCard = row.querySelector<HTMLElement>('li')
    const gap = Number.parseFloat(window.getComputedStyle(row).columnGap)
    const step = firstCard === null ? row.clientWidth : firstCard.offsetWidth + (Number.isNaN(gap) ? 0 : gap)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Side effect: scroll the row. Scroll snap settles it on a card edge.
    row.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const arrowClass = (disabled: boolean) =>
    `flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${FOCUS_RING} ${
      disabled
        ? 'cursor-default border-foreground/15 text-foreground/35'
        : 'border-foreground/60 text-foreground hover:bg-foreground hover:text-background'
    }`

  return (
    <div className="grid grid-cols-1 gap-y-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      {/* Text block: heading, the one line about BC, link to BC's site. */}
      <div className="md:col-start-1 md:row-start-1">
        <h2 id={headingId} className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">
          {CITIES_ALPHABETICAL.length} cities
        </h2>
        <p className="mt-3 text-base leading-relaxed text-foreground/80">{BC_ONE_LINER}</p>
        <a
          href={BC_ABOUT_LINK.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-1 inline-flex min-h-14 items-center gap-1 rounded-2xl text-sm font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-foreground/70 ${FOCUS_RING}`}
        >
          {BC_ABOUT_LINK.label}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>

      {/* Controls: arrows and progress bar. Below the row on a phone (order-last), under the text
          block from `md`. In the DOM they come before the row they control. */}
      <div className="order-last md:order-none md:col-start-1 md:row-start-2 md:self-end md:pb-2">
        <div className="flex justify-end gap-3 md:justify-start">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-controls={rowId}
            aria-disabled={rowWindow.atStart}
            aria-label="Previous cities"
            className={arrowClass(rowWindow.atStart)}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-controls={rowId}
            aria-disabled={rowWindow.atEnd}
            aria-label="Next cities"
            className={arrowClass(rowWindow.atEnd)}
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {/* Progress bar: a thin track with a thumb over the part of the row in view. Decorative. */}
        <div aria-hidden="true" className="relative mt-4 ml-auto h-1 w-full max-w-[10.5rem] md:ml-0">
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground/20" />
          <div
            className="absolute bottom-0 h-1 rounded-full bg-foreground"
            style={{ left: `${rowWindow.start * 100}%`, width: `${rowWindow.size * 100}%` }}
          />
        </div>
      </div>

      {/* The row: bleeds to the screen edges on a phone, scroll-snaps to card edges. The native
          scrollbar is hidden because the progress bar replaces it. */}
      <ul
        id={rowId}
        ref={rowRef}
        aria-labelledby={headingId}
        className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:col-start-2 md:row-span-2 md:row-start-1 md:-mx-2 md:scroll-px-2 md:px-2 [&::-webkit-scrollbar]:hidden"
      >
        {CITIES_ALPHABETICAL.map((city) => (
          <CityBrowserCard key={city.id} city={city} current={city.id === currentCityId} />
        ))}
      </ul>
    </div>
  )
}
