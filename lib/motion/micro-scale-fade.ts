/**
 * Pure construction of the "Micro Scale Fade" reveal — a calm, tiny scale pop
 * (from 0.96 to 1) that fades in. Apple's secondary-label / system-status polish:
 * subtle premium motion for single words and short titles.
 *
 * Framework-free + DOM-free so it is unit-testable; the <MicroScaleFade> wrapper
 * feeds `from`/`to` to gsap.set()/gsap.to() on the single host element.
 *
 * Target is `whole`: there is NO split — the effect animates one element, not
 * per-character/word spans. We still export a passthrough split helper to mirror
 * the house pattern's module shape (it returns the text as a single unit).
 *
 * Clean-room reference: pixel-point/animate-text `micro-scale-fade` portable
 * contract — whole target, enter 600ms / 0ms stagger,
 * cubic-bezier(0.32, 0.72, 0, 1), from { opacity 0, scale 0.96 }.
 * This is a swap effect, so the exit phase (400ms, cubic-bezier(0.7, 0, 0.84, 0),
 * to { opacity 0, scale 0.96 }) is exported too. We implement the one-shot ENTER
 * phase in the wrapper; the catalog's looping showcase swap is demo-only and
 * intentionally not reproduced.
 */
export interface MicroScaleFadeVarsInput {
  /** Tween duration (seconds). */
  duration?: number
  /** Delay step (seconds) — `whole` has no units to stagger, but kept for the
   * shared contract and applied harmlessly to the single host element. */
  stagger?: number
  /** Starting scale (pops up to 1). */
  scaleFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

export interface MicroScaleFadeExitVarsInput {
  /** Tween duration (seconds). */
  duration?: number
  /** Ending scale (shrinks back from 1). */
  scaleTo?: number
  /** GSAP ease — defaults to the registered exit CustomEase id. */
  ease?: string
}

/** Enter CustomEase id + SVG-path equivalent of cubic-bezier(0.32, 0.72, 0, 1). */
export const MICRO_SCALE_FADE_ENTER_EASE_ID = 'microScaleFadeEnter'
export const MICRO_SCALE_FADE_ENTER_EASE_PATH = 'M0,0 C0.32,0.72 0,1 1,1'

/** Exit CustomEase id + SVG-path equivalent of cubic-bezier(0.7, 0, 0.84, 0). */
export const MICRO_SCALE_FADE_EXIT_EASE_ID = 'microScaleFadeExit'
export const MICRO_SCALE_FADE_EXIT_EASE_PATH = 'M0,0 C0.7,0 0.84,0 1,1'

/**
 * `whole` target → no split. Return the text as a single animated unit so the
 * wrapper iterates a one-element array, mirroring the per-character helpers in
 * the rest of the motion lib without splitting anything.
 */
export function splitWhole(text: string): string[] {
  return [text]
}

export function buildMicroScaleFadeVars(input: MicroScaleFadeVarsInput = {}) {
  const {
    duration = 0.6,
    stagger = 0,
    scaleFrom = 0.96,
    ease = MICRO_SCALE_FADE_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, scale: scaleFrom },
    to: { opacity: 1, scale: 1, duration, stagger, ease },
  }
}

/**
 * Exit vars for the swap phase — fades back out while shrinking to 0.96 on the
 * exit ease. Exported for completeness (swap effect); the one-shot ENTER wrapper
 * does not invoke it.
 */
export function buildMicroScaleFadeExitVars(input: MicroScaleFadeExitVarsInput = {}) {
  const {
    duration = 0.4,
    scaleTo = 0.96,
    ease = MICRO_SCALE_FADE_EXIT_EASE_ID,
  } = input

  return {
    to: { opacity: 0, scale: scaleTo, duration, ease },
  }
}
