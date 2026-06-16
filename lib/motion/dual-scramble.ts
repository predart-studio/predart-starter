/**
 * Pure GSAP ScrambleTextPlugin vars for the Dual Scramble effect. Like the base
 * scramble, but defaults to a glitchier symbol-rich character pool (observed on
 * the reference) and a shorter duration. Framework-free + DOM-free so it is
 * unit-testable; the <DualScramble> wrapper feeds these to gsap.to() on its
 * aria-hidden animated layer (the "dual" structure = visible animated layer +
 * an sr-only real-text layer for accessibility).
 *
 * Clean-room reference: good-fella.com "Dual Scramble" — behavior only (observed:
 * left-to-right reveal, symbol-heavy charset, triggers scroll/hover/click).
 */
export interface DualScrambleVarsInput {
  text: string
  chars?: string
  speed?: number
  revealDelay?: number
  duration?: number
}

// Mixed alnum + symbols → the glitchy look observed on the demo.
export const DEFAULT_DUAL_SCRAMBLE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>-_\\/[]{}=+*^?#&'

export const DEFAULT_DUAL_SCRAMBLE_DURATION = 0.6

export function buildDualScrambleVars(input: DualScrambleVarsInput) {
  const {
    text,
    chars = DEFAULT_DUAL_SCRAMBLE_CHARS,
    speed = 0.6,
    revealDelay = 0,
    duration = DEFAULT_DUAL_SCRAMBLE_DURATION,
  } = input

  return {
    duration,
    delay: revealDelay,
    ease: 'none' as const,
    scrambleText: { text, chars, speed, revealDelay: 0 },
  }
}
