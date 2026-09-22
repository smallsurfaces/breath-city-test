/**
 * CityCard.tsx — the small card shown beside a city marker (brief 4.2; redesigned in round 2,
 * item 7).
 *
 * Purpose
 *   Names the city and offers its chapter. The card opens automatically beside the focus city while
 *   the idle cycle rests on it, when a marker is tapped, and when the globe's previous/next arrows
 *   step to a city. It has NO close button (round 3, R3.2: the × covered the photo and the card does
 *   not need it). GlobeCover closes it instead: on a tap or click anywhere outside it, when the globe
 *   is dragged, and on Escape, which is the keyboard path (see GlobeCover, "Closing the card").
 *
 *   The root carries `data-atlas-card` so GlobeCover can tell a press or focus inside the card
 *   (which turns an auto-opened card into one the visitor holds open).
 *
 *   The card is portalled into the selected marker's DOM node by AtlasGlobe, so its position is
 *   relative to the marker.
 *
 * Layout (round 2, item 7, all 16 cities)
 *   - Left column: city name (bold), country, then a round arrow button with a top-right arrow
 *     (lucide ArrowUpRight). The diagonal keeps it distinct from the globe's left/right arrows.
 *     It is the concept's one card-arrow style (./atlas-arrow-styles, shared with the carousel).
 *   - Right column: a small, rounded, greyscale photo (the city's `cardImage`, anchored to the
 *     bottom where BC's images carry the landmark). Nothing sits on it since the × went (R3.2).
 *   - White card background (ConceptCard). The old full-width "Open" pill is gone.
 *   - Chapter cities (7): the arrow links to the chapter.
 *   - Cities without a chapter (9): the arrow shows the carousel's greyed-out treatment and is NOT
 *     in the tab order (round 2 spec: "Not focusable as a link"). It stays exposed to assistive tech
 *     as a disabled link named "Open [City]", so a screen reader reading the card still meets it.
 *     No "coming soon" text. NOTE: this differs from the carousel's greyed-out arrow, which is
 *     focusable (BUG 9, 2026-09-17); the spec asked for this one not to be.
 *   - No photo credit on this card, matching the carousel. The photo is decorative (alt=""): the
 *     card is named by the city name.
 *
 * Position (Jack, brief 4.2): centred horizontally on the marker and ALWAYS above it, at every
 *   screen size. The card only opens on the focus city, which the globe turns to the centre of the
 *   canvas, so there is room for it above the marker.
 *
 * Never clipped at the screen edge (round 2, item 4)
 *   While the globe is still turning a tapped city to the centre, or after the visitor drags the
 *   globe, the marker can be near the screen edge, and a card centred on it used to run off the
 *   screen (seen on iPhone). The card is now clamped inside the viewport with a CARD_GUTTER_PX gutter
 *   on each side: THE CARD MOVES, THE MARKER STAYS PUT. The marker moves every frame while the globe
 *   turns, so the clamp is re-measured on every animation frame while the card is open (one
 *   getBoundingClientRect of the marker per frame) and written only when it changes. Measured once
 *   before the first paint, so the card never shows unclamped. Horizontal only: vertically the card
 *   hangs above a marker the globe is bringing to the centre.
 *
 * Grows out of the dot (round 3, R3.6)
 *   On open the card scales up from its city's dot to full size (OPEN_MS, ease-out); once GlobeCover
 *   sets `closing` it shrinks back into the dot (CLOSE_MS, ease-in) and then calls `onClosed`, so
 *   GlobeCover can unmount it and grow the next city's card. Every close path goes through this:
 *   tap outside, globe drag, Escape, and the tour, arrows or another pin moving on to a new city.
 *   The transform-origin is the dot's REAL position in the card's box (dotOrigin), kept up to date
 *   by the same per-frame loop as the clamp: on a phone the card is often pushed sideways, so the
 *   dot is not under the card's centre. Transform and opacity only (Web Animations). Under
 *   prefers-reduced-motion there is no scaling, only a short fade (FADE_MS). A closing card is
 *   `inert` and ignores pointers, so it cannot be tapped, focused or read on its way out.
 *   Every animation also has a timer that ends it shortly after its duration (playToEnd,
 *   ANIMATION_GRACE_MS). PR #70 review, bug 1: a Web Animation only advances while the page draws
 *   frames, and where it stopped drawing (the review pane) a card closed by a click outside sat at
 *   its first shrink frame, full size, and was never unmounted. The close now completes either way.
 *
 * Accessibility
 *   A non-modal dialog (role="dialog", labelled by the city name). It follows the marker button in
 *   DOM order, so Tab moves from the marker straight into the card. The arrow is 44px to the eye
 *   with a 56px hit area (frontend-standards R8, the carousel's CARD_ARROW_HIT_AREA pattern), so it
 *   fits a small card without shrinking the target. With the × gone, Escape closes the card from
 *   anywhere and puts focus back on the city's marker (GlobeCover), so a keyboard user is never
 *   left inside a card they cannot close. Focus never lands inside the card uninvited, and it holds
 *   no focus trap, so Tab always moves on past it.
 *
 * IMAGE RIGHTS
 *   `cardImage` is Breathe Cities' own city card image, HOTLINKED from breathecities.org for this
 *   internal prototype (see ../_data/cities.ts). Plain <img>, no next/image.
 *
 * Styling
 *   The shared ConceptCard surface; bridged semantics only (foreground/background/muted). No hex.
 *
 * Key exports: CityCard (named), CITY_CARD_WIDTH_PX, CITY_CARD_WIDTH_PX_SM
 * External dependencies: react, next/link, lucide-react (ArrowUpRight), @/components/concept
 *   (ConceptCard), ../breathe-atlas-chrome.config (atlasChapterHref), ../_data/cities (AtlasCity
 *   type), ./atlas-arrow-styles.
 *
 * Side effects (cleaned up on unmount): an animation-frame loop that reads the marker's position and
 *   writes the card's `left` (the viewport clamp above) and `transform-origin` (the dot); the open
 *   and close Web Animations on the card element, each with a fallback timer (playToEnd).
 */

'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ConceptCard } from '@/components/concept'
import { atlasChapterHref } from '../breathe-atlas-chrome.config'
import type { AtlasCity } from '../_data/cities'
import { CARD_ARROW_CLASS, CARD_ARROW_DISABLED_CLASS } from './atlas-arrow-styles'

/**
 * The card's width in px below `sm` (Tailwind `w-[248px]` below), kept as a number as well because
 * GlobeCover keeps the pause/play button clear of the card on a narrow screen and has to know how
 * wide the card is. 248 is the widest card that still clears the 56px button on a 375px phone.
 * Change both together.
 */
export const CITY_CARD_WIDTH_PX = 248
/** The card's width in px from `sm` (Tailwind `sm:w-72`). */
export const CITY_CARD_WIDTH_PX_SM = 288

/** Smallest gap (px) between the card and either side of the screen (round 2, item 4). */
const CARD_GUTTER_PX = 16

/**
 * How far (px) to move a card sideways from centred-on-its-marker so it stays inside the viewport
 * with CARD_GUTTER_PX either side. 0 when it already fits. If the card is wider than the viewport
 * allows, it is centred on the screen instead. Pure.
 */
function clampShift(markerCentreX: number, cardWidth: number, viewportWidth: number): number {
  const centredLeft = markerCentreX - cardWidth / 2
  const maxLeft = viewportWidth - CARD_GUTTER_PX - cardWidth
  const left =
    maxLeft < CARD_GUTTER_PX
      ? (viewportWidth - cardWidth) / 2
      : Math.min(Math.max(centredLeft, CARD_GUTTER_PX), maxLeft)
  return Math.round(left - centredLeft)
}

/** Grow-from-the-dot duration on open, in ms (round 3, R3.6: "about 200 to 250ms", ease-out). */
const OPEN_MS = 220
/** Shrink-into-the-dot duration on close, in ms (ease-in). */
const CLOSE_MS = 200
/** Under prefers-reduced-motion: a plain short fade instead, in ms, both ways. */
const FADE_MS = 150
/** How small the card starts (and ends) at the dot: about the size of the pulsing halo. */
const DOT_SCALE = 0.08
/**
 * Grace (ms) after an animation's own duration before a timer ends it anyway (PR #70 review, bug 1).
 * A Web Animation only advances while the page draws frames. Where frames stop (a hidden or
 * throttled browser view, as in the review pane), the close animation sat at its first frame
 * forever, so `finished` never resolved, the card was never unmounted and it stayed on screen at
 * full size after a click outside. The timer finishes the animation and reports the close, so the
 * card's state never depends on frames arriving.
 */
const ANIMATION_GRACE_MS = 80

/**
 * Plays `keyframes` on `element` and calls `onDone` exactly once when it ends: when the animation
 * finishes, or, at the latest, ANIMATION_GRACE_MS after its duration, when the timer jumps it to
 * its end state (see ANIMATION_GRACE_MS). Returns a cleanup that cancels both (it does not call
 * `onDone`).
 *
 * Side effects: starts a Web Animation on `element` and a timer.
 */
function playToEnd(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions & { duration: number },
  onDone: () => void,
): () => void {
  const animation = element.animate(keyframes, options)
  let settled = false
  const settle = () => {
    if (settled) return
    settled = true
    window.clearTimeout(timer)
    onDone()
  }
  const timer = window.setTimeout(() => {
    try {
      animation.finish()
    } catch {
      // An animation that cannot be finished (no active timeline) is cancelled below by the caller's
      // cleanup; the card's state still moves on.
    }
    settle()
  }, options.duration + ANIMATION_GRACE_MS)
  animation.finished.then(settle, () => {
    // Cancelled (the card unmounted first): nothing to report.
  })
  return () => {
    settled = true
    window.clearTimeout(timer)
    animation.cancel()
  }
}

/**
 * Where the city's dot sits in the card's own box, as a CSS transform-origin (round 3, R3.6), so
 * the card grows out of and shrinks into the dot, not its own bottom centre. Pure.
 *
 * Horizontally, the geometry is CityCard's own classes: the card is centred on the marker (left-1/2
 * and -translate-x-1/2) and moved `shift` px sideways by the clamp, so the dot is `shift` px left of
 * the card's centre. Vertically, the card's offsetTop is its top edge relative to the marker element
 * (its offsetParent: globe.gl positions the marker absolutely), whose centre is the dot.
 * transform-origin is measured in the untransformed box, and offsetWidth/offsetTop ignore the scale,
 * so they are the right numbers mid-animation too. Change this with the card's position classes.
 */
function dotOrigin(cardWidth: number, cardOffsetTop: number, markerHeight: number, shift: number): string {
  return `${cardWidth / 2 - shift}px ${markerHeight / 2 - cardOffsetTop}px`
}

/** True when the visitor prefers reduced motion (read when an animation starts). */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Props for CityCard. */
type CityCardProps = {
  /** The city the card is for. */
  city: AtlasCity
  /**
   * True once GlobeCover has closed the card: it shrinks into its dot (R3.6), ignores pointers and
   * is inert, then calls `onClosed`. The card mounts open and only ever goes from open to closing.
   */
  closing: boolean
  /** Called when the close animation has finished (or at once, where animation is unavailable). */
  onClosed: () => void
}

/** The marker card. */
export function CityCard({ city, closing, onClosed }: CityCardProps) {
  const headingId = `atlas-card-${city.id}`
  const rootRef = useRef<HTMLDivElement>(null)

  // Latest onClosed in a ref, so the close animation (started once) never calls a stale callback.
  const onClosedRef = useRef(onClosed)
  useEffect(() => {
    onClosedRef.current = onClosed
  }, [onClosed])

  // Side effect: keep the card inside the viewport while it is open (see "Never clipped at the
  // screen edge" in the header), and keep its transform-origin on the dot (R3.6). DOM reads (marker
  // position, card and marker size) and writes (the card's `left` and `transform-origin`) every
  // animation frame, written only on a change; the loop is cancelled on unmount. Layout effect,
  // declared before the open animation below, so the first clamp and origin land before the first
  // paint and before the card starts to grow.
  useLayoutEffect(() => {
    const card = rootRef.current
    if (card === null) return
    const marker = card.closest<HTMLElement>('.atlas-marker')
    if (marker === null) return
    let frame = 0
    let appliedShift = 0
    let appliedOrigin = ''
    const follow = () => {
      const markerRect = marker.getBoundingClientRect()
      const shift = clampShift(
        markerRect.left + markerRect.width / 2,
        card.offsetWidth,
        document.documentElement.clientWidth,
      )
      if (shift !== appliedShift) {
        card.style.left = shift === 0 ? '' : `calc(50% + ${shift}px)`
        appliedShift = shift
      }
      const origin = dotOrigin(card.offsetWidth, card.offsetTop, marker.offsetHeight, shift)
      if (origin !== appliedOrigin) {
        card.style.transformOrigin = origin
        appliedOrigin = origin
      }
      frame = window.requestAnimationFrame(follow)
    }
    follow()
    return () => window.cancelAnimationFrame(frame)
  }, [])

  // The open animation's cleanup, so the close can stop it (and its timer) before shrinking.
  const stopOpenRef = useRef<(() => void) | null>(null)

  // Side effect: grow out of the dot on open (R3.6): a Web Animation on transform and opacity only,
  // so it stays on the compositor on a phone. Under reduced motion, a plain fade. playToEnd's timer
  // ends it even where no frames are drawn, so the card never sticks invisible at its first frame.
  // Cancelled on unmount. Layout effect, so the card's first paint is already the animation's first
  // frame.
  useLayoutEffect(() => {
    const card = rootRef.current
    if (card === null || typeof card.animate !== 'function') return
    const reduced = prefersReducedMotion()
    const keyframes = reduced
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
          { opacity: 0, transform: `scale(${DOT_SCALE})` },
          { opacity: 1, transform: 'scale(1)' },
        ]
    const stop = playToEnd(card, keyframes, { duration: reduced ? FADE_MS : OPEN_MS, easing: 'ease-out' }, () => {
      // Open: nothing to report.
    })
    stopOpenRef.current = stop
    return () => {
      stopOpenRef.current = null
      stop()
    }
  }, [])

  // Side effect: shrink into the dot once closed (R3.6), then tell GlobeCover. Starts from wherever
  // the open animation has got to (its current values are committed first, then it is stopped), so
  // a card closed while it is still growing shrinks back from there instead of jumping. `fill:
  // forwards` holds the end state until GlobeCover unmounts the card. GlobeCover hears about the
  // close when the animation ends, or from playToEnd's timer at the latest (PR #70 review, bug 1:
  // it used to wait on the animation alone, which never ended where no frames were drawn).
  // Cancelled on unmount.
  useEffect(() => {
    if (!closing) return
    const card = rootRef.current
    if (card === null || typeof card.animate !== 'function') {
      onClosedRef.current()
      return
    }
    for (const running of card.getAnimations()) {
      try {
        running.commitStyles()
      } catch {
        // Not rendered (nothing to start from): the close starts from the card's own styles.
      }
    }
    stopOpenRef.current?.()
    for (const running of card.getAnimations()) running.cancel()
    const reduced = prefersReducedMotion()
    return playToEnd(
      card,
      reduced ? [{ opacity: 0 }] : [{ opacity: 0, transform: `scale(${DOT_SCALE})` }],
      { duration: reduced ? FADE_MS : CLOSE_MS, easing: 'ease-in', fill: 'forwards' },
      () => onClosedRef.current(),
    )
  }, [closing])

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-labelledby={headingId}
      data-atlas-card="true"
      // A closing card is on its way out: not clickable, not focusable, not announced.
      inert={closing}
      className={`absolute bottom-full left-1/2 z-10 mb-1 w-[248px] -translate-x-1/2 sm:w-72 ${closing ? 'pointer-events-none' : ''}`}
    >
      <ConceptCard noPadding className="flex gap-3 p-3.5 text-left">
        {/* Left column: name, country, arrow. */}
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <p id={headingId} className="text-base font-bold leading-tight text-foreground sm:text-lg">
            {city.name}
          </p>
          <p className="mt-0.5 text-sm text-foreground/70">{city.country}</p>

          <div className="mt-auto pt-3">
            {city.hasChapter ? (
              // Links to the city's chapter.
              <Link href={atlasChapterHref(city.slug)} aria-label={`Open ${city.name}`} className={CARD_ARROW_CLASS}>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              // Greyed out: this city has no chapter in the concept. Not in the tab order (round 2
              // spec) and no click handler, so it is inert; exposed to assistive tech as a disabled link.
              <span role="link" aria-disabled="true" aria-label={`Open ${city.name}`} className={CARD_ARROW_DISABLED_CLASS}>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>

        {/* Right column: the city's photo, greyscale. No close button on it (R3.2). */}
        <img
          src={city.cardImage}
          alt=""
          decoding="async"
          className="block h-[100px] w-20 shrink-0 rounded-xl bg-muted object-cover object-bottom grayscale"
        />
      </ConceptCard>
    </div>
  )
}
