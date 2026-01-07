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
import { HiSparkles, HiEye, HiEyeOff, HiRefresh, HiTrash, HiPlus } from 'react-icons/hi';
import ArticleEditor from '../../../components/article/ArticleEditor';
import QuickAddModal from '../../../components/common/QuickAddModal';
import { fetchCategories, createCategory, type Category } from '../../../api/category.api';
import { fetchTags, createTag, type Tag } from '../../../api/tag.api';
import { fetchArticleById, updateArticle } from '../../../api/article.api';
import {
  generateArticleSummary,
  getArticleSummaryStatus,
  clearArticleSummary,
  type AiSummaryStatus,
} from '../../../api/ai.api';
import { hydrateArticleHtml, normalizeArticleHtmlForSave } from '../../../utils/apiAssets';

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

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<AiSummaryStatus | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Quick Add Modal State
  const [quickAddType, setQuickAddType] = useState<'category' | 'tag'>('category');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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
      const hydratedContent = hydrateArticleHtml(article.content ?? '');
      const markdownContent = turndownService.turndown(hydratedContent);
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

  // Load AI summary status
  const loadAiSummary = useCallback(async () => {
    if (!articleId) return;
    
    setIsAiLoading(true);
    setAiError(null);
    try {
      const status = await getArticleSummaryStatus(articleId);
      setAiSummary(status);
    } catch (err) {
      setAiError(resolveErrorMessage(err));
    } finally {
      setIsAiLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (!isLoading && articleId) {
      void loadAiSummary();
    }
  }, [isLoading, articleId, loadAiSummary]);

  const handleGenerateSummary = async (regenerate = false) => {
    if (!articleId) return;
    
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await generateArticleSummary(articleId, regenerate);
      setAiSummary({
        hasSummary: true,
        summary: result.summary,
        generatedAt: result.generatedAt,
      });
      setShowAiSummary(true);
    } catch (err) {
      setAiError(resolveErrorMessage(err));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDeleteSummary = async () => {
    if (!articleId) return;
    
    setIsAiLoading(true);
    setAiError(null);
    try {
      await clearArticleSummary(articleId);
      setAiSummary({ hasSummary: false, summary: null, generatedAt: null });
      setShowAiSummary(false);
    } catch (err) {
      setAiError(resolveErrorMessage(err));
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick Add Handlers
  const handleQuickAddCategory = async (name: string, slug: string) => {
    const newCategory = await createCategory({ name, slug });
    setCategories((prev) => [...prev, newCategory]);
    setFormState((prev) => ({ ...prev, categoryId: newCategory.id }));
  };

  const handleQuickAddTag = async (name: string, slug: string) => {
    const newTag = await createTag({ name, slug });
    setTags((prev) => [...prev, newTag]);
    setFormState((prev) => ({ ...prev, tagIds: [...prev.tagIds, newTag.id] }));
  };

  const openQuickAdd = (type: 'category' | 'tag') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

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
      const normalizedContent = normalizeArticleHtmlForSave(htmlContent);
      await updateArticle(articleId, {
        title: formState.title.trim(),
        slug: formState.slug.trim(),
        content: normalizedContent,
        categoryId: formState.categoryId,
        isPublished: formState.isPublished,
        tagIds: formState.tagIds,
      });
      navigate('/admin/articles');
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="article-category">Category</Label>
                    <Button
                      size="xs"
                      color="light"
                      className="!border-violet-200 !text-violet-700 hover:!bg-violet-100"
                      onClick={() => openQuickAdd('category')}
                      disabled={articleDeleted}
                    >
                      <HiPlus className="mr-1 h-3 w-3" /> Quick Add
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <Label>Tags</Label>
                    <Button
                      size="xs"
                      color="light"
                      className="!border-amber-200 !text-amber-700 hover:!bg-amber-100"
                      onClick={() => openQuickAdd('tag')}
                      disabled={articleDeleted}
                    >
                      <HiPlus className="mr-1 h-3 w-3" /> Quick Add
                    </Button>
                  </div>
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

            {/* AI Summary Management Card */}
            <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-purple-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <HiSparkles className="h-4 w-4 text-violet-600" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
                  AI Summary
                </p>
              </div>

              {aiError && (
                <Alert color="failure" className="mb-3">
                  <span className="text-xs">{aiError}</span>
                </Alert>
              )}

              {isAiLoading ? (
                <div className="flex items-center gap-2 text-sm text-violet-600">
                  <Spinner size="sm" color="purple" />
                  <span>Processing...</span>
                </div>
              ) : aiSummary?.hasSummary ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-violet-600">
                      Generated: {new Date(aiSummary.generatedAt!).toLocaleDateString('tr-TR')}
                    </span>
                    <Button
                      size="xs"
                      color="light"
                      className="!border-violet-200 !text-violet-700 hover:!bg-violet-100"
                      onClick={() => setShowAiSummary(!showAiSummary)}
                    >
                      {showAiSummary ? (
                        <>
                          <HiEyeOff className="mr-1 h-3 w-3" /> Hide
                        </>
                      ) : (
                        <>
                          <HiEye className="mr-1 h-3 w-3" /> View
                        </>
                      )}
                    </Button>
                  </div>

                  {showAiSummary && (
                    <div className="rounded-lg bg-white/80 p-3 text-sm text-slate-700 border border-violet-100">
                      {aiSummary.summary}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      color="light"
                      className="flex-1 !border-violet-200 !text-violet-700 hover:!bg-violet-100"
                      onClick={() => handleGenerateSummary(true)}
                      disabled={isAiLoading || articleDeleted}
                    >
                      <HiRefresh className="mr-1 h-3 w-3" /> Regenerate
                    </Button>
                    <Button
                      size="xs"
                      color="failure"
                      className="!bg-red-500 hover:!bg-red-600"
                      onClick={handleDeleteSummary}
                      disabled={isAiLoading || articleDeleted}
                    >
                      <HiTrash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    No AI summary exists for this article.
                  </p>
                  <Button
                    size="sm"
                    className="w-full !bg-violet-600 hover:!bg-violet-700 !text-white"
                    onClick={() => handleGenerateSummary(false)}
                    disabled={isAiLoading || articleDeleted}
                  >
                    <HiSparkles className="mr-2 h-4 w-4" />
                    Generate Summary
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual test:
          1) Write markdown, save, verify HTML stored in DB (including <img src="/uploads/...">).
          2) Open article and confirm image loads.
          3) Hard delete article and confirm image files removed from disk. */}

      {/* Quick Add Modal */}
      <QuickAddModal
        type={quickAddType}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={quickAddType === 'category' ? handleQuickAddCategory : handleQuickAddTag}
      />
    </div>
  );
};

export default ArticleEditorPage;
