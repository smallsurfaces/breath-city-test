/**
 * CityPanel.tsx — the city detail panel for the proof-directory globe.
 *
 * Purpose / what the user sees + does
 *   When a clickable pin is opened on the ProofGlobe, this panel slides in — a RIGHT-SIDE panel on
 *   desktop, a BOTTOM SHEET on mobile — while the globe stays visible behind a light scrim. It is
 *   the payoff of the toolkit hero: "here is exactly what a city like yours deployed."
 *
 *   Header (every city): name, country, region tag, and city POPULATION with an Estimate pill.
 *   Body, two honest shapes:
 *     - PROVEN city → a list of the tools that city runs. Each row: tool name + one-line blurb, a
 *       category tag (Component / Guidance), an optional "via <provider>" third-party label, an
 *       optional "illustrative" tag (educated-guess presence), and a CONDITIONAL CTA — a real URL
 *       renders "See the tool →"; no URL renders a visibly DISABLED "Link coming soon".
 *     - NEWLY-JOINED city → an honest empty state ("Newly joined. As <city> rolls out tools,
 *       they'll appear here.") — NO fabricated rows.
 *
 * Honesty (the project's backbone)
 *   The CTA is the honest bit: it fires ONLY on a real researched URL and is otherwise disabled —
 *   so a city can show it HAS a tool even where we hold no link. Third-party links are framed "see
 *   the tool this city uses" via the provider label, not "visit the city's own site". Population is
 *   city population, labelled an estimate, never implied reach.
 *
 * Styling (concept-prototyping standard)
 *   BC tokens only, no hardcoded hex. Bridged shadcn semantics for neutrals; inline
 *   `var(--bc-*)` for the functional category / illustrative / estimate tints. Light mode only.
 *
 * Key exports: CityPanel (named)
 * External dependencies: react, lucide-react, ../_data/proof-cities (types).
 *
 * Side effects (all cleaned up):
 *   - Attaches a keydown listener for Escape-to-close while a city is open; removed on close/unmount.
 */

'use client'

import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { X, ArrowRight } from 'lucide-react'
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

/**
 * One tool row. Shows the tool name, blurb, category tag, optional provider + illustrative tags,
 * and the conditional CTA. The CTA is the honesty mechanic: a real `url` → active "See the tool →"
 * link (opens in a new tab); a null `url` → a visibly DISABLED "Link coming soon" (never a dead
 * link). Illustrative (educated-guess) rows never carry an active CTA — they fall through to the
 * disabled treatment.
 */
function ToolRow({ tool }: { tool: ProofTool }): ReactElement {
  const hasLink = tool.url !== null

  return (
    <li className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Tool name + optional third-party provider label. */}
          <p className="text-sm font-semibold text-foreground">
            {tool.name}
            {tool.provider !== null && (
              <span className="ml-1.5 font-normal text-muted-foreground">via {tool.provider}</span>
            )}
          </p>
          {/* One-line blurb. */}
          <p className="mt-1 text-sm text-muted-foreground">{tool.blurb}</p>
        </div>
      </div>

      {/* Tag row + CTA. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Category tag — functional colour (Component / Guidance). */}
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={categoryTagStyle(tool.category)}
        >
          {tool.category}
        </span>

        {/* Illustrative tag — flags an educated-guess presence (functional muted wash). */}
        {tool.illustrative && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bc-color-steel) 30%, var(--bc-color-white))' }}
          >
            Illustrative
          </span>
        )}

        {/* Conditional CTA — active link on a real URL, disabled "Link coming soon" otherwise. */}
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
    </li>
  )
}

/**
 * The city panel. Renders nothing when `city` is null. Otherwise: a light scrim over the globe, a
 * right-side panel on desktop (`sm:` and up) that collapses to a bottom sheet on mobile, a header
 * (name / country / region / city population with Estimate pill), and a body that is either the
 * tool list (proven) or the honest empty state (newly-joined).
 */
export function CityPanel({ city, onClose }: CityPanelProps): ReactElement | null {
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

  const isNewlyJoined = city.state === 'newly-joined'

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
        Panel surface. Mobile: bottom sheet (full width, anchored bottom, rounded top).
        Desktop (sm+): right-side panel (fixed width, full height of the globe area, rounded left).
        The globe wrapper is `relative` so this `absolute` panel scopes to the globe, not the page.
      */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${city.name} tools`}
        className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-2xl border border-border bg-background shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[380px] sm:rounded-l-2xl sm:rounded-tr-none"
      >
        <div className="p-5 sm:p-6">
          {/* Header row — region tag + close button. */}
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
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{city.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{city.country}</p>

          {/* City population — labelled estimate (the Estimate pill, matching the section stat). */}
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                City population
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--bc-color-yellow) 30%, var(--bc-color-white))',
                  color: 'var(--bc-semantic-text)',
                }}
              >
                Estimate
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {`~${city.population.toLocaleString()}`}
            </p>
          </div>

          {/* Body — tool list (proven) OR honest empty state (newly-joined). */}
          {isNewlyJoined ? (
            // Honest empty state — NO fabricated rows. The mixed state is a feature.
            <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-center">
              <p className="text-sm font-semibold text-foreground">Newly joined</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {`As ${city.name} rolls out tools, they'll appear here.`}
              </p>
            </div>
          ) : (
            <>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tools this city runs
              </p>
              <ul className="mt-3 space-y-3">
                {city.tools.map((tool) => (
                  <ToolRow key={tool.id} tool={tool} />
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
