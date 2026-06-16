/**
 * Pure helpers for the CinematicText effect: split a heading into its
 * per-line tokens, and build the GSAP from-vars + tween-vars for a staggered,
 * scroll-scrubbed line reveal (each line slides in from `xFrom` px while fading
 * 0 -> 1, with an optional blur(from -> to) on the CSS `filter`).
 *
 * Framework-free + DOM-free so it is unit-testable; the <CinematicText>
 * wrapper feeds the result to gsap.fromTo() inside a scrubbed ScrollTrigger.
 *
 * Clean-room reference: annnimate "CinematicText" — behavior only.
 */

export const DEFAULT_CINEMATIC_X_FROM = 40 // px, lines start translated to the right
export const DEFAULT_CINEMATIC_BLUR_FROM = 0 // px — observed demo used no blur
export const DEFAULT_CINEMATIC_BLUR_TO = 0 // px
export const DEFAULT_CINEMATIC_DURATION = 0.6 // s, per-line tween length
export const DEFAULT_CINEMATIC_STAGGER = 0.15 // s between consecutive lines
export const DEFAULT_CINEMATIC_EASE = 'power3.out'

export interface CinematicVarsInput {
  /** px the lines are offset on the x-axis before they settle to 0. */
  xFrom?: number
  /** Blur (px) the lines start at — 0 disables the filter entirely. */
  blurFrom?: number
  /** Blur (px) the lines end at (normally 0 = crisp). */
  blurTo?: number
  /** Per-line tween duration in seconds. */
  duration?: number
  /** Seconds between consecutive lines (top -> bottom cascade). */
  stagger?: number
  /** GSAP ease for each line's settle. */
  ease?: string
}

/**
 * Split a heading string into its lines. Accepts an explicit string[] (passed
 * through, trimmed of empties) or a single string split on newlines. Used to
 * decide how many H-tag lines the wrapper renders + animates.
 */
export function splitLines(input: string | readonly string[]): string[] {
  const raw = Array.isArray(input) ? input : String(input).split('\n')
  return raw.map((l) => l.trim()).filter((l) => l.length > 0)
}

export interface CinematicTweenVars {
  from: { x: number; opacity: number; filter?: string }
  to: {
    x: number
    opacity: number
    filter?: string
    duration: number
    ease: string
    stagger: number
  }
}

/**
 * Build the gsap.fromTo() var pair for the line cascade. `filter` is only
 * emitted when a non-zero blur is requested, so the default (0) path never
 * touches the CSS `filter` property (matching the observed demo).
 */
export function buildCinematicVars(input: CinematicVarsInput = {}): CinematicTweenVars {
  const {
    xFrom = DEFAULT_CINEMATIC_X_FROM,
    blurFrom = DEFAULT_CINEMATIC_BLUR_FROM,
    blurTo = DEFAULT_CINEMATIC_BLUR_TO,
    duration = DEFAULT_CINEMATIC_DURATION,
    stagger = DEFAULT_CINEMATIC_STAGGER,
    ease = DEFAULT_CINEMATIC_EASE,
  } = input

  const usesBlur = blurFrom !== 0 || blurTo !== 0

  const from: CinematicTweenVars['from'] = { x: xFrom, opacity: 0 }
  const to: CinematicTweenVars['to'] = {
    x: 0,
    opacity: 1,
    duration,
    ease,
    stagger,
  }

  if (usesBlur) {
    from.filter = `blur(${blurFrom}px)`
    to.filter = `blur(${blurTo}px)`
  }

  return { from, to }
}
