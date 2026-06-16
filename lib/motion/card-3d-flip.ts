/**
 * Pure math for the 3D card effect: maps a pointer position over the card to a
 * subtle tilt (rotateX / rotateY) clamped to a max angle, and builds the GSAP
 * vars for the flip-to-back rotation. Framework-free + DOM-free so it is
 * unit-testable; the <Card3DFlip> wrapper feeds the result to gsap.quickTo() /
 * gsap.to().
 *
 * Observed behavior (default mode): hovering the card tilts it toward the
 * cursor — top of the card pitches to a positive rotateX, the right edge yaws to
 * a positive rotateY — while it scales up slightly. Tilt is small and smoothed;
 * leaving the card eases everything back to rest. An optional flip mode spins
 * the card 180° about Y to reveal its back face.
 *
 * Clean-room reference: annnimate "Card3DFlip" — behavior only.
 */
export interface Point {
  x: number
  y: number
}

export interface RectLike {
  left: number
  top: number
  width: number
  height: number
}

export interface Tilt {
  /** Pitch about the X axis, in degrees. */
  rotateX: number
  /** Yaw about the Y axis, in degrees. */
  rotateY: number
}

/** Max pitch (deg) at the top/bottom edges of the card. */
export const DEFAULT_TILT_MAX_X = 5
/** Max yaw (deg) at the left/right edges of the card. */
export const DEFAULT_TILT_MAX_Y = 4
/** Scale the card grows to while hovered. */
export const DEFAULT_HOVER_SCALE = 1.1
/** CSS perspective depth (px) on the card container. */
export const DEFAULT_PERSPECTIVE = 500
/** Flip rotation (deg) about Y to reveal the back face. */
export const DEFAULT_FLIP_ROTATION = 180
/** Flip duration (s). */
export const DEFAULT_FLIP_DURATION = 0.7
/** Flip ease. */
export const DEFAULT_FLIP_EASE = 'power3.inOut'

export interface ComputeTiltInput {
  pointer: Point
  rect: RectLike
  maxX?: number
  maxY?: number
}

/**
 * Map a pointer position over the card to a tilt. The pointer is normalized to
 * [-1, 1] across each axis of the rect (center = 0), then scaled by the max
 * angle and clamped. Pointer above center → positive rotateX (top tips back);
 * pointer right of center → positive rotateY.
 */
export function computeTilt({
  pointer,
  rect,
  maxX = DEFAULT_TILT_MAX_X,
  maxY = DEFAULT_TILT_MAX_Y,
}: ComputeTiltInput): Tilt {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  // normalized offset in [-1, 1] (clamped so out-of-bounds pointers saturate)
  const nx = clamp((pointer.x - centerX) / (rect.width / 2), -1, 1)
  const ny = clamp((pointer.y - centerY) / (rect.height / 2), -1, 1)
  return {
    // pointer above center (ny < 0) → top tips back → positive rotateX
    // `+ 0` normalizes -0 to 0 so center reads as a clean zero
    rotateX: -ny * maxX + 0,
    // pointer right of center (nx > 0) → positive rotateY
    rotateY: nx * maxY + 0,
  }
}

export interface FlipVarsInput {
  rotation?: number
  duration?: number
  ease?: string
}

/** Build the gsap.to vars that flip the card to its back face. */
export function buildFlipVars({
  rotation = DEFAULT_FLIP_ROTATION,
  duration = DEFAULT_FLIP_DURATION,
  ease = DEFAULT_FLIP_EASE,
}: FlipVarsInput = {}) {
  return { rotateY: rotation, duration, ease }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
