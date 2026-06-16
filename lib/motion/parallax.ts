/**
 * Pure scroll-progress → yPercent mapping for the Parallax effect. Given a
 * scrub progress (0..1), returns the element's vertical translate as a percent
 * of its own height. Uses a centered mapping so the element sits at its neutral
 * position mid-viewport (progress 0.5 → 0). Negative speed moves the element
 * opposite to scroll for a classic depth feel. Framework-free + DOM-free so it
 * is unit-testable; the <Parallax> wrapper feeds the result to gsap.set() inside
 * a scrubbed ScrollTrigger onUpdate.
 *
 * Clean-room reference: annnimate "Parallax" — behavior only.
 */
export const DEFAULT_PARALLAX = {
  speed: -0.2,
}

export function parallaxYPercent(progress: number, speed: number): number {
  const p = Math.max(0, Math.min(1, progress))
  return (p - 0.5) * speed * 100
}
