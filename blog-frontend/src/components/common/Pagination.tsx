import { useMemo } from 'react';
import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Number of page buttons to show around current page (default: 2) */
  siblingCount?: number;
  /** Show first/last page buttons (default: true) */
  showEdges?: boolean;
  /** Color theme: 'violet' | 'teal' | 'indigo' */
  theme?: 'violet' | 'teal' | 'indigo';
};

const DOTS = '...';

const generateRange = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => start + idx);
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showEdges = true,
  theme = 'violet',
}: PaginationProps) => {
  // Color theme configurations
  const themeColors = {
    violet: {
      active: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30',
      hover: 'hover:bg-violet-100 hover:text-violet-700',
      text: 'text-violet-600',
      border: 'border-violet-200',
      info: 'text-violet-600',
    },
    teal: {
      active: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30',
      hover: 'hover:bg-teal-100 hover:text-teal-700',
      text: 'text-teal-600',
      border: 'border-teal-200',
      info: 'text-teal-600',
    },
    indigo: {
      active: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30',
      hover: 'hover:bg-indigo-100 hover:text-indigo-700',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      info: 'text-indigo-600',
    },
  };

  const colors = themeColors[theme];

  // Calculate page numbers to display
  const paginationRange = useMemo(() => {
    // Always show first page + last page + current + siblings + 2 dots = 5 + (2 * siblingCount)
    const totalPageNumbers = siblingCount + 5;

    // Case 1: Total pages less than page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return generateRange(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = generateRange(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    // Case 3: Left dots, but no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = generateRange(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = generateRange(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) {
    return null;
  }

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const baseButtonClass =
    'flex items-center justify-center transition-all duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50';
  
  const pageButtonClass = `${baseButtonClass} w-10 h-10 rounded-xl text-sm`;
  const navButtonClass = `${baseButtonClass} w-10 h-10 rounded-xl`;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Page Info */}
      <p className={`text-sm font-medium ${colors.info}`}>
        Page <span className="font-bold">{currentPage}</span> of{' '}
        <span className="font-bold">{totalPages}</span>
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
        {/* First Page */}
        {showEdges && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            className={`${navButtonClass} ${
              canGoPrevious
                ? `text-slate-600 ${colors.hover}`
                : 'cursor-not-allowed text-slate-300'
            }`}
            aria-label="Go to first page"
          >
            <HiChevronDoubleLeft className="h-4 w-4" />
          </button>
        )}

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className={`${navButtonClass} ${
            canGoPrevious
              ? `text-slate-600 ${colors.hover}`
              : 'cursor-not-allowed text-slate-300'
          }`}
          aria-label="Go to previous page"
        >
          <HiChevronLeft className="h-5 w-5" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex h-10 w-8 items-center justify-center text-slate-400"
                >
                  ⋯
                </span>
              );
            }

            const isActive = pageNumber === currentPage;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => !isActive && onPageChange(pageNumber as number)}
                disabled={isActive}
                className={`${pageButtonClass} ${
                  isActive
                    ? `${colors.active} cursor-default`
                    : `bg-transparent text-slate-600 ${colors.hover}`
                }`}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={`${navButtonClass} ${
            canGoNext
              ? `text-slate-600 ${colors.hover}`
              : 'cursor-not-allowed text-slate-300'
          }`}
          aria-label="Go to next page"
        >
          <HiChevronRight className="h-5 w-5" />
        </button>

        {/* Last Page */}
        {showEdges && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            className={`${navButtonClass} ${
              canGoNext
                ? `text-slate-600 ${colors.hover}`
                : 'cursor-not-allowed text-slate-300'
            }`}
            aria-label="Go to last page"
          >
            <HiChevronDoubleRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;
