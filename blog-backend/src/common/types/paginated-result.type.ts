export interface PaginatedResult<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  isAscending: boolean;
}
