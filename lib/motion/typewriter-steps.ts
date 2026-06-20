/**
 * Pure construction of the "Typewriter" reveal — a per-character stepped fade-in
 * with a minimal editorial typing rhythm. Each glyph snaps in on a `steps(1)`
 * ease (no interpolation), so the line builds character-by-character like a
 * system text print rather than a smooth dissolve.
 *
 * Framework-free + DOM-free so it is unit-testable; the <TypewriterSteps> wrapper
 * feeds `from`/`to` to gsap.set()/gsap.to() across per-character spans.
 *
 * Clean-room reference: pixel-point/animate-text `typewriter` portable contract —
 * per-character, enter 240ms / 46ms stagger, easing steps(1, end),
 * from { opacity 0 } → to { opacity 1 } (no vertical travel on enter).
 * The exit vars (260ms / 10ms stagger, cubic-bezier(0.7, 0, 0.84, 0),
 * opacity 1 → 0 with a 4px lift) are exported for the catalog's swap/loop
 * playback; we implement the one-shot ENTER phase only (scroll/load reveal),
 * and the catalog's looping phrase showcase is demo-only and not reproduced.
 *
 * Distinct from the existing Typewriter (phrase-looping rotator): this is a
 * one-shot stepped per-character reveal on scroll, named *-steps to avoid the
 * component clash.
 */
export interface TypewriterStepsVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds). */
  stagger?: number
  /** GSAP ease for the enter phase — defaults to the stepped typing ease. */
  ease?: string
}

/**
 * Enter ease — the spec's `steps(1, end)`. GSAP expresses CSS `steps(n, ...)`
 * as the string `steps(n)`, so a single step gives the editorial snap-in.
 */
export const TYPEWRITER_STEPS_EASE = 'steps(1)'

/**
 * Exit ease — CSS cubic-bezier(0.7, 0, 0.84, 0) as a registered CustomEase id +
 * SVG path. Only used by swap/loop playback (not the one-shot enter reveal), but
 * exported so the contract stays complete and the .tsx can register it once.
 */
export const TYPEWRITER_STEPS_EXIT_EASE_ID = 'typewriterStepsExit'
export const TYPEWRITER_STEPS_EXIT_EASE_PATH = 'M0,0 C0.7,0 0.84,0 1,1'

/**
 * Split text into per-character animated units, preserving spaces and
 * punctuation as their own units. `Array.from` is code-point aware, so emoji /
 * astral characters stay intact (the spec's `Array.from(text)` rule).
 */
export function splitChars(text: string): string[] {
  return Array.from(text)
}

export function buildTypewriterStepsVars(input: TypewriterStepsVarsInput = {}) {
  const {
    duration = 0.24,
    stagger = 0.046,
    ease = TYPEWRITER_STEPS_EASE,
  } = input

  return {
    // Enter: characters print in place — opacity only, no vertical travel.
    from: { opacity: 0, y: 0 },
    to: { opacity: 1, y: 0, duration, stagger, ease },
    // Exit: fade out with a 4px lift — retained for swap/loop playback only.
    exit: {
      from: { opacity: 1, y: 0 },
      to: {
        opacity: 0,
        y: -4,
        duration: 0.26,
        stagger: 0.01,
        ease: TYPEWRITER_STEPS_EXIT_EASE_ID,
      },
    },
  }
}
