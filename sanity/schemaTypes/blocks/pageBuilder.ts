import { defineType, defineArrayMember } from 'sanity'

/**
 * The page-builder array. Add new section blocks here (and a matching renderer
 * in components/sanity/page-builder.tsx) to extend what editors can compose.
 */
export const pageBuilder = defineType({
  name: 'pageBuilder',
  title: 'Page builder',
  type: 'array',
  of: [
    defineArrayMember({ type: 'hero' }),
    defineArrayMember({ type: 'featureGrid' }),
    defineArrayMember({ type: 'testimonials' }),
    defineArrayMember({ type: 'callToAction' }),
    defineArrayMember({ type: 'richTextBlock' }),
  ],
  options: {
    insertMenu: {
      views: [{ name: 'list' }],
    },
  },
})
