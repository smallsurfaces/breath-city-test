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
 *           existing <AnnotationLayer/> here so the spatial-annotation toggle keeps
 *           working) OR, when no commentSlot is given, a disabled "Comments — soon"
 *           affordance (Phase-2 comments are not built here).
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
 *   lucide-react (ArrowLeft, MessageSquare), ../_data/build-date
 */

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { buildDateForPath, formatBuildDate } from "../_data/build-date";

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
          commentSlot present → map build's <AnnotationLayer/> (fixed-position toggle,
          sits top-right). Absent → disabled "Comments — soon" placeholder; Phase-2
          comments are not built here.
        */}
        {commentSlot ?? (
          <span
            aria-disabled="true"
            title="Comments — coming soon"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground/60"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            Comments — soon
          </span>
        )}
      </div>
    </header>
  );
}
