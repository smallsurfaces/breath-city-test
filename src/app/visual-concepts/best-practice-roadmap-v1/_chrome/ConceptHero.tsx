/**
 * ConceptHero.tsx — Visual Concept v1 forked page hero primitive.
 *
 * Fork origin
 *   Clean fork of src/components/concept/ConceptHero.tsx (commit 09839c6 / tag
 *   wireframe-lock-2026-05-26). The fork exists so future visual evolution on hero
 *   typography/colour inside this sandbox cannot leak into the wireframe-locked UX concepts
 *   that depend on the shared original.
 *
 * Purpose (carried forward from shared)
 *   The shared hero block: an OPTIONAL small uppercase brand-blue eyebrow, a single h1
 *   headline, a muted lead paragraph, and an optional children slot beneath. Extracted from
 *   the AQ Network homepage header so every concept opens with the SAME hero shape at first
 *   deploy.
 *
 * Caps & colour history
 *   Pass 1 (2026-05-26): h1 cap LIFTED to `var(--bc-font-size-title-large)` (38→84px clamp),
 *     headline coloured dark blue at 900, body muted dark-blue at 70%. Eyebrow rendered BC
 *     Blue (light surfaces).
 *   Pass 2 (2026-05-27 — per brand-pass-2 brief §5, §9, §11):
 *     - Added `variant` prop ('light' | 'dark'). 'dark' is for the hero section on the BC
 *       Blue full-bleed ground — flips headline to white, body to white-85%, eyebrow to
 *       light-blue (cyan).
 *     - Added eyebrow underline (2px solid same-as-text, 4px offset) per brief §9 spec.
 *     - Added optional `cta` prop ({ label, href }) — when supplied, renders a BcPill (variant
 *       A on dark surfaces, B on light) beneath the body with pt-8 separation.
 *     - Lead body bumped to `--bc-font-size-title-sub` (was --bc-font-size-body) per brief §11
 *       so the hero lead carries more weight relative to inner-section body text.
 *   Typography calibration (2026-05-27, post-pass-3-v2):
 *     - Headline weight 900 (Extrafett) → 500 (Kräftig) via --bc-font-weight-medium. This
 *       matches BC live's `.font-titleLarge` rule (font-weight: 500), as defined in Arne's
 *       _tailwind.css and verified against the deployed BC site CSS. At 900 the headline read
 *       as "wrong font" because Söhne Extrafett's letterforms thicken and round visibly;
 *       Kräftig is BC's actual headline character — vertical, restrained, grotesque.
 *
 * Key exports: ConceptHero (named)
 * External dependencies: react (ReactNode), ./BcPill (CTA primitive)
 */

import type { ReactNode } from 'react'
import { BcPill } from './BcPill'

/** Surface variant — 'light' (default, dark text on white) or 'dark' (white text on BC Blue). */
export type ConceptHeroVariant = 'light' | 'dark'

/** Props for ConceptHero. */
type ConceptHeroProps = {
  /**
   * Optional small uppercase eyebrow above the headline. Variant-driven: BC Blue on light
   * surfaces, light-blue (cyan) on dark surfaces. When omitted, the eyebrow element is not
   * rendered.
   */
  eyebrow?: string
  /** The h1 headline. Rendered at --bc-font-size-title-large clamp. */
  headline: string
  /** The lead paragraph beneath the headline. Pass 2: rendered at --bc-font-size-title-sub. */
  body: string
  /** Optional content rendered directly beneath the lead (hero-adjacent slot). */
  children?: ReactNode
  /**
   * Surface variant. 'light' (default) = dark text on white; 'dark' = white text on BC Blue.
   * Drives headline / body / eyebrow colour and pill variant for the optional CTA.
   */
  variant?: ConceptHeroVariant
  /**
   * Optional CTA pill rendered beneath the body. Pass 2 addition per brief §5 — used by the
   * hero to anchor the composition with a clear action even when inert (the CTA is
   * composition, not function — inert hrefs like '#chapter-1' are fine).
   */
  cta?: { label: string; href: string }
}

/**
 * The hero block. Renders the optional eyebrow → h1 → lead → optional CTA, then the children
 * slot. Variant-driven colour switch — caller passes 'dark' when the hero sits on a BC Blue
 * full-bleed section, 'light' (default) for any white/light surface.
 */
export function ConceptHero({
  eyebrow,
  headline,
  body,
  children,
  variant = 'light',
  cta,
}: ConceptHeroProps) {
  const isDark = variant === 'dark'

  // Variant-driven colour resolutions — see file header for the full mapping.
  const eyebrowColor = isDark
    ? 'var(--bc-color-light-blue)'
    : 'var(--bc-color-blue)'
  const headlineColor = isDark
    ? 'var(--bc-color-white)'
    : 'var(--bc-color-dark-blue)'
  const bodyColor = isDark
    ? 'color-mix(in srgb, var(--bc-color-white) 85%, transparent)'
    : 'color-mix(in srgb, var(--bc-color-dark-blue) 70%, transparent)'

  // CTA variant — A (white pill) on dark surfaces; B (blue pill) on light surfaces.
  const ctaVariant = isDark ? 'A' : 'B'

  return (
    <header className="space-y-3">
      {eyebrow !== undefined && (
        <p
          className="inline-block uppercase tracking-wider"
          style={{
            fontSize: '13px',
            fontWeight: 'var(--bc-font-weight-semibold)',
            color: eyebrowColor,
            // Underline 2px solid same-colour-as-text, 4px below. Per brief §9.
            textDecoration: 'underline',
            textDecorationThickness: '2px',
            textUnderlineOffset: '4px',
            textDecorationColor: eyebrowColor,
          }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className="tracking-tight"
        style={{
          fontSize: 'var(--bc-font-size-title-large)',
          // Calibration 2026-05-27: 900 → 500 to match BC live's `.font-titleLarge` weight.
          fontWeight: 'var(--bc-font-weight-medium)',
          color: headlineColor,
          lineHeight: 'var(--bc-line-height-title-large)',
        }}
      >
        {headline}
      </h1>
      <p
        className="max-w-2xl leading-relaxed"
        style={{
          fontSize: 'var(--bc-font-size-title-sub)',
          color: bodyColor,
        }}
      >
        {body}
      </p>
      {cta && (
        <div className="pt-8">
          <BcPill
            label={cta.label}
            href={cta.href}
            variant={ctaVariant}
            size="standard"
          />
        </div>
      )}
      {children}
    </header>
  )
}
