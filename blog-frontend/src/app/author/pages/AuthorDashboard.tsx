import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, ListGroup, ListGroupItem, Spinner } from 'flowbite-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchArticles, type Article } from '../../../api/article.api';
import { useAuth } from '../../../contexts/AuthContext';

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
  return 'Unable to load author dashboard.';
};

const AuthorDashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    if (!user?.id) {
      setError('Unable to resolve your author profile.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pageSize = 20;
      const firstPage = await fetchArticles({ page: 1, pageSize, isAscending: false });
      const totalPages = Math.max(1, Math.ceil(firstPage.totalCount / pageSize));
      let items = [...firstPage.items];

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await fetchArticles({ page, pageSize, isAscending: false });
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

  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((article) => article.isPublished).length;
    const drafts = total - published;
    const comments = articles.reduce((sum, article) => sum + (article.commentsCount ?? 0), 0);
    return { total, published, drafts, comments };
  }, [articles]);

  const recentArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [articles]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-500">Workspace</p>
          <h2 className="text-3xl font-semibold text-slate-900">Author Dashboard</h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Track your publishing flow, keep drafts moving, and stay on top of reader
            feedback.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            as={Link}
            to="/author/articles"
            color="light"
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            View articles
          </Button>
          <Button
            as={Link}
            to="/author/articles/new"
            className="!border-amber-200 !bg-amber-500 !text-white hover:!bg-amber-600"
          >
            New article
          </Button>
        </div>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Dashboard error.</span> {error}
        </Alert>
      )}

      {(isLoading || isAuthLoading) && (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner size="sm" />
          Loading author metrics...
        </div>
      )}

      {!isLoading && !isAuthLoading && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border border-amber-100/70 bg-white/90 shadow-lg shadow-amber-200/50">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-500">Total</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.total}</p>
              <p className="mt-2 text-xs text-slate-500">Articles created</p>
            </Card>
            <Card className="border border-emerald-100/70 bg-white/90 shadow-lg shadow-emerald-200/50">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">Published</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.published}</p>
              <p className="mt-2 text-xs text-slate-500">Live stories</p>
            </Card>
            <Card className="border border-sky-100/70 bg-white/90 shadow-lg shadow-sky-200/50">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-500">Drafts</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.drafts}</p>
              <p className="mt-2 text-xs text-slate-500">In progress</p>
            </Card>
            <Card className="border border-violet-100/70 bg-white/90 shadow-lg shadow-violet-200/50">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-500">Comments</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.comments}</p>
              <p className="mt-2 text-xs text-slate-500">Across your articles</p>
            </Card>
          </section>

          <section>
            <Card className="border border-white/70 bg-white/90 shadow-lg shadow-amber-200/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Recently created</h3>
                  <p className="text-sm text-slate-600">
                    Only your articles are listed here.
                  </p>
                </div>
                <Button
                  as={Link}
                  to="/author/articles"
                  color="light"
                  size="sm"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  See all
                </Button>
              </div>
              {recentArticles.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-amber-200 bg-amber-50/70 p-6 text-center text-sm text-amber-700">
                  No articles yet. Draft your first piece to kickstart your author space.
                </div>
              ) : (
                <ListGroup className="mt-4 divide-y divide-amber-100/70 border-none">
                  {recentArticles.map((article) => (
                    <ListGroupItem
                      key={article.id}
                      className="flex flex-wrap items-center justify-between gap-3 bg-transparent px-0 py-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">{article.title}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          <span>{article.commentsCount ?? 0} comments</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            article.isPublished
                              ? '!border !border-emerald-200 !bg-emerald-100 !text-emerald-700'
                              : '!border !border-amber-200 !bg-amber-100 !text-amber-700'
                          }
                        >
                          {article.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <Button
                          as={Link}
                          to={`/author/articles/${article.id}/edit`}
                          size="xs"
                          className="!border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-100"
                        >
                          Edit
                        </Button>
                      </div>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
};

export default AuthorDashboard;
