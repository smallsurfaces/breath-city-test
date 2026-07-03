/**
 * CityPanel.tsx — the city detail panel for the proof-directory globe (v4, curated single-platform model).
 *
 * Purpose / what the user sees + does
 *   When a pin is opened on the ProofGlobe, this panel slides in — a MOBILE HALF-SHEET (peek, then
 *   drag to full) on small screens, a RIGHT-SIDE slide-in panel on desktop — while the globe stays
 *   visible behind a light scrim. It is the payoff of the toolkit hero: "here is the air-quality
 *   platform this city runs."
 *
 *   STICKY HEADER (every city): city name + country, region tag, and city POPULATION (the `~` carries
 *   the approximation — no Estimate pill; Fix 1/2). The one-line "Running N tools" proof summary was
 *   removed (Fix 2).
 *
 *   STORY LEAD (every city): a short, real one-line adoption story rendered at the TOP of the
 *   scrollable body, above the tool list (the approved hybrid: story first, then tools).
 *
 *   TOOL ROWS (v4 — the curated single-platform model, supersedes the v3 category-led grouping):
 *     The panel renders the city's REAL tools DIRECTLY — one flat row per `city.tools` entry, in the
 *     data's natural array order — with NO catalogue-capability grouping. The prior model grouped tools
 *     under matched catalogue capabilities and DROPPED any tool that matched no keyword; under the
 *     Santiago single-platform data that silently hid whole cities (Accra, Sofia), so the panel now
 *     reads the curated data as-is. Every city carries at least one tool, so the list is never empty.
 *     Each row shows: the tool NAME, a small CATEGORY tag (Component / Guidance, from `tool.category`),
 *     the one-line BLURB, an optional "via <provider>" label, and the CTA. CTA is the SOLE honesty
 *     mechanic: a real `tool.url` renders the active "See the tool →" (new tab); a `null` url renders
 *     the visibly DISABLED "Link coming soon" state (no dead href).
 *
 *   REGION-FACTUAL PEER BLOCK (Finding 6 peer-learning cue — at the FOOT of the body):
 *     Below the capability list, a small muted region-factual label (peerBlockLabel — e.g. "Other
 *     African cities", with a neutral "Other cities in the region" fallback; the retired "Cities like
 *     yours" wrongly presumed we knew the visitor's own city) followed by the OTHER plotted cities in
 *     the SAME region as tappable chips. This is peer-learning, NOT a ranking: no scores,
 *     no order-by-anything, no leading/behind language. Tapping a chip swaps the open city
 *     (onSelectPeer), and the panel's city-change effect resets row/sheet state so the peer opens
 *     clean. The block renders nothing when there are no peers.
 *
 * Mobile half-sheet mechanic
 *   Opens at ~55% viewport height (peek — globe stays visible above). A drag handle / tap expands it
 *   to full height for cities with more content; tapping again collapses back to peek. Desktop
 *   ignores the peek/full state — it is a full-height right-side panel.
 *
 * Honesty (the project's backbone — v3)
 *   The CTA link-state is the SOLE honesty mechanic: a "See the tool →" link fires ONLY on a real
 *   proven-live URL; where we hold no URL the CTA renders the visibly DISABLED "Link coming soon" state
 *   (no dead href) — so a city still shows the platform it RUNS even where we hold no proven link.
 *   Every tool is real and research-grounded (the illustrative/educated-guess concept is retired).
 *   Third-party links are framed "see the tool this city uses" via the provider label. Population is
 *   city population (the `~` signals approximation), never implied reach.
 *
 * Styling (concept-prototyping standard)
 *   BC tokens only, no hardcoded hex. Bridged shadcn semantics for neutrals; inline `var(--bc-*)`
 *   for the functional category tint. Light mode only.
 *
 * Key exports: CityPanel (named)
 * External dependencies: react, lucide-react, ../_data/proof-cities (types only).
 *
 * Side effects (all cleaned up):
 *   - Attaches a keydown listener for Escape-to-close while a city is open; removed on close/unmount.
 *   - Resets the sheet-expanded state whenever a different city opens (via effect).
 */

'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { X, ArrowRight } from 'lucide-react'
import type { ProofCity, ProofTool, ToolCategory } from '../_data/proof-cities'

/** Props for CityPanel. `city` null = closed (the panel renders nothing). */
type CityPanelProps = {
  /** The open city, or null when the panel is closed. */
  city: ProofCity | null
  /** Called when the panel requests close (close button, scrim click, or Escape). */
  onClose: () => void
  /**
   * Peer cities for the region-factual peer block — the other plotted cities in the SAME region as
   * the open city (caller computes; excludes the open city itself). These are comparable peers for
   * peer-learning, NOT a ranking: pass them in natural array order, no sorting. Empty = block hidden.
   */
  peers: ProofCity[]
  /** Called with a peer city when a peer chip is tapped (caller swaps the open city). */
  onSelectPeer: (city: ProofCity) => void
}

/**
 * Functional tint for a tool's category tag. Component vs Guidance get distinct BC token tints via
 * color-mix (no new hex, no collision) — mirrors the roadmap StageBadge tinting pattern. Keyed off the
 * tool's own `category` ('Component' | 'Guidance') now that the panel renders one row per real tool
 * directly (curated single-platform model), rather than grouping tools under catalogue capabilities.
 */
function categoryTagStyle(category: ToolCategory): { backgroundColor: string; color: string } {
  // Component → brand-blue tint; Guidance → teal tint. Distinct base tokens, tinted to a soft wash.
  const base = category === 'Component' ? 'var(--bc-color-blue)' : 'var(--bc-color-teal)'
  return {
    backgroundColor: `color-mix(in srgb, ${base} 16%, var(--bc-color-white))`,
    color: 'var(--bc-semantic-text)',
  }
}

/** Human-readable label for a tool's category — the small tag shown beside the tool name. */
function categoryLabel(category: ToolCategory): string {
  return category === 'Component' ? 'Component' : 'Guidance'
}

/**
 * Region-factual peer-block label. Maps a city's `region` to a region adjective and returns a label
 * that makes NO assumption about the visitor's own city (the retired "Cities like yours" presumed
 * we knew where the visitor was). Known regions read "Other <adjective> cities"; any unmapped region
 * falls back to the neutral "Other cities in the region".
 *
 * EU → "Other European cities", Africa → "Other African cities",
 * LatAm → "Other Latin American cities", SE Asia → "Other Southeast Asian cities".
 */
function peerBlockLabel(region: ProofCity['region']): string {
  const adjectiveByRegion: Record<string, string> = {
    EU: 'European',
    Africa: 'African',
    LatAm: 'Latin American',
    'SE Asia': 'Southeast Asian',
  }
  const adjective = adjectiveByRegion[region]
  return adjective === undefined ? 'Other cities in the region' : `Other ${adjective} cities`
}

/**
 * One tool row — the panel's core unit under the curated single-platform model. The panel renders the
 * city's REAL tools directly (one row per `city.tools` entry, natural array order); there is no longer
 * any capability grouping, so a city with a single curated platform (Accra, Sofia) shows exactly that
 * one row rather than being dropped when its tool matches no catalogue keyword.
 *
 * A row shows: the tool NAME, a small CATEGORY tag ('Component' / 'Guidance', from `tool.category`),
 * the one-line BLURB, an optional "via <provider>" label, and the CTA. CTA is the sole honesty
 * mechanic: a real `tool.url` renders the active "See the tool →" link (new tab); a `null` url renders
 * the visibly DISABLED "Link coming soon" state (no dead href, not focusable).
 */
function ToolRow({ tool }: { tool: ProofTool }): ReactElement {
  const hasLink = tool.url !== null

  return (
    <li className="rounded-xl border border-border bg-background p-4">
      {/* Name + category tag on one line — name takes the space, tag pinned right. */}
      <div className="flex items-start justify-between gap-2.5">
        <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{tool.name}</p>
        {/* Small category tag — functional colour (Component / Guidance), from the tool's own category. */}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={categoryTagStyle(tool.category)}
        >
          {categoryLabel(tool.category)}
        </span>
      </div>

      {/* One-line blurb. */}
      <p className="mt-1 text-sm text-muted-foreground">{tool.blurb}</p>

      {/* Provider tag + CTA (active link or disabled "Link coming soon"). */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {tool.provider !== null && (
          <span className="text-xs text-muted-foreground">via {tool.provider}</span>
        )}

        {/* CTA — right-aligned (thumb-reachable). Real url → active link; null → disabled placeholder. */}
        {hasLink ? (
          <span className="ml-auto">
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
          </span>
        ) : (
          <span
            className="ml-auto inline-flex cursor-not-allowed items-center text-sm font-medium text-muted-foreground"
            aria-disabled="true"
          >
            Link coming soon
          </span>
        )}
      </div>
    </li>
  )
}

/**
 * The city panel. Renders nothing when `city` is null. Otherwise: a light scrim over the globe; a
 * MOBILE HALF-SHEET (peek ~55%, drag handle expands to full) that becomes a RIGHT-SIDE panel on
 * desktop (`sm:` and up); a STICKY header (name / country / region / city population — `~` carries the
 * approximation, no Estimate pill, no proof-summary line); and a scrollable body that leads with the
 * one-line adoption story then lists the city's real tool rows directly (one per `city.tools` entry).
 */
export function CityPanel({ city, onClose, peers, onSelectPeer }: CityPanelProps): ReactElement | null {
  // Mobile half-sheet: false = peek (~55%), true = full height. Ignored on desktop (always full).
  const [sheetExpanded, setSheetExpanded] = useState<boolean>(false)

  // Side effect: reset the sheet height whenever a DIFFERENT city opens (or the panel closes), so a
  // newly opened city starts at peek height rather than inheriting the last city's expanded state.
  useEffect(() => {
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

          {/* City population — one compact line. The leading `~` carries the approximation; the old
              Estimate pill and the "Running N tools" proof-summary line were removed (Fix 2). */}
          <div className="mt-3 text-sm text-muted-foreground">
            <span className="tabular-nums">{`~${city.population.toLocaleString()}`} residents</span>
          </div>
        </div>

        {/* SCROLLABLE BODY — a short real adoption story (lead), then the city's real tool rows. */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {/* Story lead — the approved hybrid: story first, tools below. Muted concept-layer copy. */}
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{city.story}</p>
          {/* Tool rows — the city's REAL curated platform(s), one row per tool in natural array order.
              No capability grouping: a single-platform city (Accra, Sofia) shows its one row, and each
              row's CTA carries the honesty (active "See the tool" vs disabled "Link coming soon").
              Every city carries at least one tool, so this list is never empty. */}
          {city.tools.length > 0 && (
            <ul className="space-y-2.5">
              {city.tools.map((tool) => (
                <ToolRow key={tool.id} tool={tool} />
              ))}
            </ul>
          )}

          {/*
            REGION-FACTUAL PEER BLOCK — Finding 6 peer-learning cue, appended below the tools.
            Peers are the same-region cities (computed + passed by the caller). Peer-learning, NOT a
            ranking: chips render in natural order, no scores, no leading/behind copy. Hidden when
            there are no peers.
          */}
          {peers.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              {/* Small muted label — matches the file's uppercase/tracking-wide/muted small-label idiom.
                  Region-factual copy (peerBlockLabel) — no presumption of the visitor's own city. */}
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {peerBlockLabel(city.region)}
              </p>
              {/* Tappable peer chips — bordered, rounded-full, neutral on-token surface; ~44px tap size. */}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {peers.map((peer) => (
                  <button
                    key={peer.slug}
                    type="button"
                    onClick={() => onSelectPeer(peer)}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {peer.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
