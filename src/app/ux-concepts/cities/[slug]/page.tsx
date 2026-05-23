/**
 * City page mock — /ux-concepts/cities/[slug]
 *
 * Recreates Breathe Cities' REAL city-page IA (light) for one BC-family city, so
 * our Resident Concerns component can be validated IN CONTEXT — embedded where
 * BC's own layout invites it. Data-driven for warsaw / london / bangkok
 * (Warsaw is the showcase). Server component; the flattened concern stack is a
 * nested client component (CityConcernStack).
 *
 * BC's real city-page structure (from breathecities.org/cities/<city>/), light:
 *   - Header (BcChrome) + hero: large city name, positioning subline, a quote,
 *     a hero image placeholder, and a KEY STAT callout.
 *   - (1) Air Pollution Challenge — text + hard data (real figures or [TK]).
 *   - (2) OUR CONCERN COMPONENT, FLATTENED — CityConcernStack (the core
 *     deliverable). Placed where BC's layout invites it: after the Challenge,
 *     before What We're Doing.
 *   - (3) What We're Doing — paragraphs + partner bullets.
 *   - Footer (BcChrome).
 *
 * EVIDENCE DISCIPLINE: every hard figure here is REAL and sourced (see CITY_PAGE
 * below), or rendered as a visible [TK] chip. We never fabricate a figure, and we
 * never reproduce BC's real photography — hero/related images are placeholders.
 * BC-family cities only. Mirrors the no-fabrication rule of concerns-data.
 *
 * Key exports: default page component, generateStaticParams, generateMetadata
 * External dependencies: BcChrome, CityConcernStack, concerns-data (CITIES)
 */

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BcHeader, BcFooter } from "../_components/BcChrome";
import { CityConcernStack } from "../_components/CityConcernStack";
import { CITIES, type CityKey } from "../../resident-concerns/_data/concerns-data";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

/** A hard-data row for the Air Pollution Challenge — real figure or a [TK] gap. */
interface ChallengeStat {
  /** The figure, e.g. "~65%", or null for an honest gap rendered as [TK]. */
  value: string | null;
  label: string;
  /** Provenance — which evidence the figure traces to. Always present. */
  source: string;
}

/**
 * Per-city display content for the BC-style chrome around the flattened stack.
 * The flattened stack itself reads ALL its content from concerns-data — this map
 * only carries the page-chrome copy (hero subline, quote, the Challenge hard-data
 * rows, and the What-We're-Doing bullets). Every numeric/policy claim is REAL and
 * sourced; genuine gaps are `value: null` → a visible [TK] chip.
 */
const CITY_PAGE: Record<
  CityKey,
  {
    subline: string;
    /** A representative resident/official voice — framed honestly as illustrative. */
    quote: string;
    /** The single hero key-stat callout. */
    keyStat: { value: string; label: string; source: string };
    challengeIntro: string;
    challengeStats: ChallengeStat[];
    doingIntro: string;
    doingBullets: string[];
  }
> = {
  warsaw: {
    subline:
      "Poland's capital — where coal and solid-fuel home heating drive the winter pollution that residents smell first.",
    quote:
      "“When the temperature drops, you can taste the smoke. It comes from the chimneys on my own street.”",
    keyStat: {
      value: "~65%",
      label:
        "of Warsaw's winter PM10 came from residential solid-fuel heating — now banned.",
      source: "Mazovia anti-smog resolution (city-initiatives-research-2)",
    },
    challengeIntro:
      "Warsaw's pollution is a winter story: when households burn coal and solid fuel to heat their homes, the smoke settles over the city. Naming that source was the turn from seeing the problem to acting on it.",
    challengeStats: [
      {
        value: "~65%",
        label: "of winter PM10 from residential solid-fuel heating",
        source: "Mazovia anti-smog resolution",
      },
      {
        value: "~10,000",
        label:
          "fewer premature deaths a year — nationally attributed to combined Polish smog-reduction policy",
        source: "Polish Smog Alert successes",
      },
      {
        value: "−46%",
        label: "PM2.5 city-wide (2010–2024) — the largest cut of any Breathe City",
        source: "Breathe Better report (city-wide trend, context only)",
      },
      {
        value: null,
        label: "Warsaw-specific WHO-guideline multiple / annual mean",
        source: "not isolated in this evidence set",
      },
    ],
    doingIntro:
      "Warsaw pairs binding law with national money: a regulator banned the dirtiest fuel, and the state pays households to switch — backed by one of Europe's largest urban sensor networks and a grassroots campaign that won the policy in the first place.",
    doingBullets: [
      "Coal & solid-fuel heating banned across the city from 1 September 2023 (Mazovia regional resolution).",
      "€25bn national Clean Air Programme funds boiler replacement — ~1 million household applications nationwide.",
      "37 km² central Low Emission Zone, launched July 2024, tightening through 2032.",
      "164 Airly sensors across the city and 17 municipalities, surfaced in the free Warsaw 19115 app.",
      "Polish Smog Alert — the citizen campaign credited with securing the coal ban and 14 of 16 regional resolutions.",
    ],
  },
  london: {
    subline:
      "A city of 9 million where road transport — not heating — is the dominant source, and where apportioning emissions first shaped the response.",
    quote:
      "“I changed my child's walk to school to a back street. The same journey, but away from the traffic.”",
    keyStat: {
      value: "−21%",
      label:
        "roadside NO₂ after the Ultra Low Emission Zone, with ~46,000 fewer polluting vehicles a day.",
      source: "ULEZ / LAEI (city-initiatives-research)",
    },
    challengeIntro:
      "London apportioned its emissions before it acted. The London Atmospheric Emissions Inventory found road transport was the dominant source of NOx — and that evidence, not instinct, shaped the city's response.",
    challengeStats: [
      {
        value: "~50%",
        label: "of London's NOx attributed to road transport (LAEI)",
        source: "London Atmospheric Emissions Inventory",
      },
      {
        value: "−21%",
        label: "roadside NO₂ reduction after ULEZ, ~46k fewer polluting vehicles/day",
        source: "ULEZ outcomes",
      },
      {
        value: "−28%",
        label: "PM2.5 city-wide (2010–2024), on the path to 30% by 2030",
        source: "Breathe Better report (city-wide trend, context only)",
      },
      {
        value: null,
        label: "London-specific WHO-guideline multiple / attributable deaths",
        source: "not isolated in this evidence set",
      },
    ],
    doingIntro:
      "London acts on the polluter, not the resident: it charges the dirtiest vehicles to enter, and gives families the tools to lower their own exposure on the days that matter.",
    doingBullets: [
      "Ultra Low Emission Zone — expanded city-wide in 2023, charging non-compliant vehicles, enforced by camera.",
      "3,500+ schools enrolled in daily air-quality alerts with action advice for children.",
      "Clean Air Route Finder maps lower-exposure walking and cycling routes.",
      "Breathe London adds ~290 validated neighbourhood sensor nodes on top of the statutory LAQN — open data.",
    ],
  },
  bangkok: {
    subline:
      "Bangkok Metropolitan Region — 10.5 million people, where traffic, industrial combustion and seasonal burning drive the mix, and a growing multi-lever programme is starting to bite.",
    quote:
      "“On the bad days the smart signs on the road show the number. Now I check it before the children walk to school.”",
    keyStat: {
      value: "~68",
      label:
        "reference-grade monitoring stations across the city, feeding a public real-time dashboard.",
      source: "PCD/BMA monitoring network (city-initiatives-research-2)",
    },
    challengeIntro:
      "Bangkok built the picture before it acted: a 2024 multi-sector emissions inventory apportioned PM2.5 across the city and surrounding provinces, and a dense reference network puts the readings in public view. Naming the sources is the turn from seeing to acting.",
    challengeStats: [
      {
        value: "~68",
        label: "reference-grade stations measuring PM2.5, PM10, NO2, O3 and CO",
        source: "PCD/BMA monitoring network",
      },
      {
        value: "−19%",
        label: "PM2.5 from industrial furnaces and boilers (2024 emissions inventory)",
        source: "2024 Air Pollution Emissions Inventory",
      },
      {
        value: "−15.6%",
        label: "PM2.5 inside the truck low-emission-zone pilot vs surrounding areas",
        source: "LEZ pilot (404 trucks/day restricted)",
      },
      {
        value: null,
        label: "city-wide PM2.5 trend / WHO-guideline multiple",
        source: "no published city-wide BC trend figure for Bangkok",
      },
    ],
    doingIntro:
      "Bangkok pairs evidence with enforcement and clean alternatives: an emissions inventory to target sources, a low-emission zone and Euro 5 standards to restrict the dirtiest vehicles, an electric bus fleet residents can ride, and a public dashboard so families can see the air for themselves.",
    doingBullets: [
      "2024 Air Pollution Emissions Inventory — multi-sector apportionment; industrial-furnace PM2.5 down 19%.",
      "Truck Low Emission Zone pilot — 404 trucks/day restricted; PM2.5 down 15.6% in-zone; expansion to 50 districts planned.",
      "Euro 5 vehicle and fuel standards (2024) and a PM2.5 Control Zone declaration (2025) handing authorities tighter enforcement powers.",
      "Bangkok E-Bus Programme — 2,350+ electric buses across 124 routes.",
      "~68 PCD/BMA reference stations on the airbkk public dashboard, with PM2.5 fed onto smart traffic signs city-wide.",
    ],
  },
};

const VALID_SLUGS: CityKey[] = ["warsaw", "london", "bangkok"];

/** Pre-generate the three BC-family city pages this prototype covers. */
export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.key === slug);
  return {
    title: city
      ? `${city.name} — Breathe Cities (concept mock)`
      : "City — Breathe Cities (concept mock)",
  };
}

/** A hard-data callout — a real figure, or an honest [TK] chip for a gap. */
function ChallengeFigure({ stat }: { stat: ChallengeStat }) {
  return (
    <div className="rounded-xl border border-border bg-bc-white p-5">
      {stat.value !== null ? (
        <span className="text-4xl font-bold tracking-tight text-bc-dark-blue">
          {stat.value}
        </span>
      ) : (
        <span className="inline-flex rounded bg-amber-200 px-1.5 py-0.5 font-mono text-sm font-semibold text-amber-800">
          [figure TK]
        </span>
      )}
      <p className="mt-2 text-sm leading-snug text-foreground">{stat.label}</p>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground/80">
        Source: {stat.source}
      </p>
    </div>
  );
}

export default async function CityPageMock({ params }: CityPageProps) {
  const { slug } = await params;
  const cityKey = VALID_SLUGS.find((s) => s === slug);
  if (!cityKey) notFound();

  const city = CITIES.find((c) => c.key === cityKey)!;
  const content = CITY_PAGE[cityKey];

  return (
    <main className="min-h-screen bg-background">
      <BcHeader />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/ux-concepts/cities" className="hover:text-bc-blue">
                Cities
              </Link>
              <span>/</span>
              <span className="text-foreground">{city.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-bc-dark-blue sm:text-5xl">
                {city.name}
              </h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {city.country} · {city.populationLabel} people
            </p>
            <p className="max-w-xl text-lg text-muted-foreground">
              {content.subline}
            </p>
            {/* Illustrative quote — framed honestly, not attributed to a real person */}
            <blockquote
              className="max-w-xl border-l-4 pl-4 text-base italic text-bc-dark-blue"
              style={{ borderColor: "var(--bc-color-teal)" }}
            >
              {content.quote}
              <span className="mt-1 block text-xs not-italic text-muted-foreground">
                Illustrative of the concern, not a real quotation.
              </span>
            </blockquote>
          </div>

          {/* Hero image placeholder + key-stat callout. Never BC's real photo. */}
          <div className="space-y-4">
            <div
              className="flex aspect-[4/3] items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--bc-color-blue), var(--bc-color-teal))",
              }}
            >
              <span className="px-6 text-center text-sm font-medium text-bc-white/90">
                {city.name} — hero image placeholder
                <span className="mt-1 block text-xs text-bc-white/70">
                  (we don&rsquo;t use BC&rsquo;s real photography in the prototype)
                </span>
              </span>
            </div>
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: "var(--bc-color-light-teal)" }}
            >
              <span className="text-5xl font-bold tracking-tight text-bc-dark-blue">
                {content.keyStat.value}
              </span>
              <p className="mt-2 text-sm font-medium text-bc-dark-blue">
                {content.keyStat.label}
              </p>
              <p className="mt-2 text-[11px] text-bc-dark-blue/70">
                Source: {content.keyStat.source}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── (1) Air Pollution Challenge ──────────────────────────────────── */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
              The air pollution challenge
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What {city.name} is up against
            </h2>
            <p className="text-base text-muted-foreground">
              {content.challengeIntro}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.challengeStats.map((stat) => (
              <ChallengeFigure key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── (2) OUR CONCERN COMPONENT, FLATTENED — the core deliverable ───── */}
      <section className="border-y border-border bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <CityConcernStack cityKey={cityKey} />
        </div>
      </section>

      {/* ── (3) What We're Doing ─────────────────────────────────────────── */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-bc-blue">
              What we&rsquo;re doing
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              The response in {city.name}
            </h2>
            <p className="text-base text-muted-foreground">{content.doingIntro}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {content.doingBullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 rounded-xl border border-border bg-bc-white p-4"
              >
                <ArrowRight
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-bc-teal"
                />
                <span className="text-sm leading-snug text-foreground">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BcFooter />
    </main>
  );
}
