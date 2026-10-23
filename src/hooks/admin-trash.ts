"use client";

/**
 * Trash hooks.
 *
 * useTrashedUsers({ page?, limit? })
 *   -> { data: <API envelope>, rows: ITrashedUser[], meta, isLoading,
 *        isFetching, isError, refetch }
 *      reads `GET /admin/users/trash`. `data` is the raw `{ success, data,
 *      meta }` body (what the current table reads); `rows` and `meta` are the
 *      same answer already unpacked.
 *
 * useTrashedBlogs lives in `admin-blogs.ts` (it gained `searchTerm`).
 *
 * useTrashedUserCount() -> data: number | undefined   (member tab badge)
 * useTrashCounts()      -> data: { blogs?, users? }   (both tab badges)
 *
 * Mutations: useRestoreUser(), useRestoreBlog(), useDeleteAdminBlog() (from
 * `admin-blogs.ts`). Each invalidates the list, the counts and the
 * public/admin article and member lists.
 */
import {
  getTrashedUserCount,
  getTrashedUsers,
  readTrashedUserPage,
  restoreBlog,
  restoreUser,
  type ITrashParams,
} from "@/services/admin/trash";
import type { IAdminTrashParams, ITrashedUser } from "@/types/admin.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  keepPreviousData,
  toAdminList,
  type IAdminList,
  type IAdminListResult,
} from "./admin-list";

export const TRASH_PAGE_SIZE = 10;

export const TRASHED_USERS_KEY = ["TRASHED_USERS"] as const;
export const TRASHED_BLOGS_KEY = ["TRASHED_BLOGS"] as const;
export const TRASH_COUNTS_KEY = ["ADMIN_TRASH_COUNTS"] as const;
const TRASHED_USER_COUNT_KEY = ["TRASHED_USER_COUNT"] as const;

export type { ITrashParams };
export type TTrashedUserParams = IAdminTrashParams;

/**
 * The deleted-articles list moved to `admin-blogs.ts` when it gained
 * `searchTerm`; this keeps the old import path working.
 */
export { useTrashedBlogs } from "./admin-blogs";

export const useTrashedUsers = (
  params: TTrashedUserParams = {},
): IAdminList<ITrashedUser, IAdminListResult<ITrashedUser>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? TRASH_PAGE_SIZE;

  const query = useQuery({
    queryKey: [...TRASHED_USERS_KEY, page, limit],
    queryFn: async () => {
      const payload = await getTrashedUsers({ page, limit });
      const { rows, meta } = readTrashedUserPage(payload, { page, limit });

      return { rows, meta, raw: payload };
    },
    placeholderData: keepPreviousData,
  });

  return toAdminList(query);
};

/**
 * How many accounts are in the trash, for the tab badges.
 *
 * Both tabs need both counts, and each list endpoint reports only its own
 * total for the page it answered. A one-row request carries the same total,
 * so the screen gets the member count without fetching member rows.
 */
export const useTrashedUserCount = () => {
  return useQuery({
    queryKey: TRASHED_USER_COUNT_KEY,
    queryFn: async () => await getTrashedUserCount(),
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationKey: ["RESTORE_USER"],
    mutationFn: async (id) => await restoreUser(id),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data?.message || "Member restored", {
          id: "restore-user",
        });
      } else if (data?.message) {
        toast.error(data.message, { id: "restore-user" });
      }
      // The row leaves the trash list either way, so refetch in both cases.
      queryClient.invalidateQueries({ queryKey: TRASHED_USERS_KEY });
      queryClient.invalidateQueries({ queryKey: TRASH_COUNTS_KEY });
      queryClient.invalidateQueries({ queryKey: TRASHED_USER_COUNT_KEY });
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_USERS"] });
      queryClient.invalidateQueries({ queryKey: ["ADMIN_MEMBERS"] });
      queryClient.invalidateQueries({ queryKey: ["ADMIN_USERS_TRASH"] });
    },
    onError: (error) => {
      toast.error(error?.message || "The member could not be restored", {
        id: "restore-user-error",
      });
    },
  });
};

export const useRestoreBlog = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationKey: ["RESTORE_BLOG"],
    mutationFn: async (id) => await restoreBlog(id),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data?.message || "Article restored", {
          id: "restore-blog",
        });
      } else if (data?.message) {
        toast.error(data.message, { id: "restore-blog" });
      }
      // The row leaves the trash list either way, so refetch in both cases.
      queryClient.invalidateQueries({ queryKey: TRASHED_BLOGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["ADMIN_BLOGS"] });
      queryClient.invalidateQueries({ queryKey: TRASH_COUNTS_KEY });
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_BLOGS"] });
    },
    onError: (error) => {
      toast.error(error?.message || "The article could not be restored", {
        id: "restore-blog-error",
      });
    },
  });
};
