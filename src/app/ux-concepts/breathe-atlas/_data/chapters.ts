/**
 * chapters.ts — Breathe Atlas chapter content for the seven chapter cities (brief section 5).
 *
 * Purpose
 *   One typed entry per chapter city, keyed by slug, shaped like a future content-system entry
 *   (brief section 7). The chapter route (../[city]/page.tsx) renders every section from this file
 *   plus the city entry in ./cities.ts (name, country, card image, mission line). A real content
 *   pack maps onto `CityChapter` field by field; nothing in the components needs to change.
 *
 *   The type is a union on `tier`, so the compiler enforces the key facts each sharing tier has
 *   (brief 5.3): tier 1 has no sensors and no current conditions, tier 2 has sensors only, tier 3
 *   has sensors and a live line, tier 4 has sensors and its own index level.
 *
 * PLACEHOLDER CONTENT (read before editing)
 *   Every text value is an obvious placeholder ("Placeholder: ..."). Every figure is a patterned
 *   dummy (1,234,567 people, 123 and 12 sensors, joined 2099) with `sample: true`, which the page
 *   shows as "Sample figure". No fact, figure or quote about any city is invented. Links are `#`.
 *   Two things come from the brief itself, not from invention:
 *   - Bogotá's index name is IBOCA (brief sections 5.3 and 7). Its level stays a placeholder.
 *   - Johannesburg has no resident air platform of its own (brief section 10), so its "Check
 *     today's air" group is empty, which also demonstrates that an empty group is left out.
 *   Tier assignments are illustrative (brief section 3) and are never shown in the interface.
 *
 * Layout assignment (brief 5.2: hand-picked, fixed per city)
 *   Fixed sections (opener, hero map, key facts, go further, ending) have one layout. The three
 *   content sections vary. Chapters run alphabetically and loop, and every pair of consecutive
 *   chapters (including Warsaw back to Bogotá) differs in ALL three choices, not just the combination.
 *
 *   | City         | Tier | Feature story  | Programmes | Photos              |
 *   |--------------|------|----------------|------------|---------------------|
 *   | Bogotá       | 4    | lead-photo     | cards      | strip               |
 *   | Jakarta      | 2    | title-left     | numbered   | one-large-two-small |
 *   | Johannesburg | 4    | large-opening  | rows       | grid                |
 *   | Mexico City  | 3    | lead-photo     | numbered   | strip               |
 *   | Milan        | 1    | title-left     | cards      | one-large-two-small |
 *   | Sofia        | 4    | large-opening  | numbered   | grid                |
 *   | Warsaw       | 4    | title-left     | rows       | one-large-two-small |
 *
 * Key exports: CityChapter (type) and its part types, ChapterSlug (type), CHAPTERS, getChapter,
 *   nextChapterCity
 * External dependencies: ./cities (CHAPTER_CITIES, AtlasCity, SharingTier).
 */

import { CHAPTER_CITIES } from './cities'
import type { AtlasCity, SharingTier } from './cities'

// ---------------------------------------------------------------------------------------------
// Types (the content structure)
// ---------------------------------------------------------------------------------------------

/** Route slugs of the seven chapter cities. */
export type ChapterSlug = 'bogota' | 'jakarta' | 'johannesburg' | 'mexico-city' | 'milan' | 'sofia' | 'warsaw'

/** A labelled link. `url` is `#` while the real address is not yet known. */
export type ChapterLink = {
  /** Visible link text. */
  label: string
  /** Absolute URL, or `#` for a placeholder. */
  url: string
}

/** Urban area population (brief 5.3). */
export type ChapterPopulation = {
  /** Number of people. */
  value: number
  /** Caption under the figure, e.g. "Urban area population · UN estimate". */
  label: string
  /** Where the figure comes from (UN DESA, or the city when it supplies its own). */
  source: ChapterLink
  /** True while the figure is a dummy; the page then marks it "Sample figure". */
  sample: boolean
}

/** The year the city joined Breathe Cities. */
export type ChapterJoinedBC = {
  /** Four-digit year. */
  year: number
  /** True while the year is a dummy. */
  sample: boolean
}

/** Sensor counts by type (tiers 2 to 4). A count of 0 is not shown. */
export type ChapterSensorCounts = {
  /** Low-cost sensors (shown with a circle). */
  lowCost: number
  /** Reference-grade stations (shown with a square). */
  referenceGrade: number
  /** True while the counts are dummies. */
  sample: boolean
}

/** Tier 4 current conditions: the city-wide level as the city publishes it, in its own index. */
export type IndexConditions = {
  /** The city's own index name, e.g. "IBOCA". */
  indexName: string
  /** The current level name in that index. */
  level: string
}

/** Tier 3 current conditions: a live line with no number or level. */
export type LiveConditions = {
  /** Number of sensors reporting. */
  liveSensors: number
  /** Minutes since the last update. */
  updatedMinutesAgo: number
}

/** Key facts every tier can have. Any of them may be null, and a null fact is simply not shown. */
type CommonKeyFacts = {
  /** Urban area population. */
  population: ChapterPopulation | null
  /** Name of the lead agency. */
  leadAgency: string | null
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

/** One photo. `src: null` renders a neutral placeholder tile that still carries the alt text. */
export type ChapterPhoto = {
  /** Image URL, or null for a placeholder tile. */
  src: string | null
  /** Alt text. */
  alt: string
  /** Credit line, e.g. the photographer and "Unsplash" (brief 5.6). */
  credit: string
  /** Page the photo came from. */
  sourceUrl: string
}

/** The feature story (brief 5.5). */
export type ChapterFeatureStory = {
  /** Story headline (rendered as the section's h2). */
  title: string
  /** Body paragraphs, in order. */
  paragraphs: string[]
  /** Sources the story draws on. */
  sources: ChapterLink[]
  /** Wide photo above the story. Used by the `lead-photo` layout only; the other layouts ignore it. */
  leadPhoto: ChapterPhoto | null
}

/** A named programme with its own public page (brief 5.5). */
export type ChapterProgramme = {
  /** Programme name. */
  name: string
  /** One or two sentences on the programme. */
  description: string
  /** The programme's public page, or `#`. */
  url: string
}

/** Go further links, grouped (brief 5.7). An empty group is left out. */
export type ChapterGoFurther = {
  /** The city's resident air quality platforms. */
  checkTodaysAir: ChapterLink[]
  /** The city's open data portal or API, or OpenAQ. */
  getTheData: ChapterLink[]
  /** The department responsible. */
  departmentResponsible: ChapterLink | null
}

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
  /** Feature story (brief 5.5). */
  featureStory: ChapterFeatureStory
  /** Programme list (brief 5.5). */
  programmes: ChapterProgramme[]
  /** Photos, in order (brief 5.6). */
  photos: ChapterPhoto[]
  /** Go further links (brief 5.7). */
  goFurther: ChapterGoFurther
  /** Layout choices for the content sections (brief 5.2). */
  layouts: ChapterLayouts
}

/** One city chapter: a union on `tier`, so each tier's key facts are checked by the compiler. */
export type CityChapter = { [T in SharingTier]: ChapterOfTier<T> }[SharingTier]

// ---------------------------------------------------------------------------------------------
// Placeholder builders (dummy content only; see PLACEHOLDER CONTENT above)
// ---------------------------------------------------------------------------------------------

/** Caption for the population figure (brief 5.3). */
const POPULATION_LABEL = 'Urban area population · UN estimate'

/** Placeholder population: a patterned dummy figure, marked as a sample. */
function placeholderPopulation(value: number): ChapterPopulation {
  return {
    value,
    label: POPULATION_LABEL,
    source: { label: 'Placeholder: UN population source', url: '#' },
    sample: true,
  }
}

/** Placeholder join year: an impossible year, marked as a sample. */
const PLACEHOLDER_JOINED: ChapterJoinedBC = { year: 2099, sample: true }

/** Placeholder sensor counts: patterned dummies, marked as a sample. */
const PLACEHOLDER_SENSORS: ChapterSensorCounts = { lowCost: 123, referenceGrade: 12, sample: true }

/** Placeholder lead agency name. */
const PLACEHOLDER_AGENCY = 'Placeholder: lead agency name'

/** Placeholder feature story for a city. `withLeadPhoto` fills `leadPhoto` for the lead-photo layout. */
function placeholderStory(cityName: string, withLeadPhoto: boolean): ChapterFeatureStory {
  return {
    title: `Placeholder: feature story headline about ${cityName}`,
    paragraphs: [
      `Placeholder: the opening paragraph of the ${cityName} feature story. It will be drawn from Breathe Cities news and publications about the city, or from the city's own public programmes. This dummy text runs to a realistic length so the layout is tested with a real paragraph.`,
      'Placeholder: a second paragraph that develops the story. It describes the work in more detail and names the people or organisations involved, in the voice of the Breathe Cities website. Two or three sentences is a typical length.',
      'Placeholder: a closing paragraph that says what happens next and where readers can find out more. It stays short.',
    ],
    sources: [
      { label: 'Placeholder: source article title', url: '#' },
      { label: 'Placeholder: second source title', url: '#' },
    ],
    leadPhoto: withLeadPhoto
      ? { src: null, alt: `Placeholder: lead photo for the ${cityName} story`, credit: 'Placeholder: photo credit', sourceUrl: '#' }
      : null,
  }
}

/** Placeholder programmes for a city. `count` varies by city so every list layout is tested at different lengths. */
function placeholderProgrammes(count: number): ChapterProgramme[] {
  const ordinals = ['one', 'two', 'three', 'four', 'five', 'six']
  return ordinals.slice(0, count).map((ordinal) => ({
    name: `Placeholder: programme name ${ordinal}`,
    description: 'Placeholder: one or two sentences on what this programme does and who it is for.',
    url: '#',
  }))
}

/** Placeholder photos for a city: neutral tiles (`src: null`) with alt text and credit. */
function placeholderPhotos(cityName: string, count: number): ChapterPhoto[] {
  return Array.from({ length: count }, (_, index) => ({
    src: null,
    alt: `Placeholder: photo ${index + 1} of ${count} from ${cityName}`,
    credit: 'Placeholder: photo credit',
    sourceUrl: '#',
  }))
}

/** Placeholder go further links. Johannesburg passes `hasResidentPlatform: false` (see file header). */
function placeholderGoFurther(hasResidentPlatform: boolean): ChapterGoFurther {
  return {
    checkTodaysAir: hasResidentPlatform
      ? [{ label: "Placeholder: the city's resident air quality platform", url: '#' }]
      : [],
    getTheData: [
      { label: "Placeholder: the city's open data portal", url: '#' },
      { label: 'Placeholder: OpenAQ page for the city', url: '#' },
    ],
    departmentResponsible: { label: 'Placeholder: department responsible', url: '#' },
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
      population: placeholderPopulation(12345678),
      leadAgency: PLACEHOLDER_AGENCY,
      joinedBC: PLACEHOLDER_JOINED,
      sensors: PLACEHOLDER_SENSORS,
      // IBOCA is named in the brief (5.3, 7). The level is a placeholder.
      currentConditions: { indexName: 'IBOCA', level: 'Placeholder level' },
    },
    featureStory: placeholderStory('Bogotá', true),
    programmes: placeholderProgrammes(4),
    photos: placeholderPhotos('Bogotá', 6),
    goFurther: placeholderGoFurther(true),
    layouts: { featureStory: 'lead-photo', programmes: 'cards', photos: 'strip' },
  },
  jakarta: {
    slug: 'jakarta',
    tier: 2,
    keyFacts: {
      population: placeholderPopulation(12345678),
      leadAgency: PLACEHOLDER_AGENCY,
      joinedBC: PLACEHOLDER_JOINED,
      sensors: PLACEHOLDER_SENSORS,
      currentConditions: null,
    },
    featureStory: placeholderStory('Jakarta', false),
    programmes: placeholderProgrammes(3),
    photos: placeholderPhotos('Jakarta', 3),
    goFurther: placeholderGoFurther(true),
    layouts: { featureStory: 'title-left', programmes: 'numbered', photos: 'one-large-two-small' },
  },
  johannesburg: {
    slug: 'johannesburg',
    tier: 4,
    keyFacts: {
      population: placeholderPopulation(1234567),
      leadAgency: PLACEHOLDER_AGENCY,
      joinedBC: PLACEHOLDER_JOINED,
      sensors: PLACEHOLDER_SENSORS,
      currentConditions: { indexName: 'Placeholder index', level: 'Placeholder level' },
    },
    featureStory: placeholderStory('Johannesburg', false),
    programmes: placeholderProgrammes(3),
    photos: placeholderPhotos('Johannesburg', 6),
    // No resident platform of its own (brief section 10): the "Check today's air" group is left out.
    goFurther: placeholderGoFurther(false),
    layouts: { featureStory: 'large-opening', programmes: 'rows', photos: 'grid' },
  },
  'mexico-city': {
    slug: 'mexico-city',
    tier: 3,
    keyFacts: {
      population: placeholderPopulation(12345678),
      leadAgency: PLACEHOLDER_AGENCY,
      joinedBC: PLACEHOLDER_JOINED,
      sensors: PLACEHOLDER_SENSORS,
      // Live line only, no number or level (brief 5.3). 135 = the 123 + 12 placeholder sensors.
      currentConditions: { liveSensors: 135, updatedMinutesAgo: 5 },
    },
    featureStory: placeholderStory('Mexico City', true),
    programmes: placeholderProgrammes(3),
    photos: placeholderPhotos('Mexico City', 6),
    goFurther: placeholderGoFurther(true),
    layouts: { featureStory: 'lead-photo', programmes: 'numbered', photos: 'strip' },
  },
  milan: {
    slug: 'milan',
    tier: 1,
    keyFacts: {
      population: placeholderPopulation(1234567),
      leadAgency: PLACEHOLDER_AGENCY,
      joinedBC: PLACEHOLDER_JOINED,
      sensors: null,
      currentConditions: null,
    },
    featureStory: placeholderStory('Milan', false),
    programmes: placeholderProgrammes(3),
    photos: placeholderPhotos('Milan', 3),
    goFurther: placeholderGoFurther(true),
    layouts: { featureStory: 'title-left', programmes: 'cards', photos: 'one-large-two-small' },
  },
  sofia: {
    slug: 'sofia',
    tier: 4,
    keyFacts: {
      population: placeholderPopulation(1234567),
      leadAgency: PLACEHOLDER_AGENCY,
      joinedBC: PLACEHOLDER_JOINED,
      sensors: PLACEHOLDER_SENSORS,
      currentConditions: { indexName: 'Placeholder index', level: 'Placeholder level' },
    },
    featureStory: placeholderStory('Sofia', false),
    programmes: placeholderProgrammes(3),
    photos: placeholderPhotos('Sofia', 6),
    goFurther: placeholderGoFurther(true),
    layouts: { featureStory: 'large-opening', programmes: 'numbered', photos: 'grid' },
  },
  warsaw: {
    slug: 'warsaw',
    tier: 4,
    keyFacts: {
      population: placeholderPopulation(1234567),
      leadAgency: PLACEHOLDER_AGENCY,
      joinedBC: PLACEHOLDER_JOINED,
      sensors: PLACEHOLDER_SENSORS,
      currentConditions: { indexName: 'Placeholder index', level: 'Placeholder level' },
    },
    featureStory: placeholderStory('Warsaw', false),
    programmes: placeholderProgrammes(2),
    photos: placeholderPhotos('Warsaw', 3),
    goFurther: placeholderGoFurther(true),
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

/**
 * The next chapter city after `slug`: alphabetical, looping from the last back to the first (brief
 * 5.8: Bogotá, Jakarta, Johannesburg, Mexico City, Milan, Sofia, Warsaw, then Bogotá). Uses
 * CHAPTER_CITIES, which is already sorted by name. Null only when `slug` is not a chapter city.
 */
export function nextChapterCity(slug: string): AtlasCity | null {
  const index = CHAPTER_CITIES.findIndex((city) => city.slug === slug)
  if (index === -1) return null
  return CHAPTER_CITIES[(index + 1) % CHAPTER_CITIES.length]
}
