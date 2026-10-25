/**
 * ChapterLink.tsx — the chapter's outbound link and its shared styles.
 *
 * Purpose
 *   Every link in a chapter that leads to another site (programme pages, story sources, photo
 *   sources, Go further) opens in a new tab (brief 5.7), shows the up-right arrow, and tells
 *   screen reader users it opens a new tab. Placeholder `#` addresses get exactly the same
 *   treatment, so the preview behaves as the real content will.
 *
 * Key exports: OutboundLink (named), LINK_FOCUS_RING
 * External dependencies: react (ReactNode), lucide-react (ArrowUpRight).
 */

import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

/** Shared keyboard focus ring for chapter links and buttons. */
export const LINK_FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/** Props for OutboundLink. */
type OutboundLinkProps = {
  /** Destination URL (or `#` placeholder). */
  href: string
  /** Visible link text. */
  children: ReactNode
  /** Layout and type classes for the link (it is always inline-flex, 56px tall at least). */
  className: string
}

/** A link that opens in a new tab, with the arrow icon and a screen reader note. */
export function OutboundLink({ href, children, className }: OutboundLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-14 items-center gap-1.5 rounded-lg underline-offset-4 transition-colors hover:underline ${LINK_FOCUS_RING} ${className}`}
    >
      <span>{children}</span>
      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}
