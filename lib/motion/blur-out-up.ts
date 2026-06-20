/**
 * Pure construction of the "Blur Out Up" content swap — words arrive clean (a
 * short upward drift + light blur dissolve) and DEPART upward with increasing
 * blur, so the exit has more character than the entry (Apple-style light
 * typography where the goodbye is the showpiece).
 *
 * Framework-free + DOM-free so it is unit-testable; the <BlurOutUp> wrapper
 * feeds the enter/exit `from`/`to` to gsap.set()/gsap.to() across per-word spans
 * (whitespace runs stay static so spacing is preserved verbatim).
 *
 * Clean-room reference: pixel-point/animate-text `blur-out-up` portable
 * contract — per-word, enter 560ms / 28ms stagger,
 * cubic-bezier(0.22, 1, 0.36, 1), from { opacity 0, y 10px, blur 6px }; exit
 * 480ms / 24ms stagger, cubic-bezier(0.64, 0, 0.78, 0), to { opacity 0,
 * y -14px, blur 8px }; crossfade swap with a 35ms micro-delay between exit-end
 * and the next enter. We reproduce the looping exit→swap→enter cycle (this
 * effect is fundamentally a transition between strings) at the spec's base
 * timing, not the demo-only runtime down-scale.
 *
 * Distinct from per-word-crossfade (a one-shot per-word ENTER reveal, no blur):
 * Blur Out Up is a per-word swap with both an enter AND a blur-heavy exit phase.
 */
export interface BlurOutUpVarsInput {
  /** Enter tween duration per word (seconds). */
  enterDuration?: number
  /** Exit tween duration per word (seconds). */
  exitDuration?: number
  /** Per-word enter delay step (seconds). */
  enterStagger?: number
  /** Per-word exit delay step (seconds). */
  exitStagger?: number
  /** Starting vertical offset for the enter, in px (drifts up to 0). */
  yFrom?: number
  /** Ending vertical offset for the exit, in px (lifts up off 0). */
  yExit?: number
  /** Starting blur radius for the enter, in px (dissolves to 0). */
  blurFrom?: number
  /** Ending blur radius for the exit, in px (builds up from 0). */
  blurExit?: number
  /** GSAP ease for the enter — defaults to the registered CustomEase id. */
  enterEase?: string
  /** GSAP ease for the exit — defaults to the registered CustomEase id. */
  exitEase?: string
}

/** CustomEase ids + SVG-path equivalents of the spec's cubic-beziers. */
export const BLUR_OUT_UP_ENTER_EASE_ID = 'blurOutUpEnter'
export const BLUR_OUT_UP_ENTER_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'
export const BLUR_OUT_UP_EXIT_EASE_ID = 'blurOutUpExit'
export const BLUR_OUT_UP_EXIT_EASE_PATH = 'M0,0 C0.64,0 0.78,0 1,1'

/**
 * Micro-delay (seconds) between the exit completing and the next enter starting,
 * after the host's textContent has been swapped (spec swap.micro_delay_ms 35).
 */
export const BLUR_OUT_UP_MICRO_DELAY = 0.035

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

export function buildBlurOutUpVars(input: BlurOutUpVarsInput = {}) {
  const {
    enterDuration = 0.56,
    exitDuration = 0.48,
    enterStagger = 0.028,
    exitStagger = 0.024,
    yFrom = 10,
    yExit = -14,
    blurFrom = 6,
    blurExit = 8,
    enterEase = BLUR_OUT_UP_ENTER_EASE_ID,
    exitEase = BLUR_OUT_UP_EXIT_EASE_ID,
  } = input

  return {
    // New phrase arrives: from faded + low + lightly blurred to settled + crisp.
    enter: {
      from: { opacity: 0, y: yFrom, filter: `blur(${blurFrom}px)` },
      to: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: enterDuration,
        stagger: enterStagger,
        ease: enterEase,
      },
    },
    // Old phrase leaves: from settled + crisp to faded + lifted + heavily blurred
    // (the exit carries more character than the entry — the effect's signature).
    exit: {
      from: { opacity: 1, y: 0, filter: 'blur(0px)' },
      to: {
        opacity: 0,
        y: yExit,
        filter: `blur(${blurExit}px)`,
        duration: exitDuration,
        stagger: exitStagger,
        ease: exitEase,
      },
    },
  }
}
