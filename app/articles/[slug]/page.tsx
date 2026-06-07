import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanityClient } from "@/lib/sanity";
import { articleBySlugQuery, type SanityArticle } from "@/lib/sanity-queries";
import { Navbar } from "@/components/layout/navbar";
import { ArticleBody } from "@/components/articles/article-body";
import { RatingWidget } from "@/components/shared/rating-widget";
import { DisqusComments } from "@/components/shared/disqus-comments";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const article = await sanityClient.fetch<SanityArticle | null>(
    articleBySlugQuery,
    { slug }
  );

  if (!article) notFound();

  const [ratingAggregate, userRatingRecord] = await Promise.all([
    db.rating.aggregate({
      where: { contentType: "article", contentId: slug },
      _avg: { value: true },
      _count: { value: true },
    }),
    session
      ? db.rating.findUnique({
          where: {
            userId_contentType_contentId: {
              userId: session.user.id,
              contentType: "article",
              contentId: slug,
            },
          },
          select: { value: true },
        })
      : null,
  ]);

  const authorName = article.author
    ? `${article.author.firstName} ${article.author.lastName}`.trim()
    : null;

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/articles"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to articles
          </Link>

          <div className="max-w-3xl">
            {article.tags && article.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="mb-4 text-4xl font-bold leading-tight">{article.title}</h1>
            <p className="mb-6 text-lg text-gray-300">{article.summary}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {authorName && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {authorName}
                </span>
              )}
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>
              )}
              {article.readingTimeMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {article.readingTimeMinutes} min read
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* Main content */}
          <div className="lg:col-span-2">
            {article.coverImageUrl && (
              <div className="relative mb-8 overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src={article.coverImageUrl}
                  alt={article.title}
                  width={896}
                  height={480}
                  className="w-full object-cover"
                  priority
                />
              </div>
            )}

            {article.body && article.body.length > 0 ? (
              <ArticleBody body={article.body} />
            ) : (
              <p className="text-gray-500">No content available.</p>
            )}

            {process.env.NEXT_PUBLIC_DISQUS_SHORTNAME && (
              <DisqusComments
                shortname={process.env.NEXT_PUBLIC_DISQUS_SHORTNAME}
                identifier={`article-${slug}`}
                title={article.title}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              {authorName && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Author</p>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                    <User className="h-4 w-4 text-gray-400" />
                    {authorName}
                  </p>
                </div>
              )}

              {formattedDate && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Published</p>
                  <p className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formattedDate}
                  </p>
                </div>
              )}

              {article.readingTimeMinutes && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Reading time</p>
                  <p className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {article.readingTimeMinutes} min read
                  </p>
                </div>
              )}

              {article.tags && article.tags.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Rate this article</p>
                <RatingWidget
                  contentType="article"
                  contentId={slug}
                  initialAverage={ratingAggregate._avg.value}
                  initialCount={ratingAggregate._count.value}
                  initialUserRating={userRatingRecord?.value ?? null}
                  canRate={!!session}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
