"use client";

/**
 * Member hooks.
 *
 * useAdminMembers({ page?, limit?, searchTerm?, sort?, role?, status? })
 *   -> { data: <API envelope>, rows: IUser[], meta, isLoading, isFetching,
 *        isError, refetch }
 *      reads `GET /admin/users`. `role` is "User" | "Admin", `status` is
 *      "Active" | "Blocked"; leave either out for all.
 *
 * useTrashedUsers in `admin-trash.ts` covers the deleted members.
 * useFoundMember(id), useMemberFollowers(id), useMemberFollowing(id) read a
 * single member and the two follow lists.
 */
import {
  getAdminUsers,
  getMemberFollowers,
  getMemberFollowing,
  readMemberPage,
  searchMember,
} from "@/services/admin/members";
import type { IAdminMembersParams } from "@/types/admin.type";
import type { IFollower, IUser } from "@/types";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  keepPreviousData,
  toAdminList,
  type IAdminList,
  type IAdminListResult,
} from "./admin-list";

/** Rows shown per follow list; the card says how many more there are. */
export const MEMBER_PEOPLE_LIMIT = 6;

export const ADMIN_MEMBERS_KEY = ["ADMIN_MEMBERS"] as const;

export type TAdminMembersParams = IAdminMembersParams;

export const useAdminMembers = (
  params: TAdminMembersParams = {},
): IAdminList<IUser, IAdminListResult<IUser>> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const query = useQuery({
    queryKey: [
      ...ADMIN_MEMBERS_KEY,
      page,
      limit,
      params.searchTerm ?? "",
      params.sort ?? "",
      params.role ?? "",
      params.status ?? "",
    ],
    queryFn: async () => {
      const payload = await getAdminUsers({
        page,
        limit,
        searchTerm: params.searchTerm || undefined,
        sort: params.sort || undefined,
        role: params.role,
        status: params.status,
      });
      const { rows, meta } = readMemberPage(payload, { page, limit });

      return { rows, meta, raw: payload };
    },
    placeholderData: keepPreviousData,
  });

  return toAdminList(query);
};

interface IListEnvelope<T> {
  success?: boolean;
  data?: T[];
  meta?: { total?: number };
}

const readRows = <T>(response: unknown): { rows: T[]; total?: number } => {
  const payload = response as IListEnvelope<T> | undefined;
  if (!payload || payload.success === false || !Array.isArray(payload.data)) {
    return { rows: [] };
  }

  return { rows: payload.data, total: payload.meta?.total };
};

export type TPersonRow = Pick<
  IFollower,
  "_id" | "fullName" | "username" | "profilePicture"
>;

export interface IPeoplePage {
  rows: TPersonRow[];
  total?: number;
}

/**
 * The member behind a route id.
 *
 * The shared member list query only holds the API's first page of ten, so it
 * cannot find most members. This asks the admin search endpoint by id, which
 * answers the row itself. No row means no live account: the screen shows the
 * not-found state rather than pretending the member is gone for good.
 */
export const useFoundMember = (memberId?: string) => {
  const query = useQuery({
    queryKey: ["ADMIN_MEMBER_SEARCH", memberId],
    queryFn: async (): Promise<IUser | undefined> =>
      await searchMember(memberId!),
    enabled: Boolean(memberId),
    staleTime: 30_000,
  });

  return {
    member: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    isMissing: query.isSuccess && query.data === undefined,
    refetch: query.refetch,
  };
};

export const useMemberFollowers = (
  memberId?: string,
): UseQueryResult<IPeoplePage> =>
  useQuery({
    queryKey: ["ADMIN_MEMBER_FOLLOWERS", memberId],
    enabled: Boolean(memberId),
    queryFn: async () => {
      const { rows, total } = readRows<{ follower?: TPersonRow }>(
        await getMemberFollowers(memberId!, {
          page: 1,
          limit: MEMBER_PEOPLE_LIMIT,
        }),
      );
      return { rows: rows.flatMap((row) => row.follower ?? []), total };
    },
  });

export const useMemberFollowing = (
  memberId?: string,
): UseQueryResult<IPeoplePage> =>
  useQuery({
    queryKey: ["ADMIN_MEMBER_FOLLOWING", memberId],
    enabled: Boolean(memberId),
    queryFn: async () => {
      const { rows, total } = readRows<{ following?: TPersonRow }>(
        await getMemberFollowing(memberId!, {
          page: 1,
          limit: MEMBER_PEOPLE_LIMIT,
        }),
      );
      return { rows: rows.flatMap((row) => row.following ?? []), total };
    },
  });

/** Where a member's public profile lives, once they have a username. */
export const memberProfileHref = (username?: string) =>
  username ? `/users/@${username}` : undefined;
