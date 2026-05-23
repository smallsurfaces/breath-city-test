/**
 * MapAttribution.tsx — Persistent map-level data credit (brief pattern 5b)
 *
 * Purpose:
 *   The always-visible "Air quality data from OpenAQ" credit. It must persist across every
 *   network state — loading, ready, empty, empty-stale, and error (brief acceptance: "persistent
 *   and visible in all states"). So it is rendered by the page unconditionally, never gated on the
 *   fetch outcome. This is distinct from Mapbox's own basemap attribution (bottom-right); this
 *   credit is specifically for the air-quality data source.
 *
 * Key exports: MapAttribution
 * External dependencies: react
 *
 * No design decisions: small bottom-right pill, low-emphasis chrome, sits above the Mapbox
 * attribution control.
 */

'use client'

import React from 'react'

export function MapAttribution(): React.ReactElement {
  return (
    <div
      data-slot="map-attribution"
      style={{
        position: 'fixed',
        bottom: '0.6rem',
        right: '0.6rem',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 9999,
        padding: '4px 10px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '0.62rem',
        fontWeight: 500,
        color: '#6b7280',
        boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
        pointerEvents: 'none',
      }}
    >
      Air quality data from OpenAQ
    </div>
  )
}
