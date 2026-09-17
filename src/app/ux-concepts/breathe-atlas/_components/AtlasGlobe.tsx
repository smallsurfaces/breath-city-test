/**
 * AtlasGlobe.tsx — the react-globe.gl globe for the Breathe Atlas cover (brief 4.2).
 *
 * Purpose
 *   Renders the grey shaded-relief globe with 16 identical HTML city markers, and hands the parent
 *   (GlobeCover) a small imperative API to turn the globe. It owns everything that touches three.js
 *   and the DOM nodes globe.gl manages; GlobeCover owns the cycle, pause and card state.
 *
 *   This module touches `window` (WebGL, canvas, DOM markers), so it must only ever be loaded
 *   client-side: GlobeCover imports it through `next/dynamic` with `ssr: false`. The globe ref is
 *   kept inside this component (dynamic() does not forward refs) and exposed via `onReady`.
 *
 * The look (grey wireframe, no decorative colour)
 *   - Colour texture: built at runtime by globe-texture.ts from two images shipped in the
 *     `three-globe` npm package (land/water mask + elevation map): near-white ocean, light grey
 *     land with baked hillshade. Grey levels are derived from BC tokens, never hardcoded.
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
 *   selected city's card (passed in as `selectedCard`) is portalled into that marker's element, so
 *   it sits beside the marker and follows it if the globe is dragged.
 *
 * Key exports: AtlasGlobe (default), AtlasGlobeApi (type), GLOBE_ALTITUDE
 * External dependencies: react, react-dom (createPortal), react-globe.gl (three.js),
 *   ./globe-texture, ../_data/cities (AtlasCity type).
 *
 * Side effects (all cleaned up on unmount):
 *   - Builds the globe texture (offscreen canvases) and creates an object URL; revoked on unmount.
 *   - Creates 16 detached marker DOM nodes and attaches click listeners to their buttons.
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
import { buildGreyReliefTexture, tokenLuminance } from './globe-texture'

/** Camera altitude (in globe radii above the surface) for the cover framing. */
export const GLOBE_ALTITUDE = 2

/** Package-shipped images copied into public/ (see globe-texture.ts for provenance). */
const WATER_MASK_URL = '/ux-concepts/breathe-atlas/earth-water.png'
const TOPOLOGY_URL = '/ux-concepts/breathe-atlas/earth-topology.png'

/** Fully transparent clear colour, so the light page shows through behind the globe. */
const TRANSPARENT_BACKGROUND = 'rgba(0,0,0,0)'

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
  /** The city whose card is open, or null. */
  selectedCityId: string | null
  /** The card element to show beside the selected marker (rendered by the parent). */
  selectedCard: ReactNode
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
 * Hit area is 44px (see return report: below the 56px project touch-target standard, chosen so
 * markers cover less of the globe's drag surface; clustered European cities overlap at any size).
 */
function createMarkerNodes(city: AtlasCity): MarkerNodes {
  const element = document.createElement('div')
  element.className = 'atlas-marker pointer-events-none h-11 w-11'

  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.cityId = city.id
  button.setAttribute('aria-label', `${city.name}, ${city.country}`)
  button.className =
    'pointer-events-auto flex h-11 w-11 cursor-pointer touch-manipulation items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foreground'

  const dot = document.createElement('span')
  dot.setAttribute('aria-hidden', 'true')
  dot.className = 'block h-2.5 w-2.5 rounded-full bg-foreground ring-2 ring-background'
  button.appendChild(dot)

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
  selectedCityId,
  selectedCard,
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

  // Side effect: build the grey relief texture from BC token greys; revoke its object URL on unmount.
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

    buildGreyReliefTexture(WATER_MASK_URL, TOPOLOGY_URL, tones)
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

  const selectedHost = selectedCityId === null ? null : markers.get(selectedCityId)?.cardHost ?? null

  // Wait for the texture attempt to finish so the globe does not flash untextured first.
  if (textureUrl === null || width === 0 || height === 0) return null

  return (
    <>
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
      {selectedHost !== null && selectedCard !== null ? createPortal(selectedCard, selectedHost) : null}
    </>
  )
}
