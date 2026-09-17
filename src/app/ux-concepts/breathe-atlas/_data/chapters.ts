/**
 * chapters.ts — Breathe Atlas chapter assembly for the seven chapter cities (brief section 5).
 *
 * Purpose
 *   One typed entry per chapter city, keyed by slug, shaped like a future content-system entry
 *   (brief section 7). This file holds the STRUCTURE: the tier union, the hand-picked layout
 *   choices, and the lookups the chapter route uses. The CONTENT lives in ./chapter-content.ts,
 *   mapped from the content pack, so a content change never touches this file.
 *
 *   The type is a union on `tier`, so the compiler enforces the key facts each sharing tier has
 *   (brief 5.3): tier 1 has no sensors and no current conditions, tier 2 has sensors only, tier 3
 *   has sensors and a live line, tier 4 has sensors and its own index level.
 *
 * Where each part comes from
 *   - Content (key facts, story, programmes, photos, links) -> ./chapter-content.ts (content pack).
 *   - A city's own index, for tier 4 -> ./indexes.ts (content pack).
 *   - Sensor counts and current conditions -> derived from the mock sensors in ./sensors.ts, so the
 *     counts in the key facts can never disagree with the markers on the map. Both rest on invented
 *     readings and are marked "Sample figure" in the interface.
 *   - Tier assignments are illustrative (brief section 3) and are never shown in the interface.
 *
 * Layout assignment (brief 5.2: hand-picked, fixed per city)
 *   Fixed sections (opener, hero map, key facts, go further, ending) have one layout. The three
 *   content sections vary. Chapters run alphabetically and loop, and every pair of consecutive
 *   chapters (including Warsaw back to Bogota) differs in ALL three choices, not just the combination.
 *
 *   | City         | Tier | Feature story  | Programmes | Photos              |
 *   |--------------|------|----------------|------------|---------------------|
 *   | Bogota       | 4    | lead-photo     | cards      | strip               |
 *   | Jakarta      | 2    | title-left     | numbered   | one-large-two-small |
 *   | Johannesburg | 4    | large-opening  | rows       | grid                |
 *   | Mexico City  | 3    | lead-photo     | numbered   | strip               |
 *   | Milan        | 1    | title-left     | cards      | one-large-two-small |
 *   | Sofia        | 4    | large-opening  | numbered   | grid                |
 *   | Warsaw       | 4    | title-left     | rows       | one-large-two-small |
 *
 * Key exports: CityChapter (type) and its part types, ChapterSlug (type), CHAPTERS, getChapter,
 *   chapterBySlug, nextChapterCity; re-exports the content types for the components that render them.
 * External dependencies: ./cities (CHAPTER_CITIES, AtlasCity, SharingTier), ./chapter-content
 *   (CHAPTER_CONTENT and its types), ./indexes (CITY_INDEXES), ./sensors (sensor-derived facts).
 */

import { CHAPTER_CONTENT } from './chapter-content'
import { CITY_INDEXES } from './indexes'
import { cityWideLevelName, latestUpdateMinutesAgo, sensorCountsFor, sensorTotalFor } from './sensors'
import { CHAPTER_CITIES } from './cities'
import type { AtlasCity, SharingTier } from './cities'
import type {
  ChapterContent,
  ChapterFeatureStory,
  ChapterGoFurther,
  ChapterJoinedBC,
  ChapterLeadAgency,
  ChapterLink,
  ChapterPhoto,
  ChapterPopulation,
  ChapterProgramme,
  ContentStatus,
} from './chapter-content'

export type {
  ChapterContent,
  ChapterFeatureStory,
  ChapterGoFurther,
  ChapterJoinedBC,
  ChapterLeadAgency,
  ChapterLink,
  ChapterPhoto,
  ChapterPopulation,
  ChapterProgramme,
  ContentStatus,
}

// ---------------------------------------------------------------------------------------------
// Types (the content structure)
// ---------------------------------------------------------------------------------------------

/** Route slugs of the seven chapter cities. */
export type ChapterSlug = 'bogota' | 'jakarta' | 'johannesburg' | 'mexico-city' | 'milan' | 'sofia' | 'warsaw'

/** Route slugs of the four cities that share their own index (illustrative tier 4). */
export type IndexCitySlug = 'bogota' | 'johannesburg' | 'sofia' | 'warsaw'

/** Sensor counts by type (tiers 2 to 4). A count of 0 is not shown. */
export type ChapterSensorCounts = {
  /** Low-cost sensors (shown with a circle). */
  lowCost: number
  /** Reference-grade stations (shown with a square). */
  referenceGrade: number
  /** Derived from the mock sensors, so 'placeholder' ("Sample figure") in this build. */
  status: ContentStatus
}

/** Tier 4 current conditions: the city-wide level as the city publishes it, in its own index. */
export type IndexConditions = {
  /** The city's own index name, e.g. "IBOCA". */
  indexName: string
  /** The current city-wide level name in that index, as published. */
  level: string
  /** Derived from the invented readings, so 'placeholder' ("Sample figure") in this build. */
  status: ContentStatus
}

/** Tier 3 current conditions: a live line with no number or level. */
export type LiveConditions = {
  /** Number of sensors reporting. */
  liveSensors: number
  /** Minutes since the most recent update across the city's sensors. */
  updatedMinutesAgo: number
  /** Derived from the mock sensors, so 'placeholder' ("Sample figure") in this build. */
  status: ContentStatus
}

/** Key facts every tier can have. Any of them may be null, and a null fact is simply not shown. */
type CommonKeyFacts = {
  /** Urban area population. */
  population: ChapterPopulation | null
  /** The lead agency. */
  leadAgency: ChapterLeadAgency | null
  /** Year the city joined BC. */
  joinedBC: ChapterJoinedBC | null
}

/** The tier-dependent key facts (brief 5.3). */
type TierKeyFacts = {
  1: { sensors: null; currentConditions: null }
  2: { sensors: ChapterSensorCounts; currentConditions: null }
  3: { sensors: ChapterSensorCounts; currentConditions: LiveConditions }
  4: { sensors: ChapterSensorCounts; currentConditions: IndexConditions }
}

/** Key facts for a chapter of a given tier. */
export type ChapterKeyFacts<T extends SharingTier> = CommonKeyFacts & TierKeyFacts[T]

/** Feature story layouts: title beside text, wide photo above text, or a large opening paragraph. */
export type FeatureStoryLayout = 'title-left' | 'lead-photo' | 'large-opening'

/** Programme list layouts. */
export type ProgrammesLayout = 'numbered' | 'cards' | 'rows'

/** Photo layouts. `strip` is the only sideways-moving layout in a chapter. */
export type PhotosLayout = 'grid' | 'one-large-two-small' | 'strip'

/** The city's hand-picked layout for each content section (brief 5.2). */
export type ChapterLayouts = {
  featureStory: FeatureStoryLayout
  programmes: ProgrammesLayout
  photos: PhotosLayout
}

/** A chapter of one specific tier. */
type ChapterOfTier<T extends SharingTier> = {
  /** Route slug; must match the city entry in ./cities.ts. */
  slug: ChapterSlug
  /** Illustrative sharing tier; must match the city entry's tier. Never shown in the interface. */
  tier: T
  /** Key facts (brief 5.3). */
  keyFacts: ChapterKeyFacts<T>
  /** The landmark image beside the city name, and on the previous chapter's next-city card (5.1, 5.8). */
  landmark: ChapterPhoto
  /** Feature story (brief 5.5). */
  featureStory: ChapterFeatureStory
  /** Programme list (brief 5.5). */
  programmes: ChapterProgramme[]
  /** Photos, in order (brief 5.6). */
  photos: ChapterPhoto[]
  /** Go further links (brief 5.7). */
  goFurther: ChapterGoFurther
  /** Where the city publishes its data; every sensor card ends with this link (brief 2, 6.2). */
  dataSource: ChapterLink
  /** Layout choices for the content sections (brief 5.2). */
  layouts: ChapterLayouts
}

/** One city chapter: a union on `tier`, so each tier's key facts are checked by the compiler. */
export type CityChapter = { [T in SharingTier]: ChapterOfTier<T> }[SharingTier]

// ---------------------------------------------------------------------------------------------
// Assembly helpers
// ---------------------------------------------------------------------------------------------

/**
 * One city's content from ./chapter-content.ts. Throws when a slug has no content entry, so a
 * missing city fails the build (the chapters are pre-rendered) rather than rendering an empty page.
 */
function content(slug: ChapterSlug): ChapterContent {
  const entry = CHAPTER_CONTENT[slug]
  if (entry === undefined) {
    throw new Error(`Breathe Atlas: chapter city "${slug}" has no entry in _data/chapter-content.ts`)
  }
  return entry
}

/** The common (tier-independent) key facts for a city, straight from the content pack. */
function commonFacts(slug: ChapterSlug): CommonKeyFacts {
  const entry = content(slug)
  return {
    population: entry.population,
    leadAgency: entry.leadAgency,
    joinedBC: entry.joinedBC,
  }
}

/** The content sections that do not depend on tier, straight from the content pack. */
function sections(
  slug: ChapterSlug,
): Pick<
  ChapterOfTier<SharingTier>,
  'landmark' | 'featureStory' | 'programmes' | 'photos' | 'goFurther' | 'dataSource'
> {
  const entry = content(slug)
  return {
    landmark: entry.landmark,
    featureStory: entry.featureStory,
    programmes: entry.programmes,
    photos: entry.photos,
    goFurther: entry.goFurther,
    dataSource: entry.dataSource,
  }
}

/**
 * Tier-4 current conditions: the city-wide level derived from the mock sensors (see
 * cityWideLevelName in ./sensors.ts for the rule), named in the city's own index.
 */
function indexConditions(slug: IndexCitySlug): IndexConditions {
  const index = CITY_INDEXES[slug]
  if (index === undefined) {
    throw new Error(`Breathe Atlas: tier 4 city "${slug}" has no index in _data/indexes.ts`)
  }
  return {
    indexName: index.name,
    level: cityWideLevelName(slug),
    // Derived from invented readings (brief section 7), so it carries the sample marker.
    status: 'placeholder',
  }
}

/** Tier-3 current conditions: how many sensors report, and how recently, from the mock sensors. */
function liveConditions(slug: ChapterSlug): LiveConditions {
  return {
    liveSensors: sensorTotalFor(slug),
    updatedMinutesAgo: latestUpdateMinutesAgo(slug),
    status: 'placeholder',
  }
}

// ---------------------------------------------------------------------------------------------
// The seven chapters
// ---------------------------------------------------------------------------------------------

/** All seven chapters, keyed by slug. The Record type makes a missing chapter a compile error. */
export const CHAPTERS: Record<ChapterSlug, CityChapter> = {
  bogota: {
    slug: 'bogota',
    tier: 4,
    keyFacts: {
      ...commonFacts('bogota'),
      sensors: sensorCountsFor('bogota'),
      currentConditions: indexConditions('bogota'),
    },
    ...sections('bogota'),
    layouts: { featureStory: 'lead-photo', programmes: 'cards', photos: 'strip' },
  },
  jakarta: {
    slug: 'jakarta',
    tier: 2,
    keyFacts: {
      ...commonFacts('jakarta'),
      sensors: sensorCountsFor('jakarta'),
      // Tier 2 shares locations only: no readings, so no current conditions (brief 5.3).
      currentConditions: null,
    },
    ...sections('jakarta'),
    layouts: { featureStory: 'title-left', programmes: 'numbered', photos: 'one-large-two-small' },
  },
  johannesburg: {
    slug: 'johannesburg',
    tier: 4,
    keyFacts: {
      ...commonFacts('johannesburg'),
      sensors: sensorCountsFor('johannesburg'),
      currentConditions: indexConditions('johannesburg'),
    },
    ...sections('johannesburg'),
    layouts: { featureStory: 'large-opening', programmes: 'rows', photos: 'grid' },
  },
  'mexico-city': {
    slug: 'mexico-city',
    tier: 3,
    keyFacts: {
      ...commonFacts('mexico-city'),
      sensors: sensorCountsFor('mexico-city'),
      // Tier 3: the live line only, with no reading and no level (brief 5.3).
      currentConditions: liveConditions('mexico-city'),
    },
    ...sections('mexico-city'),
    layouts: { featureStory: 'lead-photo', programmes: 'numbered', photos: 'strip' },
  },
  milan: {
    slug: 'milan',
    tier: 1,
    keyFacts: {
      ...commonFacts('milan'),
      // Tier 1 shares nothing: no sensors, no current conditions, and the stylised country map is
      // the hero instead of a data map (brief 3, 5.3).
      sensors: null,
      currentConditions: null,
    },
    ...sections('milan'),
    layouts: { featureStory: 'title-left', programmes: 'cards', photos: 'one-large-two-small' },
  },
  sofia: {
    slug: 'sofia',
    tier: 4,
    keyFacts: {
      ...commonFacts('sofia'),
      sensors: sensorCountsFor('sofia'),
      currentConditions: indexConditions('sofia'),
    },
    ...sections('sofia'),
    layouts: { featureStory: 'large-opening', programmes: 'numbered', photos: 'grid' },
  },
  warsaw: {
    slug: 'warsaw',
    tier: 4,
    keyFacts: {
      ...commonFacts('warsaw'),
      sensors: sensorCountsFor('warsaw'),
      currentConditions: indexConditions('warsaw'),
    },
    ...sections('warsaw'),
    layouts: { featureStory: 'title-left', programmes: 'rows', photos: 'one-large-two-small' },
  },
}

// ---------------------------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------------------------

/** A chapter city together with its chapter content. */
export type ChapterEntry = {
  city: AtlasCity
  chapter: CityChapter
}

/** True when `slug` is one of the chapter slugs. */
function isChapterSlug(slug: string): slug is ChapterSlug {
  return Object.prototype.hasOwnProperty.call(CHAPTERS, slug)
}

/**
 * The city and chapter for a route slug, or null when the slug is not a chapter city.
 *
 * Throws when the two data files disagree (a chapter city with no chapter entry, or a tier that
 * differs between cities.ts and this file). The chapter pages are pre-rendered at build time, so a
 * mismatch fails the build loudly instead of rendering a chapter with the wrong key facts.
 */
export function getChapter(slug: string): ChapterEntry | null {
  const city = CHAPTER_CITIES.find((entry) => entry.slug === slug)
  if (city === undefined) return null
  if (!isChapterSlug(slug)) {
    throw new Error(`Breathe Atlas: chapter city "${slug}" has no entry in _data/chapters.ts`)
  }
  const chapter = CHAPTERS[slug]
  if (chapter.slug !== slug || chapter.tier !== city.tier) {
    throw new Error(`Breathe Atlas: chapter "${slug}" disagrees with _data/cities.ts (slug or tier)`)
  }
  return { city, chapter }
}

/** The chapter for a slug when there is one, without the city entry. */
export function chapterBySlug(slug: string): CityChapter | null {
  return isChapterSlug(slug) ? CHAPTERS[slug] : null
}

/**
 * The next chapter city after `slug`: alphabetical, looping from the last back to the first (brief
 * 5.8: Bogota, Jakarta, Johannesburg, Mexico City, Milan, Sofia, Warsaw, then Bogota). Uses
 * CHAPTER_CITIES, which is already sorted by name. Null only when `slug` is not a chapter city.
 */
export function nextChapterCity(slug: string): AtlasCity | null {
  const index = CHAPTER_CITIES.findIndex((city) => city.slug === slug)
  if (index === -1) return null
  return CHAPTER_CITIES[(index + 1) % CHAPTER_CITIES.length]
}
