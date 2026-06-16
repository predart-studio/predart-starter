/**
 * Pure timing model for the Typewriter effect. Given a list of phrases and the
 * per-character type/delete speeds + pause durations, returns one segment per
 * phrase with concrete durations. Framework-free + DOM-free so it is
 * unit-testable; the <Typewriter> wrapper turns each segment into GSAP timeline
 * tweens (no setInterval / setTimeout — pure timeline sequencing).
 *
 * Clean-room reference: annnimate "Typewriter" — behavior only.
 */
export interface TypewriterTimingInput {
  /** Phrases to cycle through, in order. */
  phrases: string[]
  /** Seconds to type one character. */
  typeSpeed?: number
  /** Seconds to delete one character. */
  deleteSpeed?: number
  /** Seconds to hold the fully-typed phrase before deleting. */
  pauseAfterType?: number
  /** Seconds to hold the empty state before typing the next phrase. */
  pauseAfterDelete?: number
}

export interface TypewriterSegment {
  phrase: string
  /** Total seconds to type the whole phrase. */
  typeDuration: number
  /** Total seconds to delete the whole phrase. */
  deleteDuration: number
  pauseAfterType: number
  pauseAfterDelete: number
}

export const DEFAULT_TYPEWRITER = {
  typeSpeed: 0.06,
  deleteSpeed: 0.03,
  pauseAfterType: 1.2,
  pauseAfterDelete: 0.4,
} as const

export function buildTypewriterTimeline(
  input: TypewriterTimingInput,
): TypewriterSegment[] {
  const {
    phrases,
    typeSpeed = DEFAULT_TYPEWRITER.typeSpeed,
    deleteSpeed = DEFAULT_TYPEWRITER.deleteSpeed,
    pauseAfterType = DEFAULT_TYPEWRITER.pauseAfterType,
    pauseAfterDelete = DEFAULT_TYPEWRITER.pauseAfterDelete,
  } = input

  return phrases.map((phrase) => ({
    phrase,
    typeDuration: phrase.length * typeSpeed,
    deleteDuration: phrase.length * deleteSpeed,
    pauseAfterType,
    pauseAfterDelete,
  }))
}
