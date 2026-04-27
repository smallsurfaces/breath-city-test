/**
 * TriangulationPopup.tsx — PM2.5 result popup for a clicked map point
 *
 * Renders a floating panel showing:
 * - Averaged PM2.5 value for the clicked location
 * - AQI category label with colour-coded background
 * - List of the 3 nearest sensors that contributed to the average
 * - A close button
 *
 * This component is purely presentational. It receives the triangulation
 * result from the Map component and renders it at a fixed position on screen.
 * The actual Mapbox popup anchor is handled by the Map component via mapboxgl.Popup.
 *
 * Key exports: TriangulationPopup
 * External dependencies: none (no Mapbox import — this is a React overlay)
 *
 * Ported from: design/prototypes/air-quality-map/src/components/TriangulationPopup.tsx
 * Changes: added 'use client' directive; updated import paths to co-located files.
 */

'use client'

import React from 'react'
import type { TriangulationResult } from './triangulation'
import { getAQICategory } from './aqi'
import type { SensorQuality } from './sensors'

type Props = {
  result: TriangulationResult
  onClose: () => void
}

/** Maps sensor quality to a short readable label for the popup list */
function qualityLabel(quality: SensorQuality): string {
  return quality === 'high' ? 'High quality' : 'Low quality'
}

export function TriangulationPopup({ result, onClose }: Props): React.ReactElement {
  const { averagePM25, nearestSensors } = result
  const aqiCategory = getAQICategory(averagePM25)

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
        overflow: 'hidden',
        width: 260,
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        pointerEvents: 'auto',
      }}
    >
      {/* AQI colour header — background reflects the PM2.5 category */}
      <div
        style={{
          background: aqiCategory.color,
          padding: '14px 16px 12px',
          position: 'relative',
        }}
      >
        {/* Close button — top-right of the colour band */}
        <button
          onClick={onClose}
          aria-label="Close result"
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: aqiCategory.textColor,
            opacity: 0.7,
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: '2px 4px',
          }}
        >
          ×
        </button>

        {/* PM2.5 value — large and prominent */}
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: aqiCategory.textColor,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {averagePM25}
          <span style={{ fontSize: '0.85rem', fontWeight: 400, marginLeft: 4 }}>
            µg/m³
          </span>
        </div>

        {/* AQI label */}
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: aqiCategory.textColor,
            opacity: 0.9,
            letterSpacing: '0.02em',
          }}
        >
          {aqiCategory.label}
        </div>
      </div>

      {/* Sensor list — shows which 3 sensors contributed */}
      <div style={{ padding: '12px 16px 14px' }}>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          {`Nearest ${nearestSensors.length} sensor${nearestSensors.length !== 1 ? 's' : ''}`}
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {nearestSensors.map((sensor) => (
            <li
              key={sensor.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
              }}
            >
              {/* Sensor name + quality indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Shape indicator — triangle SVG for high quality, circle for low */}
                {sensor.quality === 'high' ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
                    <polygon points="5,1 9,9 1,9" fill="#0071c7" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
                    <circle cx="5" cy="5" r="4" fill="#9c27b0" />
                  </svg>
                )}
                <div>
                  <div style={{ fontWeight: 600, color: '#0f1117' }}>
                    {sensor.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                    {qualityLabel(sensor.quality)}
                  </div>
                </div>
              </div>

              {/* PM2.5 reading for this sensor */}
              <div
                style={{
                  fontWeight: 700,
                  color: getAQICategory(sensor.pm25).color,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                {sensor.pm25}
              </div>
            </li>
          ))}
        </ul>

        {/* Footnote */}
        <div
          style={{
            marginTop: 10,
            fontSize: '0.65rem',
            color: '#6b7280',
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            paddingTop: 8,
          }}
        >
          {`Simple average of ${nearestSensors.length} nearest sensor${nearestSensors.length !== 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  )
}
