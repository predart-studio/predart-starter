import { defineLive } from 'next-sanity/live'

import { client } from './client'
import { token } from './token'

/**
 * Live Content API (next-sanity v11+). `sanityFetch` is the server fetcher used
 * across the app; `<SanityLive />` (mounted once in the root layout) pushes
 * real-time updates to every fetch. The token is only required for Draft Mode /
 * Presentation — published reads work without it.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
