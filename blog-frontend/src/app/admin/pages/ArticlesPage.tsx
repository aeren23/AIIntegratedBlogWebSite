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
  ToggleSwitch,
} from 'flowbite-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminTableWrapper from '../components/AdminTableWrapper';
import ConfirmModal from '../../../components/common/ConfirmModal';
import {
  fetchArticles,
  hardDeleteArticle,
  restoreArticle,
  softDeleteArticle,
  type Article,
} from '../../../api/article.api';

type ConfirmAction = {
  type: 'softDelete' | 'restore' | 'hardDelete';
  article: Article;
};

const actionButtonBase =
  'gap-1.5 !rounded-lg !px-2.5 !py-1.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40';
const editButtonClass = `${actionButtonBase} !border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-100`;
const softDeleteButtonClass = `${actionButtonBase} !border-amber-200 !bg-amber-50 !text-amber-700 hover:!bg-amber-100`;
const restoreButtonClass = `${actionButtonBase} !border-emerald-200 !bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100`;
const hardDeleteButtonClass = `${actionButtonBase} !border-rose-200 !bg-rose-50 !text-rose-700 hover:!bg-rose-100`;
const commentButtonClass = `${actionButtonBase} !border-indigo-200 !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100`;

const EditIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M14 6l4 4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M7 6l1 14h8l1-14" />
  </svg>
);

const RestoreIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v6h6" />
  </svg>
);

const CommentIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6a8 8 0 0 1-2-5 8 8 0 1 1 20 0z" />
  </svg>
);

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
  return 'Unable to load articles.';
};

const ArticlesPage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [includeDeleted, setIncludeDeleted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [pageSize, totalCount],
  );

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchArticles({
        page,
        pageSize,
        includeDeleted,
      });
      setArticles(response.items);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [includeDeleted, page, pageSize]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    setIsActionLoading(true);
    try {
      if (confirmAction.type === 'softDelete') {
        await softDeleteArticle(confirmAction.article.id);
      } else if (confirmAction.type === 'restore') {
        await restoreArticle(confirmAction.article.id);
      } else if (confirmAction.type === 'hardDelete') {
        await hardDeleteArticle(confirmAction.article.id);
      }

      await loadArticles();
      setConfirmAction(null);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmContent = useMemo(() => {
    if (!confirmAction) {
      return null;
    }

    if (confirmAction.type === 'softDelete') {
      return {
        title: 'Soft delete article',
        description: 'This will hide the article but keep it recoverable.',
        confirmLabel: 'Soft delete',
      };
    }

    if (confirmAction.type === 'restore') {
      return {
        title: 'Restore article',
        description: 'This will restore the article and make it visible again.',
        confirmLabel: 'Restore',
      };
    }

    return {
      title: 'Hard delete article',
      description:
        'This permanently deletes the article and all related images. This cannot be undone.',
      confirmLabel: 'Delete permanently',
    };
  }, [confirmAction]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert color="failure">
          <span className="font-medium">Article error.</span> {error}
        </Alert>
      )}

      <AdminTableWrapper
        title="Articles"
        description="Review articles, moderate content, and jump to comment moderation."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <ToggleSwitch
              checked={includeDeleted}
              label="Include deleted"
              onChange={() => {
                setPage(1);
                setIncludeDeleted((prev) => !prev);
              }}
            />
            <Button color="purple" onClick={loadArticles} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Spinner size="sm" />
            Loading articles...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHead className="bg-slate-100/70 text-slate-700">
                <TableHeadCell>Title</TableHeadCell>
                <TableHeadCell>Author</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Comments</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y divide-slate-100">
                {articles.length === 0 ? (
                  <TableRow className="bg-white/80">
                    <TableCell colSpan={7} className="py-6 text-center text-slate-500">
                      No articles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((article) => (
                    <TableRow
                      key={article.id}
                      className={`bg-white/80 ${article.isDeleted ? 'opacity-60' : ''}`}
                    >
                      <TableCell className="font-medium text-slate-900">
                        <div className="space-y-1">
                          <p>{article.title}</p>
                          <p className="text-xs text-slate-500">/{article.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {article.author?.username ?? 'Unknown'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {article.category?.name ?? 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge color={article.isPublished ? 'success' : 'warning'}>
                            {article.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          {article.isDeleted && <Badge color="failure">Deleted</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          color="light"
                          size="xs"
                          className={commentButtonClass}
                          onClick={() => navigate(`/admin/articles/${article.id}/comments`)}
                        >
                          <span className="flex items-center gap-1.5">
                            <CommentIcon />
                            Comments ({article.commentsCount ?? 0})
                          </span>
                        </Button>
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
                            onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                            disabled={article.isDeleted}
                          >
                            <span className="flex items-center gap-1.5">
                              <EditIcon />
                              Edit
                            </span>
                          </Button>
                          {article.isDeleted ? (
                            <Button
                              color="light"
                              size="xs"
                              className={restoreButtonClass}
                              onClick={() =>
                                setConfirmAction({ type: 'restore', article })
                              }
                            >
                              <span className="flex items-center gap-1.5">
                                <RestoreIcon />
                                Restore
                              </span>
                            </Button>
                          ) : (
                            <Button
                              color="light"
                              size="xs"
                              className={softDeleteButtonClass}
                              onClick={() =>
                                setConfirmAction({ type: 'softDelete', article })
                              }
                            >
                              <span className="flex items-center gap-1.5">
                                <TrashIcon />
                                Soft delete
                              </span>
                            </Button>
                          )}
                          <Button
                            color="light"
                            size="xs"
                            className={hardDeleteButtonClass}
                            onClick={() =>
                              setConfirmAction({ type: 'hardDelete', article })
                            }
                          >
                            <span className="flex items-center gap-1.5">
                              <TrashIcon />
                              Hard delete
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} showIcons />
        </div>
      </AdminTableWrapper>

      {confirmContent && (
        <ConfirmModal
          open={Boolean(confirmAction)}
          title={confirmContent.title}
          description={confirmContent.description}
          confirmLabel={confirmContent.confirmLabel}
          confirmColor={confirmAction?.type === 'restore' ? 'success' : 'failure'}
          isLoading={isActionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default ArticlesPage;
