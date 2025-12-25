import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchArticles, updateArticle, type Article } from '../../../api/article.api';
import { useAuth } from '../../../contexts/AuthContext';

const actionButtonBase =
  'gap-1.5 !rounded-lg !px-2.5 !py-1.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40';
const editButtonClass = `${actionButtonBase} !border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-100`;
const publishButtonClass = `${actionButtonBase} !border-emerald-200 !bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100`;
const unpublishButtonClass = `${actionButtonBase} !border-amber-200 !bg-amber-50 !text-amber-700 hover:!bg-amber-100`;

const resolveErrorMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    const apiMessage = (err.response?.data as { errorMessage?: string } | undefined)?.errorMessage;
    if (apiMessage) {
      return apiMessage;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unable to load articles.';
};

const AuthorArticlesPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const pageSize = 8;

  const loadArticles = useCallback(async () => {
    if (!user?.id) {
      setError('Unable to resolve your author profile.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pageLimit = 20;
      const firstPage = await fetchArticles({ page: 1, pageSize: pageLimit, isAscending: false });
      const totalPages = Math.max(1, Math.ceil(firstPage.totalCount / pageLimit));
      let items = [...firstPage.items];

      for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
        const response = await fetchArticles({
          page: currentPage,
          pageSize: pageLimit,
          isAscending: false,
        });
        items = items.concat(response.items);
      }

      const authorArticles = items.filter(
        (article) => article.author?.id === user.id && !article.isDeleted,
      );
      setArticles(authorArticles);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    void loadArticles();
  }, [isAuthLoading, loadArticles]);

  const pagedArticles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return articles.slice(start, start + pageSize);
  }, [articles, page, pageSize]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(articles.length / pageSize)),
    [articles.length, pageSize],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePublishToggle = async (article: Article) => {
    setActiveActionId(article.id);
    setError(null);
    try {
      await updateArticle(article.id, { isPublished: !article.isPublished });
      await loadArticles();
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-500">My articles</p>
          <h2 className="text-2xl font-semibold text-slate-900">Content library</h2>
          <p className="text-sm text-slate-600">
            Manage drafts, publish updates, and track your writing cadence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            color="light"
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
            onClick={loadArticles}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            className="!border-amber-200 !bg-amber-500 !text-white hover:!bg-amber-600"
            onClick={() => navigate('/author/articles/new')}
          >
            New article
          </Button>
        </div>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Article error.</span> {error}
        </Alert>
      )}

      {isLoading || isAuthLoading ? (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner size="sm" />
          Loading articles...
        </div>
      ) : (
        <div className="rounded-2xl border border-white/70 bg-white/90 shadow-lg shadow-amber-200/40">
          <div className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Your articles</h3>
            <p className="text-sm text-slate-600">
              Only articles you authored appear here.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHead className="bg-amber-50/70 text-slate-700">
                <TableHeadCell>Title</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y divide-amber-100/70">
                {pagedArticles.length === 0 ? (
                  <TableRow className="bg-white/80">
                    <TableCell colSpan={4} className="py-6 text-center text-slate-500">
                      No articles yet. Create your first draft.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedArticles.map((article) => (
                    <TableRow key={article.id} className="bg-white/80">
                      <TableCell className="font-medium text-slate-900">
                        <div className="space-y-1">
                          <p>{article.title}</p>
                          <p className="text-xs text-slate-500">/{article.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            article.isPublished
                              ? '!border !border-emerald-200 !bg-emerald-100 !text-emerald-700'
                              : '!border !border-amber-200 !bg-amber-100 !text-amber-700'
                          }
                        >
                          {article.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            color="light"
                            size="xs"
                            className={editButtonClass}
                            onClick={() => navigate(`/author/articles/${article.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            color="light"
                            size="xs"
                            className={
                              article.isPublished ? unpublishButtonClass : publishButtonClass
                            }
                            disabled={activeActionId === article.id}
                            onClick={() => handlePublishToggle(article)}
                          >
                            {article.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end px-5 py-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showIcons
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorArticlesPage;
