import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AdminTableWrapper from '../components/AdminTableWrapper';
import ConfirmModal from '../../../components/common/ConfirmModal';
import StatusBadge from '../components/StatusBadge';
import {
  deleteComment,
  fetchCommentsByArticle,
  hardDeleteComment,
  type Comment,
} from '../../../api/comment.api';

type FlatComment = Comment & { depth: number };

type ConfirmAction = {
  type: 'softDelete' | 'hardDelete';
  comment: FlatComment;
};

const actionButtonBase =
  'gap-1.5 !rounded-lg !px-2.5 !py-1.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40';
const softDeleteButtonClass = `${actionButtonBase} !border-amber-200 !bg-amber-50 !text-amber-700 hover:!bg-amber-100`;
const hardDeleteButtonClass = `${actionButtonBase} !border-rose-200 !bg-rose-50 !text-rose-700 hover:!bg-rose-100`;

const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M7 6l1 14h8l1-14" />
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
  return 'Unable to load comments.';
};

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

const ArticleCommentsPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadComments = useCallback(async () => {
    if (!articleId) {
      setError('Missing article id.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchCommentsByArticle(articleId);
      setComments(response);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const flatComments = useMemo(() => flattenComments(comments), [comments]);

  const handleConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    setIsActionLoading(true);
    try {
      if (confirmAction.type === 'softDelete') {
        await deleteComment(confirmAction.comment.id);
      } else {
        await hardDeleteComment(confirmAction.comment.id);
      }
      await loadComments();
      setConfirmAction(null);
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert color="failure">
          <span className="font-medium">Comment error.</span> {error}
        </Alert>
      )}

      <AdminTableWrapper
        title="Article Comments"
        description="Moderate discussion threads for this article."
        actions={
          <Button color="purple" onClick={loadComments} disabled={isLoading}>
            Refresh
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Spinner size="sm" />
            Loading comments...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHead className="bg-slate-100/70 text-slate-700">
                <TableHeadCell>Comment</TableHeadCell>
                <TableHeadCell>User</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y divide-slate-100">
                {flatComments.length === 0 ? (
                  <TableRow className="bg-white/80">
                    <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                      No comments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  flatComments.map((comment) => {
                    const isDeleted = comment.content === '[deleted]';
                    return (
                      <TableRow key={comment.id} className="bg-white/80">
                        <TableCell className={depthClass(comment.depth)}>
                          <p
                            className={`text-sm ${
                              isDeleted ? 'italic text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            {comment.content}
                          </p>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {comment.user?.username ?? 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={isDeleted ? 'deleted' : 'active'} />
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            color="light"
                            size="xs"
                            className={softDeleteButtonClass}
                            onClick={() =>
                              setConfirmAction({ type: 'softDelete', comment })
                            }
                            disabled={isDeleted}
                          >
                            <span className="flex items-center gap-1.5">
                              <TrashIcon />
                              Soft delete
                              </span>
                            </Button>
                            <Button
                            color="light"
                            size="xs"
                            className={hardDeleteButtonClass}
                            onClick={() => setConfirmAction({ type: 'hardDelete', comment })}
                          >
                            <span className="flex items-center gap-1.5">
                              <TrashIcon />
                              Hard delete
                              </span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </AdminTableWrapper>

      {confirmAction && (
        <ConfirmModal
          open={Boolean(confirmAction)}
          title={
            confirmAction.type === 'softDelete' ? 'Soft delete comment' : 'Hard delete comment'
          }
          description={
            confirmAction.type === 'softDelete'
              ? 'This will replace the comment content with [deleted].'
              : 'This will permanently remove the comment and its replies.'
          }
          confirmLabel={
            confirmAction.type === 'softDelete' ? 'Soft delete' : 'Delete permanently'
          }
          confirmColor={confirmAction.type === 'softDelete' ? 'warning' : 'failure'}
          isLoading={isActionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default ArticleCommentsPage;
