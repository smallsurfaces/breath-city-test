/**
 * AtlasDialog.tsx — the one layer over the page used by the city page (spec 5.6, 6.2, 6.3).
 *
 * Purpose
 *   A modal dialog: a full-height sheet on a phone, a centred panel from `sm`. Used for the sensor
 *   detail and for the explainers opened from the city section's tiles. Built on the Base UI Dialog
 *   primitive (focus trap, Escape to close, focus returned to the opener, scroll lock), styled
 *   locally with bridged semantics so it matches the concept rather than the shared shadcn dialog.
 *
 * Layering
 *   z-[110]: above the pinned prototype disclaimer (z-105) and the CreditInfo popovers (z-50),
 *   because a modal must cover everything it blocks.
 *
 * Key exports: AtlasDialog (named)
 * External dependencies: react (types), @base-ui/react/dialog, lucide-react (X).
 */

'use client'

import type { ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'

/** Props for AtlasDialog. */
type AtlasDialogProps = {
  open: boolean
  /** Called with false when the dialog asks to close (close button, Escape, backdrop). */
  onOpenChange: (open: boolean) => void
  /** The dialog's title (its accessible name). */
  title: string
  /** A small line above the title, e.g. "Pollutant"; empty string for none. */
  eyebrow: string
  /**
   * Header lines around the title (iteration 4, decision D1: the sensor detail's header carries
   * the sensor facts): `above` replaces the eyebrow line, `below` sits under the title. Null for none.
   */
  above?: ReactNode | null
  below?: ReactNode | null
  children: ReactNode
}

/** The dialog. Renders nothing while closed. */
export function AtlasDialog({ open, onOpenChange, title, eyebrow, above = null, below = null, children }: AtlasDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[110] bg-foreground/30" />
        <Dialog.Popup className="fixed inset-0 z-[110] flex flex-col bg-background outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-[min(36rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border sm:shadow-xl">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border py-2 pl-4 pr-1">
            <div className="min-w-0 py-2">
              {above !== null ? (
                <div className="mb-1">{above}</div>
              ) : (
                eyebrow.length > 0 && <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">{eyebrow}</p>
              )}
              <Dialog.Title className="text-lg font-bold leading-tight text-foreground">{title}</Dialog.Title>
              {below !== null && <div className="mt-1">{below}</div>}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
