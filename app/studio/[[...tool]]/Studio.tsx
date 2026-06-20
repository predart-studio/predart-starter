'use client'

/**
 * Client-only Studio mount. Keeping the Sanity config + <NextStudio> behind a
 * 'use client' boundary ensures the Studio (styled-components / React context)
 * is never evaluated on the server during `next build` page-data collection.
 */
import { NextStudio } from 'next-sanity/studio'

import config from '@/sanity.config'

export default function Studio() {
  return <NextStudio config={config} />
}
