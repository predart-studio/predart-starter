/**
 * Pure geometry for the GooeyMenu fan-out. Given an item's index and the total
 * item count, returns the open-state translation (x, y in px) of that action
 * button relative to the FAB center — items fan along an arc of `spread` degrees,
 * centered on straight-up (90°), at a fixed `radius`. Closed state is the origin
 * (0, 0) for every item. Framework-free + DOM-free so it is unit-testable; the
 * <GooeyMenu> wrapper feeds the result to gsap.to() per item.
 *
 * Observed (annnimate sandbox, 5 items): radius 70px, items at 10° / 50° / 90° /
 * 130° / 170° — i.e. a 160° arc centered on 90°, 40° apart. Screen y is inverted
 * (up is negative), so y = -radius·sin(angle).
 *
 * Clean-room reference: annnimate "GooeyMenu" — behavior only.
 */
export interface GooeyItemInput {
  /** Zero-based index of this item. */
  index: number
  /** Total number of action items in the cluster. */
  count: number
  /** Distance each item travels from the FAB center, in px. */
  radius?: number
  /** Total angular spread of the fan, in degrees. */
  spread?: number
  /** Center angle of the fan, in degrees (90 = straight up). */
  centerAngle?: number
}

export interface GooeyOffset {
  x: number
  y: number
}

/** Distance (px) each action item travels out from the FAB center. */
export const DEFAULT_GOOEY_RADIUS = 70
/** Total angular spread of the fan, in degrees (arc the items sweep). */
export const DEFAULT_GOOEY_SPREAD = 160
/** Center angle of the fan, in degrees — 90 points straight up. */
export const DEFAULT_GOOEY_CENTER_ANGLE = 90
/** Per-item stagger (s) as the cluster expands / collapses. */
export const DEFAULT_GOOEY_STAGGER = 0.05
/** Open/close tween duration (s). */
export const DEFAULT_GOOEY_DURATION = 0.45
/** Snappy-then-settle ease for the travel. */
export const DEFAULT_GOOEY_EASE = 'back.out(1.7)'
/** FAB icon rotation (deg) when open — observed 45°. */
export const DEFAULT_GOOEY_FAB_ROTATION = 45
/** SVG feGaussianBlur stdDeviation that produces the goo merge. */
export const DEFAULT_GOOEY_BLUR = 10
/** feColorMatrix alpha-channel row that snaps the blurred edges back to a blob. */
export const DEFAULT_GOOEY_COLOR_MATRIX =
  '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10'

/**
 * Open-state translation for one item. With `count` items spread evenly across
 * `spread` degrees centered on `centerAngle`, item `index` sweeps clockwise from
 * `centerAngle + spread/2` (DOM order matches the live demo: index 0 is the
 * leftmost item), so angle = `centerAngle + spread/2 - index·step`, where
 * step = spread/(count-1). A single item sits dead-center.
 */
export function computeGooeyItemOffset(input: GooeyItemInput): GooeyOffset {
  const {
    index,
    count,
    radius = DEFAULT_GOOEY_RADIUS,
    spread = DEFAULT_GOOEY_SPREAD,
    centerAngle = DEFAULT_GOOEY_CENTER_ANGLE,
  } = input

  const step = count > 1 ? spread / (count - 1) : 0
  const angleDeg = count > 1 ? centerAngle + spread / 2 - index * step : centerAngle
  const angleRad = (angleDeg * Math.PI) / 180

  return {
    x: radius * Math.cos(angleRad),
    y: -radius * Math.sin(angleRad), // screen y is inverted (up = negative)
  }
}
