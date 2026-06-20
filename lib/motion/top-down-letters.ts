/**
 * Pure construction of the "Top-Down Letters" reveal — per-character descent
 * from above in a pronounced staircase, one symbol at a time, with zero blur
 * (Apple-keynote / crisp editorial header typography).
 *
 * Framework-free + DOM-free so it is unit-testable; the <TopDownLetters> wrapper
 * feeds `from`/`to` to gsap.set()/gsap.to() across per-character spans.
 *
 * Clean-room reference: pixel-point/animate-text `top-down-letters` portable
 * contract — per-character, enter 400ms / 88ms stagger,
 * cubic-bezier(0.18, 1, 0.32, 1), from { opacity 0, y -46px }. Letters drop in
 * from above; deliberately NO blur and a very large per-symbol delay so few
 * glyphs animate at once. We implement the one-shot ENTER phase only
 * (scroll/load reveal); the catalog's looping showcase playback — with its
 * speed/travel multipliers, exit, hold, and gap — is demo-only and intentionally
 * not reproduced.
 *
 * Distinct from soft-blur (vertical drift + blur dissolve): Top-Down Letters has
 * a taller drop, a much slower stagger, and crisp edges throughout.
 */
export interface TopDownLettersVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds) — the staircase spacing. */
  stagger?: number
  /** Starting vertical offset in px (drops down from above to 0). */
  yFrom?: number
  /** GSAP ease — defaults to the registered CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.18, 1, 0.32, 1). */
export const TOP_DOWN_LETTERS_EASE_ID = 'topDownLettersEnter'
export const TOP_DOWN_LETTERS_EASE_PATH = 'M0,0 C0.18,1 0.32,1 1,1'

/**
 * Split text into per-character animated units, preserving spaces and
 * punctuation as their own units. `Array.from` is code-point aware, so emoji /
 * astral characters stay intact (the spec's `Array.from(text)` rule).
 */
export function splitChars(text: string): string[] {
  return Array.from(text)
}

export function buildTopDownLettersVars(input: TopDownLettersVarsInput = {}) {
  const {
    duration = 0.4,
    stagger = 0.088,
    yFrom = -46,
    ease = TOP_DOWN_LETTERS_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom },
    to: { opacity: 1, y: 0, duration, stagger, ease },
  }
}
