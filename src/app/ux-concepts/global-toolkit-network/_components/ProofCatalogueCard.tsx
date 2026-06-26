/**
 * ProofCatalogueCard.tsx — concept-local catalogue card for the proof-directory page (v2 §5).
 *
 * Purpose
 *   A FORK of the toolkit `CatalogueCard`, owned by this concept so the proof-directory can thread a
 *   muted "Used by N BC cities" proof line onto each card WITHOUT mutating the shared/locked toolkit
 *   card (isolation constraint, spec §5 + section brief §"full isolation"). It renders the same
 *   capability card — status badge, title + blurb, sketch preview — and adds, in the card FOOTER, a
 *   quiet adoption line that says "the globe shows where this is running".
 *
 *   The proof line is the card's job (number-homes rule): cards carry ADOPTION BREADTH ("Used by N
 *   BC cities"), never population / human scale. Population lives only on the globe panel.
 *
 *   Affordance mirrors the shared card:
 *     - AVAILABLE → the whole card is a link to the live route (hover lift, "Available" badge).
 *     - COMING SOON → a de-emphasised, unlinked card with a muted "Coming soon" badge.
 *
 * Why a fork, not a prop on the shared card
 *   The shared toolkit `CatalogueCard` is consumed by the locked toolkit landing; adding a proof
 *   line there would change that surface too. Forking concept-local keeps the locked concept
 *   untouched while letting this concept show the adoption proof. The ToolPreview sketch + the
 *   CatalogueEntry type ARE imported read-only from the toolkit concept (shared content, allowed).
 *
 * Key exports: ProofCatalogueCard
 * External dependencies: next/link, @/components/concept (ConceptCard), toolkit ToolPreview +
 *   CatalogueEntry (read-only imports).
 *
 * Token discipline: badges + proof line use bridged/inline BC tokens — functional status colour and
 *   muted neutral, not decoration. Light mode. No emoji.
 */

import Link from 'next/link'
import { ConceptCard } from '@/components/concept'
import { ToolPreview } from '../../toolkit/_components/ToolPreview'
import type { CatalogueEntry } from '../../toolkit/_components/toolkit-catalogue.config'

/** Status badge — brand chip for Available, muted chip for Coming soon. Text only, no emoji. */
function StatusBadge({ status }: { status: CatalogueEntry['status'] }) {
  if (status === 'available') {
    return (
      <span
        className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{
          backgroundColor: 'var(--bc-semantic-aqi-good-bg)',
          color: 'var(--bc-semantic-aqi-good-text)',
        }}
      >
        Available
      </span>
    )
  }
  return (
    <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
      Coming soon
    </span>
  )
}

/**
 * The muted proof line: "Used by N BC cities". Renders only when at least one city runs the
 * capability — a zero count shows nothing rather than an awkward "Used by 0 cities". Muted so it
 * never competes with the tool name (spec §5). Adoption breadth only — never population.
 */
function ProofLine({ cityCount }: { cityCount: number }) {
  if (cityCount <= 0) {
    return null
  }
  const label = cityCount === 1 ? 'Used by 1 BC city' : `Used by ${cityCount} BC cities`
  return (
    <p className="mt-auto border-t border-border pt-2.5 text-xs font-medium text-muted-foreground">
      {label}
    </p>
  )
}

/** The card inner: title row (with badge), blurb, and the sketch preview. */
function CardInner({ entry }: { entry: CatalogueEntry }) {
  const isAvailable = entry.status === 'available'
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
        <StatusBadge status={entry.status} />
      </div>
      <p className="text-sm text-muted-foreground">{entry.blurb}</p>
      {/* Sketch preview — kept for both states; drained on coming-soon so Available wins focus. */}
      <div
        className="mt-1"
        style={{
          opacity: isAvailable ? 1 : 0.55,
          filter: isAvailable ? 'none' : 'grayscale(0.6)',
        }}
      >
        <ToolPreview id={entry.id} />
      </div>
    </>
  )
}

/** Props for the concept-local catalogue card. */
type ProofCatalogueCardProps = {
  /** The catalogue entry (read-only from the toolkit config). */
  entry: CatalogueEntry
  /** How many plotted BC cities run a tool of this capability — drives the proof line. */
  cityCount: number
}

/**
 * A catalogue card with the proof line. Available entries wrap the whole card in a Link (full
 * opacity + hover lift); coming-soon entries render a plain de-emphasised card with no link. The
 * proof line sits in the footer under the content in both states.
 */
export function ProofCatalogueCard({ entry, cityCount }: ProofCatalogueCardProps) {
  // Available + has a route → the whole card is a link.
  if (entry.status === 'available' && entry.href !== null) {
    return (
      <Link
        href={entry.href}
        className="group block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${entry.title} — available, open the component`}
      >
        <ConceptCard className="flex h-full flex-col gap-2.5 transition-shadow group-hover:shadow-md">
          <CardInner entry={entry} />
          <span
            className="pt-1 text-sm font-medium"
            style={{ color: 'var(--bc-semantic-brand)' }}
          >
            Open the component →
          </span>
          <ProofLine cityCount={cityCount} />
        </ConceptCard>
      </Link>
    )
  }

  // Coming soon → de-emphasised, not linked.
  return (
    <ConceptCard className="flex h-full flex-col gap-2.5 opacity-90">
      <CardInner entry={entry} />
      <ProofLine cityCount={cityCount} />
    </ConceptCard>
  )
}
