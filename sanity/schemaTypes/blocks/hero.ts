import { defineType, defineField, defineArrayMember } from 'sanity'
import { RocketIcon } from '@sanity/icons'

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: RocketIcon,
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({
      name: 'heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'subheading', type: 'text', rows: 3 }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      type: 'array',
      of: [defineArrayMember({ type: 'link' })],
      validation: (rule) => rule.max(2),
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare({ title, media }) {
      return { title: title || 'Hero', subtitle: 'Hero', media: media ?? RocketIcon }
    },
  },
})
