/**
 * Pure construction of the per-line "popping text" GSAP tween vars and the
 * per-line ScrollTrigger scrub windows. Framework-free + DOM-free so it is
 * unit-testable; the <PoppingText> wrapper splits each line into chars, then
 * feeds these vars + scroll windows to gsap.fromTo() with a ScrollTrigger.
 *
 * Observed behavior: each line's chars pop from scale 0 / opacity 0 up to a
 * slight overshoot (~1.08) and settle to 1 — a back.out feel — staggered
 * char-by-char, scrubbed to scroll (scrub ~0.8). Successive lines start their
 * windows offset down the page so they pop one after another.
 *
 * Clean-room reference: annnimate "PoppingText" — behavior only.
 */

export const DEFAULT_POP_DURATION = 0.6
/** back.out overshoot strength — peak scale observed ≈ 1.08. */
export const DEFAULT_POP_EASE = 'back.out(2)'
/** Per-char stagger within a line (seconds of tween time). */
export const DEFAULT_POP_STAGGER = 0.08
/** Scale the chars start from. */
export const DEFAULT_POP_FROM_SCALE = 0
/** ScrollTrigger scrub smoothing (seconds of lag). */
export const DEFAULT_POP_SCRUB = 0.8
/** Where each line's scrub window opens (ScrollTrigger start). */
export const DEFAULT_POP_START = 'top 75%'
/** Where each line's scrub window closes (ScrollTrigger end). */
export const DEFAULT_POP_END = 'top 45%'

export interface PoppingVarsInput {
  /** Tween duration in seconds (scrub overrides real time, but sets proportions). */
  duration?: number
  /** GSAP ease — the pop overshoot. */
  ease?: string
  /** Per-char stagger in seconds. */
  stagger?: number
  /** Scale the chars start from (animate to 1). */
  fromScale?: number
}

/** The "from" state every char rests at before its line pops in. */
export function buildPoppingFromVars(input: PoppingVarsInput = {}) {
  const { fromScale = DEFAULT_POP_FROM_SCALE } = input
  return { scale: fromScale, opacity: 0 } as const
}

/** The "to" tween — chars scale + fade up, staggered, with the back.out pop. */
export function buildPoppingToVars(input: PoppingVarsInput = {}) {
  const {
    duration = DEFAULT_POP_DURATION,
    ease = DEFAULT_POP_EASE,
    stagger = DEFAULT_POP_STAGGER,
  } = input

  return {
    scale: 1,
    opacity: 1,
    duration,
    ease,
    stagger,
  }
}

export interface PoppingScrollInput {
  start?: string
  end?: string
  scrub?: number
}

/** The per-line ScrollTrigger config (scrubbed, no pin). */
export function buildPoppingScrollTrigger<T>(
  trigger: T,
  input: PoppingScrollInput = {},
) {
  const {
    start = DEFAULT_POP_START,
    end = DEFAULT_POP_END,
    scrub = DEFAULT_POP_SCRUB,
  } = input

  return { trigger, start, end, scrub }
}
