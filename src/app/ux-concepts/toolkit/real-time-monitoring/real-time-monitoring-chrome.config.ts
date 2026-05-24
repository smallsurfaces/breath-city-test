/**
 * real-time-monitoring-chrome.config.ts — chrome config for the JTBD City Toolkit
 * real-time monitoring component (rapid-prototype).
 *
 * Purpose
 *   Co-located per-component configuration for the shared BcHeader/BcFooter
 *   (@/components/concept BcChrome). Drives the site nav shown above the live map.
 *
 *   As of increment 2 there IS a toolkit landing (/ux-concepts/toolkit), so the brand mark points at
 *   it (the component's natural "up" destination) and a live "Toolkit" nav item links there too. The
 *   standard BC labels (Cities / Who we are / Why we do it / Voices) stay inert (href === '#'), shown
 *   but not clickable, so the chrome reads as BC's real site IA without inventing pages or leaking
 *   prototype scaffolding.
 *
 *   Back-to-hub: BcChrome renders a nav item LIVE when href !== '#'. The live "Toolkit" item renders
 *   as a clickable link in BOTH the desktop bar and the mobile overlay. The back-to-hub route is
 *   owned by the PrototypeHeader above this chrome and by the page footer (which links to the toolkit
 *   landing and the hub in-flow), so it is not duplicated as a "Dev hub" nav item.
 *
 * Key exports: TOOLKIT_RT_CHROME (const)
 * External dependencies: @/components/concept (BcChromeConfig type)
 */

import type { BcChromeConfig } from '@/components/concept'

/**
 * Chrome config for the real-time monitoring component. The brand mark and a live "Toolkit" item
 * link to the toolkit landing. Every other BC label stays inert (`#`). Back-to-hub is owned by the
 * PrototypeHeader above this chrome and by the page footer, so no live "Dev hub" nav item is needed
 * here.
 */
export const TOOLKIT_RT_CHROME: BcChromeConfig = {
  conceptLabel: 'City AQ Toolkit · Real-time monitoring',
  logoHref: '/ux-concepts/toolkit',
  nav: [
    { label: 'Toolkit', href: '/ux-concepts/toolkit' },
    { label: 'Cities', href: '#' },
    { label: 'Who we are', href: '#' },
    { label: 'Why we do it', href: '#' },
    { label: 'Voices', href: '#' },
  ],
}
