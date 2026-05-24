/**
 * layout.tsx -- Best Practice Roadmap layout
 *
 * Purpose: Wraps all roadmap pages in BC's site chrome (header + footer).
 * Applies to /ux-concepts/best-practice-roadmap and all nested routes.
 *
 * Key exports: RoadmapLayout (default)
 * External dependencies: BcChrome (BcHeader, BcFooter), PrototypeHeader, the single-source
 *   concept registry (CONCEPTS) for the bar title.
 */

import { BcHeader, BcFooter } from "./_components/BcChrome";
import { PrototypeHeader } from "../../_components/PrototypeHeader";
import { CONCEPTS } from "../../_data/concept-registry";

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Standard prototype chrome ABOVE the BC-site recreation. BcChrome stays as the
          build's content (its own honest "mock" marker is kept). The bar owns back-to-hub.
          Title comes from the concept registry so it matches the hub label (no "vN — concept"). */}
      <PrototypeHeader buildName={CONCEPTS.roadmap.title} />
      <BcHeader />
      {children}
      <BcFooter />
    </>
  );
}
