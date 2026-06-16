'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getSnapshot() {
  return typeof window !== 'undefined' && !!window.matchMedia
    ? window.matchMedia(QUERY).matches
    : false
}

function getServerSnapshot() {
  return false
}

/**
 * usePrefersReducedMotion — SSR-safe subscription to the reduced-motion media
 * query via useSyncExternalStore (no setState-in-effect).
 *
 * Returns `true` when the user requests reduced motion. Animation wrappers use
 * this to render their FINAL state immediately and skip GSAP timelines / the
 * word-flip rotator. Server + first client render return `false` to avoid a
 * hydration mismatch, then settle to the real value.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
