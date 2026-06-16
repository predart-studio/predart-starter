/**
 * Pure scatter math for the MultiFlip effect. A stacked "deck" of N cards starts
 * gathered (a slight fan — small per-card offset + tilt) and, as a scrubbed
 * scroll progress goes 0 → 1, scatters outward to deterministic per-index target
 * positions (x/y/rotation), keeping scale and opacity constant. Framework-free +
 * DOM-free so it is unit-testable; the <MultiFlip> wrapper feeds each card's
 * result to gsap.set() inside a pinned, scrubbed ScrollTrigger onUpdate.
 *
 * The gathered fan and the scatter ring are both derived from the card index so
 * the effect works for any number of cards without hand-authored coordinates.
 *
 * Clean-room reference: annnimate "MultiFlip" — behavior only.
 */

export interface MultiFlipState {
  /** Horizontal translate in px. */
  x: number
  /** Vertical translate in px. */
  y: number
  /** Rotation in degrees. */
  rotation: number
  /** Scale (constant 1 — the observed effect does not scale). */
  scale: number
}

export interface MultiFlipConfig {
  /** Radius (px) the cards scatter out to at full progress. */
  spread?: number
  /** Max absolute tilt (deg) a scattered card can take. */
  maxRotation?: number
  /** Per-card vertical step (px) of the gathered fan at progress 0. */
  gatherStep?: number
}

export const DEFAULT_MULTI_FLIP: Required<MultiFlipConfig> = {
  spread: 320,
  maxRotation: 10,
  gatherStep: 14,
}

const TAU = Math.PI * 2

/** Deterministic pseudo-random in [0,1) from an integer seed (no global state). */
function seeded(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * The gathered (progress 0) resting transform for a card — a tight fan so the
 * deck reads as a stack with a little life, matching the studied rest state.
 */
export function multiFlipGathered(index: number, config: MultiFlipConfig = {}): MultiFlipState {
  const { gatherStep, maxRotation } = { ...DEFAULT_MULTI_FLIP, ...config }
  const centered = index - 0 // top card (0) is the anchor; rest fan down/right
  return {
    x: Math.round((seeded(index) - 0.5) * gatherStep * 2),
    y: centered * gatherStep,
    rotation: (seeded(index + 99) - 0.5) * 2 * (maxRotation * 0.4),
    scale: 1,
  }
}

/**
 * The scattered (progress 1) target transform for a card — spread around a ring,
 * angle and radius derived from the index so cards fan out to distinct spots.
 */
export function multiFlipScattered(
  index: number,
  count: number,
  config: MultiFlipConfig = {},
): MultiFlipState {
  const { spread, maxRotation } = { ...DEFAULT_MULTI_FLIP, ...config }
  const n = Math.max(1, count)
  // Distribute around the ring; jitter the radius per index so it is not a
  // perfect circle (matches the loose, hand-thrown scatter in the reference).
  const angle = (index / n) * TAU + seeded(index) * 0.9
  const radius = spread * (0.55 + seeded(index + 7) * 0.45)
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius * 0.7), // flatter than wide
    rotation: (seeded(index + 42) - 0.5) * 2 * maxRotation,
    scale: 1,
  }
}

/**
 * Interpolate a card's transform between its gathered and scattered states by a
 * scrubbed progress (0 = gathered stack, 1 = full scatter). Linear — the
 * reference is a plain scrub with no easing on the transforms.
 */
export function multiFlipState(
  progress: number,
  index: number,
  count: number,
  config: MultiFlipConfig = {},
): MultiFlipState {
  const p = Math.max(0, Math.min(1, progress))
  const g = multiFlipGathered(index, config)
  const s = multiFlipScattered(index, count, config)
  const lerp = (a: number, b: number) => a + (b - a) * p
  return {
    x: lerp(g.x, s.x),
    y: lerp(g.y, s.y),
    rotation: lerp(g.rotation, s.rotation),
    scale: lerp(g.scale, s.scale),
  }
}
