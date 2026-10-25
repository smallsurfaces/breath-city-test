/**
 * SiteCaveat.tsx — the site-level caveat line in the page footer (spec 3.4).
 *
 * Purpose
 *   One short line in the footer of the entry page and every city page, leading with where the data
 *   comes from (round 1, decision K1 and A2): the caller passes the wording, ENTRY_CAVEAT or
 *   cityCaveat(name) from ../_data/cover-copy. Optional plain extra lines below it (the entry page's
 *   OpenStreetMap credit, decision A4). Neutral, quiet, no colour.
 *
 * Key exports: SiteCaveat (named)
 * External dependencies: none.
 */

/** Props for SiteCaveat. */
type SiteCaveatProps = {
  /** The caveat line. */
  text: string
  /** Further plain lines (credits), smaller; empty for none. */
  notes: string[]
}

/** The caveat footer. Server component. */
export function SiteCaveat({ text, notes }: SiteCaveatProps) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-6">
        <p className="text-sm leading-relaxed text-foreground/70">{text}</p>
        {notes.map((note) => (
          <p key={note} className="text-xs leading-relaxed text-foreground/60">
            {note}
          </p>
        ))}
      </div>
    </footer>
  )
}
