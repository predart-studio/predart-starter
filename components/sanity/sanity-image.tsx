import NextImage from 'next/image'

import { urlFor, type ImageSource } from '@/sanity/lib/image'

type SanityImageInput =
  | ({ asset?: unknown; alt?: string } & Record<string, unknown>)
  | null
  | undefined

/**
 * Renders a Sanity image through next/image with hotspot-aware cropping.
 * Returns null when the image (or its asset) is missing, so it's safe to drop
 * straight into optional CMS fields.
 */
export function SanityImage({
  image,
  alt,
  width = 1200,
  height,
  className,
  sizes,
  priority = false,
}: {
  image: SanityImageInput
  alt?: string
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}) {
  if (!image?.asset) return null

  const computedHeight = height ?? Math.round((width * 2) / 3)
  const url = urlFor(image as unknown as ImageSource)
    .width(width)
    .height(computedHeight)
    .fit('crop')
    .auto('format')
    .url()

  return (
    <NextImage
      src={url}
      alt={alt ?? image.alt ?? ''}
      width={width}
      height={computedHeight}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  )
}
