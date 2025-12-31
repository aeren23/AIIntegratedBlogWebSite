import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { fetchTagBySlug, type Tag } from '../../../api/tag.api';
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
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Tag</p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {tag ? `#${tag.name}` : 'Tag'}
        </h1>
        <p className="text-sm text-slate-600">
          {totalCount} article{totalCount === 1 ? '' : 's'} found.
        </p>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Tag error.</span> {error}
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
              <TableHeadCell>Published</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-teal-100/70">
              {articles.length === 0 ? (
                <TableRow className="bg-white/80">
                  <TableCell colSpan={3} className="py-6 text-center text-slate-500">
                    No articles tagged yet.
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

export default TagPage;
