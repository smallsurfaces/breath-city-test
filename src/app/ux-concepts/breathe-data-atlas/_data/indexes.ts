/**
 * indexes.ts — the tier-4 cities' own air quality indexes (brief section 2, 6.1, 6.2).
 *
 * Purpose
 *   Bogotá, Johannesburg, Sofia and Warsaw share their own index (illustrative tier 4), so their
 *   data map colours its markers, and its sensor cards head themselves, with THAT index's level
 *   names and THAT index's colours. Nothing else in a chapter carries colour.
 *
 * We never interpret air quality (brief section 2)
 *   Level names, level order and colours are the city's own, as published. Nothing here is a
 *   Breathe Cities judgement, and no BC or AQI palette is used. The four indexes disagree with
 *   each other by design (five levels in Bogotá, six in Warsaw), and that is left alone.
 *
 * Provenance
 *   Mapped from the content pack's `airQualityIndex` blocks (ux-writer, 2026-09-17), which record
 *   the publisher, the legal basis where there is one, and the pages each colour was read from:
 *     design/globalsite/concepts/breathe-atlas/content/breathe-atlas-content-pack.json
 *   Known conflicts the pack flags, kept as the pack resolved them:
 *     - Bogotá: the live IBOCA map and Resolución Conjunta 2840 de 2023 disagree on purple; the
 *       live map's value is used.
 *     - Johannesburg: SAAQIS is NATIONAL. The city publishes no index of its own.
 *     - Sofia: the older five-level European index, as air.sofia.bg shows it. The current European
 *       index has a sixth level that Sofia's page does not show.
 *     - Warsaw: GIOŚ map-legend colours. Warsaw's own IoT map was unreachable, so the city's own
 *       colours are unconfirmed.
 *
 * TOKEN EXCEPTION (named)
 *   Hex values are hardcoded here, which the concept standard otherwise forbids. They are DATA,
 *   not design: each is a city's own published index colour and cannot be a BC token. This is the
 *   same carve-out the standard makes for Mapbox marker constants, for the same reason (WebGL and
 *   detached marker DOM cannot read CSS custom properties).
 *
 * Key exports: IndexLevel, CityAirQualityIndex, CITY_INDEXES, indexLevel, cityIndex,
 *   levelDisplayName
 * External dependencies: none.
 */

/** One level of a city's own index, in the city's own words and colour. */
export type IndexLevel = {
  /** 1 = the index's best level. The order the city publishes. */
  order: number
  /** The level name as published, in the index's own language. */
  nameOriginal: string
  /** English name (the publisher's own where it has one, otherwise the pack's translation). */
  nameEnglish: string
  /** The city's own colour for this level, as published. */
  hex: string
}

/** A city's own air quality index. */
export type CityAirQualityIndex = {
  /** Index name as it should appear in the interface, e.g. "IBOCA". */
  name: string
  /** Who publishes it, for the legend's small print. */
  publisher: string
  /** The levels, best first. */
  levels: IndexLevel[]
  /**
   * The level a "moderate" sensor reads in this index: one band above the best.
   * Mock data uses this (brief section 7: one moderate sensor per tier-4 city).
   */
  moderateOrder: number
  /**
   * The level a "sensitive groups" sensor reads in this index: two bands above the best, which in
   * all four indexes is where the publisher's own advice starts to single out sensitive groups.
   * Mock data uses this (brief section 7: one sensitive-groups sensor per tier-4 city).
   */
  sensitiveOrder: number
}


/** The four tier-4 cities' indexes, keyed by route slug. */
export const CITY_INDEXES: Record<string, CityAirQualityIndex> = {
  bogota: {
    name: 'IBOCA',
    publisher: 'Secretaría Distrital de Ambiente, adopted jointly with Secretaría Distrital de Salud',
    levels: [
      {
        order: 1,
        nameOriginal: 'Bajo',
        nameEnglish: 'Low',
        hex: '#00E400',
      },
      {
        order: 2,
        nameOriginal: 'Moderado',
        nameEnglish: 'Moderate',
        hex: '#FFFF00',
      },
      {
        order: 3,
        nameOriginal: 'Regular',
        nameEnglish: 'Medium',
        hex: '#FF7E00',
      },
      {
        order: 4,
        nameOriginal: 'Alto',
        nameEnglish: 'High',
        hex: '#FF0000',
      },
      {
        order: 5,
        nameOriginal: 'Peligroso',
        nameEnglish: 'Hazardous',
        hex: '#7E0087',
      },
    ],
    moderateOrder: 2,
    sensitiveOrder: 3,
  },
  johannesburg: {
    name: 'Air Quality Index (AQI)',
    publisher: 'South African Air Quality Information System (national environment department with the South African Weather Service)',
    levels: [
      {
        order: 1,
        nameOriginal: 'Good',
        nameEnglish: 'Good',
        hex: '#00FF00',
      },
      {
        order: 2,
        nameOriginal: 'Moderate',
        nameEnglish: 'Moderate',
        hex: '#F7FF00',
      },
      {
        order: 3,
        nameOriginal: 'Unhealthy',
        nameEnglish: 'Unhealthy',
        hex: '#FFC000',
      },
      {
        order: 4,
        nameOriginal: 'Very Unhealthy',
        nameEnglish: 'Very Unhealthy',
        hex: '#FF0000',
      },
      {
        order: 5,
        nameOriginal: 'Hazardous',
        nameEnglish: 'Hazardous',
        hex: '#8D00FF',
      },
    ],
    moderateOrder: 2,
    sensitiveOrder: 3,
  },
  sofia: {
    name: 'European Air Quality Index',
    publisher: 'European Environment Agency index, as published by Sofia Municipality on air.sofia.bg',
    levels: [
      {
        order: 1,
        nameOriginal: 'добро',
        nameEnglish: 'Good',
        hex: '#50F0E6',
      },
      {
        order: 2,
        nameOriginal: 'приемливо',
        nameEnglish: 'Fair',
        hex: '#50CCAA',
      },
      {
        order: 3,
        nameOriginal: 'средно',
        nameEnglish: 'Moderate',
        hex: '#F0E641',
      },
      {
        order: 4,
        nameOriginal: 'лошо',
        nameEnglish: 'Poor',
        hex: '#FF5050',
      },
      {
        order: 5,
        nameOriginal: 'много лошо',
        nameEnglish: 'Very poor',
        hex: '#960032',
      },
    ],
    moderateOrder: 2,
    sensitiveOrder: 3,
  },
  warsaw: {
    name: 'Polish Air Quality Index',
    publisher: 'Chief Inspectorate of Environmental Protection (GIOŚ)',
    levels: [
      {
        order: 1,
        nameOriginal: 'Bardzo dobry',
        nameEnglish: 'Very good',
        hex: '#57b108',
      },
      {
        order: 2,
        nameOriginal: 'Dobry',
        nameEnglish: 'Good',
        hex: '#b0dd10',
      },
      {
        order: 3,
        nameOriginal: 'Umiarkowany',
        nameEnglish: 'Moderate',
        hex: '#ffd911',
      },
      {
        order: 4,
        nameOriginal: 'Dostateczny',
        nameEnglish: 'Sufficient',
        hex: '#e58100',
      },
      {
        order: 5,
        nameOriginal: 'Zły',
        nameEnglish: 'Bad',
        hex: '#e50000',
      },
      {
        order: 6,
        nameOriginal: 'Bardzo zły',
        nameEnglish: 'Very bad',
        hex: '#990000',
      },
    ],
    moderateOrder: 2,
    sensitiveOrder: 3,
  },
}

/** A city's index, or null when the city does not share one (tiers 1 to 3). */
export function cityIndex(slug: string): CityAirQualityIndex | null {
  return CITY_INDEXES[slug] ?? null
}

/**
 * One level of a city's index by its published order. Throws rather than guessing: a missing level
 * means the mock data and the index disagree, which must fail the build, not render a wrong colour.
 */
export function indexLevel(index: CityAirQualityIndex, order: number): IndexLevel {
  const level = index.levels.find((entry) => entry.order === order)
  if (level === undefined) {
    throw new Error(`Breathe Atlas: ${index.name} has no level ${order}`)
  }
  return level
}

/**
 * A level as the interface shows it: the name the city publishes, with the English name after it
 * when the two differ (the prototype is English only, brief section 2). Never a BC-invented name.
 */
export function levelDisplayName(level: IndexLevel): string {
  return level.nameOriginal === level.nameEnglish
    ? level.nameEnglish
    : `${level.nameOriginal} (${level.nameEnglish})`
}
