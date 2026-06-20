/**
 * Pure construction of the "Scale Down Fade" content swap — a restrained,
 * premium settle-in where the incoming phrase fades + lifts up from a slight
 * over-scale, and the outgoing phrase fades + lifts away while shrinking
 * (Apple's product-copy transitions: quiet, precise, never showy).
 *
 * Framework-free + DOM-free so it is unit-testable; the <ScaleDownFade> wrapper
 * feeds the enter/exit `from`/`to` to gsap.set()/gsap.to() on a single host
 * element (the spec target is `whole` — no split).
 *
 * Clean-room reference: pixel-point/animate-text `scale-down-fade` portable
 * contract — whole target, enter 520ms / cubic-bezier(0.22,1,0.36,1) from
 * { opacity 0, y 8px, scale 1.04 }, exit 380ms / cubic-bezier(0.64,0,0.78,0) to
 * { opacity 0, y -8px, scale 0.94 }, crossfade swap with a 20ms micro-delay
 * between exit-end and the next enter. We reproduce the looping exit→swap→enter
 * cycle (this effect is fundamentally a transition between strings) at the spec's
 * base timing, not the demo-only runtime down-scale.
 *
 * Distinct from fade-through (which also blurs on enter): scale-down-fade has no
 * blur — its signature is the gentle over-scale settling to 1, paired with a
 * shrink-away exit.
 */
export interface ScaleDownFadeVarsInput {
  /** Enter tween duration (seconds). */
  enterDuration?: number
  /** Exit tween duration (seconds). */
  exitDuration?: number
  /** Starting vertical offset for the enter, in px (drifts up to 0). */
  yFrom?: number
  /** Ending vertical offset for the exit, in px (lifts up off 0). */
  yExit?: number
  /** Starting scale for the enter — a slight over-scale settling to 1. */
  scaleFrom?: number
  /** Ending scale for the exit — shrinks below 1 as it leaves. */
  scaleExit?: number
  /** GSAP ease for the enter — defaults to the registered CustomEase id. */
  enterEase?: string
  /** GSAP ease for the exit — defaults to the registered CustomEase id. */
  exitEase?: string
}

/** CustomEase ids + SVG-path equivalents of the spec's cubic-beziers. */
export const SCALE_DOWN_FADE_ENTER_EASE_ID = 'scaleDownFadeEnter'
export const SCALE_DOWN_FADE_ENTER_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'
export const SCALE_DOWN_FADE_EXIT_EASE_ID = 'scaleDownFadeExit'
export const SCALE_DOWN_FADE_EXIT_EASE_PATH = 'M0,0 C0.64,0 0.78,0 1,1'

/**
 * Micro-delay (seconds) between the exit completing and the next enter starting,
 * after the host's textContent has been swapped (spec swap.micro_delay_ms 20).
 */
export const SCALE_DOWN_FADE_MICRO_DELAY = 0.02

/**
 * The spec target is `whole`: there is no split. The host element itself is the
 * single animated unit. This identity helper keeps the call site symmetric with
 * the split helpers used by per-character / per-word effects.
 */
export function splitWhole(host: HTMLElement): HTMLElement {
  return host
}

export function buildScaleDownFadeVars(input: ScaleDownFadeVarsInput = {}) {
  const {
    enterDuration = 0.52,
    exitDuration = 0.38,
    yFrom = 8,
    yExit = -8,
    scaleFrom = 1.04,
    scaleExit = 0.94,
    enterEase = SCALE_DOWN_FADE_ENTER_EASE_ID,
    exitEase = SCALE_DOWN_FADE_EXIT_EASE_ID,
  } = input

  return {
    // Old phrase leaves: from settled to faded, lifted and shrunk.
    exit: {
      from: { opacity: 1, y: 0, scale: 1 },
      to: {
        opacity: 0,
        y: yExit,
        scale: scaleExit,
        duration: exitDuration,
        ease: exitEase,
      },
    },
    // New phrase arrives: from faded, low and slightly over-scaled to settled.
    enter: {
      from: { opacity: 0, y: yFrom, scale: scaleFrom },
      to: {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: enterDuration,
        ease: enterEase,
      },
    },
  }
}
