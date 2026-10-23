"use server";

import axiosInstance from "@/lib/AxiosInstance";
import type { IBlog } from "@/types";

export interface IUserBlogsPage {
  result: IBlog[];
  /** Server-side total for the author; it counts published articles only. */
  total: number;
}

/**
 * Articles written by one member, read by an admin (`/blogs/users/:id`).
 *
 * Not `getBlogsByUserId`: that one resolves `BASE_API`, which is the browser's
 * view of the API, and it carries no auth token. Admin screens call this
 * cookie-backed instance instead.
 *
 * Returns `undefined` when the request failed or the member does not exist, so
 * the caller shows an error state rather than an empty list.
 */
export const getAdminBlogsByUserId = async (
  userId: string,
  params: { page?: number; limit?: number } = {},
): Promise<IUserBlogsPage | undefined> => {
  try {
    const res = await axiosInstance.get(`/blogs/users/${userId}`, { params });
    const payload = res.data;

    if (payload?.success === false || !Array.isArray(payload?.data)) {
      return undefined;
    }

    return {
      result: payload.data as IBlog[],
      total: Number.isFinite(Number(payload?.meta?.total))
        ? Number(payload.meta.total)
        : payload.data.length,
    };
  } catch {
    return undefined;
  }
};
