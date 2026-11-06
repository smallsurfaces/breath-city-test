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
 *   Pass 4 (2026-05-27 — five-item bundle, nav restore against BC live)
 *     Desktop nav restored from 3 -> 7 items to match the BC live site plus the new Roadmap
 *     slot:
 *       Who we are / What we do / Why we do it (caret) / Roadmap / Cities /
 *       Voices of Breathe Cities / News
 *
 *     Roadmap is the only live destination (it self-links to this page — the current visual
 *     concept overview is the BC AQ Roadmap), carrying the active-state cyan underline. The
 *     caret on "Why we do it" is a visual indicator only — there is no real dropdown behaviour
 *     wired (the live BC site has a multi-link dropdown there; the prototype shows the
 *     affordance without implementing it).
 *
 *     "Join Us" became "Join us" (lowercase u) — the live BC site uses lowercase.
 *
 *     Mobile overlay mirrors the desktop 7-item set for parity (was 5 items in pass 3 v2; the
 *     reduction was a follow-the-Figma decision that the live-site review reverses).
 *
 *     The live "Cities" route inside the prototype keeps its destination so the menu still
 *     reaches the cities listing inside this sandbox.
 *
 * Key exports: ROADMAP_CHROME (const)
 * External dependencies: ./_chrome (BcChromeConfig type — forked into the visual-concepts namespace
 *   so this concept has no remaining imports from the shared @/components/concept chrome)
 */

import type { BcChromeConfig } from './_chrome'

/** This page's own route, used so the Roadmap nav item self-links and carries the active state. */
const ROADMAP_HREF = '/visual-concepts/best-practice-roadmap-v1'

/**
 * Visual Concept v1 — BC AQ Roadmap chrome config. All live routes target the visual-concepts
 * path so the concept is self-contained. The brand mark points at the visual concept overview;
 * the "Cities" slot points at the visual concept cities listing; the "Roadmap" slot self-links
 * (current page IS the BC AQ Roadmap, so the nav item carries the active-state cyan underline).
 */
export const ROADMAP_CHROME: BcChromeConfig = {
  logoHref: ROADMAP_HREF,
  // Desktop nav — 7 items per pass-4 brief item 1. Order matches BC live, with Roadmap inserted
  // between "Why we do it" and "Cities". `hasCaret: true` triggers a small downward chevron
  // affordance after the label — visual indicator only, no dropdown behaviour wired (matches
  // the affordance the BC live nav uses on "Why we do it").
  nav: [
    { label: 'Who we are', href: '#' },
    { label: 'What we do', href: '#' },
    { label: 'Why we do it', href: '#', hasCaret: true },
    { label: 'Roadmap', href: ROADMAP_HREF },
    { label: 'Cities', href: '/visual-concepts/best-practice-roadmap-v1/cities' },
    { label: 'Voices of Breathe Cities', href: '#' },
    { label: 'News', href: '#' },
  ],
  // Mobile overlay nav — mirrors the desktop 7-item set per pass-4 brief item 1.
  mobileNav: [
    { label: 'Who we are', href: '#' },
    { label: 'What we do', href: '#' },
    { label: 'Why we do it', href: '#', hasCaret: true },
    { label: 'Roadmap', href: ROADMAP_HREF },
    { label: 'Cities', href: '/visual-concepts/best-practice-roadmap-v1/cities' },
    { label: 'Voices of Breathe Cities', href: '#' },
    { label: 'News', href: '#' },
  ],
}
