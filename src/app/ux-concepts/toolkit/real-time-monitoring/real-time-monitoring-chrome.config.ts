/**
 * real-time-monitoring-chrome.config.ts — chrome config for the JTBD City Toolkit
 * real-time monitoring component (rapid-prototype).
 *
 * Purpose
 *   Co-located per-component configuration for the shared BcHeader/BcFooter
 *   (@/components/concept BcChrome). Drives the site nav shown above the live map.
 *
 *   This component is the single real-time-monitoring surface — there is no toolkit landing in
 *   scope — so the brand mark points at this route itself. The standard BC labels (Who we are /
 *   Why we do it / Voices / News) stay inert (href === '#'), shown but not clickable, so the
 *   chrome still reads as BC's real site IA without inventing pages.
 *
 *   Back-to-hub: BcChrome renders a nav item LIVE when href !== '#'. A "Dev hub" item pointing
 *   at "/" therefore renders as a clickable nav link in BOTH the desktop bar and the mobile
 *   overlay — the visible, always-present route back to the hub the build brief requires.
 *
 * Key exports: TOOLKIT_RT_CHROME (const)
 * External dependencies: @/components/concept (BcChromeConfig type)
 */

import type { BcChromeConfig } from '@/components/concept'

/**
 * Chrome config for the real-time monitoring component. The brand mark links to the component
 * route (no toolkit landing exists yet); a live "Dev hub" nav item links back to "/" so there is
 * always a visible way home. Every other BC label stays inert (`#`).
 */
export const TOOLKIT_RT_CHROME: BcChromeConfig = {
  conceptLabel: 'JTBD City Toolkit · Real-time monitoring',
  logoHref: '/ux-concepts/toolkit/real-time-monitoring',
  nav: [
    { label: 'Dev hub', href: '/' },
    { label: 'Who we are', href: '#' },
    { label: 'Why we do it', href: '#' },
    { label: 'Voices', href: '#' },
    { label: 'News', href: '#' },
  ],
}
