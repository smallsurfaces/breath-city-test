/**
 * city-page.ts — the shape every Breathe Data Atlas city page's data takes, the area layers
 * (Jakarta's districts, Brussels's surface), and the build-time checks every city runs.
 *
 * Purpose
 *   The Bogotá page (iteration 4) is the template for every city page (SPEC ADDENDUM, 2026-10-25).
 *   Every city's data file (./bogota.ts, ./jakarta.ts, ./brussels.ts, ./sofia.ts, ./milan.ts)
 *   exports one CityPage; the shared components read only this shape. Only the map method and the
 *   data change between cities.
 *
 * Map methods (SPEC ADDENDUM, "Rules that decide every city's behaviour")
 *   station   Bogotá: the city's feed rates each station; markers carry the station's band.
 *   district  Jakarta: the city rates each district; districts are shaded, markers are neutral.
 *   surface   Brussels: the city's model rates every point (IRCELINE's BelAQI layer, mocked here);
 *             the region is shaded, markers are neutral.
 *   none      Sofia and Milan: the city publishes no live band; neutral markers, no band, no advice.
 *
 * Nothing here interprets air quality (spec section 2)
 *   The band only ever comes from the city's feed (mocked as if fed). The area helpers only LOOK UP
 *   the band the city gave the district or the surface cell a point falls in; nothing converts a
 *   reading to a band, averages, or interpolates.
 *
 * Key exports: CityLink, GrowthSeries, PollutantSourceLine, SourceIconId, LargestSource,
 *   PollutantCityInfo, PlaceFact, AdviceItem, MapMethod, DistrictArea, BandSurface, CityPage,
 *   PROTOTYPE_YEAR, hasYearOfArchive, parseDistricts, parseSurface, districtAt, surfaceBandAt,
 *   areaBandAt, checkCityPage
 * External dependencies: ./indexes (types), ./city-sensors (types, POLLUTANT_ORDER).
 */

import type { CityAirQualityIndex } from './indexes'
import { POLLUTANT_ORDER } from './city-sensors'
import type { CitySensor, PollutantId, SensorType } from './city-sensors'

/** A labelled external link. */
export type CityLink = { label: string; url: string }

/** A sample growth series for a sparkline: one value per year from `startYear`. */
export type GrowthSeries = {
  startYear: number
  values: number[]
  /** Always 'sample': invented for the prototype (covered by the prototype notice). */
  status: 'sample'
}

/** One source category for a pollutant, with its share only where the inventory publishes one. */
export type PollutantSourceLine = { category: string; share: string | null }

/**
 * The concept-local source icons (round 3 decision J): neutral, one per source kind. Each city maps
 * its own categories to one of these EXPLICITLY in its data file (no keyword matching, concept
 * standard section 10d).
 */
export type SourceIconId =
  | 'road-dust'
  | 'road-traffic'
  | 'home-heating'
  | 'industry'
  | 'construction'
  | 'quarrying'
  | 'shipping'
  | 'waste-burning'
  | 'other'

/**
 * A pollutant's LARGEST source in the city (decision J): the category with the largest share in the
 * city's own source study, mapped to an icon, with a short label in the city's own terms.
 */
export type LargestSource = { icon: SourceIconId; label: string }

/** The city-specific step of a pollutant explainer ("Where it comes from") and its tile. */
export type PollutantCityInfo = {
  /** Where it comes from in the city, as the city's study lists it. Empty when not covered. */
  sources: PollutantSourceLine[]
  /** A note shown above the sources (e.g. ozone is not emitted directly), or null. */
  sourcesNote: string | null
  /**
   * The largest source, for the tile's icon (decision J). Null where the city's study does not
   * cover the pollutant with local, quantified figures, and always for ozone.
   */
  largestSource: LargestSource | null
  /** Sample growth of the number of sites measuring it. Its last value must equal today's count. */
  sitesGrowth: GrowthSeries
}

/** A plain place fact (population) with its source and year, as published. */
export type PlaceFact = {
  label: string
  /** As displayed, e.g. "8.0 million". */
  value: string
  /** The figure's year where the source gives one, else null. */
  year: string | null
  /** Where the figure comes from (provenance; not displayed in this iteration). */
  source: CityLink
  /** The exact figure and how it was read, kept as provenance (not displayed). */
  provenance: string
}

/**
 * One advice item, as the city publishes it (never reworded), with the group the city ties it to
 * (round 3 decision E). `group` is null for general advice, else the group's English name, from the
 * `group` column of the city's *-health-advice.csv.
 */
export type AdviceItem = { text: string; group: string | null }

/** How the city's map shows its band (see the file header). */
export type MapMethod = 'station' | 'district' | 'surface' | 'none'

/** One district with the band the city gave it (mock), or null where it reported none. */
export type DistrictArea = {
  id: string
  name: string
  band: number | null
  /** Closed outer rings of [lng, lat]. */
  rings: Array<Array<[number, number]>>
}

/**
 * A city's band surface as a regular grid (mock, standing in for the city's own model output).
 * `grid` rows run north to south, characters west to east: '0' outside, '1'..'9', 'A' = 10.
 */
export type BandSurface = {
  west: number
  north: number
  cellLng: number
  cellLat: number
  cols: number
  rows: number
  grid: string[]
}

/** One city page's data. */
export type CityPage = {
  slug: string
  name: string
  country: string
  /** The city's own index, or null when it publishes none (Sofia, Milan). Colour comes only from here. */
  index: CityAirQualityIndex | null
  /** How the map shows the band (see the file header). */
  mapMethod: MapMethod
  /**
   * The index's links, behind every index "i" (legend, sensor detail advice block, pollutant pop-up),
   * labelled for what each page holds (round 3 decision O): what the index is, where the city gives
   * its advice, and similar. From the city's research files only; empty without an index.
   */
  indexLinks: CityLink[]
  /** The method line, behind the legend's "i", in the city's own terms. */
  methodLine: string
  /** The legend's one visible line: what the colour shows, or why there is none. */
  legendLine: string
  /** Who made the map's band layer, credited behind the legend's "i" (Brussels: IRCELINE), or null. */
  mapCredit: CityLink | null
  /** The feed's update cycle in minutes: a reading older than this is stale (decision B1). */
  updateCycleMinutes: number
  /** First year of the city's archive; under one year shows counts without sparklines (spec 6.2). */
  archiveStartYear: number
  /** The city's forecast, only when published AS A BAND (spec 5.7). Null for every city so far. */
  forecastBands: Record<string, number> | null
  /** The city's advice per index level, keyed by level order. Empty without an index. */
  advice: Record<number, AdviceItem[]>
  /** Population, as published. Empty when it cannot be confirmed (rule 6). */
  placeFacts: PlaceFact[]
  /** Sample growth of each sensor type the city has (spec 6.2). Last value must equal today's count. */
  sensorTypeGrowth: Partial<Record<SensorType, GrowthSeries>>
  /** Pollutant-specific content, for every pollutant the city's sensors report. */
  pollutants: Partial<Record<PollutantId, PollutantCityInfo>>
  /** Credit for the pollutant sources, or null when the city has no source study on file. */
  sourcesCredit: CityLink | null
  /**
   * The "Breathe Cities in [City]" section: the blurb (sample copy), then "[linkLead] [link]". The
   * link is null where the city's Breathe Cities page could not be confirmed (rule 6).
   */
  bcIntro: { text: string; linkLead: string; link: CityLink | null }
  /** Go further: the city's own air quality services, and where to get the data. */
  goFurther: { services: CityLink[]; getTheData: CityLink[] }
  /** The city's mock sensors. */
  sensors: CitySensor[]
  /** Jakarta: the districts with their mock bands; null for other methods. */
  districts: DistrictArea[] | null
  /** Brussels: the mock band surface; null for other methods. */
  surface: BandSurface | null
}

/**
 * The year the prototype treats as "now", for the one-year archive rule. A constant, not the
 * clock, so the server and the browser always agree and the page renders the same every time.
 */
export const PROTOTYPE_YEAR = 2026

/** True when the city has at least one year of archive, so its tiles can show sparklines (spec 6.2). */
export function hasYearOfArchive(city: CityPage): boolean {
  return PROTOTYPE_YEAR - city.archiveStartYear >= 1
}

/** Narrow a districts file, or throw: a malformed polygon would shade the wrong place. */
export function parseDistricts(value: unknown, bandCount: number): DistrictArea[] {
  const file = value as { districts?: unknown }
  if (!Array.isArray(file.districts) || file.districts.length === 0) {
    throw new Error('Breathe Data Atlas districts: no districts')
  }
  return file.districts.map((entry, position) => {
    const d = entry as Record<string, unknown>
    if (typeof d.id !== 'string' || typeof d.name !== 'string' || !Array.isArray(d.rings) || d.rings.length === 0) {
      throw new Error(`Breathe Data Atlas districts: entry ${position} is malformed`)
    }
    const band = d.band === null ? null : Number(d.band)
    if (band !== null && (!Number.isInteger(band) || band < 1 || band > bandCount)) {
      throw new Error(`Breathe Data Atlas districts: ${d.name} band ${String(d.band)} is outside the index`)
    }
    return { id: d.id, name: d.name, band, rings: d.rings as Array<Array<[number, number]>> }
  })
}

/** Narrow a surface file, or throw. Every cell must be a level the index has (or 0, outside). */
export function parseSurface(value: unknown, bandCount: number): BandSurface {
  const s = value as Record<string, unknown>
  const numbers = ['west', 'north', 'cellLng', 'cellLat', 'cols', 'rows'] as const
  numbers.forEach((key) => {
    if (typeof s[key] !== 'number') throw new Error(`Breathe Data Atlas surface: ${key} is not a number`)
  })
  if (!Array.isArray(s.grid) || s.grid.length !== s.rows) throw new Error('Breathe Data Atlas surface: grid rows mismatch')
  const grid = s.grid as string[]
  grid.forEach((row, r) => {
    if (row.length !== s.cols) throw new Error(`Breathe Data Atlas surface: row ${r} has the wrong length`)
    for (const ch of row) {
      const level = ch === 'A' ? 10 : Number(ch)
      if (!Number.isInteger(level) || level < 0 || level > bandCount) {
        throw new Error(`Breathe Data Atlas surface: level ${ch} in row ${r} is outside the index`)
      }
    }
  })
  return {
    west: s.west as number,
    north: s.north as number,
    cellLng: s.cellLng as number,
    cellLat: s.cellLat as number,
    cols: s.cols as number,
    rows: s.rows as number,
    grid,
  }
}

/** True when a point lies inside a ring (ray casting). Pure. */
function insideRing(ring: Array<[number, number]>, [x, y]: [number, number]): boolean {
  let hit = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

/** The district a point falls in, or null. A lookup only. Pure. */
export function districtAt(city: CityPage, point: [number, number]): DistrictArea | null {
  if (city.districts === null) return null
  return city.districts.find((district) => district.rings.some((ring) => insideRing(ring, point))) ?? null
}

/** The surface level of the cell a point falls in, or null outside the surface. A lookup only. Pure. */
export function surfaceBandAt(surface: BandSurface, [lng, lat]: [number, number]): number | null {
  const col = Math.floor((lng - surface.west) / surface.cellLng)
  const row = Math.floor((surface.north - lat) / surface.cellLat)
  if (row < 0 || row >= surface.rows || col < 0 || col >= surface.cols) return null
  const ch = surface.grid[row][col]
  const level = ch === 'A' ? 10 : Number(ch)
  return level === 0 ? null : level
}

/**
 * What the city says about the AREA at a point (district or surface methods): the area's name where
 * it has one, and its band (null where the city reported none). Null for a point outside every area,
 * and for the station and none methods, which have no area band. A lookup only. Pure.
 */
export function areaBandAt(
  city: CityPage,
  point: [number, number],
): { name: string | null; band: number | null } | null {
  if (city.mapMethod === 'district') {
    const district = districtAt(city, point)
    return district === null ? null : { name: district.name, band: district.band }
  }
  if (city.mapMethod === 'surface' && city.surface !== null) {
    const band = surfaceBandAt(city.surface, point)
    return band === null ? null : { name: null, band }
  }
  return null
}

/**
 * Build-time checks every city page runs (the pages are pre-rendered, so a mismatch fails the
 * build): sample series end on today's counts; every index level has advice; a city without an
 * index has no band anywhere; the area layer matches the method.
 */
export function checkCityPage(city: CityPage): void {
  const fail = (message: string): never => {
    throw new Error(`Breathe Data Atlas ${city.slug}: ${message}`)
  }
  const checkSeries = (label: string, series: GrowthSeries | undefined, count: number): void => {
    if (series === undefined) fail(`${label} has no sample series`)
    else if (series.values[series.values.length - 1] !== count) {
      fail(`${label} series ends at ${series.values[series.values.length - 1]}, but the sensor file has ${count}`)
    }
  }
  for (const type of ['reference-grade', 'low-cost'] as SensorType[]) {
    const count = city.sensors.filter((s) => s.type === type).length
    if (count > 0) checkSeries(type, city.sensorTypeGrowth[type], count)
  }
  for (const pollutant of POLLUTANT_ORDER) {
    const count = city.sensors.filter((s) => s.readings.some((r) => r.pollutant === pollutant)).length
    if (count === 0) continue
    const info = city.pollutants[pollutant]
    if (info === undefined) fail(`${pollutant} is measured but has no content`)
    else checkSeries(pollutant, info.sitesGrowth, count)
    if (pollutant === 'O₃' && info?.largestSource !== null) fail('ozone must not carry a source icon (decision J)')
  }
  if (city.index === null) {
    if (city.mapMethod !== 'none') fail('a city without an index must use the "none" method')
    if (Object.keys(city.advice).length > 0) fail('a city without an index has no advice')
    city.sensors.forEach((s) => {
      if (s.overallBand !== null || s.readings.some((r) => r.band !== null)) fail(`${s.id} carries a band, but the city has no index`)
    })
  } else {
    for (const level of city.index.levels) {
      if ((city.advice[level.order] ?? []).length === 0) fail(`no advice for ${city.index.name} level ${level.order}`)
    }
  }
  if (city.mapMethod !== 'station' && city.sensors.some((s) => s.overallBand !== null)) {
    fail('only the station method gives a station its own band')
  }
  if ((city.mapMethod === 'district') !== (city.districts !== null)) fail('districts and the method disagree')
  if ((city.mapMethod === 'surface') !== (city.surface !== null)) fail('surface and the method disagree')
}
