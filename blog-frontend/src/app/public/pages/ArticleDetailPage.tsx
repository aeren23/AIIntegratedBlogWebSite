import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, ListGroup, ListGroupItem, Spinner } from 'flowbite-react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  fetchArticleBySlug,
  fetchArticles,
  type Article,
} from '../../../api/article.api';
import { fetchCommentsByArticle, type Comment } from '../../../api/comment.api';
import CommentThread, { type CommentNode } from '../components/CommentThread';
import { hydrateArticleHtml } from '../../../utils/apiAssets';
import usePageMeta from '../../../hooks/usePageMeta';

type CommentRecord = {
  id: string;
  content: string;
  createdAt: string;
  author: string;
  parentCommentId: string | null;
};

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

const flattenComments = (
  nodes: Comment[],
  parentCommentId: string | null = null,
): CommentRecord[] => {
  return nodes.flatMap((comment) => {
    const record: CommentRecord = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.user?.username ?? 'Unknown',
      parentCommentId,
    };
    const children = comment.children?.length
      ? flattenComments(comment.children, comment.id)
      : [];
    return [record, ...children];
  });
};

const buildCommentTree = (records: CommentRecord[]) => {
  const nodes = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  records.forEach((record) => {
    nodes.set(record.id, {
      id: record.id,
      content: record.content,
      createdAt: record.createdAt,
      author: record.author,
      children: [],
    });
  });

  records.forEach((record) => {
    const node = nodes.get(record.id);
    if (!node) {
      return;
    }
    if (record.parentCommentId && nodes.has(record.parentCommentId)) {
      nodes.get(record.parentCommentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [commentRecords, setCommentRecords] = useState<CommentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const response = await fetchCommentsByArticle(article.id);
      const flat = flattenComments(response, null);
      setCommentRecords(flat);
    } catch (err) {
      setError(resolveErrorMessage(err));
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

  const commentTree = useMemo(() => buildCommentTree(commentRecords), [commentRecords]);

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
                    {commentRecords.length} comment{commentRecords.length === 1 ? '' : 's'}
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

              {isCommentsLoading ? (
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                  <Spinner size="sm" />
                  Loading comments...
                </div>
              ) : commentTree.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No comments yet.</p>
              ) : (
                <div className="mt-4">
                  <CommentThread nodes={commentTree} />
                </div>
              )}
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
