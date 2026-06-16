/**
 * Pure drift math for the MeshGradient effect. Each color blob orbits a base
 * anchor point on a slow elliptical (Lissajous) path; `meshBlobOffset(t)` maps
 * a loop progress 0..1 to a normalised x/y offset in [-amount, +amount], so the
 * blobs gently wander and the soft radial-gradient stack reads as a morphing
 * mesh. Framework-free + DOM-free so it is unit-testable; the <MeshGradient>
 * wrapper feeds a tweened progress proxy through these to update CSS vars on a
 * forever-looping gsap timeline (ease 'none').
 *
 * Observed on the live demo: a three.js r169 WebGL fragment shader (NOT DOM) —
 * three soft color blobs (orange top-center #fb923c, pink bottom-left #f9a8d4,
 * purple right #a855f7) that drift and warp continuously and very slowly
 * (data-anm-speed 1.5). This module powers an honest DOM approximation: drifting
 * blurred radial-gradient blobs. See the DEGRADED note in the component.
 *
 * Clean-room reference: annnimate "MeshGradient" — behavior only.
 */

export interface MeshBlob {
  /** Display color (any CSS color). */
  color: string
  /** Base anchor as viewport fractions, 0..1 (e.g. [0.3, 0.2] = upper-left). */
  base: [number, number]
  /** Phase offset (0..1) so blobs don't drift in lockstep. */
  phase: number
  /**
   * Per-axis orbit frequency multipliers (integers give closed Lissajous loops
   * over the shared period). Defaults to [1, 1] (a slow ellipse).
   */
  freq?: [number, number]
}

/** Default loop period in seconds — one full drift cycle (slow, matches demo). */
export const DEFAULT_MESH_PERIOD = 16

/** Default drift amount as a viewport fraction (how far each blob wanders). */
export const DEFAULT_MESH_DRIFT = 0.12

/** Default blur radius (px) applied to the blob layer for the soft mesh look. */
export const DEFAULT_MESH_BLUR = 80

/**
 * The 3 stops observed on the demo (pink / purple / orange = Tailwind
 * pink-300 / purple-500 / orange-400), positioned to match the rendered frame:
 * orange top-center, pink bottom-left, purple right.
 */
export const DEFAULT_MESH_BLOBS: MeshBlob[] = [
  { color: '#fb923c', base: [0.3, 0.12], phase: 0.0, freq: [1, 1] }, // orange, top
  { color: '#f9a8d4', base: [0.22, 0.78], phase: 0.33, freq: [1, 2] }, // pink, bottom-left
  { color: '#a855f7', base: [0.85, 0.55], phase: 0.66, freq: [2, 1] }, // purple, right
]

export interface MeshBlobOffset {
  /** Current x position as a viewport fraction (base + drift), clamped to [0,1]. */
  x: number
  /** Current y position as a viewport fraction (base + drift), clamped to [0,1]. */
  y: number
}

const TAU = Math.PI * 2
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

/**
 * Position of a single blob at loop progress `t` (0..1). The blob traces a slow
 * ellipse of half-extent `drift` (viewport fraction) around its base anchor.
 * Periodic: offset at t=0 and t=1 are identical (sine/cosine of full turns).
 */
export function meshBlobOffset(
  blob: MeshBlob,
  t: number,
  drift: number = DEFAULT_MESH_DRIFT,
): MeshBlobOffset {
  const [fx, fy] = blob.freq ?? [1, 1]
  const p = (t + blob.phase) % 1
  const dx = Math.sin(TAU * fx * p) * drift
  const dy = Math.cos(TAU * fy * p) * drift
  return {
    x: clamp01(blob.base[0] + dx),
    y: clamp01(blob.base[1] + dy),
  }
}

/** All blob offsets at loop progress `t`. */
export function meshFrame(
  blobs: MeshBlob[],
  t: number,
  drift: number = DEFAULT_MESH_DRIFT,
): MeshBlobOffset[] {
  return blobs.map((b) => meshBlobOffset(b, t, drift))
}

/**
 * Build a CSS `background-image` value: one radial-gradient per blob, each
 * centered at the blob's current fractional position, fading to transparent.
 * Stacked back-to-front; the wrapper sets `background-color` for the base fill.
 */
export function meshBackground(
  blobs: MeshBlob[],
  t: number,
  drift: number = DEFAULT_MESH_DRIFT,
): string {
  return blobs
    .map((b) => {
      const o = meshBlobOffset(b, t, drift)
      const cx = (o.x * 100).toFixed(2)
      const cy = (o.y * 100).toFixed(2)
      return `radial-gradient(circle at ${cx}% ${cy}%, ${b.color} 0%, transparent 55%)`
    })
    .join(', ')
}
