import { defineType, defineField, defineArrayMember } from 'sanity'
import { CommentIcon } from '@sanity/icons'

export const testimonials = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({ name: 'heading', type: 'string' }),
    defineField({
      name: 'items',
      type: 'array',
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          name: 'testimonial',
          type: 'object',
          fields: [
            defineField({
              name: 'quote',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'author',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'role', type: 'string' }),
            defineField({
              name: 'avatar',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'author', subtitle: 'role', media: 'avatar' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare({ title, items }) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: title || 'Testimonials',
        subtitle: `Testimonials · ${count} item${count === 1 ? '' : 's'}`,
      }
    },
  },
})
