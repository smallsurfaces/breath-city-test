/**
 * BcChrome.tsx — Visual Concept v1 forked BC site chrome (header + newsletter + footer).
 *
 * Fork origin
 *   Clean fork of src/components/concept/BcChrome.tsx (commit 09839c6 / tag
 *   wireframe-lock-2026-05-26). The fork exists so visual evolution on the BC site chrome
 *   inside this sandbox cannot leak into the wireframe-locked UX concepts that depend on the
 *   shared original. First-deploy render was identical; pass 2 (2026-05-27) transforms the
 *   chrome to authentic BC-site fidelity per the brand-pass-2 brief §2, §3, §10.
 *
 *   The local BcChromeConfig type comes from ./bc-chrome.config (forked).
 *
 * Pass 2 transformations (2026-05-27)
 *   BcHeader — solid BC Blue ground (was white/blurred). White horizontal BC logo (was BC badge
 *     + wordmark). 7-item full live-site nav verbatim (was 5 items). Söhne Halbfett 15px white,
 *     hover-to-cyan (was 14px text-foreground hover-to-primary). Active "Roadmap" item underlined
 *     in cyan. White pill "Join us" CTA via BcPill variant A with trailing arrow (was solid blue
 *     pill via inline style, no arrow). Mobile hamburger stroke flipped to white. Mobile overlay
 *     nav text white-on-navy (was teal/steel).
 *
 *   BcNewsletter — NEW component, mint signup strip. Previously the signup strip was inside
 *     BcFooter as a teal-tinted band; pass 2 lifts it OUT of the footer per brief §10 so the
 *     mint band sits between the page content and the BC Blue footer. Composition: heading at
 *     title-medium 900 dark blue, body at body-size muted dark blue, email input pill + Sign up
 *     pill (BcPill variant B) in a horizontal flex.
 *
 *   BcFooter — BC Blue full-bleed (was multi-coloured-bands). 4-column desktop grid (Brand+social
 *     / Site / Office / Contact), founding-org strip with brand-guide caveat copy ABOVE the three
 *     real founding-org SVGs (was grey placeholder text labels), copyright + tagline foot strip.
 *     All on one continuous BC Blue field with subtle white-at-15% hairline dividers between
 *     bands. Decorative window-shape strip (3 windows, white at 25%) at the top edge per brief
 *     §7 moment 3.
 *
 * Behaviour preserved verbatim from pass 1 / shared chrome:
 *   - sticky header,
 *   - mobile hamburger that opens a full-screen dark-navy overlay nav,
 *   - body-scroll-lock while the overlay is open (and cleaned up on unmount).
 *   - blur removed in pass 2 — header is now solid BC Blue per brief §2.
 *
 * Styling
 *   All BC BRAND colours applied via inline `style` with `var(--bc-*)` tokens — no `bg-bc-*`
 *   utility classes, no hardcoded hex. Layout/spacing via Tailwind utilities. Light mode only.
 *
 * Key exports: BcHeader, BcNewsletter, BcFooter
 * External dependencies: next/link, next/image, react (useState, useEffect),
 *   ./bc-chrome.config (types), ./BcPill (CTA primitive), ./BcGraphics (FooterWindowsStrip).
 *
 * Asset dependencies (imported below)
 *   _brand/graphics/logo/bc-horizontal-white.svg  — header + footer logo lockup
 *   _brand/graphics/partners/clean-air-fund.svg   — founding-org strip
 *   _brand/graphics/partners/c40-cities.svg       — founding-org strip (rendered with filter:
 *                                                   invert(1) per asset README — original is
 *                                                   black logo on white square)
 *   _brand/graphics/partners/bloomberg-philanthropies.svg — founding-org strip
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { BcChromeConfig } from './bc-chrome.config'
import { BcPill } from './BcPill'
import { FooterWindowsStrip } from './BcGraphics'

// Static asset imports — Next.js resolves these to optimised public paths.
import bcLogoWhite from '../_brand/graphics/logo/bc-horizontal-white.svg'
import cleanAirFundLogo from '../_brand/graphics/partners/clean-air-fund.svg'
import c40CitiesLogo from '../_brand/graphics/partners/c40-cities.svg'
import bloombergLogo from '../_brand/graphics/partners/bloomberg-philanthropies.svg'

/**
 * Active-route detection helper for the header. Pass 2 marks the "Roadmap" nav item as active
 * because the v1 overview route IS the roadmap. Live routes other than Roadmap are not currently
 * marked active (the prototype lacks the other live destinations to compare against).
 * Currently a simple label equality check; could be lifted to usePathname() if more route-aware
 * active states are needed in future iterations.
 */
function isActiveNavLabel(label: string): boolean {
  return label === 'Roadmap'
}

/**
 * One desktop nav link in the BC Blue header. White Söhne Halbfett 15px at rest; hovers to
 * cyan per brief §2. Active item (Roadmap) renders with a cyan underline 2px solid at 4px
 * offset. Inert items (href === '#') render at white-60% with cursor-default and no hover.
 */
function HeaderNavLink({
  label,
  href,
}: {
  label: string
  href: string
}) {
  const live = href !== '#'
  const active = isActiveNavLabel(label)
  const [hovered, setHovered] = useState(false)

  if (!live) {
    return (
      <span
        aria-disabled="true"
        className="cursor-default"
        style={{
          fontSize: '15px',
          fontWeight: 'var(--bc-font-weight-semibold)',
          color: 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)',
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <Link
      href={href}
      style={{
        fontSize: '15px',
        fontWeight: 'var(--bc-font-weight-semibold)',
        color: hovered
          ? 'var(--bc-color-light-blue)'
          : 'var(--bc-color-white)',
        transition: 'color 200ms ease',
        textUnderlineOffset: '4px',
        textDecorationThickness: '2px',
        textDecoration: active ? 'underline' : 'none',
        textDecorationColor: 'var(--bc-color-light-blue)',
      }}
      // Side effect: hover state drives colour swap via React re-render.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {label}
    </Link>
  )
}

/**
 * BcHeader — pass 2 BC site chrome. Solid BC Blue ground, white horizontal BC logo, 7-item live
 * nav verbatim (Who we are / What we do / Why we do it / Cities / Roadmap [active] / Voices /
 * News), white pill "Join us" CTA with trailing arrow, mobile hamburger that opens a full-screen
 * dark-navy overlay nav (preserved from pass 1, stroke flipped to white).
 *
 * Driven entirely by `config`: logo links to `config.logoHref`, each `config.nav` item renders
 * live or inert based on `href !== '#'`. Active state derived from label === 'Roadmap' per the
 * active-route helper above.
 *
 * No prototype/disclaimer bar is rendered here — the single visual-concept disclaimer is owned
 * by the forked PrototypeHeader above this in the visual concept layout (which also owns the
 * sole back-to-hub).
 */
export function BcHeader({ config }: { config: BcChromeConfig }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Side effect: prevent body scroll while the mobile overlay is open. Cleaned up on unmount.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      {/* BC-style header — solid BC Blue, sticky, taller than pass 1 (80px desktop / 64px
       * mobile) per brief §2. No backdrop blur, no bottom border — the solid blue field is the
       * statement. */}
      <header
        className="sticky top-0 z-30 w-full"
        style={{
          backgroundColor: 'var(--bc-color-blue)',
        }}
      >
        <div
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4"
          style={{ height: '80px' }}
        >
          {/* Logo (left) — white horizontal BC logo lockup. ~140px wide desktop, scales down
           * on mobile via responsive width. Links to config.logoHref (the concept home). */}
          <Link
            href={config.logoHref}
            className="flex items-center flex-shrink-0"
            aria-label="Breathe Cities home"
          >
            <Image
              src={bcLogoWhite}
              alt="Breathe Cities"
              priority
              className="h-auto"
              style={{ width: 'clamp(110px, 12vw, 140px)' }}
            />
          </Link>

          {/* Primary nav — desktop only. 7 items from the live BC site verbatim (per brief §2),
           * with the concept-specific "Roadmap" inserted between Cities and Voices. */}
          <nav className="hidden lg:flex items-center gap-x-6">
            {config.nav.map((item) => (
              <HeaderNavLink key={item.label} label={item.label} href={item.href} />
            ))}
          </nav>

          {/* Right cluster — Join us pill CTA (desktop + tablet) + hamburger (mobile only). */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:block">
              <BcPill
                label="Join us"
                href="#"
                variant="A"
                size="small"
              />
            </div>

            {/* Hamburger button — visible below lg breakpoint (mobile + tablet). Stroke flipped
             * to white per brief §2 since the header is now BC Blue. */}
            <button
              type="button"
              aria-label="Open navigation menu"
              className="flex h-11 w-11 items-center justify-center lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--bc-color-white)"
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

      {/* Mobile nav overlay — full-screen, dark navy background (preserved from pass 1).
       * Pass 2: nav link colours flipped from teal/steel to white/transparent-white per
       * brief §2. */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: 'var(--bc-color-dark-blue)' }}
        >
          {/* Overlay header — logo left, close button right */}
          <div className="flex items-center justify-between px-4" style={{ height: '64px' }}>
            <Link
              href={config.logoHref}
              className="flex items-center"
              onClick={() => setMenuOpen(false)}
              aria-label="Breathe Cities home"
            >
              <Image
                src={bcLogoWhite}
                alt="Breathe Cities"
                style={{ width: '110px', height: 'auto' }}
              />
            </Link>

            <button
              type="button"
              aria-label="Close navigation menu"
              className="flex h-11 w-11 items-center justify-center"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                width="26"
                height="26"
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

          {/* Nav links — vertically centred, large text. Live = white at full opacity, inert =
           * white at 50% with cursor-default. */}
          <nav className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
            {config.nav.map((item) => {
              const live = item.href !== '#'
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-disabled={!live}
                  onClick={() => {
                    if (live) setMenuOpen(false)
                  }}
                  className="text-2xl tracking-tight"
                  style={{
                    fontWeight: 'var(--bc-font-weight-semibold)',
                    color: live
                      ? 'var(--bc-color-white)'
                      : 'color-mix(in srgb, var(--bc-color-white) 50%, transparent)',
                    cursor: live ? 'pointer' : 'default',
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Join us pill — pinned to bottom of overlay for visibility on mobile */}
          <div className="px-4 pb-8 flex justify-center">
            <BcPill
              label="Join us"
              href="#"
              variant="A"
              size="standard"
            />
          </div>
        </div>
      )}
    </>
  )
}

/**
 * BcNewsletter — NEW component for pass 2. Mint signup strip that sits between the page
 * content and the BC Blue footer. Heading at title-medium 900 dark blue, body at body-size
 * muted, horizontal email input + Sign up pill on desktop / stacked on mobile.
 *
 * The form is non-functional (no onSubmit handler) — this is a prototype, not a real signup.
 * The intent is visual fidelity to the live BC site's signup strip.
 */
export function BcNewsletter() {
  return (
    <section
      className="w-full"
      style={{ backgroundColor: 'var(--bc-color-mint-wash)' }}
    >
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-6">
        <h2
          className="tracking-tight"
          style={{
            fontSize: 'var(--bc-font-size-title-medium)',
            fontWeight: 'var(--bc-font-weight-black)',
            color: 'var(--bc-color-dark-blue)',
            lineHeight: 'var(--bc-line-height-title-medium)',
          }}
        >
          Stay in the loop
        </h2>
        <p
          className="mx-auto max-w-md"
          style={{
            fontSize: 'var(--bc-font-size-body)',
            color: 'color-mix(in srgb, var(--bc-color-dark-blue) 75%, transparent)',
          }}
        >
          Get clean-air news and city stories from the Breathe Cities network.
        </p>

        {/* Form row — email input + Sign up pill. Stacks on mobile. */}
        <form
          className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          // Side effect: prevent default submit because this is a prototype with no backend.
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="your@email.com"
            aria-label="Email address"
            className="flex-1 px-5 py-3 text-sm placeholder:text-muted-foreground"
            style={{
              backgroundColor: 'var(--bc-color-white)',
              border:
                '1px solid color-mix(in srgb, var(--bc-color-dark-blue) 15%, transparent)',
              borderRadius: 'var(--bc-pill-radius)',
              color: 'var(--bc-color-dark-blue)',
              outline: 'none',
            }}
          />
          <BcPill
            label="Sign up"
            as="button"
            type="submit"
            variant="B"
            size="standard"
          />
        </form>
      </div>
    </section>
  )
}

/**
 * BcFooter — pass 2 BC Blue full-bleed footer. Three logical zones on one continuous BC Blue
 * field, separated by white-at-15% hairlines:
 *
 *   Zone 1 — Decorative top edge (window-shape strip, brief §7 moment 3)
 *   Zone 2 — Main 4-column footer (Brand+social / Site / Office / Contact)
 *   Zone 3 — Founding-org strip (caveat copy + three real founding-org SVGs)
 *   Zone 4 — Copyright + tagline foot strip
 *
 * All on `var(--bc-color-blue)` ground per brief §3; subtle white-at-15% hairlines between
 * bands derived from --bc-footer-divider token.
 *
 * Static content, no props.
 */
export function BcFooter() {
  return (
    <footer
      className="w-full"
      style={{ backgroundColor: 'var(--bc-color-blue)' }}
    >
      {/* Zone 1 — decorative window-shape strip at the top edge, brief §7 moment 3. */}
      <div className="pt-12 pb-8">
        <FooterWindowsStrip />
      </div>

      {/* Zone 2 — main 4-column footer. Stacks to 1 column on mobile. */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Col 1 — Brand block: white logo + tagline + social icons */}
          <div className="space-y-5">
            <Image
              src={bcLogoWhite}
              alt="Breathe Cities"
              style={{ width: '160px', height: 'auto' }}
            />
            <p
              style={{
                fontSize: '16px',
                lineHeight: 'var(--bc-line-height-snug)',
                color: 'color-mix(in srgb, var(--bc-color-white) 90%, transparent)',
                fontWeight: 'var(--bc-font-weight-regular)',
              }}
            >
              Helping cities clean the air we breathe.
            </p>
            <SocialIconsRow />
          </div>

          {/* Col 2 — Site nav */}
          <FooterColumn heading="Site">
            <FooterLink href="#" label="Who we are" />
            <FooterLink href="#" label="What we do" />
            <FooterLink href="#" label="Why we do it" />
            <FooterLink href="#" label="Cities" />
            <FooterLink href="#" label="Voices" />
            <FooterLink href="#" label="News" />
            <FooterLink href="#" label="Join us" />
          </FooterColumn>

          {/* Col 3 — Office */}
          <FooterColumn heading="Office">
            <FooterText>Clean Air Fund</FooterText>
            <FooterText>20 St Thomas Street</FooterText>
            <FooterText>London SE1 9RS, UK</FooterText>
          </FooterColumn>

          {/* Col 4 — Contact */}
          <FooterColumn heading="Contact">
            <FooterLink href="#" label="Press queries" />
            <FooterLink href="#" label="Contact us" />
            <FooterLink href="#" label="Privacy" small />
          </FooterColumn>
        </div>
      </div>

      {/* Zone 3 — Founding-org strip. Caveat copy ABOVE the three logos. */}
      <div
        className="px-4 py-10"
        style={{ borderTop: '1px solid var(--bc-footer-divider)' }}
      >
        <div className="mx-auto max-w-4xl">
          <p
            className="text-center mb-6"
            style={{
              fontSize: '13px',
              color: 'color-mix(in srgb, var(--bc-color-white) 70%, transparent)',
              fontWeight: 'var(--bc-font-weight-regular)',
              lineHeight: 'var(--bc-line-height-snug)',
            }}
          >
            An initiative delivered by Clean Air Fund, C40 Cities and Bloomberg
            Philanthropies.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {/* Clean Air Fund — already white-on-transparent. Render direct, opacity 90%. */}
            <Image
              src={cleanAirFundLogo}
              alt="Clean Air Fund"
              style={{ height: '48px', width: 'auto', opacity: 0.9 }}
            />
            {/* C40 Cities — black logo on white square BG. filter:invert(1) flips both:
             * background goes black (invisible on BC Blue), logo paths go white. Per the
             * _brand/graphics/README.md asset notes. */}
            <Image
              src={c40CitiesLogo}
              alt="C40 Cities"
              style={{
                height: '48px',
                width: 'auto',
                opacity: 0.9,
                filter: 'invert(1)',
              }}
            />
            {/* Bloomberg Philanthropies — already white-on-transparent. */}
            <Image
              src={bloombergLogo}
              alt="Bloomberg Philanthropies"
              style={{ height: '48px', width: 'auto', opacity: 0.9 }}
            />
          </div>
        </div>
      </div>

      {/* Zone 4 — Copyright + tagline foot strip */}
      <div
        className="px-4 py-5"
        style={{ borderTop: '1px solid var(--bc-footer-divider)' }}
      >
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span
            style={{
              fontSize: '12px',
              color: 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)',
            }}
          >
            © 2026 Breathe Cities. All rights reserved.
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)',
            }}
          >
            30% cleaner air by 2030.
          </span>
        </div>
      </div>
    </footer>
  )
}

/**
 * FooterColumn — internal helper. Renders an eyebrow heading (uppercase tracking-wider 13px
 * Söhne Halbfett white-60%) + a vertical stack of child links/text.
 */
function FooterColumn({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3
        className="uppercase tracking-wider mb-4"
        style={{
          fontSize: '13px',
          fontWeight: 'var(--bc-font-weight-semibold)',
          color: 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)',
        }}
      >
        {heading}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

/**
 * FooterLink — internal helper. Söhne Buch 15px white-at-90%, hover lifts to full white.
 * `small` variant drops to 13px for tertiary links (e.g. Privacy).
 */
function FooterLink({
  href,
  label,
  small,
}: {
  href: string
  label: string
  small?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      className="block"
      style={{
        fontSize: small ? '13px' : '15px',
        fontWeight: 'var(--bc-font-weight-regular)',
        color: hovered
          ? 'var(--bc-color-white)'
          : 'color-mix(in srgb, var(--bc-color-white) 90%, transparent)',
        transition: 'color 200ms ease',
      }}
      // Side effect: hover state drives colour swap via React re-render.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {label}
    </Link>
  )
}

/**
 * FooterText — internal helper. Same typography as FooterLink but renders as a plain span (no
 * interaction). Used for the Office address lines.
 */
function FooterText({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '15px',
        fontWeight: 'var(--bc-font-weight-regular)',
        color: 'color-mix(in srgb, var(--bc-color-white) 90%, transparent)',
      }}
    >
      {children}
    </div>
  )
}

/**
 * SocialIconsRow — internal helper. Twitter (X), Instagram, Facebook, LinkedIn — inline SVG at
 * 22px, 1.75px stroke, white at 75% opacity, hover lifts to full white. Inline SVG (not
 * lucide-react) keeps the icon set deterministic and avoids pulling in a new icon dependency
 * when the existing set may render at different stroke weights.
 *
 * Side note: all icon hrefs are '#' (inert) — this is a prototype.
 */
function SocialIconsRow() {
  return (
    <div className="flex items-center gap-4">
      <SocialIcon label="Twitter">
        {/* X / Twitter glyph — simplified inline */}
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </SocialIcon>
      <SocialIcon label="Instagram">
        {/* Instagram glyph — simplified inline */}
        <g>
          <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </g>
      </SocialIcon>
      <SocialIcon label="Facebook">
        {/* Facebook 'f' glyph — simplified inline */}
        <path d="M22 12a10 10 0 1 0-11.563 9.876v-6.987H7.898V12h2.539V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.261c-1.243 0-1.63.772-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.986A10.001 10.001 0 0 0 22 12z" />
      </SocialIcon>
      <SocialIcon label="LinkedIn">
        {/* LinkedIn glyph — simplified inline */}
        <g>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zM6.83 20.452H3.84V9h2.99v11.452z" />
          <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="none" />
        </g>
      </SocialIcon>
    </div>
  )
}

/** Single social icon — 22px inline SVG, hover-state colour swap. */
function SocialIcon({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="#"
      aria-label={label}
      style={{
        color: hovered
          ? 'var(--bc-color-white)'
          : 'color-mix(in srgb, var(--bc-color-white) 75%, transparent)',
        transition: 'color 200ms ease',
      }}
      // Side effect: hover state drives colour swap via React re-render.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {children}
      </svg>
    </a>
  )
}
