/**
 * Common Repository Query Types & Contracts
 * Source of Truth: docs/ARCHITECTURE.md §2.4, docs/GOOGLE_SHEETS_INTEGRATION.md §6
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
