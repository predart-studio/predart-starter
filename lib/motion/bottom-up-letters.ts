/**
 * Pure construction of the "Bottom-Up Letters" reveal — per-character rise from
 * below in a pronounced staircase, one symbol at a time, with ZERO blur (sharp
 * keynote / lower-third typography, clean editorial word swaps).
 *
 * Framework-free + DOM-free so it is unit-testable; the <BottomUpLetters>
 * wrapper feeds `from`/`to` to gsap.set()/gsap.to() across per-character spans.
 *
 * Clean-room reference: pixel-point/animate-text `bottom-up-letters` portable
 * contract — per-character, enter 400ms / 88ms stagger,
 * cubic-bezier(0.18, 1, 0.32, 1), from { opacity 0, y 46px } (no blur).
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping showcase playback (hold → exit → micro-delay → gap → swap) is
 * demo-only and intentionally not reproduced. The exit vars are exported for any
 * future swap effect but are not used by the entrance wrapper.
 *
 * Distinct from soft-blur (vertical drift + blur dissolve): Bottom-Up Letters is
 * a taller lift (46px vs 16px), a much larger per-symbol delay (88ms vs 25ms),
 * and crisp glyph edges throughout — the staircase reads bottom-up, never blurry.
 */
export interface BottomUpLettersVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds) — large here for the staircase. */
  stagger?: number
  /** Starting vertical offset in px (rises up to 0). */
  yFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.18, 1, 0.32, 1) — enter. */
export const BOTTOM_UP_LETTERS_EASE_ID = 'bottomUpLettersEnter'
export const BOTTOM_UP_LETTERS_EASE_PATH = 'M0,0 C0.18,1 0.32,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.7, 0, 0.84, 0) — exit (swap-only). */
export const BOTTOM_UP_LETTERS_EXIT_EASE_ID = 'bottomUpLettersExit'
export const BOTTOM_UP_LETTERS_EXIT_EASE_PATH = 'M0,0 C0.7,0 0.84,0 1,1'

/**
 * Split text into per-character animated units, preserving spaces and
 * punctuation as their own units. `Array.from` is code-point aware, so emoji /
 * astral characters stay intact (the spec's `Array.from(text)` rule).
 */
export function splitChars(text: string): string[] {
  return Array.from(text)
}

export function buildBottomUpLettersVars(input: BottomUpLettersVarsInput = {}) {
  const {
    duration = 0.4,
    stagger = 0.088,
    yFrom = 46,
    ease = BOTTOM_UP_LETTERS_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom },
    to: { opacity: 1, y: 0, duration, stagger, ease },
  }
}

/**
 * Exit (swap-only) vars: letters fall up and out on a sharp ease-in. Exported
 * for a future swap component; the one-shot entrance wrapper does not use these.
 * Clean-room reference: pixel-point/animate-text `bottom-up-letters` exit phase.
 */
export interface BottomUpLettersExitVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds). */
  stagger?: number
  /** Ending vertical offset in px (lifts up to negative). */
  yTo?: number
  /** GSAP ease — defaults to the registered exit CustomEase id. */
  ease?: string
}

export function buildBottomUpLettersExitVars(
  input: BottomUpLettersExitVarsInput = {},
) {
  const {
    duration = 0.28,
    stagger = 0.028,
    yTo = -14,
    ease = BOTTOM_UP_LETTERS_EXIT_EASE_ID,
  } = input

  return {
    from: { opacity: 1, y: 0 },
    to: { opacity: 0, y: yTo, duration, stagger, ease },
  }
}
