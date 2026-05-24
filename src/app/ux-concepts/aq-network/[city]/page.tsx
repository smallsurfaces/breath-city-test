/**
 * page.tsx — AQ Network member profile, dynamic route /ux-concepts/aq-network/[city].
 *
 * Purpose
 *   The single page that renders ANY city's AQ Network profile ("an AQ LinkedIn CV for a
 *   BC member city"). It reads one CityProfile from the registry and composes the profile
 *   sections from it — so adding the next city (London) is a data-only add (one data file +
 *   one registry line), with NO change to this file or its components.
 *
 *   This is the ORCHESTRATOR. The one piece of real logic it owns is the concept's central
 *   rule: the support radar is DERIVED from the timeline, not authored. pillarCounts() below
 *   counts the achievement cards per RADAR pillar and feeds those counts to PillarRadar. There
 *   is no "radar score" anywhere in the data — a light pillar simply means fewer support cards
 *   under that pillar, which is the honest picture. The radar plots only the THREE city-level
 *   support pillars; lesson sharing (BC pillar 4) is relational and gets its own strand
 *   (section 3b), not a radar axis.
 *
 * Sections (in order):
 *   1. Identity header — name, region, "Breathe Cities member" badge, strapline.
 *   2. Achievement timeline (the spine) + the "Latest from [city]" live-news strip.
 *   3. Three-pillar radar — "How Breathe Cities supports [city]" (programme scorecard, not a
 *      city grade), DERIVED from the timeline (city-level support pillars only).
 *   3b. Lesson sharing — the city's peer-network participation strand (gave/received). NOT
 *      on the radar; an early-learner city renders an honest near-empty state.
 *   4. Sensors & coverage — the interactive SENSOR-GROWTH MAP (the concept centrepiece): a
 *      light basemap with markers by sensor TYPE (reference vs low-cost, not air quality), a
 *      timeline scrubber driving sensor existence over time, and three scrubber-linked
 *      counters (sensors deployed · districts covered · people within range — the last an
 *      estimate). Renders from a committed OpenAQ snapshot, never a per-load API call.
 *   5. 2030 trajectory + problem/health context (hypothetical health line labelled a projection).
 *   (The former standalone section 6, "Population within sensor range", was folded into the
 *    section-4 counters — population belongs under Sensors & coverage.)
 *
 * Chrome: PrototypeHeader (back-to-hub + comments + "Updated" stamp) — every hub build uses it.
 * Theme: light (the repo default; Jack's standing preference). No emoji anywhere.
 *
 * Key exports: default page component, generateStaticParams, generateMetadata.
 * External dependencies: next (notFound, Metadata), lucide-react (icons), the registry +
 *   types in ../_data, the sensor-snapshot loader in ../_data/sensor-snapshots, and the
 *   section components in ../_components. SensorGrowthMap is a client component (it owns a
 *   Mapbox map); everything else here is server-rendered.
 *
 * Route: /ux-concepts/aq-network/[city]
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BadgeCheck, MapPin } from 'lucide-react'
import { PrototypeHeader } from '../../../_components/PrototypeHeader'
import {
  getCityProfile,
  CITY_PROFILE_SLUGS,
} from '../_data/cities'
import {
  RADAR_PILLARS,
  type CityProfile,
  type RadarPillarId,
} from '../_data/types'
import { PillarRadar } from '../_components/PillarRadar'
import { AchievementTimeline } from '../_components/AchievementTimeline'
import { LessonSharing } from '../_components/LessonSharing'
import { SensorGrowthMap } from '../_components/SensorGrowthMap'
import { getSensorSnapshot } from '../_data/sensor-snapshots'

/**
 * DERIVE the per-pillar counts from the achievement timeline — the concept's central rule.
 * Counts cards under each of the THREE radar pillars only (1 Expanding data, 2 Technical
 * support, 3 Raising awareness). Cards tagged pillar 4 (Lesson sharing) are intentionally
 * NOT counted here — lesson sharing is shown as its own participation strand, not a radar
 * axis. A radar pillar with no cards comes back 0 (a light axis). This is the ONLY source the
 * radar uses; nothing in the data authors a score.
 */
function pillarCounts(
  profile: CityProfile,
): Readonly<Record<RadarPillarId, number>> {
  const counts: Record<RadarPillarId, number> = { 1: 0, 2: 0, 3: 0 }
  for (const card of profile.achievements) {
    // Only the three radar pillars contribute to the radar. Pillar 4 (lesson sharing) is
    // a valid card tag but is surfaced in the LessonSharing strand, never on the radar.
    if (card.pillar === 1 || card.pillar === 2 || card.pillar === 3) {
      counts[card.pillar] += 1
    }
  }
  return counts
}

/**
 * Pre-render the known city routes at build time. Reads the registry so a newly-registered
 * city is statically generated automatically — no edit here when adding a city.
 */
export function generateStaticParams(): { city: string }[] {
  return CITY_PROFILE_SLUGS.map((slug) => ({ city: slug }))
}

/** Per-city <title>. Resolves the profile so an unknown slug still gets a sensible title. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const profile = getCityProfile(city)
  return {
    title:
      profile !== undefined
        ? `${profile.name} — AQ Network (concept)`
        : 'AQ Network (concept)',
  }
}

/**
 * The member profile page. Resolves the [city] slug to a CityProfile (404 if unknown), derives
 * the radar counts, and renders the six sections from the data.
 */
export default async function AqNetworkCityProfile({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const profile = getCityProfile(city)

  // Unknown slug → 404. The registry is the single source of which cities exist.
  if (profile === undefined) {
    notFound()
  }

  const counts = pillarCounts(profile)

  // The committed OpenAQ sensor snapshot for this city (positions + type + per-year growth +
  // map framing). Keyed by the same openaqCitySlug the profile uses. May be undefined for a
  // city whose snapshot hasn't been captured yet — the section renders a graceful fallback.
  const sensorSnapshot = getSensorSnapshot(profile.sensorProgramme.openaqCitySlug)

  return (
    <>
      <PrototypeHeader buildName={`AQ Network — ${profile.name}`} />

      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          {/* ── 1. Identity header ─────────────────────────────────────────── */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-bc-dark-blue sm:text-5xl">
                {profile.name}
              </h1>
              {profile.isMember && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--bc-semantic-brand) 14%, var(--bc-color-white))',
                    color: 'var(--bc-semantic-brand)',
                  }}
                >
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Breathe Cities member
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {profile.region}
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {profile.strapline}
            </p>
          </header>

          {/* ── 2 + 3. Timeline (spine) alongside the derived radar ─────────── */}
          <section className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Timeline + news strip */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Achievements
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What {profile.name} is doing to clean its air — each milestone is the
                city acting, with Breathe Cities support credited as a tag.
              </p>

              <div className="mt-6">
                <AchievementTimeline achievements={profile.achievements} />
              </div>

              {/* "Latest from [city]" — the always-fresh live-news layer (snapshot here). */}
              <div className="mt-8">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Latest from {profile.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Live-news layer (snapshot in this prototype)
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {profile.latestNews.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-border bg-muted/40 p-4"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.date} · {item.source}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* The derived three-pillar radar (programme scorecard, not a city grade). Plots
                the three city-level support pillars; lesson sharing has its own strand below. */}
            <aside className="lg:pt-1">
              <div className="rounded-2xl border border-border bg-background p-5 lg:sticky lg:top-20">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  How Breathe Cities supports {profile.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  A programme scorecard across BC&rsquo;s three city-level support pillars,
                  summarising the achievements above. A lighter pillar means less support
                  focus there — not a judgement of the city.
                </p>

                <div className="mt-4 flex justify-center">
                  <PillarRadar counts={counts} />
                </div>

                {/* Pillar legend — the THREE radar pillars only (lesson sharing is shown as
                    its own strand below, not on this scorecard). Full labels + derived count
                    tie the radar to the cards. */}
                <ul className="mt-4 space-y-1.5">
                  {RADAR_PILLARS.map((pillar) => {
                    const id = pillar.id as RadarPillarId
                    return (
                      <li
                        key={id}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: {
                                1: 'var(--bc-color-blue)',
                                2: 'var(--bc-color-teal)',
                                3: 'var(--bc-color-tangerine)',
                              }[id],
                            }}
                          />
                          {pillar.label}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {counts[id]}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </aside>
          </section>

          {/* ── 3b. Lesson sharing — peer-network participation strand (NOT on the radar).
                  Lesson sharing is BC pillar 4 but relational, so it gets its own section
                  rather than a radar axis. Two directions: shared with / learned from peers. */}
          <section className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Lesson sharing
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              How {profile.name} takes part in the Breathe Cities peer network — the lessons
              it shares with other cities and the approaches it learns from them. This is
              network participation, not a score.
            </p>
            <div className="mt-6">
              <LessonSharing
                cityName={profile.name}
                entries={profile.lessonSharing}
              />
            </div>
          </section>

          {/* ── 4. Sensors & coverage — the interactive sensor-growth map (the concept's
                  centrepiece). Scrub the timeline to watch the network grow; markers are
                  styled by sensor TYPE (reference vs low-cost), not air quality. The three
                  counters (sensors / districts / people in range) move with the scrubber —
                  the population-in-range figure (an estimate) lives here now. Renders from a
                  one-time OpenAQ snapshot, never a per-load API call. */}
          <section className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Sensors &amp; coverage
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              How {profile.name}&rsquo;s sensor network was built — scrub the timeline to watch
              it grow. Markers show each sensor by type: reference-grade monitors and low-cost
              sensors.
            </p>
            <div className="mt-6">
              {sensorSnapshot !== undefined ? (
                <SensorGrowthMap snapshot={sensorSnapshot} />
              ) : (
                // Graceful fallback: a city profile may exist before its snapshot is captured.
                <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                  Sensor-growth map for {profile.name} is not available yet.
                </div>
              )}
            </div>
          </section>

          {/* ── 5. 2030 trajectory + problem/health context ─────────────────── */}
          <section className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              The 2030 journey
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Goal + honest stage framing */}
              <div
                className="flex flex-col justify-center gap-2 rounded-2xl p-6"
                style={{
                  background:
                    'linear-gradient(135deg, var(--bc-color-dark-blue), var(--bc-color-blue))',
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-bc-white/80">
                  Collective goal
                </p>
                <p className="text-3xl font-bold leading-tight text-bc-white">
                  {profile.trajectory.goalLabel}
                </p>
                <p className="text-sm text-bc-white/90">
                  Against a {profile.trajectory.baselineYear} baseline, shared across all
                  Breathe Cities members.
                </p>
                <p className="mt-2 inline-flex w-fit rounded-full bg-bc-white/20 px-3 py-1 text-xs font-semibold text-bc-white">
                  {profile.name}: {profile.trajectory.stageLabel}
                </p>
              </div>

              {/* Problem + hypothetical health context */}
              <div className="rounded-2xl border border-border bg-background p-6">
                <p className="text-sm text-muted-foreground">
                  {profile.name}&rsquo;s air is around{' '}
                  <span className="font-semibold text-foreground">
                    {profile.health.whoMultiple}× the WHO guideline
                  </span>
                  . Major sources:
                </p>
                <ul className="mt-2 space-y-1">
                  {profile.health.sources.map((source) => (
                    <li
                      key={source.label}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-muted-foreground">{source.label}</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        ~{source.sharePct}%
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-sm text-foreground">
                    {profile.name} could prevent{' '}
                    <span className="font-semibold">
                      ~{profile.health.hypotheticalDeathsPreventedPerYear.toLocaleString()}{' '}
                      deaths/year
                    </span>{' '}
                    if it met WHO guidelines.
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Projection for context — not an achieved outcome.
                  </p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {profile.trajectory.stageNote}
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 (standalone "People within sensor range") was removed: the
              population-in-range figure now lives inside the Sensors & coverage map as one of
              the three scrubber-linked counters (per the brief — it belongs under Sensors &
              coverage). profile.populationInRange still feeds the snapshot's present-day
              calibration; it is no longer rendered as its own section. */}
        </div>
      </main>
    </>
  )
}
