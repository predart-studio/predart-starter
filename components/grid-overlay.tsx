'use client'

import { useEffect, useState } from 'react'

/**
 * GridOverlay — dev-only visual proof of the shared 12-column grid.
 *
 * Press "g" (outside a text field) to toggle. It draws 12 column guides using
 * the EXACT same geometry as GridWrap — same page margin, same max-width, same
 * `--grid-gutter` — so the guides ARE the content columns at every width
 * (Müller-Brockmann §2.2: the overlay must share the content box, or it drifts).
 *
 * Never renders or binds keys in production.
 */
export function GridOverlay() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (t?.isContentEditable) return
      if (e.key === 'g' || e.key === 'G') setOn((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (process.env.NODE_ENV === 'production' || !on) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] px-[var(--spacing-gutter)]"
      aria-hidden="true"
    >
      <div className="mx-auto grid h-full max-w-[var(--container-content)] grid-cols-12 gap-x-[var(--grid-gutter)]">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="h-full bg-primary/[0.07] ring-1 ring-inset ring-primary/20"
          />
        ))}
      </div>
    </div>
  )
}
