import { PageParams } from './schema';
export * from './schema';

export interface Page<T> {
  data: T[];
  page: PageParams;
}

export function paginate<T>(
  data: T[],
  {
    limit,
    offset,
    totalCount,
    nextCursor,
  }: {
    limit?: number;
    offset?: number;
    totalCount?: number;
    nextCursor?: string;
  },
) {
  return {
    data,
    page: {
      limit,
      offset,
      count: data.length,
      totalCount,
      hasNextPage:
        nextCursor != null ||
        (totalCount != null &&
          offset != null &&
          totalCount > offset + (limit ?? 0)),
      hasPreviousPage: offset != null && offset > 0,
      nextCursor,
    },
  };
}
