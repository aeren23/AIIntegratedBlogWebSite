import { Card } from 'flowbite-react';

const CommentSkeleton = ({ rows = 3 }: { rows?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Card
          key={index}
          className="border border-slate-200/70 bg-white/90 shadow-sm"
        >
          <div className="space-y-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CommentSkeleton;
