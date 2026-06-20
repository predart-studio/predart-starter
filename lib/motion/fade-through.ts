/**
 * Pure construction of the "Fade Through" content swap — a Material-style
 * transition where the outgoing phrase fades + lifts out and the incoming phrase
 * fades + settles in, with a soft micro-delay between the two halves.
 *
 * Framework-free + DOM-free so it is unit-testable; the <FadeThrough> wrapper
 * feeds the enter/exit `from`/`to` to gsap.set()/gsap.to() on a single host
 * element (the spec target is `whole` — no split).
 *
 * Clean-room reference: pixel-point/animate-text `fade-through` portable
 * contract — whole target, enter 420ms / cubic-bezier(0.2,0,0,1) from
 * { opacity 0, y 6px, scale 0.99, blur 2px }, exit 260ms /
 * cubic-bezier(0.4,0,1,1) to { opacity 0, y -4px }, crossfade swap with a 60ms
 * micro-delay between exit-end and the next enter. We reproduce the looping
 * exit→swap→enter cycle (this effect is fundamentally a transition between
 * strings) at the spec's base timing, not the demo-only runtime down-scale.
 *
 * Distinct from soft-blur (a one-shot per-character ENTER reveal): fade-through
 * is a whole-element swap with both an enter AND an exit phase.
 */
export interface FadeThroughVarsInput {
  /** Enter tween duration (seconds). */
  enterDuration?: number
  /** Exit tween duration (seconds). */
  exitDuration?: number
  /** Starting vertical offset for the enter, in px (drifts up to 0). */
  yFrom?: number
  /** Ending vertical offset for the exit, in px (lifts up off 0). */
  yExit?: number
  /** Starting scale for the enter (settles to 1). */
  scaleFrom?: number
  /** Starting blur radius for the enter, in px (dissolves to 0). */
  blurFrom?: number
  /** GSAP ease for the enter — defaults to the registered CustomEase id. */
  enterEase?: string
  /** GSAP ease for the exit — defaults to the registered CustomEase id. */
  exitEase?: string
}

/** CustomEase ids + SVG-path equivalents of the spec's cubic-beziers. */
export const FADE_THROUGH_ENTER_EASE_ID = 'fadeThroughEnter'
export const FADE_THROUGH_ENTER_EASE_PATH = 'M0,0 C0.2,0 0,1 1,1'
export const FADE_THROUGH_EXIT_EASE_ID = 'fadeThroughExit'
export const FADE_THROUGH_EXIT_EASE_PATH = 'M0,0 C0.4,0 1,1 1,1'

/**
 * Micro-delay (seconds) between the exit completing and the next enter starting,
 * after the host's textContent has been swapped (spec swap.micro_delay_ms 60).
 */
export const FADE_THROUGH_MICRO_DELAY = 0.06

/**
 * The spec target is `whole`: there is no split. The host element itself is the
 * single animated unit. This identity helper keeps the call site symmetric with
 * the split helpers used by per-character / per-word effects.
 */
export function splitWhole(host: HTMLElement): HTMLElement {
  return host
}

export function buildFadeThroughVars(input: FadeThroughVarsInput = {}) {
  const {
    enterDuration = 0.42,
    exitDuration = 0.26,
    yFrom = 6,
    yExit = -4,
    scaleFrom = 0.99,
    blurFrom = 2,
    enterEase = FADE_THROUGH_ENTER_EASE_ID,
    exitEase = FADE_THROUGH_EXIT_EASE_ID,
  } = input

  return {
    // Old phrase leaves: from settled to faded + lifted.
    exit: {
      from: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
      to: {
        opacity: 0,
        y: yExit,
        scale: 1,
        filter: 'blur(0px)',
        duration: exitDuration,
        ease: exitEase,
      },
    },
    // New phrase arrives: from faded + low + slightly shrunk + blurred to settled.
    enter: {
      from: { opacity: 0, y: yFrom, scale: scaleFrom, filter: `blur(${blurFrom}px)` },
      to: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: enterDuration,
        ease: enterEase,
      },
    },
  }
}
