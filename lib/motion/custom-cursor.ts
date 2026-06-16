/**
 * Pure config + state resolution for a smoothed custom cursor. Holds the follow
 * smoothing defaults (quickTo duration + ease), the default dot size, the
 * hover-expanded scale, and a resolver that turns a hovered target's dataset
 * (label / colours) into the cursor's next visual state. Framework-free +
 * DOM-free so it is unit-testable; the <CustomCursor> wrapper feeds the result
 * to gsap.quickTo() / gsap.to().
 *
 * Clean-room reference: annnimate "CustomCursor" — behavior only.
 */

/** quickTo follow smoothing — studied: speed 0.7, ease expo.out. */
export const DEFAULT_FOLLOW_DURATION = 0.7
export const DEFAULT_FOLLOW_EASE = 'expo.out'

/** Default dot diameter in px (idle, no target hovered). */
export const DEFAULT_DOT_SIZE = 12

/** Scale the dot grows to when hovering a plain interactive element. */
export const DEFAULT_HOVER_SCALE = 2.4

/** Tween duration (s) for scale / colour state changes on hover enter/leave. */
export const DEFAULT_STATE_DURATION = 0.35
export const DEFAULT_STATE_EASE = 'power3.out'

export interface CustomCursorConfig {
  /** gsap.quickTo duration for the position follow (smoothing/lag). */
  followDuration: number
  /** gsap ease for the position follow. */
  followEase: string
  /** Idle dot diameter (px). */
  dotSize: number
  /** Scale applied to the dot when hovering a non-labelled interactive target. */
  hoverScale: number
  /** Duration of scale/colour state tweens. */
  stateDuration: number
  /** Ease of scale/colour state tweens. */
  stateEase: string
}

export const DEFAULT_CURSOR_CONFIG: CustomCursorConfig = {
  followDuration: DEFAULT_FOLLOW_DURATION,
  followEase: DEFAULT_FOLLOW_EASE,
  dotSize: DEFAULT_DOT_SIZE,
  hoverScale: DEFAULT_HOVER_SCALE,
  stateDuration: DEFAULT_STATE_DURATION,
  stateEase: DEFAULT_STATE_EASE,
}

/** Merge a partial override onto the studied defaults. */
export function resolveCursorConfig(
  overrides: Partial<CustomCursorConfig> = {},
): CustomCursorConfig {
  return { ...DEFAULT_CURSOR_CONFIG, ...overrides }
}

/** Dataset read off a hovered target (the studied `data-*cursor*` knobs). */
export interface CursorTargetData {
  /** Optional label shown inside the cursor pill (data-cursor-text). */
  text?: string | null
  /** Optional pill background colour (data-cursor-bg). */
  bg?: string | null
  /** Optional pill text colour (data-cursor-color). */
  color?: string | null
}

export type CursorMode = 'idle' | 'hover' | 'text'

export interface CursorState {
  mode: CursorMode
  /** Scale the dot/pill tweens to. */
  scale: number
  /** Label text (empty string when not in text mode). */
  text: string
  /** Resolved background colour (undefined => keep default). */
  bg?: string
  /** Resolved foreground/text colour (undefined => keep default). */
  color?: string
}

/**
 * Resolve the cursor's next visual state from the hovered target.
 *
 * - No target hovered  -> `idle`  (scale 1, no label).
 * - Target with a label -> `text` (scale 1, pill shows the label + colours).
 * - Target without label -> `hover` (dot grows to hoverScale).
 */
export function resolveCursorState(
  target: CursorTargetData | null,
  config: CustomCursorConfig = DEFAULT_CURSOR_CONFIG,
): CursorState {
  if (!target) {
    return { mode: 'idle', scale: 1, text: '' }
  }
  const label = (target.text ?? '').trim()
  if (label) {
    return {
      mode: 'text',
      scale: 1,
      text: label,
      bg: target.bg ?? undefined,
      color: target.color ?? undefined,
    }
  }
  return { mode: 'hover', scale: config.hoverScale, text: '' }
}
