/**
 * index.ts — barrel export for the Visual Concept v1 forked chrome.
 *
 * Purpose
 *   A single import surface for the forked BC chrome primitives so visual-concept pages can
 *   import from `./_chrome` rather than reaching into individual files. Mirrors the role of
 *   `@/components/concept/index.ts` for the shared chrome — the visual-concept sandbox has its
 *   OWN barrel so any future visual evolution stays self-contained inside
 *   `/visual-concepts/best-practice-roadmap-v1/_chrome/`.
 *
 *   Pass 2 (2026-05-27) additions per brand-pass-2 brief: BcPill (universal CTA), BcNewsletter
 *   (mint signup strip split out of BcFooter), BcGraphics (Wind / Window inline SVG primitives
 *   + composite layouts for hero, stage accent, footer top edge).
 *
 * Key exports: see the re-exports below.
 * External dependencies: the sibling modules in this folder.
 */

export type { BcChromeNavItem, BcChromeConfig } from './bc-chrome.config'

// Pass 1 — forked chrome primitives
export { BcHeader, BcFooter, BcNewsletter } from './BcChrome'
export { ConceptHero } from './ConceptHero'
export type { ConceptHeroVariant } from './ConceptHero'
export { ConceptStat } from './ConceptStat'
export type { ConceptStatVariant } from './ConceptStat'
export { PrototypeHeader } from './PrototypeHeader'

// Pass 2 — new CTA + graphic primitives
export { BcPill } from './BcPill'
export type { BcPillVariant, BcPillSize } from './BcPill'
export {
  WindShape,
  Window01,
  Window02,
  Window03,
  Window04,
  Window05,
  HeroWindComposition,
  WindAccent,
  FooterWindowsStrip,
} from './BcGraphics'
