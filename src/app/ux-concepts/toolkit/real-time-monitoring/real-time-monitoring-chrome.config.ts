/**
 * real-time-monitoring-chrome.config.ts — chrome config for the JTBD City Toolkit
 * real-time monitoring component (rapid-prototype).
 *
 * Purpose
 *   Co-located per-component configuration for the shared BcHeader/BcFooter
 *   (@/components/concept BcChrome). Drives the site nav shown above the live map.
 *
 *   As of increment 2 there IS a toolkit landing (/ux-concepts/toolkit), so the brand mark points at
 *   it (the component's natural "up" destination) and a live "Toolkit" nav item links there too. A
 *   live "Dev hub" item links back to "/". The standard BC labels (Who we are / Why we do it /
 *   Voices / News) stay inert (href === '#'), shown but not clickable, so the chrome still reads as
 *   BC's real site IA without inventing pages.
 *
 *   Back-to-hub: BcChrome renders a nav item LIVE when href !== '#'. The live "Toolkit" and "Dev
 *   hub" items therefore render as clickable links in BOTH the desktop bar and the mobile overlay —
 *   the visible, always-present routes back the build brief requires (the page footer adds the same
 *   two links in-flow as well).
 *
 * Key exports: TOOLKIT_RT_CHROME (const)
 * External dependencies: @/components/concept (BcChromeConfig type)
 */

import type { BcChromeConfig } from '@/components/concept'

/**
 * Chrome config for the real-time monitoring component. The brand mark and a live "Toolkit" item
 * link to the toolkit landing; a live "Dev hub" item links back to "/". Every other BC label stays
 * inert (`#`).
 */
export const TOOLKIT_RT_CHROME: BcChromeConfig = {
  conceptLabel: 'City AQ Toolkit · Real-time monitoring',
  logoHref: '/ux-concepts/toolkit',
  nav: [
    { label: 'Toolkit', href: '/ux-concepts/toolkit' },
    { label: 'Dev hub', href: '/' },
    { label: 'Who we are', href: '#' },
    { label: 'Why we do it', href: '#' },
    { label: 'Voices', href: '#' },
  ],
}
