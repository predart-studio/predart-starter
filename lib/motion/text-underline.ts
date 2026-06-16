/**
 * Pure state/vars builder for a scaleX underline wipe. Framework-free + DOM-free
 * so it is unit-testable; the <TextUnderline> wrapper feeds these to
 * gsap.to(bar, ...) on hover/leave (and ScrollTrigger for the scroll trigger).
 *
 * Studied behavior: a 1px bar spanning the text width is driven purely by
 * `scaleX`. At rest it is collapsed (scaleX 0) with its transform-origin on the
 * RIGHT. On reveal the origin flips to the LEFT and scaleX tweens 0 -> 1, so the
 * line draws in left-to-right. On hide the origin flips back to the RIGHT and
 * scaleX tweens 1 -> 0, so the line retracts off to the right — giving the
 * continuous "travels rightward" feel. Reveal/hide share the same duration/ease.
 *
 * Clean-room reference: annnimate "TextUnderline" — behavior only.
 */

/** transform-origin x for each phase: reveal grows from the left, hide collapses to the right. */
export const UNDERLINE_ORIGIN_REVEAL = 'left' as const
export const UNDERLINE_ORIGIN_HIDE = 'right' as const

export const DEFAULT_UNDERLINE_DURATION = 0.4
/** cubic-bezier(0.16, 1, 0.3, 1) ≈ easeOutExpo, observed on the live demo. */
export const DEFAULT_UNDERLINE_EASE = 'expo.out'

export interface UnderlineVarsInput {
  /** 'reveal' draws the bar in (0 -> 1); 'hide' retracts it (-> 0). */
  phase: 'reveal' | 'hide'
  duration?: number
  ease?: string
}

export interface UnderlineVars {
  /** transformOrigin to set BEFORE the tween so the bar grows/collapses from the right side. */
  transformOrigin: typeof UNDERLINE_ORIGIN_REVEAL | typeof UNDERLINE_ORIGIN_HIDE
  /** target scaleX for this phase. */
  scaleX: number
  duration: number
  ease: string
}

/**
 * Build the gsap vars for one phase of the underline wipe.
 * The wrapper sets `transformOrigin` first, then tweens `scaleX`.
 */
export function buildUnderlineVars(input: UnderlineVarsInput): UnderlineVars {
  const {
    phase,
    duration = DEFAULT_UNDERLINE_DURATION,
    ease = DEFAULT_UNDERLINE_EASE,
  } = input

  const reveal = phase === 'reveal'
  return {
    transformOrigin: reveal ? UNDERLINE_ORIGIN_REVEAL : UNDERLINE_ORIGIN_HIDE,
    scaleX: reveal ? 1 : 0,
    duration,
    ease,
  }
}
