/**
 * Pure accordion open-state logic. Given the current set of open panel indices
 * and the index a user just clicked, returns the next set — supporting both
 * single-open (clicking opens one, closes any other) and multi-open (each panel
 * toggles independently). Framework-free + DOM-free so it is unit-testable; the
 * <MotionAccordion> wrapper drives the height/icon tweens off the result.
 *
 * Reference: matched 1:1 against the official annnimate "Accordion" source.
 */

// Defaults mirror the official annnimate "Accordion" source exactly.

/** Open/close height + icon tween duration in seconds (source default 0.8). */
export const DEFAULT_ACCORDION_DURATION = 0.8

/** Single GSAP ease for the height + icon timeline, played/reversed (source). */
export const DEFAULT_ACCORDION_EASE = 'expo.inOut'

/** Icon rotation, in degrees, when a panel opens (source iconRotation -180). */
export const DEFAULT_ACCORDION_ICON_ROTATION = -180

/**
 * Body-text line-stagger reveal on open — SplitText lines slide up from behind a
 * line mask. Values mirror the source's stagger* defaults.
 */
export const DEFAULT_ACCORDION_STAGGER = {
  duration: 0.6,
  delay: 0.15,
  ease: 'expo.out',
  yPercent: 110,
  /** ms after the panel starts opening before the text staggers in. */
  startDelay: 200,
} as const

export interface NextOpenInput {
  /** Indices currently open. */
  open: readonly number[]
  /** Index the user clicked. */
  index: number
  /** Single-open (default): opening one closes the rest. Multi-open: independent. */
  multiple?: boolean
}

/**
 * Reducer: current open set + clicked index -> next open set.
 *
 * - Clicking an open panel always collapses it (in both modes).
 * - Single-open: clicking a closed panel opens it and closes every other.
 * - Multi-open: clicking a closed panel adds it; others stay as they are.
 *
 * The returned array is sorted ascending and never contains duplicates.
 */
export function nextOpenState({ open, index, multiple = false }: NextOpenInput): number[] {
  const isOpen = open.includes(index)

  if (isOpen) {
    // Collapse the clicked panel regardless of mode.
    return open.filter((i) => i !== index).sort((a, b) => a - b)
  }

  if (multiple) {
    return [...open, index].sort((a, b) => a - b)
  }

  // Single-open: only the clicked panel remains open.
  return [index]
}
