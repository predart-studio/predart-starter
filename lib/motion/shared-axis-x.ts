/**
 * Pure construction of the "Shared Axis X" transition — sibling text views slide
 * across the X axis with a slight fade + scale, so horizontal direction conveys
 * "next sibling" the way Material's shared-axis (X) pattern does between
 * same-level destinations.
 *
 * Framework-free + DOM-free so it is unit-testable; the <SharedAxisX> wrapper
 * feeds the `enter`/`exit` from/to to gsap.set()/gsap.to() on a single host
 * element (target: whole — no splitting).
 *
 * Clean-room reference: pixel-point/animate-text `shared-axis-x` portable
 * contract — whole target, swap effect.
 *   ENTER 500ms / cubic-bezier(0.2, 0, 0, 1), from { opacity 0, x 24px, scale 0.98 }.
 *   EXIT  360ms / cubic-bezier(0.4, 0, 1, 1), to   { opacity 0, x -20px, scale 0.98 }.
 * This is fundamentally a transition between strings, so the wrapper drives BOTH
 * phases (old view exits left, new view enters from the right) on a cycle.
 *
 * Distinct from per-word-crossfade (per-word fade, no horizontal travel):
 * Shared Axis X moves the whole line along X with a subtle scale to read as a
 * directional sibling swap rather than a reveal.
 */
export interface SharedAxisXVarsInput {
  /** ENTER tween duration (seconds). */
  enterDuration?: number
  /** EXIT tween duration (seconds). */
  exitDuration?: number
  /** Horizontal offset the incoming view starts at, in px (slides to 0). */
  xEnterFrom?: number
  /** Horizontal offset the outgoing view ends at, in px (slides from 0). */
  xExitTo?: number
  /** Scale both phases settle/start away from 1 (0.98 in the spec). */
  scaleAway?: number
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.2, 0, 0, 1) — ENTER. */
export const SHARED_AXIS_X_ENTER_EASE_ID = 'sharedAxisXEnter'
export const SHARED_AXIS_X_ENTER_EASE_PATH = 'M0,0 C0.2,0 0,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.4, 0, 1, 1) — EXIT. */
export const SHARED_AXIS_X_EXIT_EASE_ID = 'sharedAxisXExit'
export const SHARED_AXIS_X_EXIT_EASE_PATH = 'M0,0 C0.4,0 1,1 1,1'

/**
 * Target is `whole` — there is nothing to split. This helper exists to mirror
 * the soft-blur `splitChars` shape (and keep the prop contract uniform across
 * the motion lab): it returns the host text as a single animated unit.
 */
export function splitWhole(text: string): string[] {
  return [text]
}

export function buildSharedAxisXVars(input: SharedAxisXVarsInput = {}) {
  const {
    enterDuration = 0.5,
    exitDuration = 0.36,
    xEnterFrom = 24,
    xExitTo = -20,
    scaleAway = 0.98,
  } = input

  return {
    enter: {
      from: { opacity: 0, x: xEnterFrom, scale: scaleAway },
      to: {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: enterDuration,
        ease: SHARED_AXIS_X_ENTER_EASE_ID,
      },
    },
    exit: {
      from: { opacity: 1, x: 0, scale: 1 },
      to: {
        opacity: 0,
        x: xExitTo,
        scale: scaleAway,
        duration: exitDuration,
        ease: SHARED_AXIS_X_EXIT_EASE_ID,
      },
    },
  }
}
