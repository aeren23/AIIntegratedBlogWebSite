import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
} from 'flowbite-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { fetchArticles, type Article } from '../../../api/article.api';
import ArticleTableSkeleton from '../components/ArticleTableSkeleton';
import usePageMeta from '../../../hooks/usePageMeta';

const PAGE_SIZE = 8;
const DEBOUNCE_MS = 400;

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

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
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Search</p>
        <h1 className="text-3xl font-semibold text-slate-900">Search articles</h1>
        <p className="text-sm text-slate-600">
          Find articles by title, content, category, or tag.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for NestJS, TypeScript, design systems..."
          className="w-full"
        />
      </form>

      {queryParam && (
        <p className="text-sm text-slate-500">
          {totalCount} results found for <span className="font-semibold">"{queryParam}"</span>
        </p>
      )}

      {error && (
        <Alert color="failure">
          <span className="font-medium">Search error.</span> {error}
        </Alert>
      )}

      {isLoading ? (
        <ArticleTableSkeleton rows={4} />
      ) : (
        <div className="rounded-2xl border border-white/70 bg-white/90 shadow-lg shadow-teal-100/60">
          <Table className="w-full text-sm">
            <TableHead className="bg-teal-50/70 text-slate-700">
              <TableHeadCell>Article</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
              <TableHeadCell>Tags</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-teal-100/70">
              {articles.length === 0 ? (
                <TableRow className="bg-white/80">
                  <TableCell colSpan={3} className="py-6 text-center text-slate-500">
                    {queryParam ? 'No results found.' : 'Start searching to see results.'}
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article.id} className="bg-white/80">
                    <TableCell className="space-y-2">
                      <Link
                        to={`/articles/${article.slug}`}
                        className="text-base font-semibold text-slate-900 hover:text-teal-600"
                      >
                        {article.title}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {stripHtml(article.content).slice(0, 160)}...
                      </p>
                    </TableCell>
                    <TableCell>
                      {article.category ? (
                        <Link
                          to={`/category/${article.category.slug}`}
                          className="text-sm text-teal-700 hover:text-teal-600"
                        >
                          {article.category.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {(article.tags ?? []).slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            className="!border !border-teal-200 !bg-teal-100 !text-teal-700"
                          >
                            <Link to={`/tag/${tag.slug}`}>#{tag.name}</Link>
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {articles.length > 0 && (
            <div className="flex items-center justify-end px-5 py-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(nextPage) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', nextPage.toString());
                  setSearchParams(params);
                }}
                showIcons
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
