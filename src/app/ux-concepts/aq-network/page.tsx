/**
 * page.tsx — AQ Network homepage, /ux-concepts/aq-network.
 *
 * Purpose
 *   The AQ Network homepage. Exactly three sections, in order:
 *     1. SENSOR MAP — the hero: intro + three counters (cities / sensors / people) + an interactive
 *        3D GLOBE (NetworkGlobe) showing the WHOLE Breathe Cities sensor network worldwide, driven
 *        by a committed programme snapshot (no live OpenAQ call), plus the globe's own scrubber.
 *     2. MEMBER CITIES — a COMPACT grid of all member city NAMES. Cities with a registered profile
 *        are live links; the rest are inert (muted) so there are no dead-ends. The "members are the
 *        achievement" idea lives here.
 *     3. COLLECTIVE GOAL & IMPACT — a standalone section (CollectiveGoalImpact): the shared 2030
 *        goal card + the collective health-impact card (Breathe Cities' published per-decade
 *        figures, labelled a projection, attributed via DataSource).
 *
 *   The per-city journey timeline (the old NetworkTimeline spine of 14 city nodes) was REMOVED —
 *   the client found it made the page too long, and the Member cities grid already carries the
 *   "members are the achievement" idea. The collective goal + impact cards survive (the only part
 *   of the old spine kept), now in their own standalone section AFTER the grid.
 *
 *   Both the globe AND the grid are sourced from the programme snapshot's `cities` (the canonical
 *   member list) and gated against the SAME profile registry the dynamic route uses
 *   (CITY_PROFILE_SLUGS), so a new member city appears automatically and becomes a live link the
 *   moment its profile is registered — no edit to this file.
 *
 * Chrome: provided by aq-network/layout.tsx — the PrototypeHeader (back-to-hub + comments +
 *   "Updated" stamp) AND the BcHeader/BcFooter site nav. This page therefore no longer renders
 *   its own PrototypeHeader (it would be a duplicate). Page theme: light. The globe canvas
 *   itself is dark (deliberate — the network pops against dark space); see NetworkGlobe. No emoji.
 *
 * Key exports: default page component, metadata.
 * External dependencies: next/link, next (Metadata), NetworkGlobe, CollectiveGoalImpact, the
 *   programme snapshot loader, the profile-slug registry in ./_data/cities. Chrome (PrototypeHeader
 *   + BcHeader/BcFooter) is owned by aq-network/layout.tsx.
 *
 * Route: /ux-concepts/aq-network
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { NetworkGlobe } from './_components/NetworkGlobe'
import { CollectiveGoalImpact } from './_components/CollectiveGoalImpact'
import { getProgrammeSnapshot } from './_data/sensor-snapshots/programme'
import { CITY_PROFILE_SLUGS } from './_data/cities'

export const metadata: Metadata = {
  title: 'AQ Network (concept)',
}

/**
 * The homepage. Renders exactly three sections: the sensor map (concept framing + counters +
 * interactive globe + scrubber), the compact member-city grid, then the standalone collective
 * goal & impact section. The globe and the grid both read the committed programme snapshot; the
 * grid is gated against CITY_PROFILE_SLUGS so it grows automatically with the registry (live links
 * for cities that have a profile, inert otherwise).
 */
export default function AqNetworkIndex() {
  // Programme snapshot is bundled JSON — read synchronously on the server, passed to the globe.
  const programme = getProgrammeSnapshot()

  // The member grid is gated against the profile registry (CITY_PROFILE_SLUGS — today accra +
  // london): cities with a profile become live links, the rest stay inert (muted) so there are no
  // dead-ends. Sourcing the grid from the snapshot means new member cities appear automatically,
  // and a city goes live the moment its profile is registered — no edit to this file.
  const profileSlugs = new Set<string>(CITY_PROFILE_SLUGS)

  // The compact member grid lists ALL member cities from the snapshot, sorted by name for a tidy
  // name grid.
  const memberCities = [...programme.cities].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return (
    // Chrome (PrototypeHeader + BcHeader/BcFooter) is rendered by aq-network/layout.tsx.
    <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          {/* Eyebrow ("AQ Network · concept") dropped this pass (Jack's decision) — the hero now
              opens straight on the h1. */}
          <header className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-bc-dark-blue sm:text-4xl">
              One air-quality network, {programme.counts.cities} cities, worldwide.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Every Breathe Cities member is part of one growing sensor network. Spin the globe
              to see where the {programme.counts.sensors.toLocaleString()} sensors are, and play
              the timeline to watch the network grow.
            </p>
          </header>

          {/* SECTION 1 — SENSOR MAP. The hero: counters (in the intro header above) + the
                interactive 3D network globe + its own scrubber. Untouched. */}
          <section className="mt-10">
            <NetworkGlobe snapshot={programme} />
          </section>

          {/* SECTION 2 — MEMBER CITIES. A COMPACT grid of all member city NAMES. Cities with a
                profile page are live links; the rest are inert (muted) so there are never
                dead-ends. The live-vs-inert styling mirrors the BcChrome nav pattern. This grid
                now carries the "members are the achievement" idea (the per-city journey spine that
                previously did so was removed). */}
          <header className="mt-16 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-bc-dark-blue">
              Member cities
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground">
              All {programme.counts.cities} Breathe Cities members. City-authored profiles are
              rolling out one city at a time — linked cities are live now; the rest are on the way.
            </p>
          </header>

          <section className="mt-6">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {memberCities.map((city) => {
                // A city is "live" when its slug has a registered profile page.
                const live = profileSlugs.has(city.slug)
                return (
                  <li key={city.slug}>
                    {live ? (
                      <Link
                        href={`/ux-concepts/aq-network/${city.slug}`}
                        className="flex h-full items-center justify-center rounded-xl border border-border bg-background px-3 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:border-bc-blue hover:text-bc-blue"
                      >
                        {city.name}
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="flex h-full cursor-default items-center justify-center rounded-xl border border-border bg-muted/40 px-3 py-3 text-center text-sm font-medium text-muted-foreground/70"
                      >
                        {city.name}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Descriptive meta line ("The globe above already shows… More city profiles will go
              live here as they land.") was HIDDEN in the concept-housekeeping pass — purely
              descriptive, not load-bearing. */}

          {/* SECTION 3 — COLLECTIVE GOAL & IMPACT. The shared 2030 goal card + the collective
                health-impact card, stacked, in their own standalone section AFTER the grid. These
                are the only part of the removed per-city journey spine that survives (the goal /
                payoff cards). No spine, no vertical rule, no node markers — those belonged to the
                removed city-node list. Figures are Breathe Cities' published projection, attributed
                via DataSource inside the component. */}
          <header className="mt-16 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-bc-dark-blue">
              Collective goal &amp; impact
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground">
              One shared goal across the whole network — and the collective health prize for
              reaching it.
            </p>
          </header>

          <section className="mt-6">
            <CollectiveGoalImpact
              goalLabel="30% cleaner air by 2030"
              impact={{
                asthmaCases: '~79,000',
                economicSavings: '~$107 billion',
                deathsAvoided: '~39,000',
              }}
            />
          </section>
        </div>
      </main>
  )
}
