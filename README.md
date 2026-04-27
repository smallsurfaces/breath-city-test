# Breathe Cities Design System

Design token repository extracted from [breathecities.org](https://breathecities.org). Compiles tokens to CSS custom properties and a Tailwind theme extension. Syncs to Figma via Token Studio.

---

## Quick Start

```bash
npm install
npm run build
```

Output:
- `dist/css/tokens.css` — CSS custom properties (prefix: `--bc-`)
- `dist/tailwind/theme.js` — Tailwind theme extension
- `dist/json/tokens.json` — Flat JSON for Figma Token Studio sync

---

## Structure

```
tokens/           # Source of truth — edit these
  global/         # Raw design values
  semantic/       # Semantic aliases

dist/             # Compiled output — do not edit directly
  css/
  tailwind/
  json/

figma/            # Figma Token Studio configuration + sync guide
components/       # UI component catalogue
docs/             # Full design system audit
```

---

## Figma Integration

Tokens sync to Figma as Variables via the [Token Studio](https://tokens.studio/) plugin.

See [`figma/README.md`](figma/README.md) for setup instructions.

---

## Using Tokens in Code

**CSS:**
```css
.button {
  background-color: var(--bc-semantic-brand);
  color: var(--bc-color-white);
  border-radius: var(--bc-border-radius-pill);
  transition: background-color var(--bc-transition-fast);
}

.button:hover {
  background-color: var(--bc-semantic-hover);
}
```

**Tailwind (after extending theme):**
```js
// tailwind.config.js
import theme from './dist/tailwind/theme.js'

export default {
  theme: {
    extend: theme
  }
}
```

---

## Token Prefix

All compiled tokens use the `bc-` prefix to avoid collisions:
- `--bc-color-dark-blue`
- `--bc-semantic-brand`
- `--bc-spacing-md`
- `--bc-border-radius-pill`
