/**
 * JtbdNav — shared tab navigation for JTBD framework pages
 *
 * Purpose: Renders a pill-style tab row that lets users navigate between the
 *          two JTBD framework pages: Framework Matrix and Research Lifecycle.
 *          Consumed by both /jtbd-framework and /jtbd-framework/architecture.
 *
 * Key exports: JtbdNav (named export)
 *
 * External dependencies:
 *   - next/link — client-side navigation without full page reload
 *   - Kit B (shadcn) semantic tokens: bg-primary, text-primary-foreground,
 *     bg-muted, text-muted-foreground, text-foreground
 */

import Link from "next/link";

/** The two valid tab identifiers — one per JTBD framework page. */
type JtbdTab = "matrix" | "architecture";

/** Props for JtbdNav. activeTab drives the active/inactive visual state. */
interface JtbdNavProps {
  /** Which tab should render in the active (highlighted) state. */
  activeTab: JtbdTab;
}

/** Tab configuration — label and route for each JTBD framework page. */
const TABS: Array<{ id: JtbdTab; label: string; href: string }> = [
  { id: "matrix",       label: "Framework Matrix",   href: "/jtbd-framework"              },
  { id: "architecture", label: "Research Lifecycle",  href: "/jtbd-framework/architecture" },
];

/**
 * JtbdNav renders a two-tab pill row for navigating between JTBD framework
 * pages. The tab matching `activeTab` renders with primary colours; the other
 * renders in muted state with a hover effect.
 */
export function JtbdNav({ activeTab }: JtbdNavProps) {
  return (
    <div className="inline-flex gap-1 p-1 bg-muted rounded-lg">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={
              isActive
                ? "bg-primary text-primary-foreground rounded-md px-4 h-9 text-sm font-medium inline-flex items-center"
                : "bg-muted text-muted-foreground rounded-md px-4 h-9 text-sm font-medium inline-flex items-center hover:bg-muted/80 hover:text-foreground"
            }
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
