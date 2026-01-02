import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
} from 'flowbite-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { fetchArticles, type Article } from '../../../api/article.api';
import ArticleList from '../components/ArticleList';
import ArticleTableSkeleton from '../components/ArticleTableSkeleton';
import usePageMeta from '../../../hooks/usePageMeta';

const PAGE_SIZE = 8;
const DEBOUNCE_MS = 400;

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
  return 'Unable to load search results.';
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = (searchParams.get('q') || '').trim();
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const [query, setQuery] = useState(queryParam);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  usePageMeta({
    title: queryParam ? `Search "${queryParam}" | Blog` : 'Search | Blog',
    description: queryParam ? `Search results for ${queryParam}.` : 'Search articles.',
  });

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (query === queryParam) {
      return;
    }
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query.trim()) {
        params.set('q', query.trim());
        params.set('page', '1');
      } else {
        params.delete('q');
        params.delete('page');
      }
      setSearchParams(params);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query, queryParam, searchParams, setSearchParams]);

  const loadResults = useCallback(async () => {
    if (!queryParam) {
      setArticles([]);
      setTotalCount(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchArticles({
        page,
        pageSize: PAGE_SIZE,
        isAscending: false,
        keyword: queryParam,
      });
      setArticles(response.items);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, queryParam]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set('q', query.trim());
      params.set('page', '1');
    } else {
      params.delete('q');
      params.delete('page');
    }
    setSearchParams(params);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-3xl" />
        <div className="absolute -right-40 top-1/2 h-80 w-80 rounded-full bg-gradient-to-br from-teal-200/20 to-cyan-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl space-y-8">
        {/* Hero Search Header */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-purple-50/50 p-8 shadow-xl shadow-slate-200/50 md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-100/50 to-pink-100/50 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-gradient-to-br from-teal-100/40 to-cyan-100/40 blur-3xl" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/60 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 shadow-sm">
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">Search</span>
            </div>
            
            <h1 className="mt-4 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              Find Your Next Read
            </h1>
            <p className="mt-3 max-w-lg text-base text-slate-600">
              Search by title, content, category, or tag to discover articles.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for NestJS, TypeScript, design systems..."
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/90 py-4 pl-14 pr-5 text-base text-slate-900 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute inset-y-0 right-16 flex items-center pr-2 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute inset-y-2 right-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </header>

        {/* Results Section */}
        {queryParam && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100">
                <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {totalCount} result{totalCount !== 1 ? 's' : ''} found
                </p>
                <p className="text-xs text-slate-500">
                  for "<span className="font-medium text-purple-600">{queryParam}</span>"
                </p>
              </div>
            </div>
            {totalCount > 0 && (
              <span className="rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 px-3 py-1 text-xs font-medium text-teal-700">
                Page {page} of {totalPages}
              </span>
            )}
          </div>
        )}

        {error && (
          <Alert color="failure" className="rounded-2xl">
            <span className="font-medium">Search error.</span> {error}
          </Alert>
        )}

        {isLoading ? (
          <ArticleTableSkeleton rows={4} />
        ) : (
          <ArticleList
            articles={articles}
            emptyMessage={queryParam ? 'No results found. Try a different search term.' : 'Start searching to see results.'}
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

        {/* Search Tips */}
        {!queryParam && !isLoading && (
          <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/50 p-8 shadow-xl shadow-slate-200/50">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              Search Tips
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">1</span>
                <span>Use keywords from the article title or content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">2</span>
                <span>Search by category name like "Technology" or "Design"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">3</span>
                <span>Try searching for specific tags like "React" or "TypeScript"</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
