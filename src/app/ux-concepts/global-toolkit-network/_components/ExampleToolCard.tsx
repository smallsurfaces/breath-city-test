/**
 * ExampleToolCard.tsx — renders one illustrative example tool block in the Global Toolkit Network
 * concept's "Tailored tools, designed with cities" section.
 *
 * Purpose
 *   One card per example tool: the tool name (h3), its muted description, a subtle muted "Concept"
 *   tag, and the tool's two state screenshots shown side by side, each with its caption beneath.
 *   Built on the shared ConceptCard surface so it reads as part of the concept family.
 *
 * Honesty (this concept's backbone)
 *   These tools are illustrative concepts, NOT in use. The card therefore carries NO prevalence
 *   counter, NO available/coming-soon status badge, and NO link or CTA (they are not navigable). The
 *   muted "Concept" tag is the only status marker, so the block reads as illustrative even out of
 *   section context. Per the functional-colour rule, the card chrome stays neutral (foreground /
 *   muted / border tokens); colour lives only inside the screenshots, which are content.
 *
 * Images
 *   Rendered with next/image (the PNGs are large, ~1–1.6MB each). Intrinsic dimensions are passed so
 *   the optimizer can size and lazy-load them; `className="h-auto w-full"` keeps them responsive
 *   within the two-column grid while preserving the 2880×2048 aspect ratio.
 *
 * Key exports: ExampleToolCard (named).
 * External dependencies: next/image, @/components/concept (ConceptCard), ./example-tools.config (type).
 */

import Image from 'next/image'
import { ConceptCard } from '@/components/concept'
import type { ExampleTool } from './example-tools.config'

/** Intrinsic pixel dimensions of every example-tool screenshot (all six share this size). */
const IMAGE_WIDTH = 2880
const IMAGE_HEIGHT = 2048

/** Props for ExampleToolCard. */
type ExampleToolCardProps = {
  /** The example tool to render — name, description, and its two state screenshots. */
  tool: ExampleTool
}

/**
 * Renders a single example-tool card. Server component, no client state. The two screenshots sit in
 * a one-up (mobile) / two-up (sm+) grid, each captioned beneath; the "Concept" tag is a small neutral
 * pill so the illustrative status is legible even if the card is seen out of section context.
 */
export function ExampleToolCard({ tool }: ExampleToolCardProps) {
  return (
    <ConceptCard>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{tool.name}</h3>
        {/* Muted "Concept" tag — neutral token only (NOT a functional-status colour), so the block
            reads as illustrative even out of section context. No status/availability badge. */}
        <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Concept
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>

      {/* The two state screenshots, side by side on sm+ (stacked on mobile), each captioned. */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tool.images.map((image) => (
          <figure key={image.src} className="m-0">
            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <Image
                src={image.src}
                alt={image.alt}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-2 text-xs font-medium text-muted-foreground">
              {image.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </ConceptCard>
  )
}
