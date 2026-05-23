/**
 * StationPopup.tsx — Per-station popup with reading, freshness age, and provenance (pattern 5)
 *
 * Purpose:
 *   The popup shown when a user clicks a station marker. It surfaces, for the active parameter:
 *   the reading + AQI tier (coloured from the parameter's tokens), the reading AGE on demand
 *   (from the data-core's ageHours/isStale — never re-derived here), and PROVENANCE — the
 *   per-station attribution string, including the attribution === null case rendered honestly as
 *   "Source: not specified" (never blank, never invented). Provider is shown when present.
 *
 *   Freshness/age copy (brief; the unsettled exact formatting — open question 3 — is kept simple
 *   and honest, NOT invented beyond the brief's stated defaults):
 *     - fresh, age known      -> "Updated {n}h ago"  (or "just now" under 1h)
 *     - stale, age known      -> "Last reported {n}h ago"
 *     - age unknown (null)    -> "Last reported time unknown"  (treated as stale by the data-core)
 *
 * Key exports: StationPopup
 * External dependencies: react, ../../lib/openaq/types (Station — read-only), ./aqiParameters
 *   (classifyAqi + tier tokens + meta)
 *
 * Token discipline: the AQI header colour + text colour are resolved from the parameter's tier
 *   tokens at runtime (resolveTierColor 'bg' / 'text'); no inlined AQI hex. Chrome (white panel,
 *   greys) uses prototype literals. This component is presentational — no Mapbox import.
 */

'use client'

import React from 'react'
import type { Station } from '../../lib/openaq/types'
import {
  classifyAqi,
  formatReading,
  PARAMETER_META,
  resolveTierColor,
  type ParameterKey,
} from './aqiParameters'

/** Primary text colour (prototype chrome). */
const TEXT = '#0f1117'
/** Muted text (prototype chrome). */
const MUTED = '#6b7280'
/** Neutral fallback for the tier header bg if a token cannot be resolved at runtime. */
const HEADER_FALLBACK_BG = '#eef2f6'

type Props = {
  /** The clicked station. */
  station: Station
  /** Active parameter — selects which reading + tier colours to show. */
  parameter: ParameterKey
  /** Close the popup. */
  onClose: () => void
}

/**
 * Build the age line from the data-core's ageHours/isStale (brief pattern 5). ageHours === null
 * is rendered as unknown-time (never "0h"/"fresh"); fresh vs stale picks the verb. Hours are
 * rounded to the nearest hour for display; under 1h fresh reads "just now".
 */
function ageLine(ageHours: number | null, isStale: boolean): string {
  if (ageHours === null) {
    // Unknown age — the data-core treats this as stale; render it honestly.
    return 'Last reported time unknown'
  }
  const rounded = Math.round(ageHours)
  if (!isStale) {
    return rounded < 1 ? 'Updated just now' : `Updated ${rounded}h ago`
  }
  return `Last reported ${rounded}h ago`
}

export function StationPopup({ station, parameter, onClose }: Props): React.ReactElement {
  const reading = station.parameters[parameter]
  const meta = PARAMETER_META[parameter]

  // Defensive: if the station somehow lacks this parameter (should not happen — the map only
  // attaches popups to stations that carry the active parameter), render a minimal honest panel
  // rather than throwing.
  if (reading === undefined) {
    return (
      <div style={panelStyle()}>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: TEXT }}>{station.name}</div>
          <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: 4 }}>
            No {meta.label} reading at this station.
          </div>
          {/* Map-level credit is persistent elsewhere; per-station provenance still shown. */}
          <ProvenanceBlock station={station} />
        </div>
      </div>
    )
  }

  const tier = classifyAqi(reading.value, parameter)
  const headerBg = resolveTierColor(tier, 'bg') || HEADER_FALLBACK_BG
  const headerText = resolveTierColor(tier, 'text') || TEXT
  const indicator = resolveTierColor(tier, 'indicator') || MUTED
  const fresh = !reading.isStale

  return (
    <div style={panelStyle()}>
      {/* AQI tier header — background + text from the parameter's tier tokens */}
      <div style={{ background: headerBg, padding: '12px 16px 10px', position: 'relative' }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: headerText,
            opacity: 0.7,
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: '2px 4px',
          }}
        >
          ×
        </button>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: headerText, paddingRight: 18 }}>
          {station.name}
        </div>
        {station.locality !== null && (
          <div style={{ fontSize: '0.68rem', color: headerText, opacity: 0.8, marginTop: 1 }}>
            {station.locality}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: headerText, lineHeight: 1 }}>
            {/* Raw upstream float rounded for display at the parameter's precision; data stays raw. */}
            {formatReading(reading.value, parameter)}
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 400, color: headerText, opacity: 0.9 }}>
            {reading.unit}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: headerText,
              opacity: 0.95,
            }}
          >
            {tier.label}
          </span>
        </div>
      </div>

      {/* Body — freshness/age + quality + provenance */}
      <div style={{ padding: '12px 16px 14px' }}>
        {/* Freshness chip + age line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: fresh ? indicator : MUTED,
            }}
          >
            {/* Solid dot = live, hollow ring = stale (mirrors marker treatment) */}
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              {fresh ? (
                <circle cx="5" cy="5" r="4" fill={indicator} />
              ) : (
                <circle cx="5" cy="5" r="3.5" fill="none" stroke={MUTED} strokeWidth="1.5" />
              )}
            </svg>
            {fresh ? 'Live' : 'Stale'}
          </span>
          <span style={{ fontSize: '0.72rem', color: MUTED }}>
            {ageLine(reading.ageHours, reading.isStale)}
          </span>
        </div>

        {/* Quality */}
        <div style={{ fontSize: '0.7rem', color: MUTED, marginBottom: 8 }}>
          {station.quality === 'high' ? 'High quality sensor' : 'Low quality sensor'}
        </div>

        <ProvenanceBlock station={station} />
      </div>
    </div>
  )
}

/**
 * Provenance sub-block (brief pattern 5a). Renders the per-station attribution and provider.
 * The attribution === null case renders "Source: not specified" — never blank, never a fabricated
 * source. Provider is shown when present (it always is — Station.provider is a non-null string).
 */
function ProvenanceBlock({ station }: { station: Station }): React.ReactElement {
  return (
    <div
      style={{
        borderTop: '1px solid rgba(0,0,0,0.12)',
        paddingTop: 8,
        marginTop: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ fontSize: '0.66rem', color: MUTED }}>
        {station.attribution !== null ? `Source: ${station.attribution}` : 'Source: not specified'}
      </div>
      <div style={{ fontSize: '0.66rem', color: MUTED }}>{`Provider: ${station.provider}`}</div>
    </div>
  )
}

/** Shared panel chrome for the popup. */
function panelStyle(): React.CSSProperties {
  return {
    background: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
    overflow: 'hidden',
    width: 250,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    pointerEvents: 'auto',
  }
}
