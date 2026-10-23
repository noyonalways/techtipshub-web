"use client";

/**
 * Comment moderation hooks.
 *
 * useAdminComments({ page?, limit?, searchTerm?, within?: "24h" | "7d" | "all" })
 *   -> { data: <API envelope>, rows: TAdminComment[], meta, isLoading,
 *        isFetching, isError, refetch }
 *      reads `GET /admin/comments` (rows are the bare `data` array, `meta` beside
 *      it). `within` is the API's own time filter; leave it out for "all".
 *
 * useCommentCounts() -> data: { total, last24h, last7d } (isError on failure)
 * useLatestComments() -> the dashboard's recent-comment strip
 *
 * useDeleteAdminComment() -> mutate({ commentId, onDeleted? }); invalidates the
 * list, both count queries and the latest strip.
 */
import {
  getAdminComments,
  getCommentCounts,
  getLatestComments,
  readCommentPage,
} from "@/services/admin/comments";
import { deleteCommentAsAdmin } from "@/services/blog";
import type { IAdminCommentsParams, TAdminComment } from "@/types/admin.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  keepPreviousData,
  toAdminList,
  type IAdminList,
  type IAdminListResult,
} from "./admin-list";

export const ADMIN_COMMENT_PAGE_SIZE = 20;

export const QUERY_KEYS = {
  list: ["ADMIN_COMMENTS"],
  counts: ["COMMENT_COUNTS"],
  latest: ["ADMIN_LATEST_COMMENTS"],
} as const;

export type TAdminCommentsParams = IAdminCommentsParams;

export const useAdminComments = (
  params: TAdminCommentsParams = {},
): IAdminList<TAdminComment, IAdminListResult<TAdminComment>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? ADMIN_COMMENT_PAGE_SIZE;
  const within = params.within ?? "all";

  const query = useQuery({
    queryKey: [
      ...QUERY_KEYS.list,
      page,
      limit,
      params.searchTerm ?? "",
      within,
      params.sort ?? "",
    ],
    queryFn: async () => {
      const payload = await getAdminComments({
        page,
        limit,
        searchTerm: params.searchTerm || undefined,
        within,
        sort: params.sort || undefined,
      });
      const { rows, meta } = readCommentPage(payload, { page, limit });

      return { rows, meta, raw: payload };
    },
    // Page switches keep the previous rows on screen instead of flashing a skeleton.
    placeholderData: keepPreviousData,
  });

  return toAdminList(query);
};

export const useCommentCounts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.counts,
    queryFn: async () => await getCommentCounts(),
  });
};

export const useLatestComments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.latest,
    queryFn: async () => await getLatestComments(10),
  });
};

export const useDeleteAdminComment = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { commentId: string; onDeleted?: () => void }>(
    {
      mutationKey: ["ADMIN_DELETE_COMMENT"],
      mutationFn: async ({ commentId }) =>
        await deleteCommentAsAdmin(commentId),
      onSuccess: (data, variables) => {
        if (data?.success === false) {
          toast.error(data?.message || "The comment could not be deleted.", {
            id: "admin-delete-comment",
          });
          return;
        }

        toast.success(data?.message || "Comment deleted", {
          id: "admin-delete-comment",
        });

        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.counts });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latest });
        variables.onDeleted?.();
      },
      onError: (error) => {
        toast.error(error?.message || "The comment could not be deleted.", {
          id: "admin-delete-comment",
        });
      },
    },
  );
};
