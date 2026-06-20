import { describe, it, expect } from 'vitest'
import {
  buildSpringScaleInVars,
  splitWords,
  SPRING_SCALE_IN_EASE_ID,
  SPRING_SCALE_IN_EXIT_EASE_ID,
} from '@/lib/motion/spring-scale-in'

describe('splitWords', () => {
  it('splits into one animated unit per word', () => {
    const units = splitWords('Fast Crisp Fluid')
    expect(units.filter((u) => u.isWord).map((u) => u.text)).toEqual([
      'Fast',
      'Crisp',
      'Fluid',
    ])
  })

  it('keeps whitespace runs as their own static (non-word) units', () => {
    expect(splitWords('a b')).toEqual([
      { text: 'a', isWord: true },
      { text: ' ', isWord: false },
      { text: 'b', isWord: true },
    ])
  })

  it('treats punctuation-attached tokens as a single word unit', () => {
    const words = splitWords('Fast. Crisp. Fluid.').filter((u) => u.isWord)
    expect(words.map((u) => u.text)).toEqual(['Fast.', 'Crisp.', 'Fluid.'])
  })

  it('returns no units for an empty string', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('buildSpringScaleInVars', () => {
  it('starts hidden and shrunk', () => {
    const { from } = buildSpringScaleInVars()
    expect(from).toEqual({ opacity: 0, scale: 0.7 })
  })

  it('resolves to visible and settled at scale 1', () => {
    const { to } = buildSpringScaleInVars()
    expect(to.opacity).toBe(1)
    expect(to.scale).toBe(1)
  })

  it('applies the spec defaults (0.36s duration, 95ms stagger, spring ease)', () => {
    const { to } = buildSpringScaleInVars()
    expect(to.duration).toBe(0.36)
    expect(to.stagger).toBe(0.095)
    expect(to.ease).toBe(SPRING_SCALE_IN_EASE_ID)
  })

  it('exposes the exit/swap frame for swap callers', () => {
    const { exit } = buildSpringScaleInVars()
    expect(exit.from).toEqual({ opacity: 1, scale: 1 })
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.scale).toBe(0.8)
    expect(exit.to.duration).toBe(0.2)
    expect(exit.to.stagger).toBe(0.08)
    expect(exit.to.ease).toBe(SPRING_SCALE_IN_EXIT_EASE_ID)
  })

  it('lets callers override timing and travel', () => {
    const { from, to } = buildSpringScaleInVars({
      duration: 0.5,
      stagger: 0.12,
      scaleFrom: 0.5,
    })
    expect(to.duration).toBe(0.5)
    expect(to.stagger).toBe(0.12)
    expect(from.scale).toBe(0.5)
  })
})
