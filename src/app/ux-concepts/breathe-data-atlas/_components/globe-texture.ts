/**
 * globe-texture.ts — builds the shaded-relief globe texture in the browser, with the region greys
 * baked in.
 *
 * Purpose
 *   The brief (4.2) asks for a grey shaded-relief globe in the spirit of Natural Earth's "Gray
 *   Earth with Shaded Relief" raster. This build makes no downloads beyond npm packages, so instead
 *   of that raster the look is generated at runtime from two images that ship inside the
 *   `three-globe` npm package (copied to public/ux-concepts/breathe-atlas/):
 *     - earth-water.png:    a land/water mask (water white, land black),
 *     - earth-topology.png: a greyscale elevation map (also used as the globe's bump map).
 *   The mask gives near-white oceans and light grey land; a hillshade computed from the elevation
 *   map bakes soft, lit-from-the-upper-left relief into the land. The bump map then adds live
 *   relief under the scene lighting on top of that.
 *
 * Region greys (round 2 item 6; grey, not colour, since round 3 R3.1)
 *   Optionally, a region layer (region-raster.ts) is baked into the LAND pixels: each pixel in a
 *   region takes that region's grey level and then gets the same hillshade delta the untinted land
 *   would have had, so the relief reads through unchanged. Ocean pixels are never tinted. Region
 *   edges blend by coverage, so borders between regions are soft rather than stepped. Baked into
 *   the texture rather than drawn as a polygon layer: no extra geometry, and the relief and the
 *   bump map keep working exactly as before.
 *
 * Colour source
 *   No hardcoded colour values. The caller passes grey levels (land, ocean and one per region) that
 *   it derives from BC tokens at runtime (see `tokenLuminance` below, and AtlasGlobe.tsx), because
 *   WebGL and canvas pixels cannot read CSS variables directly. The output is pure greyscale, with
 *   or without the region layer. (The layer's type still carries RGB, so it would take a colour, but
 *   the grey-wireframe rule keeps colour for city index data only.)
 *
 * Key exports: GreyReliefTones (type), buildReliefTexture, tokenLuminance, tokenRgb,
 *   TEXTURE_WIDTH, TEXTURE_HEIGHT
 * External dependencies: browser only (HTMLImageElement, canvas 2D, getComputedStyle). Never call
 *   during server rendering.
 */

/** The grey levels (0-255) the texture is painted with. All derived from BC tokens by the caller. */
export type GreyReliefTones = {
  /** Ocean grey level. */
  ocean: number
  /** Flat land grey level (before relief shading). */
  land: number
  /** How far (in grey levels) the hillshade can lighten or darken the land from `land`. */
  reliefRange: number
}

/** Output texture size. Matches the topology map (2048 x 1024) so no relief detail is lost. */
export const TEXTURE_WIDTH = 2048
export const TEXTURE_HEIGHT = 1024

/**
 * Elevation below which masked water counts as ocean. The water mask also marks inland rivers and
 * lakes; treating only near-sea-level water as ocean keeps thin river lines from cutting through
 * the grey land, which reads as noise at globe scale.
 */
const OCEAN_MAX_ELEVATION = 3

/** Vertical exaggeration applied to elevation differences before computing surface normals. */
const RELIEF_EXAGGERATION = 6

/**
 * Reads a CSS custom property from :root and returns it as 0-255 RGB. Lets canvas and WebGL colour
 * come from BC tokens instead of hardcoded values.
 *
 * Side effect: reads computed style from document.documentElement.
 * Returns null when the token is missing or is not a colour the canvas can parse.
 */
export function tokenRgb(tokenName: string): [number, number, number] | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim()
  if (raw.length === 0) return null

  // Normalise any CSS colour to rgb() by letting a 1x1 canvas parse and paint it.
  const probe = document.createElement('canvas')
  probe.width = 1
  probe.height = 1
  const ctx = probe.getContext('2d')
  if (ctx === null) return null
  ctx.fillStyle = raw
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/**
 * Reads a CSS custom property from :root and returns its perceived grey level (Rec. 709 luma,
 * 0-255). Returns null when the token is missing or unparseable (see tokenRgb).
 */
export function tokenLuminance(tokenName: string): number | null {
  const rgb = tokenRgb(tokenName)
  if (rgb === null) return null
  const [r, g, b] = rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Rounds and clamps a channel value to 0-255. */
function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

/** Loads an image from a same-origin URL and resolves once it is decoded. */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load globe image: ${url}`))
    img.src = url
  })
}

/** Draws an image stretched to the texture size and returns its RGBA pixels. */
function pixelsOf(img: HTMLImageElement): Uint8ClampedArray | null {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_WIDTH
  canvas.height = TEXTURE_HEIGHT
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (ctx === null) return null
  ctx.drawImage(img, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT)
  return ctx.getImageData(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT).data
}

/**
 * Builds the relief texture and returns it as a PNG blob URL for globe.gl's `globeImageUrl`.
 * The caller owns the URL and must revoke it (URL.revokeObjectURL) when the globe unmounts.
 *
 * How the relief is shaded: for each land pixel, a surface normal is estimated from the elevation
 * differences to its left/right and up/down neighbours (wrapping horizontally, because the map is
 * a full 360-degree equirectangular projection). The normal is lit by a light from the upper left,
 * and the difference from a flat surface's brightness moves the grey level up (sunlit slopes) or
 * down (shaded slopes) within `reliefRange`. Flat land stays exactly at `land`.
 *
 * `regionTints`, when given, is an RGBA layer of TEXTURE_WIDTH x TEXTURE_HEIGHT (region-raster.ts).
 * A land pixel under it becomes its region's grey plus the pixel's hillshade delta (grey - land),
 * blended with the untinted grey by the layer's alpha. Pass null for one grey on all land.
 *
 * Returns null if a canvas context or blob is unavailable. Rejects if an image fails to load.
 *
 * Side effects: creates offscreen canvases; creates an object URL (see above).
 */
export async function buildReliefTexture(
  waterMaskUrl: string,
  topologyUrl: string,
  tones: GreyReliefTones,
  regionTints: Uint8ClampedArray | null,
): Promise<string | null> {
  const [waterImg, topoImg] = await Promise.all([loadImage(waterMaskUrl), loadImage(topologyUrl)])
  const water = pixelsOf(waterImg)
  const topo = pixelsOf(topoImg)
  if (water === null || topo === null) return null

  const out = document.createElement('canvas')
  out.width = TEXTURE_WIDTH
  out.height = TEXTURE_HEIGHT
  const outCtx = out.getContext('2d')
  if (outCtx === null) return null
  const image = outCtx.createImageData(TEXTURE_WIDTH, TEXTURE_HEIGHT)
  const px = image.data

  // Light direction (image space: x right, y down, z out of the map), from the upper left.
  const lx = -0.5
  const ly = -0.5
  const lz = Math.SQRT1_2
  const flatShade = lz // brightness of a perfectly flat surface under this light

  const elevationAt = (x: number, y: number): number => topo[(y * TEXTURE_WIDTH + x) * 4]

  for (let y = 0; y < TEXTURE_HEIGHT; y++) {
    const yUp = y > 0 ? y - 1 : y
    const yDown = y < TEXTURE_HEIGHT - 1 ? y + 1 : y
    for (let x = 0; x < TEXTURE_WIDTH; x++) {
      const i = (y * TEXTURE_WIDTH + x) * 4
      const elevation = topo[i]
      const isOcean = water[i] > 127 && elevation <= OCEAN_MAX_ELEVATION

      let grey: number
      if (isOcean) {
        grey = tones.ocean
      } else {
        const xLeft = x > 0 ? x - 1 : TEXTURE_WIDTH - 1
        const xRight = x < TEXTURE_WIDTH - 1 ? x + 1 : 0
        const dzdx = ((elevationAt(xRight, y) - elevationAt(xLeft, y)) / 255) * RELIEF_EXAGGERATION
        const dzdy = ((elevationAt(x, yDown) - elevationAt(x, yUp)) / 255) * RELIEF_EXAGGERATION
        // Normal of the height field z = e(x, y) is (-dz/dx, -dz/dy, 1), normalised.
        const nLen = Math.sqrt(dzdx * dzdx + dzdy * dzdy + 1)
        const shade = (-dzdx * lx - dzdy * ly + lz) / nLen
        // Brightness relative to flat ground, clamped: -1 (deep shadow) .. about +0.4 (full sun).
        const relative = Math.max(-1, (shade - flatShade) / flatShade)
        grey = tones.land + relative * tones.reliefRange
      }

      const tintAlpha = isOcean || regionTints === null ? 0 : regionTints[i + 3]
      if (regionTints === null || tintAlpha === 0) {
        const value = clampByte(grey)
        px[i] = value
        px[i + 1] = value
        px[i + 2] = value
      } else {
        // Land in a region: the region's grey, shaded by the same relief delta as the untinted land,
        // blended with the untinted grey by coverage (soft region edges).
        const shadeDelta = grey - tones.land
        const mix = tintAlpha / 255
        for (let c = 0; c < 3; c++) {
          const tinted = regionTints[i + c] + shadeDelta
          px[i + c] = clampByte(grey + (tinted - grey) * mix)
        }
      }
      px[i + 3] = 255
    }
  }

  outCtx.putImageData(image, 0, 0)
  // A blob URL is much cheaper to create and hand to three.js than a multi-megabyte base64 data URL.
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'))
  return blob === null ? null : URL.createObjectURL(blob)
}
