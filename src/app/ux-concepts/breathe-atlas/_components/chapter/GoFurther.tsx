/**
 * GoFurther.tsx — chapter section 7, go further (fixed layout, brief 5.7).
 *
 * Purpose
 *   The city's own links, grouped: "Check today's air" (resident platforms), "Get the data" (open
 *   data portal, API or OpenAQ) and "Department responsible". A group with no link is left out, and
 *   the remaining groups share the row evenly. Every link opens in a new tab.
 *
 * Accessibility
 *   h2 "Go further" labels the section; each group name is an h3 over a list of links, each at least
 *   56px tall. If a city has no links at all the section renders nothing.
 *
 * Key exports: GoFurther (named)
 * External dependencies: @/components/concept (ConceptSectionHeader), ./ChapterLink,
 *   ../../_data/chapters (types).
 */

import { ConceptSectionHeader } from '@/components/concept'
import { OutboundLink } from './ChapterLink'
import type { ChapterGoFurther, ChapterLink } from '../../_data/chapters'

/** Props for GoFurther. */
type GoFurtherProps = {
  /** The city's grouped links. */
  links: ChapterGoFurther
}

/** Columns for the number of groups present, so they share the row evenly from `md`. */
const GROUP_COLUMNS: Record<number, string> = {
  1: '',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
}

/** The go further section. Server component. */
export function GoFurther({ links }: GoFurtherProps) {
  const groups: Array<{ key: string; title: string; items: ChapterLink[] }> = [
    { key: 'air', title: "Check today's air", items: links.checkTodaysAir },
    { key: 'data', title: 'Get the data', items: links.getTheData },
    {
      key: 'department',
      title: 'Department responsible',
      items: links.departmentResponsible === null ? [] : [links.departmentResponsible],
    },
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
