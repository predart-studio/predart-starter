/**
 * Pure geometry for the icon-button masked swap. The button clips a small
 * square mask around its icon; two identical icons are stacked inside. At rest
 * the primary sits centered (0,0) and a duplicate waits just outside the mask
 * on the opposite diagonal corner. On hover both icons travel the SAME vector
 * along the mask diagonal: the primary exits one corner while the duplicate
 * slides into its place. This module computes those rest/hover offsets (in px)
 * plus the shared tween vars; the <IconButton> wrapper feeds them to gsap.to().
 * Framework-free + DOM-free so it is unit-testable.
 *
 * Clean-room reference: annnimate "IconButton" — behavior only.
 */

export type SwapDirection = 'up-right' | 'down-right' | 'up-left' | 'down-left'

export interface IconSwapInput {
  /** Mask/icon size in px — the swap travel distance per axis. */
  size?: number
  /** Diagonal the primary icon exits toward on hover. */
  direction?: SwapDirection
}

export interface IconSwapOffset {
  x: number
  y: number
}

export interface IconSwapGeometry {
  /** Where the primary icon sits at rest and travels TO on hover. */
  primaryRest: IconSwapOffset
  primaryHover: IconSwapOffset
  /** Where the duplicate waits at rest (outside mask) and travels TO on hover. */
  duplicateRest: IconSwapOffset
  duplicateHover: IconSwapOffset
}

export const DEFAULT_ICON_SIZE = 20
export const DEFAULT_SWAP_DIRECTION: SwapDirection = 'up-right'
export const DEFAULT_SWAP_DURATION = 0.5
export const DEFAULT_SWAP_EASE = 'power3.inOut'

/** Unit vector for the primary icon's exit, per diagonal. y is screen-space (down = +). */
function directionVector(direction: SwapDirection): IconSwapOffset {
  switch (direction) {
    case 'up-right':
      return { x: 1, y: -1 }
    case 'down-right':
      return { x: 1, y: 1 }
    case 'up-left':
      return { x: -1, y: -1 }
    case 'down-left':
      return { x: -1, y: 1 }
  }
}

/**
 * Compute the four icon offsets for a masked diagonal swap. The duplicate
 * starts on the OPPOSITE corner (so it slides in from where the primary leaves
 * from), then both end shifted by the same exit vector.
 */
export function computeIconSwap(input: IconSwapInput = {}): IconSwapGeometry {
  const { size = DEFAULT_ICON_SIZE, direction = DEFAULT_SWAP_DIRECTION } = input
  const v = directionVector(direction)
  const dx = v.x * size
  const dy = v.y * size

  return {
    primaryRest: { x: 0, y: 0 },
    primaryHover: { x: dx, y: dy },
    // duplicate waits at the inverse corner, then lands where primary started
    duplicateRest: { x: -dx, y: -dy },
    duplicateHover: { x: 0, y: 0 },
  }
}

/** Shared gsap tween vars for the swap (both icons share duration/ease). */
export function buildIconSwapVars(input: { duration?: number; ease?: string } = {}) {
  const { duration = DEFAULT_SWAP_DURATION, ease = DEFAULT_SWAP_EASE } = input
  return { duration, ease }
}
