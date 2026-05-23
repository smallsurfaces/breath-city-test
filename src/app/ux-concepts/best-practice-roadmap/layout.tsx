/**
 * layout.tsx -- Best Practice Roadmap layout
 *
 * Purpose: Wraps all roadmap pages in BC's site chrome (header + footer).
 * Applies to /ux-concepts/best-practice-roadmap and all nested routes.
 *
 * Key exports: RoadmapLayout (default)
 * External dependencies: BcChrome (BcHeader, BcFooter), PrototypeHeader
 */

import { BcHeader, BcFooter } from "./_components/BcChrome";
import { PrototypeHeader } from "../../_components/PrototypeHeader";

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Standard prototype chrome ABOVE the BC-site recreation. BcChrome stays as the
          build's content (its own honest "mock" marker is kept). The bar owns back-to-hub. */}
      <PrototypeHeader buildName="Best Practice Roadmap" />
      <BcHeader />
      {children}
      <BcFooter />
    </>
  );
}
