/**
 * Pure math for the Velocity Clip effect. Maps scroll velocity to a signed
 * shear amount (clamped), and builds the clip-path polygon for that shear — at
 * rest a clean rectangle, under fast scroll a sheared "drag". Framework-free +
 * DOM-free so it is unit-testable; the <VelocityClip> wrapper reads
 * ScrollTrigger velocity and tweens the figure's clip-path to this polygon.
 *
 * Clean-room reference: annnimate "Velocity Clip" — behavior only (observed:
 * clip-path corners shear with scroll velocity, settle to a rectangle at rest).
 */
export interface VelocityShearOpts {
  /** Larger = less shear per unit velocity. */
  sensitivity?: number
  /** Max shear in percent of the figure's height. */
  maxShear?: number
}

export const DEFAULT_VELOCITY_CLIP = { sensitivity: 300, maxShear: 8 }

/** Velocity (px/s, signed) → shear percent (signed, clamped). */
export function velocityToShear(
  velocity: number,
  opts: VelocityShearOpts = {},
): number {
  const {
    sensitivity = DEFAULT_VELOCITY_CLIP.sensitivity,
    maxShear = DEFAULT_VELOCITY_CLIP.maxShear,
  } = opts
  const raw = velocity / sensitivity
  return Math.max(-maxShear, Math.min(maxShear, raw))
}

/** Build a 4-point clip-path polygon for a given signed shear percent. */
export function buildClipPolygon(shear: number): string {
  const a = Math.max(0, shear)
  const b = Math.max(0, -shear)
  return `polygon(0% ${a}%, 100% ${b}%, 100% ${100 - a}%, 0% ${100 - b}%)`
}

export const RECT_CLIP = buildClipPolygon(0)
