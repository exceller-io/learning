import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import type { SanityArticleListItem } from "@/lib/sanity-queries";
import { RatingStars } from "@/components/shared/rating-stars";
import type { RatingSummary } from "@/lib/ratings";

interface ArticleCardProps {
  article: SanityArticleListItem;
  rating?: RatingSummary;
}

export function ArticleCard({ article, rating }: ArticleCardProps) {
  const authorName = article.author
    ? `${article.author.firstName} ${article.author.lastName}`.trim()
    : null;

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Link href={`/articles/${article.slug.current}`} className="group block">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-44 w-full bg-gradient-to-br from-indigo-400 to-purple-500">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                className="h-14 w-14 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34" />
                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                <path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z" />
              </svg>
            </div>
          )}
          {article.tags && article.tags.length > 0 && (
            <div className="absolute left-3 top-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {article.tags[0]}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 group-hover:text-indigo-600">
            {article.title}
          </h3>
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-500">
            {article.summary}
          </p>

          {rating && (
            <div className="mb-3">
              <RatingStars rating={rating} />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              {authorName && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {authorName}
                </span>
              )}
              {article.readingTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readingTimeMinutes} min read
                </span>
              )}
            </div>
            {formattedDate && <span>{formattedDate}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
