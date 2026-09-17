/**
 * GlobeCover.tsx — the Breathe Atlas landing-page globe cover (brief 4.2).
 *
 * Purpose
 *   Composes the cover: the oversized wordmark behind the globe, the globe with its 16 city
 *   markers, the city card, the mission lines below the globe, the pause/play control and, under it,
 *   the prototype Still | Swap wordmark toggle. Owns the idle cycle and all interaction state;
 *   AtlasGlobe owns three.js.
 *
 * Wordmark mode
 *   Starts from the `wordmarkMode` prop (the page reads `?wordmark=swap`), then lives in state so the
 *   toggle applies at once, with no reload. The toggle also rewrites the query string in place so a
 *   copied link keeps the mode. It does not pause or hold the cycle.
 *
 * Idle cycle (brief 4.2)
 *   Starts resting on Bogotá, then visits every city eastward (CYCLE_ORDER). For each city the globe
 *   turns to it over TURN_MS (6s), rests REST_MS (5s), then moves on: about 11s per city, about
 *   3 minutes for the loop. While the globe rests on a city, the city name shows on the wordmark and
 *   the city's mission line shows below the globe with BC's mission line beneath it.
 *
 * Pausing (brief 4.2 "Motion and accessibility")
 *   The cycle runs only when ALL of these hold:
 *     - the globe is ready,
 *     - `playing` is true (the visible pause/play button, WCAG 2.2.2; an explicit pause stays paused),
 *     - no interaction hold is active (any drag, tap, key press or focus inside the cover starts a
 *       hold; it clears INTERACTION_RESUME_MS (10s) after the last interaction),
 *     - no city card is open (the resume countdown starts when the card closes).
 *   Pausing mid-turn freezes the globe where it is; resuming continues to the city it was turning
 *   to. Pausing while resting keeps the city shown; resuming moves on to the next city.
 *
 * Reduced motion
 *   With prefers-reduced-motion: reduce, `playing` starts false, the globe stays still on Bogotá,
 *   the cycle does not run, marker taps jump without animation and fades are instant. The pause/play
 *   button stays present; pressing play is an explicit opt-in to the cycle (judgement call, see the
 *   build report).
 *
 * Card
 *   Tapping a marker (or Enter/Space on a focused marker) pauses the cycle, turns the globe to the
 *   city (SELECT_TURN_MS) and opens the card beside the marker. The card closes on its close button,
 *   Escape, or a tap anywhere outside the card and markers (a drag does not count as a tap).
 *
 * Key exports: GlobeCover (named)
 * External dependencies: react, next/dynamic, lucide-react (Pause, Play), ./AtlasGlobe (client-only,
 *   loaded with ssr: false), ./CityCard, ./Wordmark, ./WordmarkModeToggle, ../_data/cities.
 *
 * Side effects (all cleaned up on unmount):
 *   - ResizeObserver on the stage (globe sizing).
 *   - matchMedia listener for prefers-reduced-motion.
 *   - Timers for the cycle and the interaction resume countdown.
 *   - Document pointerdown/pointerup/keydown listeners while a card is open (tap-outside, Escape).
 *   - history.replaceState when the wordmark toggle changes mode (not cleaned up: it is the URL).
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import dynamic from 'next/dynamic'
import { Pause, Play } from 'lucide-react'
import type { AtlasGlobeApi } from './AtlasGlobe'
import { CityCard } from './CityCard'
import { WordmarkBackdrop, WordmarkCityName } from './Wordmark'
import type { WordmarkMode } from './Wordmark'
import { WordmarkModeToggle } from './WordmarkModeToggle'
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

/** What the cover is showing: resting on a cycle city, or not resting on any. */
type CoverView = { kind: 'resting'; index: number } | { kind: 'free' }

/** Props for GlobeCover. */
type GlobeCoverProps = {
  /** Initial wordmark mode: A ("overlay", default) or B ("swap", from `?wordmark=swap`). */
  wordmarkMode: WordmarkMode
}

/** Index of a city in the cycle order (0 when not found, which cannot happen with local data). */
function cycleIndexOf(cityId: string): number {
  const index = CYCLE_ORDER.findIndex((city) => city.id === cityId)
  return index < 0 ? 0 : index
}

/** True when an event target sits inside a marker (its button or its card). */
function isInsideMarker(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('.atlas-marker') !== null
}

/** The globe cover. */
export function GlobeCover({ wordmarkMode: initialWordmarkMode }: GlobeCoverProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<AtlasGlobeApi | null>(null)

  const [wordmarkMode, setWordmarkMode] = useState<WordmarkMode>(initialWordmarkMode)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [globeReady, setGlobeReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [interactionHold, setInteractionHold] = useState(false)
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)
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

  /** A marker was activated: hold the cycle, turn to the city, open its card. */
  const handleMarkerSelect = useCallback(
    (city: AtlasCity) => {
      holdForInteraction()
      const index = cycleIndexOf(city.id)
      // Set the resting position BEFORE the cycle cleanup runs, so the cleanup does not cancel
      // the turn started below.
      restingIndexRef.current = index
      nextIndexRef.current = (index + 1) % CYCLE_ORDER.length
      setSelectedCityId(city.id)
      setView({ kind: 'resting', index })
      setLastShownIndex(index)
      apiRef.current?.turnTo(city.lat, city.lng, reducedMotion ? 0 : SELECT_TURN_MS)
    },
    [holdForInteraction, reducedMotion],
  )

  /** Close the open card; the resume countdown starts now. */
  const closeCard = useCallback(
    (returnFocus: boolean) => {
      const closingId = selectedCityId
      setSelectedCityId(null)
      scheduleResume()
      if (returnFocus && closingId !== null) {
        // Side effect: move keyboard focus back to the marker the card belonged to.
        stageRef.current?.querySelector<HTMLButtonElement>(`button[data-city-id="${closingId}"]`)?.focus()
      }
    },
    [scheduleResume, selectedCityId],
  )

  // Side effect: while a card is open, close it on Escape or on a tap outside the card and markers.
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

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    holdForInteraction()
    pointerDownRef.current = { x: event.clientX, y: event.clientY, moved: false }
  }

  const handleStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const down = pointerDownRef.current
    if (down === null || down.moved || isInsideMarker(event.target)) return
    if (Math.hypot(event.clientX - down.x, event.clientY - down.y) <= DRAG_THRESHOLD_PX) return
    // The visitor is dragging the globe away from wherever it rested.
    down.moved = true
    restingIndexRef.current = null
    setView({ kind: 'free' })
  }

  const handleStagePointerEnd = () => {
    pointerDownRef.current = null
    if (selectedCityId === null) scheduleResume()
  }

  const handleStageFocusOrKey = () => {
    if (selectedCityId === null) scheduleResume()
    else holdForInteraction()
  }

  /** The visible pause/play button. An explicit pause stays paused until play is pressed. */
  const togglePlaying = () => {
    window.clearTimeout(resumeTimerRef.current)
    setInteractionHold(false)
    if (selectedCityId !== null && !playing) setSelectedCityId(null)
    setPlaying((value) => !value)
  }

  /**
   * The Still | Swap toggle. Applies the mode at once; if the globe is resting on a city, the
   * wordmark layers re-render in the new mode straight away.
   */
  const changeWordmarkMode = (mode: WordmarkMode) => {
    setWordmarkMode(mode)
    const params = new URLSearchParams(window.location.search)
    if (mode === 'swap') params.set('wordmark', 'swap')
    else params.delete('wordmark')
    const query = params.toString()
    // Side effect: rewrite the URL in place so a copied link keeps the mode. Native replaceState is
    // synced into the Next.js router (no reload, no server round trip, no scroll jump, no new
    // history entry). The data argument must be null: Next skips its router sync for data that
    // already carries its internal history state.
    window.history.replaceState(null, '', `${window.location.pathname}${query.length > 0 ? `?${query}` : ''}${window.location.hash}`)
  }

  const canvasSide = Math.min(size.width, size.height)
  const resting = view.kind === 'resting'
  const shownCity = CYCLE_ORDER[resting ? view.index : lastShownIndex]
  const selectedCity = selectedCityId === null ? null : ATLAS_CITIES.find((city) => city.id === selectedCityId) ?? null
  const fade = 'transition-opacity duration-700 ease-out motion-reduce:transition-none'

  return (
    <section aria-labelledby="atlas-cover-title" className="relative overflow-hidden">
      <h1 id="atlas-cover-title" className="sr-only">
        Breathe Cities
      </h1>

      {/* Stage: wordmark behind, globe, city name in front. Container for cqw type sizing. */}
      <div
        ref={stageRef}
        className="relative mx-auto h-[420px] w-full max-w-6xl touch-pan-y sm:h-[540px] lg:h-[620px]"
        style={{ containerType: 'inline-size' }}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerEnd}
        onPointerCancel={handleStagePointerEnd}
        onKeyDown={handleStageFocusOrKey}
        onFocus={handleStageFocusOrKey}
      >
        <WordmarkBackdrop mode={wordmarkMode} cityName={shownCity.name} visible={resting} />

        {/* Square canvas centred in the stage, so the globe always fits the narrower side (on a
            portrait phone the globe would otherwise size to the height and overflow the width). */}
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
            selectedCityId={selectedCityId}
            selectedCard={selectedCity === null ? null : <CityCard city={selectedCity} onClose={() => closeCard(true)} />}
            onReady={handleGlobeReady}
            onMarkerSelect={handleMarkerSelect}
          />
        </div>

        <WordmarkCityName mode={wordmarkMode} cityName={shownCity.name} visible={resting} />
      </div>

      {/* Below the globe: mission lines while resting on a city, the pause/play control and the
          prototype wordmark toggle. */}
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 pb-12 pt-2 text-center">
        {/* Hidden from assistive tech while faded out, so a stale mission line is never read. */}
        <div
          className={`min-h-[6.5rem] sm:min-h-[5.5rem] ${fade}`}
          style={{ opacity: resting ? 1 : 0 }}
          aria-hidden={!resting}
        >
          <p className="text-base font-medium leading-snug text-foreground sm:text-lg">{shownCity.missionLine}</p>
          <p className="mt-2 text-sm text-foreground/70">{BC_MISSION_LINE}</p>
        </div>

        <button
          type="button"
          onClick={togglePlaying}
          aria-label={playing ? 'Pause the city tour' : 'Play the city tour'}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-foreground/20 bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {playing ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
        </button>

        <WordmarkModeToggle mode={wordmarkMode} onChange={changeWordmarkMode} />
      </div>
    </section>
  )
}
