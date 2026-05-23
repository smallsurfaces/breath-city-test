import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const NAV = [
  { label: "Who we are", href: "#" },
  { label: "What we do", href: "#" },
  { label: "Why we do it", href: "#" },
  { label: "Cities", href: "#" },
  { label: "Toolkit", href: "/ux-concepts/jtbd-city-toolkit" },
  { label: "Voices", href: "#" },
  { label: "News", href: "#" },
];

export function BcHeader() {
  return (
    <>
      <div
        className="px-4 py-2"
        style={{
          backgroundColor: "var(--bc-color-light-grey)",
          borderBottom: "1px solid var(--bc-color-steel)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--bc-color-white)",
              color: "var(--bc-semantic-muted)",
              border: "1px solid var(--bc-color-steel)",
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to hub
          </Link>
          <p className="text-[11px]" style={{ color: "var(--bc-semantic-muted)" }}>
            Prototype &middot; JTBD City Toolkit &mdash; chrome is approximate,
            not the live site.
          </p>
        </div>
      </div>

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

          <span
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: "var(--bc-semantic-brand)",
              color: "var(--bc-color-white)",
            }}
          >
            Join us
          </span>
        </div>
      </header>
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
