/**
 * AtlasGlobe.tsx — the react-globe.gl globe for the Breathe Atlas cover (brief 4.2).
 *
 * Purpose
 *   Renders the shaded-relief globe (grey, with each region in its own light grey) with 16 pulsating
 *   HTML city markers, and hands the parent (GlobeCover) a small imperative API to turn the globe. It owns
 *   everything that touches three.js and the DOM nodes globe.gl manages; GlobeCover owns the cycle,
 *   pause and card state.
 *
 *   This module touches `window` (WebGL, canvas, DOM markers), so it must only ever be loaded
 *   client-side: GlobeCover imports it through `next/dynamic` with `ssr: false`. The globe ref is
 *   kept inside this component (dynamic() does not forward refs) and exposed via `onReady`.
 *
 * The look (grey wireframe; colour only where it encodes something)
 *   - Colour texture: built at runtime by globe-texture.ts from two images shipped in the
 *     `three-globe` npm package (land/water mask + elevation map): near-white ocean, light grey
 *     land with baked hillshade. Grey levels are derived from BC tokens, never hardcoded.
 *   - Region greys (round 2 item 6, made grey in round 3 R3.1): the land of each Breathe Cities
 *     region (Africa, Asia, Europe, LAC, with M49's country extent) is a slightly darker grey than
 *     the untinted land (Northern America, Oceania, Antarctica), baked into the same texture
 *     (region-raster.ts paints the regions, globe-texture.ts shades them). NO COLOUR: round 2's
 *     coloured tints broke the brief's grey-wireframe rule (colour only ever comes from a city's own
 *     index), so regions are told apart by grey level alone. Europe, Africa and Asia touch, so each
 *     has its own step; LAC reuses Africa's. See REGION_GREY_SHARE. No legend or labels. If the
 *     countries file is unavailable, the globe renders with all land in the one grey.
 *   - Bump map: the same elevation image, so relief also catches the live scene light.
 *   - Lighting: soft ambient plus a directional light parented to the camera, so the relief is lit
 *     from the upper left of the view whichever city the globe turns to.
 *   - Material: specular highlight removed so the globe reads matte, like a printed relief map.
 *   - Atmosphere: a pale grey glow (token-derived). Transparent background on the light page.
 *
 * Gestures (brief 4.2, "Phone")
 *   - OrbitControls sets `touch-action: none` on the canvas, which would trap vertical page
 *     scrolling. We override it to `pan-y`: a sideways drag reaches OrbitControls and spins the
 *     globe; a vertical swipe is handled by the browser as page scroll (the browser sends
 *     pointercancel, which OrbitControls handles). Pinch zoom is excluded by pan-y.
 *   - Zoom is disabled on the controls, so OrbitControls never calls preventDefault on wheel
 *     events and wheel scrolling over the globe scrolls the page.
 *
 * Markers and card
 *   Markers are real <button> elements (keyboard reachable, accessible name "City, Country"),
 *   created once per city and placed by globe.gl's CSS2D layer. Markers on the far side of the
 *   globe are hidden with `visibility: hidden`, which also removes them from the tab order. The
 *   open card (passed in as `card`, for `cardCityId`) is portalled into that marker's element, so
 *   it sits above the marker and follows it if the globe is dragged.
 *
 * Marker pulse (brief 4.2: "all pulsating like the markers in the Global Toolkit Network concept")
 *   The technique is COPIED, not imported, from the locked global-toolkit-network concept
 *   (_components/ProofGlobe.tsx, the `cities-pulse` layer): a soft, blurred halo sits beneath the
 *   solid dot and breathes on a sine-like curve over PULSE_PERIOD_MS, growing and brightening
 *   together. ProofGlobe animates Mapbox paint properties from a rAF loop; these markers are HTML,
 *   so the same curve is a CSS keyframe animation (ease-in-out, alternating via 0/50/100%) on the
 *   halo's `scale` and `opacity`, with no JavaScript per frame.
 *   Values copied: period 1800ms; halo diameter 20px -> 48px (ProofGlobe radius 10 -> 24);
 *   feathered edge (ProofGlobe circle-blur 0.6 -> solid to 40% of the radius, then fading out).
 *   Value tuned for this context (see the build report): ProofGlobe's opacity 0.25 -> 0.6 is for a
 *   bright blue glow on a light basemap; the same opacities in the dark neutral marker colour read
 *   as a heavy smudge on the pale relief globe, so opacity runs PULSE_OPACITY_MIN -> MAX instead.
 *   Colour: the dark neutral marker colour, because the grey wireframe reserves colour for air
 *   quality data. MARKER_PULSE_COLOUR is the one-line switch back to the Global Toolkit Network's
 *   blue glow.
 *   Reduced motion: the animation is removed and the halo stays still at a middle size.
 *
 * City name labels (round 2, item 8)
 *   Every marker carries a small label with the city's name: 11px, medium weight, in the muted text
 *   colour the concept uses for secondary text (foreground at 70%), not full brand blue, with a thin
 *   white halo so it reads on the relief and the region tints. (The `--muted-foreground` token is BC
 *   steel, which is too pale to read on the pale globe.) The label lives inside the marker element,
 *   so it is hidden on the far side of the globe with its marker. By default it sits to the right of
 *   the dot; LABEL_SIDE moves it for the dense European cluster (London above, Paris to the left,
 *   Brussels to the right), for Madrid and for Mexico City. Any collision left over (Brussels and
 *   Warsaw on a 375px phone) drops the lower-priority label, chapter cities first
 *   (labelPriorityOrder), re-checked every frame as the globe turns. While a city's card is open,
 *   that city's label is hidden (the card already names it). Decorative: aria-hidden, because the
 *   marker button is already named "City, Country".
 *   While a card is open (round 3, R3.3): every other label fades right down (LABEL_OPACITY.faded,
 *   still faintly readable), and any label that would touch the card is hidden. They come back to
 *   full strength when the card closes. Labels also give way to the cover's controls (pause,
 *   previous, next). Every show, hide and fade is a short opacity transition (200ms), not a jump.
 *   Screen edges (round 2 fix): on a phone the globe nearly fills the width, so a label on the right
 *   of a pin near the right edge ran off the screen ("Addis A", a cut "Nairobi" with Accra focused).
 *   A label that would cross either edge of the viewport (keeping a LABEL_EDGE_GUTTER_PX gutter)
 *   flips to the other side of its pin; if it fits on neither side, it is hidden
 *   (labelSideCandidates, labelBox).
 *
 * Focus city (brief 4.2)
 *   `focusCityId` marks one marker as the focus: its dot and halo scale up (an enlarged pulsating
 *   dot). GlobeCover passes the city the globe rests on, or the city whose card the visitor opened.
 *
 * Key exports: AtlasGlobe (default), AtlasGlobeApi (type)
 * External dependencies: react, react-dom (createPortal), react-globe.gl (three.js),
 *   ./globe-texture, ./region-raster, ./globe-framing (GLOBE_ALTITUDE), ../_data/cities (AtlasCity
 *   type), ../_data/m49-regions.
 *
 * Side effects (all cleaned up on unmount):
 *   - Builds the globe texture (offscreen canvases, plus the region layer, which loads world-atlas's
 *     110m countries file) and creates an object URL; revoked on unmount.
 *   - Creates 16 detached marker DOM nodes and attaches click listeners to their buttons.
 *   - Sets a `data-focus` attribute on the focus marker's button when `focusCityId` changes.
 *   - An animation-frame loop that places, fades or hides the city name labels (inline opacity and
 *     class): the open card's city, far-side cities, collisions and labels under the card or the
 *     controls are hidden; the rest fade while a card is open. It reads the card's and the controls'
 *     boxes each frame.
 *   - Mutates three.js objects owned by globe.gl once the globe is ready: controls flags, canvas
 *     touch-action style, light intensities and parenting, globe material settings.
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Globe from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'
import type { AtlasCity } from '../_data/cities'
import { ATLAS_REGIONS } from '../_data/m49-regions'
import type { AtlasRegion } from '../_data/m49-regions'
import { buildReliefTexture, TEXTURE_HEIGHT, TEXTURE_WIDTH, tokenLuminance } from './globe-texture'
import { GLOBE_ALTITUDE } from './globe-framing'
import { buildRegionTintLayer } from './region-raster'
import type { RegionTintColours } from './region-raster'

/** Package-shipped images copied into public/ (see globe-texture.ts for provenance). */
const WATER_MASK_URL = '/ux-concepts/breathe-atlas/earth-water.png'
const TOPOLOGY_URL = '/ux-concepts/breathe-atlas/earth-topology.png'

/** Fully transparent clear colour, so the light page shows through behind the globe. */
const TRANSPARENT_BACKGROUND = 'rgba(0,0,0,0)'

/**
 * Marker pulse halo colour: the dark neutral marker colour (the same as the dot).
 * One-line switch to the Global Toolkit Network's blue glow: 'var(--bc-color-blue)'.
 */
const MARKER_PULSE_COLOUR = 'var(--foreground)'

/** Pulse period, copied from ProofGlobe (PULSE_PERIOD_MS). */
const PULSE_PERIOD_MS = 1800
/** Halo size at the peak of the pulse, in px (ProofGlobe PULSE_RADIUS_MAX 24 -> 48px across). */
const PULSE_HALO_PX = 48
/** Halo scale at the low point: 20px across (ProofGlobe PULSE_RADIUS_MIN 10). */
const PULSE_SCALE_MIN = 20 / PULSE_HALO_PX
/** Halo opacity range, tuned down from ProofGlobe's 0.25 -> 0.6 for a dark halo (see file header). */
const PULSE_OPACITY_MIN = 0.12
const PULSE_OPACITY_MAX = 0.34

/**
 * The pulse CSS, rendered once in a <style> element next to the globe (the markers live in
 * globe.gl's DOM, so they pick the animation up by class name). Animates the `scale` and `opacity`
 * properties only, so it composes with the focus wrapper's scale. Under reduced motion the
 * animation is removed and the halo's static Tailwind scale/opacity classes apply.
 */
const PULSE_CSS = `@keyframes atlas-marker-pulse {
  0%, 100% { scale: ${PULSE_SCALE_MIN.toFixed(3)}; opacity: ${PULSE_OPACITY_MIN}; }
  50% { scale: 1; opacity: ${PULSE_OPACITY_MAX}; }
}
.atlas-marker-halo { animation: atlas-marker-pulse ${PULSE_PERIOD_MS}ms ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .atlas-marker-halo { animation: none; } }`

/**
 * Every grey on the land is a point on the same scale: `share` of the way from BC white to BC steel
 * (both read from the tokens at runtime, as luminance). Untinted land (Northern America, Oceania,
 * Antarctica) sits at LAND_GREY_SHARE, as it always has.
 */
const LAND_GREY_SHARE = 0.35

/**
 * Region greys (round 3, R3.1; replaces round 2's coloured tints). Each region's land is a step
 * darker than the untinted land on the white-to-steel scale above, so every region reads as
 * different from untinted land. Europe, Africa and Asia touch each other (Europe and Asia across
 * Russia and the Caucasus, Africa and Asia at Sinai), so each has its own step; LAC touches only
 * untinted land (Mexico and the United States) and reuses Africa's middle step. Europe, with the
 * densest cluster of pins and labels, gets the lightest step so they keep the most contrast; Asia,
 * the largest landmass with the fewest pins, the darkest. Shares above 1 are simply further along
 * the same line, a little darker than steel.
 * Tuned by eye in headless Chrome at 1280: steps of 0.2 (about 12 grey levels) vanished into the
 * hillshade and the scene light, which brightens the lit side of the globe; steps of 0.3 (about 19
 * levels) read as separate regions and still let the relief show. The darkest grey (Asia, about 173
 * of 255) is still far lighter than the dark blue pins, which stay the strongest thing on the globe.
 * Jack reviews live; these four numbers are the ones to tune.
 */
const REGION_GREY_SHARE: Record<AtlasRegion, number> = {
  europe: 0.7,
  africa: 1.0,
  lac: 1.0,
  asia: 1.3,
}

/** A grey level `share` of the way from `white` to `steel` (luminances, 0-255). Pure. */
function greyOnScale(white: number, steel: number, share: number): number {
  return white - (white - steel) * share
}

/** The grey for each region's land, as RGB (see REGION_GREY_SHARE). Pure. */
function regionGreys(white: number, steel: number): RegionTintColours {
  const colours = {} as RegionTintColours
  for (const region of ATLAS_REGIONS) {
    const grey = Math.round(greyOnScale(white, steel, REGION_GREY_SHARE[region]))
    colours[region] = [grey, grey, grey]
  }
  return colours
}

/** The small imperative API the cover uses to drive the globe. */
export type AtlasGlobeApi = {
  /** Turn the globe to a city. `durationMs` 0 jumps without animation. */
  turnTo: (lat: number, lng: number, durationMs: number) => void
  /** Stop any camera transition exactly where it is (used when the cycle pauses mid-turn). */
  stopTurning: () => void
}

/** Props for AtlasGlobe. */
type AtlasGlobeProps = {
  /** Canvas width in CSS pixels (the globe sizes to its container). */
  width: number
  /** Canvas height in CSS pixels. */
  height: number
  /** Cities to mark (all 16). Must be a stable array reference. */
  cities: AtlasCity[]
  /** The city whose card is open (auto-opened or tapped), or null. */
  cardCityId: string | null
  /** The card element to show beside that city's marker (rendered by the parent). */
  card: ReactNode
  /** The focus city: its marker shows as an enlarged pulsating dot. Null for none. */
  focusCityId: string | null
  /** Where the globe starts, before the first turn. */
  initialCity: AtlasCity
  /** True when the visitor prefers reduced motion: no intro scale animation. */
  reducedMotion: boolean
  /** Called once the globe is ready, with the imperative API. */
  onReady: (api: AtlasGlobeApi) => void
  /** Called when a marker is activated (click, tap, Enter or Space). */
  onMarkerSelect: (city: AtlasCity) => void
}

/* ---------------------------------------------------------------------------------------------
 * Minimal structural types for the three.js objects we adjust. The project has no @types/three,
 * so react-globe.gl's three.js return types resolve to `any`; these keep our own code typed.
 * ------------------------------------------------------------------------------------------- */

/** The OrbitControls flags this component sets. */
type OrbitControlsLike = { enableZoom: boolean; enablePan: boolean }
/** A three.js Object3D, as far as parenting and traversal go. */
type Object3DLike = {
  add: (child: Object3DLike) => void
  children: Object3DLike[]
  traverse: (fn: (obj: Object3DLike & { __globeObjType?: string; material?: unknown }) => void) => void
  position: { set: (x: number, y: number, z: number) => void }
}
/** A three.js light. */
type LightLike = Object3DLike & { intensity: number; isDirectionalLight?: boolean; isAmbientLight?: boolean }
/** The MeshPhongMaterial settings this component tunes. */
type PhongMaterialLike = {
  isMeshPhongMaterial?: boolean
  shininess: number
  bumpScale: number
  specular: { setScalar: (v: number) => void }
  needsUpdate: boolean
}

/** Per-city marker DOM: the element globe.gl positions, its button, and the card host. */
type MarkerNodes = {
  element: HTMLDivElement
  button: HTMLButtonElement
  label: HTMLSpanElement
  cardHost: HTMLDivElement
}

/** Which side of its dot a city name label sits on. */
type LabelSide = 'right' | 'left' | 'above' | 'below'

/**
 * Label placement for the cities whose label must not sit on the default right (round 2, item 8).
 * London, Paris and Brussels are within a few degrees of each other, so at globe scale their dots
 * are 10 to 12px apart: London's label goes above, Paris's to the left (below would run into Milan),
 * Brussels's stays right. Madrid goes left, over the Atlantic. Every other city: right.
 */
const LABEL_SIDE: Record<string, LabelSide> = {
  london: 'above',
  paris: 'left',
  brussels: 'right',
  madrid: 'left',
  // Seen from South America, Mexico City sits just up and left of Bogotá: its label goes left.
  'mexico-city': 'left',
}

/**
 * The order labels are placed in when they would collide (round 2, item 8: "offset labels so they
 * do not collide, or drop the lowest-priority one"). Chapter cities first, then the rest, each
 * group alphabetical. A label that would overlap one already placed is dropped for that frame.
 * The static LABEL_SIDE offsets keep this rare; on a 375px phone Brussels can still meet Warsaw.
 */
function labelPriorityOrder(cities: AtlasCity[]): AtlasCity[] {
  return [...cities].sort((a, b) => {
    if (a.hasChapter !== b.hasChapter) return a.hasChapter ? -1 : 1
    return a.name.localeCompare(b.name, 'en')
  })
}

/** A box on screen, in viewport px. */
type Box = { left: number; top: number; right: number; bottom: number }

/** True when two boxes overlap (touching edges do not count). Pure. */
function boxesOverlap(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}

/** Gap (px) from the dot's centre to the near edge of its label: see LABEL_SIDE_CLASS. */
const LABEL_GAP_PX = 14
/** Smallest gap (px) kept between a label and either side of the screen (round 2 fix). */
const LABEL_EDGE_GUTTER_PX = 16

/**
 * The sides a label may take, in order of preference: its own side (LABEL_SIDE), then the other side
 * of its pin. A label placed above or below its pin is centred on it, so its other side does not
 * move it sideways; it falls back to the right, then the left, instead. Pure.
 */
function labelSideCandidates(preferred: LabelSide): LabelSide[] {
  if (preferred === 'right') return ['right', 'left']
  if (preferred === 'left') return ['left', 'right']
  return [preferred, 'right', 'left']
}

/**
 * Where a label of `width` x `height` px lands on screen on `side` of a pin centred at (cx, cy).
 * The same geometry as LABEL_SIDE_CLASS, computed rather than measured, so every side can be tried
 * without moving the label. Pure.
 */
function labelBox(side: LabelSide, cx: number, cy: number, width: number, height: number): Box {
  if (side === 'right') return { left: cx + LABEL_GAP_PX, right: cx + LABEL_GAP_PX + width, top: cy - height / 2, bottom: cy + height / 2 }
  if (side === 'left') return { left: cx - LABEL_GAP_PX - width, right: cx - LABEL_GAP_PX, top: cy - height / 2, bottom: cy + height / 2 }
  if (side === 'above') return { left: cx - width / 2, right: cx + width / 2, top: cy - LABEL_GAP_PX - height, bottom: cy - LABEL_GAP_PX }
  return { left: cx - width / 2, right: cx + width / 2, top: cy + LABEL_GAP_PX, bottom: cy + LABEL_GAP_PX + height }
}

/**
 * The full class list of a label on `side`. Labels show and hide by opacity with a short fade
 * (round 3, R3.3: "a short fade, not a jump"). The fade is kept under reduced motion: it is a change
 * of opacity, not movement.
 */
function labelClass(side: LabelSide): string {
  return `pointer-events-none absolute whitespace-nowrap text-[11px] font-medium leading-none transition-opacity duration-200 ease-out ${LABEL_SIDE_CLASS[side]}`
}

/**
 * How strongly a label shows (round 3, R3.3): full; faded right down while a city card is open
 * (still faintly readable); or hidden (the card's own city, a label under the card, a far-side pin,
 * an edge or collision drop).
 */
type LabelLevel = 'full' | 'faded' | 'hidden'

/** Opacity per LabelLevel. 'faded' is "right down, still faintly readable" (R3.3), judged live. */
const LABEL_OPACITY: Record<LabelLevel, string> = { full: '1', faded: '0.3', hidden: '0' }

/**
 * Clear space (px) kept around the open card and the cover's own controls: a label whose box comes
 * within this of either is hidden rather than drawn touching it.
 */
const LABEL_OBSTACLE_CLEARANCE_PX = 4

/** A DOMRect as a Box, grown by `pad` px on every side. Pure. */
function paddedBox(rect: DOMRect, pad: number): Box {
  return { left: rect.left - pad, top: rect.top - pad, right: rect.right + pad, bottom: rect.bottom + pad }
}

/**
 * Label position classes per side. The marker element is 44px square with the dot at its centre, so
 * 36px from an edge puts the label 14px (LABEL_GAP_PX) from the dot's centre: clear of the focus
 * city's enlarged dot. labelBox mirrors this geometry; change both together.
 */
const LABEL_SIDE_CLASS: Record<LabelSide, string> = {
  right: 'left-[36px] top-1/2 -translate-y-1/2',
  left: 'right-[36px] top-1/2 -translate-y-1/2',
  above: 'bottom-[36px] left-1/2 -translate-x-1/2',
  below: 'top-[36px] left-1/2 -translate-x-1/2',
}

/** Label text colour: the concept's muted text (foreground at 70%), not full brand blue. */
const LABEL_COLOUR = 'color-mix(in srgb, var(--foreground) 70%, transparent)'
/** A thin halo in the page background colour, so the label reads over relief and tints. */
const LABEL_HALO = '0 0 2px var(--background), 0 0 3px var(--background), 0 0 4px var(--background)'

/**
 * Builds one marker's DOM. The wrapper is the element globe.gl's CSS2D layer centres on the city;
 * it is the size of the hit area and ignores pointer events itself, so only the button and the
 * card are interactive and the globe stays draggable around the marker.
 *
 * Hit area is 44px. This is a DOCUMENTED EXCEPTION to frontend-standards R8's 56px minimum,
 * upheld by design-director on 2026-09-18 after the bug report raised it (BUG 6): a bigger marker
 * covers more of the very surface the reader drags to turn the globe, and the European cities are
 * already stacked on top of each other at phone scale, where 56px areas would overlap far enough
 * that tapping one city would reliably open another. 44px clears WCAG 2.2 AA (2.5.8, 24px) and is
 * the floor. The carousel's card arrows, which had the same 44px and no such constraint, were
 * raised to a 56px hit area in the same pass (see CityBrowser).
 *
 * Inside the button, back to front: the pulse halo (in a focus wrapper that scales it up for the
 * focus city) and the solid dot (also scaled up for the focus city). The halo overflows the 44px
 * button at its peak, which is fine: it ignores pointer events.
 */
function createMarkerNodes(city: AtlasCity): MarkerNodes {
  const element = document.createElement('div')
  element.className = 'atlas-marker pointer-events-none h-11 w-11'

  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.cityId = city.id
  button.setAttribute('aria-label', `${city.name}, ${city.country}`)
  button.className =
    'group relative pointer-events-auto flex h-11 w-11 cursor-pointer touch-manipulation items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foreground'

  // Focus wrapper: scales the halo up for the focus city.
  const haloWrap = document.createElement('span')
  haloWrap.setAttribute('aria-hidden', 'true')
  haloWrap.className =
    'pointer-events-none absolute inset-0 m-auto h-12 w-12 transition-[scale] duration-500 ease-out group-data-[focus=true]:scale-[1.25] motion-reduce:transition-none'

  // Pulse halo: feathered disc in the marker colour, breathing via the .atlas-marker-halo animation
  // (PULSE_CSS). Under reduced motion the animation is removed and the static scale/opacity apply.
  const halo = document.createElement('span')
  halo.className = 'atlas-marker-halo block h-full w-full rounded-full scale-[0.7] opacity-25'
  halo.style.background = `radial-gradient(circle closest-side, ${MARKER_PULSE_COLOUR} 40%, transparent 100%)`
  haloWrap.appendChild(halo)

  const dot = document.createElement('span')
  dot.setAttribute('aria-hidden', 'true')
  dot.className =
    'relative block h-2.5 w-2.5 rounded-full bg-foreground ring-2 ring-background transition-[scale] duration-500 ease-out group-data-[focus=true]:scale-[1.8] motion-reduce:transition-none'
  button.append(haloWrap, dot)

  const cardHost = document.createElement('div')
  cardHost.className = 'pointer-events-auto'

  // City name label (round 2, item 8): decorative, the button already carries the name.
  const label = document.createElement('span')
  label.setAttribute('aria-hidden', 'true')
  label.textContent = city.name
  label.className = labelClass(LABEL_SIDE[city.id] ?? 'right')
  label.style.color = LABEL_COLOUR
  label.style.textShadow = LABEL_HALO

  element.append(button, label, cardHost)
  return { element, button, label, cardHost }
}

/**
 * The globe. Sizes to width/height, builds its texture on mount, wires markers and controls once
 * globe.gl reports ready.
 */
export default function AtlasGlobe({
  width,
  height,
  cities,
  cardCityId,
  card,
  focusCityId,
  initialCity,
  reducedMotion,
  onReady,
  onMarkerSelect,
}: AtlasGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [textureUrl, setTextureUrl] = useState<string | null>(null)
  const [atmosphereColor, setAtmosphereColor] = useState<string | null>(null)

  // Latest callbacks in refs, so the marker listeners (attached once) never go stale.
  const onMarkerSelectRef = useRef(onMarkerSelect)
  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onMarkerSelectRef.current = onMarkerSelect
    onReadyRef.current = onReady
  }, [onMarkerSelect, onReady])

  // One set of marker nodes per city, created once. Detached until globe.gl places them.
  const markers = useMemo(() => {
    const map = new Map<string, MarkerNodes>()
    for (const city of cities) map.set(city.id, createMarkerNodes(city))
    return map
  }, [cities])

  // Side effect: attach (and remove) click listeners on the marker buttons.
  useEffect(() => {
    const cleanups: Array<() => void> = []
    for (const city of cities) {
      const nodes = markers.get(city.id)
      if (nodes === undefined) continue
      const handler = (event: MouseEvent) => {
        event.stopPropagation()
        onMarkerSelectRef.current(city)
      }
      nodes.button.addEventListener('click', handler)
      cleanups.push(() => nodes.button.removeEventListener('click', handler))
    }
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [cities, markers])

  // The open card's city, in a ref so the label loop below reads the latest without restarting.
  const cardCityIdRef = useRef(cardCityId)
  useEffect(() => {
    cardCityIdRef.current = cardCityId
  }, [cardCityId])

  /**
   * Side effect: decide, every animation frame, where each city name label goes and how strongly it
   * shows (round 2, item 8, the screen-edge fix, and round 3, R3.3).
   * Hidden: the open card's city (the card names it), far-side cities (their marker is hidden by
   * globe.gl), a label that fits inside the screen's gutters on neither side of its pin, a label
   * that would overlap one already placed, and a label that would touch the open card or one of the
   * cover's controls (pause, previous, next: found by their `data-atlas-control` attribute). Labels
   * are placed in labelPriorityOrder, so when two collide the lower-priority one is dropped
   * (chapter cities win).
   * Faded (R3.3): while a card is open, every label still shown drops to LABEL_OPACITY.faded, so the
   * card's city stands out; they return to full strength when the card closes. The card box is
   * measured as drawn, so while the card grows out of its dot (R3.6) the labels it reaches hide as
   * it reaches them.
   * Side: the first of labelSideCandidates whose box (labelBox, from the pin's centre and the
   * label's own size) stays LABEL_EDGE_GUTTER_PX inside both edges of the viewport.
   * Runs per frame because the markers move with every turn and drag. Per frame it reads the card's
   * and the controls' boxes; per label, the marker's box and the label's size (opacity does not
   * affect layout, so a hidden label can still be measured). It writes a label's side or opacity
   * only when they change; the label's CSS transition turns an opacity change into a short fade.
   * The loop is cancelled on unmount.
   */
  useEffect(() => {
    const ordered = labelPriorityOrder(cities)
    // What each label currently shows: its side (null while hidden) and its level.
    const applied = new Map<string, { side: LabelSide | null; level: LabelLevel }>()
    let frame = 0
    const place = () => {
      const placed: Box[] = []
      const viewportWidth = document.documentElement.clientWidth
      const cardCityId = cardCityIdRef.current
      // The open card as drawn (portalled into its marker's card host), and the cover's controls.
      const cardElement =
        cardCityId === null ? null : markers.get(cardCityId)?.cardHost.querySelector<HTMLElement>('[data-atlas-card]') ?? null
      const obstacles: Box[] = Array.from(document.querySelectorAll('[data-atlas-control]'), (control) =>
        paddedBox(control.getBoundingClientRect(), LABEL_OBSTACLE_CLEARANCE_PX),
      )
      if (cardElement !== null) obstacles.push(paddedBox(cardElement.getBoundingClientRect(), LABEL_OBSTACLE_CLEARANCE_PX))
      const shownLevel: LabelLevel = cardCityId === null ? 'full' : 'faded'

      for (const city of ordered) {
        const nodes = markers.get(city.id)
        if (nodes === undefined) continue
        let side: LabelSide | null = null
        const eligible =
          city.id !== cardCityId && nodes.element.isConnected && nodes.element.style.visibility !== 'hidden'
        if (eligible) {
          const pin = nodes.element.getBoundingClientRect()
          const cx = pin.left + pin.width / 2
          const cy = pin.top + pin.height / 2
          const width = nodes.label.offsetWidth
          const height = nodes.label.offsetHeight
          for (const candidate of labelSideCandidates(LABEL_SIDE[city.id] ?? 'right')) {
            const box = labelBox(candidate, cx, cy, width, height)
            if (box.left < LABEL_EDGE_GUTTER_PX || box.right > viewportWidth - LABEL_EDGE_GUTTER_PX) continue
            // First side that fits the screen. If it hits a label already placed, the card or a
            // control, this one drops.
            if (!placed.some((other) => boxesOverlap(other, box)) && !obstacles.some((other) => boxesOverlap(other, box))) {
              side = candidate
              placed.push(box)
            }
            break
          }
        }
        const level: LabelLevel = side === null ? 'hidden' : shownLevel
        // Write only on a change: a new side (class) and/or a new level (opacity, faded by CSS).
        const previous = applied.get(city.id)
        if (previous !== undefined && previous.side === side && previous.level === level) continue
        if (side !== null && side !== previous?.side) nodes.label.className = labelClass(side)
        nodes.label.style.opacity = LABEL_OPACITY[level]
        applied.set(city.id, { side, level })
      }
      frame = window.requestAnimationFrame(place)
    }
    place()
    return () => window.cancelAnimationFrame(frame)
  }, [cities, markers])

  // Side effect: mark the focus city's marker button (data-focus drives the enlarged dot and halo).
  useEffect(() => {
    markers.forEach((nodes, cityId) => {
      if (cityId === focusCityId) nodes.button.dataset.focus = 'true'
      else delete nodes.button.dataset.focus
    })
  }, [markers, focusCityId])

  // Side effect: build the relief texture (BC token greys, region greys baked in); revoke its object
  // URL on unmount.
  useEffect(() => {
    let cancelled = false
    let createdUrl: string | null = null

    const white = tokenLuminance('--bc-color-white')
    const lightGrey = tokenLuminance('--bc-color-light-grey')
    const steel = tokenLuminance('--bc-color-steel')
    if (white === null || lightGrey === null || steel === null) {
      // Tokens unavailable: render the globe untextured rather than not at all.
      setTextureUrl('')
      return
    }

    // Ocean: halfway between white and BC light grey. Land: LAND_GREY_SHARE of the way from white
    // to steel. Relief range: 40% of the white-to-steel distance, so shaded slopes stay soft and pale.
    const tones = {
      ocean: (white + lightGrey) / 2,
      land: greyOnScale(white, steel, LAND_GREY_SHARE),
      reliefRange: (white - steel) * 0.4,
    }
    // Atmosphere: BC steel as a neutral grey (luma only, so no blue tint).
    const steelGrey = Math.round(steel)
    setAtmosphereColor(`rgb(${steelGrey}, ${steelGrey}, ${steelGrey})`)

    // Region greys are optional: if the countries file is unavailable, the globe still renders,
    // with all land in the one grey.
    const tintLayer: Promise<Uint8ClampedArray | null> = buildRegionTintLayer(
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT,
      regionGreys(white, steel),
    ).catch(() => null)

    tintLayer
      .then((tints) => buildReliefTexture(WATER_MASK_URL, TOPOLOGY_URL, tones, tints))
      .then((url) => {
        if (url === null) return
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        createdUrl = url
        setTextureUrl(url)
      })
      .catch(() => {
        // Texture failed (image missing or canvas blocked): the globe still renders untextured.
        if (!cancelled) setTextureUrl('')
      })

    return () => {
      cancelled = true
      if (createdUrl !== null) URL.revokeObjectURL(createdUrl)
    }
  }, [])

  /**
   * Once globe.gl is ready: lock zoom, free vertical page scrolling, soften the lighting, make
   * the material matte, frame the start city, then hand the parent its API.
   */
  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current
    if (globe === undefined) return

    const controls = globe.controls() as OrbitControlsLike
    controls.enableZoom = false
    controls.enablePan = false

    // Side effect: DOM style on globe.gl's canvas (see file header, "Gestures").
    const canvas = globe.renderer().domElement as HTMLCanvasElement
    canvas.style.touchAction = 'pan-y'

    // Lighting: keep ambient soft; parent the directional light to the camera (upper left of view).
    const scene = globe.scene() as Object3DLike
    const camera = globe.camera() as Object3DLike
    const lights = globe.lights() as LightLike[]
    scene.add(camera)
    for (const light of lights) {
      if (light.isAmbientLight === true) light.intensity = Math.PI * 0.95
      if (light.isDirectionalLight === true) {
        light.intensity = Math.PI * 0.75
        camera.add(light)
        // Camera-local offset (the globe centre sits about 300 units ahead on -Z): light from upper left.
        light.position.set(-180, 170, 0)
      }
    }

    // Material: matte, with visible bump relief.
    scene.traverse((obj) => {
      if (obj.__globeObjType !== 'globe') return
      for (const child of obj.children) {
        const material = (child as { material?: PhongMaterialLike }).material
        if (material?.isMeshPhongMaterial !== true) continue
        material.shininess = 2
        material.specular.setScalar(0)
        material.bumpScale = 6
        material.needsUpdate = true
      }
    })

    globe.pointOfView({ lat: initialCity.lat, lng: initialCity.lng, altitude: GLOBE_ALTITUDE }, 0)

    onReadyRef.current({
      turnTo: (lat, lng, durationMs) => {
        globeRef.current?.pointOfView({ lat, lng, altitude: GLOBE_ALTITUDE }, durationMs)
      },
      stopTurning: () => {
        const current = globeRef.current
        if (current === undefined) return
        // globe.gl cancels a running transition when a new point of view is set, and applies
        // the coordinates read before the cancel, so this freezes the camera where it is.
        current.pointOfView(current.pointOfView(), 0)
      },
    })
  }, [initialCity])

  /** Returns the prebuilt marker element for a city (globe.gl's htmlElement accessor). */
  const markerElementFor = useCallback(
    (d: object): HTMLElement => markers.get((d as AtlasCity).id)?.element ?? document.createElement('div'),
    [markers],
  )

  /** Hide far-side markers (and their card) and take them out of the tab order. */
  const setMarkerVisibility = useCallback((element: HTMLElement, isVisible: boolean) => {
    element.style.visibility = isVisible ? 'visible' : 'hidden'
  }, [])

  const cardHost = cardCityId === null ? null : markers.get(cardCityId)?.cardHost ?? null

  // Wait for the texture attempt to finish so the globe does not flash untextured first.
  if (textureUrl === null || width === 0 || height === 0) return null

  return (
    <>
      <style>{PULSE_CSS}</style>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        animateIn={!reducedMotion}
        backgroundColor={TRANSPARENT_BACKGROUND}
        globeImageUrl={textureUrl.length > 0 ? textureUrl : null}
        bumpImageUrl={TOPOLOGY_URL}
        showAtmosphere={atmosphereColor !== null}
        atmosphereColor={atmosphereColor ?? undefined}
        atmosphereAltitude={0.16}
        enablePointerInteraction={false}
        onGlobeReady={handleGlobeReady}
        htmlElementsData={cities}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.005}
        htmlElement={markerElementFor}
        htmlElementVisibilityModifier={setMarkerVisibility}
        htmlTransitionDuration={0}
      />
      {cardHost !== null && card !== null ? createPortal(card, cardHost) : null}
    </>
  )
}
