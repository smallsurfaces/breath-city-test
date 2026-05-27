/**
 * roadmap-chrome.config.ts — per-concept chrome config for Visual Concept v1: BC AQ Roadmap.
 *
 * Purpose
 *   Co-located BcChromeConfig for the visual concept v1 sandbox. The shared BcHeader takes this
 *   config so the nav items point at the visual-concepts routes, keeping the concept fully
 *   self-contained.
 *
 *   Fork origin
 *     This file is a fork of src/app/ux-concepts/best-practice-roadmap-v2/roadmap-chrome.config.ts
 *     (commit 09839c6 / tag wireframe-lock-2026-05-26). The fork exists so visual exploration on
 *     this concept cannot leak into the wireframe-locked UX concept. Only the routes and the
 *     constant identity differ at first deploy — visual evolution happens in subsequent sessions.
 *
 *   Naming
 *     Export name kept as ROADMAP_CHROME (dropping the "_V2" suffix, since this is the first
 *     visual concept v1, not a roadmap v2). The fork's layout.tsx imports it under this name.
 *
 *   Pass 3 v2 (2026-05-27 — per pass-3-v2 brief §3 + previous chrome brief §2 + §3)
 *     Desktop nav drops from 7 items to 3 ("Who we are", "What we do", "Why we do it") —
 *     matches the live BC site. Page identity is now carried by the hero headline, not by
 *     a nav highlight.
 *
 *     Mobile overlay carries a SEPARATE 5-item nav set ("Who we are", "What we do",
 *     "Why we do it", "Cities", "News") — adds Cities + News beyond the desktop set, per the
 *     live BC mobile menu. Roadmap + Voices + Join us dropped from mobile too.
 *
 *     The live "Cities" route inside the prototype keeps its destination so the mobile menu
 *     still reaches the cities listing inside this sandbox.
 *
 * Key exports: ROADMAP_CHROME (const)
 * External dependencies: ./_chrome (BcChromeConfig type — forked into the visual-concepts namespace
 *   so this concept has no remaining imports from the shared @/components/concept chrome)
 */

import type { BcChromeConfig } from './_chrome'

/**
 * Visual Concept v1 — BC AQ Roadmap chrome config. All live routes target the visual-concepts
 * path so the concept is self-contained. The brand mark points at the visual concept overview;
 * the "Cities" slot in the mobile nav points at the visual concept cities listing.
 */
export const ROADMAP_CHROME: BcChromeConfig = {
  logoHref: '/visual-concepts/best-practice-roadmap-v1',
  // Desktop nav — 3 items per pass-3-v2 brief §3 / previous chrome brief §2 delta 1.
  // All inert (href '#') — the prototype carries no destinations for Who/What/Why pages;
  // the renderer styles inert items at white-60% with cursor-default.
  nav: [
    { label: 'Who we are', href: '#' },
    { label: 'What we do', href: '#' },
    { label: 'Why we do it', href: '#' },
  ],
  // Mobile overlay nav — 5 items per pass-3-v2 brief §3 / previous chrome brief §3 delta 1.
  // Cities is live (prototype has the cities listing); News is inert.
  mobileNav: [
    { label: 'Who we are', href: '#' },
    { label: 'What we do', href: '#' },
    { label: 'Why we do it', href: '#' },
    { label: 'Cities', href: '/visual-concepts/best-practice-roadmap-v1/cities' },
    { label: 'News', href: '#' },
  ],
}
