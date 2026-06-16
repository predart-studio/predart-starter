/**
 * Pure wave model for the TextShimmerWave effect. A sinusoidal "crest" of
 * brightness/lift travels char-by-char across the text and loops forever. Given
 * a character index and the total count, this computes that char's phase offset
 * within the loop (the wave) plus the timeline `repeat`/`stagger` knobs the
 * wrapper feeds to gsap. Framework-free + DOM-free so it is unit-testable; the
 * <TextShimmerWave> wrapper turns the offsets into a repeating gsap timeline.
 *
 * Observed on the live demo (16 chars): one full sine wave spans the whole
 * string (crest at char 0, trough ~halfway), the crest advances one char every
 * ~period/count seconds, and the loop wraps after ~2.0s. Brightness oscillated
 * via color (theme-dependent); this port drives opacity + lift + scale instead
 * so it stays theme-neutral.
 *
 * Clean-room reference: annnimate "TextShimmerWave" — behavior only.
 */

export interface ShimmerWaveInput {
  /** Number of characters in the text. */
  count: number
  /** Seconds for the crest to travel the whole string once (full loop). */
  period?: number
  /**
   * How many full sine waves are visible across the text at once. 1 = a single
   * crest+trough spanning the string (matches the studied demo).
   */
  waves?: number
}

/** Full loop period in seconds — crest travels the whole string and wraps. */
export const DEFAULT_SHIMMER_PERIOD = 2

/** Visible sine waves across the text at once (one crest spans the string). */
export const DEFAULT_SHIMMER_WAVES = 1

/** Opacity at the wave trough (crest stays at 1). */
export const DEFAULT_SHIMMER_MIN_OPACITY = 0.4

/** Upward "pop" in px at the wave crest (negative y). */
export const DEFAULT_SHIMMER_LIFT = 4

/** Scale at the wave crest (1 at the trough). */
export const DEFAULT_SHIMMER_SCALE = 1.04

const TAU = Math.PI * 2

/**
 * Phase offset (in seconds, within one `period`) at which a given character
 * reaches its crest. Index 0 crests at t=0; each subsequent char crests later
 * so the wave appears to travel left→right. With `waves = 1` the offset spans
 * the full period across the string.
 */
export function charPhaseOffset(
  index: number,
  count: number,
  period: number = DEFAULT_SHIMMER_PERIOD,
  waves: number = DEFAULT_SHIMMER_WAVES,
): number {
  if (count <= 0) return 0
  // Each char is shifted by (waves / count) of the loop, wrapped into [0, period).
  const fraction = ((index * waves) / count) % 1
  return fraction * period
}

/**
 * The per-char wave phase in radians (0 = crest). Useful for tests and for any
 * consumer that wants the sinusoidal position directly.
 */
export function charPhaseRadians(
  index: number,
  count: number,
  waves: number = DEFAULT_SHIMMER_WAVES,
): number {
  if (count <= 0) return 0
  return (((index * waves) / count) % 1) * TAU
}

export interface ShimmerWavePlan {
  /** Total loop length in seconds. */
  period: number
  /** Per-char crest offsets within the loop, in seconds. */
  offsets: number[]
}

/**
 * Build the full wave plan for a string of `count` chars: the loop period plus
 * one crest-offset per character. The wrapper places each char's tween at its
 * offset on a `repeat: -1` timeline.
 */
export function buildShimmerWavePlan(input: ShimmerWaveInput): ShimmerWavePlan {
  const {
    count,
    period = DEFAULT_SHIMMER_PERIOD,
    waves = DEFAULT_SHIMMER_WAVES,
  } = input

  const offsets: number[] = []
  for (let i = 0; i < count; i++) {
    offsets.push(charPhaseOffset(i, count, period, waves))
  }
  return { period, offsets }
}
