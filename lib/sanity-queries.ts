// TypeScript types that mirror the Sanity document schemas

export type SanityQuestion = {
  _key: string
  text: string
  options: string[]
  correctAnswer: string
}

export type SanityQuiz = {
  title: string
  questions: SanityQuestion[]
}

export type SanityLesson = {
  _key: string
  title: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any[]
  videoUrl?: string
  isFree: boolean
  position: number
  quiz?: SanityQuiz
}

export type SanityModule = {
  _key: string
  title: string
  description?: string
  position: number
  lessons: SanityLesson[]
}

export type SanityAuthor = {
  _id: string
  firstName: string
  lastName: string
  email: string
  bio?: string
  skills?: string[]
  userId: string
}

export type SanityCourse = {
  _id: string
  _createdAt: string
  _updatedAt: string
  title: string
  slug?: { current: string }
  description?: string
  price: number
  isFree: boolean
  isPublished: boolean
  isFeatured: boolean
  imageUrl?: string
  author?: SanityAuthor
  category?: { _id: string; name: string }
  modules: SanityModule[]
}

export type SanityCourseListItem = {
  _id: string
  _createdAt: string
  title: string
  description?: string
  price: number
  isFree: boolean
  isPublished: boolean
  isFeatured: boolean
  imageUrl?: string
  author?: { firstName: string; lastName: string }
  category?: { _id: string; name: string }
  moduleCount: number
  lessonCount: number
}

export type SanityCategory = {
  _id: string
  name: string
  slug?: { current: string }
}

export type SanityUserProfile = {
  userId: string
  displayName?: string
  avatar?: {
    _type: 'image'
    asset: { _ref: string; _type: 'reference' }
    hotspot?: { x: number; y: number; height: number; width: number }
  }
}

// ─── GROQ queries ────────────────────────────────────────────────────────────

export const coursesListQuery = `
  *[_type == "course" && isPublished == true
    && ($search == "" || title match ($search + "*"))
    && ($categoryId == "" || category->_id == $categoryId)
  ]{
    _id, _createdAt, title, description, price, isFree, isPublished, imageUrl,
    "author": author->{ firstName, lastName },
    "category": category->{ _id, name },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[])
  } | order(_createdAt desc)
`

export const courseByIdQuery = `
  *[_type == "course" && !(_id in path("drafts.**")) && _id == $id][0]{
    _id, _createdAt, _updatedAt, title, slug, description, price, isFree, isPublished, imageUrl,
    "author": author->{ _id, firstName, lastName, email, bio, skills, userId },
    "category": category->{ _id, name },
    modules[]{
      _key, title, description, position,
      lessons[] | order(position asc){
        _key, title, description, videoUrl, isFree, position,
        content[]{
          ...,
          _type == "image" => {
            ...,
            "asset": asset->{ _id, url, metadata }
          }
        },
        quiz{ title, questions[]{ _key, text, options, correctAnswer } }
      }
    } | order(position asc)
  }
`

export const coursesByAuthorQuery = `
  *[_type == "course" && !(_id in path("drafts.**")) && author->userId == $userId]{
    _id, _createdAt, title, isPublished, isFree, price,
    "category": category->{ _id, name },
    "moduleCount": count(modules)
  } | order(_createdAt desc)
`

export const allCoursesAdminQuery = `
  *[_type == "course" && !(_id in path("drafts.**"))] | order(_createdAt desc) [0...5]{
    _id, _createdAt, title, isPublished, isFree, price,
    "author": author->{ firstName, lastName },
    "category": category->{ _id, name }
  }
`

export const courseCountQuery = `count(*[_type == "course" && !(_id in path("drafts.**"))])`

export const featuredCoursesQuery = `
  *[_type == "course" && isPublished == true && isFeatured == true]{
    _id, _createdAt, title, description, price, isFree, isPublished, isFeatured, imageUrl,
    "author": author->{ firstName, lastName },
    "category": category->{ _id, name },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[])
  } | order(_createdAt desc)
`

// ─── Article types ───────────────────────────────────────────────────────────

export type SanityArticle = {
  _id: string
  _createdAt: string
  title: string
  slug: { current: string }
  summary: string
  coverImageUrl?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[]
  author?: { firstName: string; lastName: string }
  tags?: string[]
  readingTimeMinutes?: number
  isPublished: boolean
  isFeatured: boolean
  publishedAt?: string
}

export type SanityArticleListItem = {
  _id: string
  title: string
  slug: { current: string }
  summary: string
  coverImageUrl?: string
  author?: { firstName: string; lastName: string }
  tags?: string[]
  readingTimeMinutes?: number
  publishedAt?: string
}

// ─── Article GROQ queries ─────────────────────────────────────────────────────

export const latestArticlesQuery = `
  *[_type == "article" && isPublished == true] | order(publishedAt desc) [0...6] {
    _id, title, slug, summary,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{ firstName, lastName },
    tags, readingTimeMinutes, publishedAt
  }
`

export const featuredArticlesQuery = `
  *[_type == "article" && isPublished == true && isFeatured == true] | order(publishedAt desc) [0...3] {
    _id, title, slug, summary,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{ firstName, lastName },
    tags, readingTimeMinutes, publishedAt
  }
`

export const articlesListQuery = `
  *[_type == "article" && isPublished == true
    && ($search == "" || title match ($search + "*"))
    && ($tagFilter == "" || $tagFilter in tags)
  ] | order(publishedAt desc) {
    _id, title, slug, summary,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{ firstName, lastName },
    tags, readingTimeMinutes, publishedAt
  }
`

export const articleTagsQuery = `
  array::unique(*[_type == "article" && isPublished == true].tags[])
`

export const articleBySlugQuery = `
  *[_type == "article" && isPublished == true && slug.current == $slug][0]{
    _id, _createdAt, title, slug, summary,
    "coverImageUrl": coverImage.asset->url,
    body[]{
      ...,
      _type == "image" => {
        ...,
        "asset": asset->{ url, metadata }
      }
    },
    "author": author->{ firstName, lastName },
    tags, readingTimeMinutes, isPublished, isFeatured, publishedAt
  }
`

export const categoriesQuery = `
  *[_type == "category" && !(_id in path("drafts.**"))] | order(name asc){ _id, name, slug }
`

export const authorByUserIdQuery = `
  *[_type == "author" && !(_id in path("drafts.**")) && userId == $userId][0]{ _id, firstName, lastName, email, bio, skills, userId }
`

// ─── Testimonial types ───────────────────────────────────────────────────────

export type SanityTestimonial = {
  _id: string
  name: string
  role?: string
  company?: string
  avatarUrl?: string
  quote: string
  rating?: number
}

// ─── Testimonial GROQ queries ─────────────────────────────────────────────────

export const featuredTestimonialsQuery = `
  *[_type == "testimonial" && isPublished == true && isFeatured == true]
    | order(order asc, _createdAt desc) [0...6] {
    _id, name, role, company,
    "avatarUrl": avatar.asset->url,
    quote, rating
  }
`

// Finds a quiz by its lesson _key (quiz is embedded 1:1 inside each lesson)
export const quizByLessonKeyQuery = `
  *[_type == "course" && !(_id in path("drafts.**"))]{
    modules[]{
      lessons[_key == $key]{
        quiz{ title, questions[]{ _key, text, options, correctAnswer } }
      }
    }
  }
`
