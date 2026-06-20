import { defineType, defineField } from 'sanity'
import { ArrowRightIcon } from '@sanity/icons'

export const callToAction = defineType({
  name: 'callToAction',
  title: 'Call to action',
  type: 'object',
  icon: ArrowRightIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'body', type: 'text', rows: 2 }),
    defineField({ name: 'button', type: 'link' }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title || 'Call to action', subtitle: 'Call to action' }
    },
  },
})
