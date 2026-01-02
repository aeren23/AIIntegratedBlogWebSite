import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
} from 'flowbite-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { fetchArticles, type Article } from '../../../api/article.api';
import { fetchTags, type Tag } from '../../../api/tag.api';
import ArticleList from '../components/ArticleList';
import ArticleTableSkeleton from '../components/ArticleTableSkeleton';
import usePageMeta from '../../../hooks/usePageMeta';

const PAGE_SIZE = 6;

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
  return 'Unable to load articles.';
};

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [featuredTags, setFeaturedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: 'Articles | Blog',
    description: 'Discover the latest articles, popular discussions, and featured tags.',
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchArticles({ page, pageSize: PAGE_SIZE, isAscending: false });
      setArticles(response.items);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const loadSidebar = useCallback(async () => {
    setIsSidebarLoading(true);
    try {
      const [popularSeed, latest, tags] = await Promise.all([
        fetchArticles({ page: 1, pageSize: 20, isAscending: false }),
        fetchArticles({ page: 1, pageSize: 5, isAscending: false }),
        fetchTags(),
      ]);
      const popular = [...popularSeed.items]
        .sort((a, b) => (b.commentsCount ?? 0) - (a.commentsCount ?? 0))
        .slice(0, 5);
      setPopularArticles(popular);
      setLatestArticles(latest.items.slice(0, 5));
      setFeaturedTags(tags.slice(0, 8));
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    loadSidebar();
  }, [loadSidebar]);

  return (
    <div className="relative min-h-screen">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gradient-to-br from-teal-200/30 to-cyan-200/30 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-200/20 to-teal-200/20 blur-3xl" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[280px_1fr_280px]">
        {/* Left Sidebar */}
        <aside className="space-y-6">
          {/* Most Popular */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.03] to-cyan-500/[0.03]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-lg shadow-orange-500/25">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-800">Most Popular</h2>
              </div>
              
              {isSidebarLoading ? (
                <div className="mt-5 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 w-3/4 rounded-lg bg-slate-100" />
                      <div className="h-3 w-1/2 rounded-lg bg-slate-50" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 space-y-1">
                  {popularArticles.map((article, index) => (
                    <Link
                      key={article.id}
                      to={`/articles/${article.slug}`}
                      className="group/item flex items-start gap-3 rounded-xl px-2 py-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-xs font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-slate-700 transition-colors group-hover/item:text-teal-700">
                          {article.title}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {article.commentsCount ?? 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Latest */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-teal-500/[0.03]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/25">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-800">Latest</h2>
              </div>
              
              {isSidebarLoading ? (
                <div className="mt-5 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 w-3/4 rounded-lg bg-slate-100" />
                      <div className="h-3 w-1/2 rounded-lg bg-slate-50" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 space-y-1">
                  {latestArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/articles/${article.slug}`}
                      className="group/item block rounded-xl px-2 py-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-cyan-50/80"
                    >
                      <p className="line-clamp-2 text-sm font-medium text-slate-700 transition-colors group-hover/item:text-teal-700">
                        {article.title}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-400">
                        {new Date(article.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="space-y-8">
          {/* Hero Header */}
          <header className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-teal-50/50 p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-teal-100/50 to-cyan-100/50 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Fresh Content</span>
              </div>
              <h1 className="mt-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-4xl font-bold text-transparent">
                Latest Articles
              </h1>
              <p className="mt-3 max-w-lg text-base text-slate-600">
                Discover editorials, engineering insights, and product news from our community.
              </p>
            </div>
          </header>

          {error && (
            <Alert color="failure">
              <span className="font-medium">Article error.</span> {error}
            </Alert>
          )}

          {isLoading ? (
            <ArticleTableSkeleton rows={5} />
          ) : (
            <ArticleList
              articles={articles}
              emptyMessage="No articles found."
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
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Featured Tags */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-pink-500/[0.03]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-500/25">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-800">Featured Tags</h2>
              </div>
              
              {isSidebarLoading ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
                  ))}
                </div>
              ) : featuredTags.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">No tags available yet.</p>
              ) : (
                <div className="mt-5 flex flex-wrap gap-2">
                  {featuredTags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/tag/${tag.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-teal-200 hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 hover:shadow-md"
                    >
                      <span className="text-teal-500">#</span>
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search CTA */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 p-6 shadow-xl shadow-teal-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold">Looking for something?</h3>
              <p className="mt-2 text-sm text-white/80">
                Search across categories, tags, and articles.
              </p>
              <Link
                to="/search"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 shadow-lg transition-all duration-300 hover:gap-3 hover:shadow-xl"
              >
                Search articles
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.03]" />
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800">Stay Updated</h3>
              <p className="mt-2 text-sm text-slate-600">
                Get notified when new articles are published.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
