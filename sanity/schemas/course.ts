import { defineField, defineType } from 'sanity'

export const courseSchema = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().min(3),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'description', type: 'text', rows: 4 }),
    defineField({ name: 'price', type: 'number', initialValue: 0 }),
    defineField({ name: 'isFree', type: 'boolean', initialValue: false }),
    defineField({ name: 'isPublished', type: 'boolean', initialValue: false }),
    defineField({ name: 'imageUrl', type: 'url' }),
    defineField({ name: 'instructorId', type: 'string' }),
    defineField({ name: 'instructorName', type: 'string' }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'modules',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'module',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'description', type: 'text' }),
            defineField({ name: 'position', type: 'number', initialValue: 0 }),
            defineField({
              name: 'lessons',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'lesson',
                  fields: [
                    defineField({
                      name: 'title',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({ name: 'description', type: 'text' }),
                    defineField({
                      name: 'content',
                      title: 'Content',
                      type: 'array',
                      of: [{ type: 'block' }],
                    }),
                    defineField({ name: 'videoUrl', type: 'url' }),
                    defineField({ name: 'isFree', type: 'boolean', initialValue: false }),
                    defineField({ name: 'position', type: 'number', initialValue: 0 }),
                    defineField({
                      name: 'quiz',
                      title: 'Quiz',
                      type: 'object',
                      fields: [
                        defineField({ name: 'title', type: 'string' }),
                        defineField({
                          name: 'questions',
                          type: 'array',
                          of: [
                            {
                              type: 'object',
                              name: 'question',
                              fields: [
                                defineField({
                                  name: 'text',
                                  type: 'text',
                                  validation: (rule) => rule.required(),
                                }),
                                defineField({
                                  name: 'options',
                                  type: 'array',
                                  of: [{ type: 'string' }],
                                }),
                                defineField({ name: 'correctAnswer', type: 'string' }),
                              ],
                              preview: { select: { title: 'text' } },
                            },
                          ],
                        }),
                      ],
                    }),
                  ],
                  preview: { select: { title: 'title' } },
                },
              ],
            }),
          ],
          preview: { select: { title: 'title' } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
