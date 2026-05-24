/**
 * BcChrome.tsx — light recreation of Breathe Cities' real site chrome
 *
 * A lightweight, in-prototype recreation of breathecities.org's header and
 * footer, so the JTBD City Toolkit can be shown embedded in BC's real site IA
 * (concept validation in-context). NOT pixel-perfect — an approximation of BC's
 * look. Placeholder logos only — we never reproduce BC's real assets.
 *
 * Back-to-hub and the build identity are NOT rendered here — the standard
 * PrototypeHeader (mounted ABOVE BcHeader in layout.tsx) owns the sole
 * back-to-hub, the build name, and the "Updated" stamp. BcChrome rendering its
 * own back-to-hub pill or a "Prototype · …" banner would produce a duplicate
 * "second nav bar", so both were removed when this build was retrofitted onto
 * PrototypeHeader (mirroring how ux-concepts/cities/_components/BcChrome.tsx was
 * trimmed). The BC-site mock header/footer below is kept as the in-context story.
 *
 * Mobile: hamburger icon opens a full-screen overlay nav (matching BC's real
 * mobile nav pattern — dark navy background, vertical links in teal/cyan).
 *
 * Styling: BC semantic tokens (light mode). All colour via tokens — never hex.
 *
 * Key exports: BcHeader, BcFooter
 * External dependencies: next/link, react (useState, useEffect)
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/** BC's real primary nav labels. Only "Toolkit" is live; the rest are inert (#). */
const NAV = [
  { label: "Who we are", href: "#" },
  { label: "What we do", href: "#" },
  { label: "Why we do it", href: "#" },
  { label: "Cities", href: "#" },
  { label: "Toolkit", href: "/ux-concepts/jtbd-city-toolkit" },
  { label: "Voices", href: "#" },
  { label: "News", href: "#" },
];

/**
 * The BC-style site header — BC logo left, primary nav, "Join us" CTA. Back-to-hub
 * is OWNED by the standard PrototypeHeader rendered above BcHeader in layout.tsx;
 * BcChrome no longer renders its own (it would be a duplicate "second nav bar"),
 * and the old "Prototype · …" banner was removed for the same reason.
 *
 * Mobile: hamburger icon opens a full-screen overlay nav (matching BC's real
 * mobile nav pattern — dark navy background, vertical links in teal/cyan).
 */
export function BcHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  /* Prevent body scroll while overlay is open */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className="sticky top-0 z-30"
        style={{
          backgroundColor: "var(--bc-color-white)",
          borderBottom: "1px solid var(--bc-color-steel)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/ux-concepts/jtbd-city-toolkit" className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
              }}
            >
              BC
            </span>
            <span
              className="hidden text-base font-bold tracking-tight sm:inline"
              style={{ color: "var(--bc-semantic-text)" }}
            >
              Breathe Cities
            </span>
          </Link>

          {/* Primary nav — desktop only */}
          <nav className="hidden items-center gap-5 md:flex">
            {NAV.map((item) => {
              const live = item.href !== "#";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-disabled={!live}
                  className="text-sm font-medium"
                  style={{
                    color: live
                      ? "var(--bc-semantic-text)"
                      : "var(--bc-semantic-muted)",
                    cursor: live ? "pointer" : "default",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right cluster: Join us CTA + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {/* Join us CTA */}
            <span
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
              }}
            >
              Join us
            </span>

            {/* Hamburger button — mobile only */}
            <button
              type="button"
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center md:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--bc-semantic-text)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay — full-screen, dark navy background */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "var(--bc-color-dark-blue)" }}
        >
          {/* Overlay header — logo left, close button right */}
          <div className="flex items-center justify-between px-4 py-4">
            <Link
              href="/ux-concepts/jtbd-city-toolkit"
              className="flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: "var(--bc-semantic-brand)",
                  color: "var(--bc-color-white)",
                }}
              >
                BC
              </span>
            </Link>

            <button
              type="button"
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--bc-color-white)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </button>
          </div>

          {/* Nav links — vertically centered, large text */}
          <nav className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
            {NAV.map((item) => {
              const live = item.href !== "#";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-disabled={!live}
                  onClick={() => {
                    if (live) setMenuOpen(false);
                  }}
                  className="text-2xl font-semibold transition-colors"
                  style={{
                    color: live
                      ? "var(--bc-color-teal)"
                      : "var(--bc-color-steel)",
                    cursor: live ? "pointer" : "default",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}

export function BcFooter() {
  const partners = ["Clean Air Fund", "C40", "Bloomberg Philanthropies"];

  return (
    <footer className="mt-16">
      <section className="px-4 py-14" style={{ backgroundColor: "var(--bc-color-light-teal)" }}>
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--bc-color-dark-blue)" }}
          >
            Stay in the loop
          </h2>
          <p className="text-sm" style={{ color: "var(--bc-color-dark-blue)", opacity: 0.8 }}>
            Get clean-air news and city stories from the Breathe Cities network.
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
            <span
              className="flex-1 rounded-full px-4 py-2.5 text-left text-sm"
              style={{
                backgroundColor: "var(--bc-color-white)",
                border: "1px solid var(--bc-color-steel)",
                color: "var(--bc-semantic-muted)",
              }}
            >
              your@email.com
            </span>
            <span
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold"
              style={{
                backgroundColor: "var(--bc-semantic-brand)",
                color: "var(--bc-color-white)",
              }}
            >
              Sign up
            </span>
          </div>
        </div>
      </section>

      <section
        className="px-4 py-10"
        style={{ borderTop: "1px solid var(--bc-color-steel)" }}
      >
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--bc-semantic-muted)" }}
          >
            In partnership with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {partners.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold tracking-wide"
                style={{ color: "var(--bc-semantic-muted)" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div
        className="px-4 py-6"
        style={{
          borderTop: "1px solid var(--bc-color-steel)",
          backgroundColor: "var(--bc-color-light-grey)",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center text-xs sm:flex-row sm:text-left"
          style={{ color: "var(--bc-semantic-muted)" }}
        >
          <span>Light recreation of breathecities.org -- internal prototype, not the live site.</span>
          <span>Breathe Cities -- 30% cleaner air by 2030.</span>
        </div>
      </div>
    </footer>
  );
}
