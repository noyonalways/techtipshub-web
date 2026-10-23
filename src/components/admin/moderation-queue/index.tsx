"use client";

import { plural } from "@/components/admin/format";
import {
  DAY_MS,
  failureMessage,
  formatExact,
  formatRelative,
  isWithin,
  isoDate,
  SEPARATOR,
  unwrap,
} from "@/components/admin/utils";
import { AdminDeleteBlogModal } from "@/components/modals";
import ConfirmDialog from "@/components/modules/admin/kit/confirm-dialog";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import { focusRing } from "@/components/modules/admin/kit/tau";
import {
  useCommentCounts,
  useDeleteAdminComment,
  useLatestComments,
} from "@/hooks/admin-comments";
import { useContactMessages } from "@/hooks/admin-messages";
import { useGetAllBlogs } from "@/hooks/blog.hook";
import type {
  TAdminComment,
  TAdminCommentCounts,
  TAdminCommentListData,
  TContact,
  TContactCounts,
  TContactListData,
} from "@/types/admin.type";
import type { IBlog } from "@/types";
import { Avatar, Skeleton } from "@heroui/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { FiExternalLink, FiRefreshCw } from "react-icons/fi";
import { PiChatCircle, PiEnvelopeSimple, PiNotePencil } from "react-icons/pi";

/** How many newest comments the queue reads; the API caps `latest` at 20. */
const RECENT_LIMIT = 20;
/** How many of those the queue lists under "Comments from the last 24 hours". */
const LATEST_SHOWN = 5;
/** How many unread messages the queue lists; the inbox holds the rest. */
const UNREAD_SHOWN = 5;

/**
 * `/admin/comments/latest` answers `{ data: TAdminComment[] }`, a bare array,
 * not the `{ result }` a paged list returns.
 */
const latestComments = (response: unknown): TAdminComment[] => {
  const candidates = [unwrap<unknown>(response), response];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as TAdminComment[];
    if (
      candidate &&
      typeof candidate === "object" &&
      Array.isArray((candidate as TAdminCommentListData).result)
    ) {
      return (candidate as TAdminCommentListData).result;
    }
  }

  return [];
};

interface IQueue {
  title: string;
  /** The number the headline shows, when a real endpoint returned it. */
  count?: number;
  countLabel: string;
  description: string;
  href: string;
  linkLabel: string;
  loading: boolean;
  failed: boolean;
  failedMessage?: string;
  onRetry: () => void;
  children: ReactNode;
}

const CountTile = ({
  label,
  detail,
  href,
  linkLabel,
  icon,
}: {
  label: string;
  detail: string;
  href: string;
  linkLabel: string;
  icon: ReactNode;
}) => (
  <Link
    href={href}
    className={`group flex min-h-11 flex-col justify-between gap-3 rounded-[10px] border border-default/60 bg-content-1 p-4 transition-colors hover:border-default-300 hover:bg-default-50 ${focusRing}`}
  >
    <span className="flex items-start justify-between gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-default/60 text-default-700">
        {icon}
      </span>
    </span>
    <span>
      <span className="block text-[0.8125rem] font-medium text-default-800">
        {label}
      </span>
      <span className="mt-0.5 block text-xs leading-relaxed text-default-600">
        {detail}
      </span>
      <span className="mt-1.5 block text-xs font-medium text-primary-accessible">
        {linkLabel}
      </span>
    </span>
  </Link>
);

const QueueColumn = ({
  title,
  count,
  countLabel,
  description,
  href,
  linkLabel,
  loading,
  failed,
  failedMessage,
  onRetry,
  children,
}: IQueue) => {
  const id = `queue-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section aria-labelledby={`${id}-heading`} className="min-w-0">
      <div className="flex items-end justify-between gap-3 border-b border-default/60 pb-2">
        <div className="min-w-0">
          <h2
            id={`${id}-heading`}
            className="font-[family-name:var(--type-editorial)] text-lg font-semibold tracking-[-0.015em]"
          >
            {title}
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-default-600">
            {description}
          </p>
        </div>

        {typeof count === "number" && (
          <p className="shrink-0 text-right">
            <span className="block text-xl font-semibold tabular-nums leading-none">
              {count.toLocaleString()}
            </span>
            <span className="mt-1 block text-[0.6875rem] text-default-600">
              {countLabel}
            </span>
          </p>
        )}
      </div>

      {loading && (
        <div className="divide-y divide-default/60" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 py-3.5">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
          <p className="sr-only" role="status">
            Loading {title.toLowerCase()}
          </p>
        </div>
      )}

      {!loading && failed && (
        <EmptyState
          variant="inline"
          icon={<PiNotePencil className="size-5" />}
          title="This list did not load"
          description={
            failedMessage ||
            "The request to the API failed. Try again, and if it keeps failing check that the API is reachable."
          }
          action={
            <button
              type="button"
              onClick={onRetry}
              className={`inline-flex min-h-11 items-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium hover:bg-default-100 sm:min-h-9 ${focusRing}`}
            >
              Try again
            </button>
          }
        />
      )}

      {!loading && !failed && children}

      <div className="border-t border-default/60 pt-2.5">
        <Link
          href={href}
          className={`inline-flex min-h-11 items-center rounded-[6px] px-1 text-sm font-medium text-primary-accessible underline-offset-4 hover:underline sm:min-h-9 ${focusRing}`}
        >
          {linkLabel}
        </Link>
      </div>
    </section>
  );
};

const ModerationQueue = () => {
  const [refreshing, setRefreshing] = useState(false);

  const blogsQuery = useGetAllBlogs({ limit: "6", sort: "-createdAt" });
  const commentsQuery = useLatestComments();
  const countsQuery = useCommentCounts();
  // A fixed small page of unread messages: the column shows a handful, and the
  // inbox itself is where paging happens.
  const messagesQuery = useContactMessages({
    page: 1,
    limit: UNREAD_SHOWN,
    status: "new",
  });

  const { mutate: deleteComment, isPending: isDeleting } =
    useDeleteAdminComment();

  const blogsResponse = blogsQuery.data as
    | {
        success?: boolean;
        message?: unknown;
        data?: IBlog[];
        meta?: { total?: number };
      }
    | undefined;
  const blogs: IBlog[] = Array.isArray(blogsResponse?.data)
    ? blogsResponse.data
    : [];
  const blogTotal = blogsResponse?.meta?.total;
  const blogsFailed =
    !blogsQuery.isLoading && !Array.isArray(blogsResponse?.data);

  const comments = latestComments(commentsQuery.data);
  // Only a cached `undefined` means the request has not answered; a resolved
  // empty array is a real "nothing yet".
  const commentsFailed =
    !commentsQuery.isLoading && commentsQuery.data === undefined;

  const counts: TAdminCommentCounts | undefined = countsQuery.data;
  const today = counts?.last24h;

  const messagePage = unwrap<TContactListData>(messagesQuery.data);
  const unreadList: TContact[] = messagePage?.result ?? [];
  const messageCounts: TContactCounts | undefined = messagePage?.counts;
  const unread = messageCounts?.new ?? messagePage?.meta?.total;
  const messagesFailed = !messagesQuery.isLoading && messagePage === undefined;

  // The newest comments, kept only when they landed in the last day: anything
  // older is in the full list, not in a queue that claims to be current.
  const recentComments = comments
    .filter((comment) => isWithin(comment.createdAt, DAY_MS))
    .slice(0, LATEST_SHOWN);

  // The blog hook ignores its params in the query key, so a refetch started
  // from the "deleted" callback could read the stale cache. Calling with the
  // same params still refetches, and the label tells the reader it happened.
  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        blogsQuery.refetch(),
        commentsQuery.refetch(),
        countsQuery.refetch(),
        messagesQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const commentsWindow = `the newest ${RECENT_LIMIT} comments`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-default/60 bg-content-1 px-3 py-2">
        <p className="text-xs leading-relaxed text-default-700">
          The counts come from the comments, messages and articles endpoints.
          Each list below is a shortcut into the screen that holds it.
        </p>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          aria-busy={refreshing || undefined}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border border-default-300 px-3 text-sm font-medium text-foreground transition-colors hover:bg-default-100 disabled:opacity-60 sm:min-h-9 ${focusRing}`}
        >
          <FiRefreshCw
            aria-hidden
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <div className="mb-8 grid gap-2 sm:grid-cols-3">
        <CountTile
          href="/admin/manage-comments?within=24h"
          label="Comments in 24 hours"
          detail={
            typeof today === "number"
              ? `${plural(today, "comment")} posted across the site since this time yesterday.`
              : "The comment count did not load. Open the list to see it."
          }
          linkLabel="Read the comments"
          icon={<PiChatCircle className="size-4" />}
        />
        <CountTile
          href="/admin/messages?status=new"
          label="Unread messages"
          detail={
            typeof unread === "number"
              ? unread === 0
                ? "Every contact message has been read. Nothing is waiting."
                : `${plural(unread, "contact message")} nobody has opened yet.`
              : "The inbox count did not load. Open the inbox to see it."
          }
          linkLabel="Open the inbox"
          icon={<PiEnvelopeSimple className="size-4" />}
        />
        <CountTile
          href="/admin/manage-blogs"
          label="Articles in total"
          detail={
            typeof blogTotal === "number"
              ? `${plural(blogTotal, "article")} published. The newest are below.`
              : "The article count did not load. Open the list to see it."
          }
          linkLabel="Review articles"
          icon={<PiNotePencil className="size-4" />}
        />
      </div>

      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
        <QueueColumn
          title="Comments from the last 24 hours"
          count={recentComments.length}
          countLabel={
            recentComments.length >= LATEST_SHOWN
              ? `first ${LATEST_SHOWN}`
              : "in this view"
          }
          description={`From ${commentsWindow}, which is the most the API returns at once.`}
          href="/admin/manage-comments?within=24h"
          linkLabel="Open the comment list"
          loading={commentsQuery.isLoading}
          failed={commentsFailed}
          failedMessage={failureMessage(commentsQuery.data)}
          onRetry={() => commentsQuery.refetch()}
        >
          {recentComments.length === 0 ? (
            <EmptyState
              variant="inline"
              icon={<PiChatCircle className="size-5" />}
              title="No comments today"
              description={`Nothing in ${commentsWindow} was posted in the last 24 hours. The full list still holds the older ones.`}
              action={
                <Link
                  href="/admin/manage-comments"
                  className={`inline-flex min-h-11 items-center rounded-[6px] border border-default-300 px-3.5 text-sm font-medium hover:bg-default-100 sm:min-h-9 ${focusRing}`}
                >
                  Open every comment
                </Link>
              }
            />
          ) : (
            <ul>
              {recentComments.map((comment) => {
                const name =
                  comment.user?.fullName ||
                  comment.user?.username ||
                  "Unknown member";

                return (
                  <li
                    key={comment._id}
                    className="flex gap-3 border-b border-default/60 py-3.5 last:border-b-0"
                  >
                    <Avatar
                      src={comment.user?.profilePicture}
                      size="sm"
                      className="mt-0.5 size-8 shrink-0"
                      name={name.charAt(0).toUpperCase()}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-default-600">
                        <span className="text-[0.8125rem] font-medium text-foreground">
                          {name}
                        </span>
                        <time
                          dateTime={isoDate(comment.createdAt) ?? undefined}
                          title={formatExact(comment.createdAt)}
                        >
                          {formatRelative(comment.createdAt)}
                        </time>
                      </p>

                      <p className="mt-1 line-clamp-2 break-words text-sm leading-relaxed">
                        {comment.content || (
                          <span className="italic text-default-600">
                            No text, only attached images
                          </span>
                        )}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {comment.post?.slug ? (
                          <Link
                            href={`/blogs/${comment.post.slug}`}
                            className={`line-clamp-1 rounded-sm text-xs font-medium text-default-700 underline-offset-4 hover:text-foreground hover:underline ${focusRing}`}
                          >
                            on {comment.post.title || "the article"}
                          </Link>
                        ) : (
                          <span className="text-xs text-default-600">
                            Article unavailable
                          </span>
                        )}

                        <ConfirmDialog
                          tone="danger"
                          title={`Delete the comment by ${name}?`}
                          description="It is soft deleted, the comment count on its article is corrected, and the action is recorded in the activity log."
                          confirmLabel="Delete comment"
                          isPending={isDeleting}
                          onConfirm={() =>
                            deleteComment({ commentId: comment._id })
                          }
                          trigger={
                            <button
                              type="button"
                              aria-label={`Delete the comment by ${name}`}
                              className={`inline-flex min-h-11 items-center rounded-[6px] px-2 text-xs font-medium text-danger transition-colors hover:bg-danger/10 sm:min-h-8 ${focusRing}`}
                            >
                              Delete
                            </button>
                          }
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </QueueColumn>

        <div className="flex min-w-0 flex-col gap-10">
          <QueueColumn
            title="Newest articles"
            count={blogs.length > 0 ? blogs.length : undefined}
            countLabel="loaded"
            description="The last six published pieces, for a first read."
            href="/admin/manage-blogs"
            linkLabel="Open every article"
            loading={blogsQuery.isLoading}
            failed={blogsFailed}
            failedMessage={failureMessage(blogsResponse)}
            onRetry={() => blogsQuery.refetch()}
          >
            {blogs.length === 0 ? (
              <EmptyState
                variant="inline"
                icon={<PiNotePencil className="size-5" />}
                title="No articles yet"
                description="When members publish, their newest pieces appear here for a first read."
              />
            ) : (
              <ul>
                {blogs.map((blog) => (
                  <li
                    key={blog._id}
                    className="flex gap-3 border-b border-default/60 py-3.5 last:border-b-0"
                  >
                    <span className="hidden size-12 shrink-0 overflow-hidden rounded-[6px] border border-default/60 bg-default-100 sm:block">
                      {blog.coverImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={blog.coverImage}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className={`line-clamp-2 break-words rounded-sm text-sm font-medium leading-snug underline-offset-4 hover:underline ${focusRing}`}
                      >
                        {blog.title || "Untitled article"}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-default-600">
                        <span>{blog.author?.fullName || "Unknown author"}</span>
                        {blog.category?.name && (
                          <>
                            <span aria-hidden>{SEPARATOR}</span>
                            <span>{blog.category.name}</span>
                          </>
                        )}
                        <span aria-hidden>{SEPARATOR}</span>
                        <time
                          dateTime={isoDate(blog.createdAt) ?? undefined}
                          title={formatExact(blog.createdAt)}
                        >
                          {formatRelative(blog.createdAt)}
                        </time>
                      </p>

                      <div className="mt-1 flex items-center gap-0.5">
                        <Link
                          href={`/blogs/${blog.slug}`}
                          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-2 text-xs font-medium text-default-700 transition-colors hover:bg-default-100 hover:text-foreground sm:min-h-8 ${focusRing}`}
                        >
                          <FiExternalLink aria-hidden className="size-3.5" />
                          Open
                        </Link>
                        <AdminDeleteBlogModal
                          id={blog._id}
                          refetchBlogs={() => {
                            blogsQuery.refetch();
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </QueueColumn>

          <QueueColumn
            title="Unread messages"
            count={unreadList.length}
            countLabel={`first ${UNREAD_SHOWN}`}
            description={`The newest ${UNREAD_SHOWN} contact messages nobody has opened yet. The inbox holds the rest, with paging.`}
            href="/admin/messages?status=new"
            linkLabel="Open the inbox"
            loading={messagesQuery.isLoading}
            failed={messagesFailed}
            failedMessage={failureMessage(messagesQuery.data)}
            onRetry={() => messagesQuery.refetch()}
          >
            {unreadList.length === 0 ? (
              <EmptyState
                variant="inline"
                icon={<PiEnvelopeSimple className="size-5" />}
                title="No unread messages"
                description="Everything sent through the contact form has been opened at least once."
              />
            ) : (
              <ul>
                {unreadList.map((message) => (
                  <li key={message._id}>
                    <Link
                      href={`/admin/messages?message=${encodeURIComponent(message._id)}`}
                      className={`flex min-h-11 flex-col gap-0.5 border-b border-default/60 px-1 py-3 transition-colors last:border-b-0 hover:bg-default-50 ${focusRing}`}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-medium">
                          {[message.firstName, message.lastName]
                            .filter(Boolean)
                            .join(" ") || "Unknown sender"}
                        </span>
                        <time
                          dateTime={isoDate(message.createdAt) ?? undefined}
                          className="shrink-0 text-xs tabular-nums text-default-600"
                        >
                          {formatRelative(message.createdAt)}
                        </time>
                      </span>
                      <span className="min-w-0 truncate text-[0.8125rem]">
                        {message.subject || "(no subject)"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QueueColumn>
        </div>
      </div>

      <p className="mt-8 max-w-[80ch] text-xs leading-relaxed text-default-600">
        Deleting an article asks for a reason, emails the author, and moves the
        piece to the trash. Deleting a comment is a soft delete and is recorded
        in the activity log. Neither can be undone from here.
      </p>
    </div>
  );
};

export default ModerationQueue;
