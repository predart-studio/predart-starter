/**
 * Pure construction of the "Stagger from Edges" reveal — per-character fade-in
 * where the characters start at both edges and converge toward the center with a
 * small upward settle and a faint blur dissolve.
 *
 * Framework-free + DOM-free so it is unit-testable; the <StaggerFromEdges>
 * wrapper feeds `from`/`to` to gsap.set()/gsap.to() across per-character spans
 * and orders them with the gsap stagger object `{ each, from: "edges" }`.
 *
 * Clean-room reference: pixel-point/animate-text `stagger-from-edges` portable
 * contract — per-character, enter 620ms / 22ms stagger, edges-in,
 * cubic-bezier(0.22, 1, 0.36, 1), from { opacity 0, y 12px, blur 3px }.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * looping showcase playback is demo-only and intentionally not reproduced. The
 * exit vars are exported for swap/crossfade callers but unused by the entrance.
 *
 * Distinct from soft-blur (center-out neutral order, larger drift/blur): this
 * effect is defined by the edges→center convergence on a tighter, faster step.
 */
export interface StaggerFromEdgesVarsInput {
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds). */
  stagger?: number
  /** Starting vertical offset in px (settles up to 0). */
  yFrom?: number
  /** Starting blur radius in px (dissolves to 0). */
  blurFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** CustomEase ids + SVG-path equivalents of the spec cubic-beziers. */
// enter: cubic-bezier(0.22, 1, 0.36, 1)
export const STAGGER_FROM_EDGES_ENTER_EASE_ID = 'staggerFromEdgesEnter'
export const STAGGER_FROM_EDGES_ENTER_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'
// exit: cubic-bezier(0.64, 0, 0.78, 0)
export const STAGGER_FROM_EDGES_EXIT_EASE_ID = 'staggerFromEdgesExit'
export const STAGGER_FROM_EDGES_EXIT_EASE_PATH = 'M0,0 C0.64,0 0.78,0 1,1'

/**
 * Split text into per-character animated units, preserving spaces and
 * punctuation as their own units. `Array.from` is code-point aware, so emoji /
 * astral characters stay intact (the spec's `Array.from(text)` rule).
 */
export function splitChars(text: string): string[] {
  return Array.from(text)
}

/**
 * Build the gsap from/to for the ENTER phase plus the exit from/to that swap
 * effects (crossfade) consume. The `to` carries duration/stagger/ease; the
 * stagger is intended to be passed through the gsap object `{ each: stagger,
 * from: 'edges' }` by the component to get the edges→center ordering.
 */
export function buildStaggerFromEdgesVars(input: StaggerFromEdgesVarsInput = {}) {
  const {
    duration = 0.62,
    stagger = 0.022,
    yFrom = 12,
    blurFrom = 3,
    ease = STAGGER_FROM_EDGES_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom, filter: `blur(${blurFrom}px)` },
    to: { opacity: 1, y: 0, filter: 'blur(0px)', duration, stagger, ease },
    // Exit vars (swap/crossfade only — not used by the entrance reveal).
    exitFrom: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exitTo: {
      opacity: 0,
      y: -8,
      filter: `blur(${blurFrom}px)`,
      duration: 0.42,
      stagger: 0.016,
      ease: STAGGER_FROM_EDGES_EXIT_EASE_ID,
    },
  }
}
