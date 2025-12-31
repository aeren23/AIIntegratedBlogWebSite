import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from 'flowbite-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { fetchArticles, type Article } from '../../../api/article.api';
import { fetchCategoryBySlug, type Category } from '../../../api/category.api';
import ArticleTableSkeleton from '../components/ArticleTableSkeleton';
import usePageMeta from '../../../hooks/usePageMeta';

const PAGE_SIZE = 8;

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
        <div className="rounded-2xl border border-white/70 bg-white/90 shadow-lg shadow-teal-100/60">
          <Table className="w-full text-sm">
            <TableHead className="bg-teal-50/70 text-slate-700">
              <TableHeadCell>Article</TableHeadCell>
              <TableHeadCell>Tags</TableHeadCell>
              <TableHeadCell>Published</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-teal-100/70">
              {articles.length === 0 ? (
                <TableRow className="bg-white/80">
                  <TableCell colSpan={3} className="py-6 text-center text-slate-500">
                    No articles found in this category.
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
                    <TableCell className="text-xs text-slate-500">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
