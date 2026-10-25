/**
 * city-ui.tsx — small shared pieces of the city page: the band chip, the band scale bar, the city's
 * advice (one band, or every band), the sensor-type icon and the sparkline.
 *
 * Purpose
 *   The sensor card, the nearest-three card, the sensor detail, the pollutant pop-up and the city
 *   section all show the same few things. Defining them once keeps the rules in one place:
 *     - Colour only where it is the city's own index colour (rule 2): BandChip, BandScale, the
 *       advice swatches and a coloured SensorTypeIcon take their colour from the index level. Stale
 *       is grey (spec 5.5).
 *     - The index is named once wherever advice appears, as one link, "IBOCA index", then each
 *       band as swatch and label (feedback item 8, decisions E2 and G4). No "IBOCA ·" per band.
 *     - No breakpoint numbers (rule 5): nothing here takes a value, only a level. BandScale puts its
 *       marker in the MIDDLE of the current band's segment, never at an exact position (C1).
 *   Iteration 2 removed the "Sample figure" and "Draft content" tags (decision K2) and the
 *   expandable chip (the helper lines and the inline advice are gone, decisions C and E6).
 *
 * TOKEN EXCEPTION (named)
 *   DARK_TEXT and LIGHT_TEXT are the two literal text colours used ON a city's index colour, chosen
 *   by contrast. A city's colour is data (it arrives as hex), so the text on it has to be chosen in
 *   code; both are neutral and carry no meaning. Copied from the Atlas sensor card.
 *
 * Key exports: readableTextOn, BandChip, BandScale, IndexLink, CurrentAdvice, AdviceLadder,
 *   SensorTypeIcon, Sparkline
 * External dependencies: ../chapter/ChapterLink (OutboundLink), ../../_data/indexes,
 *   ../../_data/bogota (CityPage), ../../_data/city-sensors (SensorType).
 */

import { OutboundLink } from '../chapter/ChapterLink'
import { indexLevel, levelDisplayName } from '../../_data/indexes'
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
  /** True for a stale reading: grey, never the band colour (spec 5.5). */
  stale: boolean
}

/** A level chip: "Moderado" (or "PM2.5 · Moderado") in the city's own colour for that level. */
export function BandChip({ index, band, pollutant, stale }: BandChipProps) {
  const level = indexLevel(index, band)
  const text = pollutant === null ? level.nameOriginal : `${pollutant} · ${level.nameOriginal}`
  const colourStyle = stale
    ? { backgroundColor: 'var(--bc-semantic-border)', color: 'var(--bc-semantic-text)' }
    : { backgroundColor: level.hex, color: readableTextOn(level.hex) }
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-tight" style={colourStyle}>
      {text}
    </span>
  )
}

/** Props for BandScale. */
type BandScaleProps = {
  index: CityAirQualityIndex
  /** The current band, or null for a sensor with no current band (stale or dead): no marker. */
  band: number | null
}

/**
 * The sensor card's scale (decision C1): one EQUAL-WIDTH segment per band of the city's index, in
 * the city's colours, best to worst, with a marker in the MIDDLE of the current band's segment.
 * Never an exact position: the segments are equal, so nothing about the reading's value is implied.
 * With no current band, the bar is grey and carries no marker. Decorative to assistive tech: the
 * label beside it names the level in words.
 */
export function BandScale({ index, band }: BandScaleProps) {
  const count = index.levels.length
  const markerLeft = band === null ? null : `${((band - 0.5) / count) * 100}%`
  return (
    <div aria-hidden="true" className="relative pt-3" data-band-scale={band === null ? 'none' : String(band)}>
      {markerLeft !== null && (
        // A small downward caret above the bar, centred on the band's segment.
        <span
          className="absolute top-0 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[9px] border-x-transparent"
          style={{ left: markerLeft, borderTopColor: 'var(--foreground)' }}
        />
      )}
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {index.levels.map((level) => (
          <span key={level.order} className="flex-1" style={{ backgroundColor: band === null ? 'var(--bc-semantic-border)' : level.hex }} />
        ))}
      </div>
    </div>
  )
}

/** Props for IndexLink. */
type IndexLinkProps = {
  city: CityPage
}

/** The index named once, as a link: "IBOCA index" with the outbound arrow (feedback item 8). */
export function IndexLink({ city }: IndexLinkProps) {
  return (
    <OutboundLink href={city.adviceLink.url} className="-my-3 text-sm font-semibold text-foreground underline">
      {city.adviceLink.label}
    </OutboundLink>
  )
}

/** Props for one band's advice. */
type BandAdviceProps = {
  city: CityPage
  band: number
}

/** One band: its swatch and label, then the city's own items for it (type R), never reworded. */
function BandAdvice({ city, band }: BandAdviceProps) {
  const level = indexLevel(city.index, band)
  const items = city.advice[band] ?? []
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span aria-hidden="true" className="inline-block h-3 w-5 shrink-0 rounded-[3px]" style={{ backgroundColor: level.hex }} />
        {levelDisplayName(level)}
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-snug text-foreground/90">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/** Props for CurrentAdvice. */
type CurrentAdviceProps = {
  city: CityPage
  /** The sensor's current band. The caller shows no advice when there is none (decision E2). */
  band: number
}

/**
 * The sensor detail's opening block (decision E2): "What Bogotá advises" for the CURRENT band only,
 * the index link once, then that band's swatch, label and items.
 */
export function CurrentAdvice({ city, band }: CurrentAdviceProps) {
  return (
    <section aria-label={`What ${city.name} advises`} className="rounded-xl bg-muted p-4" data-current-advice={band}>
      <h3 className="text-base font-semibold text-foreground">What {city.name} advises</h3>
      <IndexLink city={city} />
      <div className="mt-1">
        <BandAdvice city={city} band={band} />
      </div>
    </section>
  )
}

/** Props for AdviceLadder. */
type AdviceLadderProps = {
  city: CityPage
}

/** Every band's advice, best to worst, under one index link (the pollutant pop-up, decision G4). */
export function AdviceLadder({ city }: AdviceLadderProps) {
  return (
    <div>
      <IndexLink city={city} />
      <ol className="mt-1 space-y-4">
        {city.index.levels.map((level) => (
          <li key={level.order}>
            <BandAdvice city={city} band={level.order} />
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Props for SensorTypeIcon. */
type SensorTypeIconProps = {
  type: SensorType
  /** Fill colour: the sensor's band colour (nearest-three rows), or null for the neutral icon. */
  fill: string | null
}

/** The sensor-type icon: circle for low-cost, square for a reference monitor (the map's shapes). */
export function SensorTypeIcon({ type, fill }: SensorTypeIconProps) {
  const shape = type === 'reference-grade' ? 'rounded-[2px]' : 'rounded-full'
  if (fill === null) {
    return <span aria-hidden="true" className={`inline-block h-3 w-3 shrink-0 border border-foreground/70 bg-foreground/25 ${shape}`} />
  }
  return (
    <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 shrink-0 border border-foreground/80 ${shape}`} style={{ backgroundColor: fill }} />
  )
}

/** Props for Sparkline. */
type SparklineProps = {
  values: number[]
  startYear: number
}

/**
 * A neutral sparkline of a sample series, with its start year as a small axis label UNDER THE LEFT
 * END of the line (decision F3). No other axis, no values, no colour: CSS/SVG only. Decorative to
 * assistive tech except for the year.
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
    <div className="flex flex-col items-start">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false" className="overflow-visible">
        <line x1={0.5} y1={height + 2} x2={0.5} y2={height - 3} stroke="currentColor" strokeWidth={1} className="text-foreground/40" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" className="text-foreground/60" />
      </svg>
      <span className="mt-1 text-[11px] leading-none tabular-nums text-foreground/60">{startYear}</span>
    </div>
  )
}
