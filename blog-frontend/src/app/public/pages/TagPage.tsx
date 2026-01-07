import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
} from 'flowbite-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { fetchArticles, type Article } from '../../../api/article.api';
import { fetchTagBySlug, type Tag } from '../../../api/tag.api';
import ArticleList from '../components/ArticleList';
import ArticleTableSkeleton from '../components/ArticleTableSkeleton';
import usePageMeta from '../../../hooks/usePageMeta';

const PAGE_SIZE = 8;

const resolveErrorMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    const apiMessage = (err.response?.data as { errorMessage?: string } | undefined)
      ?.errorMessage;
    if (apiMessage) {
      return apiMessage;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unable to load tag.';
};

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const [tag, setTag] = useState<Tag | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  usePageMeta({
    title: tag ? `${tag.name} | Tag` : 'Tag',
    description: tag ? `Articles tagged ${tag.name}.` : undefined,
  });

  const loadTag = useCallback(async () => {
    if (!slug) {
      setError('Missing tag slug.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [tagResponse, articleResponse] = await Promise.all([
        fetchTagBySlug(slug),
        fetchArticles({
          page,
          pageSize: PAGE_SIZE,
          isAscending: false,
          tagSlug: slug,
          publicOnly: true,
        }),
      ]);
      setTag(tagResponse);
      setArticles(articleResponse.items);
      setTotalCount(articleResponse.totalCount);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, slug]);

  useEffect(() => {
    loadTag();
  }, [loadTag]);

  return (
    <div className="relative min-h-screen">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/30 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-teal-200/20 to-cyan-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link 
            to="/" 
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-teal-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-400">Tag</span>
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 font-medium text-emerald-700">
            #{tag?.name ?? '...'}
          </span>
        </nav>

        {/* Tag Header */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-emerald-50/50 p-8 shadow-xl shadow-slate-200/50 md:p-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-100/60 to-teal-100/60 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-gradient-to-br from-teal-100/40 to-cyan-100/40 blur-3xl" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 shadow-sm">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Tag</span>
            </div>
            
            <h1 className="mt-4 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              #{tag?.name ?? 'Tag'}
            </h1>
            
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-semibold text-slate-700">
                  {totalCount} article{totalCount === 1 ? '' : 's'}
                </span>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 shadow-sm">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-700">
                    Page {page} of {totalPages}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {error && (
          <Alert color="failure" className="rounded-2xl">
            <span className="font-medium">Tag error.</span> {error}
          </Alert>
        )}

        {isLoading ? (
          <ArticleTableSkeleton rows={4} />
        ) : (
          <ArticleList
            articles={articles}
            emptyMessage="No articles tagged yet."
            currentPage={page}
            totalPages={totalPages}
            showPagination={articles.length > 0}
            onPageChange={(nextPage) => {
              const params = new URLSearchParams(searchParams);
              params.set('page', nextPage.toString());
              setSearchParams(params);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TagPage;
