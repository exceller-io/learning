import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { codeInput } from '@sanity/code-input'
import { table } from '@sanity/table'
import { courseSchema, categorySchema, authorSchema, articleSchema, testimonialSchema } from './sanity/schemas'
import { sanityEnv } from './sanity/env'

export default defineConfig({
  name: 'default',
  title: 'Exceller learning platform',
  basePath: "/studio",
  ...sanityEnv,
  plugins: [structureTool(), codeInput(), table()],
  schema: {
    types: [courseSchema, categorySchema, authorSchema, articleSchema, testimonialSchema],
  },
})
