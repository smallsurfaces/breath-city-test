# BC Brand Foundation — Visual Concept v1 scope

Bootstrapped 2026-05-26 ahead of the client presentation tonight. Lives inside the v1 fork only; **migrates to `src/systems/bc-brand/` after the presentation**.

## What's here

```
_brand/
  fonts.ts              ← next/font/local loader for Söhne (all 6 weights)
  fonts/                ← 12 Söhne WOFF2 files (6 weights × 2 styles)
  tokens.css            ← BC token set, scoped to [data-bc-brand="v1"]
  graphics/
    wind/               ← Wind icon (SVG preferred, PNG fallback)
    windows/            ← Window01–Window05 (SVG preferred, PNG fallback)
    windows-wind/       ← (empty — see "Composite assets" below)
  index.ts              ← Barrel — exports `soehne`
  README.md             ← This file
```

## How brand application works inside the v1 route

The v1 layout (`../layout.tsx`) wraps every page in:

```tsx
<div data-bc-brand="v1" className={soehne.variable}>
  …
</div>
```

This gives the entire v1 subtree:

- The `[data-bc-brand="v1"]` selector for all token declarations in `tokens.css`
- The `--bc-font-sans` CSS variable, bound to the next/font-loaded Söhne family

**UX wireframe routes (`/ux-concepts/...`) do not receive the wrapper.** They continue to render with the root layout's Geist font and untouched defaults. Token scope is folder-based tonight; theme-provider scoping comes after migration.

## How to apply brand values in styles

### BC Blue (primary brand colour)

```css
/* Inside a v1-scoped style block */
.cta {
  background-color: var(--bc-brand);          /* semantic alias for BC Blue */
  /* or */
  background-color: var(--bc-color-blue);     /* primitive */
}
```

In Tailwind, prefer the arbitrary-value bracket syntax for now (no Tailwind theme extension tonight — would require touching the shared config):

```tsx
<button className="bg-[var(--bc-brand)] text-[var(--bc-color-white)]">
  Read the roadmap
</button>
```

### Söhne typography

The font binds globally inside the v1 scope, so `font-family` does not need to be re-declared. Pick weights as needed:

```css
.section-title {
  font-family: var(--bc-font-sans);              /* defensive — already inherited */
  font-weight: var(--bc-font-weight-medium);     /* 500 — Söhne Kräftig */
  font-size: var(--bc-font-size-title-large);    /* responsive 38 → 84px via clamp */
  line-height: var(--bc-line-height-title-large);
}
```

Available weights:

| Token | Value | Söhne name |
|---|---|---|
| `--bc-font-weight-regular`  | 400 | Buch |
| `--bc-font-weight-medium`   | 500 | Kräftig |
| `--bc-font-weight-semibold` | 600 | Halbfett |
| `--bc-font-weight-bold`     | 700 | Fett |
| `--bc-font-weight-black`    | 900 | Extrafett |

Plus a 300 (Leicht) weight is loaded but not aliased — use `font-weight: 300` directly if needed.

### Regional accents

Apply per-city or per-region accents via the runtime `--bc-region-color` variable. Set it at a closer scope (e.g. on a city card) so descendants pick it up:

```tsx
<article style={{ '--bc-region-color': 'var(--bc-color-region-africa)' } as React.CSSProperties}>
  <h2 className="bc-underline">Accra</h2>
</article>
```

Regional colour tokens:

| Region | Token | Value |
|---|---|---|
| Africa         | `--bc-color-region-africa`        | `#2DCDB0` (bespoke; matches `mint` in Arne's code) |
| Asia-Pacific   | `--bc-color-region-asia-pacific`  | `#F357CA` (= fuchsia) |
| Latin America  | `--bc-color-region-latin-america` | `#03AB3D` (= rich green) |
| Europe         | `--bc-color-region-europe`        | `#F55200` (= tangerine) |

## How to reference graphic assets

Assets are colocated in `_brand/graphics/`. Import the SVG directly through Next.js's image pipeline or render inline `<img>` / `<Image>` tags. Path examples (from anywhere inside the v1 route):

```tsx
import Image from 'next/image'
import windSvg from './_brand/graphics/wind/wind.svg'

<Image src={windSvg} alt="Wind motif" width={200} height={120} />
```

If using as `<img src>` directly, Next.js will not optimise it — prefer the import-and-`<Image>` pattern.

Available SVG (preferred) + PNG (fallback) assets:

| Asset | SVG | PNG |
|---|---|---|
| Wind icon       | `wind/wind.svg`           | `wind/wind.png` |
| Window 01       | `windows/window-01.svg`   | `windows/window-01.png` |
| Window 02       | `windows/window-02.svg`   | `windows/window-02.png` |
| Window 03       | `windows/window-03.svg`   | `windows/window-03.png` |
| Window 04       | `windows/window-04.svg`   | `windows/window-04.png` |
| Window 05       | `windows/window-05.svg`   | `windows/window-05.png` |

### Composite assets (Windows + Wind)

The brand handoff delivers the 5 Windows+Wind composites as `.ai` and `.pdf` only — no SVG or PNG. They are NOT included in `graphics/windows-wind/` tonight. Options:

1. Export PNG/SVG from the source PDFs at the design layer (Figma/Illustrator) and drop into `windows-wind/` in a future session
2. Compose them at runtime by layering individual Wind + Window SVGs (recommended — preserves regional colour theming via SVG fills)

Flagged for design-director attention in the next session.

## Brand-guide gaps and how the keeper resolved them

The 2026 Brand Guidelines do not specify the following. Resolutions sourced from Arne's `code/` files (live-site WordPress build). See the canonical reference: [Breathe Cities Brand Guidelines - 2026 — SUM.md](../../../../../../../resources/brand-handoff-from-ahoy/Breathe%20Cities%20Brand%20Guidelines%20-%202026%20%E2%80%94%20SUM.md) §"What the brand guide does NOT specify".

| # | Gap | Resolution |
|---|---|---|
| 1 | Type scale (sizes, line heights, responsive) | `clamp()` ramp in `tokens.css` derived from Arne's `_base.css` (`@screen sm`=780, `wide`=1600) |
| 2 | Semantic colour token names | Arne's `_colors.css` aliases (`--bc-brand`, `--bc-text`, `--bc-error`, `--bc-success` etc.) |
| 3 | Spacing scale | Arne's `tailwind.config.js` (`xs=10` → `max=200`); also in global Style Dictionary |
| 4 | Breakpoint scale | Arne's `tailwind.config.js` exposed as CSS vars |
| 5 | Button system variants | NOT bootstrapped tonight (would require chrome restyle — parked for design-director session) |
| 6 | Interaction-state colours | `--bc-color-blue-darker` (#002A5B) + `--bc-color-blue-pressed` (#059ECF) from Arne |
| 7 | `--region-color` mechanic | Token name `--bc-region-color` declared with `currentColor` default; components override at closer scope |
| 8 | Aeonik Mono | NOT bootstrapped tonight (not delivered; license/substitute decision needed) |
| 9 | City icons | NOT bootstrapped tonight (must be extracted from live breathecities.org) |
| 10 | Letterhead / social templates | Out of scope for the web build |

## Licensing — Söhne

**Söhne is a commercial typeface from Klim Type Foundry.** Tonight's bootstrap ships Söhne on the **internal dev preview only** (the feature-branch Netlify preview URL — `deploy-preview-53` on PR #53), NOT the client-facing production build.

Per `resources/brand-handoff-from-ahoy/HANDOFF-NOTE.md`, there is an outstanding ask to Arne to confirm:

1. The Söhne license scope covers Journey Projects as contributors on the BC build
2. The license covers web embedding on the production BC web property

Action items:

- **Before any production deploy serves Söhne:** confirm Klim license status with Lauren Duvel / Arne. If the license does not cover JP, either purchase a JP-scope license or substitute the system fallback (`Verdana, sans-serif`) until resolved.
- **When this bootstrap migrates to `src/systems/bc-brand/`:** flag the licensing gate in the migration brief so it does not get forgotten in the cutover.

## Migration plan (after the presentation)

This whole `_brand/` folder moves to `src/systems/bc-brand/` in the architecture refactor parked behind the presentation. The migration is mostly mechanical:

1. Move folder: `mv src/app/visual-concepts/best-practice-roadmap-v1/_brand src/systems/bc-brand`
2. Update layout import: `import { soehne } from '@/systems/bc-brand'`
3. Update layout side-effect: `import '@/systems/bc-brand/tokens.css'`
4. Decide on scoping mechanism — the brief calls out a future `<BcBrandThemeProvider>` for multi-direction scoping. Tonight's `data-bc-brand="v1"` selector + folder physical location is the placeholder.
5. Consider Tailwind theme extension via `tailwind.config.js` — only worth doing once tokens are stable and the migration commits.
6. Drop `[data-bc-brand="v1"]` scope from `tokens.css` once the shared root makes it global (the wireframe-locked UX routes will need their own non-BC scope at that point, or accept the brand inheritance — design call).

Anything that lives in `_brand/` tonight becomes the shared BC brand baseline.
