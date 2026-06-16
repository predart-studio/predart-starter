/**
 * Pure accordion open-state logic. Given the current set of open panel indices
 * and the index a user just clicked, returns the next set — supporting both
 * single-open (clicking opens one, closes any other) and multi-open (each panel
 * toggles independently). Framework-free + DOM-free so it is unit-testable; the
 * <MotionAccordion> wrapper drives the height/chevron tweens off the result.
 *
 * Clean-room reference: annnimate "Accordion" — behavior only.
 */

/** Open/close height tween duration in seconds (matches the studied ~0.4s feel). */
export const DEFAULT_ACCORDION_DURATION = 0.4

/** GSAP ease for the expand (height 0 -> auto). */
export const DEFAULT_ACCORDION_EASE_OPEN = 'power2.out'

/** GSAP ease for the collapse (height auto -> 0). */
export const DEFAULT_ACCORDION_EASE_CLOSE = 'power2.in'

/** Chevron rotation, in degrees, when a panel is open (studied: 0 -> 180). */
export const DEFAULT_ACCORDION_CHEVRON_DEG = 180

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
