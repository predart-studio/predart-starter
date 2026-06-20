import { describe, it, expect } from 'vitest'
import {
  buildLineByLineSlideVars,
  splitLines,
  LINE_SLIDE_ENTER_EASE_ID,
  LINE_SLIDE_EXIT_EASE_ID,
} from '@/lib/motion/line-by-line-slide'

describe('splitLines', () => {
  it('splits into one unit per line on "\\n"', () => {
    expect(splitLines('Think different.\nDo more.')).toEqual([
      'Think different.',
      'Do more.',
    ])
  })

  it('returns a single unit when there is no newline', () => {
    expect(splitLines('One line')).toEqual(['One line'])
  })

  it('preserves blank lines as empty strings', () => {
    expect(splitLines('a\n\nb')).toEqual(['a', '', 'b'])
  })
})

describe('buildLineByLineSlideVars', () => {
  it('starts hidden and offset to the left', () => {
    const { from } = buildLineByLineSlideVars()
    expect(from).toEqual({ opacity: 0, x: -48 })
  })

  it('resolves to visible and settled', () => {
    const { to } = buildLineByLineSlideVars()
    expect(to.opacity).toBe(1)
    expect(to.x).toBe(0)
  })

  it('applies the spec defaults (0.9s duration, 120ms stagger, enter ease)', () => {
    const { to } = buildLineByLineSlideVars()
    expect(to.duration).toBe(0.9)
    expect(to.stagger).toBe(0.12)
    expect(to.ease).toBe(LINE_SLIDE_ENTER_EASE_ID)
  })

  it('exposes the swap exit vars (demo-only, 0.6s / 80ms / exit ease)', () => {
    const { exit } = buildLineByLineSlideVars()
    expect(exit).toEqual({
      opacity: 0,
      x: 48,
      duration: 0.6,
      stagger: 0.08,
      ease: LINE_SLIDE_EXIT_EASE_ID,
    })
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildLineByLineSlideVars({
      duration: 1.2,
      stagger: 0.2,
      xFrom: -24,
    })
    expect(to.duration).toBe(1.2)
    expect(to.stagger).toBe(0.2)
    expect(from.x).toBe(-24)
  })
})
