/**
 * city-ui.tsx — small shared pieces of the city page: the band chip, the city's advice block, the
 * sensor-type icon, the "Sample figure" tag, the sparkline and the "Draft content" tag.
 *
 * Purpose
 *   The tap card, the sensor detail, the explainers and the city section all show the same few
 *   things. Defining them once keeps the rules in one place:
 *     - Colour only where it is the city's own index colour (rule 2): BandChip is the only coloured
 *       element, and its colour comes from the index level. A stale chip is grey (spec 5.5).
 *     - Every band and every piece of advice carries the index name and its link (rule 4):
 *       AdviceBlock always ends with "[Index] · Find out more".
 *     - No breakpoint numbers (rule 5): nothing here takes a value, only a level.
 *     - Mock figures keep the "Sample figure" marking (rule 8): SampleTag.
 *
 * TOKEN EXCEPTION (named)
 *   DARK_TEXT and LIGHT_TEXT are the two literal text colours used ON a city's index colour, chosen
 *   by contrast. A city's colour is data (it arrives as hex), so the text on it has to be chosen in
 *   code; both are neutral and carry no meaning. Copied from the Atlas sensor card.
 *
 * Key exports: readableTextOn, BandChip, AdviceBlock, SensorTypeIcon, SampleTag, DraftTag, Sparkline
 * External dependencies: react (types), lucide-react, ../chapter/ChapterLink (OutboundLink),
 *   ../../_data/indexes, ../../_data/bogota (CityPage), ../../_data/city-sensors.
 */

import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { OutboundLink } from '../chapter/ChapterLink'
import { indexLevel } from '../../_data/indexes'
import type { CityAirQualityIndex } from '../../_data/indexes'
import type { CityPage } from '../../_data/bogota'
import type { SensorType } from '../../_data/city-sensors'

/** Text colour on a light index colour. */
const DARK_TEXT = '#1f2328'
/** Text colour on a dark index colour. */
const LIGHT_TEXT = '#ffffff'

/** Dark or light text for a city's colour, by WCAG relative luminance. Pure. */
export function readableTextOn(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (match === null) return DARK_TEXT
  const value = match[1]
  const channels = [0, 2, 4].map((offset) => {
    const part = Number.parseInt(value.slice(offset, offset + 2), 16) / 255
    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  return luminance > 0.4 ? DARK_TEXT : LIGHT_TEXT
}

/** Props for BandChip. */
type BandChipProps = {
  index: CityAirQualityIndex
  band: number
  /** The pollutant the band is for, e.g. "PM2.5"; null for a chip that names the level alone. */
  pollutant: string | null
  /** True for a stale reading: grey, never the band colour (spec 5.5), and not expandable. */
  stale: boolean
  /** Whether the chip's advice is showing. Null makes the chip static (not a button). */
  expanded: boolean | null
  /** Toggle the advice. Ignored when `expanded` is null or the chip is stale. */
  onToggle: () => void
}

/**
 * A level chip: "PM2.5 · Moderado" in the city's own colour for that level, with the level name as
 * the city publishes it. As a button, it expands the city's advice inline (spec 5.4).
 */
export function BandChip({ index, band, pollutant, stale, expanded, onToggle }: BandChipProps) {
  const level = indexLevel(index, band)
  const text = pollutant === null ? level.nameOriginal : `${pollutant} · ${level.nameOriginal}`
  const colourStyle = stale
    ? { backgroundColor: 'var(--bc-semantic-border)', color: 'var(--bc-semantic-text)' }
    : { backgroundColor: level.hex, color: readableTextOn(level.hex) }
  const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-tight'
  if (expanded === null || stale) {
    return (
      <span className={base} style={colourStyle}>
        {text}
      </span>
    )
  }
  // The visible chip stays compact; a ::before pseudo-element grows the hit area to 56px tall.
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={`${base} relative before:absolute before:-inset-x-1 before:-inset-y-4 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground`}
      style={colourStyle}
    >
      {text}
      <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      <span className="sr-only">{expanded ? ', hide what Bogotá advises' : ', show what Bogotá advises'}</span>
    </button>
  )
}

/** Props for AdviceBlock. */
type AdviceBlockProps = {
  city: CityPage
  band: number
  /** Compact: the first one or two items only (the tap card, spec 5.4). Full: every item. */
  compact: boolean
}

/**
 * The city's own advice for one level (type R only, spec 8.5), as published, ending with the
 * index's link (rule 4). Never reworded.
 */
export function AdviceBlock({ city, band, compact }: AdviceBlockProps) {
  const items = city.advice[band] ?? []
  const shown = compact ? items.slice(0, 2) : items
  return (
    <div className="text-sm leading-snug text-foreground">
      <ul className="list-disc space-y-1 pl-4">
        {shown.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <OutboundLink href={city.adviceLink.url} className="-mb-2 text-sm font-semibold text-foreground underline">
        {city.adviceLink.label}
      </OutboundLink>
    </div>
  )
}

/** The sensor-type icon: circle for low-cost, square for a reference monitor (the map's shapes). */
export function SensorTypeIcon({ type }: { type: SensorType }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3 w-3 shrink-0 border border-foreground/70 bg-foreground/25 ${
        type === 'reference-grade' ? 'rounded-[2px]' : 'rounded-full'
      }`}
    />
  )
}

/** The "Sample figure" marking the Atlas uses on derived mock figures (rule 8). */
export function SampleTag() {
  return (
    <span className="inline-flex items-center rounded-full border border-foreground/20 px-2 py-0.5 text-[11px] font-medium leading-tight text-foreground/70">
      Sample figure
    </span>
  )
}

/** The "Draft content" marking on the explainers (spec 8: CAF has not confirmed the WHO source). */
export function DraftTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-foreground/20 px-2 py-0.5 text-[11px] font-medium leading-tight text-foreground/70">
      {children}
    </span>
  )
}

/** Props for Sparkline. */
type SparklineProps = {
  values: number[]
  startYear: number
}

/**
 * A neutral sparkline of a sample series, with its starting year printed (spec 6.2). No axis, no
 * values on the line, no colour: CSS/SVG only. Decorative to assistive tech except for its caption.
 */
export function Sparkline({ values, startYear }: SparklineProps) {
  if (values.length < 2) return null
  const width = 120
  const height = 32
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min === 0 ? 1 : max - min
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - 3 - ((value - min) / span) * (height - 6)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <div className="flex items-end gap-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false" className="overflow-visible">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" className="text-foreground/60" />
      </svg>
      <span className="text-[11px] leading-tight text-foreground/70">Since {startYear}</span>
    </div>
  )
}
