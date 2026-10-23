"use client";

/**
 * Contact message hooks.
 *
 * useAdminMessages({ page?, limit?, status?: "new"|"read"|"archived"|"all", searchTerm? })
 *   -> { data: <API envelope>, rows: TContact[], meta, counts, isLoading,
 *        isFetching, isError, refetch }
 *      reads `GET /admin/messages`, whose answer nests everything under `data`:
 *      `{ success, data: { result, meta, counts } }`. `counts` is that block
 *      (`{ new, read, archived }`) whatever page is showing, so the filter
 *      badges keep their totals while paging.
 *
 * useContactMessages(...) is the same hook under its old name, for screens
 * that already import it.
 *
 * useContactMessage(id, enabled?) -> one message
 * useUpdateContactStatus() -> mutate({ id, status }); invalidates the list, the
 * counts (they ride on the list answer) and the single-message queries.
 */
import {
  getContactMessage,
  getContactMessages,
  readMessagePage,
  updateContactStatus,
} from "@/services/admin/messages";
import type {
  IAdminMessagesParams,
  TContact,
  TContactCounts,
  TContactStatus,
} from "@/types/admin.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  keepPreviousData,
  toAdminList,
  type IAdminList,
  type IAdminListResult,
} from "./admin-list";

export const ADMIN_MESSAGE_PAGE_SIZE = 20;

export const QUERY_KEYS = {
  list: ["ADMIN_MESSAGES"],
  single: ["ADMIN_MESSAGE"],
  counts: ["ADMIN_MESSAGE_COUNTS"],
} as const;

export type TAdminMessagesParams = IAdminMessagesParams;

export type TAdminMessageList = IAdminList<
  TContact,
  IAdminListResult<TContact>
>;

/** `counts` as the messages screen reads it; missing totals read as zero. */
export const EMPTY_MESSAGE_COUNTS: TContactCounts = {
  new: 0,
  read: 0,
  archived: 0,
};

export const useAdminMessages = (
  params: TAdminMessagesParams = {},
): TAdminMessageList & { counts: TContactCounts } => {
  const page = params.page ?? 1;
  const limit = params.limit ?? ADMIN_MESSAGE_PAGE_SIZE;
  const status = params.status ?? "all";

  const query = useQuery({
    queryKey: [
      ...QUERY_KEYS.list,
      page,
      limit,
      status,
      params.searchTerm ?? "",
    ],
    queryFn: async () => {
      const payload = await getContactMessages({
        page,
        limit,
        status,
        searchTerm: params.searchTerm || undefined,
      });
      const { rows, meta, counts } = readMessagePage(payload, { page, limit });

      return {
        rows,
        meta,
        counts: counts as unknown as Record<string, number>,
        raw: payload,
      };
    },
    placeholderData: keepPreviousData,
  });

  const list = toAdminList<TContact, IAdminListResult<TContact>>(query);

  return {
    ...list,
    counts:
      (list.query.data?.counts as unknown as TContactCounts | undefined) ??
      EMPTY_MESSAGE_COUNTS,
  };
};

/** The pre-rename name; same hook, same result. */
export const useContactMessages = useAdminMessages;

export const useContactMessage = (id?: string, enabled = true) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.single, id],
    queryFn: async () => await getContactMessage(id as string),
    enabled: Boolean(id) && enabled,
  });
};

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; status: TContactStatus }>({
    mutationKey: ["ADMIN_UPDATE_CONTACT_STATUS"],
    mutationFn: async (payload) => await updateContactStatus(payload),
    onSuccess: (data, variables) => {
      if (data?.success === false) {
        toast.error(data?.message || "The message status was not saved.", {
          id: "admin-contact-status",
        });
        return;
      }

      toast.success(data?.message || "Message updated", {
        id: "admin-contact-status",
      });

      // The counts ride on the list answer, so refreshing the list is enough.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.counts });
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.single, variables.id],
      });
    },
    onError: (error) => {
      toast.error(error?.message || "The message status was not saved.", {
        id: "admin-contact-status",
      });
    },
  });
};
