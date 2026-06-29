/**
 * example-tools.config.ts — concept-local data for the three illustrative example tools shown in the
 * "Tailored tools, designed with cities" section of the Global Toolkit Network concept.
 *
 * Purpose
 *   These are founder-named, honesty-framed ILLUSTRATIVE concepts — NOT tools in use. They are the
 *   reference examples Santiago presented in the Data Visualisation briefing Annex ("brain teasers …
 *   reference examples only … do not represent final products"). Each entry pairs a name + description
 *   with two state screenshots (a "good" condition and a "moderate" condition) drawn from the pitch
 *   deck concepts, embedded as static images from `public/ux-concepts/global-toolkit-network/
 *   example-tools/`.
 *
 * Honesty (this concept's backbone)
 *   These carry NO prevalence counter and NO available/coming-soon status badge — the section framing
 *   and a muted "Concept" tag (rendered by ExampleToolCard) carry the illustrative status instead.
 *   The placeholder content inside the images is illustrative mock content, covered by the section
 *   framing copy; do not present it as a real BC city.
 *
 * Copy is LOCKED (ux-writer pass 2026-06-29) — British English, founder-locked names. Verbatim from
 * the build spec; do not alter.
 *
 * Key exports: EXAMPLE_TOOLS (readonly ExampleTool[]), ExampleTool / ExampleToolImage (types).
 * External dependencies: none (plain config consumed by ExampleToolCard).
 */

/** One state screenshot for an example tool: the image plus its accessible alt and short caption. */
export type ExampleToolImage = {
  /** Public path to the screenshot under /public. */
  src: string
  /** Descriptive alt text for accessibility — describes what the screenshot shows. */
  alt: string
  /** Short condition label rendered as the caption beneath the image. */
  caption: string
}

/** One illustrative example tool: a name + description and its two state screenshots. */
export type ExampleTool = {
  /** Stable id, used as the React key. */
  id: string
  /** Founder-locked tool name, rendered as an h3. */
  name: string
  /** The locked description copy, rendered muted beneath the name. */
  description: string
  /** Always true — marks the entry as an illustrative concept, surfaced as the muted "Concept" tag. */
  concept: true
  /** The two state screenshots, shown side by side (good condition then moderate condition). */
  images: [ExampleToolImage, ExampleToolImage]
}

/**
 * The three illustrative example tools, in presentation order (AQ Patterns → Air Window →
 * City Futures). Copy is locked and verbatim; image paths point at the concept-local public folder.
 */
export const EXAMPLE_TOOLS: readonly ExampleTool[] = [
  {
    id: 'aq-patterns',
    name: 'AQ Patterns',
    description:
      'A pattern view of air quality over time. See which days, weeks, and months tend to be clean or poor, filtered by pollutant or by the groups most affected. It turns the data a city already collects into trends people can read at a glance.',
    concept: true,
    images: [
      {
        src: '/ux-concepts/global-toolkit-network/example-tools/aq-patterns-good.png',
        alt: 'AQ Patterns calendar view showing a month of mostly clean air-quality days.',
        caption: 'Good month',
      },
      {
        src: '/ux-concepts/global-toolkit-network/example-tools/aq-patterns-moderate.png',
        alt: 'AQ Patterns calendar view showing a month with several moderate, sensitive-group air-quality days.',
        caption: 'Moderate month',
      },
    ],
  },
  {
    id: 'air-window',
    name: 'Air Window',
    description:
      'A neighbourhood view of air quality through the day, so residents can time outdoor activity for the cleanest hours. Built for the people who run, cycle, walk the school run, or play sport outside.',
    concept: true,
    images: [
      {
        src: '/ux-concepts/global-toolkit-network/example-tools/air-window-good.png',
        alt: 'Air Window neighbourhood view showing good air quality across the day.',
        caption: 'Good air',
      },
      {
        src: '/ux-concepts/global-toolkit-network/example-tools/air-window-moderate.png',
        alt: 'Air Window neighbourhood view showing moderate air quality across the day.',
        caption: 'Moderate air',
      },
    ],
  },
  {
    id: 'city-futures',
    name: 'City Futures',
    description:
      "An interactive city model that turns air quality into cause and effect. Change a city's transport and infrastructure choices and watch the air respond from 2026 to 2030. It doubles as a learning tool, helping students, residents, and decision-makers see how today's choices shape tomorrow's air.",
    concept: true,
    images: [
      {
        src: '/ux-concepts/global-toolkit-network/example-tools/city-futures-2026.png',
        alt: 'City Futures interactive model showing the simulated city in 2026.',
        caption: '2026',
      },
      {
        src: '/ux-concepts/global-toolkit-network/example-tools/city-futures-2030.png',
        alt: 'City Futures interactive model showing the simulated city in 2030 after infrastructure changes.',
        caption: '2030',
      },
    ],
  },
]
