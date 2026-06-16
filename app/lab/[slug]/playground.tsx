'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowClockwise,
  ArrowLeft,
  Browsers,
  CornersIn,
  CornersOut,
  DeviceMobile,
  DeviceTablet,
  Laptop,
  Monitor,
  type Icon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Device {
  id: string
  label: string
  /** null = fluid (fills the stage). */
  width: number | null
  Icon: Icon
}

const DEVICES: Device[] = [
  { id: 'full', label: 'FULL', width: null, Icon: Browsers },
  { id: 'mobile', label: 'MOBILE', width: 375, Icon: DeviceMobile },
  { id: 'tablet', label: 'TABLET', width: 768, Icon: DeviceTablet },
  { id: 'laptop', label: 'LAPTOP', width: 1024, Icon: Laptop },
  { id: 'desktop', label: 'DESKTOP', width: 1440, Icon: Monitor },
]

/**
 * Playground — the isolation chrome around one motion component.
 *
 * A device-preset toolbar (FULL / MOBILE / TABLET / LAPTOP / DESKTOP) drives the
 * width of an <iframe> pointed at `/lab/<slug>/frame`, which renders ONLY that
 * component in a bare scrollable document. Because it's a real iframe the
 * component gets a genuine viewport (real media queries), its own scroll context
 * (ScrollTrigger pins/scrubs work), and isolated position:fixed — so it behaves
 * exactly as it would on a production page. REPLAY (R) remounts the frame to
 * re-run entrance animations; FULLSCREEN (F) expands the stage.
 */
export function Playground({
  slug,
  name,
  category,
  hint,
}: {
  slug: string
  name: string
  category: string
  hint?: string
}) {
  const [deviceId, setDeviceId] = useState('full')
  const [reloadKey, setReloadKey] = useState(0)
  const [pxWidth, setPxWidth] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0]

  const replay = useCallback(() => setReloadKey((k) => k + 1), [])

  const toggleFullscreen = useCallback(() => {
    const el = stageRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void el.requestFullscreen()
    }
  }, [])

  // Live px readout — measure the real rendered iframe width (fluid or preset).
  useEffect(() => {
    const el = iframeRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      setPxWidth(Math.round(entry.contentRect.width))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Keyboard: R = replay, F = fullscreen. Ignore while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        replay()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [replay, toggleFullscreen])

  return (
    <div className="flex h-dvh flex-col bg-background font-mono text-foreground">
      {/* Toolbar */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-foreground/10 px-4 py-3 md:px-6">
        <Link
          href="/lab"
          className="flex items-center gap-2 text-[11px] uppercase tracking-tight text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} weight="bold" />
          Lab
        </Link>

        <span className="hidden h-5 w-px bg-foreground/10 md:block" aria-hidden />

        {/* Device presets */}
        <div className="flex items-center gap-1">
          {DEVICES.map((d) => {
            const active = d.id === deviceId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDeviceId(d.id)}
                aria-pressed={active}
                title={d.width ? `${d.label} — ${d.width}px` : d.label}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] uppercase tracking-tight transition-colors',
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <d.Icon size={14} weight={active ? 'fill' : 'regular'} />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            )
          })}
        </div>

        {/* px readout */}
        <div className="flex items-center gap-1.5 text-[11px] tracking-tight">
          <span className="text-foreground">{pxWidth ?? '—'}</span>
          <span className="text-muted-foreground">PX</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ToolbarButton onClick={replay} icon={ArrowClockwise} label="Replay" keycap="R" />
          <ToolbarButton
            onClick={toggleFullscreen}
            icon={isFullscreen ? CornersIn : CornersOut}
            label={isFullscreen ? 'Exit' : 'Fullscreen'}
            keycap="F"
          />
        </div>
      </header>

      {/* Component meta strip */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2 text-[11px] uppercase tracking-tight md:px-6">
        <span className="text-foreground">{name}</span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {hint ? <span className="hidden md:inline">{hint}</span> : null}
          <span className="size-1.5 rounded-full bg-foreground/60" aria-hidden />
          {category}
        </span>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative flex flex-1 items-stretch justify-center overflow-hidden bg-secondary/40 p-3 md:p-6"
      >
        <div
          className="h-full overflow-hidden rounded-lg border border-foreground/10 bg-background shadow-sm transition-[width] duration-300 ease-out"
          style={{ width: device.width ?? '100%', maxWidth: '100%' }}
        >
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={`/lab/${slug}/frame`}
            title={`${name} preview`}
            className="size-full"
          />
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({
  onClick,
  icon: IconCmp,
  label,
  keycap,
}: {
  onClick: () => void
  icon: Icon
  label: string
  keycap: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-md border border-foreground/15 px-2.5 py-1.5 text-[11px] uppercase tracking-tight text-foreground transition-colors hover:bg-secondary"
    >
      <IconCmp size={14} weight="bold" />
      <span className="hidden sm:inline">{label}</span>
      <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
        {keycap}
      </kbd>
    </button>
  )
}
