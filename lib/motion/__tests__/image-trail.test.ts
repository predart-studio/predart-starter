import { describe, it, expect } from 'vitest'
import {
  shouldSpawn,
  poolIndex,
  distance,
  DEFAULT_TRAIL_THRESHOLD,
  DEFAULT_TRAIL_POOL_SIZE,
} from '@/lib/motion/image-trail'

describe('shouldSpawn', () => {
  it('does not spawn while travel is under the threshold', () => {
    expect(shouldSpawn(DEFAULT_TRAIL_THRESHOLD - 1)).toBe(false)
    expect(shouldSpawn(0)).toBe(false)
  })

  it('spawns exactly at the threshold', () => {
    expect(shouldSpawn(DEFAULT_TRAIL_THRESHOLD)).toBe(true)
  })

  it('spawns when travel exceeds the threshold', () => {
    expect(shouldSpawn(DEFAULT_TRAIL_THRESHOLD + 100)).toBe(true)
  })

  it('respects a custom threshold', () => {
    expect(shouldSpawn(20, 30)).toBe(false)
    expect(shouldSpawn(30, 30)).toBe(true)
  })
})

describe('poolIndex', () => {
  it('returns the spawn count directly while under the pool size', () => {
    expect(poolIndex(0)).toBe(0)
    expect(poolIndex(3)).toBe(3)
    expect(poolIndex(DEFAULT_TRAIL_POOL_SIZE - 1)).toBe(DEFAULT_TRAIL_POOL_SIZE - 1)
  })

  it('wraps round-robin past the pool size', () => {
    expect(poolIndex(DEFAULT_TRAIL_POOL_SIZE)).toBe(0)
    expect(poolIndex(DEFAULT_TRAIL_POOL_SIZE + 1)).toBe(1)
    expect(poolIndex(12, 5)).toBe(2)
  })

  it('never returns a negative index', () => {
    expect(poolIndex(-1, 5)).toBe(4)
    expect(poolIndex(-7, 5)).toBe(3)
  })
})

describe('distance', () => {
  it('measures euclidean distance between points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
    expect(distance({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(0)
  })
})
