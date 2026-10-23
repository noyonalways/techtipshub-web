import axiosInstance from "@/lib/AxiosInstance";
import type { IAdminMembersParams } from "@/types/admin.type";
import type { IUser } from "@/types";
import { cleanParams, readMeta, readRows, toServiceError } from "./shared";

/** The API caps a list page at this many rows. */
const PAGE_SIZE = 100;
/** A guard against a server that never reports a last page. */
const MAX_PAGES = 20;

interface IUsersPage {
  success?: boolean;
  data?: IUser[];
  meta?: { total?: number; totalPages?: number };
}

/**
 * `GET /admin/users` (Admin) -> `{ success, data: IUser[], meta }`.
 *
 * Takes `page`, `limit`, `searchTerm`, `sort`, `role` and `status`. Throws on
 * failure so a table can show the error instead of an empty list.
 */
export const getAdminUsers = async (params: IAdminMembersParams = {}) => {
  try {
    const res = await axiosInstance.get("/admin/users", {
      params: cleanParams(params),
    });

    return res.data;
  } catch (error) {
    throw toServiceError(error, "Members did not load.");
  }
};

export const readMemberPage = (
  payload: unknown,
  params: IAdminMembersParams = {},
) => {
  const rows = readRows<IUser>(payload);

  return {
    rows,
    meta: readMeta(payload, rows.length, params.page, params.limit),
  };
};

/**
 * One account by id, through the admin directory search.
 *
 * The API has no lookup by id: `GET /admin/search?q=` answers exactly the rows
 * it was asked about (the accounting behind it matches ids as well as names,
 * usernames and emails), and `GET /admin/users?searchTerm=` matches the same
 * fields when the search endpoint comes back without the row. Neither pages by
 * ten here: the request asks for the smallest page that can hold a match and
 * keeps the row only if it carries this exact id.
 *
 * `undefined` covers both "not found" and "the request failed". The screen
 * separates those two by what the member list already told it.
 */
export const searchMember = async (
  memberId: string,
): Promise<IUser | undefined> => {
  try {
    const res = await axiosInstance.get("/admin/search", {
      params: { q: memberId },
    });

    const payload = res.data;
    const rows: IUser[] = Array.isArray(payload?.data?.members)
      ? payload.data.members
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.users)
          ? payload.data.users
          : [];

    const found = rows.find((user) => user?._id === memberId);
    if (found) return found;
  } catch {
    // Fall through to the member list below.
  }

  try {
    const res = await axiosInstance.get("/admin/users", {
      params: { searchTerm: memberId },
    });

    const payload = res.data as IUsersPage | undefined;
    if (!Array.isArray(payload?.data)) return undefined;

    return payload.data.find((user) => user._id === memberId);
  } catch {
    return undefined;
  }
};

/**
 * One account by id, scanned out of the paged admin member list.
 *
 * Used when the search above comes back empty: it walks pages of 100 and stops
 * at the page holding the id, reading the server's `totalPages` to know where
 * the list ends. `undefined` when the account is deleted or gone.
 */
export const scanMemberList = async (
  memberId: string,
): Promise<IUser | undefined> => {
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let payload: IUsersPage | undefined;

    try {
      const res = await axiosInstance.get("/admin/users", {
        params: { page, limit: PAGE_SIZE },
      });
      payload = res.data;
    } catch {
      return undefined;
    }

    const rows = Array.isArray(payload?.data) ? payload.data : [];
    const match = rows.find((user) => user._id === memberId);
    if (match) return match;

    const { totalPages, total } = payload?.meta ?? {};
    const lastPage = Number.isFinite(Number(totalPages))
      ? Number(totalPages)
      : Number.isFinite(Number(total))
        ? Math.ceil(Number(total) / PAGE_SIZE)
        : rows.length < PAGE_SIZE
          ? page
          : MAX_PAGES;

    if (page >= Math.min(lastPage, MAX_PAGES)) return undefined;
  }

  return undefined;
};

// Members who follow this account. Rows are `{ follower: {...} }` wrappers,
// so callers read `row.follower`.
export const getMemberFollowers = async (
  userId: string,
  params: { page?: number; limit?: number } = {},
) => {
  try {
    const res = await axiosInstance.get(`/users/${userId}/followers`, {
      params,
    });

    return res.data;
  } catch (error: any) {
    return error?.response?.data;
  }
};

// Accounts this member follows. Rows are `{ following: {...} }` wrappers.
export const getMemberFollowing = async (
  userId: string,
  params: { page?: number; limit?: number } = {},
) => {
  try {
    const res = await axiosInstance.get(`/users/${userId}/following`, {
      params,
    });

    return res.data;
  } catch (error: any) {
    return error?.response?.data;
  }
};
