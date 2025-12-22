import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
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
import { fetchArticleById, updateArticle } from '../../../api/article.api';

type ArticleFormState = {
  title: string;
  slug: string;
  categoryId: string;
  content: string;
  isPublished: boolean;
  tagIds: string[];
};

marked.setOptions({
  breaks: true,
  gfm: true,
});

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

const ArticleEditorPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [formState, setFormState] = useState<ArticleFormState>({
    title: '',
    slug: '',
    categoryId: '',
    content: '',
    isPublished: false,
    tagIds: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleDeleted, setArticleDeleted] = useState(false);

  const turndownService = useMemo(() => new TurndownService(), []);

  const loadEditorData = useCallback(async () => {
    if (!articleId) {
      setError('Missing article id.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [article, categoryList, tagList] = await Promise.all([
        fetchArticleById(articleId),
        fetchCategories(),
        fetchTags(),
      ]);

      setCategories(categoryList);
      setTags(tagList);
      const markdownContent = turndownService.turndown(article.content ?? '');
      setFormState({
        title: article.title,
        slug: article.slug,
        categoryId: article.category?.id ?? '',
        content: markdownContent,
        isPublished: article.isPublished,
        tagIds: article.tags?.map((tag) => tag.id) ?? [],
      });
      setArticleDeleted(article.isDeleted);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [articleId, turndownService]);

  useEffect(() => {
    loadEditorData();
  }, [loadEditorData]);

  const handleSave = async () => {
    if (!articleId) {
      return;
    }

    if (!formState.title.trim() || !formState.slug.trim() || !formState.categoryId) {
      setError('Title, slug, and category are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const htmlContent = marked.parse(formState.content) as string;
      await updateArticle(articleId, {
        title: formState.title.trim(),
        slug: formState.slug.trim(),
        content: htmlContent,
        categoryId: formState.categoryId,
        isPublished: formState.isPublished,
        tagIds: formState.tagIds,
      });
      await loadEditorData();
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Editor</p>
          <h2 className="text-2xl font-semibold text-slate-900">Edit Article</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button color="light" onClick={() => navigate('/admin/articles')}>
            Back to articles
          </Button>
          <Button color="purple" onClick={handleSave} disabled={isSaving || articleDeleted}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Editor error.</span> {error}
        </Alert>
      )}

      {articleDeleted && (
        <Alert color="warning">
          This article is currently deleted. Restore it from the articles list before editing.
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Spinner size="sm" />
          Loading article...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="article-title">Title</Label>
                  <TextInput
                    id="article-title"
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, title: event.target.value }))
                    }
                    disabled={articleDeleted}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="article-slug">Slug</Label>
                  <TextInput
                    id="article-slug"
                    value={formState.slug}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, slug: event.target.value }))
                    }
                    disabled={articleDeleted}
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
                    disabled={articleDeleted}
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
                                ? '!rounded-full !border-indigo-200 !bg-indigo-100 !px-3 !py-1 text-xs font-semibold text-indigo-700'
                                : '!rounded-full !border-slate-200 !bg-white !px-3 !py-1 text-xs font-semibold text-slate-600 hover:!bg-slate-100'
                            }
                            disabled={articleDeleted}
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
              articleId={articleId}
              disabled={articleDeleted}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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
                  disabled={articleDeleted}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-xs text-slate-500">
              Markdown is converted to HTML on save. Images upload into the content editor
              and are stored under
              <span className="font-semibold text-slate-700"> /uploads/articles</span>.
            </div>
          </div>
        </div>
      )}

      {/* Manual test:
          1) Write markdown, save, verify HTML stored in DB (including <img src="/uploads/...">).
          2) Open article and confirm image loads.
          3) Hard delete article and confirm image files removed from disk. */}
    </div>
  );
};

export default ArticleEditorPage;
