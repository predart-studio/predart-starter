/**
 * Pure construction of the "Focus Blur Resolve" swap — a premium focus pull that
 * resolves a whole headline from heavy blur to crisp, holds it, then blurs it
 * back out as the next phrase takes its place (Apple's cinematic hero-title
 * transition where blur distance reads as intentional).
 *
 * Framework-free + DOM-free so it is unit-testable; the <FocusBlurResolve>
 * wrapper feeds `enter`/`exit` from/to to gsap.set()/gsap.to() on the single
 * host element. `target: whole` — there is no per-glyph/word split, so the
 * "split" helper here is the identity wrap that keeps the call site uniform
 * with the rest of the catalog.
 *
 * Clean-room reference: pixel-point/animate-text `focus-blur-resolve` portable
 * contract — whole target, enter 760ms / cubic-bezier(0.22, 1, 0.36, 1),
 * from { opacity 0, y 14px, blur 14px, scale 1.01 }; exit 520ms /
 * cubic-bezier(0.64, 0, 0.78, 0), to { opacity 0, y -10px, blur 10px }.
 * This effect is fundamentally a transition between strings, so we DO reproduce
 * both the ENTER and EXIT phases (the auto-cycling swap), unlike the enter-only
 * reveals in this lab.
 *
 * Distinct from soft-blur (per-character enter only): Focus Blur Resolve treats
 * the whole headline as one unit and swaps between phrases with a paired
 * blur-in / blur-out, adding a subtle scale to sell the "focus pull".
 */
export interface FocusBlurResolveVarsInput {
  /** ENTER tween duration (seconds). */
  duration?: number
  /** ENTER stagger step (seconds) — 0 for a whole target, kept for parity. */
  stagger?: number
  /** Starting vertical offset in px for the enter (drifts up to 0). */
  yFrom?: number
  /** Starting blur radius in px for the enter (resolves to 0). */
  blurFrom?: number
  /** Starting scale for the enter (settles to 1) — the "focus pull". */
  scaleFrom?: number
  /** GSAP ease for the enter — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.22, 1, 0.36, 1) — enter. */
export const FOCUS_BLUR_RESOLVE_ENTER_EASE_ID = 'focusBlurResolveEnter'
export const FOCUS_BLUR_RESOLVE_ENTER_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.64, 0, 0.78, 0) — exit. */
export const FOCUS_BLUR_RESOLVE_EXIT_EASE_ID = 'focusBlurResolveExit'
export const FOCUS_BLUR_RESOLVE_EXIT_EASE_PATH = 'M0,0 C0.64,0 0.78,0 1,1'

/**
 * `target: whole` — the headline animates as a single unit, so there is nothing
 * to split. We return a one-element array to keep the wrapper's call shape
 * identical to the split-based effects (gsap.set/gsap.to over an array).
 */
export function splitWhole(text: string): string[] {
  return [text]
}

export function buildFocusBlurResolveVars(input: FocusBlurResolveVarsInput = {}) {
  const {
    duration = 0.76,
    stagger = 0,
    yFrom = 14,
    blurFrom = 14,
    scaleFrom = 1.01,
    ease = FOCUS_BLUR_RESOLVE_ENTER_EASE_ID,
  } = input

  return {
    // ENTER: resolve from heavy blur / slight scale-up into a crisp settled state.
    from: {
      opacity: 0,
      y: yFrom,
      scale: scaleFrom,
      filter: `blur(${blurFrom}px)`,
    },
    to: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration,
      stagger,
      ease,
    },
    // EXIT: blur back out and lift slightly as the phrase recedes. The swap
    // wrapper tweens to this before swapping textContent to the next phrase.
    exit: {
      from: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
      to: {
        opacity: 0,
        y: -10,
        scale: 1,
        filter: 'blur(10px)',
        duration: 0.52,
        stagger: 0,
        ease: FOCUS_BLUR_RESOLVE_EXIT_EASE_ID,
      },
    },
  }
}
