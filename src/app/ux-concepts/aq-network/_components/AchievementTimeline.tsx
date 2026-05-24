/**
 * AchievementTimeline.tsx — the spine of the AQ Network profile.
 *
 * Purpose
 *   Renders a city's achievements as a vertical timeline of cards. This component is where
 *   the concept's two hardest framing rules are enforced VISUALLY:
 *     - City is the hero, BC is the credit. The card headline (city-as-actor, authored in
 *       the data) is the dominant element; BC appears ONLY as a small "Supported by BC ·
 *       [pillar]" tag. The component never renders "BC did X" — it literally prefixes the
 *       BC credit with "Supported by BC".
 *     - Claim support, never outcomes. These cards are support ACTIVITIES; there is no
 *       outcome/metric slot here by design, so a card can't accidentally present a
 *       pollution-reduction OUTCOME as a BC achievement.
 *
 * Rendering approach
 *   A simple connected timeline (a vertical rule with a node per card). Each pillar has a
 *   distinct BC-token colour used for its node + tag, matching PillarRadar so the timeline
 *   and the radar read as one system. Colours are BC tokens only (no hardcoded hex).
 *
 * Key exports: AchievementTimeline (named)
 * External dependencies: react (types), ../_data/types (AchievementCard, PILLAR_BY_ID, PillarId).
 */

import type { ReactElement } from 'react'
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
  /** The city's achievement cards, in display order (the spine of the profile). */
  achievements: AchievementCard[]
}

/**
 * One achievement card. The headline (city-as-actor) is the hero; the BC credit is a small
 * pillar-coloured tag reading "Supported by BC · [pillar label]". The pillar colour ties the
 * node, the tag, and the radar together.
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
        {/* HERO: the city as actor. */}
        <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
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
 * The timeline. Renders a vertical rule with one AchievementRow per card. Order is the data's
 * order (the page controls it). Empty pillars simply have no card here — and the radar shows
 * that pillar as light — which is the honest representation for an early-journey city.
 */
export function AchievementTimeline({
  achievements,
}: AchievementTimelineProps): ReactElement {
  return (
    <ol className="relative space-y-4">
      {/* The vertical rule the nodes sit on. Positioned to pass through the node centres. */}
      <span
        aria-hidden="true"
        className="absolute bottom-2 left-[17px] top-2 w-px bg-border"
      />
      {achievements.map((card) => (
        <AchievementRow key={card.id} card={card} />
      ))}
    </ol>
  )
}
