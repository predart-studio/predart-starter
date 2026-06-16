/**
 * Pure clip-path math for a scrubbed ellipse mask reveal. Maps a scroll
 * progress (0 hidden → 1 fully revealed) to a `clip-path: ellipse(...)` string,
 * growing an ellipse anchored above the top-center of the element until it
 * fully uncovers the content. Framework-free + DOM-free so it is unit-testable;
 * the <MaskReveal> wrapper feeds the result to gsap.fromTo() / ScrollTrigger.
 *
 * Observed feel (live demo): the ellipse radius scales from ~0% (collapsed,
 * content masked away) to a generous over-cover at full reveal, anchored at
 * `50% -25%`, scrubbed linearly against scroll. Aspect of rX:rY held ~4:3.
 *
 * Clean-room reference: annnimate "MaskReveal" — behavior only.
 */
export interface MaskRevealInput {
  /** 0 = hidden (collapsed ellipse), 1 = fully revealed (over-cover). */
  progress: number
  /** Ellipse X radius (%) at full reveal. */
  revealedRadiusX?: number
  /** Ellipse Y radius (%) at full reveal. */
  revealedRadiusY?: number
  /** Ellipse center, e.g. `50% -25%` (anchored above top-center). */
  origin?: string
}

export const DEFAULT_MASK_REVEALED_RX = 200
export const DEFAULT_MASK_REVEALED_RY = 150
export const DEFAULT_MASK_ORIGIN = '50% -25%'
/** Hidden state: ellipse collapsed to a point at the origin. */
export const MASK_HIDDEN_CLIP = `ellipse(0% 0% at ${DEFAULT_MASK_ORIGIN})`

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

/**
 * Compute the `clip-path` ellipse string for a given reveal progress.
 * Radii scale linearly from 0% (hidden) to the revealed radii (revealed).
 */
export function maskClipPath(input: MaskRevealInput): string {
  const {
    progress,
    revealedRadiusX = DEFAULT_MASK_REVEALED_RX,
    revealedRadiusY = DEFAULT_MASK_REVEALED_RY,
    origin = DEFAULT_MASK_ORIGIN,
  } = input
  const p = clamp01(progress)
  const rx = +(revealedRadiusX * p).toFixed(4)
  const ry = +(revealedRadiusY * p).toFixed(4)
  return `ellipse(${rx}% ${ry}% at ${origin})`
}

/**
 * Build the gsap.fromTo() clip-path vars for the reveal (hidden → revealed).
 * The wrapper attaches a ScrollTrigger (scrub) to drive the tween.
 */
export function buildMaskRevealVars(input: Omit<MaskRevealInput, 'progress'> = {}) {
  return {
    from: { clipPath: maskClipPath({ ...input, progress: 0 }) },
    to: { clipPath: maskClipPath({ ...input, progress: 1 }), ease: 'none' as const },
  }
}
