"use client";

import { ListSelect, useDebouncedTerm } from "@/components/admin/list-controls";
import { formatCount, formatDate } from "@/components/admin/format";
import AdminPagination from "@/components/modules/admin/kit/pagination";
import ConfirmDialog from "@/components/modules/admin/kit/confirm-dialog";
import DataTable, {
  type DataTableColumn,
} from "@/components/modules/admin/kit/data-table";
import DataToolbar from "@/components/modules/admin/kit/data-toolbar";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import { focusRing } from "@/components/modules/admin/kit/tau";
import StatusPill from "@/components/ui/status-pill";
import { useAdminMembers } from "@/hooks/admin-members";
import {
  useBlockUser,
  useDeleteUserAccount,
  useMakeAdmin,
  useUnblockUser,
} from "@/hooks/user.hook";
import type { IUser, TUserRole, TUserStatus } from "@/types";
import { Avatar } from "@heroui/react";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  FiExternalLink,
  FiSearch,
  FiSlash,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";
import { PiUsers } from "react-icons/pi";
import RowMenu from "./row-menu";

const PAGE_SIZES = [10, 20, 50] as const;

type RoleFilter = "all" | TUserRole;
type StatusFilter = "all" | TUserStatus;

/** The role and status values `GET /admin/users` accepts; anything else is a 400. */
const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "User", label: "Members" },
  { value: "Admin", label: "Admins" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Blocked", label: "Blocked" },
];

const asRole = (value: string): RoleFilter =>
  value === "User" || value === "Admin" ? value : "all";

const asStatus = (value: string): StatusFilter =>
  value === "Active" || value === "Blocked" ? value : "all";

const displayName = (user: IUser) =>
  user.fullName?.trim() || user.username || "Unnamed member";

const COLUMNS: DataTableColumn[] = [
  { key: "member", header: "Member", className: "min-w-[16rem]" },
  { key: "role", header: "Role", className: "whitespace-nowrap" },
  { key: "status", header: "Status", className: "whitespace-nowrap" },
  {
    key: "followers",
    header: "Followers",
    align: "right",
    className: "whitespace-nowrap tabular-nums",
  },
  {
    key: "joined",
    header: "Joined",
    className: "whitespace-nowrap tabular-nums",
  },
  { key: "actions", header: "Actions", align: "right" },
];

const quietButton = `inline-flex min-h-11 items-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-default-100 sm:min-h-9 ${focusRing}`;

const menuItem = `flex min-h-11 w-full items-center gap-2 rounded-[5px] px-2.5 text-left text-sm text-foreground transition-colors hover:bg-default-100 focus-visible:bg-default-100 disabled:pointer-events-none disabled:text-default-400 ${focusRing}`;

const dangerItem = `flex min-h-11 w-full items-center gap-2 rounded-[5px] px-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10 focus-visible:bg-danger/10 disabled:pointer-events-none disabled:text-default-400 ${focusRing}`;

const MenuItemLink = ({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) => (
  <Link
    href={href}
    role="menuitem"
    target={external ? "_blank" : undefined}
    rel={external ? "noreferrer" : undefined}
    className={menuItem}
  >
    {children}
  </Link>
);

const MenuSeparator = () => (
  <div role="separator" className="my-1 h-px bg-default/60" />
);

/**
 * Member management. Search, role, status, page size and page go to
 * `GET /admin/users`, so the footer total and the pager cover every account
 * rather than the ten rows that were fetched.
 *
 * The list endpoint has no filter for unverified accounts, so there is no
 * unverified tab; the status column still says which accounts are unverified.
 */
const UsersTable = ({ initialFilter }: { initialFilter?: string }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(PAGE_SIZES[0]);
  const [query, setQuery] = useState("");
  // `?filter=blocked` is the dashboard's blocked-accounts link.
  const [status, setStatus] = useState<StatusFilter>(
    initialFilter === "blocked" ? "Blocked" : "all",
  );
  const [role, setRole] = useState<RoleFilter>("all");
  const [seenFilter, setSeenFilter] = useState(initialFilter);

  if (seenFilter !== initialFilter) {
    setSeenFilter(initialFilter);
    setStatus(initialFilter === "blocked" ? "Blocked" : "all");
    setPage(1);
  }

  const resetPage = useCallback(() => setPage(1), []);
  const searchTerm = useDebouncedTerm(query, resetPage);

  const list = useAdminMembers({
    page,
    limit,
    searchTerm,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
  });

  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();
  const { mutate: makeAdmin, isPending: isPromoting } = useMakeAdmin();
  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteUserAccount();

  const { rows, meta, isLoading, isError, error, refetch } = list;

  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const total = meta?.total ?? 0;
  const pageSize = meta?.limit ?? limit;

  const refresh = () => {
    void refetch();
  };

  const onDeleted = useCallback(() => {
    if (page > 1 && rows.length <= 1)
      setPage((current) => Math.max(1, current - 1));
  }, [page, rows.length]);

  const isFiltered = Boolean(searchTerm) || role !== "all" || status !== "all";

  const resetFilters = () => {
    setQuery("");
    setRole("all");
    setStatus("all");
    setPage(1);
  };

  const summary = [
    `${formatCount(total)} ${total === 1 ? "account" : "accounts"}`,
    searchTerm ? `matching "${searchTerm}"` : "",
    role === "all" ? "" : role === "Admin" ? "admins only" : "members only",
    status === "all"
      ? ""
      : status === "Blocked"
        ? "blocked only"
        : "active only",
  ]
    .filter(Boolean)
    .join(", ");

  const emptyState = isError ? (
    <EmptyState
      variant="inline"
      icon={<PiUsers className="size-5" />}
      title="Members could not be loaded"
      description={
        error?.message ||
        "The members request failed. Check that the API is running, then try again."
      }
      action={
        <button type="button" onClick={refresh} className={quietButton}>
          Try again
        </button>
      }
    />
  ) : isFiltered ? (
    <EmptyState
      variant="inline"
      icon={<FiSearch className="size-5" />}
      title="No members match this view"
      description="No account on the server matches that search, role and status. Clear them to see every member."
      action={
        <button type="button" onClick={resetFilters} className={quietButton}>
          Clear search and filters
        </button>
      }
    />
  ) : (
    <EmptyState
      variant="inline"
      icon={<PiUsers className="size-5" />}
      title="No members yet"
      description="Accounts appear here as people join. Roles, block status and join dates are managed from this table."
    />
  );

  return (
    <div className="overflow-hidden rounded-xl border border-default/60 bg-content-1">
      <DataToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Name, username or email"
        right={
          <>
            <ListSelect
              label="Role"
              hideLabel
              value={role}
              onChange={(value) => {
                setRole(asRole(value));
                setPage(1);
              }}
              options={ROLE_OPTIONS}
            />
            <ListSelect
              label="Status"
              hideLabel
              value={status}
              onChange={(value) => {
                setStatus(asStatus(value));
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
            <ListSelect
              label="Per page"
              hideLabel
              value={limit}
              onChange={(value) => {
                setLimit(Number(value) || PAGE_SIZES[0]);
                setPage(1);
              }}
              options={PAGE_SIZES.map((size) => ({
                value: size,
                label: `${size} per page`,
              }))}
            />
          </>
        }
      />

      <DataTable
        caption="Member accounts, newest first"
        columns={COLUMNS}
        rows={rows}
        getRowKey={(user) => user._id}
        isLoading={isLoading}
        skeletonRows={Math.min(limit, 10)}
        emptyState={emptyState}
        minWidth="54rem"
        renderCell={(user, key) => {
          switch (key) {
            case "member": {
              const name = displayName(user);
              return (
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar
                    src={user.profilePicture || undefined}
                    size="sm"
                    className="size-8 shrink-0"
                    classNames={{ name: "text-xs" }}
                    name={name.charAt(0).toUpperCase()}
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/admin/manage-users/${user._id}`}
                      className={`block max-w-[18rem] truncate rounded-sm font-medium hover:text-primary-accessible ${focusRing}`}
                    >
                      {name}
                    </Link>
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs text-default-600">
                      {user.email && (
                        <span className="max-w-[15rem] truncate">
                          {user.email}
                        </span>
                      )}
                      {user.username && <span>@{user.username}</span>}
                    </div>
                  </div>
                </div>
              );
            }

            case "role":
              return (
                <StatusPill
                  tone={user.role === "Admin" ? "primary" : "neutral"}
                >
                  {user.role === "Admin" ? "Admin" : "Member"}
                </StatusPill>
              );

            case "status":
              return (
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusPill
                    tone={user.status === "Active" ? "success" : "danger"}
                    dot
                  >
                    {user.status}
                  </StatusPill>
                  {user.isVerified ? (
                    <StatusPill tone="neutral">Verified</StatusPill>
                  ) : (
                    <StatusPill tone="warning">Unverified</StatusPill>
                  )}
                </div>
              );

            case "followers":
              return <span>{formatCount(user.totalFollowers) || "0"}</span>;

            case "joined":
              return (
                <span className="text-xs text-default-600">
                  {formatDate(user.createdAt) || "Not recorded"}
                </span>
              );

            case "actions": {
              const name = displayName(user);
              const isAdmin = user.role === "Admin";
              const blocked = user.status === "Blocked";

              return (
                <RowMenu label={`Actions for ${name}`}>
                  <MenuItemLink href={`/admin/manage-users/${user._id}`}>
                    Open member
                  </MenuItemLink>
                  {user.username && (
                    <MenuItemLink href={`/users/@${user.username}`} external>
                      <FiExternalLink aria-hidden className="size-4" />
                      Public profile
                    </MenuItemLink>
                  )}

                  <MenuSeparator />

                  {blocked ? (
                    <ConfirmDialog
                      trigger={
                        <button
                          type="button"
                          role="menuitem"
                          className={menuItem}
                        >
                          <FiSlash aria-hidden className="size-4" />
                          Unblock account
                        </button>
                      }
                      title={`Unblock ${name}?`}
                      description="They can sign in, vote and comment again straight away."
                      confirmLabel="Unblock account"
                      isPending={isUnblocking}
                      onConfirm={() =>
                        unblockUser(user._id, { onSuccess: () => refresh() })
                      }
                    />
                  ) : (
                    <ConfirmDialog
                      trigger={
                        <button
                          type="button"
                          role="menuitem"
                          disabled={isAdmin}
                          className={menuItem}
                          title={
                            isAdmin
                              ? "Admin accounts cannot be blocked"
                              : undefined
                          }
                        >
                          <FiSlash aria-hidden className="size-4" />
                          Block account
                        </button>
                      }
                      title={`Block ${name}?`}
                      description="They stay visible on the site but cannot sign in, comment or vote until you unblock them."
                      confirmLabel="Block account"
                      tone="danger"
                      isPending={isBlocking}
                      onConfirm={() =>
                        blockUser(user._id, { onSuccess: () => refresh() })
                      }
                    />
                  )}

                  {isAdmin ? (
                    <span
                      role="menuitem"
                      aria-disabled="true"
                      className={`${menuItem} text-default-400`}
                    >
                      <FiUserCheck aria-hidden className="size-4" />
                      Already an admin
                    </span>
                  ) : (
                    <ConfirmDialog
                      trigger={
                        <button
                          type="button"
                          role="menuitem"
                          disabled={blocked}
                          className={menuItem}
                          title={
                            blocked
                              ? "Unblock them before promoting"
                              : undefined
                          }
                        >
                          <FiUserCheck aria-hidden className="size-4" />
                          Make admin
                        </button>
                      }
                      title={`Make ${name} an admin?`}
                      description="Admins can manage articles, comments, members and settings. This screen cannot undo it."
                      confirmLabel="Make admin"
                      isPending={isPromoting}
                      onConfirm={() =>
                        makeAdmin(user._id, { onSuccess: () => refresh() })
                      }
                    />
                  )}

                  <MenuSeparator />

                  <ConfirmDialog
                    trigger={
                      <button
                        type="button"
                        role="menuitem"
                        disabled={isAdmin}
                        className={dangerItem}
                        title={
                          isAdmin
                            ? "Admin accounts cannot be deleted"
                            : undefined
                        }
                      >
                        <FiTrash2 aria-hidden className="size-4" />
                        Delete account
                      </button>
                    }
                    title={`Delete ${name}'s account?`}
                    description="Their articles, comments, views and votes go with the account and do not come back. The login can be restored from Trash."
                    confirmLabel="Delete account"
                    tone="danger"
                    isPending={isDeleting}
                    onConfirm={() =>
                      deleteAccount(user._id, {
                        onSuccess: () => {
                          onDeleted();
                          refresh();
                        },
                      })
                    }
                  />
                </RowMenu>
              );
            }

            default:
              return null;
          }
        }}
        footer={
          <>
            <p className="border-t border-default/60 bg-default-50/40 px-3 py-2 text-xs tabular-nums text-default-600">
              {meta ? summary : "Counting accounts"}
            </p>
            <AdminPagination
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        }
      />
    </div>
  );
};

export default UsersTable;
