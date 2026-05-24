/**
 * CollectiveGoalImpact.tsx — the AQ Network homepage's "Collective goal & impact" section body.
 *
 * Purpose
 *   Two stacked cards that carry the network's SHARED story now that the per-city journey spine
 *   has been removed (the "members are the achievement" idea is carried by the Member cities grid):
 *     1. The shared 2030 GOAL — a brand-gradient card ("30% cleaner air by 2030").
 *     2. The collective HEALTH IMPACT — a brand-tinted card with Breathe Cities' three published
 *        per-decade figures (childhood-asthma cases, economic savings, premature deaths avoided),
 *        attributed via DataSource and labelled a projection.
 *
 *   These are the SAME two cards that previously lived as the GoalNode / PayoffNode on the old
 *   NetworkTimeline spine — lifted verbatim in styling (the dark-blue goal gradient and the
 *   brand-tinted impact card both read right), minus the spine wrappers (no <li>, no vertical
 *   rule, no circular node-markers — with no city nodes to connect, those would dangle).
 *
 * Honesty contract
 *   The collective figures are Breathe Cities' PUBLISHED estimates — a projection of the prize for
 *   the whole network hitting the 2030 goal, not a measured result. Attributed via DataSource and
 *   explicitly labelled an estimate/projection.
 *
 * Key exports: CollectiveGoalImpact (named), CollectiveImpactFigures (named type)
 * External dependencies: react (types), ./DataSource (collective-impact attribution).
 *   BC semantic tokens only — no hardcoded hex.
 */

import type { ReactElement } from 'react'
import { DataSource } from './DataSource'

/**
 * The three collective health-impact figures — Breathe Cities' published per-decade estimates for
 * the whole network hitting the 2030 goal. Passed in as display strings so this component owns
 * presentation only.
 */
export type CollectiveImpactFigures = {
  /** Childhood-asthma cases avoided per decade (display string, e.g. "~79,000"). */
  asthmaCases: string
  /** Economic savings (display string, e.g. "~$107 billion"). */
  economicSavings: string
  /** Premature deaths avoided per decade (display string, e.g. "~39,000"). */
  deathsAvoided: string
}

/** Props for CollectiveGoalImpact. */
type CollectiveGoalImpactProps = {
  /** The shared network 2030 goal headline (e.g. "30% cleaner air by 2030"). */
  goalLabel: string
  /** The collective health-impact figures (see CollectiveImpactFigures). */
  impact: CollectiveImpactFigures
}

/**
 * The shared 2030-goal card — a brand-gradient card naming the single destination every member
 * city is working toward. Brand-FILLED (gradient) so the goal reads as the brand-owned destination.
 * This is the former spine GoalNode's card body, minus the <li>/marker/spine wrappers.
 */
function GoalCard({ goalLabel }: { goalLabel: string }): ReactElement {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{
        background:
          'linear-gradient(135deg, var(--bc-color-dark-blue), var(--bc-color-blue))',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-bc-white/80">
        The shared 2030 goal
      </p>
      <p className="mt-1 text-2xl font-bold leading-tight text-bc-white sm:text-3xl">
        {goalLabel}
      </p>
      <p className="mt-2 text-sm text-bc-white/90">
        One goal, shared across the whole Breathe Cities network — every member city working
        toward the same destination.
      </p>
    </div>
  )
}

/**
 * The collective health-impact card — brand-TINTED (wash + border tint) so it reads as the upside
 * rather than a second brand-filled destination. Carries Breathe Cities' three published per-decade
 * figures, attributed via DataSource and explicitly labelled a projection. This is the former spine
 * PayoffNode's card body, minus the <li>/marker/spine wrappers.
 */
function ImpactCard({
  impact,
}: {
  impact: CollectiveImpactFigures
}): ReactElement {
  return (
    <div
      className="rounded-2xl border p-6 shadow-sm"
      style={{
        borderColor:
          'color-mix(in srgb, var(--bc-semantic-brand) 25%, var(--bc-color-white))',
        backgroundColor:
          'color-mix(in srgb, var(--bc-semantic-brand) 6%, var(--bc-color-white))',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        The collective prize
      </p>

      {/* HERO: the collective payoff if the whole network hits the 2030 goal. */}
      <p className="mt-2 text-lg font-semibold leading-snug text-foreground sm:text-xl">
        If the whole network reaches the 2030 goal, the shared prize across all member cities is
        substantial.
      </p>

      {/* The three published figures — childhood asthma + dollars saved leading, deaths present. */}
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {impact.asthmaCases}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            new childhood-asthma cases avoided per decade
          </p>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {impact.economicSavings}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">in economic savings</p>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {impact.deathsAvoided}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            premature deaths avoided per decade
          </p>
        </div>
      </div>

      {/* Honesty: Breathe Cities' published projection, not a measured result — attributed. */}
      <div
        className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-4"
        style={{
          borderColor:
            'color-mix(in srgb, var(--bc-semantic-brand) 18%, var(--bc-color-white))',
        }}
      >
        <span className="text-xs text-muted-foreground">
          Breathe Cities&rsquo; published estimates for the collective 30%-by-2030 goal — a
          projection of the prize, not a measured result.
        </span>
        <DataSource
          variant="attribution"
          name="Breathe Cities"
          href="https://breathecities.org"
        />
      </div>
    </div>
  )
}

/**
 * The "Collective goal & impact" section body — the shared 2030 goal card stacked above the
 * collective health-impact card. No spine, no vertical rule, no node markers (those belonged to the
 * removed per-city journey timeline). The two cards keep their own established styling so the
 * section reads as goal → its collective prize.
 */
export function CollectiveGoalImpact({
  goalLabel,
  impact,
}: CollectiveGoalImpactProps): ReactElement {
  return (
    <div className="space-y-4">
      <GoalCard goalLabel={goalLabel} />
      <ImpactCard impact={impact} />
    </div>
  )
}
