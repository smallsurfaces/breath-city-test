/**
 * AtlasGlobe.tsx — the react-globe.gl globe for the Breathe Atlas cover (brief 4.2).
 *
 * Purpose
 *   Renders the shaded-relief globe (grey, with pale region tints) with 16 pulsating HTML city
 *   markers, and hands the parent (GlobeCover) a small imperative API to turn the globe. It owns
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
 *   - Region tints (round 2, item 6): the land of each Breathe Cities region (Africa, Asia, Europe,
 *     LAC, with M49's country extent) carries a pale tint of one BC token, baked into the same
 *     texture (region-raster.ts paints the regions, globe-texture.ts shades them). Colour here
 *     encodes region, which the functional-colour rule allows. See REGION_TINTS. No legend or labels
 *     this round (Jack reviews live). If the tokens or the countries file are unavailable, the globe
 *     renders plain grey.
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
import { buildReliefTexture, TEXTURE_HEIGHT, TEXTURE_WIDTH, tokenLuminance, tokenRgb } from './globe-texture'
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
 * Region tints (round 2, item 6): one existing BC token per Breathe Cities region, and how much of
 * that token is mixed into the land grey. Heavy on the grey, so the tint stays light, the relief
 * reads through it and the dark blue pins stay the strongest thing on the globe. Four distinct hues
 * (blue, tangerine, yellow, teal), none of them the pins' dark blue. The shares differ because the
 * tokens differ in strength: yellow and teal need more to show at all against the pale grey, blue
 * and tangerine less. Tuned by eye in the browser; Jack reviews live.
 */
const REGION_TINTS: Record<AtlasRegion, { token: string; share: number }> = {
  africa: { token: '--bc-color-tangerine', share: 0.2 },
  asia: { token: '--bc-color-yellow', share: 0.24 },
  europe: { token: '--bc-color-blue', share: 0.18 },
  lac: { token: '--bc-color-teal', share: 0.24 },
}

/**
 * The tint colour for each region: its token mixed into the land grey by its share (see
 * REGION_TINTS). Returns null if any token is unavailable, and the globe then stays grey.
 *
 * Side effect: reads computed style (tokenRgb).
 */
function regionTintColours(landGrey: number): RegionTintColours | null {
  const colours: Partial<RegionTintColours> = {}
  for (const region of ATLAS_REGIONS) {
    const { token, share } = REGION_TINTS[region]
    const rgb = tokenRgb(token)
    if (rgb === null) return null
    colours[region] = [
      Math.round(landGrey + (rgb[0] - landGrey) * share),
      Math.round(landGrey + (rgb[1] - landGrey) * share),
      Math.round(landGrey + (rgb[2] - landGrey) * share),
    ]
  }
  return colours as RegionTintColours
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
type MarkerNodes = { element: HTMLDivElement; button: HTMLButtonElement; cardHost: HTMLDivElement }

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

  element.append(button, cardHost)
  return { element, button, cardHost }
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

  // Side effect: mark the focus city's marker button (data-focus drives the enlarged dot and halo).
  useEffect(() => {
    markers.forEach((nodes, cityId) => {
      if (cityId === focusCityId) nodes.button.dataset.focus = 'true'
      else delete nodes.button.dataset.focus
    })
  }, [markers, focusCityId])

  // Side effect: build the relief texture (BC token greys, region tints baked in); revoke its object
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

    // Ocean: halfway between white and BC light grey. Land: 35% of the way from white to steel.
    // Relief range: 40% of the white-to-steel distance, so shaded slopes stay soft and pale.
    const tones = {
      ocean: (white + lightGrey) / 2,
      land: white - (white - steel) * 0.35,
      reliefRange: (white - steel) * 0.4,
    }
    // Atmosphere: BC steel as a neutral grey (luma only, so no blue tint).
    const steelGrey = Math.round(steel)
    setAtmosphereColor(`rgb(${steelGrey}, ${steelGrey}, ${steelGrey})`)

    const tintColours = regionTintColours(tones.land)
    // Region tints are optional: if the tokens or the countries file are unavailable, the globe
    // still renders, in plain grey.
    const tintLayer: Promise<Uint8ClampedArray | null> =
      tintColours === null
        ? Promise.resolve(null)
        : buildRegionTintLayer(TEXTURE_WIDTH, TEXTURE_HEIGHT, tintColours).catch(() => null)

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
