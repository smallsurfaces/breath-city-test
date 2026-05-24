/**
 * layout.tsx -- AQ Network layout (chrome for the globe homepage + member profiles).
 *
 * Purpose
 *   Wraps every AQ Network page in two stacked bars, in this order (matching the roadmap
 *   concept's convention):
 *     1. PrototypeHeader -- the TOOLING bar. Owns the sole "Back to hub" link + the
 *        comment/feedback widget + the "Updated" stamp. This is how the team REVIEWS the
 *        prototype; it is not part of BC's site.
 *     2. BcHeader -- the SITE nav (a light recreation of breathecities.org's header). This is
 *        what makes the prototype NAVIGABLE: links to the AQ Network home, the member cities,
 *        and the sibling BC concept prototypes. BcFooter closes every page.
 *   The two coexist by design: tooling on top, site nav below. Applies to
 *   /ux-concepts/aq-network and the dynamic /ux-concepts/aq-network/[city] route in one place,
 *   so the per-page files no longer render their own PrototypeHeader (that moved here to avoid
 *   a duplicate bar).
 *
 * Note on buildName: a single buildName ("AQ Network") covers both the homepage and the
 *   member profiles. The per-page titles still differentiate via Next metadata; the tooling
 *   bar's label is the build, not the page.
 *
 * Key exports: AqNetworkLayout (default)
 * External dependencies: PrototypeHeader, BcChrome (BcHeader, BcFooter)
 */

import { PrototypeHeader } from "../../_components/PrototypeHeader";
import { BcHeader, BcFooter } from "./_components/BcChrome";

export default function AqNetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Tooling bar (back-to-hub + comments) ABOVE the BC-site recreation. */}
      <PrototypeHeader buildName="AQ Network — concept" />
      {/* BC site nav -- makes the prototype navigable. */}
      <BcHeader />
      {children}
      <BcFooter />
    </>
  );
}
