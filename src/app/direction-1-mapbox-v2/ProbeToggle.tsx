/**
 * ProbeToggle.tsx — Centre-top toggle button for Probe mode
 *
 * Renders the primary "Check air quality" action button that activates
 * Probe mode. When active, a gentle pulsing ring animates around the
 * button to signal the mode is live.
 *
 * Probe mode lets users click the map to drop a probe pin and trigger
 * air quality triangulation. This is distinct from:
 * - Default mode (normal pan/zoom, no triangulation)
 * - Annotate mode (handled by AnnotationLayer)
 *
 * Key exports: ProbeToggle
 * External dependencies: none
 *
 * Ported from: design/prototypes/air-quality-map/src/components/ProbeToggle.tsx
 * Changes: added 'use client' directive; probe-pulse @keyframes injected via
 * <style> tag since this route has no separate global.css for the animation.
 */

'use client'

import React from 'react'

type Props = {
  /** Whether Probe mode is currently active */
  isActive: boolean
  /** Called when the button is clicked — parent toggles mode */
  onToggle: () => void
}

/**
 * CrosshairIcon — simple SVG crosshair to reinforce "check a location" intent.
 * Built inline so there is no dependency on an icon library.
 */
function CrosshairIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Outer circle */}
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      {/* Centre dot */}
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      {/* Cross hairs — 4 lines from circle edge inward */}
      <line x1="8" y1="1" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="8" x2="4.5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.5" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ProbeToggle({ isActive, onToggle }: Props): React.ReactElement {
  return (
    <>
      {/*
       * Inject @keyframes for the probe-pulse animation.
       * Scale + opacity cycle gives a gentle "breathing" effect at 2.5s.
       * The ring starts at the button edge (scale 1) and expands outward (scale 1.6).
       * Injected here rather than in globals.css so all styles are co-located
       * with the component that uses them.
       */}
      <style>{`
        @keyframes probe-pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          70% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0;
          }
        }
      `}</style>

      {/*
       * Outer wrapper is position:relative so the pulsing ring pseudo-element
       * (implemented as a sibling div) can be positioned against it.
       * The wrapper itself does not clip overflow so the ring can expand outward.
       */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulsing ring — only rendered when active.
            Two rings staggered in time give a continuous breathing pulse.
            They sit behind the button via z-index and pointer-events:none. */}
        {isActive && (
          <>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '100%',
                borderRadius: '9999px',
                border: '2px solid #0071c7',
                animation: 'probe-pulse 2.5s ease-out infinite',
                animationDelay: '0s',
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '100%',
                borderRadius: '9999px',
                border: '2px solid #0071c7',
                animation: 'probe-pulse 2.5s ease-out infinite',
                animationDelay: '1.25s',
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* Button — pill shape, changes appearance between default and active states */}
        <button
          onClick={onToggle}
          aria-pressed={isActive}
          aria-label={isActive ? 'Probe mode active — click to deactivate' : 'Activate probe mode to check air quality'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: '9999px',
            border: isActive ? '2px solid #0071c7' : '2px solid transparent',
            background: isActive
              ? '#0071c7'
              : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: isActive ? '#ffffff' : '#0f1117',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: isActive
              ? '0 4px 20px rgba(0, 113, 199, 0.40)'
              : '0 2px 10px rgba(0,0,0,0.18)',
            transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <CrosshairIcon />
          {isActive ? 'Probe active — click map' : 'Check air quality'}
        </button>
      </div>
    </>
  )
}
