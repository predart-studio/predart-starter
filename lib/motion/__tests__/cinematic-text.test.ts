import { describe, it, expect } from 'vitest'
import {
  splitLines,
  buildCinematicVars,
  DEFAULT_CINEMATIC_X_FROM,
  DEFAULT_CINEMATIC_DURATION,
  DEFAULT_CINEMATIC_STAGGER,
} from '@/lib/motion/cinematic-text'

describe('splitLines', () => {
  it('splits a newline string into trimmed, non-empty lines', () => {
    expect(splitLines('Every\nSingle\nMile\nCounts.')).toEqual([
      'Every',
      'Single',
      'Mile',
      'Counts.',
    ])
  })

  it('passes an array through, dropping blanks and trimming whitespace', () => {
    expect(splitLines(['  Every ', '', 'Mile', '   '])).toEqual(['Every', 'Mile'])
  })
})

describe('buildCinematicVars', () => {
  it('applies the studied defaults (x 40 -> 0, fade 0 -> 1, no filter)', () => {
    const { from, to } = buildCinematicVars()
    expect(from).toEqual({ x: DEFAULT_CINEMATIC_X_FROM, opacity: 0 })
    expect(to.x).toBe(0)
    expect(to.opacity).toBe(1)
    expect(to.duration).toBe(DEFAULT_CINEMATIC_DURATION)
    expect(to.stagger).toBe(DEFAULT_CINEMATIC_STAGGER)
    expect(to.ease).toBe('power3.out')
    // default path never touches CSS filter
    expect(from.filter).toBeUndefined()
    expect(to.filter).toBeUndefined()
  })

  it('respects passed params', () => {
    const { from, to } = buildCinematicVars({
      xFrom: 80,
      duration: 1,
      stagger: 0.3,
      ease: 'expo.out',
    })
    expect(from.x).toBe(80)
    expect(to.duration).toBe(1)
    expect(to.stagger).toBe(0.3)
    expect(to.ease).toBe('expo.out')
  })

  it('emits a blur filter only when a non-zero blur is requested', () => {
    const { from, to } = buildCinematicVars({ blurFrom: 12, blurTo: 0 })
    expect(from.filter).toBe('blur(12px)')
    expect(to.filter).toBe('blur(0px)')
  })
})
