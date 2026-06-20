import { defineType, defineField } from 'sanity'
import { TextIcon } from '@sanity/icons'

export const richTextBlock = defineType({
  name: 'richTextBlock',
  title: 'Rich text',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({ name: 'content', title: 'Content', type: 'blockContent' }),
  ],
  preview: {
    prepare: () => ({ title: 'Rich text', subtitle: 'Rich text' }),
  },
})
