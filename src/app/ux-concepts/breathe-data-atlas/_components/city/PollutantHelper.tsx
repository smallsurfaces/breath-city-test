/**
 * PollutantHelper.tsx — the pollutant helper line (spec 5.8, added 25 October by Jack), in three
 * switchable variants so Jack can judge the text load on a phone.
 *
 * Purpose
 *   One plain line per pollutant, BEFORE any raw number, built from two parts that are both
 *   someone else's:
 *     - where it comes from: the city's own source study where it covers the pollutant, else WHO
 *       (the city's data file, `pollutants[p].helper`), never overstating a share;
 *     - how it is right now: the city's own band label for that pollutant at that sensor.
 *   "Road dust is the largest source of PM2.5 in Bogotá. It's Bajo right now."
 *   A stale reading says "It was Bajo at the last reading" in grey: "right now" would be untrue.
 *
 * Variants (?helper= on the city page URL; parsed by helperVariantFrom)
 *   text   (default)  the full sentence; the band word is the city-coloured chip, which expands
 *                     the city's advice inline (spec 5.4)
 *   icons             a small neutral source icon with the source word as a label, beside the
 *                     band chip ("PM2.5 · Bajo")
 *   chips             the plain chip as specced before 5.8
 *
 * Source icons
 *   A small concept-local set (lucide-react glyphs), neutral colour only, mapped from the city's
 *   source categories in data (SourceIconId). Decorative: the label beside each says the source.
 *
 * Key exports: HelperVariant (type), HELPER_VARIANTS, helperVariantFrom, PollutantHelperLine
 * External dependencies: lucide-react, ./city-ui (BandChip), ../../_data/bogota, ../../_data/indexes,
 *   ../../_data/city-sensors.
 */

import { Car, Factory, Flame, Heater, Sun, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BandChip } from './city-ui'
import type { CityPage, SourceIconId } from '../../_data/bogota'
import type { SensorReading } from '../../_data/city-sensors'

/** The three helper variants (spec 5.8). */
export type HelperVariant = 'text' | 'icons' | 'chips'

/** Every variant, for validation. */
export const HELPER_VARIANTS: HelperVariant[] = ['text', 'icons', 'chips']

/** The variant from a `?helper=` value; anything else (or nothing) is the default, text. Pure. */
export function helperVariantFrom(value: string | string[] | undefined): HelperVariant {
  const raw = Array.isArray(value) ? value[0] : value
  return raw === 'icons' || raw === 'chips' ? raw : 'text'
}

/** The concept-local source icon set. */
const SOURCE_ICONS: Record<SourceIconId, LucideIcon> = {
  'road-dust': Wind,
  traffic: Car,
  industry: Factory,
  'home-heating': Heater,
  'forms-in-air': Sun,
  'burning-fuel': Flame,
}

/** Props for PollutantHelperLine. */
type PollutantHelperLineProps = {
  city: CityPage
  reading: SensorReading
  /** True for a stale reading: past tense, grey chip, not expandable. */
  stale: boolean
  variant: HelperVariant
  /** Whether the advice is showing; null makes the chip static. */
  expanded: boolean | null
  onToggle: () => void
}

/** One pollutant's helper line, in the chosen variant. */
export function PollutantHelperLine({ city, reading, stale, variant, expanded, onToggle }: PollutantHelperLineProps) {
  const helper = city.pollutants[reading.pollutant].helper

  if (variant === 'chips') {
    return (
      <BandChip index={city.index} band={reading.band} pollutant={reading.pollutant} stale={stale} expanded={expanded} onToggle={onToggle} />
    )
  }

  if (variant === 'icons') {
    const Icon = SOURCE_ICONS[helper.icon]
    return (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1.5 text-sm text-foreground/80">
          <Icon className="h-4 w-4 shrink-0 text-foreground/60" aria-hidden="true" />
          {helper.label}
        </span>
        <BandChip index={city.index} band={reading.band} pollutant={reading.pollutant} stale={stale} expanded={expanded} onToggle={onToggle} />
      </span>
    )
  }

  // text (default): the sentence, with the band word as the city-coloured chip.
  return (
    <span className="block text-sm leading-relaxed text-foreground">
      {helper.sentence}{' '}
      <span className={stale ? 'text-foreground/70' : ''}>
        {stale ? 'It was ' : 'It’s '}
        <BandChip index={city.index} band={reading.band} pollutant={null} stale={stale} expanded={expanded} onToggle={onToggle} />
        {stale ? ' at the last reading.' : ' right now.'}
      </span>
    </span>
  )
}
