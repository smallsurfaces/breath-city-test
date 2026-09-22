/**
 * GlobeCover.tsx — the Breathe Atlas landing-page globe cover (brief 4.2).
 *
 * Purpose
 *   Composes the cover: the oversized wordmark behind the globe (with the resting city's name in the
 *   gap, bleeding off both edges), the globe with its 16 pulsating city markers, the city card, the
 *   pause/play control at the globe's top right and the mission lines below the globe. Owns the idle
 *   cycle and all interaction state; AtlasGlobe owns three.js.
 *
 * Layout (round 2, items 3 to 5)
 *   Sized around the SPHERE, in CSS (COVER_LAYOUT_CSS), so the server-rendered page already has the
 *   final layout:
 *   - The globe is near full width inside 16px gutters on a phone (item 4); from `sm` and `lg` it
 *     keeps the size Jack tested.
 *   - "BREATHE" and "CITIES" sit a fixed share of the globe's diameter from its centre at every
 *     breakpoint (WORDMARK_REACH_SHARE, item 5), overlapping the top and bottom of the globe, and
 *     the stage is exactly that tall: the empty height above and below the globe is gone (item 3).
 *     At 1280 x 800 the mission lines now sit above the fold.
 *   - The WebGL canvas is larger than the sphere (globe-framing.ts); its transparent margin
 *     overflows the stage and the section clips it.
 *   - The controls sit on a square laid exactly over the sphere.
 *   - The city card is clamped inside the viewport by CityCard itself (item 4).
 *   Trade-off on a phone: the near-full-width globe covers most of the city name behind it (only
 *   its first and last letters show) and more of "BREATHE" and "CITIES" than before. That was the
 *   reason for the old 0.8 phone scale; item 4 asked for the bigger globe.
 *
 * Idle cycle (brief 4.2)
 *   Starts resting on Bogotá, then visits every city eastward (CYCLE_ORDER). For each city the globe
 *   turns to it over TURN_MS (6s), rests REST_MS (5s), then moves on: about 11s per city, about
 *   3 minutes for the loop. While the globe rests on a city (the focus city):
 *     - its marker becomes an enlarged pulsating dot,
 *     - its card opens automatically above the marker, inviting a tap on its arrow,
 *     - its name fades in between "BREATHE" and "CITIES", behind the globe,
 *     - its mission line fades in below the globe.
 *   As the globe moves on, the card closes and the name and city mission line fade out. BC's mission
 *   line below it is permanent: it never fades or changes.
 *
 * Cards: auto-opened and held
 *   - The auto-opened card belongs to the resting city and never pauses the cycle by itself.
 *   - A press, tap or keyboard focus inside the auto-opened card is an interaction: the card becomes
 *     a held card (as if its marker had been tapped), which pauses the cycle and stays open until the
 *     visitor closes it. This also stops the card vanishing from under a keyboard or screen reader
 *     user while they are in it.
 *   - Tapping a marker (or Enter/Space on a focused marker) pauses the cycle, turns the globe to the
 *     city (SELECT_TURN_MS) and opens a held card above the marker, as before.
 *   - A held card closes on its close button, Escape, or a tap anywhere outside the card and markers
 *     (a drag does not count as a tap). Closing any card keeps it closed until the globe rests on a
 *     city again.
 *
 * Previous/next arrows (round 2, item 2)
 *   Two arrows either side of the globe, in the carousel's arrow style, step through CYCLE_ORDER
 *   and open the city's card the way the tour does: the globe turns (SELECT_TURN_MS), then rests
 *   on the city, whose card opens automatically. A press is an explicit pause (the pause button
 *   shows Play). Presses accumulate from the city a step is already turning to, so fast presses
 *   move one city each. A marker tap or a drag cancels a step in flight; pressing play mid-step
 *   lets the tour carry on to that city. Real buttons named "Previous city" and "Next city", 56px.
 *
 * Pausing (brief 4.2 "Motion and accessibility")
 *   The cycle runs only when ALL of these hold:
 *     - the globe is ready,
 *     - `playing` is true (the visible pause/play button, WCAG 2.2.2; an explicit pause stays paused),
 *     - no interaction hold is active (any drag, tap, key press or focus inside the cover starts a
 *       hold; it clears INTERACTION_RESUME_MS (10s) after the last interaction),
 *     - no held card is open (the resume countdown starts when the card closes).
 *   Pausing mid-turn freezes the globe where it is; resuming continues to the city it was turning
 *   to. Pausing while resting keeps the city (and its auto-opened card) shown; resuming moves on.
 *
 * Reduced motion
 *   With prefers-reduced-motion: reduce, `playing` starts false, the globe stays still on Bogotá
 *   (so Bogotá is the focus city, with its card open), the cycle does not run, marker taps jump
 *   without animation, fades are instant and marker pulses are still. The pause/play button stays
 *   present; pressing play is an explicit opt-in to the cycle.
 *
 * Key exports: GlobeCover (named)
 * External dependencies: react, next/dynamic, lucide-react (ArrowLeft, ArrowRight, Pause, Play),
 *   ./AtlasGlobe (client-only, loaded with ssr: false), ./CityCard, ./Wordmark, ./globe-framing,
 *   ./atlas-arrow-styles, ../_data/cities.
 *
 * Side effects (all cleaned up on unmount):
 *   - ResizeObserver on the canvas box (the WebGL canvas's pixel size).
 *   - matchMedia listener for prefers-reduced-motion.
 *   - Timers for the cycle, the interaction resume countdown and an arrow step's rest.
 *   - Document pointerdown/pointerup/keydown listeners while a held card is open (tap-outside, Escape).
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import dynamic from 'next/dynamic'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import type { AtlasGlobeApi } from './AtlasGlobe'
import { navArrowClass } from './atlas-arrow-styles'
import { CITY_CARD_WIDTH_PX, CITY_CARD_WIDTH_PX_SM, CityCard } from './CityCard'
import { SPHERE_SHARE_OF_CANVAS } from './globe-framing'
import { Wordmark } from './Wordmark'
import { ATLAS_CITIES, BC_MISSION_LINE, CYCLE_ORDER } from '../_data/cities'
import type { AtlasCity } from '../_data/cities'

/** The globe touches `window` (WebGL, canvas, DOM markers): client-only, never server-rendered. */
const AtlasGlobe = dynamic(() => import('./AtlasGlobe'), { ssr: false })

/** Globe turn between cities in the idle cycle (brief: "smooth ~6 second transition"). */
const TURN_MS = 6000
/** Rest on each city (brief: "pauses 5 seconds"). */
const REST_MS = 5000
/** Resume the cycle this long after the last interaction (brief: 10 seconds). */
const INTERACTION_RESUME_MS = 10000
/** Turn to a tapped marker's city. Shorter than the idle turn so the tap feels responsive. */
const SELECT_TURN_MS = 1200
/** Pointer travel (px) above which a press counts as a drag rather than a tap. */
const DRAG_THRESHOLD_PX = 6
/**
 * Side gutter (px) between the globe and the screen edge on a phone, and the minimum anywhere
 * (round 2, item 4: "close to full width inside the 16px gutters").
 */
const GUTTER_PX = 16
/**
 * Largest globe (the visible sphere) from `sm` and from `lg`, in px. These are the sphere sizes of
 * the 540px and 620px canvases Jack tested, so tablet and desktop keep the globe he signed off; what
 * changed in round 2 is the empty height around it (items 3 and 5).
 */
const SPHERE_MAX_PX_TABLET = Math.round(540 * SPHERE_SHARE_OF_CANVAS)
const SPHERE_MAX_PX_DESKTOP = Math.round(620 * SPHERE_SHARE_OF_CANVAS)
/**
 * THE wordmark-to-globe rule (round 2, items 3 and 5), the same at every breakpoint: the OUTER edge
 * of each wordmark line (the top of "BREATHE", the bottom of "CITIES") sits this share of the
 * globe's diameter from the globe's centre, and the stage is exactly that tall either side. So the
 * stage is 1.12 globe diameters tall and the page loses the empty height it used to carry above and
 * below the globe (item 3), and the lines overlap the top and bottom of the globe.
 *
 * Anchored on the outer edge rather than the line's centre because the wordmark's type scales with
 * the page width and the globe does not scale the same way: on a phone the type is small next to a
 * near-full-width globe, and a centre anchor tucked "BREATHE" and "CITIES" almost entirely behind
 * it. 0.56 was judged on the tablet layout (the reference, item 5); at 1024px and up the lines come
 * in further over the globe, on a phone slightly less. Jack judges it live; this is the one number
 * to tune. It also keeps the globe's pale atmosphere glow (radius 0.58 of the diameter) almost
 * whole: the cover section clips at its top edge.
 */
const WORDMARK_REACH_SHARE = 0.56
/**
 * Extra stage height beyond each wordmark line's outer edge: a little air between the nav and the
 * top of "BREATHE" (and below "CITIES"). Nothing clips without it (measured: in the rendered font
 * the capitals sit 0.05em inside their 0.8em line box); before round 2 the lines had `py-[2cqw]`,
 * which is 26px at 1280 and pushed the mission line back below the fold.
 */
const WORDMARK_EDGE_PAD = '8px'
/** Diameter of the pause/play button, in px (its `h-14 w-14` classes). */
const PAUSE_BUTTON_PX = 56
/** Gap between the globe and its previous/next arrows from `sm`, in px (round 2, item 2). */
const STEP_ARROW_GAP_PX = 24
/** Clear space kept between the pause/play button and the open city card on a phone, in px. */
const PAUSE_CARD_CLEARANCE_PX = 8
/** The same from `sm`, where there is room for more. */
const PAUSE_CARD_CLEARANCE_PX_SM = 16

/**
 * The cover layout, as CSS (round 2, items 3 to 5). Rendered once in a <style> element. Written as
 * CSS rather than computed in JavaScript so the server-rendered page already has the final layout:
 * nothing jumps when the script loads.
 *
 * Container: the cover <section> is an inline-size container ("atlas-cover"), so on the stage 100cqw
 * is the page width and the breakpoints below match Tailwind's `sm` (640) and `lg` (1024). Inside
 * the stage (itself a size container), 100cqw is the stage width, which is the same number up to
 * `max-w-6xl`, and beyond it the globe is capped anyway.
 *
 * --atlas-sphere: the globe's diameter. On a phone the page width less the two gutters (item 4);
 *   from `sm` and `lg` the sizes Jack tested (SPHERE_MAX_PX_*), never wider than the page allows.
 * --atlas-wordmark-reach: WORDMARK_REACH_SHARE of the diameter (item 5), read by Wordmark.
 * Stage height: twice the reach plus WORDMARK_EDGE_PAD each side, so the wordmark lines sit just
 *   inside the stage's top and bottom edges.
 * .atlas-canvas-box: the WebGL canvas, 1 / SPHERE_SHARE_OF_CANVAS of the diameter so the SPHERE is
 *   --atlas-sphere wide. Its empty margin overflows the stage, which is harmless: it is transparent,
 *   and the cover section clips anything past the page edges.
 * .atlas-sphere-box: a square exactly over the sphere, which the controls are placed on.
 * .atlas-pause: the pause/play button at the TOP RIGHT OF THE GLOBE (Jack, brief 4.2), except
 *   where that would put it under the open city card: the card is centred and --atlas-card-w wide,
 *   so the button clears it only while its inset from the stage edge is at most
 *   (stage - card) / 2 - button - clearance. On a narrow phone that is less than the gutter, so the
 *   button moves out towards the stage's own edge, where it still reads as the globe's top right
 *   because the globe nearly fills the width. (It sits in the sphere box, so `right` is measured
 *   from the sphere's edge, hence the "- --atlas-inset".) Clamped at the stage edge, so it can never
 *   be pushed off the stage.
 * .atlas-step: the previous/next city arrows (round 2, item 2), either side of the globe. From `sm`
 *   they sit beside the sphere at its vertical centre, STEP_ARROW_GAP_PX clear of it (there is room:
 *   at 640px the sphere leaves 115px each side). On a phone the globe fills the width, so they sit in
 *   the sphere square's bottom corners instead, where the round globe curves away and leaves room
 *   (a 56px button there clears a 358px sphere by about 6px).
 */
const COVER_LAYOUT_CSS = `.atlas-cover { container: atlas-cover / inline-size; }
.atlas-stage {
  --atlas-sphere: calc(100cqw - ${GUTTER_PX * 2}px);
  --atlas-card-w: ${CITY_CARD_WIDTH_PX}px;
  --atlas-pause-clearance: ${PAUSE_CARD_CLEARANCE_PX}px;
  --atlas-wordmark-reach: calc(${WORDMARK_REACH_SHARE} * var(--atlas-sphere));
  height: calc(2 * (var(--atlas-wordmark-reach) + ${WORDMARK_EDGE_PAD}));
}
@container atlas-cover (min-width: 640px) {
  .atlas-stage {
    --atlas-sphere: min(calc(100cqw - ${GUTTER_PX * 2}px), ${SPHERE_MAX_PX_TABLET}px);
    --atlas-card-w: ${CITY_CARD_WIDTH_PX_SM}px;
    --atlas-pause-clearance: ${PAUSE_CARD_CLEARANCE_PX_SM}px;
  }
}
@container atlas-cover (min-width: 1024px) {
  .atlas-stage { --atlas-sphere: min(calc(100cqw - ${GUTTER_PX * 2}px), ${SPHERE_MAX_PX_DESKTOP}px); }
}
.atlas-canvas-box {
  width: calc(var(--atlas-sphere) / ${SPHERE_SHARE_OF_CANVAS.toFixed(5)});
  height: calc(var(--atlas-sphere) / ${SPHERE_SHARE_OF_CANVAS.toFixed(5)});
}
.atlas-sphere-box { width: var(--atlas-sphere); height: var(--atlas-sphere); }
.atlas-pause {
  --atlas-inset: calc((100cqw - var(--atlas-sphere)) / 2);
  --atlas-pause-cap: calc((100cqw - var(--atlas-card-w)) / 2 - ${PAUSE_BUTTON_PX}px - var(--atlas-pause-clearance));
  top: 0;
  right: calc(max(min(var(--atlas-inset), var(--atlas-pause-cap)), 0px) - var(--atlas-inset));
}
.atlas-step { bottom: 0; }
.atlas-step-prev { left: 0; }
.atlas-step-next { right: 0; }
@container atlas-cover (min-width: 640px) {
  .atlas-step { top: 50%; bottom: auto; translate: 0 -50%; }
  .atlas-step-prev { left: auto; right: calc(100% + ${STEP_ARROW_GAP_PX}px); }
  .atlas-step-next { right: auto; left: calc(100% + ${STEP_ARROW_GAP_PX}px); }
}`

/** What the cover is showing: resting on a cycle city, or not resting on any. */
type CoverView = { kind: 'resting'; index: number } | { kind: 'free' }

/** Index of a city in the cycle order (0 when not found, which cannot happen with local data). */
function cycleIndexOf(cityId: string): number {
  const index = CYCLE_ORDER.findIndex((city) => city.id === cityId)
  return index < 0 ? 0 : index
}

/** True when an event target sits inside a marker (its button or its card). */
function isInsideMarker(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('.atlas-marker') !== null
}

/** True when an event target sits inside one of the cover's own controls (pause, arrows). */
function isInsideControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-atlas-control]') !== null
}

/** True when an event target sits inside a city card. */
function isInsideCard(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-atlas-card]') !== null
}

/** The globe cover. */
export function GlobeCover() {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasBoxRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<AtlasGlobeApi | null>(null)

  // The WebGL canvas side in px, measured from its CSS-sized box (0 until measured).
  const [canvasSide, setCanvasSide] = useState(0)
  const [globeReady, setGlobeReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [interactionHold, setInteractionHold] = useState(false)
  // The held card's city (tapped marker, or an auto-opened card the visitor interacted with).
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)
  // True once the visitor closed the card for the current rest; cleared when the globe rests again.
  const [autoCardDismissed, setAutoCardDismissed] = useState(false)
  const [view, setView] = useState<CoverView>({ kind: 'resting', index: 0 })
  // The last city shown, kept after the globe moves on so names and lines can fade out.
  const [lastShownIndex, setLastShownIndex] = useState(0)

  // Cycle position, in refs so timers and cleanups read the latest values without re-running effects.
  const restingIndexRef = useRef<number | null>(0) // the city the camera rests on, or null
  const nextIndexRef = useRef(1) // the city the cycle turns to next
  const restFirstRef = useRef(true) // first run rests on Bogotá before turning
  const resumeTimerRef = useRef<number | undefined>(undefined)
  const pointerDownRef = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  // The previous/next arrows (item 2): the city a step is turning to (null when none is in flight),
  // and the timer that rests on it when the turn ends. A ref so a burst of presses accumulates.
  const stepTargetRef = useRef<number | null>(null)
  const stepTimerRef = useRef<number | undefined>(undefined)

  const running = globeReady && playing && !interactionHold && selectedCityId === null

  /* ---- Derived view state ---- */
  const resting = view.kind === 'resting'
  const shownCity = CYCLE_ORDER[resting ? view.index : lastShownIndex]
  const selectedCity = selectedCityId === null ? null : ATLAS_CITIES.find((city) => city.id === selectedCityId) ?? null
  // The auto-opened card: the resting city's, unless a held card is open or the visitor closed it.
  const autoCardCity = selectedCity === null && resting && !autoCardDismissed ? shownCity : null
  const cardCity = selectedCity ?? autoCardCity
  const cardCityId = cardCity === null ? null : cardCity.id
  // The focus city (enlarged pulsating marker): the held card's city, else the resting city.
  const focusCityId = selectedCityId ?? (resting ? shownCity.id : null)

  // Side effect: size the WebGL canvas to its CSS-sized box (ResizeObserver attach/detach). The
  // layout itself is CSS (COVER_LAYOUT_CSS); the canvas is the one thing that needs a number.
  useEffect(() => {
    const box = canvasBoxRef.current
    if (box === null) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect === undefined) return
      setCanvasSide(Math.round(rect.width))
    })
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  // Side effect: follow prefers-reduced-motion (matchMedia listener attach/detach).
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      setReducedMotion(query.matches)
      if (query.matches) setPlaying(false)
    }
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  // Clear the resume countdown on unmount.
  useEffect(() => () => window.clearTimeout(resumeTimerRef.current), [])
  // Clear a pending arrow step on unmount.
  useEffect(() => () => window.clearTimeout(stepTimerRef.current), [])

  /** Cancel an arrow step that is still turning (another interaction has taken over). */
  const cancelStep = useCallback(() => {
    window.clearTimeout(stepTimerRef.current)
    stepTargetRef.current = null
  }, [])

  /** Start (or restart) an interaction hold with no countdown running. */
  const holdForInteraction = useCallback(() => {
    window.clearTimeout(resumeTimerRef.current)
    setInteractionHold(true)
  }, [])

  /** Start the countdown that lifts the interaction hold after 10s without interaction. */
  const scheduleResume = useCallback(() => {
    window.clearTimeout(resumeTimerRef.current)
    setInteractionHold(true)
    resumeTimerRef.current = window.setTimeout(() => setInteractionHold(false), INTERACTION_RESUME_MS)
  }, [])

  /**
   * The idle cycle. Runs while `running` is true; its cleanup is the pause path.
   *
   * Why refs, not state, drive the position: the timers chain turn -> rest -> turn across many
   * renders, and pausing/resuming must continue from exactly where the camera is. The refs are the
   * single source of that position; `view` only mirrors it for rendering.
   */
  useEffect(() => {
    if (!running) return
    const api = apiRef.current
    if (api === null) return

    let cancelled = false
    let timer: number | undefined
    const count = CYCLE_ORDER.length

    const rest = (index: number) => {
      if (cancelled) return
      restingIndexRef.current = index
      nextIndexRef.current = (index + 1) % count
      setView({ kind: 'resting', index })
      setLastShownIndex(index)
      // A new rest: the resting city's card opens automatically again.
      setAutoCardDismissed(false)
      timer = window.setTimeout(() => turn((index + 1) % count), REST_MS)
    }

    const turn = (index: number) => {
      if (cancelled) return
      const city = CYCLE_ORDER[index]
      restingIndexRef.current = null
      nextIndexRef.current = index
      setView({ kind: 'free' })
      api.turnTo(city.lat, city.lng, TURN_MS)
      timer = window.setTimeout(() => rest(index), TURN_MS)
    }

    const restingIndex = restingIndexRef.current
    if (restFirstRef.current && restingIndex !== null) {
      rest(restingIndex)
    } else {
      turn(restingIndex !== null ? (restingIndex + 1) % count : nextIndexRef.current)
    }
    restFirstRef.current = false

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      // Paused mid-turn: freeze the globe where it is. Paused while resting: leave it on the city.
      if (restingIndexRef.current === null) api.stopTurning()
    }
  }, [running])

  /** AtlasGlobe is ready: keep its API and let the cycle start. */
  const handleGlobeReady = useCallback((api: AtlasGlobeApi) => {
    apiRef.current = api
    setGlobeReady(true)
  }, [])

  /** A marker was activated: hold the cycle, turn to the city, open its held card. */
  const handleMarkerSelect = useCallback(
    (city: AtlasCity) => {
      holdForInteraction()
      cancelStep()
      const index = cycleIndexOf(city.id)
      // Set the resting position BEFORE the cycle cleanup runs, so the cleanup does not cancel
      // the turn started below.
      restingIndexRef.current = index
      nextIndexRef.current = (index + 1) % CYCLE_ORDER.length
      setSelectedCityId(city.id)
      setAutoCardDismissed(false)
      setView({ kind: 'resting', index })
      setLastShownIndex(index)
      apiRef.current?.turnTo(city.lat, city.lng, reducedMotion ? 0 : SELECT_TURN_MS)
    },
    [holdForInteraction, cancelStep, reducedMotion],
  )

  /** Close the open card (held or auto-opened); the resume countdown starts now. */
  const closeCard = useCallback(
    (returnFocus: boolean) => {
      if (returnFocus && cardCityId !== null) {
        // Side effect: move keyboard focus back to the marker the card belonged to. Done FIRST: the
        // focus event runs the stage's focus handler synchronously with this render's state (card
        // still open), which holds the cycle; the countdown below must be scheduled after it.
        stageRef.current?.querySelector<HTMLButtonElement>(`button[data-city-id="${cardCityId}"]`)?.focus()
      }
      setSelectedCityId(null)
      // Keep it closed for the rest of this rest, so the auto-opened card does not pop straight back.
      setAutoCardDismissed(true)
      scheduleResume()
    },
    [scheduleResume, cardCityId],
  )

  // Side effect: while a held card is open, close it on Escape or on a tap outside the card and markers.
  useEffect(() => {
    if (selectedCityId === null) return
    let down: { x: number; y: number } | null = null
    const onDown = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY }
    }
    const onUp = (event: PointerEvent) => {
      if (down === null) return
      const travelled = Math.hypot(event.clientX - down.x, event.clientY - down.y)
      down = null
      if (travelled > DRAG_THRESHOLD_PX || isInsideMarker(event.target)) return
      closeCard(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCard(true)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('keydown', onKey)
    }
  }, [selectedCityId, closeCard])

  /* ---- Stage interaction: any press, drag, key or focus in the cover holds the cycle. ---- */

  /**
   * A press or focus inside the auto-opened card turns it into a held card (see file header).
   * Returns true when it did.
   */
  const holdAutoCardIfInside = (target: EventTarget | null): boolean => {
    if (autoCardCity === null || !isInsideCard(target)) return false
    setSelectedCityId(autoCardCity.id)
    return true
  }

  /** Records a key press or focus inside the cover. */
  const noteStageInteraction = (target: EventTarget | null) => {
    if (holdAutoCardIfInside(target) || selectedCityId !== null) holdForInteraction()
    else scheduleResume()
  }

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    holdForInteraction()
    holdAutoCardIfInside(event.target)
    pointerDownRef.current = { x: event.clientX, y: event.clientY, moved: false }
  }

  const handleStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const down = pointerDownRef.current
    if (down === null || down.moved || isInsideMarker(event.target) || isInsideControl(event.target)) return
    if (Math.hypot(event.clientX - down.x, event.clientY - down.y) <= DRAG_THRESHOLD_PX) return
    // The visitor is dragging the globe away from wherever it rested (this closes an auto-opened card).
    down.moved = true
    cancelStep()
    restingIndexRef.current = null
    setView({ kind: 'free' })
  }

  const handleStagePointerEnd = () => {
    pointerDownRef.current = null
    if (selectedCityId === null) scheduleResume()
  }

  const handleStageKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Escape closes an auto-opened card the visitor has not taken hold of (a held card's Escape is
    // handled by the document listener above).
    if (event.key === 'Escape' && selectedCityId === null && autoCardCity !== null) {
      closeCard(false)
      return
    }
    noteStageInteraction(event.target)
  }

  const handleStageFocus = (event: ReactFocusEvent<HTMLDivElement>) => {
    noteStageInteraction(event.target)
  }

  /** The visible pause/play button. An explicit pause stays paused until play is pressed. */
  const togglePlaying = () => {
    window.clearTimeout(resumeTimerRef.current)
    setInteractionHold(false)
    if (selectedCityId !== null && !playing) setSelectedCityId(null)
    const stepTarget = stepTargetRef.current
    if (stepTarget !== null) {
      // Play pressed while an arrow step is still turning: the tour carries on to that city.
      cancelStep()
      restingIndexRef.current = null
      nextIndexRef.current = stepTarget
    }
    setPlaying((value) => !value)
  }

  /**
   * The globe's previous/next arrows (round 2, item 2). Steps one city back or on in CYCLE_ORDER,
   * turns the globe to it and, when the turn ends, rests on it and opens its card, exactly as the
   * idle tour does. A press is an explicit pause: `playing` goes false, so the pause button shows
   * the paused (Play) state and the tour stays stopped until play is pressed.
   *
   * Where it steps from: the city a step is already turning to (so a burst of presses goes one
   * city per press, whatever the animation is doing, the carousel's BUG 5 lesson), else the city
   * the globe rests on, else (mid-turn or after a drag) the city the tour was heading to for "next"
   * and the one before it for "previous".
   */
  const stepCity = (direction: -1 | 1) => {
    const api = apiRef.current
    if (api === null) return
    const count = CYCLE_ORDER.length
    const pending = stepTargetRef.current
    let target: number
    if (pending !== null) target = (pending + direction + count) % count
    else if (view.kind === 'resting') target = (view.index + direction + count) % count
    else target = direction === 1 ? nextIndexRef.current : (nextIndexRef.current - 1 + count) % count

    window.clearTimeout(resumeTimerRef.current)
    setInteractionHold(false)
    setPlaying(false)
    setSelectedCityId(null)
    setAutoCardDismissed(false)
    // Set the resting position BEFORE the cycle cleanup runs (pausing stops the cycle, and its
    // cleanup freezes the camera unless a city is resting), so it does not cancel the turn below.
    restingIndexRef.current = target
    nextIndexRef.current = (target + 1) % count
    stepTargetRef.current = target
    // Turning: names, mission line and card fade out, as in the tour.
    setView({ kind: 'free' })

    const city = CYCLE_ORDER[target]
    const duration = reducedMotion ? 0 : SELECT_TURN_MS
    api.turnTo(city.lat, city.lng, duration)
    window.clearTimeout(stepTimerRef.current)
    // Side effect: timer that rests on the city once the turn ends (cleared by cancelStep/unmount).
    stepTimerRef.current = window.setTimeout(() => {
      stepTargetRef.current = null
      setView({ kind: 'resting', index: target })
      setLastShownIndex(target)
      setAutoCardDismissed(false)
    }, duration)
  }

  const fade = 'transition-opacity duration-700 ease-out motion-reduce:transition-none'

  return (
    <section aria-labelledby="atlas-cover-title" className="atlas-cover relative overflow-hidden">
      {/* The cover layout (stage height, globe size, wordmark offset, control positions). */}
      <style>{COVER_LAYOUT_CSS}</style>
      <h1 id="atlas-cover-title" className="sr-only">
        Breathe Cities
      </h1>

      {/* Stage: wordmark and city name behind, globe in front. Sized by COVER_LAYOUT_CSS around the
          globe (round 2, items 3 to 5). A size container, so the wordmark can size its type against
          the stage's width (cqw). */}
      <div
        ref={stageRef}
        className="atlas-stage relative mx-auto w-full max-w-6xl touch-pan-y"
        style={{ containerType: 'size' }}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerEnd}
        onPointerCancel={handleStagePointerEnd}
        onKeyDown={handleStageKeyDown}
        onFocus={handleStageFocus}
      >
        <Wordmark cityName={shownCity.name} visible={resting} lineReach="var(--atlas-wordmark-reach)" />

        {/* The WebGL canvas: a square centred in the stage, sized in CSS so the SPHERE inside it is
            --atlas-sphere wide (see COVER_LAYOUT_CSS and globe-framing.ts). Its transparent margin
            overflows the stage. The canvas pixel size is measured from this box. */}
        <div ref={canvasBoxRef} className="atlas-canvas-box absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <AtlasGlobe
            width={canvasSide}
            height={canvasSide}
            cities={ATLAS_CITIES}
            initialCity={CYCLE_ORDER[0]}
            reducedMotion={reducedMotion}
            cardCityId={cardCityId}
            card={cardCity === null ? null : <CityCard city={cardCity} onClose={() => closeCard(true)} />}
            focusCityId={focusCityId}
            onReady={handleGlobeReady}
            onMarkerSelect={handleMarkerSelect}
          />
        </div>

        {/* A square exactly over the sphere, for placing the controls on the globe. It ignores
            pointer events itself, so drags still reach the globe; only the controls take them.
            It renders after the canvas and carries z-20, so neither the WebGL surface nor the card
            can cover the controls. */}
        <div className="atlas-sphere-box pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          {/* Pause/play (WCAG 2.2.2). At the TOP RIGHT OF THE GLOBE, within thumb reach (Jack, brief
              4.2); placed by .atlas-pause in COVER_LAYOUT_CSS, which keeps it clear of the open card.

              It sits inside the stage's pointer handlers, which is harmless: a press on it starts an
              interaction hold, and `togglePlaying` runs last (pointerup, then click) and clears that
              hold, so an explicit pause stays paused and an explicit play starts the cycle. */}
          <button
            type="button"
            data-atlas-control="true"
            onClick={togglePlaying}
            aria-label={playing ? 'Pause the city tour' : 'Play the city tour'}
            className="atlas-pause pointer-events-auto absolute flex h-14 w-14 items-center justify-center rounded-full border border-foreground/20 bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {playing ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
          </button>

          {/* Previous/next city (round 2, item 2): the carousel's arrow style (navArrowClass), on a
              white fill because here they can sit over the globe or the dark city name. Placed by
              .atlas-step in COVER_LAYOUT_CSS. See stepCity. */}
          <button
            type="button"
            data-atlas-control="true"
            onClick={() => stepCity(-1)}
            aria-label="Previous city"
            className={`atlas-step atlas-step-prev pointer-events-auto absolute bg-background ${navArrowClass(false)}`}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-atlas-control="true"
            onClick={() => stepCity(1)}
            aria-label="Next city"
            className={`atlas-step atlas-step-next pointer-events-auto absolute bg-background ${navArrowClass(false)}`}
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Below the globe: the city's mission line (changes and fades) and BC's mission line
          (permanent). The pause/play control moved up to the globe's top right (Jack, brief 4.2). */}
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-2 text-center">
        {/* City mission line. Space reserved for 3 lines on a phone and 2 from `sm`, so the layout
            never jumps as lines change. Hidden from assistive tech while faded out, so a stale
            line is never read. */}
        <div
          className={`flex min-h-[4.125rem] flex-col justify-end sm:min-h-[3.125rem] ${fade}`}
          style={{ opacity: resting ? 1 : 0 }}
          aria-hidden={!resting}
        >
          <p className="text-base font-medium leading-snug text-foreground sm:text-lg">{shownCity.missionLine}</p>
        </div>
        {/* BC's mission line: always visible, never fades or changes. */}
        <p className="mt-2 text-sm text-foreground/70">{BC_MISSION_LINE}</p>
      </div>
    </section>
  )
}
