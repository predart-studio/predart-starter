/**
 * Pure config for the RainbowButton effect. The visible animation is a 5-color
 * linear gradient whose `background-position` slides continuously across an
 * over-sized track (background-size 200%), producing a rolling rainbow border +
 * blurred glow. Framework-free + DOM-free so it is unit-testable; the
 * <RainbowButton> wrapper feeds the result to a looping gsap.to() that tweens
 * `--rainbow-pos` from 0% to the track width and repeats forever (ease 'none').
 *
 * Observed on the live demo: 90deg gradient, background-size 200%,
 * background-position sweeping 0% -> 200% over a 2s linear loop, always-on (no
 * hover scale, no transform, no rotation). A ::before-style copy carries the
 * same gradient blurred (~12.8px) as the glow.
 *
 * Clean-room reference: annnimate "RainbowButton" — behavior only.
 */
export interface RainbowButtonInput {
  /** Seconds for one full gradient sweep (one loop). */
  period?: number
  /** Gradient track width as a percentage; the position sweeps 0 -> this. */
  trackWidth?: number
}

/** Default loop period in seconds (matches the 2s observed on the demo). */
export const DEFAULT_RAINBOW_PERIOD = 2

/** Default gradient track width (%) — background-size is 200%, so it sweeps 0->200. */
export const DEFAULT_RAINBOW_TRACK_WIDTH = 200

/** The 5 stops observed on the demo, left to right. */
export const DEFAULT_RAINBOW_COLORS = [
  '#ff4242',
  '#a1ff42',
  '#42a1ff',
  '#42d0ff',
  '#a166ff',
] as const

export interface RainbowButtonVars {
  /** gsap target value for the animated CSS var, e.g. '200%'. */
  '--rainbow-pos': string
  duration: number
  ease: 'none'
  repeat: number
}

/**
 * Build the gsap vars for the looping background-position sweep. The wrapper
 * sets the CSS var to '0%' first, then tweens it to `trackWidth%` over `period`
 * seconds, linearly, forever.
 */
export function buildRainbowButtonVars(
  input: RainbowButtonInput = {},
): RainbowButtonVars {
  const {
    period = DEFAULT_RAINBOW_PERIOD,
    trackWidth = DEFAULT_RAINBOW_TRACK_WIDTH,
  } = input

  const safePeriod = period > 0 ? period : DEFAULT_RAINBOW_PERIOD
  const safeTrack = Number.isFinite(trackWidth) ? trackWidth : DEFAULT_RAINBOW_TRACK_WIDTH

  return {
    '--rainbow-pos': `${safeTrack}%`,
    duration: safePeriod,
    ease: 'none',
    repeat: -1,
  }
}
