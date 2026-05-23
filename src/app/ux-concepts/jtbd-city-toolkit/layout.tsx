/**
 * layout.tsx -- JTBD City Toolkit layout
 *
 * Purpose: Wraps the toolkit dashboard page in BC's site chrome (header +
 * footer). Applies to /ux-concepts/jtbd-city-toolkit.
 *
 * Key exports: ToolkitLayout (default)
 * External dependencies: BcChrome (BcHeader, BcFooter)
 */

import { BcHeader, BcFooter } from "./_components/BcChrome";

export default function ToolkitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BcHeader />
      {children}
      <BcFooter />
    </>
  );
}
