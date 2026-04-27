"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

// Renders the global Home back-link on every route except "/"

const HIDDEN_ROUTES = new Set(["/"]);

export function HomeNav() {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.has(pathname)) return null;

  return (
    <Link
      href="/"
      aria-label="Home"
      className="fixed top-3 left-3 z-50 flex items-center gap-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border px-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-sm"
    >
      <ArrowLeft className="h-3 w-3" />
      Home
    </Link>
  );
}
