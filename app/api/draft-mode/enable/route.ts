import { defineEnableDraftMode } from 'next-sanity/draft-mode'

import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/lib/token'

/**
 * Enables Next.js Draft Mode and redirects into the previewed route. Called by
 * the Studio's Presentation tool (previewUrl.previewMode.enable). Requires
 * SANITY_API_READ_TOKEN to read drafts.
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
})
