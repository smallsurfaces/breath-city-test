/**
 * ConceptHeroPlain.tsx — the concept hero WITHOUT the eyebrow tag.
 *
 * Purpose
 *   The concept-housekeeping pass drops the "[NAME] · CONCEPT" eyebrow from the roadmap, toolkit,
 *   and aq-network concept heroes (Jack's locked decision). The shared ConceptHero
 *   (@/components/concept/ConceptHero) requires an `eyebrow` prop and lives in design-system-keeper's
 *   domain (off-limits to this pass), so this LOCAL wrapper renders the same hero shape — h1 + lead +
 *   optional children — minus the eyebrow. It mirrors ConceptHero's exact markup and type-scale
 *   classes (header.space-y-3, h1 text-3xl/sm:text-4xl, lead max-w-2xl text-base) so the only visible
 *   difference from ConceptHero is the absent eyebrow.
 *
 *   Using one wrapper (rather than inlining the markup on each page) keeps the eyebrow-less hero
 *   single-sourced, so the type scale can't drift between the concepts that adopted it.
 *
 * FLAG (design-system-keeper)
 *   The clean fix is to make ConceptHero's `eyebrow` prop OPTIONAL (conditionally render the eyebrow
 *   element when present). Once that lands, every caller of this wrapper can return to <ConceptHero>
 *   with no eyebrow and this file can be deleted. It lives in src/app/_components (app-local), NOT in
 *   @/components/concept, per the housekeeping guardrail (new shared bits are local + flagged).
 *
 * Tokens
 *   Bridged shadcn semantics only (text-foreground, text-muted-foreground) → --bc-* in globals.css.
 *   No hardcoded hex. Light mode. No emoji.
 *
 * Key exports: ConceptHeroPlain (named).
 * External dependencies: react (ReactNode).
 */

import type { ReactNode } from 'react'

/** Props for ConceptHeroPlain — same as ConceptHero minus the eyebrow. */
type ConceptHeroPlainProps = {
  /** The h1 headline (capped at sm:text-4xl, matching ConceptHero). */
  headline: string
  /** The muted lead paragraph beneath the headline. */
  body: string
  /** Optional content rendered directly beneath the lead (hero-adjacent slot, e.g. a stat row). */
  children?: ReactNode
}

/**
 * The eyebrow-less hero block. Renders h1 → lead → optional children, matching ConceptHero's
 * spacing and type scale exactly (only the eyebrow is omitted).
 */
export function ConceptHeroPlain({
  headline,
  body,
  children,
}: ConceptHeroPlainProps) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {headline}
      </h1>
      <p className="max-w-2xl text-base text-muted-foreground">{body}</p>
      {children}
    </header>
  )
}
