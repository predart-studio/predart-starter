import { describe, it, expect } from 'vitest'
import {
  pushLevel,
  popLevel,
  trackOffset,
  stackDepth,
  resolveLevels,
  hasChildren,
  type DrawerItem,
} from '@/lib/motion/multi-level-drawer-menu'

const tree: DrawerItem[] = [
  {
    label: 'Running',
    children: [
      { label: 'Road', href: '#road' },
      { label: 'Trail', href: '#trail' },
    ],
  },
  { label: 'Events', href: '#events' },
]

describe('multi-level-drawer-menu logic', () => {
  it('push increments depth and shifts the track left by one panel width', () => {
    const stack0 = pushLevel([], 0)
    expect(stack0).toEqual([0])
    expect(stackDepth(stack0)).toBe(1)
    expect(trackOffset(stackDepth(stack0), 320)).toBe(-320)
  })

  it('pop decrements depth back toward the root (offset returns to 0)', () => {
    const pushed = pushLevel([], 0)
    const popped = popLevel(pushed)
    expect(popped).toEqual([])
    expect(stackDepth(popped)).toBe(0)
    expect(trackOffset(stackDepth(popped), 320)).toBe(0)
  })

  it('pop never goes below the root', () => {
    expect(popLevel([])).toEqual([])
    expect(stackDepth(popLevel([]))).toBe(0)
  })

  it('offset math is -depth * width and monotonic with depth', () => {
    expect(trackOffset(0, 388)).toBe(0)
    expect(trackOffset(1, 388)).toBe(-388)
    expect(trackOffset(2, 388)).toBe(-776)
    expect(trackOffset(3, 100)).toBeLessThan(trackOffset(2, 100))
  })

  it('resolveLevels returns root then the selected branch children', () => {
    const levels = resolveLevels(tree, [0])
    expect(levels).toHaveLength(2)
    expect(levels[0]).toBe(tree)
    expect(levels[1].map((i) => i.label)).toEqual(['Road', 'Trail'])
  })

  it('resolveLevels stops at a leaf (no children to descend into)', () => {
    const levels = resolveLevels(tree, [1]) // Events has no children
    expect(levels).toHaveLength(1)
    expect(levels[0]).toBe(tree)
  })

  it('hasChildren distinguishes parents from leaves', () => {
    expect(hasChildren(tree[0])).toBe(true)
    expect(hasChildren(tree[1])).toBe(false)
    expect(hasChildren(undefined)).toBe(false)
  })
})
