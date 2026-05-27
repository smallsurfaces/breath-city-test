/**
 * SocialIcons.tsx — shared social-icon primitives for the v1 visual concept chrome.
 *
 * Purpose
 *   Pass 3 v2 (per chrome brief §3 delta 3, §4 delta 6) factors the SocialIconsRow helper out
 *   of BcChrome.tsx into a sibling module with TWO render modes:
 *
 *     'inline'    — inline-glyph treatment (carried over from pass-2 footer): currentColor
 *                   stroke/fill at 22px, white-at-75% inert / full white hover.
 *     'circular'  — BC-Blue circular button treatment (NEW): 36px circle with BC Blue
 *                   background and white glyph centred; hover lifts to BC Light Blue.
 *
 *   Both BcFooter (circular) and the mobile menu overlay (circular) consume from here so the
 *   two surfaces share the same icon primitives.
 *
 * Icon set
 *   X (Twitter), Instagram, Facebook — three icons, matching the live BC site's set on both
 *   desktop footer and mobile menu. LinkedIn from the pass-2 set drops (the live BC chrome
 *   doesn't include it in either surface per the Figma reference).
 *
 * Side note
 *   All icon hrefs are '#' (inert) — this is a prototype.
 *
 * Key exports: SocialIconsRow (named), SocialIconMode (type)
 * External dependencies: react (useState).
 */

'use client'

import { useState, type ReactNode } from 'react'

/** Render mode for the social-icon row. See file header for visual semantics per mode. */
export type SocialIconMode = 'inline' | 'circular'

/**
 * SocialIconsRow — three social icons in a row (X / Instagram / Facebook). `mode` selects
 * the visual treatment per the file-header semantics. `align` controls Flexbox justification.
 */
export function SocialIconsRow({
  mode,
  align = 'start',
  gap,
}: {
  mode: SocialIconMode
  align?: 'start' | 'center' | 'end'
  gap?: number
}) {
  const alignClass =
    align === 'center' ? 'justify-center' : align === 'end' ? 'justify-end' : 'justify-start'
  const gapValue = gap ?? (mode === 'circular' ? 12 : 16)
  return (
    <div
      className={`flex items-center ${alignClass}`}
      style={{ gap: `${gapValue}px` }}
    >
      <SocialIcon label="X" mode={mode}>
        {/* X / Twitter glyph */}
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </SocialIcon>
      <SocialIcon label="Instagram" mode={mode}>
        {/* Instagram glyph */}
        <g>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            ry="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </g>
      </SocialIcon>
      <SocialIcon label="Facebook" mode={mode}>
        {/* Facebook 'f' glyph */}
        <path d="M22 12a10 10 0 1 0-11.563 9.876v-6.987H7.898V12h2.539V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.261c-1.243 0-1.63.772-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.986A10.001 10.001 0 0 0 22 12z" />
      </SocialIcon>
    </div>
  )
}

/**
 * SocialIcon — one icon in either inline or circular treatment. Hover state stored in
 * component memory; React state hover acceptable on a low-instance helper.
 *
 * Inline:   22px viewBox-24 SVG, currentColor fill at 75% white inert / 100% hover.
 * Circular: 36px circle BC Blue ground, 18px glyph centred white. Hover lifts ground to BC
 *           Light Blue (matches BcPill variant A hover).
 */
function SocialIcon({
  label,
  mode,
  children,
}: {
  label: string
  mode: SocialIconMode
  children: ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  if (mode === 'circular') {
    return (
      <a
        href="#"
        aria-label={label}
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: '36px',
          height: '36px',
          backgroundColor: hovered
            ? 'var(--bc-color-light-blue)'
            : 'var(--bc-color-blue)',
          color: 'var(--bc-color-white)',
          transition: 'background-color 200ms ease',
        }}
        // Side effect: hover state drives bg swap via React re-render.
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          {children}
        </svg>
      </a>
    )
  }

  // Inline mode
  return (
    <a
      href="#"
      aria-label={label}
      style={{
        color: hovered
          ? 'var(--bc-color-white)'
          : 'color-mix(in srgb, var(--bc-color-white) 75%, transparent)',
        transition: 'color 200ms ease',
      }}
      // Side effect: hover state drives colour swap via React re-render.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {children}
      </svg>
    </a>
  )
}
