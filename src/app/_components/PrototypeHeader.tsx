/**
 * PrototypeHeader.tsx — the standard chrome bar for every hub prototype build.
 *
 * Purpose
 *   One full-width bar that sits at the top of EVERY hub build (every route except
 *   the hub home "/"). It is the single source of: the "← Back to hub" affordance,
 *   the build's name, and the per-build "Updated [date]" stamp. Page content always
 *   renders BELOW this bar — the component renders only the bar itself, never the
 *   page body.
 *
 *   This replaces two older patterns:
 *     - the global fixed HomeNav back-pill (retired from layout.tsx — this bar now
 *       owns back-to-hub on every retrofitted route), and
 *     - the per-build floating wordmark pills on the map prototypes.
 *
 * Layout
 *   LEFT  : back-to-hub link to "/" (lucide ArrowLeft, not a glyph) + truncated
 *           build name + an optional `controls` slot (reserved for future
 *           build-level controls; empty today).
 *   RIGHT : "Updated [date]" stamp + the `commentSlot` (map builds pass their
 *           existing spatial <AnnotationLayer/> here so the spatial-annotation toggle
 *           keeps working) OR, when no commentSlot is given, the element-anchored
 *           AnnotationLayer (anchorMode="element") wired to the durable /api/comments
 *           store — so EVERY non-map build gets real, machine-readable commenting.
 *
 * Tokens
 *   shadcn-style semantic aliases only (bg-background, text-foreground,
 *   border-border, text-muted-foreground, bg-muted). In globals.css these are all
 *   aliased to --bc-* tokens, so the bar is automatically BC-branded with NO
 *   hardcoded hex — matching how HomeNav / JtbdNav already work. Light mode. No emoji.
 *
 * Date resolution
 *   `date` (ISO) may be passed explicitly; otherwise it is resolved from the current
 *   route via build-date.ts (longest-prefix match against the committed
 *   build-dates.json). Renders no stamp when no build owns the path.
 *
 * Key exports: PrototypeHeader (named)
 * External dependencies: next/link, next/navigation (usePathname),
 *   lucide-react (ArrowLeft), ../_data/build-date,
 *   ../direction-1-mapbox-v2/AnnotationLayer, ../../lib/comments/client
 */

"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildDateForPath, formatBuildDate } from "../_data/build-date";
import AnnotationLayer from "../direction-1-mapbox-v2/AnnotationLayer";
import { createApiPersistence } from "../../lib/comments/client";

/**
 * Derive a stable build slug from a route pathname — used as the Blobs store key and the
 * localStorage cache key for a build's comments. Deterministic across reloads:
 *   "/ux-concepts/resident-concerns" → "ux-concepts-resident-concerns"
 *   "/jtbd-framework"                → "jtbd-framework"
 *   "/"                              → "hub-home"
 * Strips leading/trailing slashes, lowercases, and replaces path separators + unsafe
 * characters with hyphens so the key is filesystem/URL safe.
 */
function pathToBuildId(pathname: string): string {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  if (trimmed === "") return "hub-home";
  return trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Props for PrototypeHeader. */
type PrototypeHeaderProps = {
  /** Required bar title — the build's name (e.g. "Direction 01 — PM2.5 Triangulation"). */
  buildName: string;
  /**
   * Optional ISO date (YYYY-MM-DD) for the "Updated" stamp. Omit to resolve from
   * the current route via build-date.ts.
   */
  date?: string;
  /**
   * Optional comment affordance. MAP builds pass their existing <AnnotationLayer/>
   * here (its toggle is position:fixed, so it still sits top-right). Non-map builds
   * omit it and get the disabled "Comments — soon" placeholder instead.
   */
  commentSlot?: ReactNode;
  /** Reserved future LEFT-slot controls. Empty for now. */
  controls?: ReactNode;
};

/**
 * The standard prototype chrome bar. Renders ONLY the bar; the page renders its
 * content below it. See file header for the full layout/contract.
 */
export function PrototypeHeader({
  buildName,
  date,
  commentSlot,
  controls,
}: PrototypeHeaderProps) {
  const pathname = usePathname();
  // Prefer an explicitly-passed date; otherwise resolve from the current route.
  const iso = date ?? buildDateForPath(pathname);

  // Stable build slug + the /api/comments persistence adapter for the element-anchored
  // comment widget. Memoised on pathname so the adapter identity is stable across renders
  // (re-creating it each render would re-trigger AnnotationLayer's load effect).
  const buildId = useMemo(() => pathToBuildId(pathname), [pathname]);
  const persistence = useMemo(
    () => createApiPersistence(pathname),
    [pathname],
  );

  return (
    <header className="flex w-full flex-shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 py-2.5">
      {/* LEFT — back-to-hub + build name + reserved controls slot */}
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          aria-label="Back to hub"
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to hub
        </Link>

        <span
          className="truncate text-sm font-semibold text-foreground"
          title={buildName}
        >
          {buildName}
        </span>

        {/* Reserved future build-level controls — renders nothing when empty. */}
        {controls}
      </div>

      {/* RIGHT — updated stamp + comment affordance (AnnotationLayer or disabled placeholder) */}
      <div className="flex flex-shrink-0 items-center gap-3">
        {iso !== null && iso !== undefined && (
          <span className="hidden text-[11px] font-medium tabular-nums text-muted-foreground/80 sm:inline">
            Updated {formatBuildDate(iso)}
          </span>
        )}

        {/*
          commentSlot present → map build's spatial <AnnotationLayer/> (fixed-position
          toggle, sits top-right). Absent → the element-anchored AnnotationLayer wired to
          the durable /api/comments store, so every non-map build has real commenting.
        */}
        {commentSlot ?? (
          <>
            {/*
              Inject the AnnotationLayer's --al-* token interface, mapped onto the BC
              --bc-* semantic tokens (NO hardcoded hex). Map builds inject their own
              --al-* block per-route; non-map builds get this BC-branded mapping here so
              the widget is styled wherever PrototypeHeader mounts. The toggle is
              position:fixed (top-right), so no layout slot is needed in the bar.
            */}
            <style>{`
              :root {
                --al-overlay-bg:     var(--bc-semantic-map-overlay);
                --al-overlay-border: var(--bc-semantic-border);
                --al-input-bg:       var(--bc-color-white);
                --al-input-border:   var(--bc-semantic-border);
                --al-text:           var(--bc-semantic-text);
                --al-muted:          var(--bc-semantic-muted);
                --al-brand:          var(--bc-semantic-brand);
                --al-success:        var(--bc-semantic-success);
                --al-error:          var(--bc-semantic-error);
                --al-white:          var(--bc-color-white);
                --al-font:           var(--bc-font-family-sans);
                --al-radius-card:    var(--bc-border-radius-md);
                --al-radius-input:   var(--bc-border-radius-sm);
                --al-radius-pill:    var(--bc-border-radius-pill);
              }
            `}</style>
            <AnnotationLayer
              storageKey={`bc-comments-${buildId}`}
              label="Comments"
              anchorMode="element"
              persistence={persistence}
              buildId={buildId}
              route={pathname}
              togglePosition={{ top: "1rem", right: "1rem" }}
            />
          </>
        )}
      </div>
    </header>
  );
}
