/**
 * index.ts — barrel for the BC brand foundation (Visual Concept v1 scope).
 *
 * Purpose
 *   Single import surface for the v1-scoped BC brand layer. Consumers (currently
 *   only the v1 layout) import `soehne` from `./_brand` rather than reaching into
 *   `./_brand/fonts.ts`.
 *
 *   The CSS file (`./tokens.css`) is NOT re-exported through this barrel — it is
 *   imported directly by the v1 layout via a side-effect import, so it loads
 *   into the document head once.
 *
 *   Migration note
 *     When this foundation graduates to `src/systems/bc-brand/` (after the
 *     presentation), the barrel moves with it and the import path in the
 *     v1 layout becomes `import { soehne } from '@/systems/bc-brand'`.
 *
 * Key exports: soehne
 * External dependencies: ./fonts
 */

export { soehne } from './fonts'
