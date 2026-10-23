import axiosInstance from "@/lib/AxiosInstance";
import type {
  IAdminMessagesParams,
  TContact,
  TContactCounts,
  TContactStatus,
} from "@/types/admin.type";
import { cleanFilter, readMeta, toServiceError } from "./shared";

export interface TContactMessageQuery extends IAdminMessagesParams {
  [key: string]: unknown;
}

const readCounts = (value: unknown): TContactCounts | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const counts = value as Partial<TContactCounts>;

  return {
    new: Number(counts.new ?? 0),
    read: Number(counts.read ?? 0),
    archived: Number(counts.archived ?? 0),
  };
};

/**
 * `GET /admin/messages` (Admin).
 *
 * Answers `{ success, data: { result, meta, counts } }` — rows, paging and the
 * per-status counts all nest under `data`. Throws on failure.
 */
export const getContactMessages = async (params: TContactMessageQuery = {}) => {
  try {
    const res = await axiosInstance.get("/admin/messages", {
      params: cleanFilter(params),
    });

    return res.data;
  } catch (error) {
    throw toServiceError(error, "Messages did not load.");
  }
};

/**
 * Rows, `meta` and `counts` of `getContactMessages`, read defensively so a
 * flattened answer (rows in `data`, meta beside it) still works.
 */
export const readMessagePage = (
  payload: unknown,
  params: IAdminMessagesParams = {},
) => {
  const body = payload as
    | {
        meta?: Record<string, unknown>;
        data?: { result?: unknown; meta?: unknown; counts?: unknown };
      }
    | undefined;

  const data = body?.data;
  const rows = Array.isArray(data?.result)
    ? (data.result as TContact[])
    : Array.isArray(data)
      ? (data as TContact[])
      : [];
  const meta = readMeta(
    { meta: data?.meta ?? body?.meta },
    rows.length,
    params.page,
    params.limit,
  );

  return { rows, meta, counts: readCounts(data?.counts) };
};

// GET /admin/messages/:id
export const getContactMessage = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/admin/messages/${id}`);

    return res.data;
  } catch (error) {
    throw toServiceError(error, "The message did not load.");
  }
};

// PATCH /admin/messages/:id/status
export const updateContactStatus = async ({
  id,
  status,
}: {
  id: string;
  status: TContactStatus;
}) => {
  try {
    const res = await axiosInstance.patch(`/admin/messages/${id}/status`, {
      status,
    });

    return res.data;
  } catch (error) {
    throw toServiceError(error, "The message status was not saved.");
  }
};
