/**
 * ConceptHero.tsx — Visual Concept v1 forked page hero primitive.
 *
 * Fork origin
 *   Clean fork of src/components/concept/ConceptHero.tsx (commit 09839c6 / tag
 *   wireframe-lock-2026-05-26). The fork exists so future visual evolution on hero
 *   typography/colour inside this sandbox cannot leak into the wireframe-locked UX concepts
 *   that depend on the shared original. First-deploy render is identical to the shared version.
 *
 * Purpose (carried forward from shared)
 *   The shared hero block: an OPTIONAL small uppercase brand-blue eyebrow, a single h1
 *   headline, a muted lead paragraph, and an optional children slot beneath (for hero-adjacent
 *   content the page wants directly under the lead). Extracted from the AQ Network homepage
 *   header so every concept opens with the SAME hero shape and type scale at first deploy.
 *
 *   The eyebrow is OPTIONAL — when omitted, the hero renders headline + body + children with
 *   no eyebrow element in the DOM.
 *
 * Caps (BC brand pass 1 — 2026-05-26)
 *   The h1 cap (`text-3xl sm:text-4xl`) has been LIFTED for this forked variant per the
 *   brand-pass-1 brief §2 — the headline now opens at `var(--bc-font-size-title-large)`
 *   (responsive 38 → 84px via clamp) so the page opens at confident editorial scale.
 *   The shared original at src/components/concept/ConceptHero.tsx stays put with its cap.
 *
 * Colour (BC brand pass 1 — 2026-05-26)
 *   - Eyebrow (when present): brand blue, set inline as `var(--bc-color-blue)`.
 *   - Headline: inline `var(--bc-color-dark-blue)` at Söhne 900 weight — was bridged
 *     foreground; promoted per brief §3 so the editorial weight comes from typography.
 *   - Body: inline muted dark-blue at 70% (`color-mix` over dark-blue token) — was
 *     bridged muted-foreground; promoted per brief §3 so brand opacity is consistent.
 *   No `*-bc-*` utility classes; no hardcoded hex.
 *
 * Key exports: ConceptHero (named)
 * External dependencies: react (ReactNode).
 */

import type { ReactNode } from 'react'

/** Props for ConceptHero. */
type ConceptHeroProps = {
  /**
   * Optional small uppercase eyebrow above the headline (brand blue). When omitted, the eyebrow
   * element is not rendered — the hero opens with the h1.
   */
  eyebrow?: string
  /** The h1 headline (BC brand pass 1: rendered at --bc-font-size-title-large, cap lifted). */
  headline: string
  /** The muted lead paragraph beneath the headline (BC brand pass 1: muted dark-blue at 70%). */
  body: string
  /** Optional content rendered directly beneath the lead (hero-adjacent slot). */
  children?: ReactNode
}

/**
 * The hero block. Renders the optional eyebrow → h1 → lead, then the optional children slot.
 *
 * BC brand pass 1 (2026-05-26): the h1 cap is lifted — size now bound to
 * `var(--bc-font-size-title-large)` (responsive 38 → 84px). h1 colour and weight are now
 * set inline to `var(--bc-color-dark-blue)` and 900 (Söhne Extrafett) so the editorial
 * weight is consistent across the page. Body paragraph is now muted dark-blue at 70%
 * (color-mix) rather than the bridged shadcn muted-foreground, so the brand opacity is
 * consistent. The eyebrow (when present) is unchanged — already BC Blue.
 */
export function ConceptHero({
  eyebrow,
  headline,
  body,
  children,
}: ConceptHeroProps) {
  return (
    <header className="space-y-3">
      {eyebrow !== undefined && (
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--bc-color-blue)' }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className="tracking-tight"
        style={{
          fontSize: 'var(--bc-font-size-title-large)',
          fontWeight: 'var(--bc-font-weight-black)',
          color: 'var(--bc-color-dark-blue)',
          lineHeight: 'var(--bc-line-height-title-large)',
        }}
      >
        {headline}
      </h1>
      <p
        className="max-w-2xl leading-relaxed"
        style={{
          fontSize: 'var(--bc-font-size-body)',
          color: 'color-mix(in srgb, var(--bc-color-dark-blue) 70%, transparent)',
        }}
      >
        {body}
      </p>
      {children}
    </header>
  )
}
