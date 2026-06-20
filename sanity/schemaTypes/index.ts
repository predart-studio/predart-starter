import type { SchemaTypeDefinition } from 'sanity'

// Documents
import { siteSettings } from './documents/siteSettings'
import { page } from './documents/page'
import { post } from './documents/post'
import { author } from './documents/author'
import { category } from './documents/category'

// Objects
import { seo } from './objects/seo'
import { link } from './objects/link'
import { blockContent } from './objects/blockContent'

// Page-builder blocks
import { pageBuilder } from './blocks/pageBuilder'
import { hero } from './blocks/hero'
import { featureGrid } from './blocks/featureGrid'
import { testimonials } from './blocks/testimonials'
import { callToAction } from './blocks/callToAction'
import { richTextBlock } from './blocks/richTextBlock'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    siteSettings,
    page,
    post,
    author,
    category,
    // Objects
    seo,
    link,
    blockContent,
    // Page-builder
    pageBuilder,
    hero,
    featureGrid,
    testimonials,
    callToAction,
    richTextBlock,
  ],
}
