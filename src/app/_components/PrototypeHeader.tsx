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
 *           existing spatial <AnnotationLayer/> here; its toggle renders inline so it
 *           lands in this bar) OR, when no commentSlot is given, the element-anchored
 *           AnnotationLayer (anchorMode="element") wired to the durable /api/comments
 *           store — so EVERY non-map build gets real, machine-readable commenting.
 *
 * Scroll behaviour (round 2, 2026-09-22, Jack: "our standard prototype nav")
 *   Row 1 (the bar above) SCROLLS AWAY with the page. Row 2 (the wireframe disclaimer) is the
 *   only sticky part and stays pinned at the top. The two rows used to sit in ONE sticky
 *   <header>, and a sticky element only sticks inside its own parent box, so the disclaimer
 *   could never stick on its own inside that header. They are now two SIBLINGS returned as a
 *   fragment: row 1 is a plain in-flow <header>, row 2 is `sticky top-0`. Both land directly in
 *   whatever element mounts this component (the <body> for every concept layout), which is the
 *   same containing block the old sticky header had. So the disclaimer pins wherever the whole
 *   bar used to pin, at every width. There are no breakpoint variants on any of it.
 *   Known trade-off: the Comments toggle lives in row 1, so it scrolls away with it.
 *
 * Other sticky headers (BcHeader)
 *   The shared BcHeader (src/components/concept/BcChrome.tsx) is also `sticky top-0` and six
 *   concept routes mount it right below this component. With only the disclaimer pinned, it
 *   would stick at top 0 underneath the disclaimer and lose its top 30 to 43px (the old 81px
 *   bar hid it completely). So this component publishes the disclaimer's live height as the
 *   CSS variable `--prototype-disclaimer-h` on <html> and injects ONE rule that moves any
 *   `header.sticky.top-0` FOLLOWING the disclaimer (a later sibling, or inside one) down by that
 *   height: the site nav stacks under the disclaimer instead of behind it. BcChrome itself is
 *   not edited (shared layer, owned by design-system-keeper). Sticky parts inside their own
 *   scroll containers (panel headers, table heads) are <div>/<th>, not <header>, and are not
 *   matched. Before hydration the variable is unset and the rule falls back to 0px, which only
 *   matters once the page has scrolled.
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
 * Wireframe disclaimer
 *   Below the bar row sits a thin, full-width disclaimer banner shown on EVERY build that mounts
 *   this header (so the framing is single-sourced, not per-concept). The copy is deliberately
 *   GENERIC — it names no concept — so it reads correctly everywhere. See WIREFRAME_DISCLAIMER.
 *
 * Key exports: PrototypeHeader (named)
 * External dependencies: react (useEffect, useMemo, useRef), next/link, next/navigation
 *   (usePathname), lucide-react (ArrowLeft), ../_data/build-date,
 *   ../direction-1-mapbox-v2/AnnotationLayer, ../../lib/comments/client
 *
 * Side effects (cleaned up on unmount): a ResizeObserver on the disclaimer that writes
 *   `--prototype-disclaimer-h` onto document.documentElement.
 */

"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildDateForPath, formatBuildDate } from "../_data/build-date";
import AnnotationLayer from "../direction-1-mapbox-v2/AnnotationLayer";
import { createApiPersistence } from "../../lib/comments/client";

/**
 * Derive a stable build slug from a route pathname — used as the Blobs store key and the
 * localStorage cache key for a build's comments. Deterministic across reloads:
 *   "/ux-concepts/cities"            → "ux-concepts-cities"
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

/**
 * The single, GENERIC wireframe disclaimer shown beneath the bar on every build. Named no concept
 * on purpose — it must read correctly on all of them. Locked copy (do not edit without a decision).
 */
const WIREFRAME_DISCLAIMER =
  "Concept wireframe — no visual design applied yet. Review the UX and the high-level concept, not the visual design.";

/** CSS variable carrying the pinned disclaimer's live height, for sticky headers below it. */
const DISCLAIMER_HEIGHT_VAR = "--prototype-disclaimer-h";

/**
 * Stylesheet that stacks a following page-level sticky header (BcHeader) under the pinned
 * disclaimer instead of behind it. See "Other sticky headers" in the file header.
 */
const STICKY_OFFSET_CSS = `
  [data-prototype-disclaimer] ~ header.sticky.top-0,
  [data-prototype-disclaimer] ~ * header.sticky.top-0 {
    top: var(${DISCLAIMER_HEIGHT_VAR}, 0px);
  }
`;

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
   * here; its toggle renders inline so it lands in this bar's right slot. Non-map
   * builds omit it and get the element-anchored AnnotationLayer (also inline) instead.
   */
  commentSlot?: ReactNode;
  /** Reserved future LEFT-slot controls. Empty for now. */
  controls?: ReactNode;
};

/**
 * The standard prototype chrome: row 1 (the bar, scrolls away) and row 2 (the disclaimer,
 * pinned). Renders ONLY the chrome; the page renders its content below it. See file header.
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

  const disclaimerRef = useRef<HTMLDivElement | null>(null);

  // Side effect: publish the pinned disclaimer's height as a CSS variable on <html>, so a sticky
  // site header below it (BcHeader) can stack under it. The disclaimer wraps to two lines on a
  // phone, so the height is measured, not assumed. Removed again on unmount.
  useEffect(() => {
    const disclaimer = disclaimerRef.current;
    if (disclaimer === null) return;
    const root = document.documentElement;
    const publish = () => {
      root.style.setProperty(DISCLAIMER_HEIGHT_VAR, `${disclaimer.offsetHeight}px`);
    };
    const observer = new ResizeObserver(publish);
    observer.observe(disclaimer);
    publish();
    return () => {
      observer.disconnect();
      root.style.removeProperty(DISCLAIMER_HEIGHT_VAR);
    };
  }, []);

  return (
    <>
      {/*
        Row 1 — the bar. NOT sticky: it scrolls away with the page (round 2). Still positioned
        with z-105, because z-index is load-bearing — it coordinates with the portaled
        AnnotationLayer overlay stack (all rendered to document.body):
          freeze ring 90 < overlay 100 < pins 101 < hover-label 102 < CHROME 105 < cards 110.
        - Row 1 (z-105) sits ABOVE the click-capture overlay (100) and pins/hover-label, so the
          in-bar Comments / Done-annotating toggle stays clickable while annotation mode is active
          and row 1 is in view. Once row 1 has scrolled away the toggle scrolls with it (known
          trade-off, spec round 2 item 1).
        - Both rows stay BELOW comment cards (110), so an open card is never hidden behind them.
        - The freeze ring (90) sits below both rows so the brand ring frames the content area.
        flex-shrink-0 keeps the row at full height inside the map builds' 100dvh flex column.
      */}
      <header className="relative z-[105] flex w-full flex-shrink-0 items-center justify-between gap-3 bg-background px-4 py-2.5">
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
            commentSlot present → map build's spatial <AnnotationLayer/> (its toggle now
            renders inline, so it sits in this right slot automatically). Absent → the
            element-anchored AnnotationLayer wired to the durable /api/comments store, so
            every non-map build has real commenting. In both cases the AnnotationLayer's
            toggle is a normal in-flow button that lands here, beside the "Updated" stamp.
          */}
          {commentSlot ?? (
            <>
              {/*
                Inject the AnnotationLayer's --al-* token interface, mapped onto the BC
                --bc-* semantic tokens (NO hardcoded hex). Map builds inject their own
                --al-* block per-route; non-map builds get this BC-branded mapping here so
                the widget is styled wherever PrototypeHeader mounts. The toggle renders
                inline in this slot (no fixed position), so the right-slot flex below aligns it.
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
              />
            </>
          )}
        </div>
      </header>

      {/* Stacks a following sticky site header (BcHeader) under the pinned disclaimer. */}
      <style>{STICKY_OFFSET_CSS}</style>

      {/*
        Row 2 — the GENERIC wireframe disclaimer, and the ONLY sticky part of the chrome: it stays
        pinned at the top while row 1 scrolls away. z-105, the same slot in the annotation stack
        as row 1 (see the stack note above), so pins scroll beneath it and comment cards open
        above it. Single-sourced here so it shows identically on every build that mounts this
        header; it names no concept. Quiet muted styling so it reads as framing, not as a loud
        warning. The muted fill is translucent, so it sits on an opaque background layer: page
        content must not show through a pinned bar. shadow-sm separates it from content scrolling
        beneath. role="note" so assistive tech treats it as an aside, not an alert.
      */}
      <div
        ref={disclaimerRef}
        role="note"
        data-prototype-disclaimer=""
        className="sticky top-0 z-[105] w-full flex-shrink-0 border-y border-border bg-background shadow-sm"
      >
        <div className="bg-muted/40 px-4 py-1.5 text-center text-[11px] leading-snug text-muted-foreground">
          {WIREFRAME_DISCLAIMER}
        </div>
      </div>
    </>
  );
}
