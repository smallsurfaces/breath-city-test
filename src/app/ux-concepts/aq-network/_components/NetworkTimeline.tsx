/**
 * NetworkTimeline.tsx — the NETWORK-SCALE narrative spine of the AQ Network homepage.
 *
 * Purpose
 *   The NETWORK's version of the member-profile AchievementTimeline. Where a member profile reads
 *   "a city's actions → its 2030 goal → its local health payoff", this homepage spine reads
 *   "the member cities → the network's shared 2030 goal → the collective health payoff". The
 *   member CITIES are the network's achievements: each one assembling over time toward the goal
 *   they all work toward together.
 *
 *   Spine order: the 14 member cities as nodes, oldest → newest by JOIN year (the network
 *   assembling over time), then a brand-filled collective 2030-GOAL node, then a brand-TINTED
 *   collective HEALTH-PAYOFF node carrying the shared-prize figures. This is deliberately the
 *   SAME trajectory shape as the member page so the two surfaces rhyme as one system.
 *
 * Visual-consistency contract (why this is a parallel component, not a generalisation)
 *   This component is a PARALLEL of AchievementTimeline, intentionally reusing the SAME class
 *   strings for the vertical rule, the node markers, and the GoalNode / PayoffNode treatments —
 *   so the network spine and the member spine read as one visual system. AchievementTimeline is
 *   tightly coupled to per-city concepts (pillars, AQLI months, sources); generalising it would
 *   tangle two different data shapes. Per the brief, visual consistency is prioritised over DRY
 *   purity, and the member spine is left untouched (zero regression risk).
 *
 * Honesty contract
 *   - Join years are APPROXIMATE — derived from each city's earliest OpenAQ sensor year (which
 *     itself can be median-estimated upstream). A one-line note states this. They are shown as
 *     "joined ~YYYY".
 *   - Sensor counts are REAL (the committed OpenAQ programme snapshot).
 *   - The collective health figures are Breathe Cities' PUBLISHED estimates (a projection of the
 *     prize, not a measured result) — attributed via DataSource and labelled an estimate.
 *
 * Key exports: NetworkTimeline (named), NetworkTimelineCity (named type)
 * External dependencies: next/link, react (types), lucide-react (Building2, Flag, HeartPulse),
 *   ./DataSource (collective-payoff attribution). BC semantic tokens only — no hardcoded hex.
 */

import type { ReactElement } from 'react'
import Link from 'next/link'
import { Building2, Flag, HeartPulse } from 'lucide-react'
import { DataSource } from './DataSource'

/**
 * One member city as a node on the network spine. A subset of ProgrammeCity carrying just what
 * the spine renders, plus `hasProfile` (computed by the page against the profile registry) which
 * decides whether the node links to the city's profile or is inert.
 */
export type NetworkTimelineCity = {
  /** OpenAQ city slug — also the profile route segment (/ux-concepts/aq-network/<slug>). */
  slug: string
  /** City display name (the node hero). */
  name: string
  /** Approximate join year (earliest sensor year from the snapshot) — shown as "joined ~YYYY". */
  joinedYear: number
  /** Real sensor count from the committed programme snapshot. */
  sensorCount: number
  /** True when the city has a registered profile page (accra, london) — drives link vs inert. */
  hasProfile: boolean
}

/** Props for NetworkTimeline. */
type NetworkTimelineProps = {
  /** The member cities, already ordered oldest → newest by join year (the page does the sort). */
  cities: NetworkTimelineCity[]
  /** The shared network 2030 goal headline (e.g. "30% cleaner air by 2030"). */
  goalLabel: string
  /**
   * The collective health-payoff figures — Breathe Cities' published per-decade estimates for the
   * whole network hitting the 2030 goal. Passed in so this component owns presentation only.
   */
  payoff: {
    /** Childhood-asthma cases avoided per decade (display string, e.g. "~79,000"). */
    asthmaCases: string
    /** Economic savings (display string, e.g. "~$107 billion"). */
    economicSavings: string
    /** Premature deaths avoided per decade (display string, e.g. "~39,000"). */
    deathsAvoided: string
  }
}

/**
 * The inner content of a city node card — the bits that are identical whether the node is a link
 * or an inert span. The approximate join YEAR sits small + muted above the city-name hero, then
 * the real sensor count as a quiet sub-line, mirroring the member spine's "year above headline".
 */
function CityNodeBody({
  city,
}: {
  city: NetworkTimelineCity
}): ReactElement {
  return (
    <>
      {/* Approximate join year — small, muted, above the headline (the spine's ordering signal,
          matching the member spine's year treatment). */}
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Joined ~{city.joinedYear}
      </p>

      {/* HERO: the member city. */}
      <h3 className="mt-0.5 text-base font-semibold leading-snug text-foreground sm:text-lg">
        {city.name}
      </h3>

      {/* Real sensor count — the city's concrete contribution to the network (quiet sub-line). */}
      <p className="mt-1.5 text-sm text-muted-foreground">
        <span className="font-semibold tabular-nums text-foreground">
          {city.sensorCount.toLocaleString()}
        </span>{' '}
        sensors deployed
      </p>
    </>
  )
}

/**
 * One member city on the spine. Visually a sibling of the member AchievementRow: a small node on
 * the vertical rule (here a brand-tinted ring with a Building2 glyph so it reads as a member city)
 * + a white card. Cities with a registered profile render as a LINK (hover affordance) to their
 * profile; the other cities are an inert card — consistent with the grid/globe gating on this page,
 * so there are never dead-ends.
 */
function CityRow({ city }: { city: NetworkTimelineCity }): ReactElement {
  // Shared card chrome — a link and an inert card must look identical at rest.
  const cardClass = 'rounded-2xl border border-border bg-background p-5 shadow-sm'

  return (
    <li className="relative pl-10">
      {/* Timeline node — brand-tinted ring with a Building2 glyph (a member city joining the
          network). Sits on the same vertical rule as every other node. Geometry matches the
          member spine's card-node position. */}
      <span
        aria-hidden="true"
        className="absolute left-[6px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--bc-semantic-brand) 14%, var(--bc-color-white))',
          color: 'var(--bc-semantic-brand)',
        }}
      >
        <Building2 className="h-3 w-3" aria-hidden="true" />
      </span>

      {city.hasProfile ? (
        // Live profile — link the whole card (hover deepens the border + a subtle lift), matching
        // the homepage grid's live-link affordance.
        <Link
          href={`/ux-concepts/aq-network/${city.slug}`}
          className={`block transition-colors hover:border-bc-blue ${cardClass}`}
        >
          <CityNodeBody city={city} />
          <span className="mt-3 inline-flex items-center text-xs font-semibold text-bc-blue">
            View {city.name}&rsquo;s profile
          </span>
        </Link>
      ) : (
        // No profile yet — an inert card (no link), consistent with the inert grid/globe cities.
        <div className={cardClass}>
          <CityNodeBody city={city} />
        </div>
      )}
    </li>
  )
}

/**
 * The TERMINAL collective 2030-goal node — the shared destination every member city is working
 * toward. A brand-FILLED node + brand-gradient card, identical in treatment to the member spine's
 * GoalNode (same marker geometry, same Flag glyph, same gradient) so the two spines rhyme. It is a
 * shared DESTINATION across the whole network, not a claimed result.
 */
function CollectiveGoalNode({ goalLabel }: { goalLabel: string }): ReactElement {
  return (
    <li className="relative pl-10">
      {/* Goal node marker — brand-filled, Flag glyph, matching the member spine's GoalNode. */}
      <span
        aria-hidden="true"
        className="absolute left-[6px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background"
        style={{ backgroundColor: 'var(--bc-semantic-brand)' }}
      >
        <Flag className="h-3 w-3 text-bc-white" aria-hidden="true" />
      </span>

      {/* Goal card — brand gradient, matching the member spine's GoalNode so the shared goal reads
          as the brand-owned destination. */}
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
          The destination every member city above is working toward — one goal, shared across the
          whole Breathe Cities network.
        </p>
      </div>
    </li>
  )
}

/**
 * The FINAL node — the collective health payoff, the shared prize for the whole network reaching
 * the 2030 goal. Sits on the SAME vertical rule immediately AFTER the goal node, so the spine
 * reads: member cities → shared goal → the shared prize. It is the POSITIVE counterpart to the
 * goal node: brand-TINTED (not brand-filled) so it reads as the upside, matching the member spine's
 * PayoffNode treatment. It carries Breathe Cities' three published per-decade figures, attributed
 * via DataSource and explicitly labelled a projection. This is the content MOVED here from the
 * former standalone "shared prize" block above the globe (not duplicated).
 */
function CollectivePayoffNode({
  payoff,
}: {
  payoff: NetworkTimelineProps['payoff']
}): ReactElement {
  return (
    <li className="relative pl-10">
      {/* Payoff node marker — brand-tinted ring with a HeartPulse glyph, matching the member
          spine's PayoffNode so the two terminal-pair treatments are identical (destination → prize). */}
      <span
        aria-hidden="true"
        className="absolute left-[6px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--bc-semantic-brand) 16%, var(--bc-color-white))',
          color: 'var(--bc-semantic-brand)',
        }}
      >
        <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
      </span>

      {/* Payoff card — brand-TINTED (wash + border tint), matching the member spine's PayoffNode
          so it reads as the prize rather than a second brand-filled destination. */}
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
          The shared prize
        </p>

        {/* HERO: the collective payoff if the whole network hits the 2030 goal. */}
        <p className="mt-2 text-lg font-semibold leading-snug text-foreground sm:text-xl">
          If the whole network reaches the 2030 goal, the shared prize across all member cities is
          substantial.
        </p>

        {/* The three published figures — childhood asthma + dollars saved leading, deaths present.
            Same trio as the former standalone block; now the spine's final node. */}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {payoff.asthmaCases}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              new childhood-asthma cases avoided per decade
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {payoff.economicSavings}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">in economic savings</p>
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {payoff.deathsAvoided}
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
    </li>
  )
}

/**
 * The network spine. Renders the vertical rule, one CityRow per member city (in the page-supplied
 * oldest→newest join order), then the terminal collective goal node and the final collective
 * payoff node on the same rule — so the spine reads: the member cities → the shared 2030 goal →
 * the shared prize. A small "join dates approximate" note sits under the spine (sensor counts are
 * real). This mirrors the member AchievementTimeline so the two pages read as one system.
 */
export function NetworkTimeline({
  cities,
  goalLabel,
  payoff,
}: NetworkTimelineProps): ReactElement {
  return (
    <div>
      <ol className="relative space-y-4">
        {/* The vertical rule the nodes sit on — same geometry as the member spine: from the first
            node down through the goal node and into the final payoff node, one continuous spine. */}
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-2 bottom-6 w-px bg-border"
        />
        {cities.map((city) => (
          <CityRow key={city.slug} city={city} />
        ))}
        {/* The shared destination — same spine, brand-filled node (matches the member GoalNode). */}
        <CollectiveGoalNode goalLabel={goalLabel} />
        {/* The shared prize — final node, brand-tinted (matches the member PayoffNode); carries
            the collective figures moved here from the former standalone block. */}
        <CollectivePayoffNode payoff={payoff} />
      </ol>

      {/* Honest note: join dates are approximate (earliest-sensor year); sensor counts are real. */}
      <p className="mt-3 pl-10 text-xs text-muted-foreground">
        Join dates are approximate, derived from each city&rsquo;s earliest sensor in the snapshot.
        Sensor counts are real OpenAQ snapshot data.
      </p>
    </div>
  )
}
