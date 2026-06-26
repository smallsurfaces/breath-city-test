/**
 * ProofGlobe.tsx — the proof-directory globe for /ux-concepts/global-toolkit-network.
 *
 * Purpose / what the user sees + does
 *   A 3D Mapbox GLOBE (light basemap) where every pin is a Breathe Cities member CITY (not a
 *   sensor). Pins read in three colour STATES:
 *     - PROVEN (CDMX, Paris, Accra) — clickable → a side panel listing the real tools that city
 *       runs, each with an honest link treatment.
 *     - NEWLY-JOINED (Addis Ababa, Madrid) — clickable → an honest empty-state panel (no rows).
 *     - MEMBER (other BC cities) — neutral presence dots, NOT clickable (no dead-end clicks).
 *   Pointer cursor + hover tooltip appear ONLY on clickable pins. Drag to spin, scroll/pinch to
 *   zoom, slow idle auto-rotate near globe zoom, and a "Reset to globe" button. NO timeline
 *   scrubber (the membership/growth story was dropped in the reframe).
 *
 *   Clicking a clickable pin opens a panel — a right-side panel on desktop, a bottom sheet on
 *   mobile — while the globe stays visible behind it.
 *
 * Isolation (full-isolation rule — section brief §"New build, full isolation")
 *   This is a FRESH component owned by this concept. It does NOT import aq-network-v2's
 *   NetworkGlobe, programme snapshot, or city data. It replicates the proven globe TECH pattern
 *   (light basemap, GeoJSON circle layers, ResizeObserver resize, time-based rAF auto-rotate,
 *   flyTo reset) from that reference, but reads only this concept's own PROOF_CITIES data.
 *
 * RENDER PATTERN (proven — do not change to absolute inset-0)
 *   The map div is a FLOW CHILD `w-full h-full` inside an explicit-height `relative` wrapper, plus
 *   a load-time + ResizeObserver resize (the robust fix for the mid-page blank-canvas bug). City
 *   pins are a GL GeoJSON source + circle layers (NOT DOM markers).
 *
 * Honesty
 *   Pins encode directory state only. Population is city population, labelled an estimate. Tool
 *   links fire only on real URLs; absent URLs render a disabled "Link coming soon". See
 *   proof-cities.ts for the full honesty model.
 *
 * Key exports: ProofGlobe (named)
 * External dependencies: react, mapbox-gl, lucide-react, ./CityPanel, ../_data/proof-cities.
 *
 * Side effects (all cleaned up on unmount):
 *   - Creates a Mapbox GL globe instance in the container ref; sets light fog on style load.
 *   - Adds a GeoJSON source + three circle layers (proven / newly-joined / member) keyed by state.
 *   - Runs ONE rAF loop doing time-based idle auto-rotate (pauses on interaction, resumes on idle).
 *   - Attaches hover + click handlers on the two CLICKABLE layers only (pointer + panel-open).
 *   - Reads process.env.NEXT_PUBLIC_MAPBOX_TOKEN (client-exposed token).
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import mapboxgl from 'mapbox-gl'
import { Globe2 } from 'lucide-react'
import { CityPanel } from './CityPanel'
import { PROOF_CITIES } from '../_data/proof-cities'
import type { ProofCity } from '../_data/proof-cities'

import 'mapbox-gl/dist/mapbox-gl.css'

/** Client-exposed Mapbox token (NEXT_PUBLIC_ prefix → available in the browser bundle). */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

/** Light basemap (matches the page chrome); pins deepened for contrast on light. */
const GLOBE_STYLE = 'mapbox://styles/mapbox/light-v11'

/** The global "see the whole network" framing the Reset button (and initial load) flies to. */
const GLOBE_VIEW = {
  center: [10, 25] as [number, number],
  zoom: 1.4,
  pitch: 0,
  bearing: 0,
}

/**
 * Zoom at/below which auto-rotate runs. Above it the user has zoomed into a region and spinning
 * would be disorienting, so rotation only resumes once back near globe view.
 */
const AUTO_ROTATE_MAX_ZOOM = 2.2

/**
 * Milliseconds for one full 360° rotation. TIME-BASED (not per-frame) so a full turn takes the
 * same wall-clock time on any refresh rate — each rAF tick advances by (deltaMs / PERIOD) * 360.
 */
const AUTO_ROTATE_PERIOD_MS = 400_000

/** Idle delay (ms) after the last user interaction before auto-rotate resumes. */
const AUTO_ROTATE_RESUME_MS = 3500

/*
 * Pin colours. Mapbox paint properties cannot read CSS custom properties, so literal hex is the
 * documented exception here (the same exception the reference globe's tier colours use). Each
 * value is the RESOLVED hex of a real BC palette token (from dist/css/tokens.css) — kept in sync
 * with the token, never an off-palette invention:
 *   - proven        = --bc-color-dark-blue  (#003574) — the brand ink "go look here" pin.
 *   - newly-joined  = --bc-color-amber-warm (#e8a000) — the warm "fresh / estimate-adjacent" hue
 *                     (pure --bc-color-yellow #e8f000 is illegible as a small pin on a light map).
 *   - member        = --bc-color-steel      (#b2c2d5) — the muted presence dot (= --bc-semantic-muted).
 */
/** Proven cities — brand dark-blue ink (= --bc-color-dark-blue). */
const COLOR_PROVEN = '#003574'
/** Newly-joined cities — warm amber (= --bc-color-amber-warm), the "fresh, profile coming" hue. */
const COLOR_NEWLY_JOINED = '#e8a000'
/** Member presence dots — muted steel (= --bc-color-steel / --bc-semantic-muted). */
const COLOR_MEMBER = '#b2c2d5'
/** White contrast ring so pins stay legible over land + ocean. */
const PIN_RING = '#ffffff'

/**
 * Build the city GeoJSON for the circle layers. Each feature carries `state` (drives which layer
 * paints it + colour), `slug` (so the click handler can resolve the city), and `clickable` (so the
 * hover handler only sets the pointer cursor on proven / newly-joined pins).
 */
function citiesToGeoJSON(cities: ProofCity[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: cities.map((c) => ({
      type: 'Feature',
      properties: {
        slug: c.slug,
        name: c.name,
        country: c.country,
        state: c.state,
        clickable: c.state !== 'member',
      },
      geometry: { type: 'Point', coordinates: c.coordinates },
    })),
  }
}

/** Props for ProofGlobe. */
type ProofGlobeProps = {
  /** The proof-directory cities (the single data source for the globe + panel). */
  cities: ProofCity[]
}

/**
 * The proof-directory globe section. Holds the open-city state (drives the panel), the Mapbox
 * globe with three state-keyed circle layers, the idle auto-rotate + reset behaviour, and the
 * hover/click affordances on the clickable layers.
 */
export function ProofGlobe({ cities }: ProofGlobeProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapReady, setMapReady] = useState<boolean>(false)

  // ── Open city — the single source of truth for the panel. null = closed. ──
  const [openCity, setOpenCity] = useState<ProofCity | null>(null)

  // ── Auto-rotate machinery (refs so the rAF loop reads live values without re-subscribing). ──
  const rotateFrameRef = useRef<number | null>(null)
  const interactingRef = useRef<boolean>(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Timestamp of the previous rAF frame — drives the time-based rotation delta. null until the
  // first frame so we never apply a bogus huge delta on frame one.
  const lastFrameTsRef = useRef<number | null>(null)

  /** Lookup from slug → city, so the GL click handler (which only has feature props) resolves fast. */
  const cityBySlug = useMemo(() => {
    const map = new Map<string, ProofCity>()
    for (const city of cities) {
      map.set(city.slug, city)
    }
    return map
  }, [cities])

  /** The full city GeoJSON (built once from data — no per-year filtering in this concept). */
  const cityGeoJSON = useMemo(() => citiesToGeoJSON(cities), [cities])

  // ── Map initialisation — runs once on mount. ──────────────────────────────────
  useEffect(() => {
    if (containerRef.current === null) {
      return
    }
    if (MAPBOX_TOKEN === undefined || MAPBOX_TOKEN.length === 0) {
      return // token guard handled in render
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    // Side effect: create the Mapbox GLOBE on the light basemap at the global framing.
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: GLOBE_STYLE,
      projection: { name: 'globe' },
      center: GLOBE_VIEW.center,
      zoom: GLOBE_VIEW.zoom,
      attributionControl: false,
    })
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapRef.current = map

    map.on('style.load', () => {
      // Side effect: light atmosphere so the globe reads as a planet against a light backdrop.
      map.setFog({
        color: 'rgb(214, 226, 240)', // lower atmosphere — soft light blue
        'high-color': 'rgb(170, 200, 235)', // upper atmosphere — light sky
        'horizon-blend': 0.12,
        'space-color': 'rgb(246, 249, 252)', // near-white space behind the globe (light)
        'star-intensity': 0, // no stars on a light backdrop
      })
    })

    map.on('load', () => {
      // Resize fix (1/2): force a resize once the canvas is ready (mid-page maps can init at 0×0).
      map.resize()
      setMapReady(true)
    })

    // Resize fix (2/2): observe the container for any later size change and resize the globe.
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current !== null) {
        mapRef.current.resize()
      }
    })
    resizeObserver.observe(containerRef.current)

    // ── Auto-rotate: pause on any user interaction, resume after an idle delay (if zoomed out). ──
    const pauseRotation = (): void => {
      interactingRef.current = true
      // Drop the rotation baseline so that when spin resumes, the first active frame uses a normal
      // one-frame delta instead of the entire interaction span (which would jolt the globe).
      lastFrameTsRef.current = null
      if (resumeTimerRef.current !== null) {
        clearTimeout(resumeTimerRef.current)
      }
      // Side effect: schedule resume — only flips the flag; the rAF loop checks zoom itself.
      resumeTimerRef.current = setTimeout(() => {
        interactingRef.current = false
      }, AUTO_ROTATE_RESUME_MS)
    }
    map.on('mousedown', pauseRotation)
    map.on('touchstart', pauseRotation)
    map.on('wheel', pauseRotation)
    map.on('dragstart', pauseRotation)

    // Side effect: ONE rAF loop driving the time-based idle spin. Rotation only runs while idle +
    // near globe zoom; when paused we reset the delta baseline so resume doesn't apply an
    // accumulated jump.
    const tick = (ts: number): void => {
      const m = mapRef.current
      if (m !== null) {
        const last = lastFrameTsRef.current
        const deltaMs = last === null ? 0 : ts - last
        lastFrameTsRef.current = ts

        if (!interactingRef.current && m.getZoom() <= AUTO_ROTATE_MAX_ZOOM) {
          if (deltaMs > 0) {
            const center = m.getCenter()
            center.lng -= (deltaMs / AUTO_ROTATE_PERIOD_MS) * 360
            // jumpTo (not easeTo) inside rAF so we don't stack animations; tiny per-frame nudge.
            m.jumpTo({ center })
          }
        } else {
          // Paused (interacting or zoomed in): drop the baseline so the next active frame's delta
          // is the single-frame gap, not the whole paused span — prevents a sudden spin jump.
          lastFrameTsRef.current = ts
        }
      }
      rotateFrameRef.current = requestAnimationFrame(tick)
    }
    rotateFrameRef.current = requestAnimationFrame(tick)

    // Side effect cleanup: stop the rAF, clear resume timer, reset the frame baseline, disconnect
    // the observer, remove the map.
    return () => {
      if (rotateFrameRef.current !== null) {
        cancelAnimationFrame(rotateFrameRef.current)
        rotateFrameRef.current = null
      }
      if (resumeTimerRef.current !== null) {
        clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
      }
      lastFrameTsRef.current = null
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
    // Mount-only: the globe initialises once; city data is applied in the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Add the city source + three state-keyed circle layers once the map is ready. ──
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || map === null) {
      return
    }
    if (map.getSource('cities') !== undefined) {
      return // already added
    }

    // Side effect: GeoJSON source with every plotted city.
    map.addSource('cities', { type: 'geojson', data: cityGeoJSON })

    // Member layer (drawn first → beneath the clickable pins). Neutral slate presence dots — no
    // ring emphasis, smaller, so the proven/newly-joined pins read as the foreground story.
    map.addLayer({
      id: 'cities-member',
      type: 'circle',
      source: 'cities',
      filter: ['==', ['get', 'state'], 'member'],
      paint: {
        'circle-color': COLOR_MEMBER,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 3, 5, 6],
        'circle-opacity': 0.7,
        'circle-stroke-width': 0.4,
        'circle-stroke-color': PIN_RING,
      },
    })

    // Newly-joined layer (above member). BC yellow, ringed — clickable, fresh.
    map.addLayer({
      id: 'cities-newly-joined',
      type: 'circle',
      source: 'cities',
      filter: ['==', ['get', 'state'], 'newly-joined'],
      paint: {
        'circle-color': COLOR_NEWLY_JOINED,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 5, 9.5],
        'circle-opacity': 0.92,
        'circle-stroke-width': 1,
        'circle-stroke-color': PIN_RING,
      },
    })

    // Proven layer (drawn on top). Brand ink, ringed, largest — the "go look here" pins.
    map.addLayer({
      id: 'cities-proven',
      type: 'circle',
      source: 'cities',
      filter: ['==', ['get', 'state'], 'proven'],
      paint: {
        'circle-color': COLOR_PROVEN,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 6, 5, 11],
        'circle-opacity': 0.95,
        'circle-stroke-width': 1.2,
        'circle-stroke-color': PIN_RING,
      },
    })

    // Side effect: hover tooltip + pointer cursor on the CLICKABLE layers only (proven +
    // newly-joined). Member dots get no pointer and no click handler → never a dead-end click.
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
      className: 'aq-globe-popup',
    })
    const onEnter = (e: mapboxgl.MapLayerMouseEvent): void => {
      const f = e.features?.[0]
      if (f === undefined || f.geometry.type !== 'Point') {
        return
      }
      const p = f.properties ?? {}
      map.getCanvas().style.cursor = 'pointer'
      popup
        .setLngLat(f.geometry.coordinates.slice() as [number, number])
        .setHTML(
          `<div style="font-family: system-ui; font-size: 12px; line-height: 1.35;">
             <strong>${String(p.name ?? '')}</strong><br/>
             <span style="color:#64748b;">${String(p.country ?? '')}</span><br/>
             <span style="color:#64748b;">${p.state === 'proven' ? 'See the tools' : 'Newly joined'}</span>
           </div>`,
        )
        .addTo(map)
    }
    const onLeave = (): void => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    }
    // Click-through: open the panel for the clicked city. Member dots have no handler bound.
    const onClick = (e: mapboxgl.MapLayerMouseEvent): void => {
      const f = e.features?.[0]
      if (f === undefined) {
        return
      }
      const slug = String(f.properties?.slug ?? '')
      const city = cityBySlug.get(slug)
      if (city !== undefined) {
        // Side effect: open the city panel (React state) — the globe stays mounted behind it.
        setOpenCity(city)
      }
    }
    map.on('mouseenter', 'cities-proven', onEnter)
    map.on('mouseenter', 'cities-newly-joined', onEnter)
    map.on('mouseleave', 'cities-proven', onLeave)
    map.on('mouseleave', 'cities-newly-joined', onLeave)
    map.on('click', 'cities-proven', onClick)
    map.on('click', 'cities-newly-joined', onClick)
    // The hover/click handlers live for the map's lifetime; map.remove() in the init cleanup drops them.
  }, [mapReady, cityGeoJSON, cityBySlug])

  /** Fly back to the global globe framing (the "Reset to globe" button). */
  const resetToGlobe = useCallback((): void => {
    const map = mapRef.current
    if (map === null) {
      return
    }
    // Side effect: animate back to the whole-network view; clears interaction so spin can resume.
    map.flyTo({ ...GLOBE_VIEW, duration: 1600, essential: true })
    interactingRef.current = false
    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
  }, [])

  /** Close the city panel (back-drop click, close button, or Escape). */
  const closePanel = useCallback((): void => {
    setOpenCity(null)
  }, [])

  // ── Token-missing guard. ───────────────────────────────────────────────────────
  if (MAPBOX_TOKEN === undefined || MAPBOX_TOKEN.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Globe unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not set.
      </div>
    )
  }

  return (
    <div className="relative">
      {/* The globe + reset control + legend. */}
      <div className="overflow-hidden rounded-2xl border border-border bg-muted">
        {/*
          PROVEN RENDER PATTERN: explicit-height `relative` wrapper with the map div as a FLOW
          CHILD `w-full h-full` (NOT absolute inset-0 — that pattern blanked on this hub).
        */}
        <div className="relative h-[520px] w-full">
          {/* Loading veil until the globe canvas paints. */}
          {!mapReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground">Loading the directory…</span>
            </div>
          )}

          {/* Map container — the proven flow-child sizing. */}
          <div ref={containerRef} className="h-full w-full" data-slot="proof-globe" />

          {/* Reset-to-globe control (top-right, over the canvas). */}
          <button
            type="button"
            onClick={resetToGlobe}
            className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-black/70"
            aria-label="Reset the view to the whole globe"
          >
            <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
            Reset to globe
          </button>

          {/* Legend (bottom-left, over the canvas) — directory state, not air quality. */}
          <div className="absolute bottom-3 left-3 z-20 rounded-xl border border-white/15 bg-black/50 px-3 py-2.5 text-white backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
              City status
            </p>
            <ul className="mt-1.5 space-y-1.5">
              <li className="flex items-center gap-2 text-xs">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full border border-white"
                  style={{ backgroundColor: COLOR_PROVEN }}
                />
                Proven — see the tools
              </li>
              <li className="flex items-center gap-2 text-xs">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full border border-white"
                  style={{ backgroundColor: COLOR_NEWLY_JOINED }}
                />
                Newly joined
              </li>
              <li className="flex items-center gap-2 text-xs">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full border border-white"
                  style={{ backgroundColor: COLOR_MEMBER }}
                />
                Member city
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Honest framing line. */}
      <p className="mt-3 text-xs text-muted-foreground">
        <Globe2 className="mr-1 inline h-3 w-3 align-[-1px]" aria-hidden="true" />
        Every pin is a Breathe Cities member city. Open a proven or newly-joined city to see what it
        deployed. City populations shown in panels are estimates.
      </p>

      {/* City panel — slides in over the globe when a clickable pin is opened. */}
      <CityPanel city={openCity} onClose={closePanel} />
    </div>
  )
}

/** Re-export the bundled data so the page can import the globe + its data from one module. */
export { PROOF_CITIES }
