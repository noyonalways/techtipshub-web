"use client";

/**
 * Articles hooks.
 *
 * useAdminBlogs({ page?, limit?, searchTerm?, sort?, category?, author?, status? })
 *   -> { rows: IBlog[], meta, isLoading, isFetching, isError, error, refetch, data }
 *      reads `GET /admin/blogs`; `data` is the API's raw envelope. `isError` is
 *      true when the endpoint fails (including a 404 from an API that has not
 *      shipped it yet) and `rows` stays `[]`, so the screen never crashes.
 *      `rows` are in `data` (a bare array) beside `meta`; a flattened or
 *      `data.result` answer is read the same way.
 *
 * useTrashedBlogs({ page?, limit?, searchTerm? })
 *   -> same shape, from `GET /admin/blogs/trash`.
 *
 * Paging keeps the previous rows on screen. Only `searchTerm` changes trigger a
 * search, so debounce the input before passing it.
 *
 * useTrashCounts() -> data: { blogs?, users? }
 * Mutations: useDeleteAdminBlog(), useRestoreTrashedBlog().
 */ import {
  deleteAdminBlog,
  getAdminBlogList,
  getAdminTrashedBlogList,
  readBlogPage,
} from "@/services/admin/blogs";
import { getTrashCounts } from "@/services/admin/trash";
import type { IAdminBlogsParams, IAdminTrashParams } from "@/types/admin.type";
import type { IBlog } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  keepPreviousData,
  toAdminList,
  type IAdminList,
  type IAdminListResult,
} from "./admin-list";

/** The restore mutation is one implementation, in `admin-trash.ts`. */
export { useRestoreBlog as useRestoreTrashedBlog } from "./admin-trash";

export const ADMIN_BLOG_PAGE_SIZE = 10;

/** Invalidated by the mutations here and in `admin-trash.ts`. */
export const ADMIN_BLOGS_KEY = ["ADMIN_BLOGS"] as const;
export const TRASHED_BLOGS_KEY = ["TRASHED_BLOGS"] as const;
export const TRASH_COUNTS_KEY = ["ADMIN_TRASH_COUNTS"] as const;

export type TAdminBlogParams = IAdminBlogsParams;
export type TTrashedBlogParams = IAdminTrashParams;

export const useAdminBlogs = (
  params: TAdminBlogParams = {},
): IAdminList<IBlog, IAdminListResult<IBlog>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? ADMIN_BLOG_PAGE_SIZE;

  const query = useQuery({
    // Every field that reaches the API is part of the key.
    queryKey: [
      ...ADMIN_BLOGS_KEY,
      page,
      limit,
      params.searchTerm ?? "",
      params.sort ?? "",
      params.category ?? "",
      params.author ?? "",
      params.status ?? "",
    ],
    queryFn: async () => {
      const payload = await getAdminBlogList({
        page,
        limit,
        searchTerm: params.searchTerm || undefined,
        sort: params.sort || undefined,
        category: params.category || undefined,
        author: params.author || undefined,
        status: params.status || undefined,
      });
      const { rows, meta } = readBlogPage(payload, { page, limit });

      return { rows, meta, raw: payload };
    },
    placeholderData: keepPreviousData,
  });

  return toAdminList(query);
};

export const useTrashedBlogs = (
  params: TTrashedBlogParams = {},
): IAdminList<IBlog, IAdminListResult<IBlog>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? ADMIN_BLOG_PAGE_SIZE;

  const query = useQuery({
    queryKey: [
      ...TRASHED_BLOGS_KEY,
      page,
      limit,
      params.searchTerm ?? "",
      params.category ?? "",
      params.sort ?? "",
    ],
    queryFn: async () => {
      const payload = await getAdminTrashedBlogList({
        page,
        limit,
        searchTerm: params.searchTerm || undefined,
        category: params.category || undefined,
        sort: params.sort || undefined,
      });
      const { rows, meta } = readBlogPage(payload, { page, limit });

      return { rows, meta, raw: payload };
    },
    placeholderData: keepPreviousData,
  });

  return toAdminList(query);
};

/** Tab badges for the trash screen; a missing count shows no number. */
export const useTrashCounts = () =>
  useQuery({
    queryKey: TRASH_COUNTS_KEY,
    queryFn: async () => await getTrashCounts(),
    staleTime: 30_000,
  });

/** Moves an article to the trash; refreshes the list and both badges. */
export const useDeleteAdminBlog = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { id: string; reason?: string; onDeleted?: () => void }
  >({
    mutationKey: ["ADMIN_DELETE_BLOG"],
    mutationFn: async ({ id, reason }) => await deleteAdminBlog(id, reason),
    onSuccess: (data, variables) => {
      if (data?.success === false) {
        toast.error(data?.message || "The article could not be deleted.", {
          id: "admin-delete-blog",
        });
        return;
      }

      toast.success(data?.message || "Article moved to the trash", {
        id: "admin-delete-blog",
      });

      queryClient.invalidateQueries({ queryKey: ADMIN_BLOGS_KEY });
      queryClient.invalidateQueries({ queryKey: TRASHED_BLOGS_KEY });
      queryClient.invalidateQueries({ queryKey: TRASH_COUNTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_BLOGS"] });
      variables.onDeleted?.();
    },
    onError: (error) => {
      toast.error(error?.message || "The article could not be deleted.", {
        id: "admin-delete-blog",
      });
    },
  });
};
