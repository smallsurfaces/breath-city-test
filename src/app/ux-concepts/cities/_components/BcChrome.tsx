/**
 * BcChrome.tsx — light recreation of Breathe Cities' real site chrome
 *
 * A lightweight, in-prototype recreation of breathecities.org's header and
 * footer, so our Resident Concerns components can be shown embedded in BC's
 * REAL site IA (concept validation in-context). NOT pixel-perfect — an
 * approximation of BC's look: brand blue/teal, clean sans, airy whitespace,
 * image-forward. Placeholder logos only — we never reproduce BC's real assets.
 *
 * Shared by both new mock routes:
 *   - /ux-concepts/cities          (cities index mock)
 *   - /ux-concepts/cities/[slug]   (city page mock)
 *
 * Three pieces:
 *   - BcHeader: BC logo (left) + primary nav + "Join us" button. Nav links are
 *     inert (#) EXCEPT "Cities", which points at our index mock so the in-context
 *     story is navigable. Back-to-hub is NOT rendered here — the standard
 *     PrototypeHeader (above BcHeader in layout.tsx) owns it; BcChrome rendering
 *     its own would produce a duplicate "second nav bar".
 *   - BcFooter: email signup band + partner logos (placeholder text marks) + foot.
 *   - PartnerLogos: Clean Air Fund / C40 / Bloomberg as neutral placeholder marks.
 *
 * Styling: BC semantic Tailwind tokens (light mode). All colour via tokens —
 * never hardcoded hex.
 *
 * Key exports: BcHeader, BcFooter
 * External dependencies: next/link
 */

import Link from "next/link";

/** BC's real primary nav labels (from breathecities.org). Only "Cities" is live. */
const NAV = [
  { label: "Who we are", href: "#" },
  { label: "What we do", href: "#" },
  { label: "Why we do it", href: "#" },
  { label: "Cities", href: "/ux-concepts/cities" },
  { label: "Voices", href: "#" },
  { label: "News", href: "#" },
];

/**
 * The site header — BC logo left, nav centre/right, "Join us" CTA. Above it, a
 * thin prototype bar carries an honest "mock" marker. Back-to-hub is OWNED by
 * the standard PrototypeHeader rendered above BcHeader in the cities layout.tsx
 * — BcChrome no longer renders its own back-to-hub (it would be a duplicate
 * "second nav bar").
 */
export function BcHeader() {
  return (
    <>
      {/* Prototype bar — not part of BC's real chrome; labels this honestly as an
          in-context mock. No back-to-hub link here: the standard PrototypeHeader
          (rendered above BcHeader in the cities layout.tsx) owns the sole
          back-to-hub. */}
      <div className="border-b border-border bg-muted/50">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-2">
          <p className="text-[11px] text-muted-foreground">
            Prototype · Resident Concerns shown in a light recreation of BC&rsquo;s
            site — chrome is approximate, not the live site.
          </p>
        </div>
      </div>

      {/* BC-style header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          {/* Logo (left) */}
          <Link href="/ux-concepts/cities" className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-bc-white"
              style={{ backgroundColor: "var(--bc-semantic-brand)" }}
            >
              BC
            </span>
            <span className="hidden text-base font-bold tracking-tight text-foreground sm:inline">
              Breathe Cities
            </span>
          </Link>

          {/* Primary nav */}
          <nav className="hidden items-center gap-5 md:flex">
            {NAV.map((item) => {
              const live = item.href !== "#";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-disabled={!live}
                  className={[
                    "text-sm font-medium transition-colors",
                    live
                      ? "text-foreground hover:text-bc-blue"
                      : "cursor-default text-muted-foreground/70",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Join us CTA */}
          <span
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-bc-white"
            style={{ backgroundColor: "var(--bc-semantic-brand)" }}
          >
            Join us
          </span>
        </div>
      </header>
    </>
  );
}

/** Partner logos as neutral placeholder marks — we never reproduce real assets. */
function PartnerLogos() {
  const partners = ["Clean Air Fund", "C40", "Bloomberg Philanthropies"];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
      {partners.map((name) => (
        <span
          key={name}
          className="text-sm font-semibold tracking-wide text-muted-foreground"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

/**
 * The site footer — email signup band, partner logos, and a foot strip. Mirrors
 * BC's real footer structure (signup + partners) in a light, token-styled form.
 */
export function BcFooter() {
  return (
    <footer className="mt-16">
      {/* Email signup band — teal-tinted, airy */}
      <section
        className="px-4 py-14"
        style={{ backgroundColor: "var(--bc-color-light-teal)" }}
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-bc-dark-blue">
            Stay in the loop
          </h2>
          <p className="text-sm text-bc-dark-blue/80">
            Get clean-air news and city stories from the Breathe Cities network.
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
            <span className="flex-1 rounded-full border border-bc-dark-blue/15 bg-bc-white px-4 py-2.5 text-left text-sm text-muted-foreground">
              your@email.com
            </span>
            <span
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-bc-white"
              style={{ backgroundColor: "var(--bc-semantic-brand)" }}
            >
              Sign up
            </span>
          </div>
        </div>
      </section>

      {/* Partner logos */}
      <section className="border-t border-border px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            In partnership with
          </p>
          <PartnerLogos />
        </div>
      </section>

      {/* Foot strip */}
      <div className="border-t border-border bg-muted/40 px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <span>
            Light recreation of breathecities.org · internal prototype, not the
            live site.
          </span>
          <span>Breathe Cities — 30% cleaner air by 2030.</span>
        </div>
      </div>
    </footer>
  );
}
