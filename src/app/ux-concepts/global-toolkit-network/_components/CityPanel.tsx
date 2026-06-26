/**
 * CityPanel.tsx — the city detail panel for the proof-directory globe (v2, low-scroll redesign).
 *
 * Purpose / what the user sees + does
 *   When a pin is opened on the ProofGlobe, this panel slides in — a MOBILE HALF-SHEET (peek, then
 *   drag to full) on small screens, a RIGHT-SIDE slide-in panel on desktop — while the globe stays
 *   visible behind a light scrim. It is the payoff of the toolkit hero: "here is exactly what a city
 *   like yours runs."
 *
 *   STICKY HEADER (every city): city name + country, region tag, city POPULATION with an Estimate
 *   pill, and a one-line proof summary ("Running 5 AQ tools.").
 *
 *   CONDENSED TOOL ROWS (the core v2 rework — kills the v1 scroll):
 *     - Each tool is ONE LINE by default: name (truncates) + a small category tag (Component /
 *       Guidance) + a trailing chevron affordance. The blurb is HIDDEN.
 *     - Tap a row → it expands as an accordion (ONE open at a time), revealing the one-line blurb,
 *       the optional "via <provider>" third-party label, the optional "illustrative" tag, and the
 *       action: a real URL renders the primary "See the tool →" (right-aligned, thumb-reachable);
 *       no URL renders a visibly DISABLED "Link coming soon".
 *
 * Mobile half-sheet mechanic
 *   Opens at ~55% viewport height (peek — globe stays visible above). A drag handle / tap expands it
 *   to full height for cities with many tools; tapping again collapses back to peek. Desktop ignores
 *   the peek/full state — it is a full-height right-side panel.
 *
 * Honesty (the project's backbone)
 *   The CTA is the honest bit: it fires ONLY on a real researched URL and is otherwise disabled — so
 *   a city can show it RUNS a tool even where we hold no link. Illustrative (educated-guess) rows
 *   carry a quiet "illustrative" tag and always fall through to the disabled CTA. Third-party links
 *   are framed "see the tool this city uses" via the provider label. Population is city population,
 *   labelled an estimate, never implied reach.
 *
 * Styling (concept-prototyping standard)
 *   BC tokens only, no hardcoded hex. Bridged shadcn semantics for neutrals; inline `var(--bc-*)`
 *   for the functional category / illustrative / estimate tints. Light mode only.
 *
 * Key exports: CityPanel (named)
 * External dependencies: react, lucide-react, ../_data/proof-cities (types).
 *
 * Side effects (all cleaned up):
 *   - Attaches a keydown listener for Escape-to-close while a city is open; removed on close/unmount.
 *   - Resets the open-row + sheet-expanded state whenever a different city opens (via effect).
 */

'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { X, ArrowRight, ChevronDown } from 'lucide-react'
import type { ProofCity, ProofTool } from '../_data/proof-cities'

/** Props for CityPanel. `city` null = closed (the panel renders nothing). */
type CityPanelProps = {
  /** The open city, or null when the panel is closed. */
  city: ProofCity | null
  /** Called when the panel requests close (close button, scrim click, or Escape). */
  onClose: () => void
}

/**
 * Functional tint for a category tag. Component vs Guidance get distinct BC token tints via
 * color-mix (no new hex, no collision) — mirrors the roadmap StageBadge tinting pattern.
 */
function categoryTagStyle(category: ProofTool['category']): { backgroundColor: string; color: string } {
  // Component → brand-blue tint; Guidance → teal tint. Distinct base tokens, tinted to a soft wash.
  const base = category === 'Component' ? 'var(--bc-color-blue)' : 'var(--bc-color-teal)'
  return {
    backgroundColor: `color-mix(in srgb, ${base} 16%, var(--bc-color-white))`,
    color: 'var(--bc-semantic-text)',
  }
}

/** Props for one condensed, expandable tool row. */
type ToolRowProps = {
  /** The tool to render. */
  tool: ProofTool
  /** Whether this row is the one currently expanded (accordion — one open at a time). */
  isOpen: boolean
  /** Toggle this row open/closed. */
  onToggle: () => void
}

/**
 * One CONDENSED tool row. Collapsed: a single line — name (truncates) + category tag + chevron.
 * Expanded (accordion, one at a time): reveals the blurb, the optional provider + illustrative
 * tags, and the conditional CTA. The CTA is the honesty mechanic: a real `url` → active "See the
 * tool →" link (new tab); a null `url` → a visibly DISABLED "Link coming soon" (never a dead link).
 * Illustrative rows always carry `url: null`, so they always render the disabled treatment.
 */
function ToolRow({ tool, isOpen, onToggle }: ToolRowProps): ReactElement {
  const hasLink = tool.url !== null

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-background">
      {/* Collapsed line — the whole row is the toggle. Min-height meets the 56px touch target. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex min-h-[56px] w-full items-center gap-2.5 px-4 text-left transition-colors hover:bg-muted/50"
      >
        {/* Tool name — truncates on one line so the row never wraps when collapsed. */}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {tool.name}
        </span>
        {/* Small category tag — functional colour (Component / Guidance). */}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={categoryTagStyle(tool.category)}
        >
          {tool.category}
        </span>
        {/* Trailing affordance — rotates to signal expanded. */}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Expanded content — blurb + provider/illustrative tags + the conditional CTA. */}
      {isOpen && (
        <div className="px-4 pb-4">
          {/* One-line blurb. */}
          <p className="text-sm text-muted-foreground">{tool.blurb}</p>

          {/* Provider + illustrative tags. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {tool.provider !== null && (
              <span className="text-xs text-muted-foreground">via {tool.provider}</span>
            )}
            {tool.illustrative && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                style={{ backgroundColor: 'color-mix(in srgb, var(--bc-color-steel) 30%, var(--bc-color-white))' }}
              >
                Illustrative
              </span>
            )}

            {/* Conditional CTA — right-aligned (thumb-reachable), active link or disabled label. */}
            <span className="ml-auto">
              {hasLink ? (
                <a
                  href={tool.url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
                  style={{ color: 'var(--bc-semantic-brand)' }}
                >
                  See the tool
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span
                  className="inline-flex cursor-not-allowed items-center gap-1 text-sm font-medium text-muted-foreground opacity-60"
                  aria-disabled="true"
                  title="No public link yet for this tool"
                >
                  Link coming soon
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </li>
  )
}

/**
 * The city panel. Renders nothing when `city` is null. Otherwise: a light scrim over the globe; a
 * MOBILE HALF-SHEET (peek ~55%, drag handle expands to full) that becomes a RIGHT-SIDE panel on
 * desktop (`sm:` and up); a STICKY header (name / country / region / city population with Estimate
 * pill / one-line proof summary); and a scrollable body of condensed, one-open-at-a-time tool rows.
 */
export function CityPanel({ city, onClose }: CityPanelProps): ReactElement | null {
  // Which tool row is expanded (slug-scoped id). null = all collapsed. Accordion: one open at a time.
  const [openToolId, setOpenToolId] = useState<string | null>(null)
  // Mobile half-sheet: false = peek (~55%), true = full height. Ignored on desktop (always full).
  const [sheetExpanded, setSheetExpanded] = useState<boolean>(false)

  // Side effect: reset row + sheet state whenever a DIFFERENT city opens (or the panel closes), so a
  // newly opened city starts collapsed at peek height rather than inheriting the last city's state.
  useEffect(() => {
    setOpenToolId(null)
    setSheetExpanded(false)
  }, [city])

  // Side effect: Escape-to-close while a city is open. Listener added on open, removed on close /
  // unmount (deps include `city` so it re-binds correctly and tears down when the panel closes).
  useEffect(() => {
    if (city === null) {
      return
    }
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [city, onClose])

  if (city === null) {
    return null
  }

  // Mobile sheet height: peek vs full. Desktop overrides both via `sm:inset-y-0` + `sm:h-auto`.
  const sheetHeightClass = sheetExpanded ? 'h-[90vh]' : 'h-[55vh]'

  return (
    <div className="absolute inset-0 z-30">
      {/* Light scrim — globe stays visible behind it. Click to close. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close city panel"
        className="absolute inset-0 h-full w-full cursor-default bg-foreground/10 backdrop-blur-[1px]"
      />

      {/*
        Panel surface.
        Mobile: bottom half-sheet — peek (~55vh) or full (~90vh), anchored bottom, rounded top.
        Desktop (sm+): right-side panel — full height of the globe area, fixed width, rounded left.
        The globe wrapper is `relative` so this `absolute` panel scopes to the globe, not the page.
      */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${city.name} tools`}
        className={`absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl border border-border bg-background shadow-xl transition-[height] duration-200 ${sheetHeightClass} sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[400px] sm:rounded-l-2xl sm:rounded-tr-none`}
      >
        {/* Mobile drag handle — tap to toggle peek/full. Hidden on desktop (panel is always full). */}
        <button
          type="button"
          onClick={() => setSheetExpanded((v) => !v)}
          aria-label={sheetExpanded ? 'Collapse panel' : 'Expand panel to full height'}
          className="flex w-full shrink-0 items-center justify-center py-2.5 sm:hidden"
        >
          <span className="h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
        </button>

        {/* STICKY HEADER — stays pinned while the tool list scrolls. */}
        <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-background px-5 pb-4 pt-3 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-3">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bc-color-blue) 12%, var(--bc-color-white))',
                color: 'var(--bc-semantic-text)',
              }}
            >
              {city.region}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* City name + country. */}
          <h3 className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">{city.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{city.country}</p>

          {/* Proof summary + city population with Estimate pill — one compact row. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-sm font-medium text-foreground">{city.summary}</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="tabular-nums">{`~${city.population.toLocaleString()}`} residents</span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--bc-color-yellow) 30%, var(--bc-color-white))',
                  color: 'var(--bc-semantic-text)',
                }}
              >
                Estimate
              </span>
            </span>
          </div>
        </div>

        {/* SCROLLABLE BODY — condensed tool rows, one expanded at a time. */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <ul className="space-y-2.5">
            {city.tools.map((tool) => (
              <ToolRow
                key={tool.id}
                tool={tool}
                isOpen={openToolId === tool.id}
                onToggle={() => setOpenToolId((cur) => (cur === tool.id ? null : tool.id))}
              />
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
