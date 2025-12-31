import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  Spinner,
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
    title: 'Blog | Latest Articles',
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
    <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr_1fr]">
      <aside className="space-y-6">
        <div className="rounded-2xl border border-teal-100/60 bg-white/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            Most popular
          </h2>
          {isSidebarLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Spinner size="sm" />
              Loading...
            </div>
          ) : (
            <ListGroup className="mt-4 divide-y divide-teal-100/70 border-none">
              {popularArticles.map((article) => (
                <ListGroupItem key={article.id} className="bg-transparent px-0 py-3">
                  <Link to={`/articles/${article.slug}`} className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">{article.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{article.commentsCount ?? 0} comments</span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </div>

        <div className="rounded-2xl border border-teal-100/60 bg-white/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            Latest
          </h2>
          {isSidebarLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Spinner size="sm" />
              Loading...
            </div>
          ) : (
            <ListGroup className="mt-4 divide-y divide-teal-100/70 border-none">
              {latestArticles.map((article) => (
                <ListGroupItem key={article.id} className="bg-transparent px-0 py-3">
                  <Link to={`/articles/${article.slug}`} className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">{article.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </div>
      </aside>

      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Content hub</p>
          <h1 className="text-3xl font-semibold text-slate-900">Latest stories</h1>
          <p className="text-sm text-slate-600">
            Discover editorials, engineering insights, and product news.
          </p>
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

      <aside className="space-y-6">
        <div className="rounded-2xl border border-teal-100/60 bg-white/90 p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            Featured tags
          </h2>
          {isSidebarLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Spinner size="sm" />
              Loading...
            </div>
          ) : featuredTags.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No tags available yet.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredTags.map((tag) => (
                <Badge
                  key={tag.id}
                  className="!border !border-cyan-200 !bg-cyan-100 !text-cyan-700"
                >
                  <Link to={`/tag/${tag.slug}`}>#{tag.name}</Link>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-teal-100/60 bg-gradient-to-br from-white via-teal-50/40 to-cyan-50/40 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Looking for something specific?</h3>
          <p className="mt-2 text-sm text-slate-500">
            Search across categories, tags, and full-text articles.
          </p>
          <Button
            as={Link}
            to="/search"
            size="sm"
            className="mt-4 !border-teal-200 !bg-teal-500 !text-white hover:!bg-teal-600"
          >
            Search articles
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
