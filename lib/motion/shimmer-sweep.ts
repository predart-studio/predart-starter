/**
 * Pure construction of the "Shimmer Sweep" reveal — a subtle highlight glides
 * left→center across the headline while it eases in from a small left offset
 * and a soft blur dissolves away. A premium hero-copy micro-transition.
 *
 * Framework-free + DOM-free so it is unit-testable; the <ShimmerSweep> wrapper
 * feeds `from`/`to` to gsap.set()/gsap.to() on the single host element and
 * drives the sweep highlight (a background-clip:text gradient) alongside it.
 *
 * Clean-room reference: pixel-point/animate-text `shimmer-sweep` portable
 * contract — whole-element target, enter 850ms / 0ms stagger,
 * cubic-bezier(0.22, 1, 0.36, 1), from { opacity 0, x -22px, blur 8px }; exit
 * (for swap transitions) 650ms, cubic-bezier(0.7, 0, 0.84, 0),
 * to { opacity 0, x 22px, blur 8px }.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping showcase playback (hold → exit → micro-delay → swap) is demo-only and
 * intentionally not reproduced.
 *
 * Distinct from soft-blur (per-character vertical drift): Shimmer Sweep is a
 * whole-headline horizontal glide with a travelling gradient highlight.
 */
export interface ShimmerSweepVarsInput {
  /** Tween duration for the entrance (seconds). */
  duration?: number
  /** Per-unit delay step (seconds) — 0 for the whole-element target. */
  stagger?: number
  /** Starting horizontal offset in px (glides right to 0). */
  xFrom?: number
  /** Starting blur radius in px (dissolves to 0). */
  blurFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** Enter CustomEase id + SVG-path equivalent of cubic-bezier(0.22, 1, 0.36, 1). */
export const SHIMMER_SWEEP_EASE_ID = 'shimmerSweepEnter'
export const SHIMMER_SWEEP_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'

/** Exit CustomEase id + SVG-path equivalent of cubic-bezier(0.7, 0, 0.84, 0). */
export const SHIMMER_SWEEP_EXIT_EASE_ID = 'shimmerSweepExit'
export const SHIMMER_SWEEP_EXIT_EASE_PATH = 'M0,0 C0.7,0 0.84,0 1,1'

/**
 * "Split" for the whole-element target: do NOT split — return the full text as a
 * single animated unit. Kept as a helper (rather than animating inline) so the
 * component treats every effect's units uniformly and the contract matches the
 * other house animations.
 */
export function splitWhole(text: string): string[] {
  return [text]
}

export function buildShimmerSweepVars(input: ShimmerSweepVarsInput = {}) {
  const {
    duration = 0.85,
    stagger = 0,
    xFrom = -22,
    blurFrom = 8,
    ease = SHIMMER_SWEEP_EASE_ID,
  } = input

  return {
    from: { opacity: 0, x: xFrom, filter: `blur(${blurFrom}px)` },
    to: { opacity: 1, x: 0, filter: 'blur(0px)', duration, stagger, ease },
  }
}

export interface ShimmerSweepExitVarsInput {
  /** Tween duration for the exit (seconds). */
  duration?: number
  /** Per-unit delay step (seconds) — 0 for the whole-element target. */
  stagger?: number
  /** Ending horizontal offset in px (glides away to the right). */
  xTo?: number
  /** Ending blur radius in px. */
  blurTo?: number
  /** GSAP ease — defaults to the registered exit CustomEase id. */
  ease?: string
}

/**
 * Exit vars for swap transitions (title refreshes). Not used by the one-shot
 * entrance demo, but exported so the same module powers crossfade swaps without
 * a second contract. Mirrors the spec's exit block.
 */
export function buildShimmerSweepExitVars(input: ShimmerSweepExitVarsInput = {}) {
  const {
    duration = 0.65,
    stagger = 0,
    xTo = 22,
    blurTo = 8,
    ease = SHIMMER_SWEEP_EXIT_EASE_ID,
  } = input

  return {
    from: { opacity: 1, x: 0, filter: 'blur(0px)' },
    to: { opacity: 0, x: xTo, filter: `blur(${blurTo}px)`, duration, stagger, ease },
  }
}
