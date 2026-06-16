/**
 * Pure construction of GSAP DrawSVGPlugin fromTo vars. Framework-free + DOM-free
 * so it is unit-testable; the <DrawPath> wrapper feeds these to
 * gsap.fromTo(targets, vars.from, vars.to).
 *
 * Clean-room reference: annnimate "SVG Draw Path" — behavior only.
 */
export interface DrawVarsInput {
  /** Starting DrawSVG value (e.g. '0%'). */
  from?: string
  /** Ending DrawSVG value (e.g. '100%'). */
  to?: string
  duration?: number
  ease?: string
}

export function buildDrawVars(input: DrawVarsInput = {}) {
  const { from = '0%', to = '100%', duration = 1.2, ease = 'power2.inOut' } = input
  return {
    from: { drawSVG: from },
    to: { drawSVG: to, duration, ease },
  }
}
