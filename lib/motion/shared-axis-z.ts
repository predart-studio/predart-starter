/**
 * Pure construction of the "Shared Axis Z" swap — a Material-style shared-axis
 * (Z) transition adapted for typography. The outgoing phrase fades out while
 * scaling slightly UP (zooming toward the viewer) with a faint blur, and the
 * incoming phrase fades in while scaling UP from 0.9 (zooming forward from
 * behind) out of a soft blur. Scale communicates depth — the focus shifts
 * "through" the Z axis from one string to the next.
 *
 * Framework-free + DOM-free so it is unit-testable; the <SharedAxisZ> wrapper
 * feeds the enter/exit `from`/`to` to gsap.set()/gsap.to() on the single host
 * element (the spec target is `whole` — no split).
 *
 * Target is `whole`: there is NO split — the effect animates one element, not
 * per-character/word spans. We still export a passthrough split helper to mirror
 * the house pattern's module shape (it returns the text as a single unit).
 *
 * Clean-room reference: pixel-point/animate-text `shared-axis-z` portable
 * contract — whole target, enter 520ms / 0ms stagger / cubic-bezier(0.2,0,0,1)
 * from { opacity 0, scale 0.9, blur 2px }, exit 360ms / cubic-bezier(0.4,0,1,1)
 * to { opacity 0, scale 1.06, blur 1px }, crossfade swap with a 20ms micro-delay
 * between exit-end and the next enter. We reproduce the looping exit→swap→enter
 * cycle (this effect is fundamentally a transition between strings) at the spec's
 * base timing, not the demo-only runtime down-scale.
 *
 * Distinct from micro-scale-fade (a tiny 0.96→1 pop): Shared Axis Z scales
 * further (0.9→1 on enter, 1→1.06 on exit) and adds the blur depth cue, reading
 * as a forward zoom between focus states rather than a calm settle.
 */
export interface SharedAxisZVarsInput {
  /** Tween duration (seconds). */
  duration?: number
  /** Delay step (seconds) — `whole` has no units to stagger, but kept for the
   * shared contract and applied harmlessly to the single host element. */
  stagger?: number
  /** Starting scale for the enter (zooms forward up to 1). */
  scaleFrom?: number
  /** Starting blur radius for the enter, in px (dissolves to 0). */
  blurFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

export interface SharedAxisZExitVarsInput {
  /** Tween duration (seconds). */
  duration?: number
  /** Ending scale for the exit (zooms past 1, toward the viewer). */
  scaleTo?: number
  /** Ending blur radius for the exit, in px (re-blurs as it leaves). */
  blurTo?: number
  /** GSAP ease — defaults to the registered exit CustomEase id. */
  ease?: string
}

/** Enter CustomEase id + SVG-path equivalent of cubic-bezier(0.2, 0, 0, 1). */
export const SHARED_AXIS_Z_ENTER_EASE_ID = 'sharedAxisZEnter'
export const SHARED_AXIS_Z_ENTER_EASE_PATH = 'M0,0 C0.2,0 0,1 1,1'

/** Exit CustomEase id + SVG-path equivalent of cubic-bezier(0.4, 0, 1, 1). */
export const SHARED_AXIS_Z_EXIT_EASE_ID = 'sharedAxisZExit'
export const SHARED_AXIS_Z_EXIT_EASE_PATH = 'M0,0 C0.4,0 1,1 1,1'

/**
 * Micro-delay (seconds) between the exit completing and the next enter starting,
 * after the host's textContent has been swapped (spec swap.micro_delay_ms 20).
 */
export const SHARED_AXIS_Z_MICRO_DELAY = 0.02

/**
 * `whole` target → no split. Return the text as a single animated unit so the
 * wrapper iterates a one-element array, mirroring the per-character helpers in
 * the rest of the motion lib without splitting anything.
 */
export function splitWhole(text: string): string[] {
  return [text]
}

/**
 * Enter vars — the incoming phrase zooms forward from { opacity 0, scale 0.9,
 * blur 2px } out to its settled, crisp state on the enter ease.
 */
export function buildSharedAxisZVars(input: SharedAxisZVarsInput = {}) {
  const {
    duration = 0.52,
    stagger = 0,
    scaleFrom = 0.9,
    blurFrom = 2,
    ease = SHARED_AXIS_Z_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, scale: scaleFrom, filter: `blur(${blurFrom}px)` },
    to: { opacity: 1, scale: 1, filter: 'blur(0px)', duration, stagger, ease },
  }
}

/**
 * Exit vars for the swap phase — the outgoing phrase zooms toward the viewer and
 * fades out, from settled to { opacity 0, scale 1.06, blur 1px } on the exit
 * ease. The swap wrapper tweens to this before swapping textContent and entering
 * the next phrase.
 */
export function buildSharedAxisZExitVars(input: SharedAxisZExitVarsInput = {}) {
  const {
    duration = 0.36,
    scaleTo = 1.06,
    blurTo = 1,
    ease = SHARED_AXIS_Z_EXIT_EASE_ID,
  } = input

  return {
    from: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    to: { opacity: 0, scale: scaleTo, filter: `blur(${blurTo}px)`, duration, ease },
  }
}
