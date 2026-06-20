/**
 * Pure construction of the "Kinetic Center Build" reveal — a centered phrase
 * assembled word by word. The first word appears in the center; each following
 * word enters from the right with a soft blur and physically pushes the existing
 * line LEFT until the full phrase locks centered (Apple-keynote kinetic editorial
 * typography). The line never reflows by browser layout: every word is absolutely
 * centered and animated to its computed x, so the build reads as one moving line.
 *
 * Framework-free + DOM-free so it is unit-testable; the <KineticCenterBuild>
 * wrapper measures rendered word widths, feeds them to `computeCenteredPositions`,
 * and drives a gsap timeline from the `from`/`to` vars this factory returns.
 *
 * Clean-room reference: pixel-point/animate-text `kinetic-center-build` portable
 * contract — per-word, enter 360ms / cubic-bezier(0.2, 0.8, 0.2, 1),
 * from { opacity 0, y 6px, scale 0.992, blur 3.5px }; a soft reflow blur (0.8px)
 * smooths the push, exit 260ms / cubic-bezier(0.4, 0, 0.2, 1).
 * We implement the one-shot ENTER build only (scroll/load reveal); the catalog's
 * looping phrase swap (hold → exit → gap → next phrase) is demo-only and
 * intentionally not reproduced — but the exit vars from the spec are exposed here
 * so a future swap wrapper can drive both phases from one factory.
 *
 * Distinct from per-word-crossfade (words fade in place, no re-centering):
 * Kinetic Center Build is layout-aware — each incoming word changes the target
 * x of the whole line, so existing words slide to stay centered.
 */
export interface KineticCenterBuildVarsInput {
  /** Tween duration for the push of each incoming word (seconds). */
  duration?: number
  /** Gap inserted between consecutive word entries (seconds) — the build cadence. */
  stagger?: number
  /** Distance an incoming word starts to the right of its target x (px). */
  entryOffset?: number
  /** Horizontal gap reserved between adjacent words when centering (px). */
  wordGap?: number
  /** Starting vertical offset of the first word in px (drifts up to 0). */
  yFrom?: number
  /** Starting scale of an entering word (settles to 1). */
  scaleFrom?: number
  /** Starting blur radius of an entering word in px (dissolves to 0). */
  blurFrom?: number
  /** Mid-push blur applied to already-placed words while they reflow (px). */
  reflowBlur?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.2, 0.8, 0.2, 1). */
export const KINETIC_CENTER_BUILD_ENTER_EASE_ID = 'kineticCenterBuildEnter'
export const KINETIC_CENTER_BUILD_ENTER_EASE_PATH = 'M0,0 C0.2,0.8 0.2,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.4, 0, 0.2, 1) — exit/swap only. */
export const KINETIC_CENTER_BUILD_EXIT_EASE_ID = 'kineticCenterBuildExit'
export const KINETIC_CENTER_BUILD_EXIT_EASE_PATH = 'M0,0 C0.4,0 0.2,1 1,1'

/**
 * A split unit: a word or a run of whitespace. Only `word` units become animated
 * kinetic spans; the whitespace runs are dropped because words are spaced by the
 * computed `wordGap`, not by literal space glyphs (each word is absolutely
 * positioned). Keeping them in the split keeps the helper symmetric with the rest
 * of the per-word lab modules and lets callers reassemble plain text if needed.
 */
export interface WordUnit {
  text: string
  isWord: boolean
}

/**
 * Split text into per-word units while keeping whitespace runs as their own
 * (non-word) units. `/(\S+|\s+)/g` captures words AND the gaps between them.
 * The component animates only the `isWord` units; spacing comes from `wordGap`.
 */
export function splitWords(text: string): WordUnit[] {
  const matches = text.match(/(\S+|\s+)/g) ?? []
  return matches.map((chunk) => ({
    text: chunk,
    isWord: /\S/.test(chunk),
  }))
}

/** Convenience: just the word strings, in order (drops whitespace runs). */
export function wordsOf(text: string): string[] {
  return splitWords(text)
    .filter((u) => u.isWord)
    .map((u) => u.text)
}

/** Linear blend between a and b by t (0..1). Mirrors the spec's `mix()`. */
export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Compute the centered x position (in px) of each word's CENTER, given the
 * rendered width of every word in order. Words are absolutely centered via
 * translate(-50%, …), so each x is the offset of the word's center from the line
 * center. With total line width W and per-word gaps, the cursor starts at -W/2
 * and each word's center sits at cursor + width/2 before advancing by width+gap.
 *
 * DOM-free: the component supplies the measured `widths`; this returns the target
 * x for each word in the SAME order. Returns `[]` for an empty input.
 */
export function computeCenteredPositions(widths: number[], wordGap: number): number[] {
  const count = widths.length
  if (count === 0) return []
  const totalWidth =
    widths.reduce((sum, w) => sum + w, 0) + wordGap * (count - 1)
  let cursor = -totalWidth / 2
  const positions: number[] = []
  for (const w of widths) {
    positions.push(cursor + w / 2)
    cursor += w + wordGap
  }
  return positions
}

export function buildKineticCenterBuildVars(input: KineticCenterBuildVarsInput = {}) {
  const {
    // 360ms enter / 430ms push from the spec; we use the push duration as the
    // per-word build duration (the felt motion of the effect) and expose it as
    // `duration`. stagger is the build cadence between word entries.
    duration = 0.43,
    stagger = 0.09,
    entryOffset = 88,
    wordGap = 10,
    yFrom = 6,
    scaleFrom = 0.992,
    blurFrom = 3.5,
    reflowBlur = 0.8,
    ease = KINETIC_CENTER_BUILD_ENTER_EASE_ID,
  } = input

  return {
    /** Layout knobs the component needs before it can place words. */
    entryOffset,
    wordGap,
    reflowBlur,
    /** Incoming word: starts offset to the right, blurred and faded. */
    from: {
      opacity: 0,
      x: entryOffset,
      y: yFrom,
      scale: scaleFrom,
      filter: `blur(${blurFrom}px)`,
    },
    /** Settled word: crisp, opaque, at its centered x. */
    to: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration,
      stagger,
      ease,
    },
    // Exit phase from the spec — only a swap wrapper consumes this; the one-shot
    // ENTER build never tweens to it. Words lift up and dissolve together.
    exit: {
      from: { opacity: 1, y: 0, filter: 'blur(0px)' },
      to: {
        opacity: 0,
        y: -6,
        filter: 'blur(2.5px)',
        duration: 0.26,
        ease: KINETIC_CENTER_BUILD_EXIT_EASE_ID,
      },
    },
  }
}
