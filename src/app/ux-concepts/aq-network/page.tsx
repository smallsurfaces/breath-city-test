/**
 * page.tsx — AQ Network homepage, /ux-concepts/aq-network.
 *
 * Purpose
 *   The AQ Network homepage. Its centrepiece (the hero) is an interactive 3D GLOBE (NetworkGlobe)
 *   showing the WHOLE Breathe Cities sensor network worldwide, driven by a committed programme
 *   snapshot (no live OpenAQ call). Below the globe it carries the NETWORK JOURNEY TIMELINE
 *   (NetworkTimeline) — the network's version of a member profile's achievement spine: the 14
 *   member CITIES are the network's achievements, ordered oldest → newest by join year (the
 *   network assembling over time), flowing into a shared 2030-goal node and a collective
 *   health-payoff node (the shared prize — Breathe Cities' published per-decade figures, labelled
 *   estimates, attributed via DataSource). The member page and this homepage therefore rhyme as
 *   ONE visual system. Below the timeline it shows a COMPACT grid of all member city NAMES — cities
 *   with a registered profile are live links; the rest are inert (muted) so there are no dead-ends.
 *
 *   Both the timeline nodes AND the grid are sourced from the programme snapshot's `cities` (the
 *   canonical member list) and gated against the SAME profile registry the dynamic route uses
 *   (CITY_PROFILE_SLUGS), so a new member city appears automatically and becomes a live link the
 *   moment its profile is registered — no edit to this file.
 *
 * Chrome: provided by aq-network/layout.tsx — the PrototypeHeader (back-to-hub + comments +
 *   "Updated" stamp) AND the BcHeader/BcFooter site nav. This page therefore no longer renders
 *   its own PrototypeHeader (it would be a duplicate). Page theme: light. The globe canvas
 *   itself is dark (deliberate — the network pops against dark space); see NetworkGlobe. No emoji.
 *
 * Key exports: default page component, metadata.
 * External dependencies: next/link, next (Metadata), NetworkGlobe, NetworkTimeline, the programme
 *   snapshot loader, the profile-slug registry in ./_data/cities. Chrome (PrototypeHeader +
 *   BcHeader/BcFooter) is owned by aq-network/layout.tsx.
 *
 * Route: /ux-concepts/aq-network
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { NetworkGlobe } from './_components/NetworkGlobe'
import { NetworkTimeline } from './_components/NetworkTimeline'
import type { NetworkTimelineCity } from './_components/NetworkTimeline'
import { getProgrammeSnapshot } from './_data/sensor-snapshots/programme'
import { CITY_PROFILE_SLUGS } from './_data/cities'

export const metadata: Metadata = {
  title: 'AQ Network (concept)',
}

/**
 * The homepage. Renders the concept framing, the interactive network globe (the hero), the network
 * journey timeline (the member cities → shared goal → collective prize), then a compact grid of all
 * member city names. The globe and both the timeline + grid read the committed programme snapshot;
 * both city lists are gated against CITY_PROFILE_SLUGS so they grow automatically with the registry
 * (live links for cities that have a profile, inert otherwise).
 */
export default function AqNetworkIndex() {
  // Programme snapshot is bundled JSON — read synchronously on the server, passed to the globe.
  const programme = getProgrammeSnapshot()

  // Both city lists are gated against the profile registry (CITY_PROFILE_SLUGS — today accra +
  // london): cities with a profile become live links, the rest stay inert (muted) so there are no
  // dead-ends. Sourcing both from the snapshot means new member cities appear automatically, and a
  // city goes live the moment its profile is registered — no edit to this file.
  const profileSlugs = new Set<string>(CITY_PROFILE_SLUGS)

  // TIMELINE order: the member cities oldest → newest by JOIN year (the network assembling over
  // time toward the shared goal). joinedYear is the real earliest-sensor year from the snapshot
  // (approximate — flagged in the timeline). Name is the deterministic tiebreaker within a year
  // (e.g. the 2016 founding cohort) so the spine order is stable across builds.
  const timelineCities: NetworkTimelineCity[] = [...programme.cities]
    .sort((a, b) => a.joinedYear - b.joinedYear || a.name.localeCompare(b.name))
    .map((city) => ({
      slug: city.slug,
      name: city.name,
      joinedYear: city.joinedYear,
      sensorCount: city.sensorCount,
      hasProfile: profileSlugs.has(city.slug),
    }))

  // The compact member grid lists ALL member cities from the snapshot, sorted by name for a tidy
  // name grid (a different ordering from the timeline, which is by join year on purpose).
  const memberCities = [...programme.cities].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return (
    // Chrome (PrototypeHeader + BcHeader/BcFooter) is rendered by aq-network/layout.tsx.
    <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
              AQ Network · concept
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-bc-dark-blue sm:text-4xl">
              One air-quality network, {programme.counts.cities} cities, worldwide.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Every Breathe Cities member is part of one growing sensor network. Spin the globe
              to see where the {programme.counts.sensors.toLocaleString()} sensors are, and play
              the timeline to watch the network grow.
            </p>
          </header>

          {/* The hero — interactive 3D network globe, ABOVE the journey timeline. */}
          <section className="mt-10">
            <NetworkGlobe snapshot={programme} />
          </section>

          {/* ── The NETWORK JOURNEY TIMELINE — the network's version of a member profile's
                  achievement spine. The member CITIES are the network's achievements: each one
                  joining over time and working together toward the shared 2030 goal, with the
                  collective health payoff (the shared prize) as the final node. This is where the
                  former standalone "shared prize" block now lives — MOVED onto the spine, not
                  duplicated. Visually consistent with the member AchievementTimeline so the two
                  pages read as one system. */}
          <header className="mt-16 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-bc-dark-blue">
              The network&rsquo;s journey
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground">
              The member cities are the achievement. One by one they joined the network, and
              they&rsquo;re working together toward a single shared goal — with a collective prize
              for reaching it.
            </p>
          </header>

          <section className="mt-6">
            <NetworkTimeline
              cities={timelineCities}
              goalLabel="30% cleaner air by 2030"
              payoff={{
                asthmaCases: '~79,000',
                economicSavings: '~$107 billion',
                deathsAvoided: '~39,000',
              }}
            />
          </section>

          {/* Member directory — a COMPACT grid of all member city NAMES. Cities with a profile
                page are live links; the rest are inert (muted) so there are never dead-ends. The
                live-vs-inert styling mirrors the BcChrome nav pattern. */}
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

          <p className="mt-8 text-xs text-muted-foreground">
            The globe above already shows every member city&rsquo;s sensors. More city profiles
            will go live here as they land.
          </p>
        </div>
      </main>
  )
}
