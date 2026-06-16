/**
 * MorphingDialog motion logic — builds the GSAP Flip.from() vars that morph a
 * trigger card into an expanded dialog (and back), plus the tiny open/close state
 * helpers worth isolating. Framework-free + DOM-free so it is unit-testable; the
 * <MorphingDialog> wrapper captures Flip.getState() on the shared card, toggles
 * React state to reparent/resize it, then feeds these vars to Flip.from().
 *
 * Observed behavior (annnimate "MorphingDialog"): clicking a 320x457 product card
 * morphs the SAME card element (shared-element / FLIP) into a centered, fixed
 * ~700x810 dialog over a dimmed backdrop. The expand is fast and snappy (~0.3-0.45s,
 * eased ease-in-out — not linear), the close reverses the same morph back to the
 * card rect, and a backdrop fades in/out alongside. The trigger card is kept in the
 * DOM at opacity 0 while open (a shared clone owns the visible morph). Under reduced
 * motion the dialog opens/closes instantly with no morph; the backdrop still appears.
 *
 * Clean-room reference: annnimate "MorphingDialog" — behavior only.
 */

/** Snappy ease-in-out for the layout morph (matches the studied expand feel). */
export const DEFAULT_MORPH_EASE = 'power3.inOut'

/** Morph duration in seconds (studied expand settled by ~0.1-0.4s; 0.4 reads well). */
export const DEFAULT_MORPH_DURATION = 0.4

/** Backdrop fade duration in seconds (tracks the morph; slightly faster feels crisp). */
export const DEFAULT_BACKDROP_FADE = 0.3

/** Backdrop dim color observed on the live demo (~50% black overlay). */
export const DEFAULT_BACKDROP_COLOR = 'rgba(10, 10, 10, 0.5)'

export interface MorphVarsInput {
  /** Tween duration (s). */
  duration?: number
  /** GSAP ease string. */
  ease?: string
  /**
   * Animate the morphing element via position:absolute during the flip so it can
   * leave normal flow and travel between the card slot and the centered dialog.
   */
  absolute?: boolean
  /** Scale (incl. nested children) to fit the destination box instead of stretching. */
  scale?: boolean
  /** Optional onComplete passthrough (e.g. to drop will-change / focus the dialog). */
  onComplete?: () => void
}

/**
 * Build the Flip.from() vars for the card <-> dialog morph. Returns a plain object
 * (no GSAP import in the pure layer) merging caller overrides over the studied
 * defaults; the wrapper spreads this straight into Flip.from(state, vars).
 */
export function buildMorphVars(input: MorphVarsInput = {}) {
  const {
    duration = DEFAULT_MORPH_DURATION,
    ease = DEFAULT_MORPH_EASE,
    absolute = true,
    scale = true,
    onComplete,
  } = input

  const vars: {
    duration: number
    ease: string
    absolute: boolean
    scale: boolean
    onComplete?: () => void
  } = { duration, ease, absolute, scale }

  if (onComplete) vars.onComplete = onComplete
  return vars
}

/** Build the backdrop fade-in vars (opacity 0 -> 1). */
export function buildBackdropInVars(
  input: { duration?: number; ease?: string } = {},
): { opacity: number; duration: number; ease: string } {
  const { duration = DEFAULT_BACKDROP_FADE, ease = 'power2.out' } = input
  return { opacity: 1, duration, ease }
}

/** Build the backdrop fade-out vars (opacity -> 0). */
export function buildBackdropOutVars(
  input: { duration?: number; ease?: string } = {},
): { opacity: number; duration: number; ease: string } {
  const { duration = DEFAULT_BACKDROP_FADE, ease = 'power2.in' } = input
  return { opacity: 0, duration, ease }
}

/**
 * Pure next-state for the dialog toggle. Centralized so the wrapper and tests agree
 * on the open/close contract (click trigger -> open; Escape / backdrop / close
 * button -> close). `force` lets callers pin a target state.
 */
export function nextDialogState(current: boolean, force?: boolean): boolean {
  return typeof force === 'boolean' ? force : !current
}
