/**
 * route.ts — GET /api/stations?city=<slug>&parameter=<name>
 *
 * Purpose:
 *   Server-side route handler that exposes normalized air-quality stations to the client. It
 *   is the public face of the OpenAQ data core: it validates input, calls the adapter, and
 *   returns Station[] as JSON. The OpenAQ key never crosses this boundary — only normalized
 *   data goes to the client.
 *
 * Key export: GET (Next.js App Router route handler)
 *
 * External dependencies:
 *   - ../../../lib/openaq/adapter (fetchStations)
 *   - ../../../lib/openaq/cities (isKnownCity, CITY_SLUGS)
 *   - ../../../lib/openaq/types (PARAMETER_NAMES, ParameterName)
 *
 * Caching:
 *   The active rate-limit protection lives in client.ts, not here. This route reads `city` and
 *   `parameter` from the query string, which makes it a dynamic route — so the route-level
 *   `export const revalidate = 600` below does NOT cache responses (it is a no-op for a route
 *   that reads searchParams). What actually bounds upstream traffic is the per-fetch
 *   `next: { revalidate: 600 }` set on every OpenAQ call in client.ts: each unique upstream URL
 *   is served from the framework data cache for 10 minutes, so OpenAQ is hit at most ~once per
 *   10 min per distinct upstream request regardless of how many clients ask. The route-level
 *   export is kept as intentional documentation and a fallback: if this handler is ever
 *   refactored to stop reading the query string, the export would then take effect.
 *
 * Errors are returned as safe JSON. Internal details and the API key are never leaked:
 *   - 400 for unknown city or parameter (with the list of valid values)
 *   - 502 for any upstream/normalization failure
 */

import { NextResponse } from 'next/server'
import { fetchStations } from '../../../lib/openaq/adapter'
import { CITY_SLUGS, isKnownCity } from '../../../lib/openaq/cities'
import { PARAMETER_NAMES, type ParameterName } from '../../../lib/openaq/types'

/**
 * No-op while this handler reads searchParams (a dynamic route ignores route-level revalidate).
 * The real 10-minute cache is the per-fetch `next: { revalidate: 600 }` in client.ts. Kept as a
 * documented fallback that would take effect only if the handler stops reading the query string.
 */
export const revalidate = 600

/** Narrow an arbitrary string to a known ParameterName. */
function isKnownParameter(value: string): value is ParameterName {
  return (PARAMETER_NAMES as readonly string[]).includes(value)
}

/**
 * Handle GET /api/stations. Reads `city` and `parameter` from the query string, validates both
 * against the registries, and returns normalized stations. Validation runs before any network
 * call so bad input fails fast as a 400 and never reaches the rate-limited upstream.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  const parameter = searchParams.get('parameter')

  if (city === null || !isKnownCity(city)) {
    return NextResponse.json(
      {
        error: 'Unknown or missing city.',
        validCities: CITY_SLUGS,
      },
      { status: 400 },
    )
  }

  if (parameter === null || !isKnownParameter(parameter)) {
    return NextResponse.json(
      {
        error: 'Unknown or missing parameter.',
        validParameters: PARAMETER_NAMES,
      },
      { status: 400 },
    )
  }

  try {
    const stations = await fetchStations(city, parameter)
    return NextResponse.json(stations)
  } catch {
    // Swallow the underlying error detail on purpose — it may reference upstream internals.
    // The key is never in scope here, but a generic message guarantees nothing leaks.
    return NextResponse.json(
      { error: 'Failed to fetch station data from the upstream provider.' },
      { status: 502 },
    )
  }
}
