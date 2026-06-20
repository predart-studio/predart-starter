/**
 * Pure construction of the "Soft Blur" reveal — per-character fade-in with a
 * gentle upward drift and a blur dissolve (Apple's signature hero-title reveal).
 *
 * Framework-free + DOM-free so it is unit-testable; the <SoftBlur> wrapper feeds
 * `from`/`to` to gsap.set()/gsap.to() across per-character spans.
 *
 * Clean-room reference: pixel-point/animate-text `soft-blur-in` portable
 * contract — per-character, enter 900ms / 25ms stagger,
 * cubic-bezier(0.22, 1, 0.36, 1), from { opacity 0, y 16px, blur 12px }.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping showcase playback is demo-only and intentionally not reproduced.
 *
 * Distinct from character-appear (pure opacity, no movement): Soft Blur adds the
 * vertical drift + blur that define the effect.
 */
export interface SoftBlurVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds). */
  stagger?: number
  /** Starting vertical offset in px (drifts up to 0). */
  yFrom?: number
  /** Starting blur radius in px (dissolves to 0). */
  blurFrom?: number
  /** GSAP ease — defaults to the registered CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.22, 1, 0.36, 1). */
export const SOFT_BLUR_EASE_ID = 'softBlurIn'
export const SOFT_BLUR_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'

/**
 * Split text into per-character animated units, preserving spaces and
 * punctuation as their own units. `Array.from` is code-point aware, so emoji /
 * astral characters stay intact (the spec's `Array.from(text)` rule).
 */
export function splitChars(text: string): string[] {
  return Array.from(text)
}

export function buildSoftBlurVars(input: SoftBlurVarsInput = {}) {
  const {
    duration = 0.9,
    stagger = 0.025,
    yFrom = 16,
    blurFrom = 12,
    ease = SOFT_BLUR_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom, filter: `blur(${blurFrom}px)` },
    to: { opacity: 1, y: 0, filter: 'blur(0px)', duration, stagger, ease },
  }
}
