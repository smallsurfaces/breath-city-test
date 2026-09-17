/**
 * AtlasNav.tsx — the Breathe Atlas site nav (brief 4.1).
 *
 * Purpose
 *   A minimal site nav for the landing page and the chapters: the BC logo and a small "Prototype
 *   with sample data" notice. Nothing else. Rendered below the standard PrototypeHeader tooling
 *   bar, which owns back-to-hub and comments.
 *
 *   The "All cities" nav item was REMOVED on 2026-09-17 (Jack, brief 4.1). The cover browser is
 *   reached by scrolling the landing page, and from the "All cities" button at the end of every
 *   chapter (ChapterEnding, which still mounts AllCitiesPanel with the chapter's city highlighted
 *   and returns focus to that button on close). So the nav no longer needs the current city, and no
 *   longer renders `BREATHE_ATLAS_CHROME.nav`, which is now empty.
 *
 *   With no panel trigger left in the nav, this is a plain server component with no client part.
 *
 *   The logo is the same mark the shared BcChrome header draws (a round "BC" badge beside the
 *   "Breathe Cities" name, badge only on small screens). There is no image asset for it in the
 *   repo; BcChrome draws it in markup, so this nav draws the same markup. It is rendered in neutral
 *   foreground tones instead of brand blue because this concept is a grey wireframe with no
 *   decorative colour (brief section 2).
 *
 *   The notice covers the illustrative data and tiers across the whole prototype (brief sections 3
 *   and 7).
 *
 * Styling
 *   Bridged shadcn semantics only (text-foreground, border-border, bg-background, bg-foreground).
 *   No hex. Nav targets are at least 56px tall (frontend-standards R8).
 *
 * Key exports: AtlasNav (named)
 * External dependencies: next/link, ../breathe-atlas-chrome.config.
 */

import Link from 'next/link'
import { BREATHE_ATLAS_CHROME } from '../breathe-atlas-chrome.config'

/** The site nav row. Server component. */
export function AtlasNav() {
  return (
    <nav aria-label="Breathe Atlas" className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4">
        {/* Logo: the BcChrome mark, in neutral tones. Links to the cover. */}
        <Link
          href={BREATHE_ATLAS_CHROME.logoHref}
          aria-label="Breathe Cities, back to the cover"
          className="flex min-h-14 items-center gap-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background"
          >
            BC
          </span>
          <span className="hidden text-base font-bold tracking-tight text-foreground sm:inline">
            Breathe Cities
          </span>
        </Link>

        {/* Sample-data notice: quiet, always visible, not interactive. */}
        <span className="inline-flex items-center rounded-full border border-foreground/15 px-2.5 py-1 text-[11px] font-medium leading-tight text-foreground/70 sm:text-xs">
          Prototype with sample data
        </span>
      </div>
    </nav>
  )
}
