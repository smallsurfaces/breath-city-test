/**
 * ProgrammeList.tsx — chapter section 5, the programme list (content section, brief 5.5).
 *
 * Purpose
 *   The city's named programmes, each linking to its own public page (new tab), in one of three
 *   layouts picked per city in ../../_data/chapters.ts:
 *   - `numbered`: an ordered list with large two-digit numbers.
 *   - `cards`: a grid of ConceptCards. The column count follows the number of programmes, so 2 or
 *     4 make pairs and 3 make one row of three.
 *   - `rows`: compact rows, name and description side by side from the `md` breakpoint.
 *
 * Accessibility
 *   h2 "Programmes" labels the section; each programme name is an h3 holding its link. Links are
 *   at least 56px tall. A city with no programmes renders nothing.
 *
 * Key exports: ProgrammeList (named)
 * External dependencies: @/components/concept (ConceptCard, ConceptSectionHeader), ./ChapterLink,
 *   ../../_data/chapters (types).
 */

import { ConceptCard, ConceptSectionHeader } from '@/components/concept'
import { OutboundLink } from './ChapterLink'
import type { ChapterProgramme, ProgrammesLayout } from '../../_data/chapters'

/** Props for ProgrammeList. */
type ProgrammeListProps = {
  /** The programmes, in order. */
  programmes: ChapterProgramme[]
  /** The city's layout choice. */
  layout: ProgrammesLayout
}

/** Card grid columns for `count` cards, so rows fill evenly where the count allows. */
function cardColumnsClass(count: number): string {
  if (count === 1) return ''
  if (count % 3 === 0) return 'md:grid-cols-3'
  if (count % 2 === 0) return 'sm:grid-cols-2'
  return 'sm:grid-cols-2 lg:grid-cols-3'
}

/** Two-digit list number ("01"). */
function twoDigits(index: number): string {
  return String(index + 1).padStart(2, '0')
}

/** The programme list section. Server component. */
export function ProgrammeList({ programmes, layout }: ProgrammeListProps) {
  if (programmes.length === 0) return null

  return (
    <section aria-label="Programmes" className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading="Programmes" className="mb-6" />

      {layout === 'numbered' && (
        <ol className="border-t border-border">
          {programmes.map((programme, index) => (
            <li
              key={`${programme.name}-${index}`}
              className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 border-b border-border py-5 sm:grid-cols-[5rem_minmax(0,1fr)]"
            >
              <span aria-hidden="true" className="pt-2.5 text-3xl font-bold tabular-nums leading-none text-foreground/30">
                {twoDigits(index)}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  <OutboundLink href={programme.url} className="">
                    {programme.name}
                  </OutboundLink>
                </h3>
                <p className="max-w-2xl text-base leading-relaxed text-foreground/80">{programme.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {layout === 'cards' && (
        <ul className={`grid grid-cols-1 gap-4 ${cardColumnsClass(programmes.length)}`}>
          {programmes.map((programme, index) => (
            <li key={`${programme.name}-${index}`} className="flex">
              <ConceptCard className="flex w-full flex-col">
                <h3 className="text-lg font-semibold leading-snug text-foreground">
                  <OutboundLink href={programme.url} className="-mt-3">
                    {programme.name}
                  </OutboundLink>
                </h3>
                <p className="mt-1 text-base leading-relaxed text-foreground/80">{programme.description}</p>
              </ConceptCard>
            </li>
          ))}
        </ul>
      )}

      {layout === 'rows' && (
        <ul className="border-t border-border">
          {programmes.map((programme, index) => (
            <li
              key={`${programme.name}-${index}`}
              className="flex flex-col border-b border-border py-3 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-8"
            >
              <h3 className="text-base font-semibold text-foreground">
                <OutboundLink href={programme.url} className="">
                  {programme.name}
                </OutboundLink>
              </h3>
              <p className="pb-2 text-sm leading-relaxed text-foreground/80 md:pb-0">{programme.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
