/**
 * Pure construction of the "Per-Character Rise" reveal — letters slide up from
 * below with NO blur. Crisp, deliberate, kinetic (Apple's tvOS / Fitness+
 * title reveal). The zero-blur, sharper travel is the key distinction from
 * soft-blur-in.
 *
 * Framework-free + DOM-free so it is unit-testable; the <PerCharacterRise>
 * wrapper feeds `from`/`to` to gsap.set()/gsap.to() across per-character spans.
 *
 * Clean-room reference: pixel-point/animate-text `per-character-rise` portable
 * contract — per-character, enter 700ms / 24ms stagger,
 * cubic-bezier(0.2, 0.8, 0.2, 1), from { opacity 0, y 32px }.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping showcase playback + crossfade swap are demo-only and intentionally
 * not reproduced here. (Exit vars are exposed for swap consumers, see below.)
 *
 * Distinct from soft-blur (opacity + drift + blur dissolve): Per-Character Rise
 * keeps every glyph sharp — pure opacity + a longer vertical travel.
 */
export interface PerCharacterRiseVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds). */
  stagger?: number
  /** Starting vertical offset in px (rises up to 0). */
  yFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.2, 0.8, 0.2, 1). */
export const PER_CHARACTER_RISE_ENTER_EASE_ID = 'perCharacterRiseEnter'
export const PER_CHARACTER_RISE_ENTER_EASE_PATH = 'M0,0 C0.2,0.8 0.2,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.7, 0, 0.84, 0). */
export const PER_CHARACTER_RISE_EXIT_EASE_ID = 'perCharacterRiseExit'
export const PER_CHARACTER_RISE_EXIT_EASE_PATH = 'M0,0 C0.7,0 0.84,0 1,1'

/**
 * Split text into per-character animated units, preserving spaces and
 * punctuation as their own units. `Array.from` is code-point aware, so emoji /
 * astral characters stay intact (the spec's `Array.from(text)` rule).
 */
export function splitChars(text: string): string[] {
  return Array.from(text)
}

export function buildPerCharacterRiseVars(input: PerCharacterRiseVarsInput = {}) {
  const {
    duration = 0.7,
    stagger = 0.024,
    yFrom = 32,
    ease = PER_CHARACTER_RISE_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom },
    to: { opacity: 1, y: 0, duration, stagger, ease },
  }
}

export interface PerCharacterRiseExitVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds). */
  stagger?: number
  /** Ending vertical offset in px (lifts up off the baseline). */
  yTo?: number
  /** GSAP ease — defaults to the registered exit CustomEase id. */
  ease?: string
}

/**
 * Exit vars for crossfade swap consumers — letters fade out while lifting up.
 * Exposed for completeness with the portable spec; the one-shot
 * <PerCharacterRise> component does NOT use these (ENTER phase only).
 */
export function buildPerCharacterRiseExitVars(
  input: PerCharacterRiseExitVarsInput = {},
) {
  const {
    duration = 0.42,
    stagger = 0.014,
    yTo = -24,
    ease = PER_CHARACTER_RISE_EXIT_EASE_ID,
  } = input

  return {
    from: { opacity: 1, y: 0 },
    to: { opacity: 0, y: yTo, duration, stagger, ease },
  }
}
