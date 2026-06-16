/**
 * Pure tooltip-motion helpers. Builds the GSAP "from" vars for the
 * scale + translateY + opacity entrance/exit of an anchored tooltip, and
 * derives the transform-origin / translate sign from the placement side.
 * Framework-free + DOM-free so it is unit-testable; the <MotionTooltip>
 * wrapper feeds the result to gsap.fromTo() / gsap.to().
 *
 * Behaviour observed on the live demo: the tooltip ANCHORS above its trigger
 * (it does not track the cursor). On show it scales 0.9 -> 1, slides 8px ->
 * 0 toward the trigger, and fades 0 -> 1 over ~0.28s with a power2.out feel.
 * On hide it reverses (scale -> 0.9, slide -> 8px, fade -> 0) with power2.in,
 * after a short ~90ms grace delay. transform-origin sits on the edge nearest
 * the trigger so it grows out of the anchor.
 *
 * Clean-room reference: annnimate "Tooltip" — behavior only.
 */

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipMotionInput {
  /** Which side of the trigger the tooltip sits on. Drives slide axis + origin. */
  side?: TooltipSide
  /** Scale the tooltip starts/ends at (hidden state). 1 = no scale. */
  scaleFrom?: number
  /** Px the tooltip is offset from its anchored position while hidden. */
  offset?: number
}

export const DEFAULT_TOOLTIP_SIDE: TooltipSide = 'top'
export const DEFAULT_TOOLTIP_SCALE_FROM = 0.9
export const DEFAULT_TOOLTIP_OFFSET = 8
export const DEFAULT_TOOLTIP_SHOW_DURATION = 0.28
export const DEFAULT_TOOLTIP_HIDE_DURATION = 0.28
export const DEFAULT_TOOLTIP_SHOW_EASE = 'power2.out'
export const DEFAULT_TOOLTIP_HIDE_EASE = 'power2.in'
/** Short grace delay before hiding, mirroring the demo's ~90ms close delay. */
export const DEFAULT_TOOLTIP_HIDE_DELAY = 0.09

/**
 * transform-origin for a given side — the tooltip grows out of the edge
 * nearest the trigger.
 */
export function tooltipTransformOrigin(side: TooltipSide): string {
  switch (side) {
    case 'top':
      return 'center bottom'
    case 'bottom':
      return 'center top'
    case 'left':
      return 'right center'
    case 'right':
      return 'left center'
  }
}

export interface TooltipHiddenVars {
  opacity: number
  scale: number
  x: number
  y: number
}

/**
 * The hidden/offset state. The tooltip is pushed AWAY from the trigger by
 * `offset` px along the axis perpendicular to the trigger edge:
 * - top    -> sits below its anchor (+y) so it slides up into place
 * - bottom -> sits above its anchor (-y) so it slides down into place
 * - left   -> sits right of its anchor (+x)
 * - right  -> sits left of its anchor (-x)
 */
export function buildTooltipHiddenVars(input: TooltipMotionInput = {}): TooltipHiddenVars {
  const {
    side = DEFAULT_TOOLTIP_SIDE,
    scaleFrom = DEFAULT_TOOLTIP_SCALE_FROM,
    offset = DEFAULT_TOOLTIP_OFFSET,
  } = input

  let x = 0
  let y = 0
  switch (side) {
    case 'top':
      y = offset
      break
    case 'bottom':
      y = -offset
      break
    case 'left':
      x = offset
      break
    case 'right':
      x = -offset
      break
  }

  return { opacity: 0, scale: scaleFrom, x, y }
}

export interface TooltipVisibleVars {
  opacity: number
  scale: number
  x: number
  y: number
}

/** The visible/settled state — fully shown, no offset, no scale. */
export function buildTooltipVisibleVars(): TooltipVisibleVars {
  return { opacity: 1, scale: 1, x: 0, y: 0 }
}
