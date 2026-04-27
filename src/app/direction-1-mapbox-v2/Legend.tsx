/**
 * Legend.tsx — Map legend panel for the air quality prototype
 *
 * Shows:
 * - AQI PM2.5 colour bands with breakpoints
 * - Sensor type key (high quality triangle / low quality circle)
 * - Usage hint that changes per interaction mode
 *
 * Key exports: Legend
 * External dependencies: none
 *
 * Ported from: design/prototypes/air-quality-map/src/components/Legend.tsx
 * Changes: added 'use client' directive; updated MapMode import to local type.
 */

'use client'

import React from 'react'
import type { MapMode } from './MapComponent'

/** A single AQI band entry displayed in the legend */
type AQIBand = {
  color: string
  label: string
  range: string
}

/** Per-mode hint text shown at the bottom of the legend panel */
const MODE_HINTS: Record<MapMode, string> = {
  default:  "Activate 'Check air quality' to probe PM2.5 at any location",
  probe:    'Click anywhere on the map to triangulate PM2.5 from the 3 nearest sensors',
  annotate: 'Click to drop a comment pin',
}

const AQI_BANDS: AQIBand[] = [
  { color: '#3db54a', label: 'Good',                              range: '0–12.0' },
  { color: '#f5c518', label: 'Moderate',                          range: '12.1–35.4' },
  { color: '#f57c00', label: 'Unhealthy for Sensitive Groups',    range: '35.5–55.4' },
  { color: '#e53935', label: 'Unhealthy',                         range: '55.5–150.4' },
  { color: '#7b1fa2', label: 'Very Unhealthy / Hazardous',        range: '150.5+' },
]

type Props = {
  /** Current interaction mode — controls which hint text is displayed */
  mapMode: MapMode
}

export function Legend({ mapMode }: Props): React.ReactElement {
  return (
    <div
      data-slot="toggle-panel"
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '1rem',
        width: '220px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
        padding: '14px 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        zIndex: 10,
      }}
    >
      {/* Section header */}
      <div
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#6b7280',
          marginBottom: 8,
        }}
      >
        PM2.5 Air Quality Index
      </div>

      {/* AQI colour bands */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {AQI_BANDS.map((band) => (
          <li
            key={band.label}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {/* Colour swatch */}
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: band.color,
                flexShrink: 0,
              }}
            />
            {/* Label and range */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0f1117', lineHeight: 1.2 }}>
                {band.label}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#6b7280' }}>
                {band.range} µg/m³
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          margin: '10px 0 8px',
        }}
      />

      {/* Sensor type key */}
      <div
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#6b7280',
          marginBottom: 6,
        }}
      >
        Sensor Type
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* High quality — triangle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
            <polygon points="7,1 13,13 1,13" fill="#0071c7" />
          </svg>
          <span style={{ fontSize: '0.72rem', color: '#0f1117' }}>High quality</span>
        </div>
        {/* Low quality — circle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5" fill="#9c27b0" />
          </svg>
          <span style={{ fontSize: '0.72rem', color: '#0f1117' }}>Low quality</span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          margin: '10px 0 8px',
        }}
      />

      {/* Usage hint — text changes per interaction mode */}
      <div
        style={{
          fontSize: '0.68rem',
          color: '#6b7280',
          lineHeight: 1.4,
        }}
      >
        {MODE_HINTS[mapMode]}
      </div>
    </div>
  )
}
