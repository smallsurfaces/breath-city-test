'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import AnnotationLayer from './AnnotationLayer'
import mapboxgl from 'mapbox-gl'
import circle from '@turf/circle'
import { featureCollection } from '@turf/helpers'
import 'mapbox-gl/dist/mapbox-gl.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type AqiBand =
  | 'good'
  | 'moderate'
  | 'unhealthy'
  | 'veryUnhealthy'
  | 'hazardous'
  | 'extreme'

type SensorReading = {
  id: string
  name: string
  coordinates: [number, number]
  aqi: number
  band: AqiBand
}

type ResolvedColors = Record<AqiBand, string>

// ─── Mock data ────────────────────────────────────────────────────────────────

const SENSOR_BASE: { id: string; name: string; coordinates: [number, number] }[] = [
  { id: 's1', name: 'Stephansplatz', coordinates: [16.3728, 48.2088] },
  { id: 's2', name: 'Prater',        coordinates: [16.4160, 48.2145] },
  { id: 's3', name: 'Mariahilf',     coordinates: [16.3540, 48.1966] },
  { id: 's4', name: 'Floridsdorf',   coordinates: [16.4010, 48.2566] },
  { id: 's5', name: 'Donaustadt',    coordinates: [16.4600, 48.2200] },
  { id: 's6', name: 'Favoriten',     coordinates: [16.3714, 48.1760] },
  { id: 's7', name: 'Ottakring',     coordinates: [16.3080, 48.2130] },
  { id: 's8', name: 'Simmering',     coordinates: [16.4300, 48.1780] },
]

const SENSOR_HISTORY: Record<string, Record<number, number>> = {
  s1: { 2000:88, 2001:85, 2002:83, 2003:91, 2004:82, 2005:79, 2006:76, 2007:72, 2008:68, 2009:65, 2010:62, 2011:59, 2012:56, 2013:54, 2014:51, 2015:49, 2016:54, 2017:57, 2018:55, 2019:52, 2020:38, 2021:40, 2022:46, 2023:44, 2024:42, 2025:40, 2026:39 },
  s2: { 2000:102,2001:98, 2002:96, 2003:105,2004:97, 2005:93, 2006:89, 2007:84, 2008:79, 2009:75, 2010:72, 2011:68, 2012:64, 2013:61, 2014:58, 2015:55, 2016:61, 2017:64, 2018:62, 2019:59, 2020:44, 2021:47, 2022:54, 2023:56, 2024:58, 2025:55, 2026:53 },
  s3: { 2000:95, 2001:91, 2002:90, 2003:98, 2004:89, 2005:85, 2006:81, 2007:76, 2008:72, 2009:68, 2010:65, 2011:62, 2012:59, 2013:56, 2014:53, 2015:51, 2016:57, 2017:60, 2018:58, 2019:55, 2020:41, 2021:44, 2022:51, 2023:53, 2024:67, 2025:64, 2026:62 },
  s4: { 2000:148,2001:144,2002:141,2003:152,2004:145,2005:140,2006:136,2007:130,2008:124,2009:118,2010:113,2011:108,2012:104,2013:100,2014:97, 2015:94, 2016:100,2017:104,2018:101,2019:98, 2020:78, 2021:82, 2022:90, 2023:87, 2024:81, 2025:78, 2026:76 },
  s5: { 2000:78, 2001:75, 2002:72, 2003:80, 2004:74, 2005:71, 2006:68, 2007:64, 2008:61, 2009:58, 2010:56, 2011:53, 2012:51, 2013:49, 2014:47, 2015:45, 2016:50, 2017:53, 2018:51, 2019:48, 2020:36, 2021:38, 2022:44, 2023:43, 2024:44, 2025:42, 2026:41 },
  s6: { 2000:162,2001:158,2002:155,2003:168,2004:157,2005:152,2006:147,2007:141,2008:134,2009:128,2010:122,2011:116,2012:110,2013:105,2014:100,2015:96, 2016:103,2017:108,2018:105,2019:101,2020:82, 2021:86, 2022:94, 2023:92, 2024:94, 2025:90, 2026:88 },
  s7: { 2000:38, 2001:37, 2002:36, 2003:40, 2004:38, 2005:37, 2006:36, 2007:35, 2008:34, 2009:33, 2010:33, 2011:32, 2012:32, 2013:31, 2014:30, 2015:30, 2016:32, 2017:33, 2018:32, 2019:31, 2020:28, 2021:29, 2022:30, 2023:31, 2024:35, 2025:34, 2026:33 },
  s8: { 2000:138,2001:134,2002:131,2003:142,2004:133,2005:129,2006:125,2007:120,2008:114,2009:108,2010:103,2011:98, 2012:94, 2013:90, 2014:86, 2015:83, 2016:89, 2017:94, 2018:91, 2019:87, 2020:68, 2021:72, 2022:80, 2023:76, 2024:72, 2025:70, 2026:68 },
}

// ─── AQI CSS variable map ─────────────────────────────────────────────────────

const AQI_INDICATOR: Record<AqiBand, string> = {
  good:          'var(--bc-semantic-aqi-good-indicator)',
  moderate:      'var(--bc-semantic-aqi-moderate-indicator)',
  unhealthy:     'var(--bc-semantic-aqi-unhealthy-indicator)',
  veryUnhealthy: 'var(--bc-semantic-aqi-very-unhealthy-indicator)',
  hazardous:     'var(--bc-semantic-aqi-hazardous-indicator)',
  extreme:       'var(--bc-semantic-aqi-extreme-indicator)',
}

const AQI_BAND_CSS_TOKEN: Record<AqiBand, string> = {
  good:          'good',
  moderate:      'moderate',
  unhealthy:     'unhealthy',
  veryUnhealthy: 'very-unhealthy',
  hazardous:     'hazardous',
  extreme:       'extreme',
}

// Fallback resolved hex values if CSS var read fails
const FALLBACK_COLORS: ResolvedColors = {
  good:          '#03ab3d',
  moderate:      '#C68400',
  unhealthy:     '#E8720C',
  veryUnhealthy: '#D32F2F',
  hazardous:     '#7B3FA0',
  extreme:       '#8B0000',
}

// ─── Token resolution helper ──────────────────────────────────────────────────

function resolveAqiColors(): ResolvedColors {
  const style = getComputedStyle(document.documentElement)
  const bands: AqiBand[] = ['good', 'moderate', 'unhealthy', 'veryUnhealthy', 'hazardous', 'extreme']
  const result = {} as ResolvedColors

  for (const band of bands) {
    const cssVar = `--bc-semantic-aqi-${AQI_BAND_CSS_TOKEN[band]}-indicator`
    const value = style.getPropertyValue(cssVar).trim()
    result[band] = value.length > 0 ? value : FALLBACK_COLORS[band]
  }

  return result
}

// ─── Band label helper ────────────────────────────────────────────────────────

function bandLabel(band: AqiBand): string {
  const labels: Record<AqiBand, string> = {
    good:          'Good',
    moderate:      'Moderate',
    unhealthy:     'Unhealthy',
    veryUnhealthy: 'Very Unhealthy',
    hazardous:     'Hazardous',
    extreme:       'Extreme',
  }
  return labels[band]
}

// ─── AQI band helper ──────────────────────────────────────────────────────────

function aqiToBand(aqi: number): AqiBand {
  if (aqi <= 50)  return 'good'
  if (aqi <= 100) return 'moderate'
  if (aqi <= 150) return 'unhealthy'
  if (aqi <= 200) return 'veryUnhealthy'
  if (aqi <= 300) return 'hazardous'
  return 'extreme'
}

function getSensorsForYear(year: number): SensorReading[] {
  return SENSOR_BASE.map(base => {
    const aqi = SENSOR_HISTORY[base.id]?.[year] ?? 50
    return { ...base, aqi, band: aqiToBand(aqi) }
  })
}

// ─── GeoJSON ring builder ─────────────────────────────────────────────────────

function buildRingsGeoJSON(sensors: SensorReading[]): GeoJSON.FeatureCollection {
  const ringFeatures = sensors.flatMap((sensor) =>
    [100, 1000, 5000].map((radiusMetres, i) =>
      circle(sensor.coordinates, radiusMetres / 1000, {
        steps: 64,
        units: 'kilometers',
        properties: {
          sensorId: sensor.id,
          band: sensor.band,
          ringIndex: i,
        },
      })
    )
  )
  return featureCollection(ringFeatures) as GeoJSON.FeatureCollection
}

// ─── HTML escape helper ───────────────────────────────────────────────────────
// Prevents XSS when interpolating user-controlled or API-sourced values into
// setHTML() strings. Apply to all string values — not CSS var references.

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ─── Popup content builder ────────────────────────────────────────────────────

function buildPopupHTML(sensor: SensorReading): string {
  const bgVar = `var(--bc-semantic-aqi-${AQI_BAND_CSS_TOKEN[sensor.band]}-bg)`
  const textVar = `var(--bc-semantic-aqi-${AQI_BAND_CSS_TOKEN[sensor.band]}-text)`
  const label = bandLabel(sensor.band)

  return `
    <div style="
      background: var(--bc-semantic-map-overlay);
      border: 1px solid var(--bc-semantic-map-grid);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      min-width: 200px;
      font-family: var(--bc-font-family-sans, sans-serif);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.75rem;">
        <span style="font-weight: 700; font-size: 0.875rem; color: var(--bc-semantic-text);">${escapeHTML(sensor.name)}</span>
        <span style="
          background: ${bgVar};
          color: ${textVar};
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
        ">${escapeHTML(label)}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--bc-semantic-text); margin-bottom: 0.25rem;">AQI: <strong>${escapeHTML(String(sensor.aqi))}</strong></div>
      <div style="font-size: 0.8rem; color: var(--bc-semantic-muted); margin-bottom: 0.25rem;">Main pollutant: PM2.5</div>
      <div style="font-size: 0.8rem; color: var(--bc-semantic-muted);">Updated: 5 minutes ago</div>
    </div>
  `
}

// ─── Mobile popup component ───────────────────────────────────────────────────

type MobilePopupProps = {
  sensor: SensorReading | null
  onDismiss: () => void
}

function MobilePopup({ sensor, onDismiss }: MobilePopupProps): React.ReactElement | null {
  if (sensor === null) return null

  const bgVar = `var(--bc-semantic-aqi-${AQI_BAND_CSS_TOKEN[sensor.band]}-bg)`
  const textVar = `var(--bc-semantic-aqi-${AQI_BAND_CSS_TOKEN[sensor.band]}-text)`
  const label = bandLabel(sensor.band)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '64px',
        left: 0,
        right: 0,
        zIndex: 60,
        padding: '0 1rem',
      }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onDismiss()
      }}
    >
      <div
        style={{
          background: 'var(--bc-semantic-map-overlay)',
          border: '1px solid var(--bc-semantic-map-grid)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          backdropFilter: 'blur(8px)',
          position: 'relative',
        }}
      >
        <button
          onClick={onDismiss}
          aria-label="Close popup"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--bc-semantic-muted)',
            fontSize: '1rem',
            lineHeight: 1,
            padding: '4px',
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingRight: '1.5rem', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--bc-semantic-text)' }}>{sensor.name}</span>
          <span
            style={{
              background: bgVar,
              color: textVar,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--bc-semantic-text)', marginBottom: '0.25rem' }}>
          AQI: <strong>{sensor.aqi}</strong>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--bc-semantic-muted)', marginBottom: '0.25rem' }}>
          Main pollutant: PM2.5
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--bc-semantic-muted)' }}>
          Updated: 5 minutes ago
        </div>
      </div>
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export default function DirectionOneMapboxPage(): React.ReactElement {
  const [showRings, setShowRings] = useState<boolean>(true)
  const [showMarkers, setShowMarkers] = useState<boolean>(true)
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [selectedSensor, setSelectedSensor] = useState<SensorReading | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const mapReadyRef = useRef<boolean>(false)

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // ── Responsive check ────────────────────────────────────────────────────────

  useEffect(() => {
    const check = (): void => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Dismiss mobile popup on outside click ───────────────────────────────────

  useEffect(() => {
    if (!isMobile || selectedSensor === null) return
    const handler = (e: MouseEvent): void => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-mobile-popup]')) {
        setSelectedSensor(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isMobile, selectedSensor])

  // ── Add markers helper ──────────────────────────────────────────────────────

  const addMarkers = useCallback((map: mapboxgl.Map, mobile: boolean, sensors: SensorReading[]): void => {
    // Remove any existing markers
    for (const m of markersRef.current) {
      m.remove()
    }
    markersRef.current = []

    for (const sensor of sensors) {
      const el = document.createElement('div')
      const isModerate = sensor.band === 'moderate'

      el.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${AQI_INDICATOR[sensor.band]};
        border: 2px solid rgba(255,255,255,0.85);
        box-shadow: 0 2px 8px rgba(0,0,0,0.22);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: ${isModerate ? 'var(--bc-semantic-aqi-moderate-text)' : 'white'};
        cursor: pointer;
        font-family: var(--bc-font-family-sans, sans-serif);
      `
      el.textContent = String(sensor.aqi)

      el.addEventListener('click', () => {
        if (mobile) {
          setSelectedSensor(sensor)
        } else {
          if (popupRef.current !== null) {
            popupRef.current.remove()
          }
          const popup = new mapboxgl.Popup({
            offset: 20,
            closeButton: true,
            closeOnClick: false,
            maxWidth: 'none',
          })
          popup.setLngLat(sensor.coordinates)
          popup.setHTML(buildPopupHTML(sensor))
          popup.addTo(map)
          popupRef.current = popup
        }
      })

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(sensor.coordinates)
        .addTo(map)

      markersRef.current.push(marker)
    }
  }, [])

  // ── Map initialisation ──────────────────────────────────────────────────────

  useEffect(() => {
    if (token === undefined || token === null || token === '') return
    if (mapContainerRef.current === null) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [16.3738, 48.2082],
      zoom: 12,
      attributionControl: true,
    })

    mapRef.current = map

    map.on('load', () => {
      const resolvedColors = resolveAqiColors()
      const ringsGeoJSON = buildRingsGeoJSON(getSensorsForYear(2024))

      // Add ring source
      map.addSource('aqi-rings', {
        type: 'geojson',
        data: ringsGeoJSON,
      })

      // Add ring fill layer
      map.addLayer({
        id: 'aqi-rings-layer',
        type: 'fill',
        source: 'aqi-rings',
        paint: {
          'fill-color': [
            'match',
            ['get', 'band'],
            'good',          resolvedColors.good,
            'moderate',      resolvedColors.moderate,
            'unhealthy',     resolvedColors.unhealthy,
            'veryUnhealthy', resolvedColors.veryUnhealthy,
            'hazardous',     resolvedColors.hazardous,
            'extreme',       resolvedColors.extreme,
            '#cccccc',
          ],
          'fill-opacity': [
            'match',
            ['get', 'ringIndex'],
            0, 0.28,
            1, 0.16,
            2, 0.08,
            0.08,
          ],
        },
      })

      mapReadyRef.current = true

      // Add markers (read current isMobile state from DOM width since closure stale)
      addMarkers(map, window.innerWidth < 768, getSensorsForYear(2024))
    })

    return () => {
      map.remove()
      mapRef.current = null
      mapReadyRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // ── showRings toggle ────────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current
    if (map === null || !mapReadyRef.current) return
    map.setLayoutProperty('aqi-rings-layer', 'visibility', showRings ? 'visible' : 'none')
  }, [showRings])

  // ── showMarkers toggle ──────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current
    if (map === null || !mapReadyRef.current) return

    if (showMarkers) {
      addMarkers(map, isMobile, getSensorsForYear(selectedYear))
    } else {
      for (const m of markersRef.current) {
        m.remove()
      }
      markersRef.current = []
    }
  }, [showMarkers, addMarkers, isMobile, selectedYear])

  // ── Year change ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current
    if (map === null || !mapReadyRef.current) return

    const sensors = getSensorsForYear(selectedYear)

    // Update rings source
    const source = map.getSource('aqi-rings') as mapboxgl.GeoJSONSource | undefined
    if (source !== undefined) {
      source.setData(buildRingsGeoJSON(sensors))
    }

    // Update markers
    if (showMarkers) {
      addMarkers(map, isMobile, sensors)
    }

    // Close desktop popup — data is now stale
    if (popupRef.current !== null) {
      popupRef.current.remove()
      popupRef.current = null
    }

    // Keep mobile bottom sheet in sync
    setSelectedSensor(prev => {
      if (prev === null) return null
      return sensors.find(s => s.id === prev.id) ?? null
    })
  }, [selectedYear, showMarkers, isMobile, addMarkers])

  // ── Token missing guard ─────────────────────────────────────────────────────

  if (token === undefined || token === null || token === '') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          background: 'var(--bc-semantic-bg)',
          color: 'var(--bc-semantic-error)',
          fontFamily: 'var(--bc-font-family-sans, sans-serif)',
          fontSize: '1rem',
          fontWeight: 600,
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        NEXT_PUBLIC_MAPBOX_TOKEN is not set.
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', height: '100dvh', overflow: 'hidden' }}>

      {/* ── Zone 1 — Top search bar ─────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0 1.5rem',
          background: 'var(--bc-semantic-map-overlay)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--bc-semantic-map-grid)',
        }}
      >
        {/* Wordmark */}
        <span
          style={{
            color: 'var(--bc-semantic-brand)',
            fontWeight: 700,
            fontSize: '1rem',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--bc-font-family-sans, sans-serif)',
          }}
        >
          Breathe Cities
        </span>

        {/* Location chip — intentional static state, search not yet implemented */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            height: '36px',
            padding: '0 0.875rem',
            border: '1px solid var(--bc-semantic-border)',
            borderRadius: '99px',
            background: 'var(--bc-semantic-bg)',
            color: 'var(--bc-semantic-text)',
            fontFamily: 'var(--bc-font-family-sans, sans-serif)',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M6 1C4.067 1 2.5 2.567 2.5 4.5c0 2.625 3.5 6.5 3.5 6.5s3.5-3.875 3.5-6.5C9.5 2.567 7.933 1 6 1zm0 4.75A1.25 1.25 0 1 1 6 3.25a1.25 1.25 0 0 1 0 2.5z" fill="var(--bc-semantic-muted)"/>
          </svg>
          Vienna, Austria
        </div>
      </header>

      {/* ── Zone 2 — Floating toggle panel (desktop only) ──────────────────── */}
      {!isMobile && (
        <aside
          data-slot="toggle-panel"
          style={{
            position: 'fixed',
            right: '1rem',
            top: '72px',
            zIndex: 40,
            background: 'var(--bc-semantic-map-overlay)',
            border: '1px solid var(--bc-semantic-map-grid)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Show AQI rings */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--bc-semantic-text)',
                fontFamily: 'var(--bc-font-family-sans, sans-serif)',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={showRings}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowRings(e.target.checked)}
                style={{ accentColor: 'var(--bc-semantic-brand)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Show AQI rings
            </label>

            {/* Show sensor markers */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--bc-semantic-text)',
                fontFamily: 'var(--bc-font-family-sans, sans-serif)',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={showMarkers}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowMarkers(e.target.checked)}
                style={{ accentColor: 'var(--bc-semantic-brand)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Show sensor markers
            </label>
          </div>
        </aside>
      )}

      {/* ── Map container ───────────────────────────────────────────────────── */}
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* ── Mobile popup — bottom sheet ─────────────────────────────────────── */}
      {isMobile && (
        <div data-mobile-popup>
          <MobilePopup
            sensor={selectedSensor}
            onDismiss={() => setSelectedSensor(null)}
          />
        </div>
      )}

      {/* ── Zone 3 — Time slider ────────────────────────────────────────────── */}
      <footer
        data-slot="time-slider"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0 2rem',
          background: 'var(--bc-semantic-map-overlay)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid var(--bc-semantic-map-grid)',
        }}
      >
        {/* Label */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', whiteSpace: 'nowrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--bc-semantic-text)',
              fontFamily: 'var(--bc-font-family-sans, sans-serif)',
            }}
          >
            Air quality 2000 – 2026
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--bc-semantic-muted)',
              fontFamily: 'var(--bc-font-family-sans, sans-serif)',
            }}
          >
            Drag to explore
          </span>
        </div>

        {/* Range slider */}
        <input
          type="range"
          min={2000}
          max={2026}
          step={1}
          value={selectedYear}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedYear(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: 'var(--bc-semantic-brand)',
            cursor: 'pointer',
          }}
        />

        {/* Year pill */}
        <span
          style={{
            background: 'var(--bc-semantic-brand)',
            color: 'var(--bc-color-white)',
            fontWeight: 700,
            fontSize: '0.875rem',
            padding: '4px 12px',
            borderRadius: '99px',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--bc-font-family-sans, sans-serif)',
          }}
        >
          {selectedYear}
        </span>
      </footer>

      {/* ── Annotation layer ────────────────────────────────────────────────── */}
      <AnnotationLayer
        mapRef={mapRef}
        popupRef={popupRef}
        onClearSensor={() => setSelectedSensor(null)}
      />

      {/* ── Popup styles override ────────────────────────────────────────────── */}
      <style>{`
        .mapboxgl-popup-content {
          background: var(--bc-semantic-map-overlay) !important;
          border: 1px solid var(--bc-semantic-map-grid) !important;
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 2px 16px rgba(0,0,0,0.14) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: var(--bc-semantic-map-overlay) !important;
          border-bottom-color: var(--bc-semantic-map-overlay) !important;
        }
        .mapboxgl-popup-close-button {
          color: var(--bc-semantic-muted);
          font-size: 1rem;
          top: 0.5rem;
          right: 0.5rem;
        }
      `}</style>
    </div>
  )
}
