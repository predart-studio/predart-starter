/**
 * Pure GSAP vars-builder for a generic element entrance reveal. Maps a
 * `direction` + `distance` into the FROM transform (the off-screen start state)
 * that gsap.from() animates out of, settling to opacity 1 / no offset.
 * Framework-free + DOM-free so it is unit-testable; the <ElementReveal> wrapper
 * feeds the result to gsap.from().
 *
 * Clean-room reference: annnimate "ElementReveal" — behavior only.
 */
export type RevealDirection = 'up' | 'down' | 'left' | 'right'

export interface ElementRevealInput {
  direction?: RevealDirection
  /** Travel distance in px the element covers as it settles in. */
  distance?: number
  duration?: number
  ease?: string
  /** Per-child stagger (s) when the wrapper reveals grouped children. */
  stagger?: number
}

export const DEFAULT_REVEAL_DIRECTION: RevealDirection = 'up'
export const DEFAULT_REVEAL_DISTANCE = 50
export const DEFAULT_REVEAL_DURATION = 0.6
export const DEFAULT_REVEAL_EASE = 'power2.out'
export const DEFAULT_REVEAL_STAGGER = 0.08

/**
 * Maps a direction to the signed FROM-offset on the correct axis.
 * 'up'    -> element starts BELOW (y: +distance) and rises up.
 * 'down'  -> element starts ABOVE (y: -distance) and drops down.
 * 'left'  -> element starts to the RIGHT (x: +distance) and slides left.
 * 'right' -> element starts to the LEFT  (x: -distance) and slides right.
 */
export function directionOffset(
  direction: RevealDirection,
  distance: number,
): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance }
    case 'down':
      return { x: 0, y: -distance }
    case 'left':
      return { x: distance, y: 0 }
    case 'right':
      return { x: -distance, y: 0 }
  }
}

/**
 * Build the gsap.from() vars: the hidden start state (offset + opacity 0) plus
 * timing. Only the moving axis is included so we don't pin the other to 0.
 */
export function buildElementRevealVars(input: ElementRevealInput = {}) {
  const {
    direction = DEFAULT_REVEAL_DIRECTION,
    distance = DEFAULT_REVEAL_DISTANCE,
    duration = DEFAULT_REVEAL_DURATION,
    ease = DEFAULT_REVEAL_EASE,
    stagger = DEFAULT_REVEAL_STAGGER,
  } = input

  const { x, y } = directionOffset(direction, distance)

  const vars: {
    opacity: number
    duration: number
    ease: string
    stagger: number
    x?: number
    y?: number
  } = { opacity: 0, duration, ease, stagger }

  if (x !== 0) vars.x = x
  if (y !== 0) vars.y = y

  return vars
}
