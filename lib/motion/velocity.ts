/**
 * Pure mapping from ScrollTrigger scroll velocity (px/sec) to a skew angle in
 * degrees, clamped to a max. Framework-free + DOM-free so it is unit-testable;
 * the <VelocitySkew> wrapper feeds the result to gsap.quickTo(el, 'skewY').
 *
 * Clean-room reference: annnimate "Velocity Clip" — behavior only.
 */
export function velocityToSkew(velocity: number, max = 10, scale = 0.005): number {
  const raw = velocity * scale
  return Math.max(-max, Math.min(max, raw))
}
