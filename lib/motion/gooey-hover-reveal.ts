/**
 * Pure mapping for a gooey image reveal driven by pointer position. Maps a
 * reveal "progress" (0 hidden → 1 fully revealed) to the radius of a soft blob
 * that the pointer paints over a crisp image, and supplies the SVG "gooey"
 * filter params (blur + alpha-contrast color matrix) that fuse overlapping
 * blobs into one liquid edge. Framework-free + DOM-free so it is unit-testable;
 * the <GooeyHoverReveal> wrapper feeds the results to GSAP + the SVG filter.
 *
 * Observed feel (live demo): a hero image rendered through a distortion layer.
 * The prompt "DRAW ACROSS THE SURFACE TO REVEAL" — moving / dragging the
 * pointer across the surface sharpens (reveals) the crisp image through a
 * gooey-distorted base, with a liquid edge that persists then settles. The
 * original is a THREE.js (r169) WebGL displacement shader; this module powers a
 * DOM/SVG approximation (clip mask + gooey feGaussianBlur/feColorMatrix).
 *
 * Clean-room reference: annnimate "GooeyHoverReveal" — behavior only.
 */

export interface GooeyRevealInput {
  /** 0 = blob collapsed (hidden), 1 = blob at full reveal radius. */
  progress: number
  /** Blob radius (px) at full reveal — the size of the painted reveal spot. */
  revealRadius?: number
}

/** Full-reveal blob radius in px (size of the painted reveal spot under the pointer). */
export const DEFAULT_GOOEY_REVEAL_RADIUS = 140
/** stdDeviation for the gooey feGaussianBlur — higher = more liquid fusion. */
export const DEFAULT_GOOEY_BLUR = 12
/**
 * Alpha-contrast slope for the feColorMatrix that re-sharpens the blurred
 * alpha into a crisp gooey edge. Classic "goo" value (~18–20).
 */
export const DEFAULT_GOOEY_CONTRAST = 18
/** Tween duration (s) for a blob growing in / fading out. */
export const DEFAULT_GOOEY_DURATION = 0.45
/** Ease for blob grow-in (snappy-then-settle). */
export const DEFAULT_GOOEY_EASE = 'power3.out'
/** Ease for the reveal/erase progress (linear pointer-paint feel). */
export const DEFAULT_GOOEY_PROGRESS_EASE = 'power2.out'

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

/**
 * Blob radius (px) for a given reveal progress. Scales linearly from 0 to the
 * configured reveal radius. Each pointer sample paints one of these blobs onto
 * the reveal mask; the gooey filter fuses overlapping blobs into a liquid trail.
 */
export function gooeyRevealRadius(input: GooeyRevealInput): number {
  const { progress, revealRadius = DEFAULT_GOOEY_REVEAL_RADIUS } = input
  return +(revealRadius * clamp01(progress)).toFixed(4)
}

/**
 * The classic "gooey" feColorMatrix values: pass RGB through, then steepen the
 * alpha channel (slope `contrast`, bias `-contrast/2`) so the blurred,
 * overlapping blob alphas snap back to a hard-but-liquid edge.
 */
export function gooeyColorMatrix(contrast: number = DEFAULT_GOOEY_CONTRAST): string {
  // 4x5 matrix: identity on R,G,B; alpha row = [0 0 0 contrast -contrast/2]
  return [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, contrast, -(contrast / 2),
  ].join(' ')
}

/**
 * Build the GSAP vars used by the wrapper to animate a single reveal blob
 * (a proxy `{ progress }` tweened from 0→1 on paint, 1→0 on erase). The
 * wrapper's onUpdate writes the radius from gooeyRevealRadius().
 */
export function buildGooeyRevealVars(input: {
  to: number
  duration?: number
  ease?: string
}) {
  const { to, duration = DEFAULT_GOOEY_DURATION, ease = DEFAULT_GOOEY_EASE } = input
  return {
    progress: clamp01(to),
    duration,
    ease,
    overwrite: 'auto' as const,
  }
}
