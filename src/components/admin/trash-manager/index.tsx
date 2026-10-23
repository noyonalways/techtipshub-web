"use client";

import BlockError, { RetryButton } from "@/components/admin/block-error";
import {
  formatDate,
  formatDateTime,
  initialsOf,
  plural,
} from "@/components/admin/format";
import {
  quietButton,
  useDebouncedTerm,
} from "@/components/admin/list-controls";
import AdminPagination from "@/components/modules/admin/kit/pagination";
import ConfirmDialog from "@/components/modules/admin/kit/confirm-dialog";
import DataTable from "@/components/modules/admin/kit/data-table";
import DataToolbar from "@/components/modules/admin/kit/data-toolbar";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import { focusRing } from "@/components/modules/admin/kit/tau";
import SectionCard from "@/components/modules/admin/section-card";
import {
  useRestoreBlog,
  useRestoreUser,
  useTrashedBlogs,
  useTrashedUsers,
} from "@/hooks/admin-trash";
import { useTrashCounts } from "@/hooks/admin-blogs";
import type { IUser, ITrashedUser } from "@/types";
import { Avatar } from "@heroui/react";
import Link from "next/link";
import { useCallback, useId, useState } from "react";
import { MdOutlineArticle } from "react-icons/md";
import { PiUsers } from "react-icons/pi";
import { RiArrowGoBackLine } from "react-icons/ri";

const PAGE_SIZE = 10;

type Tab = "articles" | "members";

interface IRestored {
  name: string;
  href?: string;
  what: "article" | "account";
}

/** A restore answers with the restored document, sometimes wrapped. */
const readRestored = <T,>(response: unknown): T | undefined => {
  const payload = response as { success?: boolean; data?: unknown } | undefined;
  if (!payload || payload.success === false || !payload.data) return undefined;

  const data = payload.data as T | { blog?: T; user?: T };
  if (typeof data === "object" && data !== null) {
    const wrapped = data as { blog?: T; user?: T };
    if (wrapped.blog) return wrapped.blog;
    if (wrapped.user) return wrapped.user;
  }

  return data as T;
};

const restoreButton = `inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border border-default-200 px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-default-100 disabled:opacity-50 sm:min-h-9 ${focusRing}`;

const linkClass = `rounded font-medium text-primary-accessible underline-offset-4 hover:underline ${focusRing}`;

/** The deleted row as the trash endpoints send it; no body, so no content. */
interface ITrashedArticle {
  _id: string;
  title: string;
  slug: string;
  author?: Pick<IUser, "fullName" | "username">;
  category?: { name?: string };
  updatedAt?: string;
}

/**
 * The trash. Both lists are server-paged; article search covers the whole
 * trash and the member tab narrows the page it received, so the tab badges,
 * the footer total and the pager always describe the whole trash.
 *
 * A restore leaves a row behind so the reader can open what came back. The
 * API stores no deletion time, so the date column is the last change.
 */
const TrashManager = () => {
  const [tab, setTab] = useState<Tab>("articles");
  const [page, setPage] = useState({ articles: 1, members: 1 });
  const [query, setQuery] = useState("");
  const [restored, setRestored] = useState<IRestored | null>(null);
  const panelId = useId();

  const resetPage = useCallback(
    () => setPage((current) => ({ ...current, [tab]: 1 })),
    [tab],
  );
  // The articles endpoint searches; the members endpoint reads only page and
  // limit, so the member tab narrows the rows the server sent.
  const searchTerm = useDebouncedTerm(query, resetPage);

  const blogsQuery = useTrashedBlogs({
    page: page.articles,
    limit: PAGE_SIZE,
    searchTerm,
  });
  const usersQuery = useTrashedUsers({ page: page.members, limit: PAGE_SIZE });
  const countsQuery = useTrashCounts();

  const { mutate: restoreBlog, isPending: isRestoringBlog } = useRestoreBlog();
  const { mutate: restoreUser, isPending: isRestoringUser } = useRestoreUser();

  const articleCount = countsQuery.data?.blogs;
  const memberCount = countsQuery.data?.users;

  const filters = [
    { key: "articles", label: "Articles", count: articleCount },
    { key: "members", label: "Members", count: memberCount },
  ];

  const changeTab = (next: Tab) => {
    setTab(next);
    setQuery("");
    void countsQuery.refetch();
  };

  const setTabPage = (next: number) =>
    setPage((current) => ({ ...current, [tab]: next }));

  const onRestoreBlog = (blog: ITrashedArticle) => {
    restoreBlog(blog._id, {
      onSuccess: (response) => {
        const result = readRestored<{ title?: string; slug?: string }>(
          response,
        );
        setRestored({
          name: result?.title || blog.title || "The article",
          href: result?.slug ? `/blogs/${result.slug}` : undefined,
          what: "article",
        });
        if (page.articles > 1 && blogsQuery.rows.length <= 1) {
          setPage((current) => ({
            ...current,
            articles: Math.max(1, current.articles - 1),
          }));
        }
      },
    });
  };

  const onRestoreUser = (user: ITrashedUser) => {
    restoreUser(user._id, {
      onSuccess: (response) => {
        const result = readRestored<{ fullName?: string }>(response);
        setRestored({
          name: result?.fullName || user.fullName || "The member",
          href: `/admin/manage-users/${user._id}`,
          what: "account",
        });
        if (page.members > 1 && usersQuery.rows.length <= 1) {
          setPage((current) => ({
            ...current,
            members: Math.max(1, current.members - 1),
          }));
        }
      },
    });
  };

  const memberRows = usersQuery.rows.filter((user) => {
    if (!searchTerm) return true;
    const needle = searchTerm.toLowerCase();
    return [user.fullName, user.username, user.email].some((value) =>
      value?.toLowerCase().includes(needle),
    );
  });

  const articlesBody = () => {
    if (blogsQuery.isLoading) {
      return (
        <DataTable
          columns={[
            { key: "title", header: "Article" },
            { key: "author", header: "Author" },
            { key: "changed", header: "Last changed" },
            { key: "actions", header: "Actions", align: "right" },
          ]}
          rows={[]}
          getRowKey={() => ""}
          renderCell={() => null}
          isLoading
          minWidth="44rem"
        />
      );
    }

    if (blogsQuery.isError) {
      return (
        <BlockError
          title="Removed articles could not be loaded"
          description={
            blogsQuery.error?.message ||
            "The request failed. Check that the API is running, then try again."
          }
          action={<RetryButton onClick={() => blogsQuery.refetch()} />}
        />
      );
    }

    const meta = blogsQuery.meta;
    const total = meta?.total ?? 0;
    const totalPages = Math.max(meta?.totalPages ?? 1, 1);
    const rows = blogsQuery.rows as ITrashedArticle[];

    return (
      <DataTable
        columns={[
          { key: "title", header: "Article", className: "min-w-[16rem]" },
          { key: "author", header: "Author" },
          { key: "category", header: "Category" },
          { key: "changed", header: "Last changed" },
          { key: "actions", header: "Actions", align: "right" },
        ]}
        rows={rows}
        getRowKey={(row) => row._id}
        minWidth="48rem"
        caption="Removed articles, most recently changed first"
        emptyState={
          searchTerm ? (
            <EmptyState
              variant="inline"
              icon={<MdOutlineArticle className="size-5" />}
              title="No removed article matches this search"
              description={`Nothing in the trash has a title that starts with "${searchTerm}". Clear the search to see every removed article.`}
              action={
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={quietButton}
                >
                  Clear the search
                </button>
              }
            />
          ) : (
            <EmptyState
              variant="inline"
              icon={<MdOutlineArticle className="size-5" />}
              title="No articles in the trash"
              description="Articles an author or an admin removes land here and stay restorable."
              action={
                <Link href="/admin/manage-blogs" className={linkClass}>
                  Open article management
                </Link>
              }
            />
          )
        }
        renderCell={(blog, columnKey) => {
          switch (columnKey) {
            case "title":
              return (
                <span className="line-clamp-2 max-w-[22rem] font-medium leading-snug">
                  {blog.title || "Untitled article"}
                </span>
              );

            case "author":
              return (
                <span className="block max-w-[12rem] truncate text-default-600">
                  {blog.author?.fullName || "Removed author"}
                </span>
              );

            case "category":
              return (
                <span className="whitespace-nowrap text-default-600">
                  {blog.category?.name || "No category"}
                </span>
              );

            case "changed":
              return (
                <span className="whitespace-nowrap text-xs tabular-nums text-default-600">
                  {formatDate(blog.updatedAt) || "Not recorded"}
                </span>
              );

            case "actions":
              return (
                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className={restoreButton}
                      aria-label={`Restore ${blog.title || "this article"}`}
                    >
                      <RiArrowGoBackLine aria-hidden className="size-4" />
                      Restore
                    </button>
                  }
                  title="Restore this article?"
                  description="It returns to the feed and to its author's profile. Its comments, views and votes were removed with it, so it starts with none."
                  confirmLabel="Restore article"
                  isPending={isRestoringBlog}
                  onConfirm={() => onRestoreBlog(blog)}
                />
              );

            default:
              return null;
          }
        }}
        footer={
          <>
            <p className="border-t border-default/60 bg-default-50/40 px-3 py-2 text-xs tabular-nums text-default-600">
              {meta
                ? `${plural(total, "removed article")}${
                    searchTerm ? ` matching "${searchTerm}"` : ""
                  }`
                : "Counting removed articles"}
            </p>
            <AdminPagination
              page={meta?.page ?? page.articles}
              totalPages={totalPages}
              total={total}
              pageSize={meta?.limit ?? PAGE_SIZE}
              onPageChange={setTabPage}
            />
          </>
        }
      />
    );
  };

  const membersBody = () => {
    if (usersQuery.isLoading) {
      return (
        <DataTable
          columns={[
            { key: "member", header: "Member" },
            { key: "email", header: "Email" },
            { key: "role", header: "Role at deletion" },
            { key: "actions", header: "Actions", align: "right" },
          ]}
          rows={[]}
          getRowKey={() => ""}
          renderCell={() => null}
          isLoading
          minWidth="46rem"
        />
      );
    }

    if (usersQuery.isError) {
      return (
        <BlockError
          title="Removed members could not be loaded"
          description={
            usersQuery.error?.message ||
            "The request failed. Check that the API is running, then try again."
          }
          action={<RetryButton onClick={() => usersQuery.refetch()} />}
        />
      );
    }

    const meta = usersQuery.meta;
    const total = meta?.total ?? 0;
    const totalPages = Math.max(meta?.totalPages ?? 1, 1);

    return (
      <DataTable
        columns={[
          { key: "member", header: "Member", className: "min-w-[14rem]" },
          { key: "email", header: "Email" },
          { key: "role", header: "Role at deletion" },
          { key: "changed", header: "Last changed" },
          { key: "actions", header: "Actions", align: "right" },
        ]}
        rows={memberRows}
        getRowKey={(row) => row._id}
        minWidth="52rem"
        caption="Deleted member accounts, most recently changed first"
        emptyState={
          searchTerm && usersQuery.rows.length > 0 ? (
            <EmptyState
              variant="inline"
              icon={<PiUsers className="size-5" />}
              title="No member on this page matches"
              description={`Search reads the ${plural(usersQuery.rows.length, "row")} on this page, because the members endpoint does not search the whole trash. Page through, or clear the search.`}
              action={
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={quietButton}
                >
                  Clear the search
                </button>
              }
            />
          ) : (
            <EmptyState
              variant="inline"
              icon={<PiUsers className="size-5" />}
              title={
                searchTerm
                  ? "No removed member matches this search"
                  : "No members in the trash"
              }
              description={
                searchTerm
                  ? `Nothing on this page has "${searchTerm}" in its name, username or email.`
                  : "Deleted accounts land here. Restoring one brings the login back without the articles and comments that went with it."
              }
              action={
                searchTerm ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className={quietButton}
                  >
                    Clear the search
                  </button>
                ) : (
                  <Link href="/admin/manage-users" className={linkClass}>
                    Open member management
                  </Link>
                )
              }
            />
          )
        }
        renderCell={(user, columnKey) => {
          switch (columnKey) {
            case "member":
              return (
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={user.profilePicture || undefined}
                    name={initialsOf(user.fullName)}
                    className="size-8 shrink-0"
                    classNames={{ name: "text-xs" }}
                  />
                  <span className="min-w-0">
                    <span className="block max-w-[14rem] truncate font-medium">
                      {user.fullName || "Unnamed member"}
                    </span>
                    {user.username && (
                      <span className="block max-w-[14rem] truncate text-xs text-default-600">
                        @{user.username}
                      </span>
                    )}
                  </span>
                </div>
              );

            case "email":
              return (
                <span className="block max-w-[16rem] truncate text-default-600">
                  {user.email || "No email recorded"}
                </span>
              );

            case "role":
              return (
                <span className="whitespace-nowrap text-default-600">
                  {user.role === "Admin" ? "Admin" : "Member"}
                </span>
              );

            case "changed":
              return (
                <span className="whitespace-nowrap text-xs tabular-nums text-default-600">
                  {formatDateTime(user.updatedAt) || "Not recorded"}
                </span>
              );

            case "actions":
              return (
                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className={restoreButton}
                      aria-label={`Restore ${user.fullName || "this member"}`}
                    >
                      <RiArrowGoBackLine aria-hidden className="size-4" />
                      Restore
                    </button>
                  }
                  title="Restore this member?"
                  description="The login and profile come back. The articles, comments and votes removed with the account do not, so it returns with an empty history."
                  confirmLabel="Restore account"
                  isPending={isRestoringUser}
                  onConfirm={() => onRestoreUser(user)}
                />
              );

            default:
              return null;
          }
        }}
        footer={
          <>
            <p className="border-t border-default/60 bg-default-50/40 px-3 py-2 text-xs tabular-nums text-default-600">
              {meta
                ? `${plural(total, "deleted account")}${
                    searchTerm
                      ? `, search covering this page of ${plural(usersQuery.rows.length, "row")}`
                      : ""
                  }`
                : "Counting deleted accounts"}
            </p>
            <AdminPagination
              page={meta?.page ?? page.members}
              totalPages={totalPages}
              total={total}
              pageSize={meta?.limit ?? PAGE_SIZE}
              onPageChange={setTabPage}
            />
          </>
        }
      />
    );
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Removed items"
        description="Restoring puts an item back. Nothing on this screen erases it for good."
        flush
      >
        <DataToolbar
          filters={filters}
          activeFilter={tab}
          onFilterChange={(key) =>
            changeTab(key === "members" ? "members" : "articles")
          }
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={
            tab === "articles" ? "Title or slug" : "Search this page"
          }
        />

        <div
          id={`${panelId}-panel`}
          role="tabpanel"
          aria-label={
            tab === "articles" ? "Removed articles" : "Removed members"
          }
        >
          {tab === "articles" ? articlesBody() : membersBody()}
        </div>
      </SectionCard>

      <div aria-live="polite" aria-atomic="true">
        {restored ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-success/30 bg-success/5 px-4 py-3 text-sm">
            <p>
              <span className="font-semibold">{restored.name}</span> is back as
              a live {restored.what}.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {restored.href ? (
                <Link href={restored.href} className={linkClass}>
                  {restored.what === "article"
                    ? "Open the article"
                    : "Open the member"}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setRestored(null)}
                className={`inline-flex min-h-11 items-center rounded-sm text-xs text-default-600 underline-offset-4 hover:underline sm:min-h-9 ${focusRing}`}
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-default-600">
        The API stores no deletion time, so the date column is when each record
        last changed. Article search covers the whole trash. The members
        endpoint reads only page and size, so member search narrows the page on
        screen.{" "}
        {articleCount !== undefined && memberCount !== undefined ? (
          <span className="tabular-nums">
            {plural(articleCount ?? 0, "article")} and{" "}
            {plural(memberCount, "account")} in total.
          </span>
        ) : null}
      </p>
    </div>
  );
};

export default TrashManager;
