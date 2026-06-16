import { describe, it, expect } from 'vitest'
import { followOffset } from '@/lib/motion/follow'

describe('followOffset', () => {
  it('centers the floating element on the pointer', () => {
    expect(followOffset({ x: 100, y: 100 }, { width: 40, height: 20 })).toEqual({ x: 80, y: 90 })
  })

  it('returns the pointer unchanged for a zero-size element', () => {
    expect(followOffset({ x: 12, y: 34 }, { width: 0, height: 0 })).toEqual({ x: 12, y: 34 })
  })
})
