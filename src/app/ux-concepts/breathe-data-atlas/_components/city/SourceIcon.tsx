/**
 * SourceIcon.tsx — the concept-local source icon set (round 3 decision J): one neutral icon per
 * source kind, shown on a pollutant tile for that pollutant's largest source in the city.
 *
 * Purpose
 *   Each city's data file maps its own source categories to one SourceIconId EXPLICITLY (concept
 *   standard section 10d: an explicit field, no keyword matching), with the city's own wording as
 *   the label. This file only draws the icon. Neutral colour only (currentColor); decorative to
 *   assistive tech, because the label under it says the same in words.
 *
 *   Icons (lucide-react): road dust Wind, road traffic Car, home heating Heater, industry Factory,
 *   construction Construction, quarrying Pickaxe, shipping and ports Ship, waste burning Flame,
 *   other Layers (used where the city's largest category combines several sources).
 *
 * Key exports: SourceIcon (named)
 * External dependencies: lucide-react, ../../_data/city-page (SourceIconId).
 */

import { Car, Construction, Factory, Flame, Heater, Layers, Pickaxe, Ship, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SourceIconId } from '../../_data/city-page'

/** The icon for each source kind. */
const ICONS: Record<SourceIconId, LucideIcon> = {
  'road-dust': Wind,
  'road-traffic': Car,
  'home-heating': Heater,
  industry: Factory,
  construction: Construction,
  quarrying: Pickaxe,
  shipping: Ship,
  'waste-burning': Flame,
  other: Layers,
}

/** Props for SourceIcon. */
type SourceIconProps = {
  icon: SourceIconId
  className: string
}

/** One source icon, neutral, decorative. */
export function SourceIcon({ icon, className }: SourceIconProps) {
  const Icon = ICONS[icon]
  return <Icon aria-hidden="true" className={className} data-source-icon={icon} strokeWidth={1.75} />
}
