/**
 * FlipZone layout logic — picks which zone a shared media element belongs to for
 * a given scroll progress, and builds the GSAP Flip.from() vars used to morph it
 * between zones. Framework-free + DOM-free so it is unit-testable; the <FlipZone>
 * wrapper feeds the result to Flip.from() under a scrubbed ScrollTrigger.
 *
 * Observed behavior (annnimate "FlipZone"): a single media card lives in zone 1
 * (larger, tilted ~10deg) and, as the page scrolls, FLIPs into zone 2 (smaller,
 * upright 0deg). The transition is scrubbed to scroll — intermediate frames track
 * scroll position with no eased snap (ease "none"). Under reduced motion the card
 * never flips; it renders statically in its natural position.
 *
 * Clean-room reference: annnimate "FlipZone" — behavior only.
 */

export type FlipZoneIndex = 0 | 1

export interface FlipZoneConfig {
  /** Number of zones the media can occupy (>= 2). */
  zoneCount?: number
  /** Scroll progress (0..1) at which the media leaves zone 0 and begins flipping. */
  flipStart?: number
  /** Scroll progress (0..1) at which the media has fully settled into the last zone. */
  flipEnd?: number
}

/** Scrub-linked: no eased snap, position tracks scroll 1:1 (matches studied frames). */
export const DEFAULT_FLIP_ZONE_EASE = 'none'

/** Flip.from() vars for a scrubbed zone-to-zone morph (no duration — driven by scrub). */
export const DEFAULT_FLIP_ZONE_VARS = {
  ease: DEFAULT_FLIP_ZONE_EASE,
  /** Animate via position:absolute so the card can leave normal flow mid-flip. */
  absolute: true,
  /** Scale (incl. rotation) to fit the destination zone — preserves the tilt morph. */
  scale: true,
} as const

/** Default scroll window: media holds in zone 0 until 60% scrolled, then flips by 100%. */
export const DEFAULT_FLIP_ZONE_CONFIG: Required<FlipZoneConfig> = {
  zoneCount: 2,
  flipStart: 0.6,
  flipEnd: 1,
}

/** Clamp helper (no gsap dependency in the pure layer). */
function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

/**
 * Which zone the media should occupy at a given scroll progress.
 * Below flipStart it sits in zone 0; at/after flipEnd it sits in the last zone;
 * in between it maps linearly across the available zones (for 2 zones this is a
 * single boundary at the midpoint of the flip window).
 */
export function zoneForProgress(progress: number, config: FlipZoneConfig = {}): FlipZoneIndex {
  const { zoneCount, flipStart, flipEnd } = { ...DEFAULT_FLIP_ZONE_CONFIG, ...config }
  const lastZone = Math.max(1, zoneCount - 1)
  const p = clamp01(progress)
  if (p < flipStart) return 0 as FlipZoneIndex
  if (p >= flipEnd) return lastZone as FlipZoneIndex
  const span = flipEnd - flipStart || 1
  const local = (p - flipStart) / span // 0..1 within the flip window
  // round to the nearest zone boundary; for 2 zones, flip at the window midpoint
  const idx = Math.round(local * lastZone)
  return Math.min(lastZone, Math.max(0, idx)) as FlipZoneIndex
}

/** Build the Flip.from() vars, merging caller overrides over the studied defaults. */
export function buildFlipZoneVars(overrides: { ease?: string; absolute?: boolean; scale?: boolean } = {}) {
  return { ...DEFAULT_FLIP_ZONE_VARS, ...overrides }
}
