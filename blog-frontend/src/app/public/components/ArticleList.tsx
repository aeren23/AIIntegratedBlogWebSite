import { Badge, Pagination } from 'flowbite-react';
import { Link } from 'react-router-dom';
import type { Article } from '../../../api/article.api';
import { resolveApiAssetUrl } from '../../../utils/apiAssets';

type ArticleListProps = {
  articles: Article[];
  emptyMessage: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
};

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const resolveCoverImage = (article: Article) => {
  const withImages = article as Article & {
    coverImageUrl?: string | null;
    imageUrls?: string[] | null;
    images?: Array<{ url?: string | null }> | null;
  };

  const candidates = [
    withImages.coverImageUrl,
    withImages.imageUrls?.[0],
    withImages.images?.[0]?.url,
  ].filter(Boolean) as string[];

  const contentMatch = article.content?.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (contentMatch?.[1]) {
    candidates.push(contentMatch[1]);
  }

  for (const candidate of candidates) {
    const resolved = resolveApiAssetUrl(candidate) ?? candidate;
    if (resolved) {
      return resolved;
    }
  }
  return null;
};

const ArticleList = ({
  articles,
  emptyMessage,
  currentPage = 1,
  totalPages,
  onPageChange,
  showPagination,
}: ArticleListProps) => {
  const shouldShowPagination =
    showPagination ?? Boolean(onPageChange && totalPages && totalPages > 1);

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-teal-100/60 bg-white/90 p-8 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => {
        const coverImage = resolveCoverImage(article);
        return (
          <article
            key={article.id}
            className="group rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={article.title}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-teal-100 via-white to-cyan-100" />
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{article.commentsCount ?? 0} comments</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  {article.category ? (
                    <Link
                      to={`/category/${article.category.slug}`}
                      className="text-teal-700 hover:text-teal-600"
                    >
                      {article.category.name}
                    </Link>
                  ) : (
                    <span className="text-slate-400">Uncategorized</span>
                  )}
                </div>

                <Link
                  to={`/articles/${article.slug}`}
                  className="text-lg font-semibold text-slate-900 hover:text-teal-600"
                >
                  {article.title}
                </Link>
                <p className="text-sm text-slate-600">
                  {stripHtml(article.content).slice(0, 180)}...
                </p>

                {(article.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(article.tags ?? []).slice(0, 4).map((tag) => (
                      <Badge
                        key={tag.id}
                        className="!border !border-teal-200 !bg-teal-100 !text-teal-700"
                      >
                        <Link to={`/tag/${tag.slug}`}>#{tag.name}</Link>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}

      {shouldShowPagination && onPageChange && totalPages && (
        <div className="flex items-center justify-end pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showIcons
          />
        </div>
      )}
    </div>
  );
};

export default ArticleList;
