"use client";

import type { IPaginationMeta } from "@/types/admin.type";
import { keepPreviousData, type UseQueryResult } from "@tanstack/react-query";

/** What a list hook's query resolves to. */
export interface IAdminListResult<T> {
  rows: T[];
  /** Paging and totals as the API reported them. */
  meta: IPaginationMeta;
  /** Extra fields some lists carry (e.g. message counts). */
  counts?: Record<string, number>;
  /** Lists that need it keep the API's raw envelope here. */
  raw?: unknown;
}

export interface IAdminList<T, TResult extends IAdminListResult<T>> {
  /** The API's raw envelope (`{ success, data, meta }`) for older callers. */
  data?: TResult["raw"];
  rows: T[];
  meta?: IPaginationMeta;
  /**
   * True only for the first load. While a new page or search runs, the old
   * rows stay on screen and `isFetching` is true instead.
   */
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: UseQueryResult<TResult>["refetch"];
  /** The full query result, for anything the shortcuts above omit. */
  query: UseQueryResult<TResult>;
}

/** A page without rows reports the real total as zero. */
export const emptyMeta = (
  params: { page?: number; limit?: number } = {},
): IPaginationMeta => ({
  page: params.page ?? 1,
  limit: params.limit ?? 0,
  total: 0,
  totalPages: 0,
});

/** Turns a settled query into the `{ rows, meta, ... }` shape tables read. */
export const toAdminList = <
  T,
  TResult extends IAdminListResult<T>,
  TQuery extends UseQueryResult<TResult> = UseQueryResult<TResult>,
>(
  query: TQuery,
): IAdminList<T, TResult> & Omit<TQuery, keyof UseQueryResult<TResult>> => {
  const data = query.data;

  return {
    ...(query as Omit<TQuery, keyof UseQueryResult<TResult>>),
    data: data?.raw as IAdminList<T, TResult>["data"],
    rows: data?.rows ?? ([] as T[]),
    meta: data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: (query.error as Error | null) ?? null,
    refetch: query.refetch,
    query,
  } as IAdminList<T, TResult> & Omit<TQuery, keyof UseQueryResult<TResult>>;
};

export { keepPreviousData };
