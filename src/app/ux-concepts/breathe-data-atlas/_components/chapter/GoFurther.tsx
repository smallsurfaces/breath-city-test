/**
 * GoFurther.tsx — the city page's Go further section (spec section 7).
 *
 * Purpose
 *   Copied from breathe-atlas/_components/chapter/GoFurther.tsx on 2026-10-25 (the original is
 *   never edited). Iteration 2 (decision J): TWO columns, "[City]'s air quality services" (renamed
 *   from "Check today's air") and "Get the data". The programmes column is dropped: the Breathe
 *   Cities link now lives in the "Breathe Cities in [City]" section. "Department responsible" stays
 *   removed. An empty group is left out (rule 6).
 *
 * Key exports: GoFurther (named)
 * External dependencies: @/components/concept (ConceptSectionHeader), ./ChapterLink (OutboundLink),
 *   ../../_data/bogota (CityPage, CityLink types).
 */

import { ConceptSectionHeader } from '@/components/concept'
import { OutboundLink } from './ChapterLink'
import type { CityLink, CityPage } from '../../_data/city-page'

/** Props for GoFurther. */
type GoFurtherProps = {
  /** The city's grouped links. */
  links: CityPage['goFurther']
  /** The city's name, for the services heading. */
  cityName: string
}

/** Columns for the number of groups present, so they share the row evenly from `md`. */
const GROUP_COLUMNS: Record<number, string> = {
  1: '',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
}

/** The go further section. Server component. */
export function GoFurther({ links, cityName }: GoFurtherProps) {
  const groups: Array<{ key: string; title: string; items: CityLink[] }> = [
    { key: 'services', title: `${cityName}’s air quality services`, items: links.services },
    { key: 'data', title: 'Get the data', items: links.getTheData },
  ].filter((group) => group.items.length > 0)

  if (groups.length === 0) return null

  return (
    <section aria-label="Go further" className="mx-auto max-w-6xl px-4">
      <ConceptSectionHeader heading="Go further" className="mb-6" />
      <div className={`grid grid-cols-1 gap-x-8 gap-y-8 ${GROUP_COLUMNS[groups.length] ?? ''}`}>
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="border-b border-foreground/20 pb-2 text-base font-semibold text-foreground">{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={`${item.label}-${item.url}`} className="border-b border-border">
                  <OutboundLink href={item.url} className="w-full justify-between text-base text-foreground">
                    {item.label}
                  </OutboundLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
