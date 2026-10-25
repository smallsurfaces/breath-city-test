/**
 * AllCitiesPanel.tsx — the "All cities" button and the panel it opens (brief 5.9).
 *
 * Purpose
 *   "All cities" opens the cover browser (CityBrowser, the same carousel as on the cover) in a panel
 *   over the page. Its one mount is a chapter's ending (brief 5.8), as an outlined 56px button.
 *   The chapter's current city is highlighted and scrolled into view. Closing the panel returns the
 *   visitor to the same place on the page. Visitors who want the globe go back to the cover via the
 *   logo.
 *
 *   The nav mount was removed on 2026-09-17 (Jack, brief 4.1), and with it the `triggerVariant`
 *   prop that chose between a quiet nav item and this button: one call site needs one style. Each
 *   mount still renders its own dialog, so focus returns to the button that was pressed.
 *
 * How it is built
 *   A native <dialog> opened with showModal(): the browser puts it in the top layer and makes the
 *   rest of the page inert. The dialog fills the viewport with a transparent background; inside it,
 *   a dimmed backdrop (click to close) and the panel sheet across the top. The sheet's content
 *   (CityBrowser) mounts only while open, AFTER showModal(), so the browser can measure the row and
 *   scroll the current city into view.
 *
 * Accessibility (brief 5.9: focus moves in, stays trapped, Escape closes, focus returns)
 *   - Focus moves into the panel on open (showModal focuses the close button, the first control).
 *   - Focus is trapped: the page behind is inert, and Tab / Shift+Tab wrap between the panel's first
 *     and last focusable elements instead of leaving for the browser's own controls.
 *   - Escape closes (handled on the dialog's keydown, see handleKeyDown), as do the close button and
 *     a click on the backdrop.
 *   - On close, focus returns to the "All cities" button without scrolling the page, and the page's
 *     scroll position is restored to where it was when the panel opened.
 *   - The dialog is labelled "All cities" by the sheet's visible title.
 *
 * Key exports: AllCitiesPanel (named)
 * External dependencies: react, lucide-react (X), ./CityBrowser.
 *
 * Side effects (all cleaned up):
 *   - dialog.showModal() / dialog.close().
 *   - While open: `overflow: hidden` on <html>, so the page behind cannot scroll (restored on close
 *     and on unmount).
 *   - window.scrollTo on close, and focus() on the trigger.
 */

'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { CityBrowser } from './CityBrowser'

/** Props for AllCitiesPanel. */
type AllCitiesPanelProps = {
  /** Visible label of the button. */
  label: string
  /** The chapter city to highlight in the panel, or null when no city is current. */
  currentCityId: string | null
}

/** Elements that can take keyboard focus inside the panel (for the Tab wrap). */
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Shared focus ring. */
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/** The trigger button's classes. At least 56px tall (frontend-standards R8). */
const TRIGGER_CLASS =
  'inline-flex min-h-14 w-full items-center justify-center rounded-full border border-foreground/60 px-6 text-base font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background'

/** The "All cities" button and its panel. */
export function AllCitiesPanel({ label, currentCityId }: AllCitiesPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const scrollYRef = useRef(0)
  const titleId = useId()
  const browserHeadingId = useId()
  const [open, setOpen] = useState(false)

  /** Open the panel. showModal() runs before the content mounts (see file header). */
  const openPanel = () => {
    const dialog = dialogRef.current
    if (dialog === null || dialog.open) return
    scrollYRef.current = window.scrollY
    // Side effect: lock page scroll behind the panel.
    document.documentElement.style.overflow = 'hidden'
    // Side effect: open the native modal dialog (top layer, page behind inert, focus moves in).
    dialog.showModal()
    setOpen(true)
  }

  /** Ask the dialog to close; the `close` event does the clean-up. */
  const requestClose = () => {
    dialogRef.current?.close()
  }

  /**
   * The dialog closed (close button, backdrop, or Escape): unmount the content, unlock and restore
   * the page scroll, and return focus to the trigger without scrolling.
   */
  const handleClose = useCallback(() => {
    setOpen(false)
    document.documentElement.style.overflow = ''
    window.scrollTo({ top: scrollYRef.current, behavior: 'instant' })
    triggerRef.current?.focus({ preventScroll: true })
  }, [])

  // Side effect: attach the dialog's `close` listener; on unmount, close it and unlock the page.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('close', handleClose)
      if (dialog.open) dialog.close()
      document.documentElement.style.overflow = ''
    }
  }, [handleClose])

  /**
   * Escape closes the panel; Tab stays inside it (wraps from the last focusable element to the
   * first, and back). Escape is handled here rather than left to the dialog's native cancel, which
   * does not fire for every kind of key input (it did not for synthesised key events in testing).
   */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      requestClose()
      return
    }
    if (event.key !== 'Tab') return
    const dialog = dialogRef.current
    if (dialog === null) return
    // aria-disabled arrow buttons stay in this list on purpose: they remain focusable.
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPanel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${TRIGGER_CLASS} ${FOCUS_RING}`}
      >
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-foreground backdrop:bg-transparent"
      >
        {/* Dimmed backdrop: a click here closes the panel. Not focusable (the close button and
            Escape are the keyboard routes). */}
        <div aria-hidden="true" onClick={requestClose} className="fixed inset-0 bg-foreground/40" />

        {/* The panel sheet, across the top of the viewport. */}
        <div className="relative border-b border-border bg-background shadow-xl">
          <div className="mx-auto max-w-6xl px-4 pb-10">
            <div className="flex items-center justify-between gap-3">
              <p id={titleId} className="text-sm font-semibold text-foreground">
                All cities
              </p>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close all cities"
                className={`-mr-2 flex h-14 w-14 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {open && <CityBrowser headingId={browserHeadingId} currentCityId={currentCityId} />}
          </div>
        </div>
      </dialog>
    </>
  )
}
