/**
 * page.tsx — JTBD City Toolkit · Real-time monitoring component (rapid-prototype).
 *
 * Purpose:
 *   The real-time monitoring component for the JTBD City Toolkit concept, restyled to the shared
 *   concept standard on the LIGHT basemap. This is "just the component + its triangulation feature"
 *   — NO narrative framing (no Problem/Proof/Offer/Adopt sections, no toolkit context strip). It
 *   forks the functional guts of /direction-2-live-data (live OpenAQ) and re-houses them on the
 *   concept chrome (BcHeader via layout.tsx) with the light basemap + light marker treatment.
 *
 *   This file is the ORCHESTRATOR: it owns the active city + parameter selection, runs the data
 *   hook, derives the fresh-only sensor set for the probe, manages the default/probe modes, and
 *   composes the component's interaction patterns:
 *     1. City selector + "N of M live" readout       -> CitySelector + HeaderReadout
 *     2. Parameter selector (NO2 disabled) + legend   -> ParameterSelector + Legend
 *     3. "Check air quality" fresh-only probe          -> ProbeToggle + MapComponent + ProbeResultPopup
 *     4. Network states (loading/empty/stale/error)   -> HeaderReadout + NetworkStateOverlay
 *     5. Provenance (per-station + map-level)          -> StationPopup (owner + start date) + MapAttribution
 *
 *   Layout: the chrome (PrototypeHeader + BcHeader) is rendered by layout.tsx ABOVE this page; the
 *   map fills the viewport space below the chrome. The overlays are positioned ABSOLUTE within the
 *   map region (this page's relative container), so they anchor to the map, not the viewport, and
 *   never collide with the sticky chrome.
 *
 * Route: /ux-concepts/toolkit/real-time-monitoring
 *
 * Key exports: ToolkitRtMonitoringPage (default)
 * External dependencies: react, ../../../../lib/openaq/{cities,adapter} (registry +
 *   toLegacySensors), ../../../direction-2-live-data/{useStations,aqiParameters} (read-only), and
 *   the co-located _components.
 */

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CITIES, getCity } from '@/lib/openaq/cities'
import { toLegacySensors } from '@/lib/openaq/adapter'
import { useStations } from '@/app/direction-2-live-data/useStations'
import { PARAMETER_META, type ParameterKey } from '@/app/direction-2-live-data/aqiParameters'
import { MapComponent } from './_components/MapComponent'
import type { MapHandle, MapMode } from './_components/MapComponent'
import { CitySelector } from './_components/CitySelector'
import { ParameterSelector } from './_components/ParameterSelector'
import { HeaderReadout } from './_components/HeaderReadout'
import { Legend } from './_components/Legend'
import { ProbeToggle } from './_components/ProbeToggle'
import { NetworkStateOverlay } from './_components/NetworkStateOverlay'
import { MapAttribution } from './_components/MapAttribution'

/**
 * Curated example cities for the selector (ordered) — a single-row set led by good-coverage picks,
 * not all 14 registry cities (which would wrap and collide with the selectors below). Coverage was
 * probe-verified against live OpenAQ PM2.5 at build time: Accra ~16/21 and Bangkok ~23/30 are
 * strong; Paris ~6/14 is decent; London ~3/30 is intentionally included as the sparse case so the
 * "N of M live" honesty + empty-stale handling are visible. Coverage swings over time — these are
 * good demo defaults, not guarantees.
 */
const EXAMPLE_CITY_SLUGS = ['accra', 'bangkok', 'paris', 'london'] as const
/**
 * Default city slug on first load — Accra. Lead with a good-coverage pick (the brief: Accra is
 * strong, London is sparse). Falls back to the first registered city if 'accra' is ever removed.
 */
const DEFAULT_CITY_SLUG = 'accra'
/** Default parameter on first load — PM2.5. */
const DEFAULT_PARAMETER: ParameterKey = 'pm25'

export default function ToolkitRtMonitoringPage(): React.ReactElement {
  const mapHandleRef = useRef<MapHandle>(null)

  // ── Selection state ──────────────────────────────────────────────────────────
  const [citySlug, setCitySlug] = useState<string>(DEFAULT_CITY_SLUG)
  const [parameter, setParameter] = useState<ParameterKey>(DEFAULT_PARAMETER)

  // ── Mode state (default / probe) ───────────────────────────────────────────────
  // 'annotate' exists in the MapMode union (shared map contract) but is never entered here — this
  // component has no annotation layer (out of scope: "just the component + triangulation").
  const [mapMode, setMapMode] = useState<MapMode>('default')

  // ── Data ───────────────────────────────────────────────────────────────────────
  const { status, stations, freshCount, totalCount, retry } = useStations(citySlug, parameter)

  // Fresh-only legacy sensor set for triangulation (probe excludes stale). The SAME set whose size
  // is freshCount.
  const freshSensors = useMemo(
    () => toLegacySensors(stations, parameter, true),
    [stations, parameter],
  )

  // Active city framing from the registry (never hardcoded). Falls back to the first registered city.
  const city = getCity(citySlug) ?? CITIES[0]

  // ── Mode transitions ───────────────────────────────────────────────────────────
  const exitProbeMode = useCallback((): void => {
    setMapMode('default')
  }, [])

  /** Toggle probe mode. Guarded so it can never turn on when there are zero fresh sensors. */
  const handleProbeToggle = useCallback((): void => {
    setMapMode((current) => {
      if (current === 'probe') {
        mapHandleRef.current?.clearPopup()
        return 'default'
      }
      // Do not enter probe mode with no fresh sensors (the toggle is also disabled in that case).
      if (freshCount === 0) {
        return current
      }
      return 'probe'
    })
  }, [freshCount])

  // If the active selection drops to zero fresh sensors while probe mode is on, leave probe mode so
  // the map is not stuck in a mode whose toggle is now disabled.
  useEffect(() => {
    if (mapMode === 'probe' && freshCount === 0) {
      mapHandleRef.current?.clearPopup()
      setMapMode('default')
    }
  }, [mapMode, freshCount])

  // ── Selection handlers ─────────────────────────────────────────────────────────
  // Switching city or parameter clears any open probe and triggers the hook's refetch.
  const handleSelectCity = useCallback((slug: string): void => {
    mapHandleRef.current?.clearPopup()
    setCitySlug(slug)
  }, [])

  const handleSelectParameter = useCallback((next: ParameterKey): void => {
    // Defensive: never accept an unavailable parameter (the selector already gates NO2).
    if (!PARAMETER_META[next].available) {
      return
    }
    mapHandleRef.current?.clearPopup()
    setParameter(next)
  }, [])

  // Probe is available only when there is at least one fresh sensor.
  const probeAvailable = freshCount > 0

  return (
    <>
      {/*
       * Scoped styles: popup chrome reset so the StationPopup / ProbeResultPopup panels render with
       * their own rounded surfaces (Mapbox's default popup container is stripped).
       */}
      <style>{`
        .rtmon-popup .mapboxgl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .rtmon-popup .mapboxgl-popup-tip { display: none !important; }
      `}</style>

      {/*
       * Map region — fills the viewport height left over after the concept chrome (PrototypeHeader
       * + BcHeader, both rendered by layout.tsx above). The chrome heights vary, so the region uses
       * flex:1 inside a min-height-screen column would require the chrome to be in this subtree;
       * instead the region is sized to the dynamic viewport minus the chrome via a min height, and
       * the overlays anchor to this relative container (not the viewport).
       */}
      <div
        style={{
          position: 'relative',
          // Fill the space below the concept chrome. 168px ≈ PrototypeHeader (~56px) + BC prototype
          // bar (~39px) + BC header (~73px); the map flexes to the rest of the dynamic viewport.
          height: 'calc(100dvh - 168px)',
          minHeight: '480px',
          overflow: 'hidden',
        }}
      >
        {/* Map fills the container. Receives the live data, fresh-only set, parameter, and city
            framing; renders markers + probe + station popups (light basemap). */}
        <MapComponent
          ref={mapHandleRef}
          mapMode={mapMode}
          stations={stations}
          freshSensors={freshSensors}
          parameter={parameter}
          freshCount={freshCount}
          cityCenter={city.center}
          cityZoom={city.zoom}
          cityBbox={city.bbox}
          onExitProbe={exitProbeMode}
        />

        {/* Pattern 1 readout (top-left) — N of M live / 0 of M / no sensors / loading. */}
        <HeaderReadout
          cityName={city.name}
          parameter={parameter}
          status={status}
          freshCount={freshCount}
          totalCount={totalCount}
        />

        {/* Pattern 1 city selector (top-centre) — curated example cities (single row). */}
        <CitySelector
          activeSlug={citySlug}
          onSelect={handleSelectCity}
          slugs={EXAMPLE_CITY_SLUGS}
        />

        {/* Pattern 2 parameter selector (below city selector); NO2 disabled. */}
        <ParameterSelector active={parameter} onSelect={handleSelectParameter} />

        {/* Pattern 3 probe toggle ("Check air quality"); disabled/explained at 0 fresh. */}
        <ProbeToggle
          isActive={mapMode === 'probe'}
          isAvailable={probeAvailable}
          onToggle={handleProbeToggle}
        />

        {/* Pattern 2 legend (bottom-left) — parameter-aware. */}
        <Legend parameter={parameter} mapMode={mapMode} />

        {/* Pattern 4 network-state overlay (bottom-centre) — empty / empty-stale / error+retry. */}
        <NetworkStateOverlay
          status={status}
          cityName={city.name}
          parameter={parameter}
          onRetry={retry}
        />

        {/* Pattern 5b persistent map-level credit (bottom-right) — visible in ALL states. */}
        <MapAttribution />
      </div>
    </>
  )
}
