/**
 * Pure construction of the "Shared Axis Y" word swap — a per-word HARD-CUT
 * transition with staircase timing: the outgoing phrase's words blink out one
 * after another, the text swaps, then the incoming phrase's words blink in on
 * the same stepped cadence. Sharp, editorial phrase swaps with no easing curve.
 *
 * Framework-free + DOM-free so it is unit-testable; the <SharedAxisY> wrapper
 * feeds the enter/exit `from`/`to` to gsap.set()/gsap.to() across per-word spans.
 *
 * Clean-room reference: pixel-point/animate-text `shared-axis-y` portable
 * contract — per-word, enter 180ms / 78ms stagger, exit 140ms / 78ms stagger,
 * easing steps(1, end), crossfade swap with a 28ms micro-delay between exit-end
 * and the next enter. The spec's from/to carry y 0 / scale 1 (no movement) —
 * this effect is a pure opacity hard cut — but we thread y/scale through the
 * factory verbatim so the contract mirrors the spec exactly. We reproduce the
 * looping exit→swap→enter cycle (this effect is fundamentally a transition
 * between strings) at the spec's base timing, not the demo-only runtime down-scale.
 *
 * Easing note: `steps(1, end)` is a STEP function, not a cubic-bezier, so there
 * is no CustomEase id / SVG path to register — GSAP consumes the `steps(1)`
 * string directly. The easing constant is exported below in lieu of an ease path.
 *
 * Distinct from per-word-crossfade (per-word, but a smooth eased drift+fade):
 * shared-axis-y has NO drift and NO easing — every word state change is an
 * instantaneous step, giving a deliberately abrupt, typewriter-cut feel.
 */
export interface SharedAxisYVarsInput {
  /** Enter tween duration per word (seconds). */
  enterDuration?: number
  /** Exit tween duration per word (seconds). */
  exitDuration?: number
  /** Per-word delay step on enter (seconds). */
  enterStagger?: number
  /** Per-word delay step on exit (seconds). */
  exitStagger?: number
  /** Vertical offset in px carried through the swap (spec: 0 — no movement). */
  y?: number
  /** Scale carried through the swap (spec: 1 — no scaling). */
  scale?: number
  /** GSAP ease — defaults to the spec's stepped ease. */
  ease?: string
}

/**
 * GSAP ease string for the spec's `steps(1, end)`. A step function has no SVG
 * path / CustomEase — GSAP parses `steps(1)` natively — so this string stands in
 * for the SOFT_BLUR_EASE_PATH-style constant the sibling effects export.
 */
export const SHARED_AXIS_Y_EASE_ID = 'steps(1)'

/** Micro-delay (seconds) between the exit completing (text swapped) and the next
 * enter starting — spec swap.micro_delay_ms 28. */
export const SHARED_AXIS_Y_MICRO_DELAY = 0.028

/**
 * A split unit: a word or a run of whitespace. Only `word` units animate; the
 * whitespace units stay static so word spacing is preserved exactly.
 */
export interface WordUnit {
  text: string
  isWord: boolean
}

/**
 * Split text into per-word animated units while keeping whitespace runs as their
 * own (static) units. `/(\S+|\s+)/g` captures words AND the gaps between them,
 * so reassembling the spans reproduces the original spacing verbatim.
 */
export function splitWords(text: string): WordUnit[] {
  const matches = text.match(/(\S+|\s+)/g) ?? []
  return matches.map((chunk) => ({
    text: chunk,
    isWord: /\S/.test(chunk),
  }))
}

export function buildSharedAxisYVars(input: SharedAxisYVarsInput = {}) {
  const {
    enterDuration = 0.18,
    exitDuration = 0.14,
    enterStagger = 0.078,
    exitStagger = 0.078,
    y = 0,
    scale = 1,
    ease = SHARED_AXIS_Y_EASE_ID,
  } = input

  return {
    // Old phrase leaves: each word hard-cuts from visible to hidden, staircased.
    exit: {
      from: { opacity: 1, y, scale },
      to: {
        opacity: 0,
        y,
        scale,
        duration: exitDuration,
        stagger: exitStagger,
        ease,
      },
    },
    // New phrase arrives: each word hard-cuts from hidden to visible, staircased.
    enter: {
      from: { opacity: 0, y, scale },
      to: {
        opacity: 1,
        y,
        scale,
        duration: enterDuration,
        stagger: enterStagger,
        ease,
      },
    },
  }
}
