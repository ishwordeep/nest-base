export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sortBy?: 'displayOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}