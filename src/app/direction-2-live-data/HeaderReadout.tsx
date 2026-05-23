/**
 * HeaderReadout.tsx — "N of M sensors live" honesty readout (brief pattern 1 + loading form)
 *
 * Purpose:
 *   The single honesty indicator at the top of the map. It reflects, for the active city +
 *   parameter, how much of the data is actually current. It has four textual forms keyed off the
 *   network status the data hook reports — and crucially the "0 of M" and "no sensors" forms are
 *   NORMAL readouts, visually identical in styling to the populated form, never an error (the
 *   error state is a separate component). Loading shows "Loading {city} {parameter}…".
 *
 * Forms (brief microcopy):
 *   - loading      -> "Loading {City} {PARAM}…"
 *   - ready        -> "{City} · {N} of {M} sensors live"
 *   - empty-stale  -> "{City} · 0 of {M} sensors live"          (still normal — not an error)
 *   - empty        -> "{City} · no {PARAM} sensors"
 *   - error        -> nothing here (the error affordance owns its own copy + Retry)
 *
 * Key exports: HeaderReadout
 * External dependencies: react, ./aqiParameters (PARAMETER_META, ParameterKey),
 *   ./useStations (NetworkStatus)
 *
 * No design decisions: chrome matches the prototype's top-left header pill.
 */

'use client'

import React from 'react'
import { PARAMETER_META, type ParameterKey } from './aqiParameters'
import type { NetworkStatus } from './useStations'

/** BC brand blue — the small wordmark dot (prototype convention). */
const BRAND = '#0071c7'
/** Primary text colour on light chrome. */
const TEXT = '#0f1117'

type Props = {
  /** Display name of the active city (from the registry). */
  cityName: string
  /** Active parameter key — its label is shown in the readout copy. */
  parameter: ParameterKey
  /** Current network status, drives which textual form renders. */
  status: NetworkStatus
  /** Fresh (non-stale) station count for the active parameter — the "N". */
  freshCount: number
  /** Total stations returned for the active parameter — the "M". */
  totalCount: number
}

/**
 * Compose the readout text for the current status. Returns null for 'error' and 'idle' so the
 * pill renders nothing in those cases (error has its own affordance; idle is the pre-fetch
 * flash). The empty / empty-stale / ready forms are all plain readouts — see file header.
 */
function readoutText(props: Props): string | null {
  const { cityName, parameter, status, freshCount, totalCount } = props
  const paramLabel = PARAMETER_META[parameter].label

  switch (status) {
    case 'loading':
      return `Loading ${cityName} ${paramLabel}…`
    case 'ready':
    case 'empty-stale':
      // "{City} · {N} of {M} sensors live" — empty-stale is just N=0, same shape (honest).
      return `${cityName} · ${freshCount} of ${totalCount} sensors live`
    case 'empty':
      return `${cityName} · no ${paramLabel} sensors`
    case 'error':
    case 'idle':
      return null
  }
}

/**
 * Top-left header pill. Renders the composed readout text, or nothing when there is no readout
 * for the current status (error / idle). Styling is identical regardless of N — "0 of M" must
 * not look like a problem (brief acceptance: "0 of M renders as a normal readout, visually
 * distinct from an error").
 */
export function HeaderReadout(props: Props): React.ReactElement | null {
  const text = readoutText(props)
  if (text === null) {
    return null
  }

  return (
    <div
      data-slot="header-readout"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '9999px',
        padding: '8px 16px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: TEXT,
        boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      {/* Breathe Cities wordmark dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: BRAND,
          flexShrink: 0,
        }}
      />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {text}
      </span>
    </div>
  )
}
