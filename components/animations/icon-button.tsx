'use client'

import { useRef, useEffect, type ReactNode, type ComponentType } from 'react'
import gsap from 'gsap'
import { ArrowUpRight, type IconProps } from '@phosphor-icons/react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  computeIconSwap,
  buildIconSwapVars,
  DEFAULT_ICON_SIZE,
  DEFAULT_SWAP_DIRECTION,
  type SwapDirection,
} from '@/lib/motion/icon-button'
import { cn } from '@/lib/utils'

type PhosphorIcon = ComponentType<IconProps>

interface IconButtonProps {
  /** Label text shown beside the icon. */
  children?: ReactNode
  /** A Phosphor icon component (defaults to ArrowUpRight) or any node. */
  icon?: PhosphorIcon | ReactNode
  /** Icon + mask size in px — also the swap travel distance. */
  iconSize?: number
  /** Diagonal the primary icon exits toward on hover. */
  direction?: SwapDirection
  onClick?: () => void
  className?: string
  'aria-label'?: string
}

function isIconComponent(icon: unknown): icon is PhosphorIcon {
  // Plain function components.
  if (typeof icon === 'function') return true
  // forwardRef / memo components are objects carrying $$typeof but, unlike a
  // rendered ReactElement, they have no `props`. Phosphor icons are forwardRef.
  return (
    typeof icon === 'object' &&
    icon !== null &&
    '$$typeof' in icon &&
    !('props' in icon)
  )
}

/**
 * IconButton — GSAP masked-icon-swap button (element-scoped).
 *
 * A pill button whose icon lives in a clipped square mask with a duplicate
 * stacked behind it. On hover the visible icon slides out along a diagonal
 * while the duplicate slides in from the opposite corner to take its place —
 * a crisp, premium "the button is alive" micro-interaction. Both icons share
 * one tween (0.5s power3.inOut, travel = icon size). Renders its settled state
 * server-side (label + icon visible, no-JS safe); the swap layers on the
 * client. Respects prefers-reduced-motion: no mask listeners, no duplicate
 * motion, the single icon stays put.
 *
 * Do NOT also bind Framer Motion to the icon transforms (x/y) — the two
 * libraries will fight over the same matrix.
 *
 * Clean-room reference: annnimate "IconButton" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function IconButton({
  children,
  icon = ArrowUpRight,
  iconSize = DEFAULT_ICON_SIZE,
  direction = DEFAULT_SWAP_DIRECTION,
  onClick,
  className,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const primaryRef = useRef<HTMLSpanElement>(null)
  const duplicateRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  const IconCmp = isIconComponent(icon) ? icon : null
  const renderIcon = () =>
    IconCmp ? <IconCmp size={iconSize} weight="bold" /> : (icon as ReactNode)

  useEffect(() => {
    if (prefersReduced) return
    const root = rootRef.current
    const primary = primaryRef.current
    const duplicate = duplicateRef.current
    if (!root || !primary || !duplicate) return

    const ctx = gsap.context(() => {
      const geo = computeIconSwap({ size: iconSize, direction })
      const vars = buildIconSwapVars()

      // seed rest positions: duplicate parked just outside the mask
      gsap.set(primary, { x: geo.primaryRest.x, y: geo.primaryRest.y })
      gsap.set(duplicate, { x: geo.duplicateRest.x, y: geo.duplicateRest.y })

      const enter = () => {
        gsap.to(primary, { ...vars, x: geo.primaryHover.x, y: geo.primaryHover.y })
        gsap.to(duplicate, { ...vars, x: geo.duplicateHover.x, y: geo.duplicateHover.y })
      }
      const leave = () => {
        gsap.to(primary, { ...vars, x: geo.primaryRest.x, y: geo.primaryRest.y })
        gsap.to(duplicate, { ...vars, x: geo.duplicateRest.x, y: geo.duplicateRest.y })
      }

      root.addEventListener('mouseenter', enter)
      root.addEventListener('mouseleave', leave)
      root.addEventListener('focus', enter)
      root.addEventListener('blur', leave)

      return () => {
        root.removeEventListener('mouseenter', enter)
        root.removeEventListener('mouseleave', leave)
        root.removeEventListener('focus', enter)
        root.removeEventListener('blur', leave)
      }
    }, root)

    return () => ctx.revert()
  }, [iconSize, direction, prefersReduced])

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90',
        className,
      )}
    >
      {children != null && <span>{children}</span>}
      <span
        className="relative inline-flex shrink-0 overflow-hidden"
        style={{ width: iconSize, height: iconSize }}
        aria-hidden="true"
      >
        <span ref={primaryRef} className="absolute inset-0 inline-flex">
          {renderIcon()}
        </span>
        {!prefersReduced && (
          <span ref={duplicateRef} className="absolute inset-0 inline-flex">
            {renderIcon()}
          </span>
        )}
      </span>
    </button>
  )
}
