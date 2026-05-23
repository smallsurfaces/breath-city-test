/**
 * page.tsx — Direction 02: Live Data Map (/direction-2-live-data)
 *
 * Root page for the live OpenAQ air-quality map (London + Accra). Evolves the v2 triangulation
 * prototype onto real, freshness-aware data. This file is the ORCHESTRATOR: it owns the active
 * city + parameter selection, runs the data hook, derives the fresh-only sensor set for the probe,
 * manages the three interaction modes, and composes the five interaction patterns from the brief:
 *   1. City selector + "N of M live" readout       -> CitySelector + HeaderReadout
 *   2. Parameter selector (NO2 disabled) + legend   -> ParameterSelector + Legend
 *   3. Fresh-only probe + graceful degradation      -> ProbeToggle + MapComponent + ProbeResultPopup
 *   4. Network states (loading/empty/stale/error)   -> HeaderReadout + NetworkStateOverlay + MapComponent
 *   5. Provenance (per-station + map-level)          -> StationPopup (in MapComponent) + MapAttribution
 *
 * Mode management mirrors v2: default / probe / annotate are mutually exclusive; entering one exits
 * the others; the AnnotationLayer MapAdapter freezes all six Mapbox handlers during annotate mode.
 *
 * Key exports: DirectionTwoLiveDataPage (default)
 * External dependencies: react, ../../lib/openaq/{cities,adapter} (registry + toLegacySensors),
 *   ./useStations, ./aqiParameters, and the route's components + AnnotationLayer (reused from v2).
 *
 * Route: /direction-2-live-data
 */

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CITIES, getCity } from '../../lib/openaq/cities'
import { toLegacySensors } from '../../lib/openaq/adapter'
import { useStations } from './useStations'
import { PARAMETER_META, type ParameterKey } from './aqiParameters'
import { MapComponent } from './MapComponent'
import type { MapHandle, MapMode } from './MapComponent'
import { CitySelector } from './CitySelector'
import { ParameterSelector } from './ParameterSelector'
import { HeaderReadout } from './HeaderReadout'
import { Legend } from './Legend'
import { ProbeToggle } from './ProbeToggle'
import { NetworkStateOverlay } from './NetworkStateOverlay'
import { MapAttribution } from './MapAttribution'
import AnnotationLayer from '../direction-1-mapbox-v2/AnnotationLayer'
import type { MapAdapter } from '../direction-1-mapbox-v2/AnnotationLayer.types'
import { PrototypeHeader } from '../_components/PrototypeHeader'

/** Default city slug on first load — London (brief: London active on first load). */
const DEFAULT_CITY_SLUG = 'london'
/** Default parameter on first load — PM2.5 (brief: PM2.5 active on first load). */
const DEFAULT_PARAMETER: ParameterKey = 'pm25'

export default function DirectionTwoLiveDataPage(): React.ReactElement {
  const mapHandleRef = useRef<MapHandle>(null)

  // ── Selection state ──────────────────────────────────────────────────────────
  const [citySlug, setCitySlug] = useState<string>(DEFAULT_CITY_SLUG)
  const [parameter, setParameter] = useState<ParameterKey>(DEFAULT_PARAMETER)

  // ── Mode state (default / probe / annotate) ───────────────────────────────────
  const [mapMode, setMapMode] = useState<MapMode>('default')

  // ── Data ───────────────────────────────────────────────────────────────────────
  // The hook owns fetch + the four network states + the fresh/total counts. The parameter passed
  // here is always available (the selector cannot select NO2), satisfying the hook's contract.
  const { status, stations, freshCount, totalCount, retry } = useStations(citySlug, parameter)

  // Fresh-only legacy sensor set for triangulation (brief pattern 3: probe excludes stale). Derived
  // once per stations/parameter change. This is the SAME set whose size is freshCount.
  const freshSensors = useMemo(
    () => toLegacySensors(stations, parameter, true),
    [stations, parameter],
  )

  // Active city framing from the registry (never hardcoded). Falls back to the first registered
  // city if the slug is somehow unknown (defensive — the selector only emits registry slugs).
  const city = getCity(citySlug) ?? CITIES[0]

  // ── Mode transitions (mirror v2) ───────────────────────────────────────────────
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
      // Do not enter probe mode with no fresh sensors (the toggle is also disabled in that case;
      // this is the state-level guard).
      if (freshCount === 0) {
        return current
      }
      return 'probe'
    })
  }, [freshCount])

  // If the active selection drops to zero fresh sensors while probe mode is on (e.g. a city/param
  // switch resolves to an all-stale set), leave probe mode so the map is not stuck in a mode whose
  // toggle is now disabled. Effect (not render-time) so the state update is a proper post-render
  // side effect; it only fires when both conditions hold and bails otherwise.
  useEffect(() => {
    if (mapMode === 'probe' && freshCount === 0) {
      mapHandleRef.current?.clearPopup()
      setMapMode('default')
    }
  }, [mapMode, freshCount])

  // ── Selection handlers ─────────────────────────────────────────────────────────
  // Switching city or parameter clears any open probe (a pin/result for the old selection must not
  // linger) and triggers the hook's refetch via the state change.
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

  // ── AnnotationLayer adapter (mirror v2 — all six handlers must toggle) ──────────
  const mapAdapter: MapAdapter = {
    freeze: useCallback((): void => {
      const map = mapHandleRef.current?.getMap()
      if (map === undefined || map === null) {
        return
      }
      map.dragPan.disable()
      map.scrollZoom.disable()
      map.touchZoomRotate.disable()
      map.keyboard.disable()
      map.doubleClickZoom.disable()
      map.dragRotate.disable()
    }, []),
    unfreeze: useCallback((): void => {
      const map = mapHandleRef.current?.getMap()
      if (map === undefined || map === null) {
        return
      }
      map.dragPan.enable()
      map.scrollZoom.enable()
      map.touchZoomRotate.enable()
      map.keyboard.enable()
      map.doubleClickZoom.enable()
      map.dragRotate.enable()
    }, []),
  }

  const handleEnterAnnotateMode = useCallback((): void => {
    mapHandleRef.current?.clearPopup()
    setMapMode('annotate')
  }, [])
  const handleExitAnnotateMode = useCallback((): void => {
    setMapMode('default')
  }, [])

  // Probe is available only when there is at least one fresh sensor (brief pattern 3 toggle states).
  const probeAvailable = freshCount > 0

  return (
    <>
      {/*
       * Scoped styles: AnnotationLayer's --al-* token interface (copied from the v2 route so the
       * annotation overlay renders identically) + popup chrome reset for this route's popups.
       */}
      <style>{`
        :root {
          --al-overlay-bg:     rgba(255, 255, 255, 0.92);
          --al-overlay-border: rgba(0, 0, 0, 0.10);
          --al-input-bg:       #ffffff;
          --al-input-border:   rgba(0, 0, 0, 0.15);
          --al-text:           #0f1117;
          --al-muted:          #6b7280;
          --al-brand:          #0071c7;
          --al-success:        #3db54a;
          --al-error:          #e53935;
          --al-white:          #ffffff;
          --al-font:           -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          --al-radius-card:    10px;
          --al-radius-input:   4px;
          --al-radius-pill:    9999px;
        }
        .dir2-popup .mapboxgl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .dir2-popup .mapboxgl-popup-tip { display: none !important; }
      `}</style>

      {/* Flex column: standard chrome bar on top, live-data map fills the rest below it. */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
        {/* Standard prototype chrome. The AnnotationLayer is passed as commentSlot; its
            toggle now renders inline so it sits in the bar's right slot. storageKey/adapter/
            callbacks unchanged so saved comments + freeze behaviour are identical. The
            top-anchored overlays below (readout, selectors, probe) are nudged down ~56px to
            clear this bar. */}
        <PrototypeHeader
          buildName="Air Quality — Live OpenAQ Data"
          commentSlot={
            <AnnotationLayer
              storageKey="bc-live-data-map-v1"
              label="Annotate"
              mapAdapter={mapAdapter}
              onEnterMode={handleEnterAnnotateMode}
              onExitMode={handleExitAnnotateMode}
            />
          }
        />

        {/* Map container — fills the remaining height below the bar (flex:1 replaces 100vh). */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Map fills the container. Receives the live data, fresh-only set, parameter, and city
            framing; renders markers + probe + station popups. */}
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

        {/* Pattern 1 city selector (top-centre). */}
        <CitySelector activeSlug={citySlug} onSelect={handleSelectCity} />

        {/* Pattern 2 parameter selector (below city selector); NO2 disabled. */}
        <ParameterSelector active={parameter} onSelect={handleSelectParameter} />

        {/* Pattern 3 probe toggle (below the selectors); disabled/explained at 0 fresh. */}
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

        {/* AnnotationLayer relocated into PrototypeHeader's commentSlot (above) — its
            fixed-position top-right toggle is unchanged; storageKey/adapter/callbacks
            identical so saved comments + freeze behaviour are preserved. */}
        </div>
      </div>
    </>
  )
}
