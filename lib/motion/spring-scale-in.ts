/**
 * Pure construction of the "Spring Scale In" reveal — per-word pop-in with a
 * soft overshoot scale, like a physical spring settling into place (iOS app
 * icons bouncing onto the home screen, the macOS Dock, Vision Pro UI pops).
 *
 * Framework-free + DOM-free so it is unit-testable; the <SpringScaleIn> wrapper
 * feeds `from`/`to` to gsap.set()/gsap.to() across per-word spans.
 *
 * Clean-room reference: pixel-point/animate-text `spring-scale-in` portable
 * contract — per-word, enter 360ms / 95ms stagger,
 * cubic-bezier(0.34, 1.56, 0.64, 1), from { opacity 0, scale 0.7 }.
 * The overshoot lives entirely in the ease (y2 = 1.56 > 1), so scale tweens
 * straight to 1 and the curve does the bounce.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping showcase playback (hold → exit → swap) is demo-only and intentionally
 * not reproduced. The `exit` vars below are exported for swap-style callers but
 * are unused by the one-shot wrapper.
 *
 * Per-word is the sweet spot here — per-character at this bouncy ease feels too
 * jittery (the spec's own usage note), and the high stagger is intentional: it
 * builds a visible staircase as each word springs in.
 */
export interface SpringScaleInVarsInput {
  /** Tween duration per word (seconds). */
  duration?: number
  /** Per-word delay step (seconds). */
  stagger?: number
  /** Starting scale (overshoots through 1 on the spring ease). */
  scaleFrom?: number
  /** GSAP ease — defaults to the registered CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.34, 1.56, 0.64, 1). */
export const SPRING_SCALE_IN_EASE_ID = 'springScaleInEnter'
export const SPRING_SCALE_IN_EASE_PATH = 'M0,0 C0.34,1.56 0.64,1 1,1'

/** Exit (swap) ease — cubic-bezier(0.7, 0, 0.84, 0); only used by swap callers. */
export const SPRING_SCALE_IN_EXIT_EASE_ID = 'springScaleInExit'
export const SPRING_SCALE_IN_EXIT_EASE_PATH = 'M0,0 C0.7,0 0.84,0 1,1'

/** A split unit: the text plus whether it is an animated word or static space. */
export interface WordUnit {
  text: string
  /** Whitespace runs are kept in the DOM for spacing but never animated. */
  isWord: boolean
}

/**
 * Split text into per-word animated units, keeping whitespace runs as their own
 * static units so spacing is preserved. The regex `/(\S+|\s+)/g` yields words
 * AND whitespace; only the non-whitespace units are flagged `isWord` (the spec's
 * per-word rule — animate words, leave whitespace alone).
 */
export function splitWords(text: string): WordUnit[] {
  const parts = text.match(/(\S+|\s+)/g) ?? []
  return parts.map((part) => ({ text: part, isWord: /\S/.test(part) }))
}

export function buildSpringScaleInVars(input: SpringScaleInVarsInput = {}) {
  const {
    duration = 0.36,
    stagger = 0.095,
    scaleFrom = 0.7,
    ease = SPRING_SCALE_IN_EASE_ID,
  } = input

  return {
    from: { opacity: 0, scale: scaleFrom },
    to: { opacity: 1, scale: 1, duration, stagger, ease },
    // Exit/swap frame (200ms / 0.84 in-curve) — surfaced for swap callers; the
    // one-shot ENTER wrapper never plays this.
    exit: {
      from: { opacity: 1, scale: 1 },
      to: {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        stagger: 0.08,
        ease: SPRING_SCALE_IN_EXIT_EASE_ID,
      },
    },
  }
}
