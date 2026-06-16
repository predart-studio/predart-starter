/**
 * Pure odometer math for the Counter effect. Formats an integer with thousands
 * separators, splits it into render tokens (digits + separators), and computes
 * the vertical strip offset for a given digit. Framework-free + DOM-free so it
 * is unit-testable; the <Counter> wrapper feeds the results to gsap.to().
 *
 * Clean-room reference: annnimate "Counter" — behavior only.
 */

// Observed on the reference demo: data-anm-duration="2.5", thousands grouped by ",".
export const DEFAULT_COUNTER = { duration: 2.5, separator: ',' } as const

/** Formats an integer with grouped thousands, e.g. 10482 → "10,482". */
export function formatThousands(value: number, separator = ','): string {
  const sign = value < 0 ? '-' : ''
  const digits = Math.abs(Math.trunc(value)).toString()
  let out = ''
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += separator
    out += digits[i]
  }
  return sign + out
}

/**
 * Splits a value into single-character render tokens — digits and separators in
 * display order, e.g. 10482 → ['1','0',',','4','8','2'].
 */
export function toTokens(value: number, separator = ','): string[] {
  return Array.from(formatThousands(value, separator))
}

/**
 * yPercent offset for a 0–9 vertical strip. The strip stacks digits 0..9, so its
 * own height is 10 cells and one cell = 10% of the strip. `yPercent`/CSS
 * translateY percentages are relative to the strip's OWN height, so landing on
 * `digit` shifts it up by `digit * 10`%. Returns -digit * 10.
 */
export function digitRollY(digit: number): number {
  return digit === 0 ? 0 : -digit * 10
}
