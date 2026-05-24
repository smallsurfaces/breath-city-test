/**
 * page.tsx — AQ Network homepage, /ux-concepts/aq-network.
 *
 * Purpose
 *   The AQ Network homepage. Its centrepiece is an interactive 3D GLOBE (NetworkGlobe) showing
 *   the WHOLE Breathe Cities sensor network worldwide, driven by a committed programme snapshot
 *   (no live OpenAQ call). Below the globe it lists every registered member profile and links
 *   to each one — so the dynamic [city] route always has an entry point.
 *
 *   The directory reads the SAME registry the dynamic route uses, so when the next city is
 *   registered it appears here automatically with no edit to this file.
 *
 * Chrome: PrototypeHeader (back-to-hub + comments + "Updated" stamp). Page theme: light. The
 *   globe canvas itself is dark (deliberate — the network pops against dark space); see
 *   NetworkGlobe. No emoji.
 *
 * Key exports: default page component, metadata.
 * External dependencies: next/link, next (Metadata), lucide-react (ArrowRight),
 *   PrototypeHeader, NetworkGlobe, the programme snapshot loader, the registry in ./_data/cities.
 *
 * Route: /ux-concepts/aq-network
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { PrototypeHeader } from '../../_components/PrototypeHeader'
import { NetworkGlobe } from './_components/NetworkGlobe'
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
    <>
      <PrototypeHeader buildName="AQ Network — concept" />

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
    </>
  )
}
