/**
 * AchievementTimeline.tsx — the NARRATIVE SPINE of the AQ Network profile.
 *
 * Purpose
 *   Renders a city's journey as a single vertical spine: the achievement cards (oldest → newest)
 *   leading into ONE terminal 2030-GOAL node that all the cards point toward. This is where the
 *   concept's framing rules are enforced VISUALLY:
 *     - City is the hero, BC is the credit. The card headline (city-as-actor, authored in the
 *       data) is the dominant element; BC appears ONLY as a small "Supported by BC · [pillar]"
 *       tag. The component never renders "BC did X".
 *     - Claim support, never outcomes. These cards are support ACTIVITIES; there is no
 *       outcome/metric slot, so a card can't present a pollution-reduction OUTCOME as an
 *       achievement. The goal node is a shared DESTINATION, not a claimed result.
 *     - The sequence is the point, the dates are approximate. Each card shows its (estimated)
 *       year; a one-line note states the dates are approximate and the value is the order —
 *       "what did the city do first" as a shared-learning signal.
 *
 * Rendering approach
 *   A connected vertical timeline (one rule, a node per card) that CULMINATES in a distinct,
 *   brand-filled goal node on the SAME spine — so the whole section reads as a trajectory with a
 *   destination. Each pillar has a BC-token colour for its node + tag, matching PillarRadar so
 *   timeline and radar read as one system. Colours are BC tokens only (no hardcoded hex).
 *
 * Key exports: AchievementTimeline (named)
 * External dependencies: react (types), lucide-react (Flag), ../_data/types (AchievementCard,
 *   PILLAR_BY_ID, PillarId).
 */

import type { ReactElement } from 'react'
import { Flag } from 'lucide-react'
import {
  PILLAR_BY_ID,
  type AchievementCard,
  type PillarId,
} from '../_data/types'

/**
 * BC token colour per pillar — MUST match PillarRadar's mapping so the timeline node/tag
 * colour and the radar dot colour are the same hue for a given pillar.
 */
const PILLAR_COLOR_VAR: Readonly<Record<PillarId, string>> = {
  1: 'var(--bc-color-blue)',
  2: 'var(--bc-color-teal)',
  3: 'var(--bc-color-tangerine)',
  4: 'var(--bc-color-green)',
}

/** Props for AchievementTimeline. */
type AchievementTimelineProps = {
  /** The city's achievement cards, authored oldest→newest (the spine of the profile). */
  achievements: AchievementCard[]
  /** City display name — used in the goal node's framing line. */
  cityName: string
  /** The shared 2030 goal headline (trajectory.goalLabel, e.g. "30% cleaner air by 2030"). */
  goalLabel: string
  /** The city's honest stage label (trajectory.stageLabel, e.g. "Early on the journey"). */
  stageLabel: string
}

/**
 * One achievement card on the spine. A small muted YEAR sits above the city-as-actor headline
 * (the hero); the BC credit is a small pillar-coloured "Supported by BC · [pillar]" tag. The
 * pillar colour ties the node, the tag, and the radar together.
 */
function AchievementRow({ card }: { card: AchievementCard }): ReactElement {
  const pillar = PILLAR_BY_ID[card.pillar]
  const color = PILLAR_COLOR_VAR[card.pillar]

  return (
    <li className="relative pl-10">
      {/* Timeline node — sits on the vertical rule, coloured by pillar. */}
      <span
        aria-hidden="true"
        className="absolute left-[11px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background"
        style={{ backgroundColor: color }}
      />

      <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
        {/* Approximate year — small, muted, above the headline (the spine's ordering signal). */}
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {card.year}
        </p>

        {/* HERO: the city as actor. */}
        <h3 className="mt-0.5 text-base font-semibold leading-snug text-foreground sm:text-lg">
          {card.headline}
        </h3>

        {card.detail !== undefined && (
          <p className="mt-1.5 text-sm text-muted-foreground">{card.detail}</p>
        )}

        {/* CREDIT: BC support as a small attribution tag — never the hero. The "Supported by
            BC" prefix is literal so the card can never read as "BC did X for the city". */}
        <div className="mt-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              // Tag uses a tint of the pillar colour via color-mix so it stays on-brand and
              // legible in light mode without introducing a hardcoded hex.
              backgroundColor: `color-mix(in srgb, ${color} 14%, var(--bc-color-white))`,
              color: 'var(--bc-semantic-text)',
            }}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            Supported by BC · {pillar.label}
          </span>
        </div>
      </div>
    </li>
  )
}

/**
 * The TERMINAL goal node — the destination the whole spine leads into. Visually distinct from the
 * achievement cards: a brand-filled node + brand-gradient card carrying the shared 2030 goal and
 * the city's honest stage label. It sits on the SAME vertical rule (same pl-10 + node position) so
 * it reads as the end of one trajectory, not a separate section. It is a shared DESTINATION, never
 * a claimed outcome (no metric here — just the goal and where the city is on the way to it).
 */
function GoalNode({
  cityName,
  goalLabel,
  stageLabel,
}: {
  cityName: string
  goalLabel: string
  stageLabel: string
}): ReactElement {
  return (
    <li className="relative pl-10">
      {/* Goal node marker — brand-filled, larger than a card node, with a flag glyph so it reads
          as the destination. Sits on the same rule as the card nodes. */}
      <span
        aria-hidden="true"
        className="absolute left-[6px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background"
        style={{ backgroundColor: 'var(--bc-semantic-brand)' }}
      >
        <Flag className="h-3 w-3 text-bc-white" aria-hidden="true" />
      </span>

      {/* Goal card — brand gradient (matches the former 2030 panel) so the destination is
          unmistakably the brand-owned shared goal, distinct from the white achievement cards. */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{
          background:
            'linear-gradient(135deg, var(--bc-color-dark-blue), var(--bc-color-blue))',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-bc-white/80">
          The 2030 goal
        </p>
        <p className="mt-1 text-2xl font-bold leading-tight text-bc-white sm:text-3xl">
          {goalLabel}
        </p>
        <p className="mt-2 text-sm text-bc-white/90">
          The destination every milestone above is building toward — a goal shared across all
          Breathe Cities members.
        </p>
        <p className="mt-3 inline-flex w-fit rounded-full bg-bc-white/20 px-3 py-1 text-xs font-semibold text-bc-white">
          {cityName}: {stageLabel}
        </p>
      </div>
    </li>
  )
}

/**
 * The narrative spine. Renders the vertical rule, one AchievementRow per card (in the data's
 * oldest→newest order), then the terminal GoalNode on the same rule. A small "dates approximate"
 * note sits under the spine. Reordering cards changes only display order — the radar (counted
 * elsewhere) is order-independent.
 */
export function AchievementTimeline({
  achievements,
  cityName,
  goalLabel,
  stageLabel,
}: AchievementTimelineProps): ReactElement {
  return (
    <div>
      <ol className="relative space-y-4">
        {/* The vertical rule the nodes sit on. Spans from the first card node down INTO the goal
            node so the cards visibly flow into the destination (one continuous spine). */}
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-2 bottom-3 w-px bg-border"
        />
        {achievements.map((card) => (
          <AchievementRow key={card.id} card={card} />
        ))}
        {/* The destination — same spine, distinct brand-filled node. */}
        <GoalNode
          cityName={cityName}
          goalLabel={goalLabel}
          stageLabel={stageLabel}
        />
      </ol>

      {/* Honest note: the sequence is the signal, the dates are approximate. */}
      <p className="mt-3 pl-10 text-xs text-muted-foreground">
        Dates are approximate — the point is the sequence (what {cityName} did first), a
        shared-learning signal for other cities.
      </p>
    </div>
  )
}
