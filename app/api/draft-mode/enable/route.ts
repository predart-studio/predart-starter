import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { NextResponse } from 'next/server'

import { isSanityConfigured } from '@/sanity/env'
import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/lib/token'

/**
 * Enables Next.js Draft Mode and redirects into the previewed route. Called by
 * the Studio's Presentation tool (previewUrl.previewMode.enable). Requires
 * SANITY_API_READ_TOKEN to read drafts.
 *
 * Guarded on `isSanityConfigured` so an unconfigured clone never enables draft
 * mode against the placeholder project — it 404s instead, matching every other
 * Sanity boundary in the starter.
 */
const handler = isSanityConfigured
  ? defineEnableDraftMode({ client: client.withConfig({ token }) }).GET
  : undefined

export async function GET(request: Request): Promise<Response> {
  if (!handler) {
    return new NextResponse('Sanity is not configured', { status: 404 })
  }
  return handler(request)
}
