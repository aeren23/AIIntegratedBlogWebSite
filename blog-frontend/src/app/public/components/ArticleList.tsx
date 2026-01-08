import { Link } from 'react-router-dom';
import type { Article } from '../../../api/article.api';
import { resolveApiAssetUrl } from '../../../utils/apiAssets';
import Pagination from '../../../components/common/Pagination';

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-20">
        <div className="mb-4 rounded-full bg-slate-100 p-5">
          <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <p className="text-lg text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Horizontal Card Layout */}
      <div className="flex flex-col gap-6">
        {articles.map((article) => {
          const coverImage = resolveCoverImage(article);
          const authorName =
            article.author?.profile?.displayName?.trim() ||
            article.author?.username ||
            'Anonim';
          const authorAvatar = resolveApiAssetUrl(
            article.author?.profile?.profileImageUrl,
          );
          const authorInitial = (authorName || 'A').slice(0, 1).toUpperCase();

          return (
            <article
              key={article.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 md:flex-row"
            >
              {/* Image - Left side on desktop */}
              <Link 
                to={`/articles/${article.slug}`}
                className="relative h-52 w-full flex-shrink-0 overflow-hidden bg-slate-100 md:h-auto md:w-64 lg:w-72"
              >
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
                    <svg className="h-16 w-16 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Category Badge */}
                {article.category && (
                  <span className="absolute left-4 top-4 rounded-lg bg-teal-500 px-3 py-1.5 text-sm font-medium text-white shadow-lg">
                    {article.category.name}
                  </span>
                )}
              </Link>

              {/* Content - Right side on desktop */}
              <div className="flex flex-1 flex-col p-6 lg:p-8">
                {/* Meta info */}
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(article.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {article.commentsCount ?? 0} Comments
                  </span>
                </div>

                {/* Title */}
                <Link
                  to={`/articles/${article.slug}`}
                  className="mb-3 text-xl font-bold leading-tight text-slate-800 transition-colors hover:text-teal-600 lg:text-2xl"
                >
                  {article.title}
                </Link>

                {/* Excerpt */}
                <p className="mb-5 line-clamp-3 flex-1 text-base leading-relaxed text-slate-600">
                  {stripHtml(article.content).slice(0, 200)}...
                </p>

                {/* Tags */}
                {(article.tags ?? []).length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {(article.tags ?? []).slice(0, 4).map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/tag/${tag.slug}`}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-teal-100 hover:text-teal-700"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-bold text-white ring-2 ring-white">
                      {authorAvatar ? (
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{authorInitial}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{authorName}</p>
                      <p className="text-sm text-slate-500">Author</p>
                    </div>
                  </div>

                  {/* Read Button */}
                  <Link
                    to={`/articles/${article.slug}`}
                    className="group/btn flex items-center gap-1.5 rounded-lg bg-teal-500 px-3.5 py-2 text-sm font-medium text-white transition-all hover:bg-teal-600"
                  >
                    Read
                    <svg className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {shouldShowPagination && onPageChange && totalPages && (
        <div className="flex justify-center pt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            theme="teal"
          />
        </div>
      )}
    </div>
  );
};

export default ArticleList;
