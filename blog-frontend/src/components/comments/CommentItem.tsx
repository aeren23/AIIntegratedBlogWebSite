import { memo, useMemo, useState } from 'react';
import { Badge, Button } from 'flowbite-react';
import type { Comment } from '../../api/comment.api';
import ConfirmModal from '../common/ConfirmModal';
import CommentForm from './CommentForm';
import { resolveApiAssetUrl } from '../../utils/apiAssets';

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

const hasRole = (roles: string[], allowed: string[]) =>
  roles.some((role) => allowed.includes(role));

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

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
  const avatarUrl = useMemo(
    () => resolveApiAssetUrl(node.user?.profile?.profileImageUrl),
    [node.user?.profile?.profileImageUrl],
  );
  const avatarFallback = (displayName || 'U').slice(0, 1).toUpperCase();
  const timeAgo = formatTimeAgo(node.createdAt);

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
    <div className="space-y-3">
      <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDeleted 
          ? 'border-slate-200/50 bg-slate-50/50' 
          : 'border-slate-200/60 bg-white shadow-sm hover:shadow-md hover:shadow-slate-200/50'
      }`}>
        {/* Decorative gradient */}
        {!isDeleted && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500/[0.02] to-cyan-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        
        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-white ${
                  isDeleted 
                    ? 'bg-slate-300' 
                    : 'bg-gradient-to-br from-teal-400 to-cyan-400'
                }`}>
                  {avatarUrl && !isDeleted ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm">{avatarFallback}</span>
                  )}
                </div>
                {!isDeleted && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                )}
              </div>
              
              {/* Name & Time */}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isDeleted ? 'text-slate-400' : 'text-slate-800'}`}>
                    {displayName}
                  </span>
                  {isOwner && !isDeleted && (
                    <Badge className="!border-0 !bg-gradient-to-r !from-teal-100 !to-cyan-100 !px-2 !py-0.5 !text-[10px] !font-bold !text-teal-700">
                      You
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-400">{timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-3">
            <p className={`text-sm leading-relaxed ${
              shouldMaskContent 
                ? 'italic text-slate-400' 
                : isDeleted 
                  ? 'text-slate-500' 
                  : 'text-slate-700'
            }`}>
              {displayContent}
            </p>
          </div>

          {/* Actions */}
          {((!isDeleted && (canReply || canEdit || canSoftDelete || canHardDelete)) ||
            (isDeleted && canHardDelete)) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              {canReply && (
                <Button
                  color="light"
                  size="xs"
                  className="!rounded-full !border-0 !bg-gradient-to-r !from-teal-50 !to-cyan-50 !px-4 !text-teal-700 !shadow-none transition-all hover:!from-teal-100 hover:!to-cyan-100"
                  onClick={() => {
                    setIsReplyOpen((prev) => !prev);
                    setIsEditOpen(false);
                  }}
                >
                  <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </Button>
              )}
              {canEdit && (
                <Button
                  color="light"
                  size="xs"
                  className="!rounded-full !border-0 !bg-slate-100 !px-4 !text-slate-600 !shadow-none transition-all hover:!bg-slate-200"
                  onClick={() => {
                    setIsEditOpen((prev) => !prev);
                    setIsReplyOpen(false);
                  }}
                >
                  <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
              )}
              {canSoftDelete && (
                <Button
                  color="light"
                  size="xs"
                  className="!rounded-full !border-0 !bg-amber-50 !px-4 !text-amber-700 !shadow-none transition-all hover:!bg-amber-100"
                  onClick={() => setConfirmAction('soft')}
                >
                  <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide
                </Button>
              )}
              {canHardDelete && (
                <Button
                  color="light"
                  size="xs"
                  className="!rounded-full !border-0 !bg-rose-50 !px-4 !text-rose-700 !shadow-none transition-all hover:!bg-rose-100"
                  onClick={() => setConfirmAction('hard')}
                >
                  <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </Button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplyOpen && onReply && (
            <div className="mt-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 p-4">
              <CommentForm
                submitLabel="Post reply"
                onSubmit={(content) => onReply(node.id, content)}
                onCancel={() => setIsReplyOpen(false)}
                placeholder="Write a reply..."
              />
            </div>
          )}

          {/* Edit Form */}
          {isEditOpen && onEdit && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
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
        </div>
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="relative ml-5 space-y-3 border-l-2 border-gradient-to-b border-teal-200/50 pl-5">
          <div className="absolute -left-[5px] top-0 h-3 w-3 rounded-full border-2 border-teal-300 bg-white" />
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
          title={confirmAction === 'soft' ? 'Hide comment' : 'Delete comment permanently'}
          description={
            confirmAction === 'soft'
              ? 'This will replace the content with [deleted]. The comment structure will be preserved.'
              : 'This will permanently remove the comment and all its replies. This action cannot be undone.'
          }
          confirmLabel={confirmAction === 'soft' ? 'Hide comment' : 'Delete permanently'}
          confirmColor={confirmAction === 'soft' ? 'warning' : 'failure'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default memo(CommentItem);
