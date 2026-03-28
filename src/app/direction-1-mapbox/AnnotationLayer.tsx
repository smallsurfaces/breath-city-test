'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

// ─── Types ────────────────────────────────────────────────────────────────────

// x and y are normalised viewport fractions (0–1), not raw pixel values.
// This makes pins stable across viewport resizes and cross-device localStorage.
type Annotation = {
  id: string
  x: number
  y: number
  text: string
  authorName: string
  createdAt: number
  resolved: boolean
}

type AnnotationLayerProps = {
  mapRef: React.RefObject<mapboxgl.Map | null>
  popupRef: React.RefObject<mapboxgl.Popup | null>
  onClearSensor: () => void
}

// ─── AnnotationLayer ──────────────────────────────────────────────────────────

export default function AnnotationLayer({
  mapRef,
  popupRef,
  onClearSensor,
}: AnnotationLayerProps): React.ReactElement {
  const [isActive, setIsActive] = useState<boolean>(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  // pendingClick stores raw viewport pixels (local only, never persisted)
  const [pendingClick, setPendingClick] = useState<{ x: number; y: number } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState<string>('')
  const [draftName, setDraftName] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // BUG 8 — measured card heights to prevent overflow-guard using hardcoded estimates
  const newCardRef = useRef<HTMLDivElement>(null)
  const editCardRef = useRef<HTMLDivElement>(null)
  const [newCardHeight, setNewCardHeight] = useState<number>(220)
  const [editCardHeight, setEditCardHeight] = useState<number>(280)

  // ── Responsive check ────────────────────────────────────────────────────────

  useEffect(() => {
    const check = (): void => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── localStorage load on mount ──────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bc-annotations-direction1')
      if (raw) {
        const parsed = JSON.parse(raw)
        // Validate array before processing — malformed localStorage data must not reach state
        if (!Array.isArray(parsed)) return
        // BUG 7 — migrate legacy pixel-coordinate entries to normalised fractions
        const migrated = parsed
          .filter((a): a is Annotation =>
            typeof a === 'object' && a !== null &&
            typeof a.id === 'string' &&
            typeof a.x === 'number' &&
            typeof a.y === 'number' &&
            typeof a.text === 'string' &&
            typeof a.createdAt === 'number' &&
            typeof a.resolved === 'boolean'
          )
          .map((a) => ({
            ...a,
            authorName: a.authorName ?? '',
            x: a.x > 1 ? a.x / window.innerWidth : a.x,
            y: a.y > 1 ? a.y / window.innerHeight : a.y,
          }))
        setAnnotations(migrated)
      }
    } catch { /* ignore corrupt data */ }
  }, [])

  // ── localStorage persist on change ─────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('bc-annotations-direction1', JSON.stringify(annotations))
  }, [annotations])

  // ── Body class toggle for freeze state ─────────────────────────────────────

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

  // ── BUG 8 — measure new card height after render ────────────────────────────

  useEffect(() => {
    if (newCardRef.current) {
      setNewCardHeight(newCardRef.current.offsetHeight)
    }
  }, [pendingClick, draftName, draftText])

  // ── BUG 8 — measure edit card height after render ───────────────────────────

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

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleCancel])

  // ── enterAnnotationMode ─────────────────────────────────────────────────────

  const enterAnnotationMode = (): void => {
    setIsActive(true)
    const map = mapRef.current
    if (map !== null) {
      map.dragPan.disable()
      map.scrollZoom.disable()
      map.touchZoomRotate.disable()
      map.keyboard.disable()
      map.doubleClickZoom.disable()
      map.dragRotate.disable()
    }
    popupRef.current?.remove()
    onClearSensor()
  }

  // ── exitAnnotationMode ──────────────────────────────────────────────────────

  const exitAnnotationMode = (): void => {
    handleCancel()
    const map = mapRef.current
    if (map !== null) {
      map.dragPan.enable()
      map.scrollZoom.enable()
      map.touchZoomRotate.enable()
      map.keyboard.enable()
      map.doubleClickZoom.enable()
      map.dragRotate.enable()
    }
    setIsActive(false)
  }

  // ── handleOverlayClick ──────────────────────────────────────────────────────
  // BUG 1 — guard against overwriting an unsaved pending card or open edit card.
  // BUG 11 is also resolved here: double-click is ignored once pendingClick is set.

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
  // BUG 7 — store x/y as normalised viewport fractions, not raw pixels.

  const handleSave = (): void => {
    if (pendingClick === null || draftText.trim() === '') return
    setAnnotations(prev => [...prev, {
      id: Date.now().toString(),
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
  // anchorX and anchorY are raw viewport pixels (converted from normalised fractions before calling).

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

  const cardStyle: React.CSSProperties = {
    background: 'var(--bc-semantic-map-overlay)',
    border: '1px solid var(--bc-semantic-map-grid)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 110,
    fontFamily: 'var(--bc-font-family-sans, sans-serif)',
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '72px',
    resize: 'none',
    background: 'var(--bc-semantic-bg)',
    border: '1px solid var(--bc-semantic-border)',
    borderRadius: '6px',
    color: 'var(--bc-semantic-text)',
    fontFamily: 'var(--bc-font-family-sans, sans-serif)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.625rem',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '0.5rem',
    display: 'block',
  }

  const nameInputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bc-semantic-bg)',
    border: '1px solid var(--bc-semantic-border)',
    borderRadius: '6px',
    color: 'var(--bc-semantic-text)',
    fontFamily: 'var(--bc-font-family-sans, sans-serif)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.625rem',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '0.5rem',
    display: 'block',
    height: '32px',
  }

  const saveButtonStyle = (disabled: boolean): React.CSSProperties => ({
    background: 'var(--bc-semantic-brand)',
    color: 'var(--bc-color-white)',
    border: 'none',
    borderRadius: '6px',
    height: '32px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    fontFamily: 'var(--bc-font-family-sans, sans-serif)',
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
    color: 'var(--bc-semantic-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--bc-semantic-muted)',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '2px 4px',
    fontFamily: 'var(--bc-font-family-sans, sans-serif)',
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Body class styles ──────────────────────────────────────────────── */}
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
      {isActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            border: '2px solid var(--bc-semantic-brand)',
            pointerEvents: 'none',
            zIndex: 90,
          }}
        />
      )}

      {/* ── Toggle pill ────────────────────────────────────────────────────── */}
      {/* BUG 3 — mobile bottom raised to 148px to clear MobilePopup (bottom: 64px, ~80px tall).
          BUG 9 — mobile touch target raised to 44px height with matching padding. */}
      <button
        onClick={isActive ? exitAnnotationMode : enterAnnotationMode}
        style={{
          position: 'fixed',
          top: isMobile ? undefined : '180px',
          bottom: isMobile ? '148px' : undefined,
          right: '1rem',
          zIndex: 110,
          borderRadius: '99px',
          padding: isMobile ? '10px 18px' : '6px 14px',
          height: isMobile ? '44px' : '32px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          fontFamily: 'var(--bc-font-family-sans, sans-serif)',
          border: isActive ? 'none' : '1px solid var(--bc-semantic-map-grid)',
          background: isActive ? 'var(--bc-semantic-brand)' : 'var(--bc-semantic-map-overlay)',
          color: isActive ? 'var(--bc-color-white)' : 'var(--bc-semantic-text)',
        }}
      >
        {isActive ? 'Done annotating' : 'Annotate'}
      </button>

      {/* ── Annotation mode overlays ────────────────────────────────────────── */}
      {isActive && (
        <>
          {/* Click capture overlay */}
          <div
            onClick={handleOverlayClick}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              cursor: 'crosshair',
            }}
          />

          {/* Pins */}
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
                // BUG 7 — convert normalised fractions back to viewport pixels for rendering
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
              {/* Circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: annotation.resolved ? 'var(--bc-semantic-muted)' : 'var(--bc-semantic-brand)',
                  border: '2px solid var(--bc-color-white)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  // BUG 10 — use design system token instead of hardcoded 'white'
                  color: 'var(--bc-color-white)',
                  fontFamily: 'var(--bc-font-family-sans, sans-serif)',
                }}
              >
                {index + 1}
              </div>
              {/* Stem — BUG 6: reflect resolved state */}
              <div
                style={{
                  width: 1,
                  height: 8,
                  background: annotation.resolved ? 'var(--bc-semantic-muted)' : 'var(--bc-semantic-brand)',
                }}
              />
            </div>
          ))}

          {/* Comment input card (new) */}
          {/* BUG 8 — ref attached; measured height passed to getCardPosition */}
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
              {/* BUG 2 — onKeyDown added to name input: stopPropagation + explicit Escape handling */}
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
          {/* BUG 8 — ref attached; measured height passed to getCardPosition */}
          {editingId !== null && (() => {
            const ann = annotations.find(a => a.id === editingId)
            if (ann === undefined) return null
            // BUG 4 — derive pin number from index for display in header
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
                  {/* BUG 4 — show pin number in edit card header */}
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
                    color: 'var(--bc-semantic-muted)',
                    marginBottom: '0.5rem',
                    fontFamily: 'var(--bc-font-family-sans, sans-serif)',
                  }}
                >
                  {formatDate(ann.createdAt)}
                </div>
                {/* BUG 2 — onKeyDown added to name input: stopPropagation + explicit Escape handling */}
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
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--bc-font-family-sans, sans-serif)',
                    marginBottom: '0.25rem',
                    border: ann.resolved
                      ? '1px solid var(--bc-semantic-muted)'
                      : '1px solid var(--bc-semantic-success)',
                    background: 'transparent',
                    color: ann.resolved
                      ? 'var(--bc-semantic-muted)'
                      : 'var(--bc-semantic-success)',
                  }}
                >
                  {ann.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
                </button>
                {/* BUG 5 — note below resolved toggle clarifying immediate vs Save behaviour */}
                <p
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--bc-semantic-muted)',
                    margin: '0 0 0.5rem 0',
                    fontFamily: 'var(--bc-font-family-sans, sans-serif)',
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
                      color: 'var(--bc-semantic-error)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontFamily: 'var(--bc-font-family-sans, sans-serif)',
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
