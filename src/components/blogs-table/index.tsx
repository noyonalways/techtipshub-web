"use client";

import { useGetAllPosts } from "@/hooks/post.hook";
import { IPost } from "@/types";
import { Avatar } from "@heroui/react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { MdOutlineArticle } from "react-icons/md";
import { AdminDeleteBlogModal, UpdateBlogModal } from "../modals";
import EmptyState from "../modules/admin/empty-state";

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const HEADINGS = [
  "Author",
  "Article",
  "Engagement",
  "Published",
  "Actions",
] as const;

/**
 * Article moderation table. Rows are compact and scannable; the long title is
 * the only column allowed to wrap, everything numeric is tabular.
 */
const BlogsTable = () => {
  const { data: res, isLoading, isError, refetch } = useGetAllPosts({
    limit: "20",
  });

  const posts = Array.isArray(res?.data) ? (res.data as IPost[]) : [];

  return (
    <div className="overflow-hidden rounded-xl border border-default/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-sm">
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
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-3.5" colSpan={HEADINGS.length}>
                    <div className="h-4 w-full max-w-xl rounded bg-default-100" />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              posts.map((blog) => (
                <tr
                  key={blog._id}
                  className="align-middle transition-colors hover:bg-default-50/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/@${blog.author?.username}`}
                      className="flex items-center gap-2.5"
                    >
                      <Avatar
                        src={blog.author?.profilePicture}
                        size="sm"
                        className="size-7 shrink-0 object-cover"
                        name={(blog.author?.fullName || "?")
                          .charAt(0)
                          .toUpperCase()}
                      />
                      <span className="min-w-0">
                        <span className="block max-w-[11rem] truncate font-medium">
                          {blog.author?.fullName || "Unknown"}
                        </span>
                        <span className="block max-w-[11rem] truncate text-xs text-default-500">
                          @{blog.author?.username}
                        </span>
                      </span>
                    </Link>
                  </td>

                  <td className="max-w-[22rem] px-4 py-3">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="line-clamp-2 font-medium leading-snug transition-colors hover:text-primary"
                    >
                      {blog.title}
                    </Link>
                    {blog.category?.name && (
                      <span className="mt-1 block text-xs text-default-500">
                        {blog.category.name}
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3 text-xs tabular-nums text-default-600">
                      <span title="Views">{blog.totalViews ?? 0} views</span>
                      <span title="Upvotes" className="text-success">
                        {blog.upVotes ?? 0}↑
                      </span>
                      <span title="Downvotes" className="text-danger">
                        {blog.downVotes ?? 0}↓
                      </span>
                      <span title="Comments">
                        {blog.totalComments ?? 0} comments
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-default-600">
                    {formatDate(blog.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <AdminDeleteBlogModal
                        id={blog._id}
                        refetchPosts={refetch}
                      />
                      <UpdateBlogModal
                        post={blog}
                        refetchPosts={refetch}
                      />
                      <Link
                        href={`/blogs/${blog.slug}`}
                        aria-label={`Open ${blog.title}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-default-500 transition-colors hover:bg-default-100 hover:text-foreground"
                      >
                        <FiArrowUpRight className="size-4" aria-hidden />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <p className="sr-only" role="status">
          Loading articles
        </p>
      )}

      {!isLoading && posts.length === 0 && (
        <EmptyState
          variant="inline"
          icon={<MdOutlineArticle className="size-5" />}
          title={isError ? "Articles could not be loaded" : "No articles yet"}
          description={
            isError
              ? "The request failed. Check that the API is running, then reload this page."
              : "When members publish articles they will appear here for review."
          }
          action={
            <Link
              href="/"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Go to the feed
            </Link>
          }
        />
      )}

      {!isLoading && posts.length > 0 && (
        <div className="flex items-center justify-between border-t border-default/60 px-4 py-2.5 text-xs text-default-500">
          <span className="tabular-nums">
            Showing {posts.length}
            {res?.meta?.total ? ` of ${res.meta.total}` : ""} articles
          </span>
          <span>Sourced from the live API</span>
        </div>
      )}

    </div>
  );
};

export default BlogsTable;
