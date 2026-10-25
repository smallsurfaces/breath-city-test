/**
 * SourceIcon.tsx — the concept-local source icon set (round 3 decision J): one neutral icon per
 * source kind, shown on a pollutant tile for that pollutant's largest source in the city.
 *
 * Purpose
 *   Each city's data file maps its own source categories to one SourceIconId EXPLICITLY (concept
 *   standard section 10d: an explicit field, no keyword matching), with the city's own wording as
 *   the label. This file only draws the icon. Neutral colour only (currentColor); decorative to
 *   assistive tech, because whatever holds it carries the label (on the pollutant tile: the icon's
 *   button name and tooltip; in the pop-up: the visible text beside it).
 *
 *   Icons (lucide-react, plus one concept-local glyph): road dust RoadIcon (concept-local: a road
 *   receding in perspective with a dashed centre line, round 3, Jack; lucide has no road glyph, and
 *   it must read apart from road traffic's Car), road traffic Car, home heating Heater, industry Factory,
 *   construction Construction, quarrying Pickaxe, shipping and ports Ship, waste burning Flame,
 *   other Layers (used where the city's largest category combines several sources).
 *
 * Key exports: SourceIcon (named)
 * External dependencies: lucide-react, ../../_data/city-page (SourceIconId).
 */

import { Car, Construction, Factory, Flame, Heater, Layers, Pickaxe, Ship } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import type { SourceIconId } from '../../_data/city-page'

/** What every icon in the set accepts (a subset of lucide's props). */
type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number | string; 'data-source-icon'?: string }

/**
 * Road dust (concept-local, in lucide's line style: 24px box, currentColor, round caps): a road
 * receding in perspective, its two edges converging, with a dashed centre line.
 */
function RoadIcon({ strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21 9.5 3" />
      <path d="M21 21 14.5 3" />
      <path d="M12 21v-3.5" />
      <path d="M12 13.5v-2.5" />
      <path d="M12 7.5V6" />
    </svg>
  )
}

/** The icon for each source kind. */
const ICONS: Record<SourceIconId, ComponentType<IconProps>> = {
  'road-dust': RoadIcon,
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
