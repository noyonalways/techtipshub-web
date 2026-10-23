import type { IBlog } from "@/types";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

interface IProps {
  blogs: IBlog[];
  /** Shown when the author has not published anything yet. */
  emptyMessage?: string;
}

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

/**
 * A member's published articles, rendered as a compact dated list rather than
 * cards — this is a summary inside a profile page, not a feed.
 */
const ProfileBlogs = ({ blogs, emptyMessage }: IProps) => {
  if (blogs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-default/60 px-6 py-12 text-center">
        <p className="text-sm font-medium">No articles yet</p>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-default-600">
          {emptyMessage ?? "Published articles by this member will appear here."}
        </p>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-default/60 border-y border-default/60">
      {blogs.map((blog) => (
        <li key={blog._id}>
          <Link
            href={`/blogs/${blog.slug}`}
            className="group flex items-start gap-4 px-1 py-4 transition-colors hover:bg-default-50"
          >
            <time
              dateTime={blog.createdAt}
              className="w-20 shrink-0 pt-0.5 text-xs tabular-nums text-default-600"
            >
              {formatDate(blog.createdAt)}
            </time>

            <div className="min-w-0 flex-1">
              <h3 className="text-pretty font-semibold leading-snug group-hover:text-primary-accessible">
                {blog.title}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-default-600">
                {blog.category?.name && <span>{blog.category.name}</span>}
                <span aria-hidden className="text-default-300">
                  ·
                </span>
                <span className="tabular-nums">
                  {blog.totalViews ?? 0} views
                </span>
                <span aria-hidden className="text-default-300">
                  ·
                </span>
                <span className="tabular-nums">
                  {blog.totalComments ?? 0} comments
                </span>
              </div>
            </div>

            <FiArrowUpRight
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-default-300 transition-colors group-hover:text-primary-accessible"
            />
          </Link>
        </li>
      ))}
    </ol>
  );
};

export default ProfileBlogs;
