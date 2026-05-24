/**
 * SensorsLive.tsx — the sensors & coverage section (programme figure vs LIVE OpenAQ).
 *
 * Purpose
 *   Shows the honest gap between what a city's BC-supported programme DEPLOYED (a curated
 *   real figure, e.g. Accra's 67 sensors across 13 districts) and what is actually LIVE on
 *   OpenAQ right now (fetched at render time). Live coverage on open networks is sparse — a
 *   much smaller live number is EXPECTED and is shown plainly, never hidden or treated as an
 *   error. This is the section that keeps the whole profile honest about its data.
 *
 *   It reuses the existing live-data plumbing wholesale:
 *     - useStations(citySlug, 'pm25')  → fetch + the four network states + fresh/total counts
 *     - formatReading                  → consistent per-parameter value formatting
 *   so the live count here is computed exactly the same way as the direction-2 live map.
 *
 * Why PM2.5: PM2.5 is the headline pollutant for these cities and the only universally
 *   available parameter; the section reports the live PM2.5 station picture as the coverage
 *   proxy. (A parameter selector is out of scope for this profile slice.)
 *
 * Client component: it fetches on mount via the hook (network side effect lives in useStations).
 *
 * Key exports: SensorsLive (named)
 * External dependencies: react, ../../../direction-2-live-data/useStations (useStations),
 *   ../../../direction-2-live-data/aqiParameters (formatReading), ../_data/types (SensorProgramme).
 */

'use client'

import type { ReactElement } from 'react'
import { useStations } from '../../../direction-2-live-data/useStations'
import { formatReading } from '../../../direction-2-live-data/aqiParameters'
import type { SensorProgramme } from '../_data/types'

/** The parameter used as the live-coverage proxy for this section. */
const COVERAGE_PARAMETER = 'pm25' as const

/** How many live stations to list individually before collapsing to a "+N more" line. */
const STATION_LIST_LIMIT = 8

/** Props for SensorsLive. */
type SensorsLiveProps = {
  /** The city's sensor programme figures + the OpenAQ slug to fetch the live count from. */
  programme: SensorProgramme
}

/**
 * One stat block — a big number with a label. Used for the programme figures so the deployed
 * count and district count read as headline facts.
 */
function StatBlock({
  value,
  label,
}: {
  value: string
  label: string
}): ReactElement {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="text-3xl font-bold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

/**
 * The sensors & coverage section. Renders the programme figures up top, then the LIVE OpenAQ
 * picture below with a status-aware readout and (when available) a short list of live stations.
 * The deployed-vs-live framing is made explicit in copy so a small live number reads as honest
 * coverage, not a failure.
 */
export function SensorsLive({ programme }: SensorsLiveProps): ReactElement {
  // Reuse the live-data hook exactly as the direction-2 map does. PM2.5 is always available,
  // so the hook only ever resolves to a real network state (never the NO2 gate).
  const { status, stations, freshCount, totalCount, retry } = useStations(
    programme.openaqCitySlug,
    COVERAGE_PARAMETER,
  )

  return (
    <div className="space-y-6">
      {/* Programme figures — the real BC-supported deployment. */}
      <div className="grid grid-cols-2 gap-4">
        <StatBlock
          value={String(programme.deployedCount)}
          label="Sensors deployed (programme)"
        />
        <StatBlock
          value={String(programme.districtsCount)}
          label="Districts covered"
        />
      </div>

      {/* The honest deployed-vs-live note. */}
      <p className="text-sm text-muted-foreground">{programme.liveCoverageNote}</p>

      {/* LIVE OpenAQ picture. */}
      <div className="rounded-2xl border border-border bg-muted/40 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Live on OpenAQ right now (PM2.5)
          </h3>
          <span className="text-xs text-muted-foreground">
            Source: OpenAQ · fetched live
          </span>
        </div>

        {/* Status-aware readout — every state is honest, only 'error' offers a retry. */}
        <div className="mt-3">
          {status === 'idle' || status === 'loading' ? (
            <p className="text-sm text-muted-foreground">Loading live sensors…</p>
          ) : status === 'error' ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Couldn’t reach OpenAQ just now.
              </p>
              <button
                type="button"
                onClick={retry}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background"
              >
                Retry
              </button>
            </div>
          ) : status === 'empty' ? (
            <p className="text-sm text-muted-foreground">
              No PM2.5 stations are reporting to OpenAQ for {programme.openaqCitySlug} right now.
            </p>
          ) : (
            // 'ready' or 'empty-stale' — both report the live picture honestly.
            <>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {freshCount}
                <span className="text-base font-medium text-muted-foreground">
                  {' '}
                  live{' '}
                </span>
                <span className="text-base font-normal text-muted-foreground">
                  of {totalCount} PM2.5 stations on OpenAQ
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                “Live” means a fresh reading (under 24h old). The rest exist but their
                latest reading is stale — typical for open low-cost networks.
              </p>
            </>
          )}
        </div>

        {/* Short live-station list (only when we actually have stations). */}
        {(status === 'ready' || status === 'empty-stale') && stations.length > 0 && (
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {stations.slice(0, STATION_LIST_LIMIT).map((station) => {
              const reading = station.parameters[COVERAGE_PARAMETER]
              return (
                <li
                  key={station.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {station.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {station.provider}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {reading !== undefined ? (
                      <>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {formatReading(reading.value, COVERAGE_PARAMETER)}{' '}
                          {reading.unit}
                        </span>
                        <span
                          className="ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: reading.isStale
                              ? 'color-mix(in srgb, var(--bc-semantic-muted) 18%, var(--bc-color-white))'
                              : 'color-mix(in srgb, var(--bc-color-green) 18%, var(--bc-color-white))',
                            color: 'var(--bc-semantic-text)',
                          }}
                        >
                          {reading.isStale ? 'stale' : 'live'}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">no reading</span>
                    )}
                  </div>
                </li>
              )
            })}
            {stations.length > STATION_LIST_LIMIT && (
              <li className="py-2 text-xs text-muted-foreground">
                + {stations.length - STATION_LIST_LIMIT} more stations
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
