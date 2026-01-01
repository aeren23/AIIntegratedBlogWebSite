import { memo, useMemo, useState } from 'react';
import { Badge, Button, Card } from 'flowbite-react';
import type { Comment } from '../../api/comment.api';
import ConfirmModal from '../common/ConfirmModal';
import CommentForm from './CommentForm';

export type CommentNode = Comment & { children: CommentNode[] };

type CommentMode = 'public' | 'admin' | 'author';

type CommentItemProps = {
  node: CommentNode;
  depth: number;
  mode: CommentMode;
  currentUserId?: string;
  currentUserRoles: string[];
  onReply?: (parentId: string, content: string) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onSoftDelete?: (commentId: string) => Promise<void>;
  onHardDelete?: (commentId: string) => Promise<void>;
};

const depthPadding = (depth: number) => {
  if (depth >= 4) {
    return 'pl-6';
  }
  if (depth === 3) {
    return 'pl-5';
  }
  if (depth === 2) {
    return 'pl-4';
  }
  if (depth === 1) {
    return 'pl-3';
  }
  return 'pl-0';
};

const hasRole = (roles: string[], allowed: string[]) =>
  roles.some((role) => allowed.includes(role));

const CommentItem = ({
  node,
  depth,
  mode,
  currentUserId,
  currentUserRoles,
  onReply,
  onEdit,
  onSoftDelete,
  onHardDelete,
}: CommentItemProps) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'soft' | 'hard' | null>(null);

  const isAdmin = useMemo(
    () => hasRole(currentUserRoles, ['ADMIN', 'SUPERADMIN']),
    [currentUserRoles],
  );
  const isOwner = useMemo(
    () => Boolean(currentUserId && currentUserId === node.user?.id),
    [currentUserId, node.user?.id],
  );
  const isDeleted = node.isDeleted || node.content === '[deleted]';
  const shouldMaskContent = isDeleted && mode !== 'admin';
  const displayContent = shouldMaskContent ? '[deleted]' : node.content;

  const canReply =
    mode === 'public' &&
    !isDeleted &&
    Boolean(currentUserId) &&
    Boolean(onReply) &&
    hasRole(currentUserRoles, ['USER', 'AUTHOR', 'ADMIN', 'SUPERADMIN']);
  const canEdit = mode === 'public' && !isDeleted && isOwner && Boolean(onEdit);
  const canSoftDelete =
    mode !== 'author' && !isDeleted && (isOwner || isAdmin) && Boolean(onSoftDelete);
  const canHardDelete =
    mode !== 'author' && isAdmin && Boolean(onHardDelete);

  const displayName = node.user?.profile?.displayName?.trim() || node.user?.username || 'Unknown';
  const createdAt = new Date(node.createdAt).toLocaleString();

  const handleConfirm = async () => {
    try {
      if (confirmAction === 'soft' && onSoftDelete) {
        await onSoftDelete(node.id);
      }
      if (confirmAction === 'hard' && onHardDelete) {
        await onHardDelete(node.id);
      }
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className={`space-y-3 ${depthPadding(depth)}`}>
      <Card className="border border-slate-200/70 bg-white/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{displayName}</span>
            {isOwner && (
              <Badge className="!border !border-teal-200 !bg-teal-50 !text-teal-700">
                You
              </Badge>
            )}
            <span className="text-slate-400">|</span>
            <span>{createdAt}</span>
          </div>
          {isDeleted && (
            <Badge className="!border !border-slate-200 !bg-slate-100 !text-slate-500">
              Deleted
            </Badge>
          )}
        </div>

        <p
          className={`mt-3 text-sm ${
            shouldMaskContent ? 'italic text-slate-400' : isDeleted ? 'text-slate-600' : 'text-slate-700'
          }`}
        >
          {displayContent}
        </p>

        {((!isDeleted && (canReply || canEdit || canSoftDelete || canHardDelete)) ||
          (isDeleted && canHardDelete)) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {canReply && (
              <Button
                color="light"
                size="xs"
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
                onClick={() => {
                  setIsReplyOpen((prev) => !prev);
                  setIsEditOpen(false);
                }}
              >
                Reply
              </Button>
            )}
            {canEdit && (
              <Button
                color="light"
                size="xs"
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setIsEditOpen((prev) => !prev);
                  setIsReplyOpen(false);
                }}
              >
                Edit
              </Button>
            )}
            {canSoftDelete && (
              <Button
                color="light"
                size="xs"
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => setConfirmAction('soft')}
              >
                Soft delete
              </Button>
            )}
            {canHardDelete && (
              <Button
                color="light"
                size="xs"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                onClick={() => setConfirmAction('hard')}
              >
                Hard delete
              </Button>
            )}
          </div>
        )}

        {isReplyOpen && onReply && (
          <div className="mt-4 rounded-xl border border-teal-100/70 bg-teal-50/40 p-3">
            <CommentForm
              submitLabel="Post reply"
              onSubmit={(content) => onReply(node.id, content)}
              onCancel={() => setIsReplyOpen(false)}
              placeholder="Write a reply..."
            />
          </div>
        )}

        {isEditOpen && onEdit && (
          <div className="mt-4 rounded-xl border border-slate-100/70 bg-slate-50/50 p-3">
            <CommentForm
              submitLabel="Save changes"
              onSubmit={(content) => onEdit(node.id, content)}
              onCancel={() => setIsEditOpen(false)}
              initialValue={node.content}
              resetOnSubmit={false}
              placeholder="Update your comment..."
            />
          </div>
        )}
      </Card>

      {node.children.length > 0 && (
        <div className="space-y-3 border-l border-slate-200/70 pl-4">
          {node.children.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              depth={depth + 1}
              mode={mode}
              currentUserId={currentUserId}
              currentUserRoles={currentUserRoles}
              onReply={onReply}
              onEdit={onEdit}
              onSoftDelete={onSoftDelete}
              onHardDelete={onHardDelete}
            />
          ))}
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          open={Boolean(confirmAction)}
          title={confirmAction === 'soft' ? 'Soft delete comment' : 'Hard delete comment'}
          description={
            confirmAction === 'soft'
              ? 'This will replace the content with [deleted].'
              : 'This will permanently remove the comment and its replies.'
          }
          confirmLabel={confirmAction === 'soft' ? 'Soft delete' : 'Delete permanently'}
          confirmColor={confirmAction === 'soft' ? 'warning' : 'failure'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default memo(CommentItem);
