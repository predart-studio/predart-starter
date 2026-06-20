/**
 * Server read token for authenticated / draft reads.
 *
 * Optional — published content works without it. Set SANITY_API_READ_TOKEN
 * (unprefixed = server secret, never `NEXT_PUBLIC_*`) to enable Draft Mode and
 * Presentation preview. next-sanity only ships it to the browser while Draft
 * Mode is active. Do not import this into ordinary client components.
 */
export const token = process.env.SANITY_API_READ_TOKEN || undefined
