'use client'

/**
 * ProofCatalogueCard.tsx — concept-local catalogue card for the proof-directory page (honest reframe).
 *
 * Purpose
 *   A FORK of the toolkit `CatalogueCard`, owned by this concept so the proof-directory can show, per
 *   capability, the cities that run their OWN version of it WITHOUT mutating the shared/locked toolkit
 *   card (isolation constraint, spec §5 + section brief §"full isolation"). It renders the same
 *   capability card — status badge, title + blurb, sketch preview — and adds an honest, explorable
 *   deployment list in the card FOOTER.
 *
 * The honesty reframe (the point of this component)
 *   The earlier "Used by N BC cities" line FALSELY implied those cities had adopted the BC toolkit's
 *   component. They have not — each city runs its OWN version of the capability (SIMAT, Airparif,
 *   AirQo, …). This card now says "{N} cities run their own version" and lets the reader EXPAND a
 *   wrapped list of those cities, each linking to that city's REAL tool. The link state is the honesty
 *   mechanic, mirrored from the globe panel: a chip links out only where a proven-live `url` exists;
 *   where the data holds no url the chip is plain (unlinked) text. No url is inferred, fixed, or
 *   pointed at a BC product — a link always goes to the city's own tool.
 *
 *   Affordance mirrors the shared card:
 *     - AVAILABLE → the card content is a link to the live route (hover lift, "Available" badge); the
 *       deployment toggle is a real button inside the card so its clicks never trigger the route link.
 *     - COMING SOON → a de-emphasised, unlinked card with a muted "Coming soon" badge.
 *
 * Why a fork, not a prop on the shared card
 *   The shared toolkit `CatalogueCard` is consumed by the locked toolkit landing; adding this
 *   treatment there would change that surface too. Forking concept-local keeps the locked concept
 *   untouched. The ToolPreview sketch + the CatalogueEntry type ARE imported read-only from the
 *   toolkit concept (shared content, allowed).
 *
 * Key exports: ProofCatalogueCard
 * External dependencies: next/link, react (useState), lucide-react (ChevronDown, ArrowUpRight),
 *   @/components/concept (ConceptCard), toolkit ToolPreview + CatalogueEntry (read-only imports),
 *   ../_data/proof-cities (CapabilityDeployment type).
 *
 * Token discipline: badges, count line, toggle, and chips use bridged/inline BC tokens — functional
 *   status colour and muted neutral, not decoration. Light mode. No emoji.
 */

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowUpRight } from 'lucide-react'
import { ConceptCard } from '@/components/concept'
import { ToolPreview } from '../../toolkit/_components/ToolPreview'
import type { CatalogueEntry } from '../../toolkit/_components/toolkit-catalogue.config'
import type { CapabilityDeployment } from '../_data/proof-cities'

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
 * One city chip in the expanded deployment list. The honesty mechanic, mirrored from the globe panel:
 * a city with a proven-live `url` renders an external link to its OWN tool (new tab + noopener); a
 * city with `url: null` renders a plain, unlinked muted chip. Either way the title carries the city's
 * real tool name so hovering reveals what that city actually runs.
 */
function DeploymentChip({ deployment }: { deployment: CapabilityDeployment }) {
  if (deployment.url !== null) {
    return (
      <a
        href={deployment.url}
        target="_blank"
        rel="noopener noreferrer"
        title={deployment.toolName}
        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
        style={{ borderColor: 'var(--bc-color-steel)', color: 'var(--bc-semantic-brand)' }}
      >
        {deployment.name}
        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
      </a>
    )
  }
  return (
    <span
      title={`${deployment.toolName} — no public link yet`}
      className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
    >
      {deployment.name}
    </span>
  )
}

/**
 * The honest proof footer: an "{N} cities run their own version" count line plus an expand/collapse
 * toggle revealing the city chips. Renders nothing when no city runs the capability (an empty list
 * shows no footer at all). The count uses the real deployment length, with a singular form at N===1.
 */
function DeploymentProof({ deployments }: { deployments: CapabilityDeployment[] }) {
  const [expanded, setExpanded] = useState<boolean>(false)

  if (deployments.length === 0) {
    return null
  }

  const count = deployments.length
  const countLabel =
    count === 1 ? '1 city runs its own version' : `${count} cities run their own version`

  return (
    <div className="mt-auto border-t border-border pt-2.5">
      <p className="text-xs font-medium text-muted-foreground">{countLabel}</p>
      {/* Real button so a click never bubbles to an enclosing route link; comfortable tap height. */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="mt-1.5 inline-flex min-h-[40px] items-center gap-1 text-xs font-semibold transition-colors hover:underline"
        style={{ color: 'var(--bc-semantic-brand)' }}
      >
        {expanded ? 'Hide how cities deploy this' : 'See how cities deploy this'}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-2">
          {deployments.map((deployment) => (
            <DeploymentChip key={deployment.slug} deployment={deployment} />
          ))}
        </div>
      )}
    </div>
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
  /** Cities that run their OWN version of this capability — drives the honest deployment footer. */
  deployments: CapabilityDeployment[]
}

/**
 * A catalogue card with the honest deployment footer. Available entries link the card content to the
 * live route (full opacity + hover lift); the deployment toggle is a real button so exploring the
 * city list never navigates. Coming-soon entries render a plain de-emphasised card with no route link.
 * The deployment footer sits under the content in both states.
 */
export function ProofCatalogueCard({ entry, deployments }: ProofCatalogueCardProps) {
  // Available + has a route → the card content links to the route; the toggle stays an inner button.
  if (entry.status === 'available' && entry.href !== null) {
    return (
      <ConceptCard className="flex h-full flex-col gap-2.5">
        <Link
          href={entry.href}
          className="group flex flex-col gap-2.5 rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${entry.title} — available, open the component`}
        >
          <CardInner entry={entry} />
          <span
            className="pt-1 text-sm font-medium"
            style={{ color: 'var(--bc-semantic-brand)' }}
          >
            Open the component →
          </span>
        </Link>
        <DeploymentProof deployments={deployments} />
      </ConceptCard>
    )
  }

  // Coming soon → de-emphasised, not linked.
  return (
    <ConceptCard className="flex h-full flex-col gap-2.5 opacity-90">
      <CardInner entry={entry} />
      <DeploymentProof deployments={deployments} />
    </ConceptCard>
  )
}
