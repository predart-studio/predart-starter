/**
 * Pure scroll-progress → SVG ring geometry for the ScrollProgress effect. Given
 * a scrub progress (0..1) and a ring radius, returns the circle circumference,
 * the stroke-dashoffset that draws the arc (full circumference = empty ring,
 * 0 = full ring), and the integer percentage shown in the ring's center.
 * Framework-free + DOM-free so it is unit-testable; the <ScrollProgress> wrapper
 * feeds the result to gsap.set() inside a scrubbed ScrollTrigger onUpdate.
 *
 * Observed behavior (live demo): a sticky/fixed circular ring fills clockwise
 * from the top (the circle is rotated -90°). The progress stroke has
 * stroke-dasharray = circumference and stroke-dashoffset animating linearly from
 * circumference (0%) down to 0 (100%) as scroll progresses. A center label reads
 * the integer percentage. The mapping is LINEAR with scroll.
 *
 * Clean-room reference: annnimate "Progress" — behavior only.
 */
export const DEFAULT_PROGRESS_RADIUS = 99
export const DEFAULT_PROGRESS_STROKE = 2
export const DEFAULT_PROGRESS_SIZE = 200

/** Circumference of a circle of the given radius (the dash length of the ring). */
export function ringCircumference(radius: number): number {
  return 2 * Math.PI * radius
}

/** Clamp a raw progress value into the inclusive [0, 1] range. */
export function clampProgress(progress: number): number {
  if (Number.isNaN(progress)) return 0
  return Math.max(0, Math.min(1, progress))
}

/**
 * stroke-dashoffset for the progress arc at the given scroll progress.
 * progress 0 → full circumference (empty ring); progress 1 → 0 (full ring).
 */
export function progressDashoffset(progress: number, radius: number): number {
  const c = ringCircumference(radius)
  return c * (1 - clampProgress(progress))
}

/** Integer percentage (0..100) for the ring's center label. */
export function progressPercent(progress: number): number {
  return Math.round(clampProgress(progress) * 100)
}
