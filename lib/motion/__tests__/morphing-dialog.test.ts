import { describe, it, expect, vi } from 'vitest'
import {
  buildMorphVars,
  buildBackdropInVars,
  buildBackdropOutVars,
  nextDialogState,
  DEFAULT_MORPH_DURATION,
  DEFAULT_MORPH_EASE,
} from '@/lib/motion/morphing-dialog'

describe('buildMorphVars', () => {
  it('applies the studied defaults (snappy ease-in-out, absolute, scale)', () => {
    const vars = buildMorphVars()
    expect(vars.duration).toBe(DEFAULT_MORPH_DURATION)
    expect(vars.ease).toBe(DEFAULT_MORPH_EASE)
    expect(vars.absolute).toBe(true)
    expect(vars.scale).toBe(true)
  })

  it('respects passed overrides', () => {
    const vars = buildMorphVars({ duration: 0.6, ease: 'expo.out', absolute: false, scale: false })
    expect(vars).toMatchObject({ duration: 0.6, ease: 'expo.out', absolute: false, scale: false })
  })

  it('only includes onComplete when provided', () => {
    expect('onComplete' in buildMorphVars()).toBe(false)
    const cb = vi.fn()
    expect(buildMorphVars({ onComplete: cb }).onComplete).toBe(cb)
  })
})

describe('backdrop vars', () => {
  it('fades in toward opacity 1 and out toward opacity 0', () => {
    expect(buildBackdropInVars().opacity).toBe(1)
    expect(buildBackdropOutVars().opacity).toBe(0)
  })

  it('honors custom durations', () => {
    expect(buildBackdropInVars({ duration: 0.9 }).duration).toBe(0.9)
    expect(buildBackdropOutVars({ duration: 0.1 }).duration).toBe(0.1)
  })
})

describe('nextDialogState', () => {
  it('toggles when no force is given', () => {
    expect(nextDialogState(false)).toBe(true)
    expect(nextDialogState(true)).toBe(false)
  })

  it('pins to the forced value regardless of current', () => {
    expect(nextDialogState(true, false)).toBe(false)
    expect(nextDialogState(false, true)).toBe(true)
    expect(nextDialogState(true, true)).toBe(true)
  })
})
