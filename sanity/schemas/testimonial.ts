import { defineField, defineType } from 'sanity'

export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Customer name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Job title',
      type: 'string',
    }),
    defineField({
      name: 'company',
      type: 'string',
    }),
    defineField({
      name: 'avatar',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.min(1).max(5),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers appear first',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Show on home page',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isPublished',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      role: 'role',
      company: 'company',
      media: 'avatar',
    },
    prepare({ title, role, company, media }) {
      return {
        title,
        subtitle: [role, company].filter(Boolean).join(', '),
        media,
      }
    },
  },
})
