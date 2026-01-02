const CommentSkeleton = ({ rows = 3 }: { rows?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-br from-slate-200 to-slate-100" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-3 w-16 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
          
          {/* Content */}
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-slate-50" />
            <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-50" />
          </div>
          
          {/* Actions */}
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
            <div className="h-8 w-16 animate-pulse rounded-full bg-slate-50" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentSkeleton;
