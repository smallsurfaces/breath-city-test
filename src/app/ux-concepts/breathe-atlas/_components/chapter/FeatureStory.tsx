/**
 * FeatureStory.tsx — chapter section 4, the feature story (content section, brief 5.5).
 *
 * Purpose
 *   The city's feature story in one of three layouts, picked per city in ../../_data/chapters.ts:
 *   - `title-left`: the headline in a narrow left column, the text in a wider right column.
 *   - `lead-photo`: a wide lead photo above a centred text column (uses `story.leadPhoto`; with no
 *     lead photo the text simply starts at the top).
 *   - `large-opening`: the first paragraph set large under the headline, the rest in a narrower,
 *     indented column.
 *   Every layout ends with the story's sources, linked (new tab). Since round 2 (item 9,
 *   2026-09-22) the list is no longer shown in the page: a small "Sources" label carries an "i"
 *   (CreditInfo, labelled "Sources") whose popover holds the full linked list, so every source is
 *   still one tap away. The lead photo's credit sits behind its own "i" (PhotoFigure).
 *
 * Accessibility
 *   The headline is the section's h2 and labels the section; "Sources" is an h3. On a phone every
 *   layout is a single column, in reading order.
 *
 * Key exports: FeatureStory (named)
 * External dependencies: ./PhotoFigure, ./ChapterLink, ./CreditInfo, ../../_data/chapters (types).
 */

import { OutboundLink } from './ChapterLink'
import { CreditInfo } from './CreditInfo'
import { PhotoFigure } from './PhotoFigure'
import type { ChapterFeatureStory, FeatureStoryLayout } from '../../_data/chapters'

/** Props for FeatureStory. */
type FeatureStoryProps = {
  /** The story content. */
  story: ChapterFeatureStory
  /** The city's layout choice. */
  layout: FeatureStoryLayout
}

/** Id of the story headline (one feature story per page). */
const HEADING_ID = 'atlas-feature-story-heading'

/** Headline style shared by the layouts (below the h1 cap). */
const HEADLINE = 'text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl'

/** Body paragraph style. */
const BODY = 'text-base leading-relaxed text-foreground/85 sm:text-lg'

/** The story's paragraphs, from `from` onward. */
function Paragraphs({ paragraphs, from }: { paragraphs: string[]; from: number }) {
  return (
    <div className="space-y-5">
      {paragraphs.slice(from).map((paragraph, index) => (
        <p key={`${from + index}`} className={BODY}>
          {paragraph}
        </p>
      ))}
    </div>
  )
}

/**
 * The story's sources: a small "Sources" label and the "i", with the linked list in the popover
 * (round 2, item 9). Nothing is rendered when there are none.
 */
function Sources({ story }: { story: ChapterFeatureStory }) {
  if (story.sources.length === 0) return null
  return (
    <div className="mt-8 flex items-center gap-2 border-t border-border pt-4">
      <h3 className="text-sm font-semibold text-foreground">Sources</h3>
      <CreditInfo label="Sources" align="start" className="">
        {/* -my-3 tucks the first and last links' 56px targets into the popup's own padding. */}
        <ul className="-my-3">
          {story.sources.map((source) => (
            <li key={`${source.label}-${source.url}`}>
              <OutboundLink href={source.url} className="text-sm text-foreground">
                {source.label}
              </OutboundLink>
            </li>
          ))}
        </ul>
      </CreditInfo>
    </div>
  )
}

/** The feature story section. Server component. */
export function FeatureStory({ story, layout }: FeatureStoryProps) {
  if (layout === 'title-left') {
    return (
      <section aria-labelledby={HEADING_ID} className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
          <h2 id={HEADING_ID} className={HEADLINE}>
            {story.title}
          </h2>
          <div>
            <Paragraphs paragraphs={story.paragraphs} from={0} />
            <Sources story={story} />
          </div>
        </div>
      </section>
    )
  }

  if (layout === 'lead-photo') {
    return (
      <section aria-labelledby={HEADING_ID} className="mx-auto max-w-6xl px-4">
        {story.leadPhoto !== null && (
          <PhotoFigure photo={story.leadPhoto} mediaClassName="aspect-[4/3] sm:aspect-[21/9]" className="mb-8" />
        )}
        <div className="mx-auto max-w-3xl">
          <h2 id={HEADING_ID} className={`${HEADLINE} mb-6`}>
            {story.title}
          </h2>
          <Paragraphs paragraphs={story.paragraphs} from={0} />
          <Sources story={story} />
        </div>
      </section>
    )
  }

  // large-opening
  const [opening] = story.paragraphs
  return (
    <section aria-labelledby={HEADING_ID} className="mx-auto max-w-6xl px-4">
      <div className="max-w-4xl">
        <h2 id={HEADING_ID} className={HEADLINE}>
          {story.title}
        </h2>
        {opening !== undefined && (
          <p className="mt-6 text-xl leading-relaxed text-foreground sm:text-2xl">{opening}</p>
        )}
      </div>
      <div className="mt-8 max-w-xl lg:ml-48">
        <Paragraphs paragraphs={story.paragraphs} from={1} />
        <Sources story={story} />
      </div>
    </section>
  )
}
