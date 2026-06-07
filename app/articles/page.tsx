import { sanityClient } from "@/lib/sanity";
import {
  articlesListQuery,
  articleTagsQuery,
  type SanityArticleListItem,
} from "@/lib/sanity-queries";
import { Navbar } from "@/components/layout/navbar";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleSearchInput } from "@/components/articles/article-search-input";
import { FileText } from "lucide-react";

interface SearchParams {
  search?: string;
  tag?: string;
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [articles, tags] = await Promise.all([
    sanityClient.fetch<SanityArticleListItem[]>(articlesListQuery, {
      search: params.search ?? "",
      tagFilter: params.tag ?? "",
    }),
    sanityClient.fetch<string[]>(articleTagsQuery),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="mt-2 text-gray-500">
            {articles.length} article{articles.length !== 1 ? "s" : ""} available
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ArticleSearchInput defaultValue={params.search} />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <a
                href="/articles"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !params.tag
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </a>
              {tags.map((tag) => (
                <a
                  key={tag}
                  href={`/articles?tag=${encodeURIComponent(tag)}${params.search ? `&search=${params.search}` : ""}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    params.tag === tag
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </a>
              ))}
            </div>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-500">No articles found</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
