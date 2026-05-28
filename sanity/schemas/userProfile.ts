import { defineField, defineType } from 'sanity'

export const userProfileSchema = defineType({
  name: 'userProfile',
  title: 'User Profile',
  type: 'document',
  fields: [
    defineField({ name: 'userId', type: 'string', validation: r => r.required() }),
    defineField({ name: 'displayName', type: 'string' }),
    defineField({
      name: 'avatar',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'displayName', subtitle: 'userId' },
  },
})
