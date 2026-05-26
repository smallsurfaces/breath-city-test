/**
 * index.ts — barrel export for the Visual Concept v1 forked chrome.
 *
 * Purpose
 *   A single import surface for the forked BC chrome primitives so visual-concept pages can
 *   import from `./_chrome` rather than reaching into individual files inside the namespace.
 *   Mirrors the role of `@/components/concept/index.ts` for the shared chrome — the
 *   visual-concept sandbox has its OWN barrel so any future visual evolution stays self-
 *   contained inside `/visual-concepts/best-practice-roadmap-v1/_chrome/`.
 *
 *   Re-exports the forked chrome (config types + components), the forked layout/typography
 *   primitives, and the forked PrototypeHeader. The shared `@/components/concept` barrel is no
 *   longer imported by anything inside this visual-concept route — that is the contract this
 *   namespace enforces.
 *
 * Key exports: see the re-exports below.
 * External dependencies: the sibling modules in this folder.
 */

export type { BcChromeNavItem, BcChromeConfig } from './bc-chrome.config'

export { BcHeader, BcFooter } from './BcChrome'

export { ConceptHero } from './ConceptHero'
export { ConceptStat } from './ConceptStat'

export { PrototypeHeader } from './PrototypeHeader'
