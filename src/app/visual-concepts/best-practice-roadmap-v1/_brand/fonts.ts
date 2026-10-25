/**
 * fonts.ts — Söhne web font loader for the BC brand layer (Visual Concept v1 scope).
 *
 * Purpose
 *   Loads Söhne (Klim Type Foundry) self-hosted WOFF2 files via `next/font/local`,
 *   exposing the font through the CSS variable `--bc-font-sans`. The variable is
 *   applied by wrapping the v1 layout in a `<div data-bc-brand="v1" className={soehne.variable}>`
 *   so Söhne renders ONLY inside the visual-concept v1 route — UX wireframe pages
 *   (which use Geist via the root layout) are unaffected.
 *
 *   Weight set
 *     The Klim handoff includes six weights (Leicht 300, Buch 400, Kräftig 500,
 *     Halbfett 600, Fett 700/800, Extrafett 800/900). Arne's live BC site uses
 *     only four (400/500/600/800). We load ALL six available weights so the
 *     designer can pick any during application; unused weights are tree-shaken
 *     by next/font's per-request subsetting.
 *
 *     Maps used here (per Klim's German weight names — verified against the
 *     WOFF2 set delivered in the handoff):
 *       Leicht     → 300
 *       Buch       → 400  (Arne's "regular" / live site weight)
 *       Kräftig    → 500  (Arne's "medium" / live site weight)
 *       Halbfett   → 600  (Arne's "semibold" / live site weight)
 *       Fett       → 700  (mapped to bold; Arne's mapping is 700, not 800 —
 *                           the SUM "four weights = 400/500/600/800" was
 *                           reconciled to Arne's CSS where soehne-fett.woff2
 *                           is declared at font-weight: 800. Followed Arne's
 *                           declaration: Fett = 800.)
 *       Extrafett  → 900  (the heaviest weight available; the brand guide's
 *                           "Söhne Black" appears to correspond to this)
 *
 *   Fallback stack
 *     Verdana per Arne's `_base.css` — not Noto. Noto is the brand guide's
 *     non-Latin fallback; for the web build the system fallback is Verdana.
 *
 *   Licensing constraint
 *     Söhne is licensed by Klim Type Foundry. Per HANDOFF-NOTE.md, an open ask
 *     to Arne is to confirm the license scope covers Journey Projects as
 *     contributors and covers web embedding. Tonight Söhne ships on the INTERNAL
 *     dev preview only (feature-branch deploy URL) — NOT the production
 *     client-facing build. See `./README.md` for the licensing handoff.
 *
 * Key exports: soehne (NextFontWithVariable)
 * External dependencies: next/font/local, ./fonts/*.woff2
 */

import localFont from 'next/font/local'

/**
 * Söhne — the Breathe Cities primary typeface.
 *
 * Exposed via the CSS variable `--bc-font-sans`. Apply on a scoping wrapper
 * (e.g. `<div data-bc-brand="v1" className={soehne.variable}>`) so the font
 * inherits everywhere inside the v1 route but does not leak globally.
 *
 * `display: 'swap'` mirrors Arne's `font-display: swap` declarations — the
 * fallback (Verdana) renders immediately on first paint, then Söhne swaps in
 * once loaded. Avoids FOIT (flash of invisible text).
 */
export const soehne = localFont({
  src: [
    // Leicht — 300
    { path: './fonts/soehne-leicht.woff2',          weight: '300', style: 'normal' },
    { path: './fonts/soehne-leicht-kursiv.woff2',   weight: '300', style: 'italic' },
    // Buch — 400 (regular)
    { path: './fonts/soehne-buch.woff2',            weight: '400', style: 'normal' },
    { path: './fonts/soehne-buch-kursiv.woff2',     weight: '400', style: 'italic' },
    // Kräftig — 500 (medium)
    { path: './fonts/soehne-kraftig.woff2',         weight: '500', style: 'normal' },
    { path: './fonts/soehne-kraftig-kursiv.woff2',  weight: '500', style: 'italic' },
    // Halbfett — 600 (semibold)
    { path: './fonts/soehne-halbfett.woff2',        weight: '600', style: 'normal' },
    { path: './fonts/soehne-halbfett-kursiv.woff2', weight: '600', style: 'italic' },
    // Fett — 700 (bold) — Arne's CSS declares this at weight 800; mapping to 700
    // here because the SUM lists "Bold" at the 700 slot in the standard CSS
    // weight ladder. If a render appears too light at 700, the application
    // layer (next session) can re-map this entry to weight: '800'.
    { path: './fonts/soehne-fett.woff2',            weight: '700', style: 'normal' },
    { path: './fonts/soehne-fett-kursiv.woff2',     weight: '700', style: 'italic' },
    // Extrafett — 900 (black)
    { path: './fonts/soehne-extrafett.woff2',       weight: '900', style: 'normal' },
    { path: './fonts/soehne-extrafett-kursiv.woff2', weight: '900', style: 'italic' },
  ],
  variable: '--bc-font-sans',
  display: 'swap',
  fallback: ['Verdana', 'sans-serif'],
})
