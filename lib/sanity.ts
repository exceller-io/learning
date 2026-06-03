import { createClient, type SanityClient } from 'next-sanity'
import { createImageUrlBuilder, type ImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import { sanityEnv } from '../sanity/env'

// Defers createClient (which validates projectId) to first actual use so the
// module can be imported during next build without env vars present.
function makeLazyClient(extra: Record<string, unknown> = {}): SanityClient {
  let instance: SanityClient | undefined
  return new Proxy({} as SanityClient, {
    get(_target, prop) {
      instance ??= createClient({ ...sanityEnv, ...extra })
      const val = Reflect.get(instance, prop, instance)
      return typeof val === 'function' ? val.bind(instance) : val
    },
  })
}

export const sanityClient = makeLazyClient({ useCdn: process.env.NODE_ENV === 'production', perspective: 'published' })

// Server-side only — requires SANITY_API_TOKEN with Editor permissions
export const sanityWriteClient = makeLazyClient({ useCdn: false })

let builder: ImageUrlBuilder | undefined

export function urlFor(source: SanityImageSource) {
  builder ??= createImageUrlBuilder(sanityClient)
  return builder.image(source)
}
