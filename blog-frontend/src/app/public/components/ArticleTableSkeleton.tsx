const ArticleTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl border border-teal-100/60 bg-white/70 p-4"
        >
          <div className="h-4 w-3/4 animate-pulse rounded bg-teal-100/80" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-teal-50" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
};

export default ArticleTableSkeleton;
