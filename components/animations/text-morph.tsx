'use client'

import { useRef, useEffect, useState, useLayoutEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  diffChars,
  nextPhraseIndex,
  DEFAULT_TEXT_MORPH,
  type MorphChar,
} from '@/lib/motion/text-morph'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip)
}

interface TextMorphProps {
  /** Words to cycle through. The first renders statically for SSR / no-JS. */
  phrases?: string[]
  /** Static text shown before the morphing word. Pass '' for none. */
  prefix?: string
  /** Seconds for the move + fade of one morph. */
  duration?: number
  /** Seconds each phrase is held before morphing to the next. */
  interval?: number
  /** GSAP ease for the move/fade. */
  ease?: string
  className?: string
  /** Element rendered around the prefix + morphing word. */
  as?: ElementType
}

/** Render a word as id-tagged char spans (final, settled state). */
function renderChars(chars: MorphChar[]) {
  return chars
    .filter((c) => c.role !== 'exit')
    .map((c, i) => (
      <span
        // index keeps React keys unique across repeated glyphs in one word
        key={`${c.flipId}-${i}`}
        data-flip-id={c.flipId}
        className="inline-block whitespace-pre"
      >
        {c.char}
      </span>
    ))
}

/**
 * TextMorph — GSAP Flip per-character word morph (element-scoped).
 *
 * A "prefix + target word" line whose target word morphs character-by-character
 * as it cycles a phrase list. Each char is a span with a stable
 * `data-flip-id` (char code + occurrence): characters shared between the old and
 * new word keep their id and SLIDE to their new slot (opacity 1) while
 * new-only chars fade IN and old-only chars fade OUT — all in one ~0.3s
 * ease-out beat. Implemented the canonical way: Flip.getState() before a state
 * change swaps the rendered chars, then Flip.from() tweens the survivors and
 * fades the rest. Auto-cycles on an interval (cleaned up on unmount). Renders the
 * first phrase server-side (no layout shift, no-JS safe); the morph layers on the
 * client. Respects prefers-reduced-motion: shows the first phrase statically, no
 * Flip, no interval.
 *
 * Do NOT also bind Framer Motion to these spans' transform/opacity — Flip owns them.
 *
 * Clean-room reference: annnimate "TextMorph" — behavior only.
 * Implementation is standard GSAP Flip (see gsap-plugins skill).
 */
export function TextMorph({
  phrases = DEFAULT_TEXT_MORPH.phrases,
  prefix = DEFAULT_TEXT_MORPH.prefix,
  duration = DEFAULT_TEXT_MORPH.duration,
  interval = DEFAULT_TEXT_MORPH.interval,
  ease = DEFAULT_TEXT_MORPH.ease,
  className,
  as: Tag = 'span',
}: TextMorphProps) {
  const wordRef = useRef<HTMLSpanElement>(null)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const prefersReduced = usePrefersReducedMotion()

  // Index of the currently-shown phrase, and the char list rendered for it.
  const [index, setIndex] = useState(0)
  const [chars, setChars] = useState<MorphChar[]>(() =>
    // first paint: every char of phrase 0 "enters" from nothing (kept static on
    // server / reduced motion since no Flip state is captured then)
    diffChars('', phrases[0] ?? ''),
  )

  // Auto-cycle: every `interval` seconds, diff current -> next word and commit
  // the new char list. Flip.getState() is captured synchronously below, before
  // React paints, so the layout effect can tween the delta.
  useEffect(() => {
    if (prefersReduced) return
    if (phrases.length <= 1) return

    const id = window.setInterval(() => {
      setIndex((prev) => {
        const next = nextPhraseIndex(prev, phrases.length)
        setChars((curr) => {
          const currentWord = curr
            .filter((c) => c.role !== 'exit')
            .map((c) => c.char)
            .join('')
          return diffChars(currentWord, phrases[next] ?? '')
        })
        return next
      })
    }, interval * 1000)

    return () => window.clearInterval(id)
  }, [phrases, interval, prefersReduced])

  // Capture Flip state synchronously BEFORE the DOM commits the new char spans.
  if (typeof window !== 'undefined' && !prefersReduced && wordRef.current) {
    flipStateRef.current = Flip.getState(
      wordRef.current.querySelectorAll('[data-flip-id]'),
    )
  }

  // After React swaps the chars, play the Flip: shared ids tween position;
  // entering chars fade in, exiting chars fade out, then unmount.
  useLayoutEffect(() => {
    if (prefersReduced) return
    const el = wordRef.current
    const state = flipStateRef.current
    if (!el || !state) return

    const ctx = gsap.context(() => {
      Flip.from(state, {
        duration,
        ease,
        absolute: true,
        // entering chars (new id, no prior state) fade up from 0
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0 },
            { opacity: 1, duration, ease },
          ),
        // exiting chars (id gone from new render) fade out
        onLeave: (els) =>
          gsap.to(els, { opacity: 0, duration, ease }),
      })
    }, el)

    return () => ctx.revert()
  }, [chars, duration, ease, prefersReduced])

  return (
    <Tag className={cn('inline-flex items-baseline', className)}>
      {prefix && <span className="whitespace-pre">{prefix}</span>}
      <span ref={wordRef} className="inline-flex">
        {renderChars(chars)}
      </span>
    </Tag>
  )
}
