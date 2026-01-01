import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
} from 'flowbite-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { fetchArticles, type Article } from '../../../api/article.api';
import { fetchCategoryBySlug, type Category } from '../../../api/category.api';
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
  return 'Unable to load category.';
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  usePageMeta({
    title: category ? `${category.name} | Category` : 'Category',
    description: category ? `Articles in ${category.name}.` : undefined,
  });

  const loadCategory = useCallback(async () => {
    if (!slug) {
      setError('Missing category slug.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [categoryResponse, articleResponse] = await Promise.all([
        fetchCategoryBySlug(slug),
        fetchArticles({
          page,
          pageSize: PAGE_SIZE,
          isAscending: false,
          categorySlug: slug,
        }),
      ]);
      setCategory(categoryResponse);
      setArticles(articleResponse.items);
      setTotalCount(articleResponse.totalCount);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, slug]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to="/" className="hover:text-teal-600">
          Home
        </Link>{' '}
        /{' '}
        <span className="text-slate-400">Category</span>{' '}
        /{' '}
        <span className="text-slate-700">{category?.name ?? '...'}</span>
      </nav>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Category</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {category?.name ?? 'Category'}
        </h1>
        <p className="text-sm text-slate-600">
          {totalCount} article{totalCount === 1 ? '' : 's'} found.
        </p>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Category error.</span> {error}
        </Alert>
      )}

      {isLoading ? (
        <ArticleTableSkeleton rows={4} />
      ) : (
        <ArticleList
          articles={articles}
          emptyMessage="No articles found in this category."
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

export default CategoryPage;
