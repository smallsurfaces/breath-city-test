/**
 * ConceptStat.tsx — Visual Concept v1 forked stat primitive (big number + label).
 *
 * Fork origin
 *   Clean fork of src/components/concept/ConceptStat.tsx (commit 09839c6 / tag
 *   wireframe-lock-2026-05-26). The fork exists so future visual evolution on stat
 *   typography/colour inside this sandbox cannot leak into the wireframe-locked UX concepts.
 *
 * Purpose (carried forward from shared)
 *   The shared "stat" primitive: a large tabular figure with a muted label, an optional
 *   leading icon, and an optional "Estimate" pill. Renders INNER CONTENT ONLY (no card surface).
 *
 * Caps & colour history
 *   Pass 1 (2026-05-26): value cap lifted to `clamp(2.5rem, 4vw, 4rem)` in BC Blue at 900,
 *     label muted dark-blue at 60%.
 *   Pass 2 (2026-05-27 — per brand-pass-2 brief §5):
 *     - Added `variant` prop ('light' | 'dark'). 'dark' (used by hero on BC Blue ground) flips
 *       value to white and label to white-70%. 'light' (default) keeps pass-1 BC Blue value /
 *       muted-dark-blue label.
 *
 *   The estimate pill (functional yellow) is unchanged across variants — it carries semantic
 *   meaning (this figure is a guesstimate) so its tone stays constant.
 *
 *   Typography calibration (2026-05-27, post-pass-3-v2):
 *     - Value weight dropped from `font-black` (Tailwind 900 = Söhne Extrafett) to
 *       `--bc-font-weight-extrabold` (700 = Söhne Fett). BC live's `.stat-amount` uses Fett
 *       (declared at slot 800 on the live site; same glyph outline as our 700 mapping).
 *       Requesting 800 directly would resolve to Extrafett 900 via CSS font-weight matching
 *       (closest-darker-first), which is the over-heavy character we're calibrating away from.
 *
 * Key exports: ConceptStat (named)
 * External dependencies: react (ReactNode).
 */

import type { ReactNode } from 'react'

/** Surface variant — 'light' (default, BC Blue value on white) or 'dark' (white value on BC Blue). */
export type ConceptStatVariant = 'light' | 'dark'

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
  /**
   * Surface variant. 'light' (default) = BC Blue value on white; 'dark' = white value on BC
   * Blue. Drives value and label colour.
   */
  variant?: ConceptStatVariant
}

/**
 * One stat block — icon/estimate-pill row → big tabular value → muted label. Inner content
 * only — wrap in ConceptCard for a carded stat. Variant-driven colour switch — caller passes
 * 'dark' when the stat sits on a BC Blue full-bleed section (hero row), 'light' (default)
 * for any white/light surface.
 */
export function ConceptStat({
  value,
  label,
  estimate,
  icon,
  className,
  variant = 'light',
}: ConceptStatProps) {
  const isDark = variant === 'dark'
  const showTopRow = icon !== undefined || estimate === true

  // Variant-driven colour resolutions — see file header for the full mapping.
  const valueColor = isDark
    ? 'var(--bc-color-white)'
    : 'var(--bc-color-blue)'
  const labelColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 70%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 60%, transparent)'

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
        className="mt-2 tracking-tight tabular-nums"
        style={{
          fontSize: 'clamp(2.5rem, 4vw, 4rem)',
          // Calibration 2026-05-27: was Tailwind `font-black` (900) — replaced with
          // --bc-font-weight-extrabold (700 = Söhne Fett) to match BC live's `.stat-amount`
          // character. Tailwind utility removed from className so this inline weight wins
          // unambiguously.
          fontWeight: 'var(--bc-font-weight-extrabold)',
          color: valueColor,
          lineHeight: 1.0,
        }}
      >
        {value}
      </div>
      <div
        className="mt-1 font-medium"
        style={{
          fontSize: 'var(--bc-font-size-body-smaller)',
          color: labelColor,
        }}
      >
        {label}
      </div>
    </div>
  )
}
