import axiosInstance from "@/lib/AxiosInstance";
import type {
  IAdminCommentsParams,
  TAdminComment,
  TAdminCommentCounts,
} from "@/types/admin.type";
import {
  cleanFilter,
  isSuccessful,
  readMeta,
  readRows,
  toServiceError,
} from "./shared";

/** Extra query fields the comments screen may pass through unchanged. */
export interface TAdminCommentQuery extends IAdminCommentsParams {
  [key: string]: unknown;
}

/**
 * `GET /admin/comments` (Admin).
 *
 * Answers `{ success, data: TAdminComment[], meta }` — the rows are the bare
 * `data` array and `meta` sits beside it, unlike the messages list, which nests
 * both under `data`. Throws on failure so the table can show an error state.
 */
export const getAdminComments = async (params: TAdminCommentQuery = {}) => {
  try {
    const res = await axiosInstance.get("/admin/comments", {
      params: cleanFilter(params),
    });

    return res.data;
  } catch (error) {
    throw toServiceError(error, "Comments did not load.");
  }
};

/** Rows and `meta` of `getAdminComments`, read defensively. */
export const readCommentPage = (
  payload: unknown,
  params: IAdminCommentsParams = {},
) => {
  const rows = readRows<TAdminComment>(payload);

  return {
    rows,
    meta: readMeta(payload, rows.length, params.page, params.limit),
  };
};

// GET /admin/comments/counts -> `{ data: { total, last24h, last7d } }`
export const getCommentCounts = async (): Promise<TAdminCommentCounts> => {
  try {
    const res = await axiosInstance.get("/admin/comments/counts");
    const data = res.data as
      | {
          success?: boolean;
          message?: string;
          data?: Partial<TAdminCommentCounts>;
        }
      | undefined;

    if (!isSuccessful(data)) {
      throw new Error(data?.message || "Comment counts did not load.");
    }

    const counts = data?.data ?? {};

    return {
      total: Number(counts.total ?? 0),
      last24h: Number(counts.last24h ?? 0),
      last7d: Number(counts.last7d ?? 0),
    };
  } catch (error) {
    throw toServiceError(error, "Comment counts did not load.");
  }
};

// GET /admin/comments/latest
export const getLatestComments = async (limit = 10) => {
  try {
    const res = await axiosInstance.get("/admin/comments/latest", {
      params: { limit },
    });

    return res.data;
  } catch (error) {
    throw toServiceError(error, "Recent comments did not load.");
  }
};
