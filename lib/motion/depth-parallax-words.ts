/**
 * Pure construction of the "Depth Parallax Words" reveal — words rise into place
 * one after another while scaling up from slightly small and dropping a soft
 * blur, so each word reads as if it surfaces from a shallow depth-of-field
 * (product-landing layered-typography cadence).
 *
 * Framework-free + DOM-free so it is unit-testable; the <DepthParallaxWords>
 * wrapper feeds `from`/`to` to gsap.set()/gsap.to() across per-word spans.
 *
 * Clean-room reference: pixel-point/animate-text `depth-parallax-words` portable
 * contract — per-word, enter 700ms / 70ms stagger,
 * cubic-bezier(0.22, 1, 0.36, 1), from { opacity 0, y 18px, scale 0.92, blur 3px }.
 * We implement the one-shot ENTER phase only (scroll/load reveal); the catalog's
 * crossfade swap (old text exits while new text enters) is demo-only and
 * intentionally not reproduced — but the exit vars from the spec are exposed
 * here so a future swap wrapper can drive both phases from one factory.
 *
 * Distinct from per-word-crossfade (whole-word drift, no depth cues): Depth
 * Parallax Words layers in the scale + blur that give the words their sense of
 * depth, so it reads richer at the cost of a touch more motion.
 */
export interface DepthParallaxWordsVarsInput {
  /** Tween duration per word (seconds). */
  duration?: number
  /** Per-word delay step (seconds). */
  stagger?: number
  /** Starting vertical offset in px (drifts up to 0). */
  yFrom?: number
  /** Starting scale (grows to 1). */
  scaleFrom?: number
  /** Starting blur radius in px (dissolves to 0). */
  blurFrom?: number
  /** GSAP ease — defaults to the registered enter CustomEase id. */
  ease?: string
}

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.22, 1, 0.36, 1). */
export const DEPTH_PARALLAX_WORDS_ENTER_EASE_ID = 'depthParallaxWordsEnter'
export const DEPTH_PARALLAX_WORDS_ENTER_EASE_PATH = 'M0,0 C0.22,1 0.36,1 1,1'

/** CustomEase id + SVG-path equivalent of cubic-bezier(0.64, 0, 0.78, 0) — exit/swap only. */
export const DEPTH_PARALLAX_WORDS_EXIT_EASE_ID = 'depthParallaxWordsExit'
export const DEPTH_PARALLAX_WORDS_EXIT_EASE_PATH = 'M0,0 C0.64,0 0.78,0 1,1'

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

export function buildDepthParallaxWordsVars(input: DepthParallaxWordsVarsInput = {}) {
  const {
    duration = 0.7,
    stagger = 0.07,
    yFrom = 18,
    scaleFrom = 0.92,
    blurFrom = 3,
    ease = DEPTH_PARALLAX_WORDS_ENTER_EASE_ID,
  } = input

  return {
    from: { opacity: 0, y: yFrom, scale: scaleFrom, filter: `blur(${blurFrom}px)` },
    to: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration, stagger, ease },
    // Exit phase from the spec — only a swap wrapper consumes this; the one-shot
    // ENTER component never tweens to it. Words drift up, overshoot scale and
    // re-blur as they fade.
    exit: {
      from: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
      to: {
        opacity: 0,
        y: -10,
        scale: 1.05,
        filter: 'blur(2px)',
        duration: 0.5,
        stagger: 0.045,
        ease: DEPTH_PARALLAX_WORDS_EXIT_EASE_ID,
      },
    },
  }
}
