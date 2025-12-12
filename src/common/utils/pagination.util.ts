export interface PaginatedResponse<T> {
  data: T[];
  paginationMeta: {
    pageSize: number;
    totalRows: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  totalRows: number,
  pageSize: number = 10,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data,
    paginationMeta: {
      currentPage: page,
      totalPages,
      totalRows: totalRows,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
