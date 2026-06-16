/**
 * Pure helper: the top-left position that centers a floating element of the
 * given size on the pointer (viewport coordinates). Framework-free + DOM-free
 * so it is unit-testable; the <ImageFollowList> wrapper feeds the result to
 * gsap.quickTo() on the floating thumbnail.
 *
 * Clean-room reference: annnimate "Image Follow List" — behavior only.
 */
export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export function followOffset(pointer: Point, size: Size): Point {
  return { x: pointer.x - size.width / 2, y: pointer.y - size.height / 2 }
}
