/**
 * CreditInfo.tsx — the chapter's "i" for credits, sources and figure notes (round 2, item 9).
 *
 * Purpose
 *   Every photo credit, figure source and method note in a chapter now sits behind one quiet
 *   "i" instead of running as visible text (Jack, 2026-09-22). This is that "i": a small round
 *   button that opens a popover holding the credit or the source, including its links.
 *
 *   The path to every source is KEPT, only moved behind the icon. That is what the data
 *   attribution and traceability decision requires
 *   (state/decisions/data-attribution-traceability-2026-05-24.md): each source link is one tap
 *   or one hover away, never removed.
 *
 * Why a popover and not the shared InfoTooltip
 *   The shared InfoTooltip (src/components/concept/InfoTooltip.tsx) is a tooltip, and a tooltip
 *   cannot hold links someone can click: it closes as the pointer leaves the trigger and is not
 *   reachable by touch. This is built on Base UI's Popover instead, and is concept-local; the
 *   shared layer is unchanged (changes there go through design-system-keeper). The trigger copies
 *   InfoTooltip's look (20px circle, hairline border, muted lucide Info glyph) so the two read as
 *   one family.
 *
 * Behaviour
 *   - Pointer: opens on hover after a short delay. Base UI keeps the popup open while the pointer
 *     travels into it, so its links can be clicked.
 *   - Touch: tap the "i" to open, tap it again or tap outside to close.
 *   - Keyboard: the trigger is a real <button>; Enter or Space opens it and moves focus onto the
 *     popup, Tab reaches the links, Escape closes and returns focus to the "i".
 *
 * Touch target
 *   The visible circle stays 20px so it is as quiet as InfoTooltip, and a transparent ::before
 *   extends the hit area to 56px (frontend-standards R8). Callers leave room for it: nothing else
 *   interactive sits within 18px of the circle in any of the placements.
 *
 * Styling
 *   Bridged semantics only (bg-background, text-foreground, text-muted-foreground, border-border).
 *   The circle carries an opaque bg-background, so it stays legible when it sits on a photo. The
 *   popup is the concept's card surface (rounded-2xl, hairline border, shadow). No hex. Light mode.
 *
 * Key exports: CreditInfo (named)
 * External dependencies: react (useRef, ReactNode), @base-ui/react/popover (Popover), lucide-react (Info).
 */

'use client'

import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Info } from 'lucide-react'

/** Props for CreditInfo. */
type CreditInfoProps = {
  /**
   * Accessible name for the "i" and its popup, per use: "Photo credit", "Source and method",
   * "About this figure", "Sources".
   */
  label: string
  /** What the popover holds: credit text, source links, a method note. */
  children: ReactNode
  /** Which edge of the "i" the popup lines up with (it opens above, and flips when there is no room). */
  align: 'start' | 'center' | 'end'
  /** Placement classes from the caller (e.g. absolute positioning on a photo). Empty string for none. */
  className: string
}

/** How long the pointer rests on the "i" before it opens, in ms. */
const HOVER_OPEN_DELAY = 150

/** How long the popup lingers after the pointer leaves, in ms, so a slightly curved path still reaches it. */
const HOVER_CLOSE_DELAY = 200

/** Space the popup keeps from the screen edges, in px. The top clears the pinned prototype disclaimer. */
const COLLISION_PADDING = { top: 64, right: 16, bottom: 16, left: 16 }

/** The trigger: InfoTooltip's circle, plus an invisible 56px hit area and an open state. */
const TRIGGER_CLASS = [
  'relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background',
  'text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground',
  'data-[popup-open]:border-foreground/40 data-[popup-open]:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
  // Hit area: 20px circle + 18px each side = 56px (frontend-standards R8).
  "before:absolute before:-inset-[18px] before:content-['']",
].join(' ')

/** The "i" and its popover. */
export function CreditInfo({ label, children, align, className }: CreditInfoProps) {
  const popupRef = useRef<HTMLDivElement | null>(null)
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={HOVER_OPEN_DELAY}
        closeDelay={HOVER_CLOSE_DELAY}
        aria-label={label}
        className={`${TRIGGER_CLASS} ${className}`}
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        {/* z-50: above page content and the chapter maps, below the pinned prototype disclaimer
            (z-105). It opens above the "i"; the larger top collision padding keeps it clear of
            that pinned disclaimer (up to about 45px tall on a phone), so near the top of the
            screen it flips below the "i" instead of sliding under the disclaimer. */}
        <Popover.Positioner side="top" align={align} sideOffset={8} collisionPadding={COLLISION_PADDING} className="z-50">
          <Popover.Popup
            ref={popupRef}
            // Focus the popup itself on open, not its first link. Base UI focuses a link WITHOUT
            // preventScroll, which scrolled the page by about 30px on every tap on an iPhone
            // (measured in the iOS 26.5 simulator); the popup itself is focused with preventScroll.
            // Keyboard users are then one Tab from the first link.
            initialFocus={popupRef}
            aria-label={label}
            className="w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm leading-snug text-foreground shadow-lg outline-none"
          >
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
