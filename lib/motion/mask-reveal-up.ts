/**
 * Pure construction of the "Mask Reveal Up" reveal — per-line rise-in with a
 * soft masked feel: each line lifts from below behind a gentle blur dissolve
 * (Apple's section-transition headline reveal where multiline copy rises in
 * with control).
 *
 * Framework-free + DOM-free so it is unit-testable; the <MaskRevealUp> wrapper
 * feeds `from`/`to` to gsap.set()/gsap.to() across per-line block spans.
 *
 * Clean-room reference: pixel-point/animate-text `mask-reveal-up` portable
 * contract — per-line, enter 760ms / 90ms stagger,
 * cubic-bezier(0.22, 1, 0.36, 1), from { opacity 0, y 30px, blur 6px }.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping showcase playback (hold → exit → crossfade swap) is demo-only and
 * intentionally not reproduced. The exit vars are exported for completeness so a
 * future swap wrapper can reuse this module without re-deriving the curve.
 *
 * Distinct from soft-blur (per-character drift): Mask Reveal Up animates whole
 * lines, keeping line order readable for two- and three-line headings.
 */
export interface MaskRevealUpVarsInput {
  /** Tween duration per line (seconds). */
  duration?: number
  /** Per-line delay step (seconds). */
  stagger?: number
  /** Starting vertical offset in px (rises up to 0). */
  yFrom?: number
  /** Starting blur radius in px (dissolves to 0). */
  blurFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** Enter CustomEase id + SVG-path equivalent of cubic-bezier(0.22, 1, 0.36, 1). */
export const MASK_REVEAL_UP_ENTER_EASE_ID = 'maskRevealUpEnter'
export const MASK_REVEAL_UP_ENTER_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'

/** Exit CustomEase id + SVG-path equivalent of cubic-bezier(0.64, 0, 0.78, 0). */
export const MASK_REVEAL_UP_EXIT_EASE_ID = 'maskRevealUpExit'
export const MASK_REVEAL_UP_EXIT_EASE_PATH = 'M0,0 C0.64,0 0.78,0 1,1'

/**
 * Split text into per-line animated units on explicit "\n". Each line becomes
 * one animated block span; empty trailing lines are kept so a hard line break at
 * the end still reserves its row. No splitting beyond newlines — words and
 * spaces inside a line ride along together.
 */
export function splitLines(text: string): string[] {
  return text.split('\n')
}

export function buildMaskRevealUpVars(input: MaskRevealUpVarsInput = {}) {
  const {
    duration = 0.76,
    stagger = 0.09,
    yFrom = 30,
    blurFrom = 6,
    ease = MASK_REVEAL_UP_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom, filter: `blur(${blurFrom}px)` },
    to: { opacity: 1, y: 0, filter: 'blur(0px)', duration, stagger, ease },
  }
}

/**
 * Exit vars for swap playback — lines lift further up and dissolve back into
 * blur on the accelerating exit curve. Not used by the one-shot ENTER wrapper;
 * exported so a swap variant can reuse the same numbers.
 */
export function buildMaskRevealUpExitVars(input: MaskRevealUpVarsInput = {}) {
  const {
    duration = 0.52,
    stagger = 0.07,
    yFrom = -22,
    blurFrom = 6,
    ease = MASK_REVEAL_UP_EXIT_EASE_ID,
  } = input

  return {
    from: { opacity: 1, y: 0, filter: 'blur(0px)' },
    to: { opacity: 0, y: yFrom, filter: `blur(${blurFrom}px)`, duration, stagger, ease },
  }
}
