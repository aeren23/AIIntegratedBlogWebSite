import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, ListGroup, ListGroupItem, Spinner } from 'flowbite-react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  fetchArticleBySlug,
  fetchArticles,
  type Article,
} from '../../../api/article.api';
import {
  createComment,
  deleteComment,
  fetchCommentsByArticle,
  hardDeleteComment,
  type Comment,
  updateComment,
} from '../../../api/comment.api';
import CommentForm from '../../../components/comments/CommentForm';
import CommentSkeleton from '../../../components/comments/CommentSkeleton';
import CommentTree from '../../../components/comments/CommentTree';
import { useAuth } from '../../../contexts/AuthContext';
import { hydrateArticleHtml } from '../../../utils/apiAssets';
import usePageMeta from '../../../hooks/usePageMeta';

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
  return 'Unable to load article.';
};

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const description = useMemo(
    () => (article?.content ? stripHtml(article.content).slice(0, 160) : ''),
    [article?.content],
  );
  const articleHtml = useMemo(
    () => (article?.content ? hydrateArticleHtml(article.content) : ''),
    [article?.content],
  );

  usePageMeta({
    title: article?.title ? `${article.title} | Blog` : 'Article | Blog',
    description,
  });

  const loadArticle = useCallback(async () => {
    if (!slug) {
      setError('Missing article slug.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const articleResponse = await fetchArticleBySlug(slug);
      setArticle(articleResponse);

      if (articleResponse.tags?.length) {
        const primaryTag = articleResponse.tags[0];
        const related = await fetchArticles({
          page: 1,
          pageSize: 4,
          isAscending: false,
          tagSlug: primaryTag.slug,
        });
        const filtered = related.items.filter((item) => item.slug !== slug);
        setSimilarArticles(filtered.slice(0, 4));
      } else {
        setSimilarArticles([]);
      }
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const loadComments = useCallback(async () => {
    if (!article?.id) {
      return;
    }

    setIsCommentsLoading(true);
    setCommentError(null);
    try {
      const response = await fetchCommentsByArticle(article.id);
      setComments(response);
    } catch (err) {
      setCommentError(resolveErrorMessage(err));
    } finally {
      setIsCommentsLoading(false);
    }
  }, [article?.id]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  useEffect(() => {
    if (article?.id) {
      loadComments();
    }
  }, [article?.id, loadComments]);

  const handleCreateComment = useCallback(
    async (content: string, parentCommentId?: string | null) => {
      if (!article?.id) {
        throw new Error('Missing article id.');
      }
      setCommentError(null);
      try {
        await createComment(article.id, {
          content,
          parentCommentId: parentCommentId ?? undefined,
        });
        await loadComments();
      } catch (err) {
        const message = resolveErrorMessage(err);
        setCommentError(message);
        throw new Error(message);
      }
    },
    [article?.id, loadComments],
  );

  const handleUpdateComment = useCallback(
    async (commentId: string, content: string) => {
      setCommentError(null);
      try {
        await updateComment(commentId, { content });
        await loadComments();
      } catch (err) {
        const message = resolveErrorMessage(err);
        setCommentError(message);
        throw new Error(message);
      }
    },
    [loadComments],
  );

  const handleSoftDelete = useCallback(
    async (commentId: string) => {
      setCommentError(null);
      try {
        await deleteComment(commentId);
        await loadComments();
      } catch (err) {
        setCommentError(resolveErrorMessage(err));
      }
    },
    [loadComments],
  );

  const handleHardDelete = useCallback(
    async (commentId: string) => {
      setCommentError(null);
      try {
        await hardDeleteComment(commentId);
        await loadComments();
      } catch (err) {
        setCommentError(resolveErrorMessage(err));
      }
    },
    [loadComments],
  );

  const commentCount = comments.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[2.2fr_1fr]">
      <div className="space-y-6">
        {error && (
          <Alert color="failure">
            <span className="font-medium">Article error.</span> {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Spinner size="sm" />
            Loading article...
          </div>
        ) : article ? (
          <>
            <article className="rounded-2xl border border-teal-100/70 bg-white/90 p-6 shadow-lg shadow-teal-100/60">
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-teal-600">
                  {article.category ? (
                    <Link to={`/category/${article.category.slug}`} className="hover:text-teal-700">
                      {article.category.name}
                    </Link>
                  ) : (
                    <span>Uncategorized</span>
                  )}
                  <span className="text-slate-300">•</span>
                  <time dateTime={new Date(article.createdAt).toISOString()}>
                    {new Date(article.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <h1 className="text-3xl font-semibold text-slate-900">{article.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {article.tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      className="!border !border-teal-200 !bg-teal-100 !text-teal-700"
                    >
                      <Link to={`/tag/${tag.slug}`}>#{tag.name}</Link>
                    </Badge>
                  ))}
                </div>
              </header>
              <div
                className="prose prose-slate mt-6 max-w-none"
                dangerouslySetInnerHTML={{ __html: articleHtml }}
              />
            </article>

            <section className="rounded-2xl border border-teal-100/70 bg-white/90 p-6 shadow-lg shadow-teal-100/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
                  <p className="text-sm text-slate-600">
                    {commentCount} comment{commentCount === 1 ? '' : 's'}
                  </p>
                </div>
                <Button
                  color="light"
                  size="sm"
                  className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  onClick={loadComments}
                  disabled={isCommentsLoading}
                >
                  Refresh
                </Button>
              </div>

              {commentError && (
                <Alert color="failure" className="mt-4">
                  <span className="font-medium">Comment error.</span> {commentError}
                </Alert>
              )}

              <div className="mt-4">
                {isAuthenticated ? (
                  <CommentForm onSubmit={(content) => handleCreateComment(content)} />
                ) : (
                  <Alert color="info">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span>Log in to join the discussion.</span>
                      <Button
                        as={Link}
                        to="/login"
                        size="xs"
                        color="light"
                        className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      >
                        Go to login
                      </Button>
                    </div>
                  </Alert>
                )}
              </div>

              <div className="mt-6">
                {isCommentsLoading ? (
                  <CommentSkeleton rows={3} />
                ) : (
                  <CommentTree
                    comments={comments}
                    mode="public"
                    emptyMessage="No comments yet."
                    onReply={(parentId, content) => handleCreateComment(content, parentId)}
                    onEdit={handleUpdateComment}
                    onSoftDelete={handleSoftDelete}
                    onHardDelete={handleHardDelete}
                  />
                )}
              </div>
            </section>
          </>
        ) : (
          <Alert color="warning">Article not found.</Alert>
        )}
      </div>

      <aside className="space-y-6">
        <Card className="border border-teal-100/70 bg-white/90 shadow-lg shadow-teal-100/40">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Similar articles</h2>
          </div>
          {isLoading ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <Spinner size="sm" />
              Loading...
            </div>
          ) : similarArticles.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No related articles found yet.
            </p>
          ) : (
            <ListGroup className="mt-4 divide-y divide-teal-100/70 border-none">
              {similarArticles.map((item) => (
                <ListGroupItem key={item.id} className="bg-transparent px-0 py-3">
                  <Link to={`/articles/${item.slug}`} className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </Card>
      </aside>
    </div>
  );
};

export default ArticleDetailPage;
