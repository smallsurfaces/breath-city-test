/**
 * page.tsx — AQ Network index, /ux-concepts/aq-network.
 *
 * Purpose
 *   A MINIMAL index for the AQ Network concept so the dynamic [city] route is never a dead
 *   end and the design hub has a single entry point to link to. It lists every registered
 *   member profile (just Accra in this first slice) and links to each one. The full concept
 *   homepage (the global globe / member directory) is a later slice — this page intentionally
 *   stays small.
 *
 *   It reads the SAME registry the dynamic route uses, so when the next city is registered it
 *   appears here automatically with no edit to this file.
 *
 * Chrome: PrototypeHeader (back-to-hub + comments + "Updated" stamp). Theme: light. No emoji.
 *
 * Key exports: default page component, metadata.
 * External dependencies: next/link, next (Metadata), lucide-react (ArrowRight),
 *   PrototypeHeader, the registry in ./_data/cities.
 *
 * Route: /ux-concepts/aq-network
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { PrototypeHeader } from '../../_components/PrototypeHeader'
import { CITY_PROFILES } from './_data/cities'

export const metadata: Metadata = {
  title: 'AQ Network (concept)',
}

/**
 * The index. Renders the concept framing line + one linked card per registered member
 * profile. Cards read from CITY_PROFILES so the list grows automatically with the registry.
 */
export default function AqNetworkIndex() {
  return (
    <>
      <PrototypeHeader buildName="AQ Network — concept" />

      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
              AQ Network · concept
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-bc-dark-blue sm:text-4xl">
              A profile for every Breathe Cities member.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Each member city gets a city-authored profile — a timeline of what the city is
              doing to clean its air, summarised across Breathe Cities&rsquo; four support
              pillars. This first slice covers one city.
            </p>
          </header>

          <section className="mt-10 space-y-3">
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
            The full concept homepage (a global member directory) is a later slice. This index
            is intentionally minimal so the profile route has an entry point.
          </p>
        </div>
      </main>
    </>
  )
}
