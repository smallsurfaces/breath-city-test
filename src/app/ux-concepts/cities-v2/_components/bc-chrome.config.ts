/**
 * bc-chrome.config.ts — co-located chrome config for the Cities (Resident Concerns) v2 concept.
 *
 * Purpose
 *   The shared BcHeader/BcFooter (from @/components/concept) is config-driven: the only thing that
 *   differs between concepts is which nav items are LIVE and where the brand mark / "Cities" slot
 *   point. This file holds that config for the Cities v2 concept, co-located in the concept folder
 *   so v2 owns its own chrome wiring (the shared bc-chrome.config.ts in @/components/concept ships
 *   only AQ_NETWORK_CHROME — per-concept configs that aren't yet promoted to the shared layer live
 *   beside their concept, exactly as this one does).
 *
 *   For the Cities concept, BC's "Cities" page IS this concept (the cities index), so the Cities
 *   slot — and the brand mark — both carry this concept's own home route. All other BC labels
 *   (Who we are / What we do / Why we do it / Voices / News) stay inert (href === '#') so the
 *   chrome still reads as BC's real site IA without inventing pages the prototype doesn't have.
 *
 *   Routes target the v2 route (`/ux-concepts/cities-v2`) so this v2 copy is fully self-contained.
 *
 * Difference from v1: v1 carried its own per-folder BcChrome.tsx copy with an inline NAV array
 *   (cities/_components/BcChrome.tsx). v2 deletes that copy and drives the SHARED BcChrome with
 *   this config instead — same nav set and live "Cities" slot, now pointed at the v2 route.
 *
 * Key exports: CITIES_CHROME (const)
 * External dependencies: @/components/concept (BcChromeConfig type)
 */

import type { BcChromeConfig } from '@/components/concept'

/**
 * Cities v2 chrome config — the brand mark and the live "Cities" slot both point at the v2 cities
 * index (`/ux-concepts/cities-v2`) so v2 is self-contained; every other BC label stays inert (`#`)
 * so the chrome still reads as BC's real IA with no dead-end navigation. Nav wording mirrors v1's
 * BcChrome NAV (Who we are / What we do / Why we do it / Cities / Voices / News).
 */
export const CITIES_CHROME: BcChromeConfig = {
  conceptLabel: 'Resident Concerns',
  logoHref: '/ux-concepts/cities-v2',
  nav: [
    { label: 'Who we are', href: '#' },
    { label: 'What we do', href: '#' },
    { label: 'Why we do it', href: '#' },
    { label: 'Cities', href: '/ux-concepts/cities-v2' },
    { label: 'Voices', href: '#' },
    { label: 'News', href: '#' },
  ],
}
