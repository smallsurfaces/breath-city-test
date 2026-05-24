/**
 * page.tsx — AQ Network homepage, /ux-concepts/aq-network.
 *
 * Purpose
 *   The AQ Network homepage. Above the globe it carries the COLLECTIVE health headline — the
 *   shared prize if the whole network hits 30% cleaner air by 2030 (Breathe Cities' published
 *   per-decade figures: childhood-asthma cases + dollars saved leading, premature deaths present;
 *   labelled estimates, attributed via DataSource). Its centrepiece is an interactive 3D GLOBE
 *   (NetworkGlobe) showing the WHOLE Breathe Cities sensor network worldwide, driven by a
 *   committed programme snapshot (no live OpenAQ call). Below the globe it shows a COMPACT grid of
 *   all member city NAMES — cities with a registered profile are live links; the rest are inert
 *   (muted) so there are no dead-ends. This keeps the dynamic [city] route discoverable.
 *
 *   The grid is sourced from the programme snapshot's `cities` (the canonical member list) and
 *   gated against the SAME profile registry the dynamic route uses (CITY_PROFILE_SLUGS), so a new
 *   member city appears automatically and becomes a live link the moment its profile is registered
 *   — no edit to this file.
 *
 * Chrome: provided by aq-network/layout.tsx — the PrototypeHeader (back-to-hub + comments +
 *   "Updated" stamp) AND the BcHeader/BcFooter site nav. This page therefore no longer renders
 *   its own PrototypeHeader (it would be a duplicate). Page theme: light. The globe canvas
 *   itself is dark (deliberate — the network pops against dark space); see NetworkGlobe. No emoji.
 *
 * Key exports: default page component, metadata.
 * External dependencies: next/link, next (Metadata), lucide-react (icons for the shared-prize
 *   headline), NetworkGlobe, the programme snapshot loader, the profile-slug registry in
 *   ./_data/cities. Chrome (PrototypeHeader + BcHeader/BcFooter) is owned by aq-network/layout.tsx.
 *
 * Route: /ux-concepts/aq-network
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { HeartPulse, PiggyBank, ShieldCheck } from 'lucide-react'
import { NetworkGlobe } from './_components/NetworkGlobe'
import { DataSource } from './_components/DataSource'
import { getProgrammeSnapshot } from './_data/sensor-snapshots/programme'
import { CITY_PROFILE_SLUGS } from './_data/cities'

export const metadata: Metadata = {
  title: 'AQ Network (concept)',
}

/**
 * The homepage. Renders the concept framing, the interactive network globe (the centrepiece),
 * then a compact grid of all member city names. The globe reads the committed programme snapshot;
 * the grid is sourced from the snapshot's city list and gated against CITY_PROFILE_SLUGS so it
 * grows automatically with the registry (live links for cities that have a profile, inert otherwise).
 */
export default function AqNetworkIndex() {
  // Programme snapshot is bundled JSON — read synchronously on the server, passed to the globe.
  const programme = getProgrammeSnapshot()

  // The compact member grid lists ALL member cities from the snapshot (the canonical 14), sorted
  // by name for a tidy grid. Cities that have a profile page (CITY_PROFILE_SLUGS — today accra +
  // london) render as live links; the rest are shown but inert (muted, not links) so there are no
  // dead-ends. Sourcing from the snapshot means new member cities appear here automatically, and a
  // city becomes a live link the moment its profile is registered — no edit to this file.
  const profileSlugs = new Set<string>(CITY_PROFILE_SLUGS)
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

          {/* ── Collective health headline — the SHARED PRIZE of the whole network hitting the
                  30%-by-2030 goal. Sits directly above the globe counters as the collective payoff
                  (the globe shows the network; this is what the network is FOR). Leads with the
                  most relatable figures — childhood asthma + dollars saved — with premature deaths
                  present. Breathe Cities' own published figures (per decade); labelled estimates,
                  attributed to Breathe Cities. ADDITIVE — the globe section below is untouched. */}
          <section className="mt-10">
            <div
              className="rounded-2xl border p-6"
              style={{
                borderColor:
                  'color-mix(in srgb, var(--bc-semantic-brand) 22%, var(--bc-color-white))',
                backgroundColor:
                  'color-mix(in srgb, var(--bc-semantic-brand) 6%, var(--bc-color-white))',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                The shared prize · if the network hits 30% cleaner air by 2030
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-3">
                {/* Lead 1 — childhood asthma (the most relatable). */}
                <div>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--bc-semantic-brand) 16%, var(--bc-color-white))',
                      color: 'var(--bc-semantic-brand)',
                    }}
                  >
                    <HeartPulse className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-foreground">
                    ~79,000
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    new childhood-asthma cases avoided per decade
                  </p>
                </div>

                {/* Lead 2 — money saved (relatable, tangible). */}
                <div>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--bc-semantic-brand) 16%, var(--bc-color-white))',
                      color: 'var(--bc-semantic-brand)',
                    }}
                  >
                    <PiggyBank className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-foreground">
                    ~$107 billion
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    in economic savings
                  </p>
                </div>

                {/* Present — premature deaths avoided. */}
                <div>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--bc-semantic-brand) 16%, var(--bc-color-white))',
                      color: 'var(--bc-semantic-brand)',
                    }}
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-foreground">
                    ~39,000
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    premature deaths avoided per decade
                  </p>
                </div>
              </div>

              {/* Honesty: these are Breathe Cities' published projections, not measured outcomes. */}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-4">
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
          </section>

          {/* The centrepiece — interactive 3D network globe. */}
          <section className="mt-10">
            <NetworkGlobe snapshot={programme} />
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
