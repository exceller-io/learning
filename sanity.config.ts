import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { courseSchema, categorySchema, authorSchema, articleSchema } from './sanity/schemas'
import { sanityEnv } from './sanity/env'

export default defineConfig({
  name: 'default',
  title: 'Exceller learning platform',
  basePath: "/studio",
  ...sanityEnv,
  plugins: [structureTool()],
  schema: {
    types: [courseSchema, categorySchema, authorSchema, articleSchema],
  },
})
