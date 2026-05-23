/**
 * ProbeResultPopup.tsx — Fresh-only triangulation result with graceful degradation (pattern 3)
 *
 * Purpose:
 *   The popup shown after a probe click resolves. It renders the triangulated value for the
 *   active parameter, coloured by that parameter's AQI tier tokens, and DEGRADES by how many
 *   fresh sensors backed it:
 *     - >= 3 fresh : full-prominence result; footnote "Simple average of 3 nearest live sensors"
 *     - 1-2 fresh  : SOFTENED headline (reduced size/opacity — the design-owned softening detail,
 *                    open question 4, kept minimal here); sub-copy "Based on {N} live sensor{s} —
 *                    limited coverage here" with correct pluralisation
 *     - 0 fresh    : this popup is NEVER shown — the probe produces no value; the toggle is
 *                    disabled/explained and the probe returns null upstream. (Guard included so a
 *                    misuse renders the no-result message rather than a fabricated number.)
 *
 *   Vocabulary: "live sensors" everywhere, matching the header readout's "live" language (brief:
 *   one freshness vocabulary across the UI).
 *
 *   Far-sensor hint (open question 2): the layout reserves a slot (`nearestDistanceKm`, optional)
 *   so the "Nearest live sensor is {d} away" hint can be added later WITHOUT restructuring. The
 *   distance threshold is not invented here — the hint only renders if a formatted string is
 *   passed in (it never is yet), so core probe ships without it.
 *
 * Key exports: ProbeResultPopup
 * External dependencies: react, ../direction-1-mapbox-v2/triangulation (TriangulationResult type,
 *   imported READ-ONLY — that file is not modified; same read-only-import pattern the data-core
 *   adapter uses for the Sensor type), ./aqiParameters (classify + tokens)
 *
 * Token discipline: header bg/text + per-sensor value colour resolved from the parameter's tier
 *   tokens at runtime; no inlined AQI hex. Chrome uses prototype literals.
 */

'use client'

import React from 'react'
import type { TriangulationResult } from '../direction-1-mapbox-v2/triangulation'
import {
  classifyAqi,
  PARAMETER_META,
  resolveTierColor,
  type ParameterKey,
} from './aqiParameters'

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
   * Optional formatted distance to the nearest contributing live sensor (open question 2). When
   * provided, the "Nearest live sensor is {x} away" hint renders. Pass null/undefined to omit —
   * the core probe ships without it. The threshold for showing it is decided by the caller, never
   * here.
   */
  nearestDistanceLabel: string | null
  /** Close the popup. */
  onClose: () => void
}

/**
 * Pluralise "sensor" against a count. Centralised so all probe copy agrees (brief: pluralisation
 * must agree with N in all probe copy).
 */
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
  // render the honest no-result message rather than a fabricated number (brief acceptance: 0 fresh
  // -> no value is ever shown).
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

  // averagePM25 is the legacy carrier for "the selected parameter's averaged value" (the
  // data-core's toLegacySensors fills it with whatever parameter was requested — not necessarily
  // PM2.5). Classify it against the ACTIVE parameter's breakpoints.
  const value = result.averagePM25
  const tier = classifyAqi(value, parameter)
  const headerBg = resolveTierColor(tier, 'bg') || HEADER_FALLBACK_BG
  const headerText = resolveTierColor(tier, 'text') || TEXT

  // Degradation: 1-2 fresh softens the headline. The exact softening is design-owned (open
  // question 4) — kept minimal: smaller value type + slightly reduced opacity. Behaviour/copy are
  // fixed by the brief; this is only the visual finish.
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
                  {sensor.pm25}
                </div>
              </li>
            )
          })}
        </ul>

        {/* Optional far-sensor hint slot (open question 2) — renders only if a label is passed. */}
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
