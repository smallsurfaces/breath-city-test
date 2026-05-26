/**
 * roadmap-chrome.config.ts — per-concept chrome config for Visual Concept v1: BC AQ Roadmap.
 *
 * Purpose
 *   Co-located BcChromeConfig for the visual concept v1 sandbox. The shared BcHeader takes this
 *   config so the nav items point at the visual-concepts routes, keeping the concept fully
 *   self-contained. The "Cities" slot and "Roadmap" slot are live; all other BC primary-nav labels
 *   remain inert (href === '#') so the chrome reads as BC's real IA without dead-end links.
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
 * Key exports: ROADMAP_CHROME (const)
 * External dependencies: @/components/concept (BcChromeConfig type)
 */

import type { BcChromeConfig } from '@/components/concept'

/**
 * Visual Concept v1 — BC AQ Roadmap chrome config. All live routes target the visual-concepts
 * path so the concept is self-contained. The brand mark and the "Roadmap" slot both point at the
 * visual concept overview; the "Cities" slot points at the visual concept cities listing.
 */
export const ROADMAP_CHROME: BcChromeConfig = {
  logoHref: '/visual-concepts/best-practice-roadmap-v1',
  nav: [
    { label: 'Who we are', href: '#' },
    { label: 'What we do', href: '#' },
    { label: 'Why we do it', href: '#' },
    { label: 'Cities', href: '/visual-concepts/best-practice-roadmap-v1/cities' },
    { label: 'Roadmap', href: '/visual-concepts/best-practice-roadmap-v1' },
    { label: 'Voices', href: '#' },
    { label: 'News', href: '#' },
  ],
}
