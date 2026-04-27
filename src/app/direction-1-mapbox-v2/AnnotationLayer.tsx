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
 * Changes from prototype: 'use client' directive already present; no other changes needed.
 *
 * @see AnnotationLayer.types.ts for prop types
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Annotation, AnnotationLayerConfig } from './AnnotationLayer.types'

// ─── AnnotationLayer ──────────────────────────────────────────────────────────

export default function AnnotationLayer({
  storageKey,
  label,
  mapAdapter,
  onEnterMode,
  onExitMode,
  mobileBreakpoint = 768,
  togglePosition,
}: AnnotationLayerConfig): React.ReactElement {
  const [isActive, setIsActive] = useState<boolean>(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  // pendingClick stores raw viewport pixels (local only, never persisted)
  const [pendingClick, setPendingClick] = useState<{ x: number; y: number } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState<string>('')
  const [draftName, setDraftName] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)

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

  // ── localStorage load on mount ──────────────────────────────────────────────
  // Side effect: reads from localStorage using storageKey prop.
  // Migrates legacy pixel-coordinate entries to normalised fractions (0–1).
  // Legacy entries have x > 1 or y > 1 (raw pixels don't fit in 0–1 range).

  useEffect(() => {
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
  }, [storageKey])

  // ── localStorage persist on change ─────────────────────────────────────────
  // Side effect: writes to localStorage on every annotations state change.
  // Wrapped in try/catch because Safari private browsing throws QuotaExceededError
  // on any setItem call. On failure, annotations remain in React state for the
  // current session but will not survive a page reload — acceptable degradation.

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(annotations))
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[AnnotationLayer] localStorage.setItem failed — annotations will not persist across sessions.', err)
      }
    }
  }, [annotations, storageKey])

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
    setPendingClick({ x: e.clientX, y: e.clientY })
    setDraftText('')
    setDraftName('')
  }

  // ── handleSave (new annotation) ─────────────────────────────────────────────
  // Store x/y as normalised viewport fractions (0–1) so pin positions survive resize.

  const handleSave = (): void => {
    if (pendingClick === null || draftText.trim() === '') return
    setAnnotations(prev => [...prev, {
      id: Date.now().toString(),
      // Normalise raw pixel click position to 0–1 viewport fraction
      x: pendingClick.x / window.innerWidth,
      y: pendingClick.y / window.innerHeight,
      text: draftText.trim(),
      authorName: draftName.trim(),
      createdAt: Date.now(),
      resolved: false,
    }])
    setPendingClick(null)
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
          {/* Click capture overlay — z-index 100, below pins (101) and toggle pill (110) */}
          <div
            onClick={handleOverlayClick}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              cursor: 'crosshair',
            }}
          />

          {/* Pins — convert normalised fractions back to viewport pixels for rendering */}
          {annotations.map((annotation, index) => (
            <div
              key={annotation.id}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation()
                setEditingId(annotation.id)
                setPendingClick(null)
                setDraftText(annotation.text)
                setDraftName(annotation.authorName ?? '')
              }}
              style={{
                position: 'fixed',
                // Convert normalised fractions back to viewport pixels for rendering
                left: annotation.x * window.innerWidth - 14,
                top: annotation.y * window.innerHeight - 36,
                zIndex: 101,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: 'scale(1)',
                transition: 'transform 120ms ease',
                opacity: annotation.resolved ? 0.4 : 1,
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'scale(1.15)'
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {/* Circle — resolved state uses muted colour at 0.4 opacity on parent */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: annotation.resolved ? 'var(--al-muted)' : 'var(--al-brand)',
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
              {/* Stem — reflects resolved state */}
              <div
                style={{
                  width: 1,
                  height: 8,
                  background: annotation.resolved ? 'var(--al-muted)' : 'var(--al-brand)',
                }}
              />
            </div>
          ))}

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
            const pos = getCardPosition(
              ann.x * window.innerWidth,
              ann.y * window.innerHeight,
              editCardHeight,
            )
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
