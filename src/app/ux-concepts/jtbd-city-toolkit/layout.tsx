/**
 * layout.tsx -- JTBD City Toolkit layout
 *
 * Purpose: Prepends the standard PrototypeHeader chrome bar, then wraps the
 * toolkit dashboard page in BC's site chrome (header + footer). Applies to
 * /ux-concepts/jtbd-city-toolkit.
 *
 * This build was the only one that missed the Phase 1 PrototypeHeader
 * standardization. Mounting PrototypeHeader here (mirroring how
 * ux-concepts/cities/layout.tsx does it) gives this build the sticky build bar,
 * the single back-to-hub affordance, the "Updated [date]" stamp, AND the
 * element-mode AnnotationLayer commenting (it rides on PrototypeHeader's default
 * comment slot). No `commentSlot` is passed, so the element-anchored default is
 * used. Because PrototypeHeader now owns back-to-hub + the build identity, the
 * old floating "Back to hub" pill and the "Prototype · …" banner were removed
 * from BcChrome (see BcChrome.tsx) to avoid a duplicate "second nav bar".
 *
 * Unlike ux-concepts/cities (where each page renders its own BcHeader/BcFooter as
 * content), this build mounts BC's site chrome here in the layout — so
 * PrototypeHeader sits ABOVE BcHeader in this same layout.
 *
 * Key exports: ToolkitLayout (default)
 * External dependencies: PrototypeHeader, BcChrome (BcHeader, BcFooter), the concept registry
 *   (CONCEPTS) for the bar title.
 *
 * Note: this older JTBD per-city-audit route was de-listed from the hub in the housekeeping pass
 *   (the toolkit concept now leads with /ux-concepts/toolkit), but the route still builds. Its bar
 *   carries the toolkit concept title from the registry per the rename table (JTBD City Toolkit →
 *   "Global Site Concept - BC City AQ Toolkit").
 */

import { PrototypeHeader } from "../../_components/PrototypeHeader";
import { BcHeader, BcFooter } from "./_components/BcChrome";
import { CONCEPTS } from "../../_data/concept-registry";

export default function ToolkitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Standard prototype chrome ABOVE the BC-site recreation. Owns back-to-hub,
          the build name, the "Updated" stamp, and element-mode commenting. */}
      <PrototypeHeader buildName={CONCEPTS.toolkit.title} />
      <BcHeader />
      {children}
      <BcFooter />
    </>
  );
}
