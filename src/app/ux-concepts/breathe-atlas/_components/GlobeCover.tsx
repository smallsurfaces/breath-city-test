/**
 * GlobeCover.tsx — the Breathe Atlas landing-page globe cover (brief 4.2).
 *
 * Purpose
 *   Composes the cover: the oversized wordmark behind the globe (with the resting city's name in the
 *   gap, bleeding off both edges), the globe with its 16 pulsating city markers, the city card, the
 *   pause/play control at the globe's top right and the mission lines below the globe. Owns the idle
 *   cycle and all interaction state; AtlasGlobe owns three.js.
 *
 * Idle cycle (brief 4.2)
 *   Starts resting on Bogotá, then visits every city eastward (CYCLE_ORDER). For each city the globe
 *   turns to it over TURN_MS (6s), rests REST_MS (5s), then moves on: about 11s per city, about
 *   3 minutes for the loop. While the globe rests on a city (the focus city):
 *     - its marker becomes an enlarged pulsating dot,
 *     - its card opens automatically above the marker, inviting a tap on Open,
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
 * External dependencies: react, next/dynamic, lucide-react (Pause, Play), ./AtlasGlobe (client-only,
 *   loaded with ssr: false), ./CityCard, ./Wordmark, ../_data/cities.
 *
 * Side effects (all cleaned up on unmount):
 *   - ResizeObserver on the stage (globe sizing).
 *   - matchMedia listener for prefers-reduced-motion.
 *   - Timers for the cycle and the interaction resume countdown.
 *   - Document pointerdown/pointerup/keydown listeners while a held card is open (tap-outside, Escape).
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import dynamic from 'next/dynamic'
import { Pause, Play } from 'lucide-react'
import type { AtlasGlobeApi } from './AtlasGlobe'
import { CITY_CARD_WIDTH_PX, CityCard } from './CityCard'
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
/** Stage width (px) below which the phone layout applies (Tailwind's `sm` breakpoint). */
const PHONE_MAX_STAGE_WIDTH = 640
/** Stage width (px) from which the desktop layout applies (Tailwind's `lg` breakpoint). */
const DESKTOP_MIN_STAGE_WIDTH = 1024
/**
 * Globe canvas size on a phone, as a share of the stage's narrower side. Below 1, so the ends of the
 * city name behind the globe show either side of it: at full size the globe hid the whole name on a
 * 390px screen. This is the size Jack tested on his phone, so it is kept as it is even though the
 * name now bleeds past the viewport and is always wider than the globe.
 */
const PHONE_GLOBE_SCALE = 0.8
/**
 * Largest globe canvas from `sm` and from `lg`, in px: the stage heights before the city name moved
 * into the wordmark gap (2026-09-17). The stages are now taller, to open the gap between "BREATHE"
 * and "CITIES" for the name; these caps keep the globe itself the size Jack tested.
 */
const GLOBE_MAX_PX_TABLET = 540
const GLOBE_MAX_PX_DESKTOP = 620
/** Diameter of the pause/play button, in px (its `h-14 w-14` classes). */
const PAUSE_BUTTON_PX = 56
/** Clear space kept between the pause/play button and the open city card, in px. */
const PAUSE_CARD_CLEARANCE_PX = 8

/**
 * Where the pause/play button sits inside the stage: at the TOP RIGHT OF THE GLOBE (Jack, brief
 * 4.2), as insets from the stage's top and right edges.
 *
 * Both values are computed rather than written as classes because the globe is a square centred in
 * a stage whose width and height change independently, so "the globe's top-right corner" is a
 * different point at every width, and at the narrowest widths it is a point the open city card also
 * wants.
 *
 * - `top` is the globe canvas's top edge.
 * - `right` is the canvas's right edge, EXCEPT where that would put the button under the card. The
 *   card is centred on the stage and CITY_CARD_WIDTH_PX wide, so the button's left edge clears it
 *   only while the right inset is at most (stage - card) / 2 - button - clearance. On a 375px
 *   screen the globe is 300px wide and the card 240px, which leaves 30px either side of the card
 *   inside the globe: far too little for a 56px button, so the inset drops and the button moves out
 *   to the stage's own edge, where it still reads as the globe's top right because the globe nearly
 *   fills the width. From `sm` the globe is much wider than the card and the cap never binds.
 *
 * Both are clamped at 0, so the button can never be pushed off the stage.
 */
function pauseButtonPosition(stageWidth: number, stageHeight: number, canvasSide: number): { top: number; right: number } {
  const canvasInsetX = (stageWidth - canvasSide) / 2
  const maxInsetClearingCard = (stageWidth - CITY_CARD_WIDTH_PX) / 2 - PAUSE_BUTTON_PX - PAUSE_CARD_CLEARANCE_PX
  return {
    top: Math.max((stageHeight - canvasSide) / 2, 0),
    right: Math.max(Math.min(canvasInsetX, maxInsetClearingCard), 0),
  }
}

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

/** True when an event target sits inside a city card. */
function isInsideCard(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-atlas-card]') !== null
}

/** The globe cover. */
export function GlobeCover() {
  const stageRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<AtlasGlobeApi | null>(null)

  const [size, setSize] = useState({ width: 0, height: 0 })
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

  // Side effect: size the globe to its stage (ResizeObserver attach/detach).
  useEffect(() => {
    const stage = stageRef.current
    if (stage === null) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect === undefined) return
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
    })
    observer.observe(stage)
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
    [holdForInteraction, reducedMotion],
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
    if (down === null || down.moved || isInsideMarker(event.target)) return
    if (Math.hypot(event.clientX - down.x, event.clientY - down.y) <= DRAG_THRESHOLD_PX) return
    // The visitor is dragging the globe away from wherever it rested (this closes an auto-opened card).
    down.moved = true
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
    setPlaying((value) => !value)
  }

  const globeScale = size.width < PHONE_MAX_STAGE_WIDTH ? PHONE_GLOBE_SCALE : 1
  const globeMaxPx = size.width >= DESKTOP_MIN_STAGE_WIDTH ? GLOBE_MAX_PX_DESKTOP : GLOBE_MAX_PX_TABLET
  const canvasSide = Math.round(Math.min(size.width, size.height, globeMaxPx) * globeScale)
  const pausePosition = pauseButtonPosition(size.width, size.height, canvasSide)
  const fade = 'transition-opacity duration-700 ease-out motion-reduce:transition-none'

  return (
    <section aria-labelledby="atlas-cover-title" className="relative overflow-hidden">
      <h1 id="atlas-cover-title" className="sr-only">
        Breathe Cities
      </h1>

      {/* Stage: wordmark and city name behind, globe in front. A size container, so the wordmark
          can size its type against the stage's width (cqw) and height (cqh). */}
      <div
        ref={stageRef}
        className="relative mx-auto h-[380px] w-full max-w-6xl touch-pan-y sm:h-[580px] lg:h-[680px]"
        style={{ containerType: 'size' }}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerEnd}
        onPointerCancel={handleStagePointerEnd}
        onKeyDown={handleStageKeyDown}
        onFocus={handleStageFocus}
      >
        <Wordmark cityName={shownCity.name} visible={resting} />

        {/* Square canvas centred in the stage, so the globe always fits the narrower side (on a
            portrait phone the globe would otherwise size to the height and overflow the width).
            Smaller on a phone (PHONE_GLOBE_SCALE) so the city name shows either side of it; the
            phone stage is shorter to match, keeping "BREATHE" and "CITIES" close to the globe.
            From `sm` the stage is taller than the globe (GLOBE_MAX_PX_*), which opens the gap
            between the wordmark lines for the city name. */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: canvasSide, height: canvasSide }}
        >
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

        {/* Pause/play (WCAG 2.2.2). At the TOP RIGHT OF THE GLOBE, within thumb reach (Jack, brief
            4.2); it used to sit below the globe with the mission lines. Positioned by
            pauseButtonPosition (see there for why it is computed and how it keeps clear of the open
            card). It is a child of the STAGE, not of the globe canvas, so it can move outside the
            canvas square when the card needs that room. It renders after the canvas and carries
            z-20 so neither the WebGL surface nor the card can cover it.

            It sits inside the stage's pointer handlers, which is harmless: a press on it starts an
            interaction hold, and `togglePlaying` runs last (pointerup, then click) and clears that
            hold, so an explicit pause stays paused and an explicit play starts the cycle. */}
        <button
          type="button"
          onClick={togglePlaying}
          aria-label={playing ? 'Pause the city tour' : 'Play the city tour'}
          style={{ top: pausePosition.top, right: pausePosition.right }}
          className="absolute z-20 flex h-14 w-14 items-center justify-center rounded-full border border-foreground/20 bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {playing ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
        </button>
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
