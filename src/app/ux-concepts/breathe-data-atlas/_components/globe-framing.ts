/**
 * globe-framing.ts — the camera framing of the cover globe, and how big the sphere is in its canvas.
 *
 * Purpose
 *   Round 2 (items 3 to 5) sizes the cover by the SPHERE (the visible globe), not by the WebGL
 *   canvas around it. The canvas is always larger than the sphere: the camera sits GLOBE_ALTITUDE
 *   radii above the surface with a 50 degree field of view, so the sphere fills only
 *   SPHERE_SHARE_OF_CANVAS of the canvas and the rest is empty margin (the "wasted height" Jack saw
 *   above and below the globe). GlobeCover lays the page out around the sphere and makes the canvas
 *   1 / SPHERE_SHARE_OF_CANVAS times larger, letting its empty margin overflow.
 *
 *   Kept apart from AtlasGlobe.tsx because that module is client-only (loaded with next/dynamic,
 *   ssr: false): GlobeCover must not import values from it.
 *
 * The share, derived
 *   From the camera, the sphere's silhouette subtends asin(1 / (1 + altitude)) either side of the
 *   view axis, and the canvas spans fov / 2 either side, so on the projection plane the sphere's
 *   diameter is tan(asin(1 / (1 + altitude))) / tan(fov / 2) of the canvas: 0.758 at altitude 2 and
 *   fov 50. Checked in the browser: a 540px canvas drew a 408px sphere.
 *   CAMERA_FOV_DEG is three.js's PerspectiveCamera default, which globe.gl (three-render-objects)
 *   uses unchanged.
 *
 * Key exports: GLOBE_ALTITUDE, CAMERA_FOV_DEG, SPHERE_SHARE_OF_CANVAS
 * External dependencies: none.
 */

/** Camera altitude (in globe radii above the surface) for the cover framing. */
export const GLOBE_ALTITUDE = 2

/** Vertical field of view of globe.gl's camera, in degrees (three.js PerspectiveCamera default). */
export const CAMERA_FOV_DEG = 50

/** The sphere's diameter as a share of the (square) canvas side. About 0.758. */
export const SPHERE_SHARE_OF_CANVAS =
  Math.tan(Math.asin(1 / (1 + GLOBE_ALTITUDE))) / Math.tan(((CAMERA_FOV_DEG / 2) * Math.PI) / 180)
