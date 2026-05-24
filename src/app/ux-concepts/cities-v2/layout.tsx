/**
 * layout.tsx — Cities (Resident Concerns showcase) v2 layout
 *
 * Purpose: Adds the standard prototype chrome bar ABOVE the cities-v2 pages, covering
 * both the index (/ux-concepts/cities-v2) and the per-city pages
 * (/ux-concepts/cities-v2/[slug]) in one place — the same seam v1 uses.
 *
 * These pages render BC's own site chrome (BcHeader/BcFooter) PER-PAGE as their
 * CONTENT (the in-context recreation IS the build), so this layout deliberately does
 * NOT render BcHeader/BcFooter — it only prepends the PrototypeHeader. This is a
 * STRUCTURAL property of the Cities concept and is preserved verbatim from v1: the
 * chrome belongs to the pages, not the layout. (This differs from AQ Network v2,
 * whose chrome lives in its layout — Cities keeps its own per-page mount on purpose.)
 * The bar owns the back-to-hub affordance; BcChrome's own honest "mock" marker stays
 * in the pages.
 *
 * The "Updated [date]" stamp resolves from the route via build-date.ts: both the
 * index and [slug] match the "/ux-concepts/cities-v2" prefix, so they share the
 * build's date (dynamic [slug] pages inherit their parent build's date by design).
 *
 * Difference from v1: only the buildName label changes (to distinguish this
 * synchronised v2 copy in the tooling bar). The chrome contract — PrototypeHeader
 * only, BcHeader/BcFooter rendered per-page below — is unchanged.
 *
 * Key exports: CitiesV2Layout (default)
 * External dependencies: PrototypeHeader
 */

import { PrototypeHeader } from "../../_components/PrototypeHeader";

export default function CitiesV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Standard prototype chrome ABOVE the BC-site recreation. Content (incl. each
          page's own BcHeader/BcFooter) renders below. */}
      <PrototypeHeader buildName="Resident Concerns v2 — concept" />
      {children}
    </>
  );
}
