# _brand/graphics — Asset Catalogue

Visual assets staged for the `best-practice-roadmap-v1` visual concept. All paths below are relative to `src/app/visual-concepts/best-practice-roadmap-v1/_brand/graphics/`.

Staged 2026-05-27 by design-system-keeper for pass 2 brief (`design/globalsite/visual-concepts/v1-roadmap-brand-pass-2-brief-2026-05-26.md`).

---

## wind/ — existing

Hand-drawn Wind graphic from the BC brand language. Used as a decorative accent on the v1 hero.

| File | Format | Purpose |
|---|---|---|
| `wind.png` | PNG (22 KB) | Raster fallback |
| `wind.svg` | SVG (890 B) | Vector primary; scales cleanly |

---

## windows/ — existing

Five Window-shape container variants from the BC brand system. Used as masking containers for hero photography and as decorative motif.

| File | Format | Purpose |
|---|---|---|
| `window-01.png` / `.svg` | PNG (25 KB) / SVG | Window variant 1 |
| `window-02.png` / `.svg` | PNG (23 KB) / SVG | Window variant 2 |
| `window-03.png` / `.svg` | PNG (31 KB) / SVG | Window variant 3 |
| `window-04.png` / `.svg` | PNG (23 KB) / SVG | Window variant 4 |
| `window-05.png` / `.svg` | PNG (24 KB) / SVG | Window variant 5 |

---

## windows-wind/ — existing

Placeholder composition combining the Wind and Windows assets. See `windows-wind/README.md` for current state.

---

## cities/ — NEW (added 2026-05-27)

City landmark imagery from the BC brand library. Each file is a single composed card showing a landmark photograph rendered with the BC brand colour overlay (e.g. London/pink Big Ben, Accra/green Independence Square Memorial).

**Source:** Figma file `xyPcakbg26AL59CnFRDYWW` (Jack's Treeshake-updated working copy of `Breathe-Cities (Copy)`), node `3681:7175` ("Images" frame) > `3659:14825` ("Card Cities" symbol set). Each card was rendered via `mcp__figma__get_screenshot` at native canvas size.

**Format:** PNG, native 315×400 px, ~35-152 KB each. The card is the full composition — landmark + colour BG + mix-blend treatment baked in — not the raw photograph alone. This means the card can be used as a single `<img>` without needing to recreate the blend mode in CSS.

**BC brand colour palette used in the cards** (per Figma `Card Cities` source):
- BC Green `#03AB3D` — Accra, Paris, Nairobi
- BC Tangerine `#F55200` — Warsaw, Sofia, Brussels
- BC Blue `#0071C7` — Johannesburg, Milan
- BC Pink `#F357CA` — Jakarta, London
- BC Light Blue `#23BCED` — Mexico City, Rio de Janeiro

| File | City | Colour BG | Source node |
|---|---|---|---|
| `accra.png` | Accra | Green | 3659:14824 |
| `brussels.png` | Brussels | Tangerine | 3676:1351 |
| `jakarta.png` | Jakarta | Pink | 3668:819 |
| `johannesburg.png` | Johannesburg | Blue | 3668:814 |
| `london.png` | London | Pink | 3676:1346 |
| `mexico-city.png` | Mexico City | Light Blue | 3668:826 |
| `milan.png` | Milan | Blue | 3676:1366 |
| `nairobi.png` | Nairobi | Green | 3676:1356 |
| `paris.png` | Paris | Green | 3674:1341 |
| `rio-de-janeiro.png` | Rio de Janeiro | Light Blue | 3676:1361 |
| `sofia.png` | Sofia | Tangerine | 3668:831 |
| `warsaw.png` | Warsaw | Tangerine | 3659:14826 |

**Coverage gap:** The BC brand currently covers 14 cities. The `Card Cities` symbol set in the source Figma node ships only 12 — **Bangkok and Bogotá are missing**. If the v1 hero composition needs all 14 cities, the gap should be surfaced to design-director before client review. Options: (a) treat the 12 as the canonical set for v1 and document the gap as a known coverage limitation, (b) request Bangkok + Bogotá card design from the BC brand owner. v1 ships fine without them if the hero only needs ~3-5 cities visible — choose by need.

**Naming convention:** lowercase city slug, hyphenated where multi-word (`mexico-city`, `rio-de-janeiro`). Matches existing slug conventions in BC OpenAQ data and route names.

---

## partners/ — NEW (added 2026-05-27)

Founding-organisation logos for the BC-style footer. Same three SVG files the live `breathecities.org` site serves.

**Source:** Direct download from `breathecities.org/wp-content/uploads/2023/11/` (URLs verified via WebFetch of the live footer + HEAD-check before download — not fabricated). All three returned HTTP 200, `content-type: image/svg+xml`, `last-modified: 2023-11-21`.

| File | Org | Original URL | Size |
|---|---|---|---|
| `clean-air-fund.svg` | Clean Air Fund | `…/2023/11/clean-air-fund.svg` | 4.5 KB |
| `c40-cities.svg` | C40 Cities | `…/2023/11/c40-cities.svg` | 6.0 KB |
| `bloomberg-philanthropies.svg` | Bloomberg Philanthropies | `…/2023/11/bloomberg.svg` (renamed locally to match brand) | 10 KB |

### Inversion / colour treatment per logo

The BC-style footer is dark (deep navy BG with white content). Each logo must read cleanly white-on-dark.

| Logo | Colours in SVG | On dark BG | Treatment needed |
|---|---|---|---|
| `clean-air-fund.svg` | `#fff` paths only | Drops in clean as white-on-dark | None — render as-is |
| `c40-cities.svg` | `#fff` square BG + `#000` logo paths | Logo is BLACK on a WHITE square — will NOT read on dark BG without treatment | Apply `filter: invert(1)` OR strip the white BG rect and recolour paths to white. Recommend `filter: invert(1)` for the dispatch — it flips the white BG to black (invisible on dark navy) and the black logo to white. Simplest path. |
| `bloomberg-philanthropies.svg` | `#fff` paths only | Drops in clean as white-on-dark | None — render as-is |

**No multi-colour logos in this set** — all three resolve cleanly without brand-portal escalation. No need to contact Lauren Duvel (CAF), c40.org/about (C40), or bloomberg.org/brand (Bloomberg) for this pass.

**If the inversion treatment on C40 looks wrong on the deployed footer** — escalate to design-director. Fallback paths if needed:
- CAF: brand portal access via Lauren Duvel
- C40: `c40.org/about/` press kit
- Bloomberg: `bloomberg.org/brand/` press kit

---

## Out of scope for this asset dispatch

- `wind/`, `windows/`, `windows-wind/` — untouched, existing assets only
- No token changes, no component code, no markup edits
- No Figma writes (read-only extraction)

Developer picks up from here per `design/globalsite/visual-concepts/v1-roadmap-brand-pass-2-brief-2026-05-26.md`.
