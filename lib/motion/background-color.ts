/**
 * Pure color math for the BackgroundColor scroll effect. Given a scroll progress
 * (0..1) and an ordered list of color stops (one per "zone"), returns the
 * wrapper's background color, smoothly rgb-interpolated between the two adjacent
 * stops. Framework-free + DOM-free so it is unit-testable; the <BackgroundColor>
 * wrapper feeds individual stop colors to gsap.to() via per-zone ScrollTriggers,
 * and this module backs the crossfade math + default palette.
 *
 * Clean-room reference: annnimate "BackgroundColor" — behavior only.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

/** Ordered, on-brand light/dark stops matching the studied demo (dark → light). */
export const DEFAULT_BACKGROUND_STOPS = ['#0a0a0a', '#fafafa'] as const

/** Parse a #rgb / #rrggbb hex string into an {r,g,b} triple (0..255). */
export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** Linear-interpolate two rgb triples; t is clamped to 0..1. Returns a css rgb(). */
export function lerpRgb(a: Rgb, b: Rgb, t: number): string {
  const k = Math.max(0, Math.min(1, t))
  const r = Math.round(a.r + (b.r - a.r) * k)
  const g = Math.round(a.g + (b.g - a.g) * k)
  const bl = Math.round(a.b + (b.b - a.b) * k)
  return `rgb(${r}, ${g}, ${bl})`
}

/**
 * Scrubbed crossfade across N stops. progress 0 → first stop, progress 1 → last
 * stop, and in between, the color lerps between the two adjacent stops (the
 * effect's smooth rgb interpolation, ease "none"). A single stop returns itself.
 */
export function backgroundColorAt(
  progress: number,
  stops: readonly string[] = DEFAULT_BACKGROUND_STOPS,
): string {
  if (stops.length === 0) return 'rgb(0, 0, 0)'
  if (stops.length === 1) {
    const c = hexToRgb(stops[0])
    return `rgb(${c.r}, ${c.g}, ${c.b})`
  }
  const p = Math.max(0, Math.min(1, progress))
  const segments = stops.length - 1
  const scaled = p * segments
  const i = Math.min(Math.floor(scaled), segments - 1)
  const localT = scaled - i
  return lerpRgb(hexToRgb(stops[i]), hexToRgb(stops[i + 1]), localT)
}
