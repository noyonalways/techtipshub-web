"use client";

import EmptyState from "@/components/modules/admin/empty-state";
import StatusPill from "@/components/ui/status-pill";
import { useBlockUser, useGetAllUsers, useUnblockUser } from "@/hooks/user.hook";
import { IUser } from "@/types";
import { Avatar } from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { PiUsers } from "react-icons/pi";
import {
  BlockUnblockConfirmActionModal,
  DeleteUserAccountConfirmationModal,
  MakeAdminConfirmationModal,
} from "../modals";

const HEADINGS = ["Member", "Role", "Status", "Joined", "Actions"] as const;

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

type Filter = "all" | "admins" | "blocked";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "admins", label: "Admins" },
  { key: "blocked", label: "Blocked" },
];

/**
 * Member management table. Filtering happens client-side over the users the
 * API already returned; no extra requests, and the counts are always honest.
 */
const UsersTable = () => {
  const { data, isLoading, isError, refetch } = useGetAllUsers();
  const users = Array.isArray(data?.data) ? (data.data as IUser[]) : [];

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const { mutate: blockUser, isPending: isBlockUserPending } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnBlockUserPending } =
    useUnblockUser();

  const handleBlockUser = (id: string) => {
    blockUser(id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleUnblockUser = (id: string) => {
    unblockUser(id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const counts = useMemo(
    () => ({
      all: users.length,
      admins: users.filter((user) => user.role === "Admin").length,
      blocked: users.filter((user) => user.status === "Blocked").length,
    }),
    [users]
  );

  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (filter === "admins" && user.role !== "Admin") return false;
      if (filter === "blocked" && user.status !== "Blocked") return false;
      if (!needle) return true;
      return [user.fullName, user.username, user.email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));
    });
  }, [users, filter, query]);

  return (
    <div className="overflow-hidden rounded-xl border border-default/60">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-default/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter members"
          className="flex items-center gap-1"
        >
          {FILTERS.map((item) => (
            <button
              key={item.key}
              role="tab"
              type="button"
              aria-selected={filter === item.key}
              onClick={() => setFilter(item.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                filter === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-default-600 hover:bg-default-100"
              }`}
            >
              {item.label}
              <span className="tabular-nums text-default-400">
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>

        <label className="relative block sm:w-64">
          <span className="sr-only">Search members</span>
          <FiSearch
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-default-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, username or email"
            className="w-full rounded-lg border border-default/60 bg-background py-1.5 pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-default-400 focus:border-primary/60"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-default/60 bg-default-50/60 text-[0.6875rem] uppercase tracking-wider text-default-500">
              {HEADINGS.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className={`px-4 py-2.5 font-semibold ${
                    heading === "Actions" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-default/60">
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-3.5" colSpan={HEADINGS.length}>
                    <div className="h-4 w-full max-w-lg rounded bg-default-100" />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              visibleUsers.map((user) => (
                <tr
                  key={user._id}
                  className="transition-colors hover:bg-default-50/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/@${user.username}`}
                      className="flex items-center gap-2.5"
                    >
                      <Avatar
                        src={user.profilePicture}
                        size="sm"
                        className="size-8 shrink-0 object-cover"
                        name={(user.fullName || "?").charAt(0).toUpperCase()}
                      />
                      <span className="min-w-0">
                        <span className="block max-w-[16rem] truncate font-medium">
                          {user.fullName}
                        </span>
                        <span className="block max-w-[16rem] truncate text-xs text-default-500">
                          {user.email}
                        </span>
                      </span>
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <StatusPill tone={user.role === "Admin" ? "primary" : "neutral"}>
                      {user.role}
                    </StatusPill>
                  </td>

                  <td className="px-4 py-3">
                    <StatusPill
                      dot
                      tone={user.status === "Active" ? "success" : "danger"}
                    >
                      {user.status}
                    </StatusPill>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-default-600">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <DeleteUserAccountConfirmationModal
                        id={user._id}
                        role={user.role}
                        reFetchUsers={refetch}
                      />

                      {user.status === "Active" ? (
                        <BlockUnblockConfirmActionModal
                          actionType="block"
                          isPending={isBlockUserPending}
                          handleAction={handleBlockUser}
                          user={{ _id: user._id, role: user.role }}
                        />
                      ) : (
                        <BlockUnblockConfirmActionModal
                          actionType="unblock"
                          isPending={isUnBlockUserPending}
                          handleAction={handleUnblockUser}
                          user={{ _id: user._id, role: user.role }}
                        />
                      )}

                      <MakeAdminConfirmationModal
                        id={user._id}
                        role={user.role}
                        status={user.status}
                        reFetchUsers={refetch}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <p className="sr-only" role="status">
          Loading members
        </p>
      )}

      {!isLoading && visibleUsers.length === 0 && (
        <EmptyState
          variant="inline"
          icon={<PiUsers className="size-5" />}
          title={
            isError
              ? "Members could not be loaded"
              : users.length === 0
                ? "No members yet"
                : "No members match this view"
          }
          description={
            isError
              ? "The request failed. Check that the API is running, then reload this page."
              : users.length === 0
                ? "Accounts will appear here as people join."
                : "Try a different filter or clear the search field."
          }
        />
      )}

      {!isLoading && visibleUsers.length > 0 && (
        <div className="flex items-center justify-between border-t border-default/60 px-4 py-2.5 text-xs text-default-500">
          <span className="tabular-nums">
            Showing {visibleUsers.length} of {users.length} members
          </span>
          <span>Sourced from the live API</span>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
