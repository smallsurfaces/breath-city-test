/**
 * ProbeResultPopup.tsx — Fresh-only triangulation result with graceful degradation.
 *
 * Purpose:
 *   The popup shown after a "Check air quality" probe click resolves. Component copy of
 *   direction-2-live-data/ProbeResultPopup.tsx (unchanged behaviour — only import paths differ).
 *   It renders the triangulated value for the active parameter, coloured by that parameter's AQI
 *   tier tokens, and DEGRADES by how many fresh sensors backed it:
 *     - >= 3 fresh : full-prominence result; footnote "Simple average of 3 nearest live sensors"
 *     - 1-2 fresh  : SOFTENED headline; sub-copy "Based on {N} live sensor{s} — limited coverage
 *                    here" with correct pluralisation
 *     - 0 fresh    : this popup is NEVER shown (the probe returns null upstream; the toggle is
 *                    disabled). Guard included so a misuse renders the no-result message rather than
 *                    a fabricated number.
 *
 *   Vocabulary: "live sensors" everywhere, matching the header readout's "live" language.
 *
 * Key exports: ProbeResultPopup
 * External dependencies: react, ../../../direction-1-mapbox-v2/triangulation (TriangulationResult
 *   type, READ-ONLY), ../../../direction-2-live-data/aqiParameters (classify + tokens, READ-ONLY)
 *
 * Token discipline: header bg/text + per-sensor value colour resolved from the parameter's tier
 *   tokens at runtime; no inlined AQI hex. Chrome uses prototype literals.
 */

'use client'

import React from 'react'
import type { TriangulationResult } from '@/app/direction-1-mapbox-v2/triangulation'
import {
  classifyAqi,
  formatReading,
  PARAMETER_META,
  resolveTierColor,
  type ParameterKey,
} from '@/app/direction-2-live-data/aqiParameters'

/** Primary text colour (prototype chrome). */
const TEXT = '#0f1117'
/** Muted text (prototype chrome). */
const MUTED = '#6b7280'
/** Neutral fallback for the tier header bg if a token cannot be resolved. */
const HEADER_FALLBACK_BG = '#eef2f6'

type Props = {
  /** Triangulation result (fresh-only — built from the excludeStale sensor set). */
  result: TriangulationResult
  /** Active parameter — selects the AQI tier colours + unit + the value carrier meaning. */
  parameter: ParameterKey
  /** Total fresh-sensor count for the active city+parameter — drives the degradation tier. */
  freshCount: number
  /**
   * Optional formatted distance to the nearest contributing live sensor. When provided, the
   * "Nearest live sensor is {x} away" hint renders. Pass null to omit — the core probe ships
   * without it.
   */
  nearestDistanceLabel: string | null
  /** Close the popup. */
  onClose: () => void
}

/** Pluralise "sensor" against a count, so all probe copy agrees. */
function sensorWord(count: number): string {
  return count === 1 ? 'sensor' : 'sensors'
}

export function ProbeResultPopup({
  result,
  parameter,
  freshCount,
  nearestDistanceLabel,
  onClose,
}: Props): React.ReactElement {
  const meta = PARAMETER_META[parameter]

  // 0-fresh guard: this popup should never be opened with no fresh sensors. If it somehow is,
  // render the honest no-result message rather than a fabricated number.
  if (freshCount === 0 || result.nearestSensors.length === 0) {
    return (
      <div style={panelStyle()}>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT }}>
            No live sensors to probe here
          </div>
        </div>
      </div>
    )
  }

  // averagePM25 is the legacy carrier for "the selected parameter's averaged value" (toLegacySensors
  // fills it with whatever parameter was requested). Classify it against the ACTIVE parameter.
  const value = result.averagePM25
  const tier = classifyAqi(value, parameter)
  const headerBg = resolveTierColor(tier, 'bg') || HEADER_FALLBACK_BG
  const headerText = resolveTierColor(tier, 'text') || TEXT

  // Degradation: 1-2 fresh softens the headline (smaller value type + slightly reduced opacity).
  const contributing = result.nearestSensors.length
  const softened = freshCount < 3
  const valueFontSize = softened ? '1.5rem' : '2rem'
  const valueOpacity = softened ? 0.85 : 1

  // Footnote / sub-copy per tier.
  const footnote =
    freshCount >= 3
      ? `Simple average of ${contributing} nearest live sensors`
      : `Based on ${freshCount} live ${sensorWord(freshCount)} — limited coverage here`

  return (
    <div style={panelStyle()}>
      {/* AQI tier header */}
      <div style={{ background: headerBg, padding: '14px 16px 12px', position: 'relative' }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close result"
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
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

        <div
          style={{
            fontSize: valueFontSize,
            fontWeight: 700,
            color: headerText,
            opacity: valueOpacity,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {value}
          <span style={{ fontSize: '0.85rem', fontWeight: 400, marginLeft: 4 }}>
            {meta.unit}
          </span>
        </div>

        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: headerText,
            opacity: 0.9,
            letterSpacing: '0.02em',
          }}
        >
          {tier.label}
        </div>
      </div>

      {/* Contributing sensors */}
      <div style={{ padding: '12px 16px 14px' }}>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          {`Nearest ${contributing} live ${sensorWord(contributing)}`}
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {result.nearestSensors.map((sensor) => {
            const sensorTier = classifyAqi(sensor.pm25, parameter)
            const sensorColor = resolveTierColor(sensorTier, 'indicator') || MUTED
            return (
              <li
                key={sensor.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {sensor.quality === 'high' ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
                      <polygon points="5,1 9,9 1,9" fill={sensorColor} />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
                      <circle cx="5" cy="5" r="4" fill={sensorColor} />
                    </svg>
                  )}
                  <div style={{ fontWeight: 600, color: TEXT }}>{sensor.name}</div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: sensorColor,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {/* Raw per-sensor float rounded for display; the average above is already rounded. */}
                  {formatReading(sensor.pm25, parameter)}
                </div>
              </li>
            )
          })}
        </ul>

        {/* Optional far-sensor hint slot — renders only if a label is passed. */}
        {nearestDistanceLabel !== null && (
          <div style={{ marginTop: 8, fontSize: '0.66rem', color: MUTED, fontStyle: 'italic' }}>
            {`Nearest live sensor is ${nearestDistanceLabel} away`}
          </div>
        )}

        {/* Footnote / degradation sub-copy */}
        <div
          style={{
            marginTop: 10,
            fontSize: '0.66rem',
            color: MUTED,
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            paddingTop: 8,
          }}
        >
          {footnote}
        </div>
      </div>
    </div>
  )
}

/** Shared panel chrome. */
function panelStyle(): React.CSSProperties {
  return {
    background: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
    overflow: 'hidden',
    width: 260,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    pointerEvents: 'auto',
  }
}
