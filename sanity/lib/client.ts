import { createClient } from 'next-sanity'

import { apiVersion, dataset, safeProjectId, studioUrl } from '../env'

/**
 * Shared Sanity client. `useCdn: false` keeps server-rendered / statically
 * generated reads fresh; the Live Content API (see ./live) layers real-time
 * updates on top. `stega.studioUrl` enables click-to-edit overlays in Draft
 * Mode and is stripped from production reads automatically.
 */
export const client = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: false,
  stega: {
    studioUrl,
  },
})
