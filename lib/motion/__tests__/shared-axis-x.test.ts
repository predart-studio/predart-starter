import { describe, it, expect } from 'vitest'
import {
  buildSharedAxisXVars,
  splitWhole,
  SHARED_AXIS_X_ENTER_EASE_ID,
  SHARED_AXIS_X_EXIT_EASE_ID,
} from '@/lib/motion/shared-axis-x'

describe('splitWhole', () => {
  it('keeps the whole string as a single animated unit (no splitting)', () => {
    expect(splitWhole('Slide across X.')).toEqual(['Slide across X.'])
  })

  it('does not split on spaces or characters', () => {
    expect(splitWhole('Sibling views.')).toEqual(['Sibling views.'])
  })
})

describe('buildSharedAxisXVars — enter phase', () => {
  it('starts hidden, offset right and slightly shrunk', () => {
    const { enter } = buildSharedAxisXVars()
    expect(enter.from).toEqual({ opacity: 0, x: 24, scale: 0.98 })
  })

  it('resolves to visible, centred and full scale', () => {
    const { enter } = buildSharedAxisXVars()
    expect(enter.to.opacity).toBe(1)
    expect(enter.to.x).toBe(0)
    expect(enter.to.scale).toBe(1)
  })

  it('applies the spec enter timing (0.5s) and ease', () => {
    const { enter } = buildSharedAxisXVars()
    expect(enter.to.duration).toBe(0.5)
    expect(enter.to.ease).toBe(SHARED_AXIS_X_ENTER_EASE_ID)
  })
})

describe('buildSharedAxisXVars — exit phase', () => {
  it('starts from the settled state', () => {
    const { exit } = buildSharedAxisXVars()
    expect(exit.from).toEqual({ opacity: 1, x: 0, scale: 1 })
  })

  it('slides left, fades out and shrinks to 0.98', () => {
    const { exit } = buildSharedAxisXVars()
    expect(exit.to.opacity).toBe(0)
    expect(exit.to.x).toBe(-20)
    expect(exit.to.scale).toBe(0.98)
  })

  it('applies the spec exit timing (0.36s) and ease', () => {
    const { exit } = buildSharedAxisXVars()
    expect(exit.to.duration).toBe(0.36)
    expect(exit.to.ease).toBe(SHARED_AXIS_X_EXIT_EASE_ID)
  })
})

describe('buildSharedAxisXVars — overrides', () => {
  it('lets callers override durations and travel', () => {
    const { enter, exit } = buildSharedAxisXVars({
      enterDuration: 0.8,
      exitDuration: 0.5,
      xEnterFrom: 40,
      xExitTo: -32,
      scaleAway: 0.95,
    })
    expect(enter.to.duration).toBe(0.8)
    expect(enter.from.x).toBe(40)
    expect(enter.from.scale).toBe(0.95)
    expect(exit.to.duration).toBe(0.5)
    expect(exit.to.x).toBe(-32)
    expect(exit.to.scale).toBe(0.95)
  })
})
