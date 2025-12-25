import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Label,
  Select,
  Spinner,
  TextInput,
  ToggleSwitch,
} from 'flowbite-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TurndownService from 'turndown';
import { marked } from 'marked';
import ArticleEditor from '../../../components/article/ArticleEditor';
import { fetchCategories, type Category } from '../../../api/category.api';
import { fetchTags, type Tag } from '../../../api/tag.api';
import {
  createArticle,
  fetchArticleById,
  updateArticle,
  type Article,
} from '../../../api/article.api';
import { fetchCommentsByArticle, type Comment } from '../../../api/comment.api';
import { useAuth } from '../../../contexts/AuthContext';

type ArticleFormState = {
  title: string;
  slug: string;
  categoryId: string;
  content: string;
  isPublished: boolean;
  tagIds: string[];
};

type FlatComment = Comment & { depth: number };

marked.setOptions({
  breaks: true,
  gfm: true,
});

const resolveErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const apiMessage = (err.response?.data as { errorMessage?: string } | undefined)?.errorMessage;
    if (apiMessage) {
      return apiMessage;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const flattenComments = (items: Comment[], depth = 0): FlatComment[] => {
  return items.flatMap((comment) => {
    const node: FlatComment = { ...comment, depth };
    const children = comment.children?.length
      ? flattenComments(comment.children, depth + 1)
      : [];
    return [node, ...children];
  });
};

const depthClass = (depth: number) => {
  if (depth >= 3) {
    return 'pl-10';
  }
  if (depth === 2) {
    return 'pl-8';
  }
  if (depth === 1) {
    return 'pl-4';
  }
  return 'pl-0';
};

const AuthorArticleEditorPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const isNew = !articleId;
  const [formState, setFormState] = useState<ArticleFormState>({
    title: '',
    slug: '',
    categoryId: '',
    content: '',
    isPublished: false,
    tagIds: [],
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [articleData, setArticleData] = useState<Article | null>(null);
  const [isOwner, setIsOwner] = useState(true);
  const [articleDeleted, setArticleDeleted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const turndownService = useMemo(() => new TurndownService(), []);

  const loadEditorData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setComments([]);

    try {
      const [categoryList, tagList] = await Promise.all([fetchCategories(), fetchTags()]);
      setCategories(categoryList);
      setTags(tagList);

      if (isNew) {
        setArticleData(null);
        setArticleDeleted(false);
        setIsOwner(true);
        setComments([]);
        setFormState({
          title: '',
          slug: '',
          categoryId: '',
          content: '',
          isPublished: false,
          tagIds: [],
        });
        setSlugTouched(false);
        setIsLoading(false);
        return;
      }

      if (!articleId) {
        setError('Missing article id.');
        setIsLoading(false);
        return;
      }

      const article = await fetchArticleById(articleId);
      setArticleData(article);
      setArticleDeleted(article.isDeleted);
      const ownerMatch = Boolean(user?.id && article.author?.id === user.id);
      setIsOwner(ownerMatch);
      if (!ownerMatch) {
        setError('You can only edit your own articles in the Author panel.');
      }

      const markdownContent = turndownService.turndown(article.content ?? '');
      setFormState({
        title: article.title,
        slug: article.slug,
        categoryId: article.category?.id ?? '',
        content: markdownContent,
        isPublished: article.isPublished,
        tagIds: article.tags?.map((tag) => tag.id) ?? [],
      });
      setSlugTouched(true);
    } catch (err) {
      setError(resolveErrorMessage(err, 'Unable to load article.'));
    } finally {
      setIsLoading(false);
    }
  }, [articleId, isNew, turndownService, user?.id]);

  const loadComments = useCallback(async () => {
    if (!articleId || !isOwner || articleDeleted) {
      setComments([]);
      return;
    }

    setIsCommentsLoading(true);
    try {
      const response = await fetchCommentsByArticle(articleId);
      setComments(response);
    } catch (err) {
      setError(resolveErrorMessage(err, 'Unable to load comments.'));
    } finally {
      setIsCommentsLoading(false);
    }
  }, [articleDeleted, articleId, isOwner]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    void loadEditorData();
  }, [isAuthLoading, loadEditorData]);

  useEffect(() => {
    if (!isNew) {
      void loadComments();
    }
  }, [isNew, loadComments]);

  const flatComments = useMemo(() => flattenComments(comments), [comments]);

  const canEdit = isOwner && !articleDeleted;

  const handleSave = async () => {
    if (!canEdit) {
      return;
    }

    if (!formState.title.trim() || !formState.slug.trim() || !formState.categoryId) {
      setError('Title, slug, and category are required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const htmlContent = marked.parse(formState.content) as string;
      if (isNew) {
        const created = await createArticle({
          title: formState.title.trim(),
          slug: formState.slug.trim(),
          content: htmlContent,
          categoryId: formState.categoryId,
          isPublished: formState.isPublished,
          tagIds: formState.tagIds,
        });
        navigate(`/author/articles/${created.id}/edit`);
        return;
      }

      if (!articleId) {
        setError('Missing article id.');
        return;
      }

      await updateArticle(articleId, {
        title: formState.title.trim(),
        slug: formState.slug.trim(),
        content: htmlContent,
        categoryId: formState.categoryId,
        isPublished: formState.isPublished,
        tagIds: formState.tagIds,
      });
      setSuccess('Changes saved successfully.');
    } catch (err) {
      setError(resolveErrorMessage(err, 'Unable to save article.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-500">Editor</p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {isNew ? 'New Article' : 'Edit Article'}
          </h2>
          <p className="text-sm text-slate-600">
            {isNew
              ? 'Draft your next story, then upload images after the first save.'
              : 'Refine your draft, update tags, and publish when ready.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            color="light"
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
            onClick={() => navigate('/author/articles')}
          >
            Back to articles
          </Button>
          {canEdit && (
            <Button
              className="!border-amber-200 !bg-amber-500 !text-white hover:!bg-amber-600"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : isNew ? 'Create article' : 'Save changes'}
            </Button>
          )}
        </div>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Editor error.</span> {error}
        </Alert>
      )}

      {success && (
        <Alert color="success">
          <span className="font-medium">Saved.</span> {success}
        </Alert>
      )}

      {articleDeleted && (
        <Alert color="warning">
          This article is deleted and cannot be edited in the Author panel.
        </Alert>
      )}

      {isLoading || isAuthLoading ? (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner size="sm" />
          Loading editor...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-100/60 bg-white/90 p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="article-title">Title</Label>
                  <TextInput
                    id="article-title"
                    value={formState.title}
                    onChange={(event) => {
                      const nextTitle = event.target.value;
                      setFormState((prev) => ({
                        ...prev,
                        title: nextTitle,
                        slug: slugTouched ? prev.slug : slugify(nextTitle),
                      }));
                    }}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="article-slug">Slug</Label>
                  <TextInput
                    id="article-slug"
                    value={formState.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setFormState((prev) => ({ ...prev, slug: event.target.value }));
                    }}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="article-category">Category</Label>
                  <Select
                    id="article-category"
                    value={formState.categoryId}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, categoryId: event.target.value }))
                    }
                    disabled={!canEdit}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                      <span className="text-sm text-slate-500">No tags available.</span>
                    ) : (
                      tags.map((tag) => {
                        const isSelected = formState.tagIds.includes(tag.id);
                        return (
                          <Button
                            key={tag.id}
                            color="light"
                            size="xs"
                            className={
                              isSelected
                                ? '!rounded-full !border-amber-200 !bg-amber-100 !px-3 !py-1 text-xs font-semibold text-amber-700'
                                : '!rounded-full !border-slate-200 !bg-white !px-3 !py-1 text-xs font-semibold text-slate-600 hover:!bg-slate-100'
                            }
                            disabled={!canEdit}
                            onClick={() =>
                              setFormState((prev) => ({
                                ...prev,
                                tagIds: prev.tagIds.includes(tag.id)
                                  ? prev.tagIds.filter((id) => id !== tag.id)
                                  : [...prev.tagIds, tag.id],
                              }))
                            }
                          >
                            {tag.name}
                          </Button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <ArticleEditor
              value={formState.content}
              onChange={(content) => setFormState((prev) => ({ ...prev, content }))}
              articleId={canEdit ? articleId : undefined}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-100/60 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                Status
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {formState.isPublished ? 'Published' : 'Draft'}
                </span>
                <ToggleSwitch
                  checked={formState.isPublished}
                  label="Publish"
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, isPublished: !prev.isPublished }))
                  }
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100/60 bg-amber-50/80 p-4 text-xs text-amber-700">
              Images can be uploaded after the first save. Uploads are limited to your
              own articles and stored under
              <span className="font-semibold text-amber-800"> /uploads/articles</span>.
            </div>

            {!isNew && canEdit && articleData?.author?.username && (
              <div className="rounded-2xl border border-amber-100/60 bg-white/90 p-4 text-xs text-slate-600">
                You are editing as{' '}
                <span className="font-semibold text-slate-800">
                  {articleData.author.username}
                </span>
                .
              </div>
            )}
          </div>
        </div>
      )}

      {!isNew && canEdit && !isLoading && !isAuthLoading && (
        <Card className="border border-white/70 bg-white/90 shadow-lg shadow-amber-200/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
              <p className="text-sm text-slate-600">Read-only view for your article.</p>
            </div>
            <Button
              color="light"
              size="sm"
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
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
          ) : flatComments.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No comments yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {flatComments.map((comment) => {
                const isDeleted = comment.content === '[deleted]';
                return (
                  <div
                    key={comment.id}
                    className={`rounded-xl border border-amber-100/60 bg-white/80 p-3 ${depthClass(
                      comment.depth,
                    )}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{comment.user?.username ?? 'Unknown'}</span>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        isDeleted ? 'italic text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AuthorArticleEditorPage;
