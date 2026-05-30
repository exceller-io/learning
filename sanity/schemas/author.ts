import { defineField, defineType } from 'sanity'

export const authorSchema = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'firstName',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastName',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'skills',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'userId',
      type: 'string',
    }),
  ],
  preview: {
    select: { first: 'firstName', last: 'lastName', subtitle: 'email' },
    prepare({ first, last, subtitle }) {
      return { title: `${first ?? ''} ${last ?? ''}`.trim(), subtitle }
    },
  },
})
