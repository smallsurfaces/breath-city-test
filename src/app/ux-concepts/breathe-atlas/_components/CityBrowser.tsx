/**
 * CityBrowser.tsx — the cover browser: every in-scope city in a sideways-scrolling carousel
 * (brief 4.3).
 *
 * Purpose
 *   A copy of the LAYOUT of Breathe Cities' own city carousel on breathecities.org (homepage and
 *   /cities/), in grey wireframe:
 *   - a text block on the left: a heading counted from the data ("N cities"), the one line about
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
 *   Every in-scope city in alphabetical order (CITIES_ALPHABETICAL). Each card: city name top-left, a
 *   circular arrow button under it (accessible name "Open [City]"), and BC's city card image anchored
 *   to the bottom in greyscale. The arrow links to the chapter for the seven chapter cities; for the
 *   rest it is greyed out: a role="link" span with aria-disabled that stays FOCUSABLE here
 *   (see Accessibility, BUG 9). The globe's city card uses the same greyed-out look but, per the
 *   round 2 spec (item 7), keeps its disabled arrow out of the tab order.
 *
 * Card size (Jack, brief 4.3, 2026-09-17)
 *   "About half the size of the first build, so more cities read at once and the carousel sits
 *   quieter beneath the globe." Read as half the AREA, not half the width: the widths went
 *   218/250/280 -> 152/172/192, which is about 70% of the linear size and so about half the area,
 *   and roughly doubles how many cards are in view. Half the WIDTH (109px) would have left no room
 *   for a name like "Rio de Janeiro". BC's 6:7.5 card shape, the layout, the scroll snap and the
 *   greyscale wash are unchanged; the padding and the name's type scale come down with the card.
 *
 * Touch targets — 56px hit area, 44px circle (design-director's ruling, 2026-09-18)
 *   frontend-standards R8 sets 56px as the minimum for every interactive element, and the card
 *   arrows were 44px (bug report 2026-09-17, BUG 6). They are now 56 x 56 to the finger and 44px
 *   to the eye: the visible circle keeps its 44px, because a 56px circle inside a 152px card
 *   dominates it and undoes the point of the smaller card (Jack's card-size ruling, brief 4.3),
 *   and CARD_ARROW_HIT_AREA extends the hit area around it with a centred pseudo-element, which
 *   adds no layout and moves nothing. The carousel's own prev/next arrows were already 56px.
 *   To VERIFY this, measure the ::before box, not the element box: the anchor's own
 *   getBoundingClientRect() is still 44px by design.
 *   Globe and sensor markers stay 44px, a separate documented exception (see AtlasGlobe and
 *   atlas-markers): bigger markers overlap at city density and cover the surface being dragged.
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
 * Rapid clicks on the arrows (bug report 2026-09-17, BUG 5)
 *   Nine fast clicks used to move the row two steps. Each click called `scrollBy`, which is
 *   relative to wherever `scrollLeft` happens to be AT THAT MOMENT — and during a smooth scroll
 *   that is a position still in flight, so the clicks collapsed into each other. The row now
 *   scrolls to an absolute position derived from a TARGET INDEX the component keeps
 *   (`targetIndexRef`): each click advances the index by one and scrolls to index x step, so nine
 *   clicks are nine steps whatever the animation is doing. The target is released when the row
 *   arrives, and on any touch, wheel or pointer input, so a swipe always resumes from where the
 *   reader actually is rather than from a stale target.
 *
 * Accessibility
 *   Section heading (h2) labels the list; each card name is an h3. The prev/next arrow buttons are
 *   56px, carry aria-controls for the row, and use aria-disabled (not `disabled`) at either end so
 *   keyboard focus is never dropped. The per-card arrows have a 56px hit area (see above).
 *   The cities with no chapter render a focusable aria-disabled link, so a keyboard or screen
 *   reader user meets them and hears that they are unavailable instead of never finding them
 *   (bug report 2026-09-17, BUG 9).
 *   The progress bar is decorative (aria-hidden): the row itself is the content.
 *   Scrolling by button is instant under prefers-reduced-motion.
 *
 * Arrow style
 *   The arrow classes (and the 56px CARD_ARROW_HIT_AREA) live in ./atlas-arrow-styles.ts since
 *   round 2, shared with the globe's prev/next arrows and the city card, so the concept has one
 *   arrow style.
 *
 * Key exports: CityBrowser (named)
 * External dependencies: react, next/link, lucide-react (ArrowLeft, ArrowRight, ArrowUpRight),
 *   ../breathe-atlas-chrome.config (atlasChapterHref), ../_data/cities, ../_data/cover-copy,
 *   ./atlas-arrow-styles.
 *
 * Side effects (all cleaned up on unmount):
 *   - Scroll listener on the row and a ResizeObserver on it (progress bar and arrow states), with one
 *     pending animation frame at most, plus pointerdown/touchstart/wheel listeners that release the
 *     arrows' pending scroll target.
 *   - On mount with a `currentCityId`: sets the row's scroll position so that city is in view.
 */

'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { atlasChapterHref } from '../breathe-atlas-chrome.config'
import { CITIES_ALPHABETICAL } from '../_data/cities'
import { CARD_ARROW_CLASS, CARD_ARROW_DISABLED_CLASS, FOCUS_RING, navArrowClass } from './atlas-arrow-styles'
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

/**
 * The row's scroll step: one card plus the gap after it. Read from the DOM rather than kept as a
 * constant, because the card width changes at `sm` and `lg` (see "Card size" in the header).
 * Falls back to a full row width when there are no cards to measure.
 */
function cardStep(row: HTMLElement): number {
  const firstCard = row.querySelector<HTMLElement>('li')
  if (firstCard === null) return row.clientWidth
  const gap = Number.parseFloat(window.getComputedStyle(row).columnGap)
  return firstCard.offsetWidth + (Number.isNaN(gap) ? 0 : gap)
}

/** One tall city card. */
function CityBrowserCard({ city, current }: { city: AtlasCity; current: boolean }) {
  return (
    <li
      data-city-id={city.id}
      className={`relative aspect-[6/7.5] w-[152px] shrink-0 snap-start overflow-hidden rounded-2xl bg-muted sm:w-[172px] lg:w-[192px] ${
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

      <div className="relative flex flex-col items-start gap-2.5 p-3 sm:p-3.5">
        <h3 className="text-base font-medium leading-tight text-foreground sm:text-lg">{city.name}</h3>

        {city.hasChapter ? (
          <Link
            href={atlasChapterHref(city.slug)}
            aria-label={`Open ${city.name}`}
            aria-current={current ? 'page' : undefined}
            className={CARD_ARROW_CLASS}
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          // Greyed out: this city has no chapter in the concept. FOCUSABLE though disabled
          // (tabIndex 0 with aria-disabled, the disabled-but-discoverable pattern): without a tab
          // stop, a keyboard or screen reader user passed straight over these cities and
          // never learned they had no chapter, while a sighted user could see it at a glance
          // (bug report 2026-09-17, BUG 9). There is no click handler, so it stays inert.
          <span
            role="link"
            tabIndex={0}
            aria-disabled="true"
            aria-label={`Open ${city.name}`}
            className={CARD_ARROW_DISABLED_CLASS}
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
  /**
   * The card index the arrow buttons are scrolling towards, or null when nothing is pending and
   * the row's own position is the truth. A ref, not state: a burst of clicks has to accumulate
   * synchronously within one batch of events, which a state update cannot do (BUG 5).
   */
  const targetIndexRef = useRef<number | null>(null)
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
      // Release the arrow buttons' target once the row has arrived at it, so the next click is
      // measured from the row again rather than from a target that is now history.
      const target = targetIndexRef.current
      if (target !== null) {
        const step = cardStep(row)
        const maxScroll = Math.max(row.scrollWidth - row.clientWidth, 0)
        if (step > 0 && Math.abs(row.scrollLeft - Math.min(target * step, maxScroll)) <= 1) {
          targetIndexRef.current = null
        }
      }
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        measure()
      })
    }
    // Any hand on the row wins: a swipe, a wheel or a drag cancels the pending smooth scroll, so
    // the target must go with it or the next arrow click would jump back to where the buttons had
    // been heading.
    const releaseTarget = () => {
      targetIndexRef.current = null
    }
    row.addEventListener('scroll', onScroll, { passive: true })
    row.addEventListener('pointerdown', releaseTarget, { passive: true })
    row.addEventListener('touchstart', releaseTarget, { passive: true })
    row.addEventListener('wheel', releaseTarget, { passive: true })
    // The row itself can be scrolled with the arrow keys, which fires no pointer event at all.
    row.addEventListener('keydown', releaseTarget, { passive: true })
    const observer = new ResizeObserver(() => measure())
    observer.observe(row)
    measure()
    return () => {
      row.removeEventListener('scroll', onScroll)
      row.removeEventListener('pointerdown', releaseTarget)
      row.removeEventListener('touchstart', releaseTarget)
      row.removeEventListener('wheel', releaseTarget)
      row.removeEventListener('keydown', releaseTarget)
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
    // Nothing is pending after a jump straight to a city: the next arrow click measures from here.
    targetIndexRef.current = null
    measure()
  }, [currentCityId, measure])

  /**
   * Scroll the row one card left (-1) or right (1).
   *
   * Absolute, from a target index this component owns — never `scrollBy`, which is relative to a
   * `scrollLeft` that is still animating and so silently swallowed rapid clicks (BUG 5; see the
   * header). `targetIndexRef` starts from where the reader actually is and then accumulates on its
   * own, so the ninth click is the ninth step.
   */
  const scrollByCard = (direction: -1 | 1) => {
    const row = rowRef.current
    if (row === null) return
    if ((direction === -1 && rowWindow.atStart) || (direction === 1 && rowWindow.atEnd)) return
    const step = cardStep(row)
    if (step <= 0) return
    const maxScroll = Math.max(row.scrollWidth - row.clientWidth, 0)
    // The last index that can actually be reached: past it the row has nothing left to show, and
    // clamping here is what makes a rapid burst at either end do nothing rather than overshoot.
    const maxIndex = Math.ceil(maxScroll / step)
    const from = targetIndexRef.current ?? Math.round(row.scrollLeft / step)
    const next = Math.min(Math.max(from + direction, 0), maxIndex)
    if (next === from) return
    targetIndexRef.current = next
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Side effect: scroll the row. Scroll snap settles it on a card edge.
    row.scrollTo({ left: Math.min(next * step, maxScroll), behavior: reduceMotion ? 'auto' : 'smooth' })
  }

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
            className={navArrowClass(rowWindow.atStart)}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-controls={rowId}
            aria-disabled={rowWindow.atEnd}
            aria-label="Next cities"
            className={navArrowClass(rowWindow.atEnd)}
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
