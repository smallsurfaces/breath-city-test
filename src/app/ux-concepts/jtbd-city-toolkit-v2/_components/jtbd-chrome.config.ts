/**
 * jtbd-chrome.config.ts — chrome config for the JTBD City Toolkit v2 concept.
 *
 * Purpose
 *   Co-located per-concept configuration for the shared BcHeader/BcFooter (BcChrome.tsx).
 *   The JTBD City Toolkit v2 occupies the "Cities" nav slot (the concept's own home route).
 *   All other BC nav labels remain inert (href === '#') — shown but not clickable — so the
 *   chrome reads as BC's real site IA with no dead-end navigation.
 *
 *   Following the aq-network-v2 pattern: config is co-located in the concept folder and
 *   re-exported from here so layout.tsx has a single, clear import.
 *
 * Key exports: JTBD_CHROME (const)
 * External dependencies: @/components/concept (BcChromeConfig type)
 */

import type { BcChromeConfig } from '@/components/concept'

/**
 * JTBD City Toolkit v2 chrome config. All live routes target the v2 route so the concept
 * is fully self-contained. The brand mark and the "Cities" slot both point at the v2 home;
 * every other BC label stays inert (`#`).
 */
export const JTBD_CHROME: BcChromeConfig = {
  conceptLabel: 'JTBD City Toolkit',
  logoHref: '/ux-concepts/jtbd-city-toolkit-v2',
  nav: [
    { label: 'Who we are', href: '#' },
    { label: 'Why we do it', href: '#' },
    { label: 'Cities', href: '/ux-concepts/jtbd-city-toolkit-v2' },
    { label: 'Voices', href: '#' },
    { label: 'News', href: '#' },
  ],
}
