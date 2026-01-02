const ArticleTableSkeleton = ({ rows = 4 }: { rows?: number }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:flex-row"
          >
            {/* Image skeleton */}
            <div className="h-52 w-full flex-shrink-0 animate-pulse bg-gradient-to-br from-slate-100 to-slate-50 md:h-auto md:w-64 lg:w-72">
              <div className="absolute left-4 top-4 h-8 w-24 rounded-lg bg-slate-200" />
            </div>

            {/* Content skeleton */}
            <div className="flex flex-1 flex-col p-6 lg:p-8">
              {/* Meta */}
              <div className="mb-4 flex gap-4">
                <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
                <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
              </div>

              {/* Title */}
              <div className="mb-3 h-7 w-3/4 animate-pulse rounded-lg bg-slate-200" />

              {/* Excerpt */}
              <div className="mb-5 flex-1 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-slate-50" />
              </div>

              {/* Tags */}
              <div className="mb-5 flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-50" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
                <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleTableSkeleton;
