/**
 * page.tsx — Breathe Atlas landing page (nav + globe cover).
 *
 * Purpose
 *   The concept's landing page as far as brief sections 4.1 (nav) and 4.2 (globe cover).
 *
 *   The wordmark's `?wordmark=swap` prototype switch was removed on 2026-09-17: Jack chose the still
 *   wordmark after his phone test, so the page no longer reads search params and renders statically.
 *
 * Key exports: BreatheAtlasPage (default)
 * External dependencies: ./_components/AtlasNav, ./_components/GlobeCover.
 */

import { AtlasNav } from './_components/AtlasNav'
import { GlobeCover } from './_components/GlobeCover'

export default function BreatheAtlasPage() {
  return (
    <main className="min-h-screen bg-background">
      <AtlasNav />
      <GlobeCover />
    </main>
  )
}
