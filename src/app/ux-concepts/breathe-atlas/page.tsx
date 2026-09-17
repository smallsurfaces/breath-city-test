/**
 * page.tsx — Breathe Atlas landing page (first build step: nav + globe cover).
 *
 * Purpose
 *   The concept's landing page as far as brief sections 4.1 (nav) and 4.2 (globe cover). The cover
 *   browser (4.3), the chapters and the data maps are later build steps and are not rendered here.
 *
 *   Reads the prototype switch for the wordmark behaviour from the query string:
 *     /ux-concepts/breathe-atlas                 -> mode A (city name fades in over the wordmark)
 *     /ux-concepts/breathe-atlas?wordmark=swap   -> mode B (the big word swaps to the city name)
 *   This sets the starting mode only; the Still | Swap toggle under the pause button switches it
 *   on the page (see GlobeCover).
 *
 * Key exports: BreatheAtlasPage (default)
 * External dependencies: ./_components/AtlasNav, ./_components/GlobeCover, ./_components/Wordmark (type).
 */

import { AtlasNav } from './_components/AtlasNav'
import { GlobeCover } from './_components/GlobeCover'
import type { WordmarkMode } from './_components/Wordmark'

/** Next 15 page props: search params arrive as a promise. */
type BreatheAtlasPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BreatheAtlasPage({ searchParams }: BreatheAtlasPageProps) {
  const params = await searchParams
  const wordmarkMode: WordmarkMode = params.wordmark === 'swap' ? 'swap' : 'overlay'

  return (
    <main className="min-h-screen bg-background">
      <AtlasNav />
      <GlobeCover wordmarkMode={wordmarkMode} />
    </main>
  )
}
