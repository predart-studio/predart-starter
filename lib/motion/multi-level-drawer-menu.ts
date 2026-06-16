/**
 * Level-stack navigation math for a multi-level drawer menu. A drawer shows a
 * horizontal track of equal-width level panels; activating a parent item pushes
 * a deeper level (track shifts left by one panel width), the back affordance
 * pops it (track shifts right). Framework-free + DOM-free so it is
 * unit-testable; the MultiLevelDrawerMenu wrapper feeds the result to gsap.to().
 *
 * Model: a stack of indices into the item tree, one per visible level. The
 * track's horizontal offset is -depth * width, where depth = stack.length - 1
 * (0 = root level visible, 1 = first sub-level visible, ...).
 *
 * Clean-room reference: annnimate "MultiLevelDrawerMenu" — behavior only.
 */

export interface DrawerItem {
  label: string
  href?: string
  children?: DrawerItem[]
}

/** Slide duration (s) of both the drawer open and the level-to-level slide. */
export const DEFAULT_DRAWER_DURATION = 0.45
/** Ease — snappy-then-settle (fast out, eased landing), matching the observed curve. */
export const DEFAULT_DRAWER_EASE = 'power3.out'
/** Backdrop/scrim fade duration (s). */
export const DEFAULT_SCRIM_DURATION = 0.3
/** Which edge the drawer enters from. */
export const DEFAULT_DRAWER_SIDE: DrawerSide = 'right'

export type DrawerSide = 'left' | 'right'

/**
 * Depth of the level stack: 0 when only the root level is shown, increasing by
 * one per pushed sub-level. `levelStack` holds the index path into the tree.
 */
export function stackDepth(levelStack: number[]): number {
  return Math.max(0, levelStack.length)
}

/**
 * Horizontal offset (px) of the level track for a given depth and panel width.
 * Each pushed level shifts the track one panel width to the left (negative x),
 * so the next panel slides into view. Depth 0 → 0; depth 1 → -width; etc.
 */
export function trackOffset(depth: number, panelWidth: number): number {
  const d = Math.max(0, depth)
  return -d * panelWidth + 0 // `+ 0` normalizes -0 to 0 at depth 0
}

/**
 * Push a child level. Returns the new stack with `childIndex` appended.
 * No-op (returns the same logical stack) if the index is out of range — the
 * caller should only push items that actually have children.
 */
export function pushLevel(levelStack: number[], childIndex: number): number[] {
  if (childIndex < 0) return levelStack.slice()
  return [...levelStack, childIndex]
}

/** Pop one level (the back affordance). Never goes below the root (empty stack). */
export function popLevel(levelStack: number[]): number[] {
  if (levelStack.length === 0) return []
  return levelStack.slice(0, -1)
}

/**
 * Resolve the list of items visible at each level given the index path. Index 0
 * of the result is the root list; each subsequent entry is the children of the
 * item selected at the previous level. Stops if a path segment has no children.
 */
export function resolveLevels(root: DrawerItem[], levelStack: number[]): DrawerItem[][] {
  const levels: DrawerItem[][] = [root]
  let current = root
  for (const idx of levelStack) {
    const node = current[idx]
    if (!node || !node.children || node.children.length === 0) break
    levels.push(node.children)
    current = node.children
  }
  return levels
}

/** True when `item` opens a deeper level rather than navigating away. */
export function hasChildren(item: DrawerItem | undefined): boolean {
  return !!item && Array.isArray(item.children) && item.children.length > 0
}
