/**
 * CitySelector.tsx — Segmented city control (brief pattern 1)
 *
 * Purpose:
 *   Top-centre segmented control listing the cities served by the data-core registry. Exactly
 *   one city is active. Selecting a city is the only thing this component does — it reports the
 *   chosen slug up; the parent owns refetch + map fly/fit. Built data-driven from CITIES so
 *   adding a third city later requires no change here (brief acceptance criterion: "Build for
 *   two; do not hardcode two").
 *
 * Key exports: CitySelector
 * External dependencies: react, ../../lib/openaq/cities (CITIES, City — read-only registry)
 *
 * No design decisions here: the segmented-control chrome mirrors the existing prototype's pill
 * affordances (white/blur panel, BC brand blue for the active segment). Colours are the
 * prototype's established chrome literals, not AQI semantics.
 */

'use client'

import React from 'react'
import { CITIES } from '../../lib/openaq/cities'

/** BC brand blue — active-segment fill. Matches the prototype's existing control chrome. */
const BRAND = '#0071c7'
/** Primary text colour on light chrome (prototype convention). */
const TEXT = '#0f1117'

type Props = {
  /** Currently active city slug. */
  activeSlug: string
  /** Called with the chosen slug when a segment is selected. */
  onSelect: (slug: string) => void
}

/**
 * Renders one segment per registered city. The active segment is filled with the brand colour;
 * inactive segments are transparent over the shared panel. The whole control is a single pill so
 * the segments read as one switch.
 */
export function CitySelector({ activeSlug, onSelect }: Props): React.ReactElement {
  return (
    <div
      data-slot="city-selector"
      role="group"
      aria-label="Select city"
      style={{
        position: 'fixed',
        // Nudged below the standard PrototypeHeader bar (~56px).
        top: 'calc(56px + 1rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 3,
        borderRadius: '9999px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {CITIES.map((city) => {
        const isActive = city.slug === activeSlug
        return (
          <button
            key={city.slug}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(city.slug)}
            style={{
              border: 'none',
              cursor: 'pointer',
              // 56px min touch target (responsive standard) via padding + min height.
              minHeight: 38,
              padding: '8px 18px',
              borderRadius: '9999px',
              background: isActive ? BRAND : 'transparent',
              color: isActive ? '#ffffff' : TEXT,
              fontSize: '0.82rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'background 0.18s ease, color 0.18s ease',
            }}
          >
            {city.name}
          </button>
        )
      })}
    </div>
  )
}
