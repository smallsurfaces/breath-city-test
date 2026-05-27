/**
 * BcPill.tsx — Visual Concept v1 reusable pill-button primitive (BC brand pass 2).
 *
 * Purpose
 *   Single source of truth for the BC pill CTA shape across the v1 visual concept. Per the
 *   brand-pass-2 brief §8, the BC site uses pill-shaped buttons with a trailing arrow as the
 *   universal CTA. Pass 1 had pill CTAs only inside chrome; pass 2 promotes the pill pattern
 *   wherever a CTA appears (header "Join us", hero "Read the roadmap", per-card "Explore",
 *   newsletter "Sign up"). Centralising the pill makes future hover/state edits a single-file
 *   change.
 *
 * Variants (per brief §8)
 *   A — White pill on BC Blue ground (header, hero, dark card surfaces).
 *       Background white, text BC Blue. Hover: background light-blue, text stays BC Blue.
 *   B — Blue pill on white/light ground (card Explore on light surfaces, newsletter submit).
 *       Background BC Blue, text white. Hover: background blue-darker, text stays white.
 *   C — White pill on a dark CARD surface (BC Blue card variant).
 *       Renders identical to A — kept as a distinct variant name in case future iterations
 *       split card pills from header pills (e.g. different padding). Today A and C produce
 *       the same DOM; the variant name documents the intent at the call site.
 *
 * Sizes
 *   'standard' (default) — 15px text, px-6 py-3
 *   'small'              — 14px text, px-4 py-2
 *
 * Trailing arrow
 *   Inline SVG, currentColor stroke, 16px (standard) / 14px (small). The arrow is the BC CTA
 *   marker — every pill ships with one unless `showArrow={false}` is explicitly passed.
 *
 * Implementation notes
 *   - Uses inline `style` for BC tokens (per pass-1 convention; no `bg-bc-*` utilities).
 *   - Hover swap is done via `onMouseEnter` / `onMouseLeave` React state (light prototype
 *     pattern — keeps the component self-contained without adding a CSS rule). React state
 *     handles hover transitions at acceptable cost for a low-instance-count component on a
 *     content page (header CTA + hero CTA + 11 card CTAs + newsletter submit = ~14
 *     instances). If usage grows, lift to a single CSS class with `:hover` selectors.
 *   - Rendered as an `<a>` when `href` is provided (most common), or a `<button>` for the
 *     newsletter submit. The `as` prop selects.
 *
 * Key exports: BcPill (named)
 * External dependencies: react (useState), next/link (when rendered as a link).
 */

'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import type { CSSProperties } from 'react'

/** BcPill variant set — see file-header for visual semantics per variant. */
export type BcPillVariant = 'A' | 'B' | 'C'

/** BcPill size set — controls padding and text size. */
export type BcPillSize = 'standard' | 'small'

interface BcPillProps {
  /** Visible CTA copy. */
  label: string | ReactNode
  /** Link target. When 'as' is 'button' this is ignored. */
  href?: string
  /** Render as link (default) or button. Buttons used for form submission (newsletter). */
  as?: 'link' | 'button'
  /** Pill colour variant — see BcPillVariant docs. */
  variant: BcPillVariant
  /** Pill size — standard (default) or small. */
  size?: BcPillSize
  /** Render the trailing arrow icon. Default true. */
  showArrow?: boolean
  /** Optional extra classes appended to the wrapper (layout overrides only). */
  className?: string
  /** Button type (only meaningful when as='button'). Defaults to 'button'. */
  type?: 'button' | 'submit' | 'reset'
  /** Optional click handler (only meaningful when as='button'). */
  onClick?: () => void
  /** ARIA label for icon-only or screen-reader contexts. */
  ariaLabel?: string
}

/**
 * Inline arrow SVG — copy-paste safe across pill variants, currentColor stroke so the variant's
 * text colour drives the arrow tone. Sized at 14px (small) or 16px (standard).
 */
function ArrowIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

/**
 * Resolve the background/text colour pair for a given (variant, hovered) combination. Returns
 * an object with `backgroundColor` and `color` CSSProperties values resolved to BC tokens.
 * Variants A and C currently produce identical results; the function distinguishes them so
 * future iterations can diverge them without touching call sites.
 */
function resolveColours(
  variant: BcPillVariant,
  hovered: boolean,
): { backgroundColor: string; color: string } {
  switch (variant) {
    case 'A':
    case 'C':
      return hovered
        ? {
            backgroundColor: 'var(--bc-color-light-blue)',
            color: 'var(--bc-color-blue)',
          }
        : {
            backgroundColor: 'var(--bc-color-white)',
            color: 'var(--bc-color-blue)',
          }
    case 'B':
      return hovered
        ? {
            backgroundColor: 'var(--bc-color-blue-darker)',
            color: 'var(--bc-color-white)',
          }
        : {
            backgroundColor: 'var(--bc-color-blue)',
            color: 'var(--bc-color-white)',
          }
  }
}

/**
 * BcPill — the BC universal CTA shape. Renders a rounded-full pill with optional trailing arrow
 * icon, in one of three variants (white-on-blue / blue-on-white / white-on-blue-card). Hover
 * state swaps colours per the brief §8 spec. As default it renders an `<a>` via next/link; pass
 * `as="button"` for a `<button>` (e.g. newsletter submit).
 */
export function BcPill({
  label,
  href,
  as = 'link',
  variant,
  size = 'standard',
  showArrow = true,
  className,
  type = 'button',
  onClick,
  ariaLabel,
}: BcPillProps) {
  // Side effect: hover state stored in component memory so colours can swap without a CSS rule.
  const [hovered, setHovered] = useState(false)

  const { backgroundColor, color } = resolveColours(variant, hovered)
  const paddingY =
    size === 'small' ? 'var(--bc-pill-padding-y-sm)' : 'var(--bc-pill-padding-y)'
  const paddingX =
    size === 'small' ? 'var(--bc-pill-padding-x-sm)' : 'var(--bc-pill-padding-x)'
  const fontSize = size === 'small' ? '14px' : '15px'
  const arrowSize = size === 'small' ? 14 : 16

  const style: CSSProperties = {
    backgroundColor,
    color,
    borderRadius: 'var(--bc-pill-radius)',
    paddingTop: paddingY,
    paddingBottom: paddingY,
    paddingLeft: paddingX,
    paddingRight: paddingX,
    fontSize,
    fontWeight: 'var(--bc-font-weight-semibold)',
    letterSpacing: '-0.01em',
    transition: 'background-color 200ms ease, color 200ms ease',
  }

  const inner = (
    <>
      <span>{label}</span>
      {showArrow && <ArrowIcon size={arrowSize} />}
    </>
  )

  const classes = `inline-flex items-center justify-center gap-2 ${className ?? ''}`.trim()

  // Branch — render as <a> via next/link, or as a <button>.
  if (as === 'button') {
    return (
      <button
        type={type}
        onClick={onClick}
        aria-label={ariaLabel}
        className={classes}
        style={style}
        // Side effect: hover state mutates colours via React re-render.
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {inner}
      </button>
    )
  }

  return (
    <Link
      href={href ?? '#'}
      aria-label={ariaLabel}
      className={classes}
      style={style}
      // Side effect: hover state mutates colours via React re-render.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {inner}
    </Link>
  )
}
