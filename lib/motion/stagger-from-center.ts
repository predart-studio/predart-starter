/**
 * Pure construction of the "Stagger from Center" reveal — per-character fade-in
 * that radiates from the middle of the word outward, so the keyword core lands
 * first and emphasis spreads to the edges (product-hero title typography).
 *
 * Framework-free + DOM-free so it is unit-testable; the <StaggerFromCenter>
 * wrapper feeds `from`/`to` to gsap.set()/gsap.to() across per-character spans
 * with a gsap stagger `{ from: 'center' }` for the center-out ordering.
 *
 * Clean-room reference: pixel-point/animate-text `stagger-from-center` portable
 * contract — per-character, enter 620ms / 22ms stagger,
 * cubic-bezier(0.22, 1, 0.36, 1), from { opacity 0, y 12px, blur 3px },
 * center-out ordering. We implement the one-shot ENTER phase only (scroll/load
 * reveal); the catalog's looping crossfade-swap showcase is demo-only and
 * intentionally not reproduced. The exit vars exist here for parity with that
 * swap recipe but are not driven by the entrance component.
 *
 * Distinct from soft-blur (start-ordered, longer/heavier drift): the center-out
 * stagger is the defining trait — short words read as a symmetric bloom.
 */
export interface StaggerFromCenterVarsInput {
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

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.22, 1, 0.36, 1) (enter). */
export const STAGGER_FROM_CENTER_EASE_ID = 'staggerFromCenterEnter'
export const STAGGER_FROM_CENTER_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.64, 0, 0.78, 0) (exit). */
export const STAGGER_FROM_CENTER_EXIT_EASE_ID = 'staggerFromCenterExit'
export const STAGGER_FROM_CENTER_EXIT_EASE_PATH = 'M0,0 C0.64,0 0.78,0 1,1'

/**
 * Split text into per-character animated units, preserving spaces and
 * punctuation as their own units. `Array.from` is code-point aware, so emoji /
 * astral characters stay intact (the spec's `Array.from(text)` rule).
 */
export function splitChars(text: string): string[] {
  return Array.from(text)
}

export function buildStaggerFromCenterVars(
  input: StaggerFromCenterVarsInput = {},
) {
  const {
    duration = 0.62,
    stagger = 0.022,
    yFrom = 12,
    blurFrom = 3,
    ease = STAGGER_FROM_CENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom, filter: `blur(${blurFrom}px)` },
    // `stagger` is left scalar here; the component wraps it in the gsap stagger
    // object { each, from: 'center' } to drive the center-out ordering.
    to: { opacity: 1, y: 0, filter: 'blur(0px)', duration, stagger, ease },
  }
}

export interface StaggerFromCenterExitVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds). */
  stagger?: number
  /** Ending vertical offset in px (lifts up off the baseline). */
  yTo?: number
  /** Ending blur radius in px (dissolves out). */
  blurTo?: number
  /** GSAP ease — defaults to the registered exit CustomEase id. */
  ease?: string
}

/**
 * Exit vars for the crossfade-swap recipe (per the portable spec's `exit` +
 * `swap` blocks). Not used by the one-shot entrance component — exported for
 * parity so a future swap effect can reuse the same factory shape.
 */
export function buildStaggerFromCenterExitVars(
  input: StaggerFromCenterExitVarsInput = {},
) {
  const {
    duration = 0.42,
    stagger = 0.016,
    yTo = -8,
    blurTo = 3,
    ease = STAGGER_FROM_CENTER_EXIT_EASE_ID,
  } = input

  return {
    from: { opacity: 1, y: 0, filter: 'blur(0px)' },
    to: {
      opacity: 0,
      y: yTo,
      filter: `blur(${blurTo}px)`,
      duration,
      stagger,
      ease,
    },
  }
}
