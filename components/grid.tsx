import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * GridWrap — the single shared content field for the whole page.
 *
 * Replaces the ad-hoc `mx-auto max-w-[var(--container-content)]` wrappers that
 * each section used to roll on its own. Establishes ONE centered max-width box
 * carrying the unified 12-column track + column gutter, so every section places
 * its content on the SAME column lines (via `col-span-*` / `col-start-*`) and
 * element edges line up down the entire page.
 *
 * The page margin (left/right inset) stays on the parent `<section>` as
 * `px-[var(--spacing-gutter)]`; this box is the column field inside it. The dev
 * GridOverlay mirrors this exact geometry so the guides are truthful.
 *
 * Forwards a ref so scroll scenes can measure the field and position
 * absolutely-placed children (e.g. a morphing overlay) against the exact
 * 12-col geometry.
 *
 * Usage:
 *   <section className="px-[var(--spacing-gutter)] py-[var(--spacing-section-y)]">
 *     <GridWrap>
 *       <h2 className="col-span-12 md:col-span-8">…</h2>
 *       <div className="col-span-12 md:col-span-4 md:col-start-9">…</div>
 *     </GridWrap>
 *   </section>
 */
export const GridWrap = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function GridWrap({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto grid w-full max-w-[var(--container-content)] grid-cols-12 gap-x-[var(--grid-gutter)]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
