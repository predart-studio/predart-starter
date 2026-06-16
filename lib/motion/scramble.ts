/**
 * Pure construction of GSAP ScrambleTextPlugin tween vars.
 * Framework-free + DOM-free so it is unit-testable; the <TextScramble>
 * wrapper feeds these vars to gsap.to().
 *
 * Reference behavior (clean-room): annnimate "Text Scramble" / "Dual Scramble".
 * Implementation is standard ScrambleTextPlugin usage — see gsap-plugins skill.
 */
export interface ScrambleVarsInput {
  /** Final, settled text the scramble resolves to. */
  text: string
  /** Character pool: a preset ('upperCase' | 'lowerCase' | 'upperAndLowerCase') or a literal set like '01'. */
  chars?: string
  /** ScrambleText speed (higher = faster cycling). */
  speed?: number
  /** Seconds before the tween starts. */
  revealDelay?: number
  /** Tween duration in seconds. */
  duration?: number
}

export const DEFAULT_SCRAMBLE_CHARS = 'upperCase'

export function buildScrambleVars(input: ScrambleVarsInput) {
  const {
    text,
    chars = DEFAULT_SCRAMBLE_CHARS,
    speed = 0.5,
    revealDelay = 0,
    duration = 1.1,
  } = input

  return {
    duration,
    delay: revealDelay,
    ease: 'none' as const,
    scrambleText: { text, chars, speed, revealDelay: 0 },
  }
}
