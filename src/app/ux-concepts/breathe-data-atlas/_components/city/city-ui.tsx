/**
 * city-ui.tsx — small shared pieces of the city page: the band capsule, the index "i", the city's
 * advice (one band, or every band), the sensor-type icon and the sparkline. The band scale bar lives
 * in ./BandScale (it has state for its tooltips).
 *
 * Purpose
 *   The sensor card, the nearest-three card, the sensor detail, the pollutant pop-up and the city
 *   section all show the same few things. Defining them once keeps the rules in one place:
 *     - Colour only where it is the city's own index colour (rule 2): BandChip and BandScale take
 *       their colour from the index level. Stale is grey (spec 5.5).
 *     - Iteration 3 (round 2 decisions A1, A2): ONE capsule style for every band label (BandChip),
 *       English names only, no dot or swatch beside a label anywhere.
 *     - The index link sits behind an "i" (IndexInfo, decisions C1 and D2), not as a visible line.
 *     - No breakpoint numbers (rule 5): nothing here takes a value, only a level.
 *     - Iteration 3 (decision E4): the sparkline spans the full width of its tile.
 *
 * TOKEN EXCEPTION (named)
 *   DARK_TEXT and LIGHT_TEXT are the two literal text colours used ON a city's index colour, chosen
 *   by contrast. A city's colour is data (it arrives as hex), so the text on it has to be chosen in
 *   code; both are neutral and carry no meaning. Copied from the Atlas sensor card.
 *
 * Key exports: readableTextOn, BandChip, IndexInfo, CurrentAdvice, AdviceLadder, SensorTypeIcon,
 *   SensorMarkIcon, Sparkline
 * External dependencies: ./BandScale, ../chapter/CreditInfo, ../chapter/ChapterLink, ../../_data/indexes,
 *   ../../_data/bogota (CityPage), ../../_data/city-sensors (SensorType).
 */

import type { ReactNode } from 'react'
import { BandScale } from './BandScale'
import { CreditInfo } from '../chapter/CreditInfo'
import { OutboundLink } from '../chapter/ChapterLink'
import { indexLevel, levelDisplayName } from '../../_data/indexes'
import type { CityAirQualityIndex } from '../../_data/indexes'
import type { CityLink, CityPage } from '../../_data/city-page'
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

/**
 * The band capsule, the ONE style for every band label (iteration 3, decision A1): the level's
 * English name (A2) in a pill filled with the city's colour for that level, text chosen for contrast.
 * No dot or swatch beside it.
 */
export function BandChip({ index, band, pollutant, stale }: BandChipProps) {
  const level = indexLevel(index, band)
  const name = levelDisplayName(level)
  const text = pollutant === null ? name : `${pollutant} · ${name}`
  const colourStyle = stale
    ? { backgroundColor: 'var(--bc-semantic-border)', color: 'var(--bc-semantic-text)' }
    : { backgroundColor: level.hex, color: readableTextOn(level.hex) }
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-tight"
      style={colourStyle}
      data-band-capsule={band}
    >
      {text}
    </span>
  )
}

/** Props for IndexInfo. */
type IndexInfoProps = {
  index: CityAirQualityIndex
  /** The index's link ("IBOCA index"), or null: then the "i" is not drawn. */
  link: CityLink | null
}

/**
 * The index link behind an "i" (iteration 3, decisions C1 and D2): holds "IBOCA index" with its
 * outbound arrow. Sits inside the sensor detail or the pollutant pop-up, both dialogs.
 */
export function IndexInfo({ index, link }: IndexInfoProps) {
  if (link === null) return null
  return (
    <CreditInfo label={`About ${index.name}`} align="end" className="" inDialog={true}>
      <OutboundLink href={link.url} className="-my-3 text-sm font-semibold text-foreground underline">
        {link.label}
      </OutboundLink>
    </CreditInfo>
  )
}

/** Props for the city's items for one band. */
type BandItemsProps = {
  city: CityPage
  band: number
}

/** List style for one block of advice items. */
const ADVICE_LIST = 'mt-1 list-disc space-y-1 pl-5 text-sm leading-snug text-foreground/90'

/**
 * The city's own items for one band, never reworded (iteration 4, decision E): general items first,
 * then each named group's items under a small heading with the group's English name, in the order
 * the groups first appear in the city's file. Groups appear only in the bands the city ties them to.
 */
function BandItems({ city, band }: BandItemsProps) {
  const items = city.advice[band] ?? []
  const general = items.filter((item) => item.group === null)
  const groups: string[] = []
  items.forEach((item) => {
    if (item.group !== null && !groups.includes(item.group)) groups.push(item.group)
  })
  return (
    <div className="mt-2 space-y-3" data-band-advice={band}>
      {general.length > 0 && (
        <ul className={ADVICE_LIST}>
          {general.map((item) => (
            <li key={item.text}>{item.text}</li>
          ))}
        </ul>
      )}
      {groups.map((group) => (
        <div key={group} data-advice-group={group}>
          <h5 className="text-xs font-semibold text-foreground">{group}</h5>
          <ul className={ADVICE_LIST}>
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <li key={item.text}>{item.text}</li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** Props for CurrentAdvice. */
type CurrentAdviceProps = {
  city: CityPage
  index: CityAirQualityIndex
  /** The current band. The caller shows no advice when there is none (decision E2). */
  band: number
  /**
   * A small line naming where the band belongs when it is not the sensor's own (phase 2): "In
   * Kebayoran Baru" (Jakarta's district), "Regional model at this point" (Brussels). Null for none.
   */
  caption: string | null
}

/**
 * The sensor detail's opening block (iteration 3, decision C): no heading and no link line. The
 * same scale bar as the sensor card, its capsule above the current band (iteration 4, decision C:
 * the capsule is the marker, no separate chip), then the city's items for that band, grouped
 * (decision E). The index link sits behind an "i" at the block's top right.
 */
export function CurrentAdvice({ city, index, band, caption }: CurrentAdviceProps) {
  const level = indexLevel(index, band)
  return (
    <section
      aria-label={`${index.name}: ${levelDisplayName(level)}${caption === null ? '' : `, ${caption}`}`}
      className="relative rounded-xl bg-muted p-4"
      data-current-advice={band}
    >
      <div className="absolute right-3 top-3">
        <IndexInfo index={index} link={city.adviceLink} />
      </div>
      {caption !== null && <p className="mb-1 pr-10 text-xs font-semibold text-foreground/75" data-advice-caption="">{caption}</p>}
      <div className="pr-10">
        <BandScale index={index} band={band} />
      </div>
      <BandItems city={city} band={band} />
    </section>
  )
}

/** Props for AdviceLadder. */
type AdviceLadderProps = {
  city: CityPage
  index: CityAirQualityIndex
}

/**
 * Every band's advice, best to worst (the pollutant pop-up, decision D3): each band as its capsule,
 * then the city's items. The index link sits behind the section heading's "i" (decision D2).
 */
export function AdviceLadder({ city, index }: AdviceLadderProps) {
  return (
    <ol className="space-y-4">
      {index.levels.map((level) => (
        <li key={level.order}>
          <BandChip index={index} band={level.order} pollutant={null} stale={false} />
          <BandItems city={city} band={level.order} />
        </li>
      ))}
    </ol>
  )
}

/** Props for SensorTypeIcon. */
type SensorTypeIconProps = {
  type: SensorType
  /** Fill colour: the sensor's band colour (nearest-three rows), or null for the neutral icon. */
  fill: string | null
}

/** The sensor-type icon: circle for low-cost, square for reference grade (the map's shapes). */
export function SensorTypeIcon({ type, fill }: SensorTypeIconProps) {
  const shape = type === 'reference-grade' ? 'rounded-[2px]' : 'rounded-full'
  if (fill === null) {
    return <span aria-hidden="true" className={`inline-block h-3 w-3 shrink-0 border border-foreground/70 bg-foreground/25 ${shape}`} />
  }
  return (
    <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 shrink-0 border border-foreground/80 ${shape}`} style={{ backgroundColor: fill }} />
  )
}

/** Props for SensorMarkIcon. */
type SensorMarkIconProps = {
  type: SensorType
  /** What the map marker's fill says (../chapter/atlas-markers MarkerFill). */
  fill: 'band' | 'no-band' | 'neutral' | 'stale'
  /** The band colour, used only when `fill` is 'band'. */
  colour: string | null
}

/**
 * The sensor's map marker in small, for list rows (iteration 4, decisions B1 to B3): the band colour;
 * black with a white "–" for a fresh reading with no band; neutral for a city that rates no
 * stations; grey for stale. Shape is the sensor type, as on the map.
 */
export function SensorMarkIcon({ type, fill, colour }: SensorMarkIconProps) {
  const shape = type === 'reference-grade' ? 'rounded-[2px]' : 'rounded-full'
  const background =
    fill === 'band' && colour !== null
      ? colour
      : fill === 'no-band'
        ? '#000000'
        : fill === 'neutral'
          ? 'var(--background)'
          : 'var(--bc-semantic-border)'
  return (
    <span
      aria-hidden="true"
      data-mark-fill={fill}
      className={`relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center border border-foreground/80 ${shape}`}
      style={{ backgroundColor: background }}
    >
      {fill === 'no-band' && <span className="block h-[2px] w-[7px] rounded-full bg-white" />}
    </span>
  )
}

/** Props for Sparkline. */
type SparklineProps = {
  values: number[]
  startYear: number
  /**
   * What sits right of the line's end, bottom-aligned with it (iteration 4, decision F: the tile's
   * count), or null. The line then runs from the left edge to just before it.
   */
  end: ReactNode | null
}

/**
 * A neutral sparkline of a sample series, spanning the full width of its container (iteration 3,
 * decision E4), with its start year as a small axis label UNDER THE LEFT END of the line. No other
 * axis, no values, no colour: CSS/SVG only. The SVG stretches horizontally (preserveAspectRatio
 * "none") and its strokes keep their width (non-scaling-stroke). Decorative to assistive tech
 * except for the year.
 */
export function Sparkline({ values, startYear, end }: SparklineProps) {
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
    <div className="flex w-full flex-col items-start" data-sparkline="">
      <div className="flex w-full items-end gap-3">
      <svg
        width="100%"
        height={height}
        style={{ minWidth: 0, flex: '1 1 0%' }}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className="block w-full overflow-visible"
      >
        <line x1={0.5} y1={height + 2} x2={0.5} y2={height - 3} stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" className="text-foreground/40" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="text-foreground/60" />
      </svg>
      {end}
      </div>
      <span className="mt-1 text-[11px] leading-none tabular-nums text-foreground/60">{startYear}</span>
    </div>
  )
}
