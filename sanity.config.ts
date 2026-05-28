import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { courseSchema, categorySchema, userProfileSchema } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Exceller Learning',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [structureTool()],
  schema: {
    types: [courseSchema, categorySchema, userProfileSchema],
  },
})
