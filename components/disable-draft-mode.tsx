'use client'

import { useIsPresentationTool } from 'next-sanity/hooks'

/**
 * Floating "exit draft mode" affordance. Hidden inside the Studio's Presentation
 * tool (which has its own controls); only shown when previewing the live site
 * directly. Mounted in the root layout when Draft Mode is active.
 */
export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool()

  // Show only once we know we're NOT inside Presentation (false). While the
  // hook is still resolving (null) or inside Presentation (true), stay hidden.
  if (isPresentationTool !== false) return null

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg"
    >
      Disable draft mode
    </a>
  )
}
