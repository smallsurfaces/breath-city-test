/**
 * ParameterSelector.tsx — Segmented parameter control with NO2 disabled (brief pattern 2)
 *
 * Purpose:
 *   Lists the three parameters (PM2.5, PM10, NO2). Exactly one active. PM2.5 and PM10 are
 *   selectable; NO2 is present-but-DISABLED ("coming soon") because its AQI standard/averaging-
 *   window/units are unresolved (brief open question 1). Disabled is communicated BEFORE any
 *   click: the NO2 segment is greyed, not clickable, and its reason is surfaced on hover/focus
 *   (title + aria). Selecting a parameter reports the key up; the parent owns refetch + legend +
 *   marker re-render. Availability is read from PARAMETER_META so this stays a single source of
 *   truth — flipping NO2 on later is one data change in aqiParameters.ts, none here.
 *
 * Key exports: ParameterSelector
 * External dependencies: react, ./aqiParameters (PARAMETERS_ALL, PARAMETER_META, ParameterKey)
 *
 * No design decisions: chrome mirrors CitySelector (shared segmented-pill affordance). Disabled
 * styling uses reduced opacity + the muted token's role (greyed), consistent with a "not
 * available" affordance; colours are prototype chrome literals, not AQI semantics.
 */

'use client'

import React from 'react'
import { PARAMETERS_ALL, PARAMETER_META, type ParameterKey } from './aqiParameters'

/** BC brand blue — active-segment fill (matches CitySelector / prototype chrome). */
const BRAND = '#0071c7'
/** Primary text colour on light chrome. */
const TEXT = '#0f1117'
/** Muted text for a disabled segment (prototype grey). */
const MUTED = '#9aa6b2'

type Props = {
  /** Currently active parameter key (always an available parameter). */
  active: ParameterKey
  /** Called with the chosen key when an AVAILABLE segment is selected. NO2 never fires this. */
  onSelect: (parameter: ParameterKey) => void
}

/**
 * Renders one segment per parameter. Available parameters behave as a normal segmented control;
 * the unavailable parameter (NO2) renders disabled with a "coming soon" sub-label and its reason
 * exposed via title/aria so the user understands WHY before interacting. The disabled button
 * carries `disabled` so it is neither clickable nor focus-activatable into a selection.
 */
export function ParameterSelector({ active, onSelect }: Props): React.ReactElement {
  return (
    <div
      data-slot="parameter-selector"
      role="group"
      aria-label="Select air quality parameter"
      style={{
        position: 'fixed',
        top: '3.6rem',
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
      {PARAMETERS_ALL.map((key) => {
        const meta = PARAMETER_META[key]
        const isActive = key === active && meta.available
        const isDisabled = !meta.available

        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            disabled={isDisabled}
            // Reason surfaced before click: native tooltip + accessible description.
            title={isDisabled ? meta.disabledReason : undefined}
            aria-label={
              isDisabled ? `${meta.label} — ${meta.disabledReason}` : meta.label
            }
            onClick={() => {
              // Guard: never select an unavailable parameter even if the click somehow fires.
              if (isDisabled) {
                return
              }
              onSelect(key)
            }}
            style={{
              border: 'none',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              minHeight: 34,
              padding: '6px 14px',
              borderRadius: '9999px',
              background: isActive ? BRAND : 'transparent',
              color: isDisabled ? MUTED : isActive ? '#ffffff' : TEXT,
              opacity: isDisabled ? 0.7 : 1,
              fontSize: '0.78rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'background 0.18s ease, color 0.18s ease',
            }}
          >
            {meta.label}
            {isDisabled && (
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: MUTED,
                  border: `1px solid ${MUTED}`,
                  borderRadius: 4,
                  padding: '1px 4px',
                  lineHeight: 1.1,
                }}
              >
                {meta.disabledReason}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
