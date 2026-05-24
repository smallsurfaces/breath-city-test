/**
 * page.tsx — AQ Network homepage, /ux-concepts/aq-network.
 *
 * Purpose
 *   The AQ Network homepage. Above the globe it carries the COLLECTIVE health headline — the
 *   shared prize if the whole network hits 30% cleaner air by 2030 (Breathe Cities' published
 *   per-decade figures: childhood-asthma cases + dollars saved leading, premature deaths present;
 *   labelled estimates, attributed via DataSource). Its centrepiece is an interactive 3D GLOBE
 *   (NetworkGlobe) showing the WHOLE Breathe Cities sensor network worldwide, driven by a
 *   committed programme snapshot (no live OpenAQ call). Below the globe it lists every registered
 *   member profile and links to each one — so the dynamic [city] route always has an entry point.
 *
 *   The directory reads the SAME registry the dynamic route uses, so when the next city is
 *   registered it appears here automatically with no edit to this file.
 *
 * Chrome: provided by aq-network/layout.tsx — the PrototypeHeader (back-to-hub + comments +
 *   "Updated" stamp) AND the BcHeader/BcFooter site nav. This page therefore no longer renders
 *   its own PrototypeHeader (it would be a duplicate). Page theme: light. The globe canvas
 *   itself is dark (deliberate — the network pops against dark space); see NetworkGlobe. No emoji.
 *
 * Key exports: default page component, metadata.
 * External dependencies: next/link, next (Metadata), lucide-react (ArrowRight),
 *   NetworkGlobe, the programme snapshot loader, the registry in ./_data/cities. Chrome
 *   (PrototypeHeader + BcHeader/BcFooter) is owned by aq-network/layout.tsx.
 *
 * Route: /ux-concepts/aq-network
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, HeartPulse, PiggyBank, ShieldCheck } from 'lucide-react'
import { NetworkGlobe } from './_components/NetworkGlobe'
import { DataSource } from './_components/DataSource'
import { getProgrammeSnapshot } from './_data/sensor-snapshots/programme'
import { CITY_PROFILES } from './_data/cities'

export const metadata: Metadata = {
  title: 'AQ Network (concept)',
}

/**
 * The homepage. Renders the concept framing, the interactive network globe (the centrepiece),
 * then one linked card per registered member profile. The globe reads the committed programme
 * snapshot; the directory reads CITY_PROFILES so it grows automatically with the registry.
 */
export default function AqNetworkIndex() {
  // Programme snapshot is bundled JSON — read synchronously on the server, passed to the globe.
  const programme = getProgrammeSnapshot()

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

          {/* Member directory — one card per registered profile. */}
          <header className="mt-16 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-bc-dark-blue">
              Member profiles
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground">
              Each member city gets a city-authored profile — a timeline of what the city is
              doing to clean its air, summarised across Breathe Cities&rsquo; four support
              pillars.
            </p>
          </header>

          <section className="mt-6 space-y-3">
            {CITY_PROFILES.map((profile) => (
              <Link
                key={profile.slug}
                href={`/ux-concepts/aq-network/${profile.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-foreground">
                    {profile.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {profile.region} · {profile.achievements.length} achievements
                  </p>
                </div>
                <ArrowRight
                  className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </section>

          <p className="mt-8 text-xs text-muted-foreground">
            City-authored profiles are rolling out one city at a time; the globe above already
            shows every member city&rsquo;s sensors. More profiles will appear here as they land.
          </p>
        </div>
      </main>
  )
}
