import type { ReactNode } from 'react';

export type CommentNode = {
  id: string;
  content: string;
  createdAt: string;
  author: string;
  children: CommentNode[];
};

type CommentThreadProps = {
  nodes: CommentNode[];
  depth?: number;
  actions?: (comment: CommentNode) => ReactNode;
};

const depthPadding = (depth: number) => {
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

const CommentThread = ({ nodes, depth = 0, actions }: CommentThreadProps) => {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {nodes.map((node) => {
        const isDeleted = node.content === '[deleted]';
        return (
          <div
            key={node.id}
            className={`rounded-xl border border-teal-100/60 bg-white/80 p-3 ${depthPadding(
              depth,
            )}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>{node.author}</span>
              <time dateTime={new Date(node.createdAt).toISOString()}>
                {new Date(node.createdAt).toLocaleString()}
              </time>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p
                className={`text-sm ${
                  isDeleted ? 'italic text-slate-400' : 'text-slate-700'
                }`}
              >
                {node.content}
              </p>
              {actions && <div>{actions(node)}</div>}
            </div>
            {node.children.length > 0 && (
              <div className="mt-3">
                <CommentThread nodes={node.children} depth={depth + 1} actions={actions} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CommentThread;
