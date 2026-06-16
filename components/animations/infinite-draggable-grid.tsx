'use client'

import { useRef, useEffect, useMemo } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  computeCellPlacements,
  recycledItemIndex,
  DEFAULT_GRID,
  type GridConfig,
} from '@/lib/motion/infinite-draggable-grid'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable, InertiaPlugin)
}

const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/grid1/240/320',
  'https://picsum.photos/seed/grid2/240/320',
  'https://picsum.photos/seed/grid3/240/320',
  'https://picsum.photos/seed/grid4/240/320',
  'https://picsum.photos/seed/grid5/240/320',
  'https://picsum.photos/seed/grid6/240/320',
  'https://picsum.photos/seed/grid7/240/320',
  'https://picsum.photos/seed/grid8/240/320',
  'https://picsum.photos/seed/grid9/240/320',
]

interface InfiniteDraggableGridProps {
  /** Source images, cycled across the recycled buffer cells. */
  images?: string[]
  /**
   * Buffer / cell geometry. Defaults match the studied annnimate grid
   * (6×6 buffer, 240×320 cells, 132px gap).
   */
  config?: Partial<GridConfig>
  /**
   * Add momentum after a flick (GSAP InertiaPlugin). The reference demo snaps
   * to rest on release (no glide), so this defaults to false.
   */
  inertia?: boolean
  className?: string
}

/**
 * InfiniteDraggableGrid — GSAP Draggable + modulo-wrap 2D plane (area-scoped).
 *
 * A grid of image tiles you can grab and pan in ANY direction. A small fixed
 * buffer of cells (6×6) is recycled with positive-modulo wrapping on each axis:
 * a tile that exits one edge instantly reappears on the opposite edge, so a
 * handful of DOM nodes read as an endless plane. Drag is captured by a GSAP
 * Draggable on an invisible proxy (type 'x,y'); on each drag tick the proxy's
 * raw x/y feed computeCellPlacements(), and a per-tile quickSetter writes the
 * wrapped transforms — cheap, interruptible, GPU-friendly. Tracks the pointer
 * 1:1 with no per-tile scale/opacity (matching the reference). Inertia is off
 * by default (the demo snaps to rest); opt in via `inertia`.
 *
 * Reduced motion: renders a STATIC grid of tiles at their resting positions —
 * no Draggable, no listeners, no wrapping. The JSX already reads as a plain
 * gallery with no JS.
 *
 * Do NOT also bind Framer Motion to these tiles' transforms (x/y) — the two
 * libraries will fight over the same matrix.
 *
 * Clean-room reference: annnimate "InfiniteDraggableGrid" — behavior only.
 * Implementation is standard GSAP (see gsap-plugins / gsap-react skills).
 */
export function InfiniteDraggableGrid({
  images = PLACEHOLDER_IMAGES,
  config,
  inertia = false,
  className,
}: InfiniteDraggableGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const proxyRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<Array<HTMLDivElement | null>>([])
  const prefersReduced = usePrefersReducedMotion()

  const grid = useMemo<GridConfig>(
    () => ({ ...DEFAULT_GRID, ...config }),
    [config],
  )

  // Stable buffer of cells (cols × rows), each mapped to a recycled image.
  const cells = useMemo(() => {
    const count = grid.cols * grid.rows
    return Array.from({ length: count }, (_, index) => ({
      index,
      image: images[recycledItemIndex(index, images.length)],
    }))
  }, [grid.cols, grid.rows, images])

  useEffect(() => {
    if (prefersReduced) return
    const container = containerRef.current
    const proxy = proxyRef.current
    if (!container || !proxy) return

    const ctx = gsap.context(() => {
      // One quickSetter per tile for cheap transform writes.
      const setters = tileRefs.current.map((el) =>
        el ? gsap.quickSetter(el, 'css') : null,
      )

      const apply = (offsetX: number, offsetY: number) => {
        const placements = computeCellPlacements(grid, offsetX, offsetY)
        for (const p of placements) {
          const set = setters[p.index]
          if (set) set({ x: p.x, y: p.y })
        }
      }

      // Initial layout at rest.
      apply(0, 0)

      const draggable = Draggable.create(proxy, {
        // Drag is initiated anywhere on the container; the invisible proxy is
        // what actually moves and whose x/y we read for the wrap math.
        trigger: container,
        type: 'x,y',
        // No visual bounds — the wrap handles the "infinite" feel.
        inertia,
        onDrag() {
          apply(this.x, this.y)
        },
        onThrowUpdate() {
          apply(this.x, this.y)
        },
      })

      return () => {
        draggable.forEach((d) => d.kill())
      }
    }, container)

    return () => ctx.revert()
  }, [grid, inertia, prefersReduced])

  // Reduced motion: static gallery at resting positions, no drag, no listeners.
  if (prefersReduced) {
    const placements = computeCellPlacements(grid, 0, 0)
    return (
      <div
        className={cn(
          'relative h-[60vh] w-full overflow-hidden bg-muted',
          className,
        )}
      >
        {cells.map((cell) => {
          const p = placements[cell.index]
          return (
            <div
              key={cell.index}
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-lg"
              style={{
                width: grid.cellW,
                height: grid.cellH,
                transform: `translate(${p.x}px, ${p.y}px)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cell.image}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-[60vh] w-full cursor-grab touch-none overflow-hidden bg-muted active:cursor-grabbing',
        className,
      )}
    >
      {/* Invisible drag proxy: GSAP Draggable reads its x/y, the grid wraps. */}
      <div ref={proxyRef} className="pointer-events-none absolute h-px w-px opacity-0" />

      {cells.map((cell, i) => (
        <div
          key={cell.index}
          ref={(el) => {
            tileRefs.current[i] = el
          }}
          className="absolute left-1/2 top-1/2 overflow-hidden rounded-lg will-change-transform"
          style={{ width: grid.cellW, height: grid.cellH }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cell.image}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}
