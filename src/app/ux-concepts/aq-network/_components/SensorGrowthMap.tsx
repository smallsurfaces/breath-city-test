/**
 * SensorGrowthMap.tsx — the AQ Network "Sensors & coverage" centrepiece: an interactive
 *   sensor-growth map driven by a committed OpenAQ snapshot.
 *
 * Purpose
 *   Replaces the old programme-vs-live table. Shows a city's sensor network GROWING over
 *   time on a light Mapbox basemap, with three linked counters that update as the user
 *   scrubs a timeline. The story is "how the network was built", told honestly from a
 *   one-time OpenAQ snapshot — NO air-quality data, NO per-page-load API call (decision #7).
 *
 *   What the user sees / does:
 *     - A LIGHT basemap centred on the city.
 *     - Each sensor is a marker styled by TYPE, not air quality: reference-grade monitors
 *       (filled ink diamonds) vs low-cost sensors (hollow dots). A small legend explains it.
 *     - A timeline scrubber (startYear → endYear from the snapshot). Scrubbing changes which
 *       markers are shown: a marker appears in the year that sensor was first seen
 *       (firstSeenYear). So dragging from the start to now plays the network's growth.
 *     - Three counters that reflect the scrubbed year: Sensors deployed · Districts covered ·
 *       People within sensor range. People-in-range keeps its "Estimate" label (guesstimate).
 *
 * Reuse
 *   The map shell + slider pattern is repurposed from src/app/direction-1-mapbox/page.tsx
 *   (light-v11 style, custom HTML markers via mapboxgl.Marker, a selectedYear state that
 *   re-renders markers, and a range-slider footer). Here the slider drives EXISTENCE
 *   (firstSeenYear) instead of AQI history, and markers are typed not AQI-coloured.
 *
 * Data-driven
 *   Everything comes from the SensorSnapshot passed in (keyed by OpenAQ slug upstream), so
 *   this component renders any city by data alone — London is a snapshot drop-in, no edit here.
 *
 * Client component: it creates a Mapbox map and manages markers via DOM side effects.
 *
 * Honesty
 *   Sensor positions + type are real OpenAQ data. The population counter is always labelled
 *   an estimate; the timeline's pre-data runway years are flagged (a small "modelled growth"
 *   note appears while scrubbed into an estimated year).
 *
 * Key exports: SensorGrowthMap (named)
 * External dependencies: react, mapbox-gl, lucide-react (icons), ../_data/sensor-snapshots/types.
 *
 * Side effects (all cleaned up on unmount / re-run):
 *   - Creates a Mapbox GL map instance in the container ref.
 *   - Adds/removes mapboxgl.Marker DOM elements as the scrubbed year changes.
 *   - Reads process.env.NEXT_PUBLIC_MAPBOX_TOKEN (client-exposed token).
 */

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import mapboxgl from 'mapbox-gl'
import { Radar, CircleDot, MapPin, Users } from 'lucide-react'
import type {
  SensorSnapshot,
  SnapshotSensor,
  SnapshotYear,
} from '../_data/sensor-snapshots/types'

import 'mapbox-gl/dist/mapbox-gl.css'

/** Client-exposed Mapbox token (NEXT_PUBLIC_ prefix → available in the browser bundle). */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

/** Light basemap style — cribbed from direction-1-mapbox / the light-basemap branch. */
const LIGHT_BASEMAP_STYLE = 'mapbox://styles/mapbox/light-v11'

/**
 * Marker colours read from BC tokens at runtime (no hardcoded hex in the component logic;
 * these are resolved from CSS custom properties so they track the design system). Reference
 * markers use the brand ink; low-cost markers use a muted tone. These are TYPE colours, not
 * air-quality colours — the whole point of this map.
 */
const REFERENCE_FALLBACK = '#003574' // bc dark-blue ink — fallback if the CSS var can't be read
const LOWCOST_FALLBACK = '#5b6b7a' // muted slate — fallback if the CSS var can't be read

/**
 * White contrast ring on map markers. This is map-marker styling (Mapbox markers are built
 * imperatively as DOM elements over the basemap — "Mapbox styling is its own thing"), not UI
 * chrome, so a literal white ring is appropriate here; it matches the existing direction-1/2
 * marker treatment. Named so the intent is explicit rather than a bare inline literal.
 */
const MARKER_RING = '#ffffff'

/** Props for SensorGrowthMap. */
type SensorGrowthMapProps = {
  /**
   * The city's committed sensor snapshot — the single data source: sensor positions + type,
   * the per-year growth curve, AND the map framing (center/zoom). So the page passes one object.
   */
  snapshot: SensorSnapshot
}

/**
 * Resolve a BC token colour from a CSS custom property, falling back to a literal when the
 * variable isn't readable (SSR/edge cases). Keeps marker colours tied to the design tokens
 * without hardcoding hex in the render path.
 */
function resolveTokenColor(varName: string, fallback: string): string {
  if (typeof window === 'undefined') {
    return fallback
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  return value.length > 0 ? value : fallback
}

/**
 * Build the DOM element for a sensor marker, styled by TYPE.
 *   reference  → filled diamond in brand ink (regulatory-grade reads as the "anchor" tier)
 *   low-cost   → smaller hollow dot (the dense community layer)
 * No air-quality colour anywhere — type is the only thing encoded.
 */
function createTypeMarkerElement(
  sensor: SnapshotSensor,
  referenceColor: string,
  lowCostColor: string,
): HTMLElement {
  const el = document.createElement('div')
  el.style.cursor = 'pointer'
  el.setAttribute(
    'title',
    `${sensor.name} — ${sensor.type === 'reference' ? 'Reference-grade monitor' : 'Low-cost sensor'}`,
  )

  if (sensor.type === 'reference') {
    // Filled diamond (rotated square), 16px, brand ink with a white ring for contrast on light ground.
    el.style.width = '16px'
    el.style.height = '16px'
    el.style.background = referenceColor
    el.style.border = `2px solid ${MARKER_RING}`
    el.style.transform = 'rotate(45deg)'
    el.style.borderRadius = '3px'
    el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.30)'
  } else {
    // Hollow dot, 11px, muted ring — the dense low-cost layer sits visually behind the anchors.
    el.style.width = '11px'
    el.style.height = '11px'
    el.style.borderRadius = '50%'
    el.style.background = MARKER_RING
    el.style.border = `2.5px solid ${lowCostColor}`
    el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.20)'
  }

  return el
}

/**
 * One counter block — a big number with a label and an icon. Used for the three linked
 * counters. `estimate` adds a small "Estimate" pill (population-in-range is a guesstimate).
 */
function Counter({
  icon,
  value,
  label,
  estimate,
}: {
  icon: ReactElement
  value: string
  label: string
  estimate: boolean
}): ReactElement {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground" aria-hidden="true">
          {icon}
        </span>
        {estimate && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--bc-color-yellow) 30%, var(--bc-color-white))',
              color: 'var(--bc-semantic-text)',
            }}
          >
            Estimate
          </span>
        )}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-foreground">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

/**
 * The sensor-growth map section. Holds the scrubbed-year state (the single source of truth
 * for both which markers show and what the counters read), renders the Mapbox map with
 * type-styled markers filtered to that year, the type legend, the timeline slider, and the
 * three linked counters.
 */
export function SensorGrowthMap({
  snapshot,
}: SensorGrowthMapProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const mapReadyRef = useRef<boolean>(false)
  // Force a re-render once the map has loaded so the first marker paint runs.
  const [, setMapReady] = useState<boolean>(false)

  // ── Scrubbed year — the single source of truth. Starts at the present day (endYear) so the
  //    section opens on the full, current network; scrubbing back plays the growth in reverse. ──
  const [selectedYear, setSelectedYear] = useState<number>(snapshot.endYear)

  // Resolved token colours for markers (computed once on mount; tokens don't change at runtime).
  const colorsRef = useRef<{ reference: string; lowCost: string }>({
    reference: REFERENCE_FALLBACK,
    lowCost: LOWCOST_FALLBACK,
  })

  /**
   * The snapshot timeline row for the scrubbed year — drives the three counters. Falls back to
   * the last row if (defensively) the year isn't found. Memoised on year so counters are cheap.
   */
  const yearData: SnapshotYear = useMemo(() => {
    const row = snapshot.timeline.find((t) => t.year === selectedYear)
    return row ?? snapshot.timeline[snapshot.timeline.length - 1]
  }, [snapshot.timeline, selectedYear])

  /** Sensors that exist by the scrubbed year (firstSeenYear <= year). Memoised on year. */
  const visibleSensors: SnapshotSensor[] = useMemo(
    () => snapshot.sensors.filter((s) => s.firstSeenYear <= selectedYear),
    [snapshot.sensors, selectedYear],
  )

  // ── Map initialisation — runs once on mount. ──────────────────────────────────
  useEffect(() => {
    if (containerRef.current === null) {
      return
    }
    if (MAPBOX_TOKEN === undefined || MAPBOX_TOKEN.length === 0) {
      // Token guard handled in render; nothing to init.
      return
    }

    // Resolve marker token colours now that we're in the browser.
    colorsRef.current = {
      reference: resolveTokenColor('--bc-color-dark-blue', REFERENCE_FALLBACK),
      lowCost: resolveTokenColor('--bc-semantic-muted', LOWCOST_FALLBACK),
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    // Side effect: creates the Mapbox map on the LIGHT basemap, centred on the city
    // (framing comes from the snapshot).
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: LIGHT_BASEMAP_STYLE,
      center: snapshot.center,
      zoom: snapshot.zoom,
      attributionControl: false,
    })
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapRef.current = map

    map.on('load', () => {
      mapReadyRef.current = true
      // Trigger the marker-paint effect (it waits on map readiness).
      setMapReady(true)
    })

    // Side effect cleanup: remove markers + the map instance on unmount.
    return () => {
      for (const m of markersRef.current) {
        m.remove()
      }
      markersRef.current = []
      map.remove()
      mapRef.current = null
      mapReadyRef.current = false
    }
    // The map initialises once per mount; snapshot.center/zoom are stable for that mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Paint markers for the visible (scrubbed-year) sensors. Re-runs whenever the visible
  //    set changes (i.e. the year moves) or once the map becomes ready. Clears + re-adds. ──
  useEffect(() => {
    const map = mapRef.current
    if (map === null || !mapReadyRef.current) {
      return
    }

    // Side effect: clear existing markers before re-adding the current year's set.
    for (const m of markersRef.current) {
      m.remove()
    }
    markersRef.current = []

    const { reference, lowCost } = colorsRef.current
    for (const sensor of visibleSensors) {
      const el = createTypeMarkerElement(sensor, reference, lowCost)
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([sensor.lng, sensor.lat])
        .addTo(map)
      markersRef.current.push(marker)
    }
  }, [visibleSensors])

  // ── Token-missing guard. ──────────────────────────────────────────────────────
  if (MAPBOX_TOKEN === undefined || MAPBOX_TOKEN.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Map unavailable — NEXT_PUBLIC_MAPBOX_TOKEN is not set.
      </div>
    )
  }

  const isPresentDay = selectedYear === snapshot.endYear

  // The "Sensors deployed" counter is the ACTUAL number of markers on the map for the scrubbed
  // year (visibleSensors.length) — never the modelled timeline.sensorCount. This guarantees the
  // headline number always equals what the user can see on the map (no "counter says 3, map
  // shows 0" mismatch in the pre-data runway years, where real markers don't exist yet). The
  // modelled curve only ever drives the SHAPE; the counter stays honest to the visible markers.
  const sensorsDeployed = visibleSensors.length

  return (
    <div className="space-y-6">
      {/* ── Three linked counters — reflect the scrubbed year. ───────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Counter
          icon={<Radar className="h-5 w-5" />}
          value={sensorsDeployed.toLocaleString()}
          label="Sensors deployed"
          estimate={false}
        />
        <Counter
          icon={<MapPin className="h-5 w-5" />}
          value={yearData.districtsCovered.toLocaleString()}
          label="Districts covered"
          estimate
        />
        <Counter
          icon={<Users className="h-5 w-5" />}
          value={`~${yearData.peopleInRange.toLocaleString()}`}
          label="People within sensor range"
          estimate
        />
      </div>

      {/* ── The map + its legend + the timeline scrubber. ───────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {/* Map canvas. Fixed height so the section sits in the page flow (not full-screen). */}
        <div className="relative h-[420px] w-full">
          <div ref={containerRef} className="absolute inset-0" data-slot="sensor-growth-map" />

          {/* Type legend — reference vs low-cost (NOT air quality). Top-left, over the map. */}
          <div
            className="absolute left-3 top-3 z-10 rounded-xl border border-border bg-background/90 px-3 py-2.5 backdrop-blur"
            style={{ backdropFilter: 'blur(6px)' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Sensor type
            </p>
            <ul className="mt-1.5 space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-foreground">
                {/* Filled diamond swatch — reference-grade. */}
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rotate-45 rounded-[2px] border border-white"
                  style={{ backgroundColor: 'var(--bc-color-dark-blue)' }}
                />
                Reference-grade monitor
              </li>
              <li className="flex items-center gap-2 text-xs text-foreground">
                {/* Hollow dot swatch — low-cost. */}
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full bg-white"
                  style={{ border: '2.5px solid var(--bc-semantic-muted)' }}
                />
                Low-cost sensor
              </li>
            </ul>
          </div>
        </div>

        {/* Timeline scrubber — drives sensor existence over time. Repurposed from the
            direction-1-mapbox slider; here it filters markers by firstSeenYear. */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-3 sm:px-6">
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-xs font-semibold text-foreground">
              Network growth {snapshot.startYear}&ndash;{snapshot.endYear}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {isPresentDay ? 'Drag to replay growth' : 'Scrubbing back in time'}
            </span>
          </div>

          <input
            type="range"
            min={snapshot.startYear}
            max={snapshot.endYear}
            step={1}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label={`Year: ${selectedYear}. Drag to change which sensors are shown.`}
            className="flex-1 cursor-pointer"
            style={{ accentColor: 'var(--bc-semantic-brand)' }}
          />

          <span
            className="rounded-full px-3 py-1 text-sm font-bold tabular-nums"
            style={{
              backgroundColor: 'var(--bc-semantic-brand)',
              color: 'var(--bc-color-white)',
            }}
          >
            {selectedYear}
          </span>
        </div>
      </div>

      {/* Honest framing line. The base sentence is always shown. The modelled-growth note is
          conditional on the data: it appears only if the scrubbed year's sensor count is itself
          guesstimated — which happens only when a snapshot is captured with a pre-data runway
          (RUNWAY_YEARS > 0 in the capture script). Accra has no runway, so it stays hidden; the
          guard keeps the component correct for any city that does use one. */}
      <p className="text-xs text-muted-foreground">
        <CircleDot className="mr-1 inline h-3 w-3 align-[-1px]" aria-hidden="true" />
        Sensor positions and type are real OpenAQ data, captured once (not fetched live).
        Districts covered and people within range are estimates derived from the network&rsquo;s
        spread.
        {yearData.isEstimate && (
          <>
            {' '}
            For {selectedYear}, the sensor count is a modelled early-growth estimate (OpenAQ
            has little data this far back).
          </>
        )}
      </p>
    </div>
  )
}
