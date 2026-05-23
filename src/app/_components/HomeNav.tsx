"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

/*
 * Renders the canonical global "Back to hub" back-link (ArrowLeft icon = the
 * "←") on routes that do NOT carry their own in-context back-nav.
 *
 * Single-back-nav rule: every hub prototype route must show exactly ONE
 * "Back to hub" linking to "/". Routes that own a back-nav button inside their
 * own chrome (BcChrome: roadmap + cities subtrees) or in-flow (resident-concerns)
 * are listed in HIDDEN_ROUTES so this global one does not render a duplicate.
 * The hub home ("/") is the destination and never shows a back-nav.
 */

/*
 * Prefixes whose routes own their own "Back to hub" — global one is suppressed
 * here to avoid a duplicate. Matched via startsWith so nested routes
 * (/[slug], /city/[slug], /domain/[slug], /cities) are covered too.
 */
const SELF_NAV_PREFIXES = [
  "/ux-concepts/best-practice-roadmap",
  "/ux-concepts/cities",
  "/ux-concepts/resident-concerns",
  "/ux-concepts/jtbd-city-toolkit",
];

/** "/" is the destination — never show a back-nav there. */
const HIDDEN_EXACT = new Set(["/"]);

export function HomeNav() {
  const pathname = usePathname();
  if (HIDDEN_EXACT.has(pathname)) return null;
  if (SELF_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <Link
      href="/"
      aria-label="Back to hub"
      className="fixed top-3 left-3 z-50 flex items-center gap-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border px-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-sm"
    >
      <ArrowLeft className="h-3 w-3" />
      Back to hub
    </Link>
  );
}
