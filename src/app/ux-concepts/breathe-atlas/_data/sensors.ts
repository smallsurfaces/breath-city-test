/**
 * sensors.ts — the Breathe Atlas mock sensors, typed, plus the facts derived from them.
 *
 * Purpose
 *   The data behind the data map (brief 6.1), the sensor cards (6.2) and the sensor-dependent key
 *   facts (5.3). One JSON file per data city in ./sensors/, loaded and validated here so every
 *   surface reads the SAME sensor set: the counts in the key facts, the markers on the map and the
 *   readings in a card can never disagree.
 *
 * Where the data comes from (brief section 7)
 *   PROVENANCE IS NOT SHIPPED. Each JSON record carries the OpenAQ location id, station name and
 *   provider its coordinate came from. Those three are validated and then dropped, and are not
 *   fields of AtlasSensor: a sensor object reaches the browser inside the page payload, so keeping
 *   them on the type published station names to anyone reading the source, though nothing rendered
 *   them (see checkSensorProvenance). They remain in ./sensors/*.json as the research record.
 *
 *   LOCATIONS are real, from a one-off OpenAQ v3 /locations snapshot taken on 2026-09-17, filtered
 *   to ONE official network per city (the city's own network, or the national system where the city
 *   has none) and to points inside the city's OpenStreetMap boundary. Community, embassy,
 *   university and other third-party feeds are excluded by name. Where a city's low-cost sensors
 *   have no public list, plausible locations are PLACED inside the boundary and carry `placed: true`.
 *   JAKARTA takes nothing from OpenAQ or any third party (Jack, 2026-09-17): every Jakarta location
 *   is placed. Each file's `locationSource` records exactly what was included and excluded.
 *
 *   READINGS are INVENTED. They are not a measurement of anything, and the nav's "Prototype with
 *   sample data" notice covers them. Every figure derived from them is marked "Sample figure".
 *   Nothing is stale or offline: every sensor updated 2 to 10 minutes ago.
 *
 * Why the files are validated rather than trusted
 *   The JSON is generated, so a hand-edit or a regeneration bug would otherwise reach the page as a
 *   wrong marker colour or a silently missing sensor. `parseCitySensors` narrows every field and
 *   throws on anything unexpected. The chapters are pre-rendered, so a bad file fails the build.
 *
 * Key exports: SensorType, SensorReading, AtlasSensor, CitySensors, DATA_CITY_SLUGS, citySensors,
 *   sensorsFor, sensorCountsFor, sensorTotalFor, latestUpdateMinutesAgo, cityWideLevelOrder,
 *   cityWideLevelName, sensorBoundsFor
 * External dependencies: ./indexes (CITY_INDEXES, indexLevel, levelDisplayName), ./sensors/*.json.
 */

import bogotaSensors from './sensors/bogota.json'
import jakartaSensors from './sensors/jakarta.json'
import johannesburgSensors from './sensors/johannesburg.json'
import mexicoCitySensors from './sensors/mexico-city.json'
import sofiaSensors from './sensors/sofia.json'
import warsawSensors from './sensors/warsaw.json'
import { CITY_INDEXES, indexLevel, levelDisplayName } from './indexes'

/** Sensor type. The map draws a circle for low-cost and a square for reference-grade (brief 6.1). */
export type SensorType = 'low-cost' | 'reference-grade'

/** One pollutant reading at one sensor. Invented (see header). */
export type SensorReading = {
  /** Pollutant as it is shown, e.g. "PM2.5", "NO₂". */
  pollutant: string
  /** The reading. */
  value: number
  /** Its unit, e.g. "µg/m³". */
  unit: string
}

/** One sensor on a city's data map. */
export type AtlasSensor = {
  /** Stable id, e.g. "bogota-01". Used for React keys and marker ids. */
  id: string
  /** Position as [longitude, latitude] (Mapbox order). */
  lngLat: [number, number]
  /** Low-cost or reference-grade. */
  type: SensorType
  /** True when the location was placed by us rather than taken from the official snapshot. */
  placed: boolean
  /**
   * Which band of the city's own index this sensor reads: 1 is the index's best level. Null for
   * cities that do not share an index (tiers 1 to 3).
   */
  band: number | null
  /** Minutes since this sensor last updated (2 to 10; nothing is stale). */
  updatedMinutesAgo: number
  /** The pollutants this sensor measures, with readings. Empty for tier 2 (locations only). */
  readings: SensorReading[]
}

/** One city's sensors, with the provenance notes from its file. */
export type CitySensors = {
  /** Route slug. */
  city: string
  /** Illustrative sharing tier. */
  tier: number
  /** What was included and excluded when the locations were chosen. */
  locationSource: string
  /** How the snapshot was taken, or that no third-party source was used. */
  locationSnapshot: string
  /** How the readings were made up. */
  readingsNote: string
  /** The sensors, reference-grade first. */
  sensors: AtlasSensor[]
}

/** The six cities with a data map: every chapter city except tier-1 Milan (brief section 3). */
export const DATA_CITY_SLUGS = ['bogota', 'jakarta', 'johannesburg', 'mexico-city', 'sofia', 'warsaw'] as const

/** A city that has a data map. */
export type DataCitySlug = (typeof DATA_CITY_SLUGS)[number]

// ---------------------------------------------------------------------------------------------
// Validation (see "Why the files are validated" in the header)
// ---------------------------------------------------------------------------------------------

/** Read a required field of a record, or throw naming the field. */
function field(source: Record<string, unknown>, name: string, where: string): unknown {
  if (!(name in source)) {
    throw new Error(`Breathe Atlas sensors: ${where} is missing "${name}"`)
  }
  return source[name]
}

/** Narrow to a record, or throw. */
function asRecord(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Breathe Atlas sensors: ${where} is not an object`)
  }
  return value as Record<string, unknown>
}

/** Narrow to a string, or throw. */
function asString(value: unknown, where: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Breathe Atlas sensors: ${where} is not a non-empty string`)
  }
  return value
}

/** Narrow to a finite number, or throw. */
function asNumber(value: unknown, where: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Breathe Atlas sensors: ${where} is not a finite number`)
  }
  return value
}

/** Narrow to a number or null, or throw. */
function asNumberOrNull(value: unknown, where: string): number | null {
  return value === null ? null : asNumber(value, where)
}

/** Narrow to a string or null, or throw. */
function asStringOrNull(value: unknown, where: string): string | null {
  return value === null ? null : asString(value, where)
}

/** Narrow to an array, or throw. */
function asArray(value: unknown, where: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Breathe Atlas sensors: ${where} is not an array`)
  }
  return value
}

/** Narrow a sensor type, or throw: an unknown type would otherwise draw the wrong marker shape. */
function asSensorType(value: unknown, where: string): SensorType {
  if (value !== 'low-cost' && value !== 'reference-grade') {
    throw new Error(`Breathe Atlas sensors: ${where} has an unknown sensor type`)
  }
  return value
}

/** Narrow one reading. */
function parseReading(value: unknown, where: string): SensorReading {
  const record = asRecord(value, where)
  return {
    pollutant: asString(field(record, 'pollutant', where), `${where}.pollutant`),
    value: asNumber(field(record, 'value', where), `${where}.value`),
    unit: asString(field(record, 'unit', where), `${where}.unit`),
  }
}

/**
 * The three OpenAQ provenance fields on a sensor in the JSON: the location id, the station name and
 * the provider a real position was taken from (all null for a PLACED location). They record where a
 * coordinate came from, and they stay in the files under ./sensors/ so the research is not lost.
 *
 * They are READ AND VALIDATED here and then DROPPED — they are deliberately not fields of
 * AtlasSensor. A station name is the city's to publish (brief section 2), and the chapter route is
 * a server component that hands its sensors to a client map, so anything on the sensor object is
 * serialised into the page's payload and is readable with View Source even though nothing renders
 * it. "Never rendered" was not enough; "never sent" is. Validated rather than ignored so a
 * malformed file still fails the build.
 */
function checkSensorProvenance(record: Record<string, unknown>, id: string, where: string): void {
  asNumberOrNull(field(record, 'openaqLocationId', where), `${id}.openaqLocationId`)
  asStringOrNull(field(record, 'openaqName', where), `${id}.openaqName`)
  asStringOrNull(field(record, 'openaqProvider', where), `${id}.openaqProvider`)
}

/** Narrow one sensor. */
function parseSensor(value: unknown, where: string): AtlasSensor {
  const record = asRecord(value, where)
  const id = asString(field(record, 'id', where), `${where}.id`)
  checkSensorProvenance(record, id, where)
  const position = asArray(field(record, 'lngLat', where), `${id}.lngLat`)
  if (position.length !== 2) {
    throw new Error(`Breathe Atlas sensors: ${id}.lngLat is not a pair`)
  }
  return {
    id,
    lngLat: [asNumber(position[0], `${id}.lngLat[0]`), asNumber(position[1], `${id}.lngLat[1]`)],
    type: asSensorType(field(record, 'type', where), id),
    placed: field(record, 'placed', where) === true,
    band: asNumberOrNull(field(record, 'band', where), `${id}.band`),
    updatedMinutesAgo: asNumber(field(record, 'updatedMinutesAgo', where), `${id}.updatedMinutesAgo`),
    readings: asArray(field(record, 'readings', where), `${id}.readings`).map((reading, position2) =>
      parseReading(reading, `${id}.readings[${position2}]`),
    ),
  }
}

/** Narrow one city's file. Throws on anything unexpected, which fails the build. */
function parseCitySensors(value: unknown, slug: string): CitySensors {
  const record = asRecord(value, slug)
  const city = asString(field(record, 'city', slug), `${slug}.city`)
  if (city !== slug) {
    throw new Error(`Breathe Atlas sensors: ${slug}.json says it is "${city}"`)
  }
  const sensors = asArray(field(record, 'sensors', slug), `${slug}.sensors`).map((sensor, position) =>
    parseSensor(sensor, `${slug}.sensors[${position}]`),
  )
  if (sensors.length < 8 || sensors.length > 40) {
    // Brief section 7: each city stays between about 8 and 40 sensors.
    throw new Error(`Breathe Atlas sensors: ${slug} has ${sensors.length} sensors, outside 8 to 40`)
  }
  return {
    city,
    tier: asNumber(field(record, 'tier', slug), `${slug}.tier`),
    locationSource: asString(field(record, 'locationSource', slug), `${slug}.locationSource`),
    locationSnapshot: asString(field(record, 'locationSnapshot', slug), `${slug}.locationSnapshot`),
    readingsNote: asString(field(record, 'readingsNote', slug), `${slug}.readingsNote`),
    sensors,
  }
}

/** Every data city's sensors, keyed by route slug. */
const CITY_SENSORS: Record<DataCitySlug, CitySensors> = {
  bogota: parseCitySensors(bogotaSensors as unknown, 'bogota'),
  jakarta: parseCitySensors(jakartaSensors as unknown, 'jakarta'),
  johannesburg: parseCitySensors(johannesburgSensors as unknown, 'johannesburg'),
  'mexico-city': parseCitySensors(mexicoCitySensors as unknown, 'mexico-city'),
  sofia: parseCitySensors(sofiaSensors as unknown, 'sofia'),
  warsaw: parseCitySensors(warsawSensors as unknown, 'warsaw'),
}

// ---------------------------------------------------------------------------------------------
// Lookups and derived facts
// ---------------------------------------------------------------------------------------------

/** True when the slug is one of the six cities with a data map. */
export function isDataCity(slug: string): slug is DataCitySlug {
  return Object.prototype.hasOwnProperty.call(CITY_SENSORS, slug)
}

/** One city's sensors and provenance notes, or null when the city has no data map (Milan). */
export function citySensors(slug: string): CitySensors | null {
  return isDataCity(slug) ? CITY_SENSORS[slug] : null
}

/**
 * One city's sensors. Throws for a city with no data map: the callers below are only reached for
 * tiers 2 to 4, so a throw here means the tier and the data disagree, which must fail the build.
 */
export function sensorsFor(slug: string): AtlasSensor[] {
  const entry = citySensors(slug)
  if (entry === null) {
    throw new Error(`Breathe Atlas: city "${slug}" has no sensor file in _data/sensors/`)
  }
  return entry.sensors
}

/**
 * Sensor counts by type for the key facts (brief 5.3), counted from the sensors the map draws, so
 * the tile and the map can never disagree. Status is always 'placeholder': the counts describe
 * mock data, so the tile shows "Sample figure".
 */
export function sensorCountsFor(slug: string): { lowCost: number; referenceGrade: number; status: 'sample' } {
  const sensors = sensorsFor(slug)
  return {
    lowCost: sensors.filter((sensor) => sensor.type === 'low-cost').length,
    referenceGrade: sensors.filter((sensor) => sensor.type === 'reference-grade').length,
    // 'sample', not 'placeholder': these counts are the prototype's declared mock data, which the
    // chapter SHOWS and marks "Sample figure" (brief 5.3, 7). A content-pack 'placeholder' is the
    // opposite case and is omitted entirely (see ./chapters.ts, "Two status vocabularies").
    status: 'sample',
  }
}

/** How many sensors a city has in total (the "N sensors" in the tier-3 live line). */
export function sensorTotalFor(slug: string): number {
  return sensorsFor(slug).length
}

/** The most recent update across a city's sensors, in minutes (the "updated N min ago" line). */
export function latestUpdateMinutesAgo(slug: string): number {
  return sensorsFor(slug).reduce(
    (lowest, sensor) => (sensor.updatedMinutesAgo < lowest ? sensor.updatedMinutesAgo : lowest),
    Number.POSITIVE_INFINITY,
  )
}

/**
 * The city-wide index band for the key facts (brief 5.3, tier 4).
 *
 * THE RULE: the band the most sensors currently read. A tie goes to the better (lower) band, which
 * is the cautious choice for a prototype: it never invents a worse city-wide picture than the mock
 * readings support. This is a prototype convention, NOT how any city computes its published
 * city-wide level, which is why the tile carries the "Sample figure" marker.
 */
export function cityWideLevelOrder(slug: string): number {
  const counts = new Map<number, number>()
  for (const sensor of sensorsFor(slug)) {
    if (sensor.band === null) continue
    counts.set(sensor.band, (counts.get(sensor.band) ?? 0) + 1)
  }
  if (counts.size === 0) {
    throw new Error(`Breathe Atlas: city "${slug}" has no index bands to summarise`)
  }
  let best = Number.POSITIVE_INFINITY
  let bestCount = -1
  for (const [band, count] of counts) {
    if (count > bestCount || (count === bestCount && band < best)) {
      best = band
      bestCount = count
    }
  }
  return best
}

/** The city-wide level as the city publishes it, e.g. "Bajo (Low)" (brief 5.3, tier 4). */
export function cityWideLevelName(slug: string): string {
  const index = CITY_INDEXES[slug]
  if (index === undefined) {
    throw new Error(`Breathe Atlas: city "${slug}" has no index in _data/indexes.ts`)
  }
  return levelDisplayName(indexLevel(index, cityWideLevelOrder(slug)))
}

/**
 * The bounds the map opens on: every one of the city's sensors (brief 6.1, "on load the map fits
 * all of the city's sensors"), as [[west, south], [east, north]].
 */
export function sensorBoundsFor(slug: string): [[number, number], [number, number]] {
  const sensors = sensorsFor(slug)
  const longitudes = sensors.map((sensor) => sensor.lngLat[0])
  const latitudes = sensors.map((sensor) => sensor.lngLat[1])
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ]
}
