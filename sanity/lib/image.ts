import { createImageUrlBuilder } from '@sanity/image-url'

import { dataset, safeProjectId } from '../env'

const builder = createImageUrlBuilder({ projectId: safeProjectId, dataset })

/** Anything `urlFor` accepts (image object, asset ref, asset id, …). */
export type ImageSource = Parameters<typeof builder.image>[0]

/**
 * Build a Sanity image URL. Always pass the raw image object (keeps hotspot /
 * crop intact) and chain `.width()` / `.height()` / `.fit()` as needed.
 *
 *   urlFor(image).width(1200).auto('format').url()
 */
export function urlFor(source: ImageSource) {
  return builder.image(source)
}
