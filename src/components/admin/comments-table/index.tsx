"use client";

import ContentCard from "./content-card";
import {
  ListSelect,
  PAGE_SIZES,
  quietButton,
  useDebouncedTerm,
} from "@/components/admin/list-controls";
import { plural } from "@/components/admin/format";
import { formatExact, formatRelative } from "@/components/admin/utils";
import AdminPagination from "@/components/modules/admin/kit/pagination";
import ConfirmDialog from "@/components/modules/admin/kit/confirm-dialog";
import DataTable, {
  type DataTableColumn,
} from "@/components/modules/admin/kit/data-table";
import DataToolbar from "@/components/modules/admin/kit/data-toolbar";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import { focusRing } from "@/components/modules/admin/kit/tau";
import {
  useAdminComments,
  useCommentCounts,
  useDeleteAdminComment,
} from "@/hooks/admin-comments";
import type { TAdminComment, TAdminCommentWindow } from "@/types/admin.type";
import { Spinner } from "@heroui/react";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiExternalLink,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { PiChatCircle } from "react-icons/pi";

/** Comment text longer than this gets a dialog of its own. */
const FULL_READ_LENGTH = 160;

type Sort = "newest" | "oldest";

const WINDOWS: { key: TAdminCommentWindow; label: string }[] = [
  { key: "all", label: "All" },
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
];

const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const nameOf = (comment: TAdminComment) =>
  comment.user?.fullName || comment.user?.username || "Removed member";

/** `/admin/comments` sorts on `createdAt`; `-` is newest first. */
const sortParam = (sort: Sort) =>
  sort === "newest" ? "-createdAt" : "createdAt";

const Votes = ({ comment }: { comment: TAdminComment }) => {
  const up = typeof comment.upVotes === "number" ? comment.upVotes : 0;
  const down = typeof comment.downVotes === "number" ? comment.downVotes : 0;

  return (
    <span
      className="inline-flex items-center gap-1 text-[0.8125rem] tabular-nums text-default-700"
      title={`${up} up, ${down} down`}
    >
      <FiArrowUp aria-hidden className="size-3.5" />
      <span aria-hidden>{up}</span>
      <span aria-hidden className="text-default-500">
        /
      </span>
      <FiArrowDown aria-hidden className="size-3.5" />
      <span aria-hidden>{down}</span>
      <span className="sr-only">
        {up} upvotes and {down} downvotes, a score of {up - down}
      </span>
    </span>
  );
};

const DeleteComment = ({
  comment,
  isPending,
  onDeleted,
}: {
  comment: TAdminComment;
  isPending: boolean;
  onDeleted: () => void;
}) => {
  const { mutate: deleteComment } = useDeleteAdminComment();
  const name = nameOf(comment);

  return (
    <ConfirmDialog
      tone="danger"
      title="Delete this comment?"
      description={`The comment by ${name} is soft deleted, the comment count on ${comment.post?.title || "its article"} is corrected, and the action is recorded in the activity log.`}
      confirmLabel="Delete comment"
      isPending={isPending}
      onConfirm={() => deleteComment({ commentId: comment._id, onDeleted })}
      trigger={
        <button
          type="button"
          aria-label={`Delete the comment by ${name}`}
          className={`inline-flex size-11 items-center justify-center rounded-[6px] text-danger transition-colors hover:bg-danger/10 sm:size-9 ${focusRing}`}
        >
          <FiTrash2 aria-hidden className="size-4" />
        </button>
      }
    />
  );
};

const isWindow = (value: string | null): value is TAdminCommentWindow =>
  value === "24h" || value === "7d" || value === "all";

interface IProps {
  /** `?within=` from the page, so a link from the queue opens that window. */
  initialWithin?: string;
}

/**
 * The moderation queue links here with `?within=24h`, so the window opens on
 * that view instead of landing on All and making the reader pick again.
 */
const CommentsTable = ({ initialWithin }: IProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(PAGE_SIZES[0]);
  const [query, setQuery] = useState("");
  const [within, setWithin] = useState<TAdminCommentWindow>(() =>
    isWindow(initialWithin ?? null)
      ? (initialWithin as TAdminCommentWindow)
      : "all",
  );
  const [sort, setSort] = useState<Sort>("newest");

  const goToFirstPage = useCallback(() => setPage(1), []);
  const searchTerm = useDebouncedTerm(query, goToFirstPage);

  const list = useAdminComments({
    page,
    limit,
    searchTerm,
    within,
    sort: sortParam(sort),
  });
  const countsQuery = useCommentCounts();
  const { isPending: isDeleting } = useDeleteAdminComment();

  const { rows, meta, isError, error } = list;
  const counts = countsQuery.data;

  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const total = meta?.total ?? 0;

  // A deletion shrinks the list under the reader. Staying on a page that no
  // longer exists shows an empty table, so step back one page.
  const handleDeleted = useCallback(() => {
    if (page > 1 && rows.length <= 1) {
      setPage((current) => Math.max(1, current - 1));
    }
  }, [page, rows.length]);

  const onFilter = (key: string) => {
    const next = WINDOWS.find((item) => item.key === key)?.key ?? "all";
    setWithin(next);
    setPage(1);
  };

  // A count is shown only for the window the API counted.
  const filters = WINDOWS.map((item) => ({
    ...item,
    count:
      item.key === "24h"
        ? counts?.last24h
        : item.key === "7d"
          ? counts?.last7d
          : counts?.total,
  }));

  const nothingHere =
    !list.isLoading && !isError && rows.length === 0 && !searchTerm;
  const nothingMatched =
    !list.isLoading && !isError && rows.length === 0 && Boolean(searchTerm);

  const windowLabel =
    within === "24h"
      ? "the last 24 hours"
      : within === "7d"
        ? "the last 7 days"
        : "";

  const failure = error?.message;

  const columns: DataTableColumn[] = [
    { key: "comment", header: "Comment", className: "min-w-[22rem]" },
    { key: "article", header: "Article", className: "min-w-[10rem]" },
    { key: "votes", header: "Votes", align: "right" },
    { key: "posted", header: "Posted", className: "whitespace-nowrap" },
    { key: "actions", header: "Actions", align: "right" },
  ];

  return (
    <section
      aria-label="Comment moderation"
      className="overflow-hidden rounded-[10px] border border-default/60 bg-content-1"
    >
      <DataToolbar
        searchPlaceholder="Search comments"
        query={query}
        onQueryChange={(value) => setQuery(value)}
        filters={filters}
        activeFilter={within}
        onFilterChange={onFilter}
        right={
          <>
            <ListSelect
              label="Sort"
              hideLabel
              value={sort}
              onChange={(value) => {
                setSort(value === "oldest" ? "oldest" : "newest");
                setPage(1);
              }}
              options={SORTS}
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
            {list.isFetching && !list.isLoading && (
              <Spinner size="sm" color="current" aria-hidden />
            )}
          </>
        }
      />

      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(comment) => comment._id}
          isLoading={list.isLoading}
          skeletonRows={8}
          minWidth={880}
          caption={`Comments${windowLabel ? ` from ${windowLabel}` : ""}, ${sort === "newest" ? "newest" : "oldest"} first`}
          footer={
            <AdminPagination
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={total}
              pageSize={meta?.limit ?? limit}
              onPageChange={setPage}
            />
          }
          emptyState={
            isError ? (
              <EmptyState
                variant="inline"
                icon={<PiChatCircle className="size-5" />}
                title="Comments could not be loaded"
                description={
                  failure ||
                  "The request to the API failed. Try again, and if it keeps failing check the API is reachable."
                }
                action={
                  <button
                    type="button"
                    onClick={() => list.refetch()}
                    className={quietButton}
                  >
                    Try again
                  </button>
                }
              />
            ) : nothingMatched ? (
              <EmptyState
                variant="inline"
                icon={<FiSearch className="size-5" />}
                title="No comments match this search"
                description={`Nothing ${windowLabel ? `from ${windowLabel} ` : ""}contains "${searchTerm}". Try a shorter phrase, clear the search, or switch back to All.`}
                action={
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className={quietButton}
                  >
                    Clear search
                  </button>
                }
              />
            ) : nothingHere ? (
              <EmptyState
                variant="inline"
                icon={<PiChatCircle className="size-5" />}
                title={
                  windowLabel
                    ? `No comments in ${windowLabel}`
                    : "No comments yet"
                }
                description={
                  windowLabel
                    ? "Nothing was posted in this window. Older comments are still under All."
                    : "Comments appear here as readers reply on an article. Nothing needs a decision right now."
                }
                action={
                  windowLabel ? (
                    <button
                      type="button"
                      onClick={() => onFilter("all")}
                      className={quietButton}
                    >
                      Show all comments
                    </button>
                  ) : undefined
                }
              />
            ) : null
          }
          renderCell={(comment, key) => {
            const name = nameOf(comment);

            switch (key) {
              case "comment": {
                const content =
                  typeof comment.content === "string" ? comment.content : "";
                const images = Array.isArray(comment.images)
                  ? comment.images.filter(
                      (image): image is string => typeof image === "string",
                    )
                  : [];
                const long =
                  content.length > FULL_READ_LENGTH || images.length > 0;

                return (
                  <div className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-0.5 hidden size-7 shrink-0 items-center justify-center rounded-full border border-default/60 bg-default-50 text-xs font-semibold text-default-700 sm:flex"
                    >
                      {name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <ContentCard
                        title={`Comment by ${name}`}
                        actionLabel={long ? "Read in full" : "Open"}
                        content={content}
                        images={images}
                        meta={
                          <span>
                            {comment.post?.title || "Article unavailable"}
                            {" \u00B7 "}
                            {formatExact(comment.createdAt)}
                          </span>
                        }
                        article={
                          comment.post?.slug
                            ? {
                                title: comment.post.title,
                                slug: comment.post.slug,
                              }
                            : null
                        }
                      >
                        <span className="flex flex-wrap items-baseline gap-x-1.5 text-[0.8125rem]">
                          <span className="font-medium">{name}</span>
                          <time
                            dateTime={comment.createdAt}
                            title={formatExact(comment.createdAt)}
                            className="text-xs text-default-600"
                          >
                            {formatRelative(comment.createdAt)}
                          </time>
                        </span>
                        <span
                          className={`mt-0.5 line-clamp-3 block break-words text-sm leading-relaxed ${
                            content ? "" : "italic text-default-600"
                          }`}
                        >
                          {content || "No text, just attached images"}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.8125rem] font-medium text-primary-accessible">
                          <span>{long ? "Read in full" : "Open"}</span>
                          {images.length > 0 && (
                            <span className="text-default-600">
                              {plural(images.length, "image")}
                            </span>
                          )}
                          <FiChevronDown aria-hidden className="size-3.5" />
                        </span>
                      </ContentCard>
                    </div>
                  </div>
                );
              }

              case "article":
                return comment.post?.slug ? (
                  <Link
                    href={`/blogs/${comment.post.slug}`}
                    className={`line-clamp-2 break-words rounded-sm text-[0.8125rem] leading-snug text-default-700 underline-offset-4 hover:text-foreground hover:underline ${focusRing}`}
                  >
                    {comment.post.title || "Untitled article"}
                  </Link>
                ) : (
                  <span className="text-xs text-default-600">
                    Article unavailable
                  </span>
                );

              case "votes":
                return <Votes comment={comment} />;

              case "posted":
                return (
                  <time
                    dateTime={comment.createdAt}
                    title={formatExact(comment.createdAt)}
                    className="whitespace-nowrap text-xs tabular-nums text-default-700"
                  >
                    {formatRelative(comment.createdAt) ||
                      formatExact(comment.createdAt)}
                  </time>
                );

              case "actions":
                return (
                  <div className="flex items-center justify-end gap-0.5">
                    {comment.post?.slug && (
                      <Link
                        href={`/blogs/${comment.post.slug}`}
                        aria-label={`Open the article ${comment.post.title || "this comment is on"}`}
                        title="Open the article"
                        className={`inline-flex size-11 items-center justify-center rounded-[6px] text-default-600 transition-colors hover:bg-default-100 hover:text-foreground sm:size-9 ${focusRing}`}
                      >
                        <FiExternalLink aria-hidden className="size-4" />
                      </Link>
                    )}
                    {comment.user?._id && (
                      <Link
                        href={`/admin/manage-users/${comment.user._id}`}
                        aria-label={`Open the member ${name}`}
                        title="Open the member"
                        className={`inline-flex size-11 items-center justify-center rounded-[6px] text-xs font-semibold text-default-600 transition-colors hover:bg-default-100 hover:text-foreground sm:size-9 ${focusRing}`}
                      >
                        <span aria-hidden>@</span>
                      </Link>
                    )}
                    <DeleteComment
                      comment={comment}
                      isPending={isDeleting}
                      onDeleted={handleDeleted}
                    />
                  </div>
                );

              default:
                return null;
            }
          }}
        />
      </div>

      {/* Below sm the table becomes one card per comment; both read the same
          rows, so there is never a horizontal page scroll on a phone. */}
      <ul
        className="divide-y divide-default/60 sm:hidden"
        aria-label="Comments"
      >
        {list.isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="space-y-2 px-4 py-4" aria-hidden>
              <span className="block h-3 w-28 animate-pulse rounded bg-default-100" />
              <span className="block h-3 w-full animate-pulse rounded bg-default-100" />
              <span className="block h-3 w-2/3 animate-pulse rounded bg-default-100" />
            </li>
          ))}
        {!list.isLoading && rows.length === 0 && (
          <li>
            <EmptyState
              variant="inline"
              icon={<PiChatCircle className="size-5" />}
              title={
                isError ? "Comments could not be loaded" : "Nothing to show"
              }
              description={
                isError
                  ? failure || "The request to the API failed."
                  : nothingMatched
                    ? `Nothing contains "${searchTerm}".`
                    : "This window has no comments."
              }
              action={
                <button
                  type="button"
                  onClick={() =>
                    isError
                      ? list.refetch()
                      : nothingMatched
                        ? setQuery("")
                        : onFilter("all")
                  }
                  className={quietButton}
                >
                  {isError
                    ? "Try again"
                    : nothingMatched
                      ? "Clear search"
                      : "Show all comments"}
                </button>
              }
            />
          </li>
        )}
        {rows.map((comment) => {
          const name = nameOf(comment);
          const content =
            typeof comment.content === "string" ? comment.content : "";

          return (
            <li key={comment._id} className="flex flex-col gap-2 px-4 py-4">
              <ContentCard
                title={`Comment by ${name}`}
                actionLabel="Read in full"
                content={content}
                images={
                  Array.isArray(comment.images)
                    ? comment.images.filter(
                        (image): image is string => typeof image === "string",
                      )
                    : []
                }
                meta={
                  <span>
                    {comment.post?.title || "Article unavailable"}
                    {" \u00B7 "}
                    {formatExact(comment.createdAt)}
                  </span>
                }
                article={
                  comment.post?.slug
                    ? { title: comment.post.title, slug: comment.post.slug }
                    : null
                }
              >
                <span className="flex items-baseline justify-between gap-2 text-[0.8125rem]">
                  <span className="min-w-0 truncate font-medium">{name}</span>
                  <time
                    dateTime={comment.createdAt}
                    title={formatExact(comment.createdAt)}
                    className="shrink-0 text-xs tabular-nums text-default-600"
                  >
                    {formatRelative(comment.createdAt)}
                  </time>
                </span>
                <span className="mt-1 line-clamp-3 block break-words text-sm leading-relaxed">
                  {content || (
                    <span className="italic text-default-600">
                      No text, just attached images
                    </span>
                  )}
                </span>
              </ContentCard>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <Votes comment={comment} />
                  {comment.post?.slug ? (
                    <Link
                      href={`/blogs/${comment.post.slug}`}
                      className={`inline-flex min-h-11 items-center gap-1 rounded-[6px] text-default-700 underline-offset-4 hover:text-foreground hover:underline ${focusRing}`}
                    >
                      <FiExternalLink aria-hidden className="size-3.5" />
                      <span className="line-clamp-1">
                        {comment.post.title || "Read the article"}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-default-600">
                      Article unavailable
                    </span>
                  )}
                </span>

                <span className="flex items-center gap-1">
                  {comment.user?._id && (
                    <Link
                      href={`/admin/manage-users/${comment.user._id}`}
                      className={`inline-flex min-h-11 items-center rounded-[6px] px-2 text-xs font-semibold text-default-600 hover:text-foreground ${focusRing}`}
                    >
                      Member
                    </Link>
                  )}
                  <DeleteComment
                    comment={comment}
                    isPending={isDeleting}
                    onDeleted={handleDeleted}
                  />
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {!list.isLoading && rows.length > 0 && (
        <div className="border-t border-default/60 sm:hidden">
          <AdminPagination
            page={meta?.page ?? page}
            totalPages={totalPages}
            total={total}
            pageSize={meta?.limit ?? limit}
            onPageChange={setPage}
          />
        </div>
      )}

      {list.isFetching && !list.isLoading && (
        <p className="sr-only" role="status">
          Refreshing comments
        </p>
      )}
    </section>
  );
};

export default CommentsTable;
