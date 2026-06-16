/**
 * Pure mapping for a scroll-driven image dissolve. Maps a scroll progress
 * (0 = image intact → 1 = image fully dissolved/disintegrated) to the three
 * SVG-filter params that drive a noise-threshold dissolve:
 *   - `displacementScale` — how hard fractal noise warps the image edges,
 *   - `alphaSlope` / `alphaIntercept` — an alpha feColorMatrix that "eats away"
 *     pixels below a rising noise threshold, so the image disintegrates,
 *   - `opacity` — a slight overall fade once it is mostly gone.
 * Framework-free + DOM-free so it is unit-testable; the <ImageDissolveScroll>
 * wrapper feeds the results to GSAP (ScrollTrigger scrub) + the SVG filter.
 *
 * Observed feel (live demo): a full-bleed image that disintegrates as you scroll
 * through a pinned/scrubbed range — edges warp on rising noise, then the image
 * is progressively chewed away to nothing. The original is a THREE.js (r169)
 * WebGL dissolve shader sampling a noise field over the texture; this module
 * powers the closest honest DOM approximation (feTurbulence + feDisplacementMap
 * + alpha-threshold feColorMatrix), scrubbed against scroll.
 *
 * Clean-room reference: annnimate "ImageDissolveScroll" — behavior only.
 */

export interface DissolveInput {
  /** 0 = intact (no displacement, full alpha), 1 = fully dissolved (gone). */
  progress: number
  /** Max feDisplacementMap scale (px) at peak warp. */
  maxDisplacement?: number
  /** Alpha-threshold steepness — higher = harder, grainier dissolve edge. */
  edgeHardness?: number
}

/** Peak feDisplacementMap scale (px) — how far noise warps the image edges. */
export const DEFAULT_MAX_DISPLACEMENT = 140
/** Alpha-threshold steepness for the dissolve edge (grain hardness). */
export const DEFAULT_EDGE_HARDNESS = 16
/** feTurbulence base frequency (noise grain size) for the dissolve field. */
export const DEFAULT_DISSOLVE_BASE_FREQUENCY = 0.012
/** feTurbulence octaves — more = finer, more organic disintegration. */
export const DEFAULT_DISSOLVE_OCTAVES = 3

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

/**
 * feDisplacementMap `scale` for a given dissolve progress. Warp ramps up then
 * eases back toward the end (peaks mid-dissolve, like the WebGL original where
 * the texture roils most while it is being eaten away). Bell-shaped: 0 at the
 * ends-ish, max near progress ~0.6.
 */
export function dissolveDisplacement(input: DissolveInput): number {
  const { progress, maxDisplacement = DEFAULT_MAX_DISPLACEMENT } = input
  const p = clamp01(progress)
  // Skewed bell: sin curve peaking ~0.6, so warp builds then collapses with the image.
  const bell = Math.sin(Math.min(p / 0.6, 1) * (Math.PI / 2)) * (1 - Math.max(0, (p - 0.6) / 0.4) * 0.85)
  return +(maxDisplacement * Math.max(0, bell)).toFixed(4)
}

/**
 * Alpha feColorMatrix values for a given dissolve progress. The matrix passes
 * RGB through, then applies `alpha' = slope * alpha + intercept` so that, as the
 * noise-displaced alpha falls under a rising threshold, pixels drop to zero —
 * progressively eating the image away. At progress 0 the image is fully intact
 * (alpha untouched); at 1 every pixel is below threshold (image gone).
 */
export function dissolveAlphaMatrix(input: DissolveInput): string {
  const { progress, edgeHardness = DEFAULT_EDGE_HARDNESS } = input
  const p = clamp01(progress)
  // Rising threshold 0 → ~1.0 chews more of the image as progress grows.
  const threshold = p
  const slope = edgeHardness
  // alpha' = slope*alpha - slope*threshold ; pixels with alpha < threshold clip to 0.
  const intercept = +(-slope * threshold).toFixed(4)
  return [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, slope, intercept,
  ].join(' ')
}

/**
 * Overall image opacity for a dissolve progress. Stays at 1 for most of the
 * range (the alpha matrix does the disintegration), then fades the last
 * remnants out so the end state is fully empty.
 */
export function dissolveOpacity(input: DissolveInput): number {
  const p = clamp01(input.progress)
  if (p <= 0.85) return 1
  const o = +(1 - (p - 0.85) / 0.15).toFixed(4)
  return o === 0 ? 0 : o // normalize -0 → 0
}

/**
 * Build the full dissolve frame (all driven params) for a given progress.
 * The wrapper's ScrollTrigger onUpdate calls this and writes the values onto
 * the live SVG-filter attributes + image opacity.
 */
export function buildDissolveFrame(input: DissolveInput) {
  return {
    displacement: dissolveDisplacement(input),
    alphaMatrix: dissolveAlphaMatrix(input),
    opacity: dissolveOpacity(input),
  }
}
