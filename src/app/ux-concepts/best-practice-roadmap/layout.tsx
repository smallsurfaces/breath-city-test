/**
 * layout.tsx -- Best Practice Roadmap layout
 *
 * Purpose: Wraps all roadmap pages in BC's site chrome (header + footer).
 * Applies to /ux-concepts/best-practice-roadmap and all nested routes.
 *
 * Key exports: RoadmapLayout (default)
 * External dependencies: BcChrome (BcHeader, BcFooter)
 */

import { BcHeader, BcFooter } from "./_components/BcChrome";

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BcHeader />
      {children}
      <BcFooter />
    </>
  );
}
