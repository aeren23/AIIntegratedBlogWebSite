import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Spinner } from 'flowbite-react';
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
import { hydrateArticleHtml, resolveApiAssetUrl } from '../../../utils/apiAssets';
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
  const authorName = useMemo(() => {
    return (
      article?.author?.profile?.displayName?.trim() ||
      article?.author?.username ||
      'Unknown'
    );
  }, [article?.author?.profile?.displayName, article?.author?.username]);
  const authorAvatar = useMemo(
    () => resolveApiAssetUrl(article?.author?.profile?.profileImageUrl),
    [article?.author?.profile?.profileImageUrl],
  );
  const authorInitial = (authorName || 'U').slice(0, 1).toUpperCase();

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
                {article.author && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
                      {authorAvatar ? (
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{authorInitial}</span>
                      )}
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-slate-900">{authorName}</p>
                      <p className="text-xs text-slate-500">Author</p>
                    </div>
                  </div>
                )}
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

            <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.02] to-cyan-500/[0.02]" />
              
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/25">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Discussion</h2>
                      <p className="text-sm text-slate-500">
                        {commentCount} comment{commentCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={loadComments}
                    disabled={isCommentsLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className={`h-4 w-4 ${isCommentsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>

                {commentError && (
                  <Alert color="failure" className="mt-4 rounded-xl">
                    <span className="font-medium">Comment error.</span> {commentError}
                  </Alert>
                )}

                <div className="mt-6">
                  {isAuthenticated ? (
                    <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 p-5">
                      <p className="mb-3 text-sm font-medium text-slate-700">Join the conversation</p>
                      <CommentForm onSubmit={(content) => handleCreateComment(content)} />
                    </div>
                    ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
                      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300">
                          <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-700">Join the discussion</p>
                          <p className="mt-1 text-sm text-slate-500">Log in to share your thoughts and engage with the community.</p>
                        </div>
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Sign in
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {isCommentsLoading ? (
                    <CommentSkeleton rows={3} />
                  ) : (
                    <CommentTree
                      comments={comments}
                      mode="public"
                      emptyMessage="No comments yet. Be the first to share your thoughts!"
                      onReply={(parentId, content) => handleCreateComment(content, parentId)}
                      onEdit={handleUpdateComment}
                      onSoftDelete={handleSoftDelete}
                      onHardDelete={handleHardDelete}
                    />
                  )}
                </div>
              </div>
            </section>
          </>
        ) : (
          <Alert color="warning">Article not found.</Alert>
        )}
      </div>

      <aside className="space-y-6">
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-pink-500/[0.02]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg shadow-purple-500/25">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Similar Articles</h2>
            </div>
            
            {isLoading ? (
              <div className="mt-5 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[16/9] w-full rounded-xl bg-slate-100" />
                    <div className="mt-3 h-4 w-3/4 rounded-lg bg-slate-100" />
                    <div className="mt-2 h-3 w-1/2 rounded-lg bg-slate-50" />
                  </div>
                ))}
              </div>
            ) : similarArticles.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">No related articles found yet.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {similarArticles.map((item) => {
                  const itemCover = (item as Article & { coverImageUrl?: string | null }).coverImageUrl;
                  const contentMatch = item.content?.match(/<img[^>]+src=["']([^"']+)["']/i);
                  const coverImage = resolveApiAssetUrl(itemCover) ?? (contentMatch?.[1] ? resolveApiAssetUrl(contentMatch[1]) : null);
                  
                  return (
                    <Link
                      key={item.id}
                      to={`/articles/${item.slug}`}
                      className="group/card block overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-purple-200/50 hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      {/* Image */}
                      <div className="aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg className="h-8 w-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover/card:text-purple-700">
                          {item.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ArticleDetailPage;
