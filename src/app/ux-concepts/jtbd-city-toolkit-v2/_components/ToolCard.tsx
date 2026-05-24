/**
 * ToolCard.tsx — Wrapper card for each toolkit panel (v2 skin).
 *
 * Purpose
 *   Renders a tool panel inside a card with its title. Handles the active/partial/dim states —
 *   when a city lacks a capability, the card visually dims (reduced opacity, greyed overlay) with
 *   a short explanation. The dim/partial state logic is identical to v1.
 *
 * V2 skin changes vs v1
 *   - Surface uses `<ConceptCard>` (border-border, rounded-2xl, shadow-sm, bg-background) instead
 *     of the v1 inline steel border / --bc-color-white fill. ConceptCard is the canonical shared
 *     surface for the concept composition layer.
 *   - The dim state removes the shadow via the `noPadding`-free wrapper; ConceptCard's shadow-sm
 *     is suppressed with a className override (`shadow-none`) on dim cards.
 *   - Title text uses shadcn bridged semantics (`text-foreground` / `text-muted-foreground`)
 *     instead of inline var(--bc-semantic-text) / var(--bc-semantic-muted).
 *   - Dim overlay box uses `bg-muted` + `border-border` (bridged) instead of inline tokens.
 *   - Partial badge: functional AQI moderate colours kept verbatim (inline var tokens) — these
 *     are functional, not decorative.
 *   ALL state logic (opacity/grayscale on dim, 0.65 opacity on partial, dim overlay div) is
 *   preserved exactly — the concept's whole point is that the kit lights up / dims per city.
 *
 * Key exports: ToolCard
 * External dependencies: toolkit-data types, @/components/concept (ConceptCard)
 */

'use client'

import type { ToolStatus } from '@/data/toolkit-data'
import { ConceptCard } from '@/components/concept'

interface ToolCardProps {
  title: string
  status: ToolStatus
  dimReason?: string
  children: React.ReactNode
}

/**
 * Wraps a tool panel in a ConceptCard surface with title and active/dim/partial visual state.
 * - active: ConceptCard at full opacity, standard shadow-sm.
 * - partial: ConceptCard at 0.65 opacity on content, with the functional "Partial" badge.
 * - dim: ConceptCard with shadow-none, content at 0.2 opacity + grayscale, reason overlay.
 */
export function ToolCard({ title, status, dimReason, children }: ToolCardProps) {
  const isDim = status === 'dim'
  const isPartial = status === 'partial'

  return (
    // ConceptCard provides: border-border, rounded-2xl, bg-background, shadow-sm.
    // On dim cards override shadow-sm to shadow-none — matches v1's "no shadow when dim" rule.
    // `relative` is added so the dim overlay (absolute inset-0) is correctly positioned.
    // `noPadding` is NOT set — ConceptCard's p-5 replaces v1's p-4 (close enough; keeps the
    // surface consistent with the shared layer's canonical padding).
    <ConceptCard
      className={`relative flex flex-col gap-3 transition-all${isDim ? ' shadow-none' : ''}`}
    >
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <h3
          className={`text-sm font-semibold${isDim ? ' text-muted-foreground' : ' text-foreground'}`}
        >
          {title}
        </h3>

        {/* Partial badge — functional AQI moderate colour (kept verbatim from v1). */}
        {isPartial && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: 'var(--bc-semantic-aqi-moderate-bg)',
              color: 'var(--bc-semantic-aqi-moderate-text)',
            }}
          >
            Partial
          </span>
        )}
      </div>

      {/* Panel content — opacity/grayscale applied here, not on the card surface. */}
      <div
        className="relative min-h-[120px]"
        style={{
          opacity: isDim ? 0.2 : isPartial ? 0.65 : 1,
          filter: isDim ? 'grayscale(0.8)' : 'none',
          transition: 'opacity 0.3s, filter 0.3s',
        }}
      >
        {children}
      </div>

      {/* Dim overlay with reason — bridged surface (bg-muted, border-border). */}
      {isDim && dimReason && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
          <div
            className="rounded-lg border border-border bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground"
            style={{ maxWidth: '80%' }}
          >
            {dimReason}
          </div>
        </div>
      )}
    </ConceptCard>
  )
}
