/**
 * ConceptStat.tsx — Visual Concept v1 forked stat primitive (big number + label).
 *
 * Fork origin
 *   Clean fork of src/components/concept/ConceptStat.tsx (commit 09839c6 / tag
 *   wireframe-lock-2026-05-26). The fork exists so future visual evolution on stat
 *   typography/colour inside this sandbox cannot leak into the wireframe-locked UX concepts
 *   that depend on the shared original. First-deploy render is identical to the shared version.
 *
 * Purpose (carried forward from shared)
 *   The shared "stat" primitive: a large tabular figure with a muted label, an optional
 *   leading icon, and an optional "Estimate" pill. Renders INNER CONTENT ONLY (the icon/pill
 *   row, the value, the label). It does NOT draw a card surface — the caller wraps it in
 *   ConceptCard when a carded stat is wanted.
 *
 * Caps & functional colour (BC brand pass 1 — 2026-05-26)
 *   The text-3xl cap has been LIFTED for this forked variant per the brand-pass-1 brief §2 —
 *   the value now renders at `clamp(2.5rem, 4vw, 4rem)` in BC Blue at Söhne 900 (Extrafett),
 *   so the four hero stats read as the visual anchor of the page top.
 *   The `estimate` pill stays FUNCTIONAL — a soft yellow wash via color-mix on the BC yellow
 *   token. No emoji. The shared original at src/components/concept/ConceptStat.tsx stays put
 *   with its text-3xl cap and bridged-semantic colours.
 *
 * Styling (BC brand pass 1)
 *   Value: inline `var(--bc-color-blue)` at 900 weight + clamp font-size.
 *   Label: inline `color-mix(...dark-blue 60%, transparent)` at `--bc-font-size-body-smaller`
 *     and 500 weight (Söhne Kräftig); was bridged shadcn muted-foreground.
 *   Inline `style` with `var(--bc-*)` for the estimate pill's wash (unchanged). No `*-bc-*`
 *   utility classes; no hardcoded hex.
 *
 * Key exports: ConceptStat (named)
 * External dependencies: react (ReactNode).
 */

import type { ReactNode } from 'react'

/** Props for ConceptStat. */
type ConceptStatProps = {
  /** The figure to show (display string, e.g. "12" or "~$107 billion"). */
  value: string
  /** The muted caption beneath the value. */
  label: string
  /** When true, renders the functional yellow "Estimate" pill (flags a guesstimated figure). */
  estimate?: boolean
  /** Optional leading icon (rendered muted, aria-hidden) in the top row. */
  icon?: ReactNode
  /** Extra classes appended to the wrapper (layout/overrides only). */
  className?: string
}

/**
 * One stat block: an icon/estimate-pill row, the big tabular value (capped at text-3xl), and
 * the muted label. Inner content only — wrap in ConceptCard for a carded stat. The icon row
 * renders whenever an icon or the estimate pill is present.
 */
export function ConceptStat({
  value,
  label,
  estimate,
  icon,
  className,
}: ConceptStatProps) {
  const showTopRow = icon !== undefined || estimate === true

  return (
    <div className={className}>
      {showTopRow && (
        <div className="flex items-center justify-between gap-2">
          {icon !== undefined ? (
            <span className="text-muted-foreground" aria-hidden="true">
              {icon}
            </span>
          ) : (
            // Keep the estimate pill right-aligned even with no icon present.
            <span aria-hidden="true" />
          )}
          {estimate === true && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--bc-color-yellow) 30%, var(--bc-color-white))',
                color: 'var(--bc-semantic-text)',
              }}
            >
              Estimate
            </span>
          )}
        </div>
      )}
      <div
        className="mt-2 font-black tracking-tight tabular-nums"
        style={{
          fontSize: 'clamp(2.5rem, 4vw, 4rem)',
          color: 'var(--bc-color-blue)',
          lineHeight: 1.0,
        }}
      >
        {value}
      </div>
      <div
        className="mt-1 font-medium"
        style={{
          fontSize: 'var(--bc-font-size-body-smaller)',
          color: 'color-mix(in srgb, var(--bc-color-dark-blue) 60%, transparent)',
        }}
      >
        {label}
      </div>
    </div>
  )
}
