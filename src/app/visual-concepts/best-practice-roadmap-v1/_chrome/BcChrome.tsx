/**
 * BcChrome.tsx — Visual Concept v1 forked BC site chrome (header + newsletter + footer).
 *
 * Fork origin
 *   Clean fork of src/components/concept/BcChrome.tsx (commit 09839c6 / tag
 *   wireframe-lock-2026-05-26).
 *
 * Pass 3 v2 (2026-05-27 — per pass-3-v2 brief §3 + chrome brief §2 / §3 / §4)
 *
 *   BcHeader
 *     - Desktop nav drops 7→3 items (Who we are / What we do / Why we do it). Driven by
 *       config.nav (now 3 items in roadmap-chrome.config.ts).
 *     - "Join us" → "Join Us" (capital U).
 *     - Header height 80px → 72px (mobile stays 64px).
 *     - White-on-scroll variant DEFERRED per Jack's call — static BC Blue header at all
 *       scroll positions for this pass. Logo asset extraction (bc-horizontal-blue.svg)
 *       skipped accordingly.
 *
 *   Mobile menu overlay
 *     - 7-nav reduced to 5 items via config.mobileNav (Who we are / What we do / Why we do it
 *       / Cities / News). Falls back to config.nav when mobileNav is omitted.
 *     - Join Us pill REMOVED from overlay bottom (Figma overlay is nav-only).
 *     - Left-aligned social-icon row added in foot zone (circular BC-Blue treatment via
 *       shared SocialIconsRow helper).
 *     - Decorative MenuCloudArch added lower-right (teal Window02 silhouette — acceptable
 *       v3 fallback per chrome brief §3 delta 4; photo lands in follow-up).
 *     - Active-item cyan underline pattern added (2px BC Light Blue, 6px offset). No item
 *       currently active in the overlay (the page identity is now hero-headline-led), but
 *       the renderer applies the underline when isActiveNavLabel matches in future.
 *
 *   BcFooter
 *     - FooterWindowsStrip REMOVED from invocation (Figma footer has no window strip).
 *       Component definition preserved for future reuse.
 *     - Grid restructured from equal 4-col to `2fr 1fr 1fr 1fr` (Col 1 wider; Cols 2-4 narrow).
 *     - Col 1 (Brand block): logo + longer body paragraph + small copyright line + Ahoy
 *       Studios credit. Social icons MOVED OUT to bottom-band right anchor.
 *     - Col 2 (Site links): heading drops "Site" uppercase eyebrow; first link "Who we are"
 *       at Halbfett 14px acts as column anchor; list = Who we are / What we do / Why we do it
 *       / Privacy / Imprint.
 *     - Col 3 (Offices): two short office address paragraphs side-by-side (lorem-ipsum
 *       second-office per Jack's call — placeholder posture matching Figma).
 *     - Col 4 (Contact): single short paragraph + Contact Us pill (BcPill variant A).
 *     - Bottom band restructured: LEFT = navy-pill containing 3 founding-org logos
 *       (CleanAirFund / vertical-hairline / C40 white-square / hairline / Bloomberg);
 *       RIGHT = 3 circular BC-Blue social icons (shared SocialIconsRow circular mode).
 *     - Copyright foot strip REMOVED (rights-reserved moved into Col 1; tagline absent
 *       from Figma).
 *
 * BcNewsletter — NO CHANGES this pass. Mint signup strip preserved as-is.
 *
 * Behaviour preserved from pass 2
 *   - sticky header, mobile hamburger that opens a full-screen dark-navy overlay nav,
 *     body-scroll-lock while the overlay is open.
 *
 * Styling
 *   All BC BRAND colours applied via inline `style` with `var(--bc-*)` tokens — no `bg-bc-*`
 *   utility classes, no hardcoded hex. Layout/spacing via Tailwind utilities. Light mode only.
 *
 * Key exports: BcHeader, BcNewsletter, BcFooter
 * External dependencies: next/link, next/image, react (useState, useEffect),
 *   ./bc-chrome.config (types), ./BcPill (CTA primitive), ./BcGraphics (MenuCloudArch),
 *   ./SocialIcons (SocialIconsRow).
 *
 * Asset dependencies (imported below)
 *   _brand/graphics/logo/bc-horizontal-white.svg — header + footer logo lockup
 *   _brand/graphics/partners/clean-air-fund.svg  — footer founding-org pill
 *   _brand/graphics/partners/c40-cities.svg      — footer founding-org pill (rendered with
 *                                                  filter: invert(1) per asset README)
 *   _brand/graphics/partners/bloomberg-philanthropies.svg — footer founding-org pill
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { BcChromeConfig } from './bc-chrome.config'
import { BcPill } from './BcPill'
import { MenuCloudArch } from './BcGraphics'
import { SocialIconsRow } from './SocialIcons'

// Static asset imports — Next.js resolves these to optimised public paths.
import bcLogoWhite from '../_brand/graphics/logo/bc-horizontal-white.svg'
import cleanAirFundLogo from '../_brand/graphics/partners/clean-air-fund.svg'
import c40CitiesLogo from '../_brand/graphics/partners/c40-cities.svg'
import bloombergLogo from '../_brand/graphics/partners/bloomberg-philanthropies.svg'

/**
 * Active-route detection helper for the header / mobile menu. Vestigial in pass 3 v2 — the
 * Roadmap item dropped out of the nav so no header label currently returns true, but the
 * renderer keeps the active-state branch live so a future live item can carry the cyan
 * underline. Could be lifted to usePathname() if more route-aware active states are needed
 * in future iterations.
 */
function isActiveNavLabel(label: string): boolean {
  // Vestigial: 'Roadmap' is no longer in the nav set. Keeping the mechanism in place for
  // future iterations where a live destination needs the active-underline treatment.
  return label === 'Roadmap'
}

/**
 * One desktop nav link in the BC Blue header. White Söhne Halbfett 15px at rest; hovers to
 * cyan. Active item renders with a cyan underline 2px solid at 4px offset. Inert items
 * (href === '#') render at white-60% with cursor-default and no hover.
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
 * BcHeader — pass 3 v2 BC site chrome. Solid BC Blue ground, white horizontal BC logo, 3-item
 * desktop nav (Who we are / What we do / Why we do it), white pill "Join Us" CTA with trailing
 * arrow, mobile hamburger that opens a full-screen dark-navy overlay nav.
 *
 * Driven entirely by `config`: logo links to `config.logoHref`, desktop nav reads `config.nav`,
 * mobile overlay reads `config.mobileNav` (falls back to `config.nav` for legacy configs).
 *
 * No prototype/disclaimer bar is rendered here — the single visual-concept disclaimer is owned
 * by the forked PrototypeHeader above this in the visual concept layout (which also owns the
 * sole back-to-hub).
 *
 * White-on-scroll variant DEFERRED per Jack's call — header stays in single white-logo-on-BC-Blue
 * state at all scroll positions. Can be added in a follow-up; the scroll listener + logo-swap
 * mechanism would live in a useEffect here.
 */
export function BcHeader({ config }: { config: BcChromeConfig }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const overlayNavItems = config.mobileNav ?? config.nav

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
      {/* BC-style header — solid BC Blue, sticky. Pass 3 v2: 72px desktop (was 80px), mobile
       * stays 64px. No backdrop blur, no bottom border — the solid blue field is the statement. */}
      <header
        className="sticky top-0 z-30 w-full"
        style={{
          backgroundColor: 'var(--bc-color-blue)',
        }}
      >
        <div
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4"
          style={{ height: '72px' }}
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

          {/* Primary nav — desktop only. Pass 3 v2: 3 items from the live BC site. */}
          <nav className="hidden lg:flex items-center gap-x-6">
            {config.nav.map((item) => (
              <HeaderNavLink key={item.label} label={item.label} href={item.href} />
            ))}
          </nav>

          {/* Right cluster — Join Us pill CTA (desktop + tablet) + hamburger (mobile only). */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:block">
              <BcPill
                label="Join Us"
                href="#"
                variant="A"
                size="small"
              />
            </div>

            {/* Hamburger button — visible below lg breakpoint (mobile + tablet). Stroke white
             * since the header is BC Blue. */}
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

      {/* Mobile nav overlay — full-screen, dark navy ground. Pass 3 v2 deltas:
       *   - 5 items via config.mobileNav (was config.nav 7 items)
       *   - Join Us pill REMOVED from bottom (Figma overlay is nav-only)
       *   - Social-icon row added in foot zone (circular BC-Blue treatment)
       *   - MenuCloudArch decoration in lower-right (teal Window02 silhouette)
       *   - Active-item cyan underline pattern */}
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

          {/* Nav links — vertically centred, large Söhne Kräftig. Live = white at full opacity,
           * inert = white at 50% with cursor-default. Active item gets cyan underline. */}
          <nav className="flex flex-1 flex-col items-start justify-center gap-7 px-8 sm:px-12">
            {overlayNavItems.map((item) => {
              const live = item.href !== '#'
              const active = isActiveNavLabel(item.label)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-disabled={!live}
                  onClick={() => {
                    if (live) setMenuOpen(false)
                  }}
                  className="tracking-tight"
                  style={{
                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                    fontWeight: 'var(--bc-font-weight-medium)',
                    lineHeight: 1.05,
                    color: live
                      ? 'var(--bc-color-white)'
                      : 'color-mix(in srgb, var(--bc-color-white) 50%, transparent)',
                    cursor: live ? 'pointer' : 'default',
                    textDecoration: active ? 'underline' : 'none',
                    textDecorationColor: 'var(--bc-color-light-blue)',
                    textDecorationThickness: '2px',
                    textUnderlineOffset: '6px',
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Foot zone — left-aligned social-icon row (circular treatment), plus the
           * decorative cloud-arch shape anchored lower-right via absolute positioning. */}
          <div className="relative px-8 sm:px-12 pb-10 pt-2">
            <SocialIconsRow mode="circular" align="start" />

            {/* Decorative cloud-arch in lower-right — teal Window02 silhouette per the
             * chrome brief acceptable-v3 fallback. Photo lands in a follow-up. */}
            <div
              className="absolute pointer-events-none"
              style={{ bottom: 0, right: 0 }}
            >
              <MenuCloudArch size={180} opacity={0.4} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * BcNewsletter — mint signup strip that sits between the page content and the BC Blue footer.
 * Pass 3 v2: NO CHANGES — preserved as-is per pass-3-v2 brief §8 + §9.
 *
 * Heading at title-medium 900 dark blue, body at body-size muted dark blue, email input pill
 * + Sign up pill (BcPill variant B) in a horizontal flex. Non-functional form (prototype).
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
 * BcFooter — pass 3 v2 BC Blue full-bleed footer. Per the chrome brief §4:
 *
 *   Top band  — 2fr/1fr/1fr/1fr grid:
 *     Col 1 (2fr) — logo + body paragraph + rights-reserved line + Ahoy credit
 *     Col 2 (1fr) — Who we are anchor + 4-link list (What/Why/Privacy/Imprint)
 *     Col 3 (1fr) — Offices (London + lorem-ipsum second office)
 *     Col 4 (1fr) — Contact paragraph + Contact Us pill
 *
 *   Bottom band — flex justify-between:
 *     LEFT  — navy-pill with 3 founding-org logos inline (Clean Air Fund / C40 / Bloomberg)
 *     RIGHT — 3 circular BC-Blue social icons (X / Instagram / Facebook)
 *
 * All on `var(--bc-color-blue)` ground. One subtle white-at-15% hairline between top and
 * bottom bands. Copyright foot strip REMOVED (rights-reserved moved into Col 1).
 *
 * FooterWindowsStrip is NOT invoked here anymore — the Figma footer has no decorative window
 * strip. The component definition remains in BcGraphics.tsx for future reuse.
 *
 * Static content, no props.
 */
export function BcFooter() {
  return (
    <footer
      className="w-full"
      style={{ backgroundColor: 'var(--bc-color-blue)' }}
    >
      {/* Top band — 4-column footer with 2fr/1fr/1fr/1fr proportions. Stacks to 1 column on mobile. */}
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          {/* Col 1 — Brand block (wider). Logo + body paragraph + rights-reserved + Ahoy credit. */}
          <div className="space-y-5 max-w-md">
            <Image
              src={bcLogoWhite}
              alt="Breathe Cities"
              style={{ width: '180px', height: 'auto' }}
            />
            <p
              style={{
                fontSize: 'var(--bc-font-size-body)',
                lineHeight: 'var(--bc-line-height-snug)',
                color: 'color-mix(in srgb, var(--bc-color-white) 90%, transparent)',
                fontWeight: 'var(--bc-font-weight-regular)',
              }}
            >
              Breathe Cities is a partnership that supports sustainable cities and
              communities by improving public health and cutting climate emissions.
            </p>
            <div className="space-y-1.5 pt-2">
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'var(--bc-font-weight-regular)',
                  color: 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)',
                }}
              >
                2025 — Breathe Cities | All rights reserved
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 'var(--bc-font-weight-regular)',
                  color: 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)',
                }}
              >
                Website designed by Ahoy Studios | <AhoyLink />
              </div>
            </div>
          </div>

          {/* Col 2 — Site nav. "Who we are" rendered at Halbfett as column anchor; remaining
           * items are FooterLink instances. */}
          <div>
            <FooterAnchorLink href="#" label="Who we are" />
            <div className="space-y-2.5 mt-3">
              <FooterLink href="#" label="What we do" />
              <FooterLink href="#" label="Why we do it" />
              <FooterLink href="#" label="Privacy" />
              <FooterLink href="#" label="Imprint" />
            </div>
          </div>

          {/* Col 3 — Offices. Two short address paragraphs stacked vertically. Second office
           * is lorem-ipsum placeholder per Jack's call (matches Figma posture). */}
          <FooterColumn heading="Offices">
            <div className="space-y-1 mb-4">
              <FooterText>Clean Air Fund</FooterText>
              <FooterText>20 St Thomas Street</FooterText>
              <FooterText>London SE1 9RS, UK</FooterText>
            </div>
            <div className="space-y-1">
              <FooterText>Lorem Ipsum Office</FooterText>
              <FooterText>Dolor sit amet 42</FooterText>
              <FooterText>Consectetur 1000, BE</FooterText>
            </div>
          </FooterColumn>

          {/* Col 4 — Contact. Short paragraph + Contact Us pill (variant A: white on BC Blue). */}
          <FooterColumn heading="Contact">
            <p
              className="mb-4"
              style={{
                fontSize: '14px',
                lineHeight: 'var(--bc-line-height-snug)',
                color: 'color-mix(in srgb, var(--bc-color-white) 90%, transparent)',
                fontWeight: 'var(--bc-font-weight-regular)',
              }}
            >
              Get in touch with the Breathe Cities team for press, partnerships, or city
              enquiries.
            </p>
            <BcPill
              label="Contact Us"
              href="#"
              variant="A"
              size="small"
            />
          </FooterColumn>
        </div>
      </div>

      {/* Bottom band — founding-org pill (LEFT) + circular social row (RIGHT). One hairline
       * separator above this zone. */}
      <div
        className="px-4 py-8"
        style={{ borderTop: '1px solid var(--bc-footer-divider)' }}
      >
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* LEFT — navy pill containing 3 founding-org logos inline with vertical-hairline
           * separators. Dark Blue ground (#003574) wraps the trio as a single brand cluster. */}
          <div
            className="inline-flex items-center"
            style={{
              backgroundColor: 'var(--bc-color-dark-blue)',
              borderRadius: '9999px',
              padding: '12px 24px',
              gap: '20px',
            }}
          >
            <Image
              src={cleanAirFundLogo}
              alt="Clean Air Fund"
              style={{ height: '32px', width: 'auto', opacity: 0.95 }}
            />
            <span
              aria-hidden="true"
              style={{
                width: '1px',
                height: '24px',
                backgroundColor: 'color-mix(in srgb, var(--bc-color-white) 30%, transparent)',
              }}
            />
            {/* C40 Cities — black logo on white square BG. filter: invert(1) was the pass-2
             * approach; inside the dark navy pill, the inverted treatment reads cleaner as
             * a white square containing the black mark (C40's canonical lockup). */}
            <Image
              src={c40CitiesLogo}
              alt="C40 Cities"
              style={{
                height: '32px',
                width: 'auto',
                filter: 'invert(1)',
              }}
            />
            <span
              aria-hidden="true"
              style={{
                width: '1px',
                height: '24px',
                backgroundColor: 'color-mix(in srgb, var(--bc-color-white) 30%, transparent)',
              }}
            />
            <Image
              src={bloombergLogo}
              alt="Bloomberg Philanthropies"
              style={{ height: '28px', width: 'auto', opacity: 0.95 }}
            />
          </div>

          {/* RIGHT — circular social icons (3 items) via shared SocialIconsRow circular mode. */}
          <SocialIconsRow mode="circular" align="end" />
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
      <div>{children}</div>
    </div>
  )
}

/**
 * FooterAnchorLink — internal helper, pass 3 v2. The column-anchor variant of FooterLink: same
 * link mechanics, but rendered at Halbfett 14px white (column anchor weight). Used in Col 2
 * for the "Who we are" header that doubles as the first link.
 */
function FooterAnchorLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      className="block"
      style={{
        fontSize: '14px',
        fontWeight: 'var(--bc-font-weight-semibold)',
        color: hovered
          ? 'var(--bc-color-light-blue)'
          : 'var(--bc-color-white)',
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
 * FooterLink — internal helper. Söhne Buch 14px white-at-90%, hover lifts to full white.
 * `small` variant drops to 13px for tertiary links.
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
        fontSize: small ? '13px' : '14px',
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
 * FooterText — internal helper. Same typography as FooterLink but renders as a plain div (no
 * interaction). Used for the Office address lines.
 */
function FooterText({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '14px',
        fontWeight: 'var(--bc-font-weight-regular)',
        color: 'color-mix(in srgb, var(--bc-color-white) 90%, transparent)',
        lineHeight: 'var(--bc-line-height-snug)',
      }}
    >
      {children}
    </div>
  )
}

/**
 * AhoyLink — small internal helper for the Ahoy Studios credit hyperlink in Col 1. Underlined
 * link, white at 60% non-hover / full white hover.
 */
function AhoyLink() {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="https://ahoystudios.com"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: hovered
          ? 'var(--bc-color-white)'
          : 'color-mix(in srgb, var(--bc-color-white) 60%, transparent)',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        transition: 'color 200ms ease',
      }}
      // Side effect: hover state drives colour swap via React re-render.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      ahoystudios.com
    </a>
  )
}
