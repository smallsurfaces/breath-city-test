/**
 * page.tsx — Direction 01 PM2.5 Triangulation Concept
 *
 * Root page for the air quality triangulation prototype, ported from the
 * Vite prototype at design/prototypes/air-quality-map/src/App.tsx.
 *
 * Wires together:
 * - MapComponent (Mapbox GL JS with sensor markers, probe mode, and triangulation)
 * - ProbeToggle (centre-top button to activate/deactivate Probe mode)
 * - AnnotationLayer (spatial review overlay for Jack and Gabe)
 * - Legend (AQI colour key + sensor type key)
 *
 * Three mutually exclusive interaction modes are managed here:
 *   default  — normal map pan/zoom, no triangulation
 *   probe    — next map click triangulates and drops a probe pin
 *   annotate — AnnotationLayer capture overlay is active
 *
 * Switching into any mode exits the others. The MapAdapter passed to
 * AnnotationLayer freezes all Mapbox interaction handlers during annotate mode.
 *
 * Key exports: DirectionOneMapboxV2Page (default)
 * External dependencies: mapbox-gl (via MapComponent), AnnotationLayer
 *
 * Route: /direction-1-mapbox-v2
 */

'use client'

import React, { useRef, useCallback, useState } from 'react'
import { MapComponent } from './MapComponent'
import type { MapHandle, MapMode } from './MapComponent'
import { Legend } from './Legend'
import { ProbeToggle } from './ProbeToggle'
import AnnotationLayer from './AnnotationLayer'
import type { MapAdapter } from './AnnotationLayer.types'

export default function DirectionOneMapboxV2Page(): React.ReactElement {
  const mapHandleRef = useRef<MapHandle>(null)

  // ── Mode state ───────────────────────────────────────────────────────────────
  // Single source of truth for which interaction mode is active.
  // Switching to any mode implicitly exits all others.
  const [mapMode, setMapMode] = useState<MapMode>('default')

  // ── Mode transitions ─────────────────────────────────────────────────────────

  /** Activates probe mode; clears any open popup from other modes. */
  const enterProbeMode = useCallback((): void => {
    setMapMode('probe')
  }, [])

  /** Returns to default mode; clears any active probe pin/lines/popup. */
  const exitProbeMode = useCallback((): void => {
    setMapMode('default')
  }, [])

  /** Toggles probe mode on/off. Clicking an active probe toggle deactivates it. */
  const handleProbeToggle = useCallback((): void => {
    if (mapMode === 'probe') {
      // Turn probe off — clear pin, lines, popup
      mapHandleRef.current?.clearPopup()
      exitProbeMode()
    } else {
      enterProbeMode()
    }
  }, [mapMode, enterProbeMode, exitProbeMode])

  // ── MapAdapter ──────────────────────────────────────────────────────────────
  // Passed to AnnotationLayer. freeze() disables all 6 Mapbox interaction
  // handlers so the annotation click capture overlay takes exclusive control.
  // All 6 must be toggled — omitting any allows partial map interaction
  // during annotation mode.

  const mapAdapter: MapAdapter = {
    freeze: useCallback((): void => {
      const map = mapHandleRef.current?.getMap()
      if (!map) return
      map.dragPan.disable()
      map.scrollZoom.disable()
      map.touchZoomRotate.disable()
      map.keyboard.disable()
      map.doubleClickZoom.disable()
      map.dragRotate.disable()
    }, []),

    unfreeze: useCallback((): void => {
      const map = mapHandleRef.current?.getMap()
      if (!map) return
      map.dragPan.enable()
      map.scrollZoom.enable()
      map.touchZoomRotate.enable()
      map.keyboard.enable()
      map.doubleClickZoom.enable()
      map.dragRotate.enable()
    }, []),
  }

  // ── handleEnterAnnotateMode ──────────────────────────────────────────────────
  // Called by AnnotationLayer when annotation mode is entered.
  // Clears any open probe so it doesn't overlap annotation cards.
  // Sets mapMode to 'annotate' so the MapComponent knows to suppress
  // probe click handling.

  const handleEnterAnnotateMode = useCallback((): void => {
    mapHandleRef.current?.clearPopup()
    setMapMode('annotate')
  }, [])

  // ── handleExitAnnotateMode ───────────────────────────────────────────────────
  // Returns to default mode when annotation is exited.

  const handleExitAnnotateMode = useCallback((): void => {
    setMapMode('default')
  }, [])

  return (
    <>
      {/*
       * Inject --al-* CSS custom property tokens for the AnnotationLayer component.
       * The prototype had these in global.css; here we inject them as a scoped
       * <style> block co-located with the route so no global CSS is polluted.
       * The --al-* namespace is the AnnotationLayer's internal token interface.
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
        .triangulation-popup .mapboxgl-popup-content,
        .sensor-popup .mapboxgl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .triangulation-popup .mapboxgl-popup-tip,
        .sensor-popup .mapboxgl-popup-tip {
          display: none !important;
        }
      `}</style>

      <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* Map fills the full viewport */}
        <MapComponent
          ref={mapHandleRef}
          mapMode={mapMode}
          onExitProbe={exitProbeMode}
        />

        {/* Legend panel — bottom-left. mapMode prop drives the per-mode hint text. */}
        <Legend mapMode={mapMode} />

        {/* Header pill — top-left, gives context for the prototype */}
        <div
          data-slot="toggle-panel"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '9999px',
            padding: '8px 16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#0f1117',
            boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Breathe Cities wordmark dot */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#0071c7',
            }}
          />
          Breathe Cities — PM2.5 Triangulation
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 400,
              color: '#6b7280',
              marginLeft: 4,
            }}
          >
            Vienna concept
          </span>
        </div>

        {/* Probe mode toggle — centre top, primary action button */}
        <ProbeToggle
          isActive={mapMode === 'probe'}
          onToggle={handleProbeToggle}
        />

        {/* AnnotationLayer — spatial review overlay for Jack and Gabe.
            storageKey is unique to this prototype view. togglePosition places
            the pill in the top-right. */}
        <AnnotationLayer
          storageKey="bc-air-quality-map-v1"
          label="Annotate"
          mapAdapter={mapAdapter}
          onEnterMode={handleEnterAnnotateMode}
          onExitMode={handleExitAnnotateMode}
          togglePosition={{ top: '1rem', right: '1rem' }}
        />
      </div>
    </>
  )
}
