# Breathe Cities Design System — Claude Agent Context

Read this file at the start of any Claude Code session in this repository.

---

## What This Repo Is

Design system token repository for Breathe Cities, extracted from https://breathecities.org.

**Purpose:** Single source of truth for design tokens. Compiles to:
1. CSS custom properties → `dist/css/tokens.css`
2. Tailwind theme extension → `dist/tailwind/theme.js`
3. JSON (for Figma sync) → `dist/json/tokens.json`

---

## Token Structure

```
tokens/
├── global/
│   ├── colors.json         # Raw colour palette
│   ├── typography.json     # Font families, sizes, weights, line heights
│   ├── spacing.json        # Spacing scale + container sizes
│   ├── border-radius.json  # Border radius values
│   └── effects.json        # Shadows and transitions
└── semantic/
    └── semantic.json       # Semantic aliases referencing global tokens
```

---

## Key Token Names

### Colours
| Token | Compiled CSS var | Value |
|---|---|---|
| `color.white` | `--bc-color-white` | `#ffffff` |
| `color.darkBlue` | `--bc-color-dark-blue` | `#003574` |
| `color.blue` | `--bc-color-blue` | `#0071c7` |
| `color.lightBlue` | `--bc-color-light-blue` | `#23bced` |
| `color.teal` | `--bc-color-teal` | `#2BCDB0` |
| `color.tangerine` | `--bc-color-tangerine` | `#f55200` |
| `color.green` | `--bc-color-green` | `#03ab3d` |

### Semantic
| Token | Compiled CSS var | References |
|---|---|---|
| `semantic.bg` | `--bc-semantic-bg` | `color.white` |
| `semantic.text` | `--bc-semantic-text` | `color.darkBlue` |
| `semantic.brand` | `--bc-semantic-brand` | `color.blue` |
| `semantic.hover` | `--bc-semantic-hover` | `color.lightBlue` |
| `semantic.error` | `--bc-semantic-error` | `color.tangerine` |
| `semantic.success` | `--bc-semantic-success` | `color.green` |

### Spacing
| Token | Compiled CSS var | Value |
|---|---|---|
| `spacing.xs` | `--bc-spacing-xs` | `10px` |
| `spacing.sm` | `--bc-spacing-sm` | `20px` |
| `spacing.md` | `--bc-spacing-md` | `40px` |
| `spacing.lg` | `--bc-spacing-lg` | `60px` |

---

## Build Commands

```bash
npm install          # first time only
npm run build        # compile tokens → dist/
npm run watch        # watch mode during development
```

---

## Rules for Claude Agents

1. **Never hardcode colours, sizes, or spacing** — always use token names
2. When generating CSS: use `var(--bc-semantic-*)` for semantic values, `var(--bc-color-*)` for raw values
3. When generating Tailwind classes: reference the compiled `dist/tailwind/theme.js` for available custom values
4. When a Figma file is shared, use `get_design_context` — the Variables in Figma map 1:1 to tokens in this repo
5. Only Jack can add new tokens — agents may read and reference tokens but not create new ones without approval
6. Run `npm run build` after any token file change to regenerate `dist/`

---

## Figma MCP Workflow

1. Figma library is synced via Token Studio plugin (see `figma/README.md`)
2. Figma Variables map directly to token names in this repo
3. To read a Figma design: share the URL, Claude calls `get_design_context`
4. Code Connect mappings are in `components/README.md` — update with Figma node IDs after library is created

---

## Figma

**File URL:** https://www.figma.com/design/Dlq6WaTDGDPe8I5VRgTVA6/breath-city-test
**Current phase:** 08 — Concept Visual Design

### Current Figma Pages
- `📋 Version Log` — version history table (always first, never push content here)
- `All Directions — v1 — 2026-03-25` — initial push, all three directions as frames on one page

### Next push
Create a new page per direction: `Direction 01 — v2 — [date]`, `Direction 02 — v2 — [date]`, etc.

### Versioning Convention
- Never overwrite Figma pages — always append a new page per push
- Page naming: `Direction [N] — v[X] — [YYYY-MM-DD]`
- Example: `Direction 01 — v3 — 2026-03-25`
- The most recently created page for a direction is always current
- The code build always reflects the latest push
- A `📋 Version Log` page sits at the top of the file with a table of all versions

### Version Log Format
```
| Version | Date       | Direction | What changed         |
|---------|------------|-----------|----------------------|
| v1      | 2026-03-24 | All       | Initial push         |
```

### Retrieval
To retrieve a specific version: call `get_design_context` with the node ID for the target versioned page. One targeted MCP call.

---

## Component Reference

See `components/README.md` for the full UI component catalogue.
See `docs/design-audit.md` for the complete source design audit.
