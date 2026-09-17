/**
 * bc-chrome.config.ts — per-concept BC chrome types for the Visual Concept v1 sandbox.
 *
 * Fork origin
 *   Clean fork of src/components/concept/bc-chrome.config.ts (commit 09839c6 / tag
 *   wireframe-lock-2026-05-26). The fork exists so future visual evolution on this concept
 *   cannot leak into the wireframe-locked UX concepts that depend on the shared chrome types.
 *   First-deploy render and type surface are identical to the shared original.
 *
 *   Only the types (BcChromeNavItem, BcChromeConfig) are exported here — the
 *   AQ_NETWORK_CHROME const is NOT re-exported because it belongs to a different concept and
 *   isn't used inside this sandbox. The visual concept's own ROADMAP_CHROME lives next door
 *   in ../roadmap-chrome.config.ts and imports BcChromeConfig from this file.
 *
 * Purpose (carried forward from shared)
 *   The forked BcHeader (in ./BcChrome.tsx) is a single, reusable recreation of Breathe Cities'
 *   real site chrome for the visual concept. What differs BETWEEN concept prototypes is only
 *   which nav items are LIVE and where the brand mark / "Cities" slot point. This file holds
 *   that per-concept config TYPES as data shapes, so one local BcHeader can serve future visual
 *   concept routes by taking a config prop.
 *
 * Key exports: BcChromeNavItem (type), BcChromeConfig (type)
 * External dependencies: none.
 */

/**
 * One primary-nav entry. `href === '#'` marks an INERT label (a real BC nav item the prototype
 * does not implement) — the renderer derives "live" from `href !== '#'` and styles/links
 * accordingly, so an inert item is shown but not clickable (no dead-end navigation).
 *
 * `hasCaret` (pass 4, 2026-05-27) renders a small downward chevron after the label to indicate
 * the item is a dropdown parent on the BC live site. Visual indicator only — no actual dropdown
 * behaviour is wired in the prototype.
 */
export type BcChromeNavItem = {
  /** The visible nav label (BC's real primary-nav wording). */
  label: string
  /** The route this item links to, or '#' to mark it inert (shown, not clickable). */
  href: string
  /** Render a downward chevron after the label (BC dropdown affordance, visual only). */
  hasCaret?: boolean
}

/**
 * Per-concept chrome configuration. Carries where the brand mark (logo) links and the
 * primary-nav sets for header + mobile overlay. The footer is static and takes none.
 *
 * Pass 3 v2 (2026-05-27) — split nav into desktop `nav` (3 items: Who/What/Why) and mobile
 * `mobileNav` (5 items: Who/What/Why + Cities + News). The live BC site uses different nav
 * sets per breakpoint and we now mirror that.
 */
export type BcChromeConfig = {
  /** Where the brand logo links — the concept's own home route. */
  logoHref: string
  /** Desktop header nav set — 3 items per pass-3-v2 chrome brief §2. */
  nav: BcChromeNavItem[]
  /** Mobile overlay nav set — 5 items per pass-3-v2 chrome brief §3. Falls back to `nav`
   *  when omitted so legacy configs still render the overlay with the same items. */
  mobileNav?: BcChromeNavItem[]
}
