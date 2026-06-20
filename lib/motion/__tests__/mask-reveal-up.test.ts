import { describe, it, expect } from 'vitest'
import {
  buildMaskRevealUpVars,
  buildMaskRevealUpExitVars,
  splitLines,
  MASK_REVEAL_UP_ENTER_EASE_ID,
  MASK_REVEAL_UP_EXIT_EASE_ID,
} from '@/lib/motion/mask-reveal-up'

describe('splitLines', () => {
  it('splits into one unit per line on "\\n"', () => {
    expect(splitLines('Designed to move.\nBuilt to focus.')).toEqual([
      'Designed to move.',
      'Built to focus.',
    ])
  })

  it('keeps a single line as one unit', () => {
    expect(splitLines('One line only')).toEqual(['One line only'])
  })

  it('preserves spaces inside a line (no word splitting)', () => {
    expect(splitLines('a b c\nd e')).toEqual(['a b c', 'd e'])
  })

  it('keeps an empty trailing line from a final newline', () => {
    expect(splitLines('top\n')).toEqual(['top', ''])
  })
})

describe('buildMaskRevealUpVars (enter)', () => {
  it('starts hidden, low and blurred', () => {
    const { from } = buildMaskRevealUpVars()
    expect(from).toEqual({ opacity: 0, y: 30, filter: 'blur(6px)' })
  })

  it('resolves to visible, settled and crisp', () => {
    const { to } = buildMaskRevealUpVars()
    expect(to.opacity).toBe(1)
    expect(to.y).toBe(0)
    expect(to.filter).toBe('blur(0px)')
  })

  it('applies the spec defaults (0.76s duration, 90ms stagger, enter ease)', () => {
    const { to } = buildMaskRevealUpVars()
    expect(to.duration).toBe(0.76)
    expect(to.stagger).toBe(0.09)
    expect(to.ease).toBe(MASK_REVEAL_UP_ENTER_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildMaskRevealUpVars({
      duration: 1.1,
      stagger: 0.12,
      yFrom: 48,
      blurFrom: 10,
    })
    expect(to.duration).toBe(1.1)
    expect(to.stagger).toBe(0.12)
    expect(from.y).toBe(48)
    expect(from.filter).toBe('blur(10px)')
  })
})

describe('buildMaskRevealUpExitVars (swap support)', () => {
  it('starts visible and settled', () => {
    const { from } = buildMaskRevealUpExitVars()
    expect(from).toEqual({ opacity: 1, y: 0, filter: 'blur(0px)' })
  })

  it('resolves to hidden, lifted up and blurred', () => {
    const { to } = buildMaskRevealUpExitVars()
    expect(to.opacity).toBe(0)
    expect(to.y).toBe(-22)
    expect(to.filter).toBe('blur(6px)')
  })

  it('applies the spec exit defaults (0.52s duration, 70ms stagger, exit ease)', () => {
    const { to } = buildMaskRevealUpExitVars()
    expect(to.duration).toBe(0.52)
    expect(to.stagger).toBe(0.07)
    expect(to.ease).toBe(MASK_REVEAL_UP_EXIT_EASE_ID)
  })
})
