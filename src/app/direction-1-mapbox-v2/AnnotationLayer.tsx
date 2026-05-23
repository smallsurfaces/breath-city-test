/**
 * AnnotationLayer — Portable Spatial Annotation Overlay
 *
 * Adds a freeze-frame annotation system to any viewport. Reviewers toggle
 * annotation mode, click to place numbered pins, write named comments, and
 * mark items as resolved. Annotations persist in localStorage.
 *
 * Key behaviours:
 * - Annotation mode: inset border ring signals freeze; click capture overlay active
 * - Pins: numbered, normalised coordinate storage (0–1 viewport fractions)
 * - Cards: self-positioning to avoid viewport edges; mobile bottom-sheet below mobileBreakpoint
 * - Persistence: localStorage keyed by storageKey prop
 * - Map freeze: pass mapAdapter to disable/re-enable map interaction handlers
 *
 * Ported from: design/prototypes/air-quality-map/src/lib/AnnotationLayer.tsx
 *
 * Stage 1 generalisation (element-anchored, machine-readable comments):
 * - Pluggable persistence: pass `persistence` to swap the storage backend. DEFAULT is the
 *   original localStorage load/save, so MAP builds (which omit it) are unchanged.
 * - anchorMode='element': clicks anchor a comment to the DOM element under the cursor; the
 *   pin renders from the resolved element's LIVE rect and re-anchors on reload/resize.
 *   Falls back to a muted "last-known-position" pin when the element can't be re-found.
 * - Default anchorMode='viewport' preserves the legacy normalised-fraction behaviour.
 *
 * @see AnnotationLayer.types.ts for prop types
 * @see ../../lib/comments/anchor for captureAnchor/resolveAnchor (single source)
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Annotation, AnnotationLayerConfig, ElementAnchor } from './AnnotationLayer.types'
import { captureAnchor, resolveAnchor } from '../../lib/comments/anchor'

// ─── AnnotationLayer ──────────────────────────────────────────────────────────

export default function AnnotationLayer({
  storageKey,
  label,
  mapAdapter,
  onEnterMode,
  onExitMode,
  mobileBreakpoint = 768,
  togglePosition,
  anchorMode = 'viewport',
  persistence,
  buildId,
  route,
}: AnnotationLayerConfig): React.ReactElement {
  // True when this instance anchors comments to DOM elements (non-map builds).
  // Map builds omit anchorMode → 'viewport' → all element-mode branches are inert.
  const elementMode = anchorMode === 'element'

  const [isActive, setIsActive] = useState<boolean>(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  // pendingClick stores raw viewport pixels (local only, never persisted).
  // In element mode it also carries the resolved anchor captured at click time.
  const [pendingClick, setPendingClick] = useState<{ x: number; y: number } | null>(null)
  const pendingAnchorRef = useRef<ElementAnchor | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState<string>('')
  const [draftName, setDraftName] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  // Re-render trigger for element-mode pins: their on-screen position derives from a LIVE
  // getBoundingClientRect, so we bump this on scroll/resize to recompute pin positions.
  const [, setLiveTick] = useState<number>(0)

  // Measured card heights to prevent overflow-guard using hardcoded estimates
  const newCardRef = useRef<HTMLDivElement>(null)
  const editCardRef = useRef<HTMLDivElement>(null)
  const [newCardHeight, setNewCardHeight] = useState<number>(220)
  const [editCardHeight, setEditCardHeight] = useState<number>(280)

  // ── Responsive check ────────────────────────────────────────────────────────
  // Side effect: attaches resize event listener to window

  useEffect(() => {
    const check = (): void => {
      setIsMobile(window.innerWidth < mobileBreakpoint)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [mobileBreakpoint])

  // ── Live-rect re-render for element-anchored pins ─────────────────────────────
  // Element pins are positioned from a LIVE getBoundingClientRect, so they must be
  // recomputed when the page scrolls or resizes. Only wired while annotation mode is
  // active in element mode (no listeners on map builds / when inactive).
  // Side effect: attaches scroll (capture) + resize listeners to window.

  useEffect(() => {
    if (!elementMode || !isActive) return
    const bump = (): void => setLiveTick((t) => t + 1)
    // capture:true catches scrolls on nested scroll containers, not just window.
    window.addEventListener('scroll', bump, true)
    window.addEventListener('resize', bump)
    return () => {
      window.removeEventListener('scroll', bump, true)
      window.removeEventListener('resize', bump)
    }
  }, [elementMode, isActive])

  // ── Load on mount ───────────────────────────────────────────────────────────
  // Two paths, selected by whether a `persistence` adapter was supplied:
  //   - persistence present (non-map builds): load via the adapter, keyed by buildId.
  //     Side effect: async adapter call (which itself reads localStorage cache + network).
  //   - persistence absent (DEFAULT — map builds): the original localStorage logic, keyed
  //     by storageKey, including legacy pixel→fraction migration. Behaviour unchanged.
  // `hasLoaded` gates the save effect so the initial load does not immediately echo back.
  const [hasLoaded, setHasLoaded] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false

    if (persistence !== undefined && buildId !== undefined) {
      // Adapter path — async. Guarded against unmount/build change via `cancelled`.
      persistence
        .load(buildId)
        .then((loaded) => {
          if (cancelled) return
          setAnnotations(loaded)
          setHasLoaded(true)
        })
        .catch(() => {
          if (cancelled) return
          // Adapter load failed entirely — start empty rather than crash.
          setHasLoaded(true)
        })
      return () => {
        cancelled = true
      }
    }

    // Default path — localStorage, keyed by storageKey (map-build behaviour, unchanged).
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        const migrated = parsed.map((a: Annotation) => ({
          ...a,
          authorName: a.authorName ?? '',
          resolved: a.resolved ?? false,
          // Migrate legacy pixel coords to normalised fractions
          x: a.x > 1 ? a.x / window.innerWidth : a.x,
          y: a.y > 1 ? a.y / window.innerHeight : a.y,
        }))
        setAnnotations(migrated)
      }
    } catch { /* ignore corrupt data */ }
    setHasLoaded(true)
    return () => {
      cancelled = true
    }
  }, [storageKey, persistence, buildId])

  // ── Persist on change ───────────────────────────────────────────────────────
  // Mirror of the load split. Skipped until the initial load completes so we never
  // overwrite stored data with the empty initial state.
  //   - persistence present: delegate to the adapter (fire-and-forget; it caches + POSTs).
  //   - persistence absent (DEFAULT — map builds): original localStorage write, unchanged.
  //     Wrapped in try/catch (Safari private mode throws QuotaExceededError on setItem).

  useEffect(() => {
    if (!hasLoaded) return

    if (persistence !== undefined && buildId !== undefined) {
      persistence.save(buildId, annotations)
      return
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(annotations))
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[AnnotationLayer] localStorage.setItem failed — annotations will not persist across sessions.', err)
      }
    }
  }, [annotations, storageKey, persistence, buildId, hasLoaded])

  // ── Body class toggle for freeze state ─────────────────────────────────────
  // Side effect: adds/removes 'annotation-active' class on document.body.
  // The class is used by the <style> block below to dim host UI elements.

  useEffect(() => {
    if (isActive) {
      document.body.classList.add('annotation-active')
    } else {
      document.body.classList.remove('annotation-active')
    }
    return () => {
      document.body.classList.remove('annotation-active')
    }
  }, [isActive])

  // ── Measure new card height after render ────────────────────────────────────
  // Required for overflow-guard in getCardPosition — avoids hardcoded height estimates.

  useEffect(() => {
    if (newCardRef.current) {
      setNewCardHeight(newCardRef.current.offsetHeight)
    }
  }, [pendingClick, draftName, draftText])

  // ── Measure edit card height after render ───────────────────────────────────

  useEffect(() => {
    if (editCardRef.current) {
      setEditCardHeight(editCardRef.current.offsetHeight)
    }
  }, [editingId, draftName, draftText])

  // ── handleCancel ────────────────────────────────────────────────────────────

  const handleCancel = useCallback((): void => {
    setPendingClick(null)
    pendingAnchorRef.current = null
    setEditingId(null)
    setDraftText('')
    setDraftName('')
  }, [])

  // ── Escape key listener ─────────────────────────────────────────────────────
  // Side effect: attaches keydown listener to window for Escape dismissal.

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleCancel])

  // ── enterAnnotationMode ─────────────────────────────────────────────────────
  // Freeze: disable map interaction and signal annotation mode to host.
  // mapAdapter.freeze() is optional — for non-map use cases, omit mapAdapter.
  // onEnterMode fires after freeze so the host can clear popups/tooltips.

  const enterAnnotationMode = (): void => {
    setIsActive(true)
    // Freeze the underlying map/interactive layer if an adapter is provided
    mapAdapter?.freeze()
    // Notify the host — host is responsible for clearing its own UI state
    onEnterMode?.()
  }

  // ── exitAnnotationMode ──────────────────────────────────────────────────────
  // Unfreeze: restore map interaction and notify host via onExitMode callback.

  const exitAnnotationMode = (): void => {
    handleCancel()
    // Unfreeze the underlying map/interactive layer
    mapAdapter?.unfreeze()
    setIsActive(false)
    onExitMode?.()
  }

  // ── handleOverlayClick ──────────────────────────────────────────────────────
  // Guard: if a card is already open, cancel it instead of opening a new one.
  // This prevents data loss when the user clicks outside an unsaved card.

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (pendingClick !== null || editingId !== null) {
      handleCancel()
      return
    }

    // Element mode: find the DOM element under the cursor and capture a durable anchor.
    // The overlay sits above the page, so temporarily hide it from hit-testing via
    // elementsFromPoint (which returns the stack) and pick the first non-overlay element.
    if (elementMode) {
      const stack = document.elementsFromPoint(e.clientX, e.clientY)
      const target = stack.find(
        (node) => node instanceof HTMLElement && node.getAttribute('data-al-overlay') === null,
      )
      if (target === undefined || !(target instanceof HTMLElement)) {
        // Nothing meaningful under the cursor — ignore the click rather than pin to nothing.
        return
      }
      pendingAnchorRef.current = captureAnchor(target)
    }

    setPendingClick({ x: e.clientX, y: e.clientY })
    setDraftText('')
    setDraftName('')
  }

  // ── handleSave (new annotation) ─────────────────────────────────────────────
  // Store x/y as normalised viewport fractions (0–1) so pin positions survive resize.

  const handleSave = (): void => {
    if (pendingClick === null || draftText.trim() === '') return

    // Common normalised click position — used directly for viewport pins and kept on
    // element pins as a positional backstop alongside the anchor.
    const base: Annotation = {
      id: Date.now().toString(),
      // Normalise raw pixel click position to 0–1 viewport fraction
      x: pendingClick.x / window.innerWidth,
      y: pendingClick.y / window.innerHeight,
      text: draftText.trim(),
      authorName: draftName.trim(),
      createdAt: Date.now(),
      resolved: false,
    }

    // Element mode: attach the durable anchor captured at click time + Stage-1 metadata.
    if (elementMode && pendingAnchorRef.current !== null) {
      const anchor = pendingAnchorRef.current
      const elementAnnotation: Annotation = {
        ...base,
        kind: 'element',
        anchor,
        buildId,
        route,
        capturedText: anchor.nearbyText,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        schemaVersion: 2,
      }
      setAnnotations(prev => [...prev, elementAnnotation])
    } else {
      // Viewport / legacy behaviour (map builds) — unchanged shape.
      setAnnotations(prev => [...prev, base])
    }

    setPendingClick(null)
    pendingAnchorRef.current = null
    setDraftText('')
    setDraftName('')
  }

  // ── handleEditSave ──────────────────────────────────────────────────────────

  const handleEditSave = (): void => {
    if (editingId === null || draftText.trim() === '') return
    setAnnotations(prev =>
      prev.map(a =>
        a.id === editingId
          ? { ...a, text: draftText.trim(), authorName: draftName.trim() }
          : a
      )
    )
    setEditingId(null)
    setDraftText('')
    setDraftName('')
  }

  // ── handleDelete ────────────────────────────────────────────────────────────

  const handleDelete = (): void => {
    if (editingId === null) return
    setAnnotations(prev => prev.filter(a => a.id !== editingId))
    setEditingId(null)
    setDraftText('')
    setDraftName('')
  }

  // ── Live pin position resolver ────────────────────────────────────────────────
  // Resolves where a pin should currently draw, in raw viewport pixels.
  //  - element pins: resolveAnchor → live rect centre when the element is re-found
  //    (resolved:true, el set so the card can draw a highlight ring). When the element
  //    cannot be re-found, falls back to the stored normalised box centre, else stored
  //    x/y (resolved:false → render a MUTED "last-known-position" pin).
  //  - viewport/legacy pins: stored normalised x/y → pixels (always resolved:true).
  // Wrapped so a single bad anchor never throws during render.

  type PinPosition = { x: number; y: number; resolved: boolean; el: HTMLElement | null }

  function getPinPosition(annotation: Annotation): PinPosition {
    // Legacy / viewport pins: normalised fraction → pixels. Always positioned.
    if (annotation.kind !== 'element' || annotation.anchor === undefined) {
      return {
        x: annotation.x * window.innerWidth,
        y: annotation.y * window.innerHeight,
        resolved: true,
        el: null,
      }
    }

    try {
      const el = resolveAnchor(annotation.anchor)
      if (el !== null) {
        const rect = el.getBoundingClientRect()
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          resolved: true,
          el,
        }
      }
    } catch {
      /* fall through to last-known-position fallback below */
    }

    // Element not found — last-known-position from stored box, else stored x/y.
    const box = annotation.anchor.box
    if (box !== undefined) {
      return {
        x: (box.x + box.w / 2) * window.innerWidth,
        y: (box.y + box.h / 2) * window.innerHeight,
        resolved: false,
        el: null,
      }
    }
    return {
      x: annotation.x * window.innerWidth,
      y: annotation.y * window.innerHeight,
      resolved: false,
      el: null,
    }
  }

  // ── Card position helper ────────────────────────────────────────────────────
  // Positions the annotation card to avoid viewport edges.
  // anchorX and anchorY are raw viewport pixels (converted from normalised fractions before calling).
  // On mobile (below mobileBreakpoint), cards anchor to the bottom of the screen instead.

  function getCardPosition(anchorX: number, anchorY: number, cardHeight: number): React.CSSProperties {
    if (isMobile) {
      return {
        position: 'fixed',
        bottom: '80px',
        left: '1rem',
        right: '1rem',
        width: 'auto',
      }
    }
    let left = anchorX + 20
    let top = anchorY - 36
    if (anchorX + 20 + 240 > window.innerWidth - 16) left = anchorX - 260
    if (anchorY - 36 + cardHeight > window.innerHeight - 16) top = anchorY - cardHeight
    return { position: 'fixed', left, top, width: '240px', zIndex: 110 }
  }

  // ── formatDate utility ───────────────────────────────────────────────────────

  const formatDate = (ts: number): string =>
    new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts))

  // ── Shared card styles ───────────────────────────────────────────────────────
  // Uses --al-* CSS custom properties. Map your project tokens to --al-* in globals.css.

  const cardStyle: React.CSSProperties = {
    background: 'var(--al-overlay-bg)',
    border: '1px solid var(--al-overlay-border)',
    borderRadius: 'var(--al-radius-card)',
    padding: '0.75rem 1rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 110,
    fontFamily: 'var(--al-font)',
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '72px',
    resize: 'none',
    background: 'var(--al-input-bg)',
    border: '1px solid var(--al-input-border)',
    borderRadius: 'var(--al-radius-input)',
    color: 'var(--al-text)',
    fontFamily: 'var(--al-font)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.625rem',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '0.5rem',
    display: 'block',
  }

  const nameInputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--al-input-bg)',
    border: '1px solid var(--al-input-border)',
    borderRadius: 'var(--al-radius-input)',
    color: 'var(--al-text)',
    fontFamily: 'var(--al-font)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.625rem',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '0.5rem',
    display: 'block',
    height: '32px',
  }

  const saveButtonStyle = (disabled: boolean): React.CSSProperties => ({
    background: 'var(--al-brand)',
    color: 'var(--al-white)',
    border: 'none',
    borderRadius: 'var(--al-radius-input)',
    height: '32px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    fontFamily: 'var(--al-font)',
  })

  const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  }

  const cardLabelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--al-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--al-muted)',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '2px 4px',
    fontFamily: 'var(--al-font)',
  }

  // ── Toggle pill position ─────────────────────────────────────────────────────
  // Defaults: desktop top 180px right 1rem, mobile bottom 148px right 1rem.
  // togglePosition prop overrides desktop position only.

  const pillDesktopPos = togglePosition ?? { top: '180px', right: '1rem' }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Body class styles ──────────────────────────────────────────────── */}
      {/* Dims host UI elements while annotation mode is active */}
      <style>{`
        body.annotation-active [data-slot="toggle-panel"],
        body.annotation-active [data-slot="time-slider"] {
          opacity: 0.5;
          pointer-events: none;
        }
        body.annotation-active header {
          opacity: 0.8;
          pointer-events: none;
        }
      `}</style>

      {/* ── Freeze border ring ──────────────────────────────────────────────── */}
      {/* Visual signal that annotation mode is active and the viewport is frozen */}
      {isActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            border: '2px solid var(--al-brand)',
            pointerEvents: 'none',
            zIndex: 90,
          }}
        />
      )}

      {/* ── Toggle pill ────────────────────────────────────────────────────── */}
      {/* Mobile bottom raised to 148px to clear MobilePopup (bottom: 64px, ~80px tall).
          Mobile touch target is 44px height for accessibility. */}
      <button
        onClick={isActive ? exitAnnotationMode : enterAnnotationMode}
        style={{
          position: 'fixed',
          top: isMobile ? undefined : pillDesktopPos.top,
          bottom: isMobile ? '148px' : pillDesktopPos.bottom,
          right: isMobile ? '1rem' : (pillDesktopPos.right ?? '1rem'),
          left: isMobile ? undefined : pillDesktopPos.left,
          zIndex: 110,
          borderRadius: 'var(--al-radius-pill)',
          padding: isMobile ? '10px 18px' : '6px 14px',
          height: isMobile ? '44px' : '32px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          fontFamily: 'var(--al-font)',
          border: isActive ? 'none' : '1px solid var(--al-overlay-border)',
          background: isActive ? 'var(--al-brand)' : 'var(--al-overlay-bg)',
          color: isActive ? 'var(--al-white)' : 'var(--al-text)',
        }}
      >
        {isActive ? `Done annotating` : (label ?? 'Annotate')}
      </button>

      {/* ── Annotation mode overlays ────────────────────────────────────────── */}
      {isActive && (
        <>
          {/* Click capture overlay — z-index 100, below pins (101) and toggle pill (110).
              data-al-overlay marks it so element-mode hit-testing (elementsFromPoint)
              can see PAST the overlay to the real page element under the cursor. */}
          <div
            data-al-overlay=""
            onClick={handleOverlayClick}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              cursor: 'crosshair',
            }}
          />

          {/* ── Highlight ring (element mode) ──────────────────────────────────────
              While an element pin's card is open and its element is re-found, draw a ring
              around the live element rect so the reviewer sees exactly what is anchored.
              Reuses the brand colour; muted treatment is handled on the pin itself. */}
          {elementMode && editingId !== null && (() => {
            const editing = annotations.find(a => a.id === editingId)
            if (editing === undefined || editing.kind !== 'element') return null
            const pos = getPinPosition(editing)
            if (pos.el === null) return null
            const rect = pos.el.getBoundingClientRect()
            return (
              <div
                aria-hidden="true"
                style={{
                  position: 'fixed',
                  left: rect.left - 3,
                  top: rect.top - 3,
                  width: rect.width + 6,
                  height: rect.height + 6,
                  border: '2px solid var(--al-brand)',
                  borderRadius: 'var(--al-radius-input)',
                  // Neutral soft glow (matches the file's rgba(0,0,0,...) shadow convention);
                  // the brand colour is carried by the border, which uses the --al-brand token.
                  boxShadow: '0 0 0 3px rgba(0,0,0,0.10)',
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              />
            )
          })()}

          {/* Pins — position derives from getPinPosition (live element rect when element
              mode + resolved; stored normalised coords otherwise). Unresolved element
              pins render MUTED as a "last-known-position" marker. */}
          {annotations.map((annotation, index) => {
            const pos = getPinPosition(annotation)
            // A pin is muted when the comment is resolved OR (element mode) its anchor
            // could not be re-found — both reuse the muted token + reduced opacity.
            const lostAnchor = annotation.kind === 'element' && !pos.resolved
            const muted = annotation.resolved || lostAnchor
            return (
              <div
                key={annotation.id}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation()
                  setEditingId(annotation.id)
                  setPendingClick(null)
                  pendingAnchorRef.current = null
                  setDraftText(annotation.text)
                  setDraftName(annotation.authorName ?? '')
                }}
                style={{
                  position: 'fixed',
                  // Live (element) or stored (viewport) position, centred on the pin head.
                  left: pos.x - 14,
                  top: pos.y - 36,
                  zIndex: 101,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: 'scale(1)',
                  transition: 'transform 120ms ease',
                  opacity: muted ? 0.4 : 1,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = 'scale(1.15)'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {/* Circle — muted (resolved or lost anchor) uses the muted token. */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: muted ? 'var(--al-muted)' : 'var(--al-brand)',
                    border: '2px solid var(--al-white)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--al-white)',
                    fontFamily: 'var(--al-font)',
                  }}
                >
                  {index + 1}
                </div>
                {/* Stem — reflects muted state */}
                <div
                  style={{
                    width: 1,
                    height: 8,
                    background: muted ? 'var(--al-muted)' : 'var(--al-brand)',
                  }}
                />
              </div>
            )
          })}

          {/* Comment input card (new) */}
          {/* ref attached — measured height passed to getCardPosition for overflow guard */}
          {pendingClick !== null && (
            <div
              ref={newCardRef}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...cardStyle,
                ...getCardPosition(pendingClick.x, pendingClick.y, newCardHeight),
              }}
            >
              <div style={cardHeaderStyle}>
                <span style={cardLabelStyle}>Add comment</span>
                <button
                  onClick={handleCancel}
                  aria-label="Cancel"
                  style={closeButtonStyle}
                >
                  ×
                </button>
              </div>
              {/* stopPropagation prevents keydown from bubbling to the overlay */}
              <input
                type="text"
                autoFocus
                value={draftName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  e.stopPropagation()
                  if (e.key === 'Escape') handleCancel()
                }}
                placeholder="Your name"
                style={nameInputStyle}
              />
              <textarea
                value={draftText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraftText(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  e.stopPropagation()
                  if (e.key === 'Escape') handleCancel()
                }}
                placeholder="Type your comment..."
                style={textareaStyle}
              />
              <button
                onClick={handleSave}
                disabled={draftText.trim() === ''}
                style={{
                  ...saveButtonStyle(draftText.trim() === ''),
                  width: '100%',
                }}
              >
                Save
              </button>
            </div>
          )}

          {/* Edit card */}
          {/* ref attached — measured height passed to getCardPosition for overflow guard */}
          {editingId !== null && (() => {
            const ann = annotations.find(a => a.id === editingId)
            if (ann === undefined) return null
            // Derive pin number from array index for display in header
            const editIndex = annotations.findIndex(a => a.id === editingId)
            // Position the card at the pin's LIVE location (element rect when resolved),
            // so an element comment's card tracks its element rather than the stored click.
            const pinPos = getPinPosition(ann)
            const lostAnchor = ann.kind === 'element' && !pinPos.resolved
            const pos = getCardPosition(pinPos.x, pinPos.y, editCardHeight)
            return (
              <div
                ref={editCardRef}
                onClick={(e) => e.stopPropagation()}
                style={{
                  ...cardStyle,
                  ...pos,
                }}
              >
                <div style={cardHeaderStyle}>
                  <span style={cardLabelStyle}>Comment #{editIndex + 1}</span>
                  <button
                    onClick={handleCancel}
                    aria-label="Cancel edit"
                    style={closeButtonStyle}
                  >
                    ×
                  </button>
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--al-muted)',
                    marginBottom: '0.5rem',
                    fontFamily: 'var(--al-font)',
                  }}
                >
                  {formatDate(ann.createdAt)}
                </div>
                {/* Graceful-degradation note: the anchored element could not be re-found,
                    so the pin is showing its last-known position. */}
                {lostAnchor && (
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--al-error)',
                      marginBottom: '0.5rem',
                      fontFamily: 'var(--al-font)',
                      lineHeight: 1.35,
                    }}
                  >
                    Element not found — showing last known position.
                  </div>
                )}
                <input
                  type="text"
                  value={draftName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftName(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    e.stopPropagation()
                    if (e.key === 'Escape') handleCancel()
                  }}
                  placeholder="Your name"
                  style={nameInputStyle}
                />
                <textarea
                  autoFocus
                  value={draftText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraftText(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    e.stopPropagation()
                    if (e.key === 'Escape') handleCancel()
                  }}
                  style={textareaStyle}
                />
                {/* Resolved toggle — saves immediately, no need to press Save */}
                <button
                  onClick={() => {
                    setAnnotations(prev =>
                      prev.map(a =>
                        a.id === editingId ? { ...a, resolved: !a.resolved } : a
                      )
                    )
                  }}
                  style={{
                    width: '100%',
                    height: '32px',
                    borderRadius: 'var(--al-radius-input)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--al-font)',
                    marginBottom: '0.25rem',
                    border: ann.resolved
                      ? '1px solid var(--al-muted)'
                      : '1px solid var(--al-success)',
                    background: 'transparent',
                    color: ann.resolved
                      ? 'var(--al-muted)'
                      : 'var(--al-success)',
                  }}
                >
                  {ann.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
                </button>
                <p
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--al-muted)',
                    margin: '0 0 0.5rem 0',
                    fontFamily: 'var(--al-font)',
                  }}
                >
                  Resolution saves immediately. Text changes require Save.
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={handleEditSave}
                    disabled={draftText.trim() === ''}
                    style={{
                      ...saveButtonStyle(draftText.trim() === ''),
                      padding: '0 16px',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--al-error)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontFamily: 'var(--al-font)',
                      padding: '4px 0',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })()}
        </>
      )}
    </>
  )
}
