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
 * Caps
 *   The h1 is capped at `sm:text-4xl` — never larger — matching the reference homepage hero
 *   (`text-3xl sm:text-4xl`). This is deliberate: a concept hero must not introduce a bigger
 *   display size than the established hub scale. Future visual evolution may lift this cap
 *   inside this forked variant; the shared original stays put.
 *
 * Colour (resolved canonical)
 *   - Eyebrow (when present): brand blue, set inline as `var(--bc-color-blue)`.
 *   - Headline: `text-foreground`, which in globals.css resolves to --bc-semantic-text =
 *     --bc-color-dark-blue via the bridged shadcn semantic.
 *   - Body: `text-muted-foreground` (bridged), max-w-2xl, base size.
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
  /** The h1 headline (capped at sm:text-4xl). */
  headline: string
  /** The muted lead paragraph beneath the headline. */
  body: string
  /** Optional content rendered directly beneath the lead (hero-adjacent slot). */
  children?: ReactNode
}

/**
 * The hero block. Renders the optional eyebrow → h1 → lead, then the optional children slot.
 * The h1 size is fixed at text-3xl/sm:text-4xl (the cap); colour comes from bridged semantics
 * plus one inline brand-blue eyebrow token. When `eyebrow` is undefined, no eyebrow <p> is
 * rendered.
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
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {headline}
      </h1>
      <p className="max-w-2xl text-base text-muted-foreground">{body}</p>
      {children}
    </header>
  )
}
