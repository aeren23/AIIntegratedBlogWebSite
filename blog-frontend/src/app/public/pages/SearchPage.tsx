import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  TextInput,
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
        <ArticleList
          articles={articles}
          emptyMessage={queryParam ? 'No results found.' : 'Start searching to see results.'}
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
  );
};

export default SearchPage;
