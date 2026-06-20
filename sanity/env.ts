/**
 * Sanity environment configuration.
 *
 * The starter ships Sanity "built in" but project-agnostic — every client gets
 * their own Sanity project. Nothing here throws when env vars are missing, so a
 * freshly cloned site still builds and runs unchanged. Sanity activates the
 * moment NEXT_PUBLIC_SANITY_PROJECT_ID is set (run `pnpm setup-sanity`).
 *
 * Gate any data fetching / Studio rendering on `isSanityConfigured`.
 */

/** Dated API version. Pin to the day you start; never use a floating `vX`. */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-06-01'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

/** Real project id once wired in (empty on a fresh clone). */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

/** True once a real Sanity project id is present. Guard fetches/Studio on this. */
export const isSanityConfigured = projectId.length > 0

/**
 * Non-empty id used to *construct* the client/Studio config so module imports
 * never throw on a fresh clone. Requests against it simply no-op behind the
 * `isSanityConfigured` guards.
 */
export const safeProjectId = projectId || 'placeholder'

/** Where the embedded Studio is mounted. Used by stega for click-to-edit. */
export const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || '/studio'
