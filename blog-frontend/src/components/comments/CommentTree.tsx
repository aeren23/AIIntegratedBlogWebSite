import { memo, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Comment } from '../../api/comment.api';
import CommentItem, { type CommentNode } from './CommentItem';

type CommentMode = 'public' | 'admin' | 'author';

type CommentTreeProps = {
  comments: Comment[];
  mode?: CommentMode;
  emptyMessage?: string;
  onReply?: (parentId: string, content: string) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onSoftDelete?: (commentId: string) => Promise<void>;
  onHardDelete?: (commentId: string) => Promise<void>;
};

const buildTree = (comments: Comment[]): CommentNode[] => {
  const nodeById = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    nodeById.set(comment.id, { ...comment, children: [] });
  });

  comments.forEach((comment) => {
    const node = nodeById.get(comment.id);
    if (!node) {
      return;
    }
    const parentId = comment.parentCommentId ?? null;
    if (parentId && nodeById.has(parentId)) {
      nodeById.get(parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const CommentTree = ({
  comments,
  mode = 'public',
  emptyMessage = 'No comments yet.',
  onReply,
  onEdit,
  onSoftDelete,
  onHardDelete,
}: CommentTreeProps) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const currentUserRoles = user?.roles ?? [];

  const tree = useMemo(() => buildTree(comments), [comments]);

  if (tree.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {tree.map((node) => (
        <CommentItem
          key={node.id}
          node={node}
          depth={0}
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
  );
};

export default memo(CommentTree);
